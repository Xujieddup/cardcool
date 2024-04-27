// 视图节点类型 viewnode.node_type
export enum NodeTypeEnum {
  TEXT, // 文本
  CARD, // 卡片
  VIEW, // 视图
  GROUP, // 分组
}
// 视图节点类型 viewnode.vn_type_id
export enum VNTypeEnum {
  CARD = "card", // 卡片节点
  VIEW = "view", // 视图节点
  TEXT = "text", // 富文本节点
  SHAPE = "shape", // 图形节点
  MGROUP = "mgroup", // 导图分组
  IGROUP = "igroup", // 一般分组
  // 之前的节点类型
  MINDGROUP = "mindGroup", // 导图块
  MINDROOT = "mindRoot",
  MINDSUB = "mindSub",
  MINDNODE = "mindNode",
  MIND = "mind", // 导图节点
  SQUARE = "square",
  CIRCLE = "circle",
  TRIANGLE = "triangle",
}
// 图形节点类型
export enum ShapeTypeEnum {
  SQUARE = "square",
  CIRCLE = "circle",
  TRIANGLE = "triangle",
}
// 视图类型 view.type
export enum ViewTypeEnum {
  LIST,
  BOARD,
  KANBAN,
  GANTT,
  DOC,
  MDOC,
}
// 视图内联类型 view.inline_type
export enum ViewInlineType {
  NOTINLINE,
  INLINE,
}
// 双链节点类型
export enum LinkNodeType {
  NEW, // 新建卡片
  CARD, // 卡片
  VIEW, // 视图
}
// 特殊视图
export enum SpecialViewEnum {
  CARDS = "cards",
  VIEWS = "views",
  SPACES = "spaces",
  TYPES = "types",
  TAGS = "tags",
  STARS = "stars",
  DELETES = "deletes",
}
// 特殊视图的类型
export enum SpecialViewTypeEnum {
  CARDS = -1,
  VIEWS = -2,
  SPACES = -3,
  TYPES = -4,
  TAGS = -5,
  STARS = -6,
  DELETES = -7,
}

// 卡片/视图操作事件枚举
export enum OpEnum {
  DELETE, // 删除
  ADD, // 新增
  UPDATE, // 修改
}

export enum CondEnum {
  EQ, // 相等
  NEQ, // 不相等
  IN, // 包含
  NIN, // 不包含
  EMPTY, // 为空
  NEMPTY, // 不为空
  GT, // 大于
  LT, // 小于
  GET, // 大于等于
  LET, // 小于等于
  DRULE, // 自定义日期筛选规则
  INALL, // 同时包含所有
}
export enum DateRuleEnum {
  DAD, // 绝对日期(天)
  DAR, // 绝对日期范围
  DRD, // 绝对日期(天)
  DRR, // 绝对日期范围
}
export enum DateRuleUnitEnum {
  DAY, // 天
  WEEK, // 周
  MONTH, // 月
  QUARTER, // 季度
  YEAR, // 年
}
export enum FilterTypeEnum {
  CUSTOM, // 自定义处理
  TEXT, // 文本
  NUMBER, // 数值
  SELECT, // 单选
  MSELECT, // 多选
  DATE, // 时间
  TAGS, // 标签
}
export enum DateEnum {
  TODAY, // 相等
  TOMORROW, // 不相等
  YESTERDAY, // 包含
  WEEK, // 不包含
  LASTWEEK, // 为空
  MONTH, // 不为空
  LASTMONTH, // 大于
  LT, // 小于
  GET, // 大于等于
  LET, // 小于等于
  DLT, // 日期早于
  DGT, // 日期晚于
}

export enum SortEnum {
  ASC = "asc", // 正序
  DESC = "desc", // 倒序
}
export enum SorterTypeEnum {
  COMMON, // 一般排序字段
  SELECT, // 选项排序字段
}
// 卡片属性名的展示方式
export enum PropNameEnum {
  LEFT, // 固定左侧
  INLINE, // 嵌入
  FLOAT, // 浮动
}
export enum PropHideEnum {
  ALLSHOW, // 一直展示
  EMPTYHIDE, // 空值隐藏
  ALLHIDE, // 一直隐藏
}
// 白板的分组类型
export enum GroupTypeEnum {
  NORMAL, // 一般分组
  MIND, // 思维导图
}

// 导图分组的布局类型
export enum MindLayoutEnum {
  LR = "LR", // 从左到右
  RL = "RL", // 从右到左
  TB = "TB", // 从上到下
  BT = "BT", // 从下到上
  LCR = "H", // 左中右
  TCB = "V", // 上中下
}
// 导图内节点相对根节点的方向
export enum MindNodeDireEnum {
  LEFT = "L", // 左方
  RIGHT = "R", // 右方
  TOP = "T", // 上方
  BOTTOM = "B", // 下方
}

// 布局类型枚举
export enum LayoutEnum {
  ALIGNL = "alignl", // 左方
  ALIGNR = "alignr", // 右方
  ALIGNT = "alignt", // 上方
  ALIGNB = "alignb", // 下方
  ALIGNCV = "aligncv", // 垂直居中
  ALIGNCH = "alignch", // 水平居中
}
// 布局类型枚举
export enum DateModeEnum {
  DAY = "day",
  MONTH = "month",
  YEAR = "year",
}
