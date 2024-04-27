import { PropHideEnum, PropNameEnum } from "@/enums"
import { TypeProp } from "@/types"
import type { Content } from "@tiptap/react"

export const initValue: Content = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
}
// 属性名展示方式
export const nameTypes = [
  {
    label: "展示位置",
    options: [
      { value: PropNameEnum.LEFT, label: "左侧" },
      { value: PropNameEnum.INLINE, label: "内嵌" },
      // { value: PropNameEnum.FLOAT, label: "浮动" },
    ],
  },
]
export const baseNameTypes = [
  {
    label: "展示位置",
    options: [
      { value: PropNameEnum.LEFT, label: "左侧", disabled: true },
      { value: PropNameEnum.INLINE, label: "内嵌" },
      // { value: PropNameEnum.FLOAT, label: "浮动" },
    ],
  },
]
// 卡片属性操作列表
export const handleOptions = [
  {
    value: "copy",
    label: "可复制",
    types: ["name", "text", "password", "number", "link", "phone", "date"],
  },
]
// 卡片属性展示项
export const showOptions = [
  {
    value: "inline",
    label: "单行",
    types: ["name", "text"],
  },
]
// 卡片属性隐藏项
export const hideOptions = [
  { value: PropHideEnum.ALLSHOW, label: "始终展示" },
  { value: PropHideEnum.EMPTYHIDE, label: "空值隐藏" },
  { value: PropHideEnum.ALLHIDE, label: "始终隐藏" },
]
export const nameHideOptions = [{ value: PropHideEnum.ALLSHOW, label: "始终展示" }]
// 卡片属性类型列表
export const defaultTypeProps: TypeProp[] = [
  {
    id: "",
    name: "文本",
    nameType: PropNameEnum.LEFT,
    type: "text",
    defaultVal: "",
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: ["inline"],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "密码",
    nameType: PropNameEnum.LEFT,
    type: "password",
    defaultVal: "",
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: ["inline"],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "链接",
    nameType: PropNameEnum.LEFT,
    type: "link",
    defaultVal: undefined,
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: ["inline"],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "手机",
    nameType: PropNameEnum.LEFT,
    type: "phone",
    defaultVal: "",
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: ["inline"],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "数字",
    nameType: PropNameEnum.LEFT,
    type: "number",
    defaultVal: "",
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: ["inline"],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "日期",
    nameType: PropNameEnum.LEFT,
    type: "date",
    defaultVal: "",
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: [],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "单选",
    nameType: PropNameEnum.LEFT,
    type: "select",
    defaultVal: undefined,
    hide: PropHideEnum.ALLSHOW,
    handles: [],
    show: [],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "",
    name: "多选",
    nameType: PropNameEnum.LEFT,
    type: "mselect",
    defaultVal: [],
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: [],
    options: [],
    layout: { i: "", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
]
// 默认卡片模板属性列表
export const baseTypeProps: TypeProp[] = [
  {
    id: "name",
    name: "卡片名称",
    nameType: PropNameEnum.INLINE,
    type: "name",
    defaultVal: "",
    hide: PropHideEnum.ALLSHOW,
    handles: ["copy"],
    show: [],
    options: [],
    layout: { i: "name", x: 0, y: 0, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "tags",
    name: "标签",
    nameType: PropNameEnum.INLINE,
    type: "tags",
    defaultVal: [],
    hide: PropHideEnum.ALLSHOW,
    handles: [],
    show: [],
    options: [],
    layout: { i: "tags", x: 0, y: 1, w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "content",
    name: "卡片内容",
    nameType: PropNameEnum.INLINE,
    type: "content",
    defaultVal: null,
    hide: PropHideEnum.ALLSHOW,
    handles: [],
    show: [],
    options: [],
    layout: { i: "content", x: 0, y: 2, w: 6, h: 10, minW: 6, maxH: 11 },
  },
]
