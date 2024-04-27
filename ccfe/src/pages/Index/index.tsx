import React, { useCallback, useEffect, useRef, useState } from "react"
import { initDb, loadRefreshData } from "@/datasource/localdb"
import { PreMain } from "@/pages/Main"
import { MyDatabase, type NodeTypeObj, type NodeTypeProp } from "@/types"
import { Load } from "@/components/load"
import { type GetSetDB, type GetSetTypes, useDBStore } from "@/store"
import { baseTypeProps } from "@/config"
import { formatTypeProps } from "@/biz"
import { detect } from "detect-browser"
import { compare } from "compare-versions"
import type { Subscription } from "rxjs"
import { DBStatusEnum } from "@/enums"

const dbSelector: GetSetDB = (state) => state.setDb
const typesSelector: GetSetTypes = (state) => state.setTypes

const defaultType: NodeTypeObj = {
  id: "default",
  name: "元卡",
  icon: "card",
  snum: 0,
  props: [],
  props2: baseTypeProps,
}

const browser = detect()
let initDbStatus = DBStatusEnum.INIT
if (browser && browser.version) {
  if (browser.name === "chrome" && compare(browser.version, "87.0.0", "<")) {
    initDbStatus = DBStatusEnum.VERSIONERR
  } else if (browser.name === "firefox" && compare(browser.version, "78.0.0", "<")) {
    initDbStatus = DBStatusEnum.VERSIONERR
  } else if (browser.name === "safari" && compare(browser.version, "14.0.0", "<")) {
    initDbStatus = DBStatusEnum.VERSIONERR
  } else if (browser.name === "edge" && compare(browser.version, "88.0.0", "<")) {
    initDbStatus = DBStatusEnum.VERSIONERR
  }
}

// 登录和注册成功之后必须直接跳转，才会重构 rxdb
export const Index = React.memo(() => {
  // 初始化数据库和卡片模板
  const setDb = useDBStore(dbSelector)
  const setTypes = useDBStore(typesSelector)
  const dbRef = useRef<MyDatabase>()
  const dbStatusSubRef = useRef<Subscription>()
  const typeSubRef = useRef<Subscription>()
  const [dbStatus, setDbStatus] = useState<DBStatusEnum>(initDbStatus)
  // 刷新所有页面
  const reloadAllPage = useCallback(() => {
    dbRef.current?.upsertLocal("dbStatus", { status: DBStatusEnum.RELOAD }).catch()
  }, [])
  useEffect(() => {
    // console.log("Index - initDb: useEffect")
    if (initDbStatus === DBStatusEnum.VERSIONERR) return
    initDb()
      .then((db) => {
        // console.log("DB inited", db)
        db.type.getTypesQuery().then((query) => {
          typeSubRef.current = query.$.subscribe((allTypeDocs) => {
            const types = allTypeDocs.map((typeDoc) => {
              const props = typeDoc.props ? (JSON.parse(typeDoc.props) as NodeTypeProp[]) : []
              const props2 = formatTypeProps(typeDoc.props)
              return {
                id: typeDoc.id,
                name: typeDoc.name,
                icon: typeDoc.icon,
                props: props,
                props2: props2,
              } as NodeTypeObj
            })
            types.unshift(defaultType)
            setTypes(types)
          })
        })
        dbRef.current = db
        setDb(db)
        dbStatusSubRef.current = db.getLocal$("dbStatus").subscribe((dbStatus) => {
          const status = dbStatus === null ? undefined : (dbStatus.get("status") as DBStatusEnum)
          console.log("dbStatus", status) // > RxLocalDocument or null
          if (status === undefined) return
          else if (status === DBStatusEnum.RELOAD) {
            // 刷新所有 Leader
            console.log("db.isLeader: ", db.isLeader())
            if (db.isLeader()) {
              loadRefreshData()
            }
          } else {
            setDbStatus(status)
          }
        })
      })
      .catch((error) => {
        if ((error.message as string).indexOf("password") !== -1) {
          console.error("本地数据密码异常", error)
        } else {
          console.error("加载本地数据异常", error)
        }
        setDbStatus(DBStatusEnum.DATAERR)
      })
    return () => {
      dbStatusSubRef.current?.unsubscribe()
      typeSubRef.current?.unsubscribe()
    }
  }, [setDb, setDbStatus, setTypes])
  // console.log("Render: Index")
  return (
    <>
      {dbStatus > DBStatusEnum.INITED && <Load status={dbStatus} reloadAllPage={reloadAllPage} />}
      {dbStatus === DBStatusEnum.INITED && <PreMain />}
    </>
  )
})
