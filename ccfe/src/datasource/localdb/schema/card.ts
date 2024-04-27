import { checkDateRule, formatLinkData, parseDateRule, unidtime } from "@/utils"
import type {
  CardJsonSchema,
  CardCollection,
  CardCollectionMethods,
  Card,
  CardProps,
  CardObj,
  CardOption,
  FilterRule,
  NodeTypeProp,
  CardData,
} from "@/types"
import type { MangoQueryOperators, MangoQuerySelector } from "rxdb"
import { CondEnum, SortEnum } from "@/enums"
import { getLocalSpaceId } from "@/datasource/local/localConfig"
import { QUERY_CARD_CNT } from "@/config"

export const cardScheme: CardJsonSchema = {
  title: "card",
  version: 0,
  primaryKey: "id",
  type: "object",
  keyCompression: true,
  properties: {
    id: {
      type: "string",
      maxLength: 12, // <- the primary key must have set maxLength
    },
    space_id: {
      type: "string",
    },
    type_id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    tags: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
      },
    },
    links: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
      },
    },
    props: {
      type: "string",
    },
    content: {
      type: "string",
    },
    create_time: {
      type: "number",
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
    "space_id",
    "type_id",
    "name",
    "tags",
    "links",
    "props",
    "content",
    "create_time",
    "update_time",
    "is_deleted",
  ],
  encrypted: ["props", "content"],
}

export const cardCollectionMethods: CardCollectionMethods = {
  // 查询所有节点
  async getAll(this: CardCollection, spaceId: string) {
    const allCards = await this.find()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .sort({ update_time: "desc" })
      .exec()
    return allCards.map((card) => card.toJSON() as Card)
  },
  // 根据条件查询所有节点
  async getCards(
    this: CardCollection,
    spaceId: string,
    typeId: string,
    dbFilters: FilterRule[],
    propFilters: FilterRule[],
    propMap?: Map<string, NodeTypeProp>,
    ids?: string[]
  ) {
    const selector: MangoQuerySelector<Card> = {
      space_id: spaceId,
      is_deleted: false,
    }
    if (ids !== undefined) {
      if (ids.length > 0) {
        selector["id"] = { $in: ids }
      } else {
        return []
      }
    }
    if (typeId) {
      selector["type_id"] = { $eq: typeId }
    }
    // rxdb 强制 re-execute
    let forceReExec = false
    // 先组装通用属性
    dbFilters.forEach((rule) => {
      switch (rule.propId) {
        case "create_time":
          if (rule.cond === CondEnum.DRULE && rule.value !== "") {
            const [startTime, endTime] = parseDateRule(rule.value as any)
            if (startTime && endTime) {
              selector["$and"] = [
                { create_time: { $gte: Math.ceil(startTime / 1000) } },
                { create_time: { $lte: Math.ceil(endTime / 1000) } },
              ]
            } else if (startTime) {
              selector["create_time"] = { $gte: Math.ceil(startTime / 1000) }
            } else if (endTime) {
              selector["create_time"] = { $lte: Math.ceil(endTime / 1000) }
            }
          }
          break
        case "update_time":
          if (rule.cond === CondEnum.DRULE && rule.value !== "") {
            const [startTime, endTime] = parseDateRule(rule.value as any)
            if (startTime && endTime) {
              selector["$and"] = [
                { update_time: { $gte: startTime } },
                { update_time: { $lte: endTime } },
              ]
            } else if (startTime) {
              selector["update_time"] = { $gte: startTime }
            } else if (endTime) {
              selector["update_time"] = { $lte: endTime }
            }
          }
          break
        case "name":
          switch (rule.cond) {
            case CondEnum.EQ:
              selector["name"] = { $eq: rule.value }
              break
            case CondEnum.NEQ:
              selector["name"] = { $ne: rule.value }
              break
            case CondEnum.IN:
              if (rule.value !== "") {
                selector["name"] = { $regex: new RegExp(rule.value, "i") }
              }
              break
            case CondEnum.NIN:
              if (rule.value !== "") {
                selector["name"] = { $regex: new RegExp("^(?!.*" + rule.value + ")", "i") }
              }
              break
            case CondEnum.EMPTY:
              selector["name"] = { $eq: "" }
              break
            case CondEnum.NEMPTY:
              selector["name"] = { $ne: "" }
              break
          }
          break
        // Tag 的值为数组，其判断条件只有 Lokijs 存储引擎有 contains 条件，其他引擎需另外处理
        case "tags":
          switch (rule.cond) {
            case CondEnum.IN:
              // 包含任意一个
              if (Array.isArray(rule.value) && rule.value.length > 0) {
                forceReExec = true
                selector["tags"] = { $containsAny: rule.value } as MangoQueryOperators<string[]>
              }
              break
            case CondEnum.INALL:
              // 包含所有
              if (Array.isArray(rule.value) && rule.value.length > 0) {
                forceReExec = true
                selector["tags"] = { $contains: rule.value } as MangoQueryOperators<string[]>
              }
              break
            case CondEnum.NIN:
              // 不包含任意一个
              if (Array.isArray(rule.value) && rule.value.length > 0) {
                forceReExec = true
                selector["tags"] = { $containsNone: rule.value } as MangoQueryOperators<string[]>
              }
              break
            case CondEnum.EMPTY:
              selector["tags"] = { $size: 0 }
              break
            case CondEnum.NEMPTY:
              selector["tags"] = { $not: { $size: 0 } }
              break
          }
          break
      }
    })
    const query = this.find({
      selector: selector,
      sort: [{ update_time: SortEnum.DESC }],
      limit: QUERY_CARD_CNT,
    })
    if (forceReExec) {
      query._latestChangeEvent = -1
    }
    // console.log("res123", Date.now())
    const allCards = await query.exec()
    if (allCards.length === 0) return []
    let cards = allCards.map((cardDoc) => {
      const card = cardDoc.toJSON()
      return { ...card, propsObj: JSON.parse(card.props) as CardProps } as CardData
    })
    // console.log("res", query, cards)
    // 再来处理指定卡片模板的属性过滤条件
    if (propMap && propFilters.length) {
      cards = cards.filter((card) => {
        const props = card.propsObj
        const filterRes = propFilters.every((rule) => {
          const propInfo = propMap.get(rule.propId)
          if (!propInfo || props[rule.propId] === undefined) return false
          let res = false
          switch (rule.cond) {
            case CondEnum.EQ:
              if (propInfo.type === "link") {
                const { text, link } = formatLinkData(props[rule.propId])
                res = rule.value === text || rule.value === link
              } else if (propInfo.type === "mselect" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res =
                  val.length === props[rule.propId].length &&
                  val.sort().toString() === props[rule.propId].sort().toString()
              } else {
                res = props[rule.propId] === rule.value
              }
              break
            case CondEnum.NEQ:
              if (propInfo.type === "link") {
                const { text, link } = formatLinkData(props[rule.propId])
                res = rule.value !== text && rule.value !== link
              } else if (propInfo.type === "mselect" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = !(
                  val.length === props[rule.propId].length &&
                  val.sort().toString() === props[rule.propId].sort().toString()
                )
              } else {
                res = props[rule.propId] !== rule.value
              }
              break
            case CondEnum.IN:
              if (propInfo.type === "select" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = val.length > 0 && val.includes(props[rule.propId])
              } else if (propInfo.type === "mselect" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = val.length > 0 && props[rule.propId].some((v: string) => val.includes(v))
              } else {
                res = rule.value !== "" && new RegExp(rule.value, "i").test(props[rule.propId])
              }
              break
            case CondEnum.NIN:
              if (propInfo.type === "select" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = val.length > 0 && !val.includes(props[rule.propId])
              } else if (propInfo.type === "mselect" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = val.length > 0 && !props[rule.propId].some((v: string) => val.includes(v))
              } else {
                res = rule.value !== "" && !new RegExp(rule.value, "i").test(props[rule.propId])
              }
              break
            case CondEnum.EMPTY:
              if (propInfo.type === "mselect" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = val.length === 0
              } else {
                res = !props[rule.propId]
              }
              break
            case CondEnum.NEMPTY:
              if (propInfo.type === "mselect" && Array.isArray(rule.value)) {
                const val = rule.value as string[]
                res = val.length !== 0
              } else {
                res = !!props[rule.propId]
              }
              break
            case CondEnum.GT:
              res = props[rule.propId] > rule.value
              break
            case CondEnum.LT:
              res = props[rule.propId] < rule.value
              break
            case CondEnum.GET:
              res = props[rule.propId] >= rule.value
              break
            case CondEnum.LET:
              res = props[rule.propId] <= rule.value
              break
            case CondEnum.DRULE:
              res = checkDateRule(rule.value as any, props[rule.propId])
              break
          }
          return res
        })
        return filterRes
      })
    }
    return cards
  },
  // 查询空间内的所有节点对象
  async getSpaceCards(this: CardCollection, spaceId: string) {
    const allCards = await this.find()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .sort({ update_time: "desc" })
      .exec()
    return allCards.map((cardDoc) => {
      const card = cardDoc.toJSON() as Card
      const props = card.props ? (JSON.parse(card.props) as CardProps) : undefined
      return {
        id: card.id,
        space_id: card.space_id,
        type_id: card.type_id,
        name: card.name,
        tags: card.tags,
        props: props,
        update_time: card.update_time,
      } as CardObj
    })
  },
  // 根据卡片名称查询空间内的所有卡片对象
  async getSpaceCardsByName(
    this: CardCollection,
    spaceId: string,
    keyword: string,
    ignoreUname?: boolean
  ) {
    const selector: MangoQuerySelector<Card> = {
      space_id: spaceId,
      is_deleted: false,
    }
    if (keyword) {
      selector["name"] = { $regex: new RegExp(keyword, "i") }
    } else if (ignoreUname) {
      selector["name"] = { $ne: "" }
    }
    const allCards = await this.find({
      selector: selector,
      sort: [{ update_time: "desc" }],
      limit: 100,
    }).exec()
    return allCards.map((cardDoc) => {
      return {
        id: cardDoc.id,
        type_id: cardDoc.type_id,
        name: cardDoc.name,
        update_time: cardDoc.update_time,
      } as CardOption
    })
  },
  // 查询指定节点
  async getCard(this: CardCollection, cardId: string) {
    const cardDoc = await this.findOne(cardId).exec()
    return cardDoc ? (cardDoc.toJSON() as Card) : null
  },
  // 根据 ID 查询指定卡片信息(支持 id 为 "" 时返回默认卡片信息)
  async getCardById(this: CardCollection, cardId: string) {
    if (cardId === "") {
      const time = Date.now()
      return {
        id: "",
        space_id: getLocalSpaceId(),
        type_id: "default",
        name: "",
        tags: [],
        links: [],
        props: "{}",
        content: "{}",
        create_time: Math.ceil(time / 1000),
        update_time: time,
        is_deleted: false,
      }
    } else {
      return this.getCard(cardId)
    }
  },
  // 创建新的默认卡片
  async createCard(
    this: CardCollection,
    spaceId: string,
    typeId: string,
    name: string,
    content?: string
  ) {
    const [id, time] = unidtime()
    let cardName = name
    let cardContent = content || "{}"
    if (name.length > 64) {
      cardName = name.substring(0, 64)
      cardContent = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: name,
              },
            ],
          },
        ],
      })
    }
    const card = {
      id: id,
      space_id: spaceId,
      type_id: typeId,
      name: cardName,
      tags: [],
      links: [],
      props: "{}",
      content: cardContent,
      create_time: Math.ceil(time / 1000),
      update_time: time,
      is_deleted: false,
    }
    return this.insert(card).then((cardDoc) => cardDoc.toJSON() as Card)
  },
  // 创建新的卡片
  async createNewCard(
    this: CardCollection,
    spaceId: string,
    name: string,
    typeId: string,
    tags: string[],
    props: string,
    content: string
  ) {
    const [id, time] = unidtime()
    const card = {
      id: id,
      space_id: spaceId,
      type_id: typeId,
      name: name,
      tags: tags,
      links: [],
      props: props,
      content: content,
      create_time: Math.ceil(time / 1000),
      update_time: time,
      is_deleted: false,
    }
    return this.insert(card).then((cardDoc) => cardDoc.toJSON() as Card)
  },
  // 修改节点
  async updateCard(
    this: CardCollection,
    cardId: string,
    name: string,
    typeId: string,
    tags: string[],
    props: string,
    content: string
  ) {
    return this.findOne(cardId)
      .update({
        $set: {
          name: name,
          type_id: typeId,
          tags: tags,
          props: props,
          content: content,
          update_time: Date.now(),
        },
      })
      .then((cardDoc) => (cardDoc ? (cardDoc.toJSON() as Card) : null))
  },
  // 修改节点
  async updateCardProps(this: CardCollection, cardId: string, props: string) {
    return this.findOne(cardId)
      .update({
        $set: {
          props: props,
          update_time: Date.now(),
        },
      })
      .then((cardDoc) => (cardDoc ? (cardDoc.toJSON() as Card) : null))
  },
  // 删除节点
  async deleteCard(this: CardCollection, cardId: string) {
    this.findOne(cardId).update({
      $set: {
        is_deleted: true,
        update_time: Date.now(),
      },
    })
  },
  // 根据 ids 查询节点
  async getCardMapByIds(this: CardCollection, ids: string[]) {
    return this.findByIds(ids)
      .exec()
      .then((map) => {
        const cardMap: Map<string, Card> = new Map<string, Card>()
        map.forEach((value, key) => {
          cardMap.set(key, value.toJSON() as Card)
        })
        return cardMap
      })
  },
  // 根据 ids 查询节点
  async getCardsByIds(this: CardCollection, ids: string[]) {
    return this.findByIds(ids).exec()
  },
  async getCardOptMapByIds(this: CardCollection, ids: string[]) {
    const m = new Map<string, CardOption>()
    if (ids.length === 0) {
      return m
    }
    return this.findByIds(ids)
      .exec()
      .then((map) => {
        map.forEach((value, key) => {
          m.set(key, {
            id: value.id,
            type_id: value.type_id,
            name: value.name,
          } as CardOption)
        })
        return m
      })
  },
  // 获取卡片信息查询句柄
  async getCardQuery(this: CardCollection, id: string) {
    return this.findOne(id)
  },
  // 获取空间的卡片数量
  async getSpaceCardCnt(this: CardCollection, spaceId: string) {
    const cnt = await this.count()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .exec()
    return cnt || 0
  },
  // 获取指定模板的卡片数量
  async getTypeCardCnt(this: CardCollection, typeId: string) {
    const cnt = await this.count().where("type_id").eq(typeId).where("is_deleted").eq(false).exec()
    return cnt || 0
  },
  // 获取指定标签的卡片数量
  async getTagCardCnt(this: CardCollection, spaceId: string, tagId: string) {
    const cnt = await this.count({
      selector: {
        space_id: spaceId,
        is_deleted: false,
        tags: { $contains: tagId } as MangoQueryOperators<string>,
      },
    }).exec()
    return cnt || 0
  },
}
