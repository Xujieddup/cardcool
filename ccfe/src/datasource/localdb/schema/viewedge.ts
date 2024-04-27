import type { ViewEdgeJsonSchema, ViewEdgeCollection, ViewEdgeCollectionMethods } from "@/types"
import type { ViewEdge } from "@/types"
import { unidtime } from "@/utils"

export const viewEdgeScheme: ViewEdgeJsonSchema = {
  title: "view edge relation",
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
    source: {
      type: "string",
      maxLength: 12,
    },
    target: {
      type: "string",
      maxLength: 12,
    },
    source_handle: {
      type: "string",
    },
    target_handle: {
      type: "string",
    },
    ve_type_id: {
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
    "source",
    "target",
    "source_handle",
    "target_handle",
    "ve_type_id",
    "name",
    "content",
    "update_time",
    "is_deleted",
  ],
  indexes: ["view_id", "source", "target"],
}

export const viewEdgeCollectionMethods: ViewEdgeCollectionMethods = {
  // 查询所有节点关系
  async getAll(this: ViewEdgeCollection, viewId: string) {
    const allViewEdgeDocs = await this.find()
      .where("view_id")
      .eq(viewId)
      .where("is_deleted")
      .eq(false)
      .exec()
    return allViewEdgeDocs.map((viewEdgeDoc) => {
      return viewEdgeDoc.toJSON() as ViewEdge
      // const viewEdge = viewEdgeDoc.toJSON() as ViewEdge
      // return {
      //   id: viewEdge.id,
      //   source: viewEdge.source,
      //   target: viewEdge.target,
      //   name: viewEdge.name,
      // }
    })
  },
  // 视图中添加节点关联
  async addEdge(
    this: ViewEdgeCollection,
    viewId: string,
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string,
    veTypeId?: string,
    content?: string,
    name?: string
  ) {
    const [id, time] = unidtime()
    const viewEdge: ViewEdge = {
      id: id,
      view_id: viewId,
      source: sourceId,
      target: targetId,
      source_handle: sourceHandle || "",
      target_handle: targetHandle || "",
      ve_type_id: veTypeId || "default",
      name: name || "",
      content: content || "{}",
      update_time: time,
      is_deleted: false,
    }
    return this.insert(viewEdge).then((ve) => ve.toJSON())
  },
  // 从视图中删除关联
  async deleteEdge(this: ViewEdgeCollection, veId: string) {
    await this.findOne(veId).update({
      $set: {
        is_deleted: true,
        update_time: Date.now(),
      },
    })
    return true
  },
  async deleteEdgesByIds(this: ViewEdgeCollection, veIds: string[]) {
    if (veIds.length > 0) {
      await this.find()
        .where("id")
        .in(veIds)
        .update({
          $set: {
            is_deleted: true,
            update_time: Date.now(),
          },
        })
    }
    return true
  },
  // 从视图中指定节点的关联
  async deleteEdgeByNodeIds(this: ViewEdgeCollection, nodeIds: string[]) {
    if (nodeIds.length > 0) {
      await this.find({
        selector: {
          is_deleted: { $eq: false },
          $or: [{ source: { $in: nodeIds } }, { target: { $in: nodeIds } }],
        },
      })
        // .where("source")
        // .in(nodeIds)
        // .where("target")
        // .in(nodeIds)
        // .where("is_deleted")
        // .eq(false)
        .update({
          $set: {
            is_deleted: true,
            update_time: Date.now(),
          },
        })
    }
    return true
  },
  // 修改视图关联名字
  async updateName(this: ViewEdgeCollection, id: string, name: string) {
    await this.findOne(id).update({
      $set: {
        name: name,
        update_time: Date.now(),
      },
    })
    return true
  },
}
