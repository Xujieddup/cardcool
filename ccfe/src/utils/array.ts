import type { Node } from "@/reactflow/core"

export const getChildNodeIds2 = (nodes: Node[], nodeId: string) => {
  const totalIds = [nodeId]
  let ids = getChildIds(nodes, [nodeId])
  while (ids.length) {
    totalIds.push(...ids)
    ids = getChildIds(nodes, ids)
  }
  return totalIds
}
const getChildIds = (nodes: Node[], childNodeIds: string[]) => {
  return nodes.filter((n) => childNodeIds.includes(n.data.pid)).map((n) => n.id)
}
export function arrToMap<T, K extends keyof T>(array: Array<T>, property: K) {
  const map = new Map<T[K], T>()
  for (const item of array) {
    map.set(item[property], item)
  }
  return map
}

// 单个维度分组
export const groupBy = (items: any, selector: any) =>
  items.reduce((result: any, item: any) => {
    const key = selector(item)
    if (result[key] === undefined) {
      result[key] = [item]
    } else {
      result[key].push(item)
    }
    return result
  }, {})

// 多个维度分组
export const groupByMulti = (items: any, ...selectors: any) => {
  const head = selectors.length ? selectors[0] : (it: any) => it
  // 这里调用了上面的 groupBy 方法
  const first = groupBy(items, head)
  if (selectors.length < 2) {
    return first
  }
  const [, ...tail] = selectors
  const acc: any = {}
  for (const [k, v] of Object.entries(first)) {
    acc[k] = groupByMulti(v, ...tail)
  }
  return acc
}
