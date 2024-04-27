import { PropHideEnum, PropNameEnum } from "@/enums"
import type { TypeInfo, TypeProp, TypePropStyle } from "@/types"
import { baseTypeProps } from "@/config"
import { arrToMap } from "@/utils"

// 判断是否是基础属性: name/tags/content
export const isBaseProp = (id: string) => {
  return id === "name" || id === "tags" || id === "content"
}
// 解析视图规则配置
export const formatTypeProps = (propsStr: string) => {
  if (!propsStr) {
    return baseTypeProps
  }
  const props = propsStr ? (JSON.parse(propsStr) as TypeProp[]) : []
  if (!props || props.length <= 0) {
    return baseTypeProps
  }
  // 老版本的属性配置，需要进行转换
  if (!props[0].layout) {
    const newProps = [
      { ...baseTypeProps[0], layout: { ...baseTypeProps[0].layout } },
      { ...baseTypeProps[1], layout: { ...baseTypeProps[1].layout } },
    ]
    const lastProp = { ...baseTypeProps[2], layout: { ...baseTypeProps[2].layout } }
    props.forEach((prop, idx) => {
      newProps.push({
        ...prop,
        nameType: PropNameEnum.LEFT,
        defaultVal:
          prop.type === "mselect"
            ? []
            : prop.type === "link" || prop.type === "select"
            ? undefined
            : "",
        hide: PropHideEnum.ALLSHOW,
        layout: { i: prop.id, x: 0, y: idx + 2, w: 6, h: 1, minW: 3, maxH: 1 },
      })
    })
    lastProp.layout.h = Math.max(10 - props.length, 4)
    lastProp.layout.y = props.length + 2
    newProps.push(lastProp)
    return newProps
  }
  return props
}
// 组装卡片样式
export const formatCardStyles = (typeInfo: TypeInfo): TypePropStyle[] => {
  return typeInfo.styles.map((style) => {
    if (style.styles.length) {
      const styleMap = arrToMap(style.styles, "id")
      const props = typeInfo.props.map((prop) => {
        const propStyle = styleMap.get(prop.id)
        if (propStyle) {
          const { nameType, hide, layout, show } = propStyle
          return { ...prop, nameType, hide, layout: { ...prop.layout, ...layout }, show }
        } else {
          return { ...prop }
        }
      })
      return { id: style.id, name: style.name, props: props }
    } else {
      return { id: style.id, name: style.name, props: typeInfo.props }
    }
  })
}
// 计算 gridTemplateRows，当前默认除 content 之外的所有属性 height 都是 1，后面再扩展 height > 1 的场景
export const getPropGridRow = (props: TypeProp[]) => {
  if (props.length <= 0) {
    return ""
  }
  const map = new Map<number, string>()
  props.forEach((p) => {
    if (!map.has(p.layout.y)) {
      map.set(p.layout.y, p.id === "content" ? "1fr" : "auto")
    }
  })
  return Array.from(map.values()).join(" ")
}
export const isEmptyProps = (propStr: string) => {
  return propStr === "{}" || propStr === `{"links":[]}`
}
export const isEmptyContent = (contentStr: string) => {
  return contentStr === "{}" || contentStr === `{"type":"doc","content":[{"type":"paragraph"}]}`
}
