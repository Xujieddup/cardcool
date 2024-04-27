import { formatTypeProps } from "@/biz"
import type {
  TypeJsonSchema,
  TypeCollection,
  TypeCollectionMethods,
  NodeTypeObj,
  NodeTypeProp,
  NodeTypeInfo,
  TypeInfo,
  TypeStyle,
} from "@/types"
import type { NodeType } from "@/types"
import { unidtime } from "@/utils"

export const typeScheme: TypeJsonSchema = {
  title: "node type",
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
    snum: {
      type: "number",
    },
    props: {
      type: "string",
    },
    styles: {
      type: "string",
    },
    desc: {
      type: "string",
    },
    update_time: {
      type: "number",
    },
    is_deleted: {
      type: "boolean",
    },
  },
  required: ["id", "name", "icon", "snum", "props", "styles", "desc", "update_time", "is_deleted"],
}

export const typeCollectionMethods: TypeCollectionMethods = {
  // 判断是否存在节点空间
  async exist(this: TypeCollection) {
    const typeDocs = await this.findOne().exec()
    return !!typeDocs
  },
  // 查询所有节点模板
  async getAll(this: TypeCollection) {
    const allTypeDocs = await this.find().where("is_deleted").eq(false).exec()
    return allTypeDocs.map((typeDoc) => typeDoc.toJSON() as NodeType)
  },
  // 查询所有节点模板
  async getTypeMap(this: TypeCollection) {
    const allTypeDocs = await this.find().where("is_deleted").eq(false).exec()
    return new Map(
      allTypeDocs.map((typeDoc) => {
        const type = typeDoc.toJSON() as NodeType
        const props = type.props ? (JSON.parse(type.props) as NodeTypeProp[]) : []
        return [
          type.id,
          {
            id: type.id,
            name: type.name,
            props: props,
          } as NodeTypeObj,
        ]
      })
    )
  },
  // 查询指定模板对象
  async getTypeInfo(this: TypeCollection, typeId: string) {
    const typeDoc = await this.findOne(typeId).exec()
    if (!typeDoc) return null
    const props = formatTypeProps(typeDoc.props)
    const styles = typeDoc.styles ? (JSON.parse(typeDoc.styles) as TypeStyle[]) : []
    return {
      id: typeDoc.id,
      name: typeDoc.name,
      icon: typeDoc.icon,
      props: props,
      styles: styles,
      desc: typeDoc.desc,
    } as TypeInfo
  },
  async getTypeInfo2(this: TypeCollection, typeId: string) {
    const typeDoc = await this.findOne(typeId).exec()
    if (!typeDoc) return null
    const props = typeDoc.props ? (JSON.parse(typeDoc.props) as NodeTypeProp[]) : []
    return {
      id: typeDoc.id,
      name: typeDoc.name,
      icon: typeDoc.icon,
      props: props,
      desc: typeDoc.desc,
    } as NodeTypeInfo
  },
  // 查询指定模板对象 TODO:: 应该被 getTypeInfo 替换
  async getTypeObj(this: TypeCollection, typeId: string) {
    const typeDoc = await this.findOne(typeId).exec()
    if (!typeDoc) return undefined
    const props = typeDoc.props ? (JSON.parse(typeDoc.props) as NodeTypeProp[]) : []
    return {
      id: typeDoc.id,
      name: typeDoc.name,
      icon: typeDoc.icon,
      props: props,
      desc: typeDoc.desc,
    } as NodeTypeObj
  },
  // 获取卡片模板查询句柄
  async getTypesQuery(this: TypeCollection) {
    return this.find().where("is_deleted").eq(false).sort({ snum: "asc" })
  },
  // 删除卡片模板
  async deleteType(this: TypeCollection, typeId: string) {
    return this.findOne(typeId)
      .update({
        $set: {
          is_deleted: true,
          update_time: Date.now(),
        },
      })
      .then((res) => {
        return res !== null ? (res.toJSON() as NodeType) : null
      })
  },
  // 编辑卡片模板(新建卡片模板/修改卡片模板名字)
  async editType(this: TypeCollection, tId: string, name: string, icon: string, desc: string) {
    // 新建卡片模板
    if (tId === "") {
      // 先查找 snum 最大的数据
      const doc = await this.findOne().where("is_deleted").eq(false).sort({ snum: "desc" }).exec()
      const [id, time] = unidtime()
      const t = {
        id: id,
        name: name,
        icon: "dup",
        snum: (doc?.snum || 0) + 10000,
        props: "[]",
        styles: "[]",
        desc: desc,
        update_time: time,
        is_deleted: false,
      }
      return this.insert(t).then((doc) => doc.toJSON() as NodeType)
    } else {
      // 修改卡片模板名字
      return this.findOne(tId)
        .update({
          $set: {
            name: name,
            icon: "dup",
            desc: desc,
            update_time: Date.now(),
          },
        })
        .then((doc) => (doc ? (doc.toJSON() as NodeType) : null))
    }
  },
  // 更新卡片模板的属性
  async updateTypeProp(this: TypeCollection, typeId: string, props: string) {
    return this.findOne(typeId)
      .update({
        $set: {
          props: props,
          update_time: Date.now(),
        },
      })
      .then((doc) => (doc ? (doc.toJSON() as NodeType) : null))
  },
  // 更新卡片模板的样式
  async updateTypeStyles(this: TypeCollection, typeId: string, styles: string) {
    return this.findOne(typeId)
      .update({
        $set: {
          styles: styles,
          update_time: Date.now(),
        },
      })
      .then((doc) => (doc ? (doc.toJSON() as NodeType) : null))
  },
  // 批量更新卡片模板排序
  async batchUpdateSorts(this: TypeCollection, nodeMap: Map<string, number>) {
    const ids = Array.from(nodeMap.keys())
    const types = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const list: NodeType[] = []
        let time = Date.now()
        map.forEach((doc, sId) => {
          const snum = nodeMap.get(sId)
          if (snum !== undefined) {
            const item = doc.toJSON() as NodeType
            list.push({ ...item, snum: snum, update_time: time })
            time += 1
          }
        })
        return list
      })
    await this.bulkUpsert(types)
    return true
  },

  // async getCountPouch(this: TypeCollection) {
  //   const t0 = timeStart();

  //   const entries = await this.pouch.allDocs().catch((err) => {
  //     console.log("failed alldocs", err);
  //   });
  //   console.log("Total users Count: ", entries.rows.length);
  //   timeEnd(t0, `getCountPouch - ${entries.rows.length}`);

  //   return entries.rows.length;
  // },

  // async getCountWithInfo(this: TypeCollection) {
  //   const t0 = timeStart();
  //   const info = await this.pouch.info();
  //   console.log("Total users Count: ", info.doc_count);
  //   timeEnd(t0, `getCountWithInfo - ${info.doc_count}`);
  //   return info.doc_count;
  // },

  // async getDocs(
  //   this: TypeCollection,
  //   count: number,
  //   page: number = 1,
  //   saveTimeTaken?: React.Dispatch<React.SetStateAction<[number, number]>>
  // ) {
  //   const t0 = timeStart();

  //   const allDocs = await this.find()
  //     .skip(count * (page - 1))
  //     .limit(count)
  //     .exec();
  //   console.log(
  //     `retrived ${allDocs.length} docs from users (skipped : ${page * count})`
  //   );
  //   const timeTaken = timeEnd(t0, `getDocs - ${allDocs.length} items`);
  //   saveTimeTaken && saveTimeTaken([timeTaken, allDocs.length]);
  //   return allDocs;
  // },

  // async getDocsPouch(this: TypeCollection, count: number, page: number = 0) {
  //   const t0 = timeStart();
  //   const allDocs = await this.pouch.allDocs({ include_docs: true });
  //   timeEnd(t0, `getDocsPouch - ${allDocs.length} items`);
  //   return allDocs;
  // },

  // async addDocs(
  //   this: TypeCollection,
  //   docs: TypeDocType[],
  //   saveTimeTaken?: React.Dispatch<React.SetStateAction<[number, number]>>
  // ) {
  //   const t0 = timeStart();
  //   const res = await this.bulkInsert(docs);
  //   const timeTaken = timeEnd(t0, `addDocs - ${docs.length} items`);
  //   saveTimeTaken && saveTimeTaken([timeTaken, docs.length]);

  //   return res;
  // },
}
