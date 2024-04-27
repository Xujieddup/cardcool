import { NodeTypeEnum, VNTypeEnum } from "@/enums"
import type {
  ViewNodeJsonSchema,
  ViewNodeCollection,
  ViewNodeCollectionMethods,
  VNContent,
  VNParam,
} from "@/types"
import type { ViewNode } from "@/types"
import { unidtime, unidtimems } from "@/utils"
import { XYPosition } from "@/reactflow"
import { MIND_ROOT_PID } from "@/constant"

export const viewNodeScheme: ViewNodeJsonSchema = {
  title: "view node relation",
  version: 0,
  primaryKey: "id",
  type: "object",
  keyCompression: true,
  properties: {
    id: {
      type: "string",
      maxLength: 12, // <- the primary key must have set maxLength
    },
    view_id: {
      type: "string",
      maxLength: 12,
    },
    group_id: {
      type: "string",
      maxLength: 12,
    },
    pid: {
      type: "string",
      maxLength: 12,
    },
    node_type: {
      type: "number",
    },
    node_id: {
      type: "string",
      maxLength: 12,
    },
    vn_type_id: {
      type: "string",
      maxLength: 12,
    },
    name: {
      type: "string",
    },
    content: {
      type: "string",
    },
    update_time: {
      type: "number",
    },
    is_deleted: {
      type: "boolean",
    },
  },
  required: [
    "id",
    "view_id",
    "group_id",
    "pid",
    "node_type",
    "node_id",
    "vn_type_id",
    "name",
    "content",
    "update_time",
    "is_deleted",
  ],
  indexes: ["view_id", "node_id"],
}

export const viewNodeCollectionMethods: ViewNodeCollectionMethods = {
  // 查询视图的所有节点
  async getAll(this: ViewNodeCollection, viewId: string) {
    const allViewNodeDocs = await this.find()
      .where("view_id")
      .eq(viewId)
      .where("is_deleted")
      .eq(false)
      .exec()
    return allViewNodeDocs.map((viewNodeDoc) => viewNodeDoc.toJSON() as ViewNode)
  },
  // 添加节点到视图
  async addNode(
    this: ViewNodeCollection,
    viewId: string,
    groupId: string,
    pId: string,
    nodeId: string,
    nodeType: number,
    vnType: VNTypeEnum,
    content: string,
    name?: string
  ) {
    const [id, time] = unidtime()
    const viewNode: ViewNode = {
      id: id,
      view_id: viewId,
      group_id: groupId,
      pid: pId,
      node_type: nodeType,
      node_id: nodeId,
      vn_type_id: vnType,
      name: name || "",
      content: content,
      update_time: time,
      is_deleted: false,
    }
    return this.insert(viewNode).then((vn) => vn.toJSON())
  },
  // 添加思维导图根节点到视图
  async addMindRoot(
    this: ViewNodeCollection,
    viewId: string,
    gid: string,
    pid: string,
    groupContent: string,
    rootContent: string
  ) {
    const [groupId, groupTime] = unidtime()
    const [rootId, rootTime] = unidtimems(groupTime)
    const viewNodes: ViewNode[] = [
      {
        id: groupId,
        view_id: viewId,
        group_id: gid,
        pid,
        node_type: NodeTypeEnum.GROUP,
        node_id: "",
        vn_type_id: VNTypeEnum.MGROUP,
        name: "",
        content: groupContent,
        update_time: groupTime,
        is_deleted: false,
      },
      {
        id: rootId,
        view_id: viewId,
        group_id: groupId,
        pid: MIND_ROOT_PID,
        node_type: NodeTypeEnum.TEXT,
        node_id: "",
        vn_type_id: VNTypeEnum.TEXT,
        name: "",
        content: rootContent,
        update_time: rootTime,
        is_deleted: false,
      },
    ]
    const vnDocs = await this.bulkInsert(viewNodes)
    return vnDocs.success.map((vn) => vn.toJSON() as ViewNode)
  },
  // 修改视图节点名字
  async updateNodeName(this: ViewNodeCollection, vnId: string, name: string) {
    return this.findOne(vnId)
      .update({
        $set: {
          name: name,
          update_time: Date.now(),
        },
      })
      .then((vnDoc) => (vnDoc ? (vnDoc.toJSON() as ViewNode) : null))
  },
  // 批量更新节点所属分组
  async updateNodeGroup(
    this: ViewNodeCollection,
    groupId: string,
    nodeMap: Map<string, XYPosition | undefined>
  ) {
    const ids = Array.from(nodeMap.keys())
    const vns = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const vnList: ViewNode[] = []
        let time = Date.now()
        map.forEach((vnDoc, vnId) => {
          const vn = vnDoc.toJSON() as ViewNode
          const content = JSON.parse(vn.content) as VNContent
          if (content.position && nodeMap.has(vnId)) {
            const pos = nodeMap.get(vnId)
            const newContent = { ...content, position: pos }
            vnList.push({
              ...vn,
              group_id: groupId,
              content: JSON.stringify(newContent),
              update_time: time,
            })
            time += 1
          }
        })
        return vnList
      })
    await this.bulkUpsert(vns)
    return true
  },
  // 批量更新节点坐标
  async batchUpdateNodePos(this: ViewNodeCollection, nodeMap: Map<string, XYPosition>) {
    const ids = Array.from(nodeMap.keys())
    const vns = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const vnList: ViewNode[] = []
        let time = Date.now()
        map.forEach((vnDoc, vnId) => {
          const pos = nodeMap.get(vnId)
          const vn = vnDoc.toJSON() as ViewNode
          const content = JSON.parse(vn.content) as VNContent
          if (content.position && pos) {
            const newContent = { ...content, position: pos }
            vnList.push({
              ...vn,
              content: JSON.stringify(newContent),
              update_time: time,
            })
            time += 1
          }
        })
        return vnList
      })
    await this.bulkUpsert(vns)
  },
  // 修改视图节点的关联节点 ID
  async updateNodeId(this: ViewNodeCollection, vnId: string, nodeId: string) {
    return this.findOne(vnId)
      .update({
        $set: {
          node_id: nodeId,
          node_type: 1,
          update_time: Date.now(),
        },
      })
      .then((vnDoc) => (vnDoc ? (vnDoc.toJSON() as ViewNode) : null))
  },
  // 更新视图节点信息
  async updateNodeContent(this: ViewNodeCollection, vnId: string, content: string) {
    return this.findOne(vnId)
      .exec()
      .then((vn) => {
        if (vn && vn.content !== content) {
          vn.update({
            $set: {
              content: content,
              update_time: Date.now(),
            },
          })
        }
        return vn ? (vn.toJSON() as ViewNode) : null
      })
  },
  // 更新视图节点信息
  async updateVNContent(this: ViewNodeCollection, vnId: string, vnContent: VNContent) {
    const content = JSON.stringify(vnContent)
    return this.findOne(vnId)
      .exec()
      .then((vn) => {
        if (vn && vn.content !== content) {
          vn.update({
            $set: {
              content: content,
              update_time: Date.now(),
            },
          })
        }
        return vn ? (vn.toJSON() as ViewNode) : null
      })
  },
  async updateNode(
    this: ViewNodeCollection,
    vnId: string,
    name: string,
    nodeId: string,
    nodeType: number,
    content: string,
    vnTypeId?: string
  ) {
    const newData: any = {
      name: name,
      node_id: nodeId,
      node_type: nodeType,
      content: content,
      update_time: Date.now(),
    }
    if (vnTypeId) {
      newData.vn_type_id = vnTypeId
    }
    return this.findOne(vnId)
      .update({ $set: newData })
      .then(() => {
        return true
      })
  },
  // 从视图中删除节点
  async deleteNode(this: ViewNodeCollection, vnId: string) {
    await this.findOne(vnId).update({
      $set: {
        is_deleted: true,
        update_time: Date.now(),
      },
    })
    return true
  },
  // 从视图中批量删除节点
  async deleteNodesByIds(this: ViewNodeCollection, vnIds: string[]) {
    if (vnIds.length > 0) {
      await this.find()
        .where("id")
        .in(vnIds)
        .update({
          $set: {
            is_deleted: true,
            update_time: Date.now(),
          },
        })
    }
    return true
  },
  // 查询指定视图包含的所有卡片 ID
  async getCardIds(this: ViewNodeCollection, viewId: string) {
    const docs = await this.find()
      .where("view_id")
      .eq(viewId)
      .where("node_type")
      .eq(1)
      .where("is_deleted")
      .eq(false)
      .exec()
    return docs.map((doc) => doc.node_id)
  },
  // 查询指定节点内容
  async getVNContentById(this: ViewNodeCollection, vnId: string) {
    return this.findOne(vnId)
      .exec()
      .then((doc) => (doc ? (JSON.parse(doc.content) as VNContent) : null))
  },
  // 查询指定节点内容
  async getVNContentByIds(this: ViewNodeCollection, vnIds: string[]) {
    return this.findByIds(vnIds)
      .exec()
      .then((docMap) => {
        const map = new Map<string, VNContent>()
        docMap.forEach((m) => {
          map.set(m.id, JSON.parse(m.content) as VNContent)
        })
        return map
      })
  },
  // 删除卡片/视图后，重置对应节点
  async resetDeleteNode(
    this: ViewNodeCollection,
    nodeId: string,
    nodeType: NodeTypeEnum,
    name: string
  ) {
    // 清除非卡片节点对卡片的引用
    await this.find()
      .where("node_id")
      .eq(nodeId)
      .where("node_type")
      .eq(nodeType)
      .where("is_deleted")
      .eq(false)
      .update({
        $set: {
          node_id: "",
          node_type: NodeTypeEnum.TEXT,
          name: name,
          update_time: Date.now(),
        },
      })
  },
  // 思维导图节点排序
  async batchUpdateSortNodes(this: ViewNodeCollection, pid: string, nodeMap: Map<string, number>) {
    const ids = Array.from(nodeMap.keys())
    const vns = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const vnList: ViewNode[] = []
        let time = Date.now()
        map.forEach((vnDoc, vnId) => {
          const snum = nodeMap.get(vnId)
          if (snum !== undefined) {
            const vn = vnDoc.toJSON() as ViewNode
            const content = JSON.parse(vn.content) as VNContent
            const newContent = { ...content, snum }
            vnList.push({
              ...vn,
              pid,
              content: JSON.stringify(newContent),
              update_time: time,
            })
            time += 1
          }
        })
        return vnList
      })
    await this.bulkUpsert(vns)
    return true
  },
  // 批量更新思维导图节点排序
  async batchUpdateMindSortNodes(
    this: ViewNodeCollection,
    groupId: string,
    pid: string,
    nodeMap: Map<string, number>
  ) {
    const ids = Array.from(nodeMap.keys())
    const vns = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const vnList: ViewNode[] = []
        let time = Date.now()
        map.forEach((vnDoc, vnId) => {
          const snum = nodeMap.get(vnId)
          if (snum !== undefined) {
            const vn = vnDoc.toJSON() as ViewNode
            const content = JSON.parse(vn.content) as VNContent
            const newContent = { ...content, snum }
            vnList.push({
              ...vn,
              group_id: groupId,
              pid,
              content: JSON.stringify(newContent),
              update_time: time,
            })
            time += 1
          }
        })
        return vnList
      })
    await this.bulkUpsert(vns)
    return true
  },
  // 批量更新节点所属分组 ID
  async batchUpdateGroupId(this: ViewNodeCollection, vnIds: string[], groupId: string) {
    const vns = await this.findByIds(vnIds)
      .exec()
      .then((map) => {
        const vnList: ViewNode[] = []
        let time = Date.now()
        map.forEach((vnDoc) => {
          const vn = vnDoc.toJSON() as ViewNode
          vnList.push({
            ...vn,
            group_id: groupId,
            update_time: time,
          })
          time += 1
        })
        return vnList
      })
    await this.bulkUpsert(vns)
  },
  // 更新导图节点信息
  async updateMindNodeInfo(
    this: ViewNodeCollection,
    vnId: string,
    groupId: string,
    pid: string,
    snum: number
  ) {
    const vnDoc = await this.findOne(vnId).exec()
    if (vnDoc) {
      const vn = vnDoc.toJSON() as ViewNode
      const content = JSON.parse(vn.content) as VNContent
      const newContent = { ...content, snum }
      const newVn = {
        ...vn,
        group_id: groupId,
        pid: pid,
        content: JSON.stringify(newContent),
        update_time: Date.now(),
      }
      await this.upsert(newVn)
    }
  },
  // 批量更新节点参数
  async batchUpdateNodeParam(this: ViewNodeCollection, nodeMap: Map<string, VNParam>) {
    const ids = Array.from(nodeMap.keys())
    const vns = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const vnList: ViewNode[] = []
        let time = Date.now()
        map.forEach((vnDoc, vnId) => {
          const param = nodeMap.get(vnId)
          if (param) {
            const vn = vnDoc.toJSON() as ViewNode
            const content = JSON.parse(vn.content) as VNContent
            const newNode = { ...vn, update_time: time }
            if (param.groupId !== undefined) {
              newNode.group_id = param.groupId
            }
            if (param.pid !== undefined) {
              newNode.pid = param.pid
            }
            // content.position = param.position
            // content.snum = param.snum
            if (param.styleId !== undefined) {
              content.styleId = param.styleId
            }
            if (param.position !== undefined) {
              content.position = param.position === null ? undefined : param.position
            }
            if (param.snum !== undefined) {
              content.snum = param.snum === null ? undefined : param.snum
            }
            if (param.autoWidth !== undefined) {
              content.autoWidth = param.autoWidth
            }
            if (param.layout !== undefined) {
              content.layout = param.layout === null ? undefined : param.layout
            }
            newNode.content = JSON.stringify(content)
            vnList.push(newNode)
            time += 1
          }
        })
        return vnList
      })
    await this.bulkUpsert(vns)
  },

  // 查询指定节点
  async getViewNode(this: ViewNodeCollection, viewId: string, nodeId: string) {
    return this.findOne()
      .where("view_id")
      .eq(viewId)
      .where("node_id")
      .eq(nodeId)
      .where("is_deleted")
      .eq(false)
      .exec()
      .then((vnDoc) => (vnDoc ? (vnDoc.toJSON() as ViewNode) : null))
  },
}
