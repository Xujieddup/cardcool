import { getPresetColor } from "@/config"
import type { TagJsonSchema, TagCollection, TagCollectionMethods } from "@/types"
import type { CardTag } from "@/types"
import { unidtime } from "@/utils"

export const tagScheme: TagJsonSchema = {
  title: "tag",
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
    space_id: {
      type: "string",
    },
    pid: {
      type: "string",
    },
    color: {
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
  required: ["id", "name", "space_id", "pid", "color", "snum", "update_time", "is_deleted"],
}

export const tagCollectionMethods: TagCollectionMethods = {
  // 查询所有标签
  async getTagQuery(this: TagCollection, spaceId: string) {
    return this.find().where("space_id").eq(spaceId).where("is_deleted").eq(false)
  },
  async getAll(this: TagCollection, spaceId: string) {
    const allTags = await this.find().where("space_id").eq(spaceId).exec()
    return allTags.map((t) => t.toJSON() as CardTag)
  },
  // 创建标签
  async createTag(this: TagCollection, spaceId: string, name: string) {
    // 先根据标签名，查询标签是否已经存在
    const tagDoc = await this.findOne()
      .where("space_id")
      .eq(spaceId)
      .where("name")
      .eq(name)
      .where("is_deleted")
      .eq(false)
      .exec()
    if (tagDoc) {
      return tagDoc.id
    } else {
      // 先查找 snum 最大的数据
      const maxSnumTag = await this.findOne()
        .where("space_id")
        .eq(spaceId)
        .where("is_deleted")
        .eq(false)
        .sort({ snum: "desc" })
        .exec()
      const [id, time] = unidtime()
      const tag: CardTag = {
        id: id,
        name: name,
        space_id: spaceId,
        pid: "",
        color: getPresetColor(),
        snum: (maxSnumTag?.snum || 0) + 10000,
        update_time: time,
        is_deleted: false,
      }
      await this.insert(tag)
      return id
    }
  },
  // 删除标签
  async deleteTag(this: TagCollection, tagId: string) {
    await this.findOne(tagId).update({
      $set: {
        is_deleted: true,
        update_time: Date.now(),
      },
    })
    return true
  },
  // 修改标签
  async editTag(this: TagCollection, tagId: string, name: string, color: string) {
    await this.findOne(tagId).update({
      $set: {
        name: name,
        color: color,
        update_time: Date.now(),
      },
    })
    return true
  },
}
