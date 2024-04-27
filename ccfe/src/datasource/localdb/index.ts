import { createRxDatabase, addRxPlugin, removeRxDatabase } from "rxdb"
import { getRxStorageLoki } from "rxdb/plugins/storage-lokijs"
import {
  decryptString,
  encryptString,
  wrappedKeyEncryptionCryptoJsStorage,
} from "rxdb/plugins/encryption-crypto-js"
import { wrappedKeyCompressionStorage } from "rxdb/plugins/key-compression"
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode"
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder"
import { RxDBUpdatePlugin } from "rxdb/plugins/update"
import type { MyDatabaseCollections, MyDatabase } from "@/types"
import { collections, getGraphQLInputs } from "./schema/schema"
import {
  RxGraphQLReplicationState,
  pushQueryBuilderFromRxSchema,
  replicateGraphQL,
} from "rxdb/plugins/replication-graphql"
import { RxDBMigrationPlugin } from "rxdb/plugins/migration"
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election"
import { RxDBLocalDocumentsPlugin } from "rxdb/plugins/local-documents"

import { genGraphQL, pullQueryBuilderFromRxSchema2 } from "@/utils"
import { Md5 } from "ts-md5"
// in the browser, we want to persist data in IndexedDB, so we use the indexeddb adapter.
import LokiIncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter"
import {
  clearSyncTime,
  getInfoApi,
  getSyncTime,
  getToken,
  getUserData,
  setSyncTime,
} from "@/datasource"
import { GRAPHQL_PULL_CNT, GRAPHQL_URL } from "@/config"
import { getSSEStrem } from "../restapi/base"
import { DBStatusEnum } from "@/enums"

import.meta.env.DEV && addRxPlugin(RxDBDevModePlugin)
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBUpdatePlugin)
// 数据结构迁移插件
addRxPlugin(RxDBMigrationPlugin)
addRxPlugin(RxDBLeaderElectionPlugin)
addRxPlugin(RxDBLocalDocumentsPlugin)

// key 压缩
const storageWithKeyCompression = wrappedKeyCompressionStorage({
  storage: getRxStorageLoki({
    adapter: new LokiIncrementalIndexedDBAdapter(),
  }),
})
// 数据加密
const encryptedStorage = wrappedKeyEncryptionCryptoJsStorage({
  storage: storageWithKeyCompression,
})
const dbNamePrefix = "cc"
const syncStates: RxGraphQLReplicationState<any, any>[] = []
const _create = async () => {
  const userData = getUserData()
  if (!userData) {
    throw new Error("获取用户数据异常！")
  }
  const { uid, dbkey } = userData
  if (!dbkey) {
    throw new Error("账号数据异常，请重新登录！")
  }
  const dbpassword = Md5.hashStr("infocard.cool" + dbkey + "forever1993!")
  const db: MyDatabase = await createRxDatabase<MyDatabaseCollections>({
    name: dbNamePrefix + uid,
    storage: encryptedStorage,
    password: dbpassword,
    multiInstance: true, // This should be set to false when you have single-instances like a single-window electron-app
    eventReduce: true, // <- eventReduce (optional, default: true)
    allowSlowCount: true, // 允许 count 查询
    localDocuments: true,
  })
  // console.log("DB - created database")
  // window['db'] = db; // write to window for debugging

  // create collections
  // console.log("DB - create collections");
  await db.addCollections(collections)
  // console.log("DB - created collections");

  // sync
  const graphQLInputs = getGraphQLInputs()
  // 生成 GraphQL Schema
  // genGraphQL(graphQLInputs)
  const batchSize = GRAPHQL_PULL_CNT
  const hookFun = (plainData: any) => {
    plainData.update_time = Date.now()
  }
  const authToken = getToken()
  // 更新本地缓存的同步时间
  const updateSyncTime = (doc: any) => {
    const t = getSyncTime()
    if (doc.update_time > 0 && (t === 0 || t < doc.update_time)) {
      setSyncTime(doc.update_time)
    }
  }
  Object.values(db.collections).forEach((col) => {
    const name = col.name
    const input = graphQLInputs[name]
    if (input) {
      const pullQueryBuilder = pullQueryBuilderFromRxSchema2(name, input)
      const pushQueryBuilder = pushQueryBuilderFromRxSchema(name, input)
      const pullModifier = (doc: any) => {
        // doc.props = decryptString(doc.props, dbpassword)
        // doc.content = decryptString(doc.content, dbpassword)
        doc.tags = JSON.parse(doc.tags) || []
        const props = JSON.parse(doc.props) || {}
        doc.links = props.links || []
        return doc
      }
      const pushModifier = (doc: any) => {
        // if (doc.props.substring(0, 1) === "{") {
        //   doc.props = encryptString(doc.props, dbpassword)
        //   doc.content = encryptString(doc.content, dbpassword)
        // }
        doc.tags = JSON.stringify(doc.tags)
        doc.links = JSON.stringify(doc.links)
        return doc
      }
      col.preRemove(hookFun, false)
      const syncState = replicateGraphQL({
        collection: col,
        url: {
          http: GRAPHQL_URL,
        },
        headers: {
          Authorization: authToken,
        },
        push: {
          batchSize,
          queryBuilder: pushQueryBuilder,
          modifier: name === "card" ? pushModifier : undefined,
        },
        pull: {
          batchSize,
          queryBuilder: pullQueryBuilder,
          modifier: name === "card" ? pullModifier : undefined,
        },
        deletedField: "deleted",
        live: true,
        retryTime: 30000,
        autoStart: false,
        // 页面刷新时，因 autoStart 为 true，将自动调用一次 pull 接口（如果关闭，虽然不会自动触发 pull，但本地更新也不会触发 push）
      })
      syncState.received$.subscribe(updateSyncTime)
      syncState.send$.subscribe(updateSyncTime)
      syncState.error$.subscribe((err) => console.error("syncState error$", err))
      syncStates.push(syncState)
    }
  })
  return db
}

let dbPromise: MyDatabase
const getDb = async () => {
  if (!dbPromise) {
    dbPromise = await _create()
  }
  return dbPromise
}

// 初始化数据库，先检查更新，再从远端拉取，再从本地读取
const initDb = async () => {
  const db = await getDb()
  // // 页面刷新，初始化进行数据同步
  // // await 只能用在 for 循环中
  // for (let index = 0; index < syncStates.length; index++) {
  //   if (needSync) {
  //     // 用于确保数据同步完成：阻塞进程，直到同步完成
  //     // 注：Rxdb 文档提示 awaitInSync 和 awaitInitialReplication 不应用于阻止程序运行
  //     await syncStates[index].awaitInitialReplication()
  //     // console.log("awaitInitialReplication end")
  //     setSyncTime(Date.now())
  //     // } else {
  //     //   syncStates[index].awaitInSync()
  //   }
  // }
  // 选出 Leader 之后，由 Leader 接管所有的同步逻辑
  // 不能使用 await db.waitForLeadership()，会卡死（一直等待成为 leader，之后才会执行）
  db.waitForLeadership().then(() => {
    console.log("Election Leader") // <- runs when db becomes leader
    initSyncInfo()
  })
  return db
}

const initSyncInfo = async () => {
  console.log("initSyncInfo")
  const db = await getDb()
  const times = await getInfoApi()
  if (times === null) {
    // 请求服务端接口异常，加载本地数据库，间隔 60s 重试一次连接
    await db.upsertLocal("dbStatus", { status: DBStatusEnum.INITED }).catch()
    setTimeout(() => initSyncInfo(), 60000)
    return
  }
  // 服务端和本地时间相差超过 10min 则判定为异常
  if (Math.abs(times.current_time - Date.now()) > 600000) {
    await db.upsertLocal("dbStatus", { status: DBStatusEnum.TIMEERR }).catch()
    return
  }
  // 从缓存获取最后同步时间
  const needSync = times.last_update_time === 0 || times.last_update_time > getSyncTime()
  if (times.last_update_time === 0 || times.last_update_time > getSyncTime()) {
    await db.upsertLocal("dbStatus", { status: DBStatusEnum.SYNCING }).catch()
    // 触发同步
    for (let index = 0; index < syncStates.length; index++) {
      syncStates[index].start()
      // 用于确保数据同步完成：阻塞进程，直到同步完成
      if (needSync) {
        await syncStates[index].awaitInSync()
      }
    }
    setSyncTime(Date.now())
    // 延时 500ms 关闭同步弹窗，避免因同步时间过短导致弹窗闪烁的问题
    setTimeout(() => db.upsertLocal("dbStatus", { status: DBStatusEnum.INITED }).catch(), 500)
  } else {
    // 触发同步
    for (let index = 0; index < syncStates.length; index++) {
      syncStates[index].start()
    }
    db.upsertLocal("dbStatus", { status: DBStatusEnum.INITED }).catch()
  }
  const syncLogic = () => {
    db.upsertLocal("dbStatus", { status: DBStatusEnum.REMOTEUPDATE }).catch()
  }
  getSSEStrem("/notice", syncLogic)
}

export const loadRefreshData = async () => {
  const db = await getDb()
  await db.upsertLocal("dbStatus", { status: DBStatusEnum.SYNCING }).catch()
  // 触发同步
  for (let index = 0; index < syncStates.length; index++) {
    syncStates[index].reSync()
    // 用于确保数据同步完成：阻塞进程，直到同步完成
    await syncStates[index].awaitInSync()
  }
  setSyncTime(Date.now())
  // 延时 500ms 关闭同步弹窗，避免因同步时间过短导致弹窗闪烁的问题
  setTimeout(() => db.upsertLocal("dbStatus", { status: DBStatusEnum.INITED }).catch(), 500)
}

// 删除 indexedDB
const deleteIndexedDB = (dbName: string) => {
  return new Promise((resolve: (value: boolean) => void) => {
    const request = indexedDB.deleteDatabase(dbName + ".db")
    request.onsuccess = function () {
      clearSyncTime()
      console.log("Delete indexDB success")
      resolve(true)
    }
    request.onerror = function (e) {
      console.error("Delete indexDB failed", e)
      resolve(false)
    }
  })
  // const request = indexedDB.deleteDatabase(dbName + ".db")
  // request.onsuccess = function () {
  //   clearSyncTime()
  //   console.log("Delete indexDB success")
  // }
  // request.onerror = function (e) {
  //   console.error("Delete indexDB failed", e)
  // }
}

const deleteDB = async () => {
  // dbPromise 为 null 表示启动本地数据库失败
  if (!dbPromise) {
    const userData = getUserData()
    const uid = userData?.uid || 0
    if (uid > 0) {
      return deleteIndexedDB(dbNamePrefix + uid)
    }
    return false
  }
  return dbPromise.destroy().then((res) => {
    if (res) {
      console.log("rxdb destory success")
      return deleteIndexedDB(dbPromise.name)
    }
    return res
  })
}

export { getDb, initDb, deleteDB }
