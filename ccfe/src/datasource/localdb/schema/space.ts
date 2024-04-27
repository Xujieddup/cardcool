import type { SpaceJsonSchema, SpaceCollection, SpaceCollectionMethods } from "@/types"
import type { Space } from "@/types"
import { unidtime } from "@/utils"

export const spaceScheme: SpaceJsonSchema = {
  title: "node space",
  version: 0,
  primaryKey: "id",
  type: "object",
  keyCompression: true,
  properties: {
    id: {
      type: "string",
      maxLength: 12, // <- the primary key must have set maxLength
    },
    name: {
      type: "string",
    },
    icon: {
      type: "string",
    },
    desc: {
      type: "string",
    },
    snum: {
      type: "number",
    },
    update_time: {
      type: "number",
    },
    is_deleted: {
      type: "boolean",
    },
  },
  required: ["id", "name", "icon", "desc", "snum", "update_time", "is_deleted"],
}

export const spaceCollectionMethods: SpaceCollectionMethods = {
  // 判断是否存在空间
  async exist(this: SpaceCollection) {
    const spaceDocs = await this.findOne().exec()
    return !!spaceDocs
  },
  // 查询所有空间
  async getAll(this: SpaceCollection) {
    const allSpaceDocs = await this.find()
      .where("is_deleted")
      .eq(false)
      .sort({ snum: "asc" })
      .exec()
    return allSpaceDocs.map((spaceDoc) => spaceDoc.toJSON() as Space)
  },
  // 查询所有空间 ID
  async getAllSpaceIds(this: SpaceCollection) {
    const allSpaceDocs = await this.find()
      .where("is_deleted")
      .eq(false)
      .sort({ snum: "asc" })
      .exec()
    return allSpaceDocs.map((spaceDoc) => spaceDoc.id)
  },
  // 查询指定空间信息
  async getSpace(this: SpaceCollection, spaceId: string) {
    return this.findOne(spaceId)
      .exec()
      .then((spaceDoc) => (spaceDoc ? (spaceDoc.toJSON() as Space) : null))
  },
  // 编辑卡片空间(新建卡片空间/修改卡片空间名字)
  async editSpace(this: SpaceCollection, sId: string, name: string, icon: string, desc: string) {
    // 新建卡片空间
    if (sId === "") {
      // 先查找 snum 最大的数据
      await this.findOne()
        .where("is_deleted")
        .eq(false)
        .sort({ snum: "desc" })
        .exec()
        .then((doc) => {
          const [id, time] = unidtime()
          const space: Space = {
            id: id,
            name: name,
            icon: icon,
            desc: desc,
            snum: (doc?.snum || 0) + 10000,
            update_time: time,
            is_deleted: false,
          }
          this.insert(space)
        })
    } else {
      // 修改卡片空间
      await this.findOne(sId)
        .update({
          $set: {
            name: name,
            icon: icon,
            desc: desc,
            update_time: Date.now(),
          },
        })
        .then((doc) => (doc ? (doc.toJSON() as Space) : null))
    }
    return true
  },
  // 修改卡片空间的名字
  async updateSpaceName(this: SpaceCollection, spaceId: string, spaceName: string) {
    await this.findOne(spaceId).update({
      $set: {
        name: spaceName,
        update_time: Date.now(),
      },
    })
    return true
  },
  // 批量更新卡片空间排序
  async batchUpdateSorts(this: SpaceCollection, nodeMap: Map<string, number>) {
    const ids = Array.from(nodeMap.keys())
    const spaces = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const list: Space[] = []
        let time = Date.now()
        map.forEach((doc, sId) => {
          const snum = nodeMap.get(sId)
          if (snum !== undefined) {
            const item = doc.toJSON() as Space
            list.push({ ...item, snum: snum, update_time: time })
            time += 1
          }
        })
        return list
      })
    await this.bulkUpsert(spaces)
    return true
  },
  // 删除空间
  async deleteSpace(this: SpaceCollection, spaceId: string) {
    await this.findOne(spaceId).update({
      $set: {
        is_deleted: true,
        update_time: Date.now(),
      },
    })
    return true
  },
  // 获取空间查询句柄
  async getSpacesQuery(this: SpaceCollection) {
    return this.find().where("is_deleted").eq(false).sort({ snum: "asc" })
  },
}
