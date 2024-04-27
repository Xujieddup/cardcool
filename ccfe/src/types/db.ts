import type {
  RxDatabase,
  RxJsonSchema,
  RxCollection,
  RxDocument,
  RxQuery,
} from "rxdb/dist/types/types"
import type {
  Space,
  View,
  ViewNode,
  ViewEdge,
  NodeType,
  CardTag,
  Card,
  NodeTypeObj,
  CardObj,
  CardOption,
  ViewOption,
  VNContent,
  FilterRule,
  SorterRule,
  GrouperRule,
  NodeTypeProp,
  CardData,
  NodeTypeInfo,
  TypeInfo,
  GanttRule,
} from "./po"
import { NodeTypeEnum, VNTypeEnum } from "@/enums"
import { XYPosition } from "@/reactflow"
import { VNParam, ViewNameObj } from "./prop"

export type SpaceCollectionMethods = {
  // 判断是否存在卡片空间
  exist: (this: SpaceCollection) => Promise<boolean>
  // 查询所有
  getAll: (this: SpaceCollection) => Promise<Space[]>
  // 查询所有空间 ID
  getAllSpaceIds: (this: SpaceCollection) => Promise<string[]>
  // 查询指定空间信息
  getSpace: (this: SpaceCollection, spaceId: string) => Promise<Space | null>
  // 编辑卡片空间(新建卡片空间/修改卡片空间名字)
  editSpace: (
    this: SpaceCollection,
    sId: string,
    name: string,
    icon: string,
    desc: string
  ) => Promise<boolean>
  // 修改卡片空间的名字
  updateSpaceName: (this: SpaceCollection, spaceId: string, spaceName: string) => Promise<boolean>
  // 批量更新卡片空间排序
  batchUpdateSorts: (this: SpaceCollection, nodeMap: Map<string, number>) => Promise<boolean>
  // 删除卡片空间
  deleteSpace: (this: SpaceCollection, spaceId: string) => Promise<boolean>
  // 获取空间查询句柄
  getSpacesQuery: (
    this: SpaceCollection
  ) => Promise<RxQuery<Space, RxDocument<Space, SpaceDocMethods>[]>>
}

export type SpaceDocMethods = {
  scream: (v: string) => string
}

// 卡片空间 json 结构
export type SpaceJsonSchema = RxJsonSchema<Space>
// 合并类型
export type SpaceCollection = RxCollection<Space, SpaceDocMethods, SpaceCollectionMethods>

// -------------- 视图 --------------
export type ViewCollectionMethods = {
  // 查询所有视图
  getAll: (this: ViewCollection, spaceId: string) => Promise<View[]>
  // 查询视图列表 - 菜单栏（非内联视图）
  getMenuViews: (this: ViewCollection, spaceId: string) => Promise<View[]>
  getViewsQuery: (
    this: ViewCollection,
    spaceId: string
  ) => Promise<RxQuery<View, RxDocument<View, ViewDocMethods>[]>>
  // 获取Flow视图查询句柄
  getFlowViewsQuery: (
    this: ViewCollection,
    spaceId: string
  ) => Promise<RxQuery<View, RxDocument<View, ViewDocMethods>[]>>
  // 查询视图（默认为卡片集视图）
  getView: (this: ViewCollection, spaceId: string, viewId: string) => Promise<View | null>
  // 查询视图并更新时间（默认为卡片集视图）
  getAndUpdateView: (this: ViewCollection, spaceId: string, viewId: string) => Promise<View | null>
  // 查询视图
  getViewById: (this: ViewCollection, viewId: string) => Promise<View | null>
  // 查询指定视图及其内联视图
  getViewAndInlineViews: (this: ViewCollection, viewId: string) => Promise<View[]>
  getViewQuery: (
    this: ViewCollection,
    viewId: string
  ) => Promise<RxQuery<View, RxDocument<View, ViewDocMethods> | null>>
  // 查询视图集视图
  getSummaryView: (this: ViewCollection, spaceId: string) => Promise<View | null>
  // 根据 id 列表批量查询视图信息
  getViewsByIds: (
    this: ViewCollection,
    viewIds: string[]
  ) => Promise<Map<string, RxDocument<View, ViewDocMethods>>>
  // 创建新卡片视图
  createView: (
    this: ViewCollection,
    spaceId: string,
    pid: string,
    type: number,
    inlineType: number,
    snum: number,
    name: string,
    desc: string,
    config: string
  ) => Promise<View>
  // 编辑视图(新建视图/修改视图名字)
  editView: (
    this: ViewCollection,
    viewId: string,
    pid: string,
    inlineType: number,
    name: string,
    desc: string,
    snum: number,
    queryInlineSnum: boolean
  ) => Promise<View | null>
  // 根据 ids 查询视图
  getMapByIds: (this: ViewCollection, ids: string[]) => Promise<Map<string, View>>
  // 修改卡片视图名字
  updateViewName: (this: ViewCollection, viewId: string, viewName: string) => Promise<boolean>
  // 修改卡片视图内容
  updateViewContent: (this: ViewCollection, viewId: string, content: string) => Promise<void>
  // 获取指定视图及其所有子视图(包括内联视图)
  getChildViews: (this: ViewCollection, viewId: string) => Promise<ViewNameObj[]>
  // 根据 id 批量删除视图(先查询所有子视图 id)
  deleteViewByIds: (this: ViewCollection, viewIds: string[]) => Promise<void>
  getSpaceViewsByName: (
    this: ViewCollection,
    spaceId: string,
    keyword: string,
    ignoreUname?: boolean
  ) => Promise<ViewOption[]>
  getCardOptMapByIds: (this: ViewCollection, ids: string[]) => Promise<Map<string, ViewOption>>
  // 修改视图配置
  updateViewConfig: (
    this: ViewCollection,
    viewId: string,
    ruleId: string,
    typeId: string,
    filters: FilterRule[],
    groupers: GrouperRule[],
    sorters: SorterRule[],
    gantt?: GanttRule
  ) => Promise<boolean>
  // 创建规则快照
  createViewRuleSnap: (
    this: ViewCollection,
    viewId: string,
    ruleId: string,
    typeId: string,
    filters: FilterRule[],
    groupers: GrouperRule[],
    sorters: SorterRule[],
    gantt?: GanttRule
  ) => Promise<boolean>
  // 更新规则快照名字
  updateRuleSnapName: (
    this: ViewCollection,
    viewId: string,
    ruleId: string,
    ruleName: string
  ) => Promise<boolean>
  // 删除规则快照
  deleteRuleSnap: (this: ViewCollection, viewId: string, ruleId: string) => Promise<boolean>
  // 更新规则排序
  updateRuleSnapSort: (
    this: ViewCollection,
    viewId: string,
    beforeRuleId: string,
    afterRuleId: string
  ) => Promise<boolean>
  // 修改视图排序规则
  updateViewSorter: (
    this: ViewCollection,
    viewId: string,
    vid: string,
    sorters: SorterRule[]
  ) => Promise<boolean>
  updateViewFavor: (this: ViewCollection, viewId: string, isFavor: boolean) => Promise<boolean>
  // 获取空间的视图数量
  getSpaceViewCnt: (this: ViewCollection, spaceId: string) => Promise<number>
  // 视图排序
  batchUpdateSortViews: (
    this: ViewCollection,
    viewMap: Map<string, number>,
    pid?: string
  ) => Promise<boolean>
}

export type ViewDocMethods = {
  scream: (v: string) => string
}

// 卡片视图 json 结构
export type ViewJsonSchema = RxJsonSchema<View>
// 合并类型
export type ViewCollection = RxCollection<View, ViewDocMethods, ViewCollectionMethods>

// -------------- 视图卡片 --------------
export type ViewNodeCollectionMethods = {
  // 查询所有
  getAll: (this: ViewNodeCollection, viewId: string) => Promise<ViewNode[]>
  // 添加节点到视图
  addNode: (
    this: ViewNodeCollection,
    viewId: string,
    groupId: string,
    pId: string,
    nodeId: string,
    nodeType: number,
    vnType: VNTypeEnum,
    content: string,
    name?: string
  ) => Promise<ViewNode>
  // 添加思维导图根节点到视图
  addMindRoot: (
    this: ViewNodeCollection,
    viewId: string,
    gid: string,
    pid: string,
    groupContent: string,
    rootContent: string
  ) => Promise<ViewNode[]>
  // 修改视图节点名字
  updateNodeName: (this: ViewNodeCollection, vnId: string, name: string) => Promise<ViewNode | null>
  // 批量更新节点所属分组
  updateNodeGroup: (
    this: ViewNodeCollection,
    groupId: string,
    nodeMap: Map<string, XYPosition | undefined>
  ) => Promise<boolean>
  // 批量更新节点坐标
  batchUpdateNodePos: (this: ViewNodeCollection, nodeMap: Map<string, XYPosition>) => Promise<void>
  // 修改视图节点的关联节点 ID
  updateNodeId: (this: ViewNodeCollection, vnId: string, nodeId: string) => Promise<ViewNode | null>
  // 更新视图节点信息
  updateNodeContent: (
    this: ViewNodeCollection,
    vnId: string,
    content: string
  ) => Promise<ViewNode | null>
  // 更新视图节点信息
  updateVNContent: (
    this: ViewNodeCollection,
    vnId: string,
    vnContent: VNContent
  ) => Promise<ViewNode | null>
  updateNode: (
    this: ViewNodeCollection,
    vnId: string,
    name: string,
    nodeId: string,
    nodeType: number,
    content: string,
    vnTypeId?: string
  ) => Promise<boolean>
  // 从视图中删除卡片
  deleteNode: (this: ViewNodeCollection, vnId: string) => Promise<boolean>
  // 从视图中批量删除节点
  deleteNodesByIds: (this: ViewNodeCollection, vnIds: string[]) => Promise<boolean>
  // 查询指定视图包含的所有卡片 ID
  getCardIds: (this: ViewNodeCollection, viewId: string) => Promise<string[]>
  // 查询指定节点内容
  getVNContentById: (this: ViewNodeCollection, vnId: string) => Promise<VNContent | null>
  // 查询指定节点内容
  getVNContentByIds: (this: ViewNodeCollection, vnIds: string[]) => Promise<Map<string, VNContent>>
  // 根据关联节点id删除关联节点信息
  resetDeleteNode: (
    this: ViewNodeCollection,
    nodeId: string,
    nodeType: NodeTypeEnum,
    name: string
  ) => Promise<void>
  // 思维导图节点排序
  batchUpdateSortNodes: (
    this: ViewNodeCollection,
    pid: string,
    nodeMap: Map<string, number>
  ) => Promise<boolean>
  // 批量更新思维导图节点排序
  batchUpdateMindSortNodes: (
    this: ViewNodeCollection,
    groupId: string,
    pid: string,
    nodeMap: Map<string, number>
  ) => Promise<boolean>
  // 批量更新节点所属分组 ID
  batchUpdateGroupId: (this: ViewNodeCollection, vnIds: string[], groupId: string) => Promise<void>
  // 更新导图节点信息
  updateMindNodeInfo: (
    this: ViewNodeCollection,
    vnId: string,
    groupId: string,
    pid: string,
    snum: number
  ) => Promise<void>
  // 批量更新节点参数
  batchUpdateNodeParam: (this: ViewNodeCollection, nodeMap: Map<string, VNParam>) => Promise<void>

  // 查询指定卡片
  getViewNode: (
    this: ViewNodeCollection,
    viewId: string,
    cardId: string
  ) => Promise<ViewNode | null>
}

export type ViewNodeDocMethods = {
  scream: (v: string) => string
}

// 卡片视图 json 结构
export type ViewNodeJsonSchema = RxJsonSchema<ViewNode>
// 合并类型
export type ViewNodeCollection = RxCollection<
  ViewNode,
  ViewNodeDocMethods,
  ViewNodeCollectionMethods
>

// -------------- 视图卡片关联关系 --------------
export type ViewEdgeCollectionMethods = {
  // 查询所有
  getAll: (this: ViewEdgeCollection, viewId: string) => Promise<ViewEdge[]>
  // 视图中添加卡片关联
  addEdge: (
    this: ViewEdgeCollection,
    viewId: string,
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string,
    veTypeId?: string,
    content?: string,
    name?: string
  ) => Promise<ViewEdge>
  // 从视图中删除关联
  deleteEdge: (this: ViewEdgeCollection, veId: string) => Promise<boolean>
  // 从视图中批量删除关联
  deleteEdgesByIds: (this: ViewEdgeCollection, veIds: string[]) => Promise<boolean>
  // 从视图中指定节点的关联
  deleteEdgeByNodeIds: (this: ViewEdgeCollection, nodeIds: string[]) => Promise<boolean>
  // 修改关联名字
  updateName: (this: ViewEdgeCollection, id: string, name: string) => Promise<boolean>
}

export type ViewEdgeDocMethods = {
  scream: (v: string) => string
}

// 卡片视图 json 结构
export type ViewEdgeJsonSchema = RxJsonSchema<ViewEdge>
// 合并类型
export type ViewEdgeCollection = RxCollection<
  ViewEdge,
  ViewEdgeDocMethods,
  ViewEdgeCollectionMethods
>

export type TypeCollectionMethods = {
  // 判断是否存在卡片模板
  exist: (this: TypeCollection) => Promise<boolean>
  // 查询所有模板
  getAll: (this: TypeCollection) => Promise<NodeType[]>
  // 查询模板 Map
  getTypeMap: (this: TypeCollection) => Promise<Map<string, NodeTypeObj>>
  // 查询模板 Map
  getTypeInfo: (this: TypeCollection, typeId: string) => Promise<TypeInfo | null>
  getTypeInfo2: (this: TypeCollection, typeId: string) => Promise<NodeTypeInfo | null>
  getTypeObj: (this: TypeCollection, typeId: string) => Promise<NodeTypeObj | undefined>
  // 获取卡片模板查询句柄
  getTypesQuery: (
    this: TypeCollection
  ) => Promise<RxQuery<NodeType, RxDocument<NodeType, TypeDocMethods>[]>>
  // 删除卡片模板
  deleteType: (this: TypeCollection, typeId: string) => Promise<NodeType | null>
  // 编辑卡片模板(新建卡片模板/修改卡片模板名字)
  editType: (
    this: TypeCollection,
    tId: string,
    name: string,
    icon: string,
    desc: string
  ) => Promise<NodeType | null>
  // 更新卡片模板的属性
  updateTypeProp: (this: TypeCollection, typeId: string, props: string) => Promise<NodeType | null>
  // 更新卡片样式
  updateTypeStyles: (
    this: TypeCollection,
    typeId: string,
    styles: string
  ) => Promise<NodeType | null>
  // 批量更新卡片模板排序
  batchUpdateSorts: (this: TypeCollection, nodeMap: Map<string, number>) => Promise<boolean>
  // getCountPouch: (this: TypeCollection) => Promise<number>;
  // getCountWithInfo: (this: TypeCollection) => Promise<number>;
  // addDocs: (
  //   this: TypeCollection,
  //   docs: TypeDoc[],
  //   saveTimeTaken?: React.Dispatch<React.SetStateAction<[number, number]>>,
  // ) => void;
  // getDocs: (
  //   this: TypeCollection,
  //   count: number,
  //   page?: number,
  //   saveTimeTaken?: React.Dispatch<React.SetStateAction<[number, number]>>,
  // ) => Promise<TypeDoc[]>;
  // getDocsPouch: (this: TypeCollection, count: number, page: number) => Promise<TypeDoc[]>;
}

export type TypeDocMethods = {
  scream: (v: string) => string
}

// 卡片模板 json 结构
export type TypeJsonSchema = RxJsonSchema<NodeType>
// 合并类型
export type TypeCollection = RxCollection<NodeType, TypeDocMethods, TypeCollectionMethods>

export type TagCollectionMethods = {
  // 查询所有标签
  getTagQuery: (
    this: TagCollection,
    spaceId: string
  ) => Promise<RxQuery<CardTag, RxDocument<CardTag, TagDocMethods>[]>>
  getAll: (this: TagCollection, spaceId: string) => Promise<CardTag[]>
  // 创建标签
  createTag: (this: TagCollection, spaceId: string, name: string) => Promise<string>
  // 删除标签
  deleteTag: (this: TagCollection, tagId: string) => Promise<boolean>
  // 修改标签
  editTag: (this: TagCollection, tagId: string, name: string, color: string) => Promise<boolean>
}

export type TagDocMethods = {
  scream: (v: string) => string
}

// 卡片分组 json 结构
export type TagJsonSchema = RxJsonSchema<CardTag>
// 合并类型
export type TagCollection = RxCollection<CardTag, TagDocMethods, TagCollectionMethods>

export type CardCollectionMethods = {
  // 查询所有
  getAll: (this: CardCollection, spaceId: string) => Promise<Card[]>
  // 根据条件查询所有卡片
  getCards: (
    this: CardCollection,
    spaceId: string,
    typeId: string,
    dbFilters: FilterRule[],
    propFilters: FilterRule[],
    propMap?: Map<string, NodeTypeProp>,
    ids?: string[]
  ) => Promise<CardData[]>
  // 查询空间内的所有卡片对象
  getSpaceCards: (this: CardCollection, spaceId: string) => Promise<CardObj[]>
  // 根据卡片名称查询空间内的所有卡片对象
  getSpaceCardsByName: (
    this: CardCollection,
    spaceId: string,
    keyword: string,
    ignoreUname?: boolean
  ) => Promise<CardOption[]>
  // 查询指定卡片
  getCard: (this: CardCollection, cardId: string) => Promise<Card | null>
  // 根据 ID 查询指定卡片信息(支持 id 为 "" 时返回默认卡片信息)
  getCardById: (this: CardCollection, cardId: string) => Promise<Card | null>
  // 创建新的默认卡片
  createCard: (
    this: CardCollection,
    spaceId: string,
    typeId: string,
    name: string,
    content?: string
  ) => Promise<Card>
  // 创建新的卡片
  createNewCard: (
    this: CardCollection,
    spaceId: string,
    name: string,
    typeId: string,
    tags: string[],
    props: string,
    content: string
  ) => Promise<Card>
  // 修改卡片
  updateCard: (
    this: CardCollection,
    cardId: string,
    name: string,
    typeId: string,
    tags: string[],
    props: string,
    content: string
  ) => Promise<Card | null>
  // 修改卡片
  updateCardProps: (this: CardCollection, cardId: string, props: string) => Promise<Card | null>
  // 删除卡片
  deleteCard: (this: CardCollection, cardId: string) => Promise<void>
  // 根据 ids 查询卡片
  getCardMapByIds: (this: CardCollection, ids: string[]) => Promise<Map<string, Card>>
  getCardsByIds: (
    this: CardCollection,
    ids: string[]
  ) => Promise<Map<string, RxDocument<Card, CardDocMethods>>>
  getCardOptMapByIds: (this: CardCollection, ids: string[]) => Promise<Map<string, CardOption>>
  // 获取卡片信息查询句柄
  getCardQuery: (
    this: CardCollection,
    id: string
  ) => Promise<RxQuery<Card, RxDocument<Card, CardDocMethods> | null>>
  // 获取空间的卡片数量
  getSpaceCardCnt: (this: CardCollection, spaceId: string) => Promise<number>
  // 获取指定模板的卡片数量
  getTypeCardCnt: (this: CardCollection, typeId: string) => Promise<number>
  // 获取指定标签的卡片数量
  getTagCardCnt: (this: CardCollection, spaceId: string, tagId: string) => Promise<number>
}

export type CardDocMethods = {
  scream: (v: string) => string
}

// 卡片 json 结构
export type CardJsonSchema = RxJsonSchema<Card>
// 合并类型
export type CardCollection = RxCollection<Card, CardDocMethods, CardCollectionMethods>

export type MyDatabaseCollections = {
  space: SpaceCollection
  type: TypeCollection
  tag: TagCollection
  card: CardCollection
  view: ViewCollection
  viewnode: ViewNodeCollection
  viewedge: ViewEdgeCollection
}

export type MyDatabase = RxDatabase<MyDatabaseCollections>
