import type { FlattenedItem, ViewItem } from "@/types"
import { arrayMove } from "@dnd-kit/sortable"
export const iOS = /iPad|iPhone|iPod/.test(navigator.platform)

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth)
}

export function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId)
  const activeItemIndex = items.findIndex(({ id }) => id === activeId)
  const activeItem = items[activeItemIndex]
  const newItems = arrayMove(items, activeItemIndex, overItemIndex)
  const previousItem = newItems[overItemIndex - 1]
  const nextItem = newItems[overItemIndex + 1]
  const dragDepth = getDragDepth(dragOffset, indentationWidth)
  const projectedDepth = activeItem.depth + dragDepth
  const maxDepth = getMaxDepth({ previousItem })
  const minDepth = getMinDepth({ nextItem })
  let depth = projectedDepth

  if (projectedDepth >= maxDepth) {
    depth = maxDepth
  } else if (projectedDepth < minDepth) {
    depth = minDepth
  }

  return { depth, maxDepth, minDepth, pid: getParentId() }

  function getParentId() {
    // 深度为 0，或者移动到第一个
    if (depth === 0 || !previousItem) {
      return ""
    }
    if (depth === previousItem.depth) {
      return previousItem.pid
    }
    if (depth > previousItem.depth) {
      return previousItem.id
    }
    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.pid
    return newParent ?? ""
  }
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  if (previousItem) {
    return previousItem.depth + 1
  }
  return 0
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth
  }
  return 0
}

// 将原始数组转换成树形结构
// const convTree = (arr: ViewItem[], id: string) => {
//   const res: ViewItem[] = []
//   for (const item of arr) {
//     if (item.pid === id) {
//       res.push({ ...item, children: convTree(arr, item.id) })
//     }
//   }
//   return res
// }
// 将原始数据转换成层级数组
export const convertData = (items: ViewItem[]) => {
  const tree = arrayToTreeMap(items)
  return flattenTree(tree)
}

export const parseTreePath = (
  views: ViewItem[],
  viewId: string,
  pids: string[]
): string[] | undefined => {
  for (let i = 0; i < views.length; i++) {
    const hasChild = views[i].children.length > 0
    const tmpPids = hasChild ? [...pids, views[i].id] : [...pids]
    if (views[i].id == viewId) {
      return tmpPids
    } else if (hasChild) {
      const reuslt = parseTreePath(views[i].children, viewId, tmpPids)
      if (reuslt) return reuslt
    }
  }
}

// 树形结构转数组
function flatten(items: ViewItem[], depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [...acc, { ...item, depth, index }, ...flatten(item.children, depth + 1)]
  }, [])
}
export function flattenTree(items: ViewItem[]): FlattenedItem[] {
  return flatten(items)
}

function arrayToTreeMap(nodes: ViewItem[]) {
  const map = new Map(nodes.map((node) => [node.id, node]))
  const tree = []
  for (const node of nodes) {
    if (node.pid === "") {
      tree.push(node)
    } else {
      map.get(node.pid)?.children.push(node)
    }
  }
  return tree
}

// 数组转树形结构
export function findItem(items: ViewItem[], itemId: string) {
  return items.find(({ id }) => id === itemId)
}

// 递归从树形结构中查找元素
export function findItemDeep(items: ViewItem[], itemId: string): ViewItem | undefined {
  for (const item of items) {
    const { id, children } = item
    if (id === itemId) {
      return item
    }
    if (children.length) {
      const child = findItemDeep(children, itemId)
      if (child) {
        return child
      }
    }
  }
  return undefined
}

// 递归从树形结构中返回删除元素后的树形结构
export function removeItem(items: ViewItem[], id: string) {
  const newItems = []
  for (const item of items) {
    if (item.id === id) {
      continue
    }
    if (item.children.length) {
      item.children = removeItem(item.children, id)
    }
    newItems.push(item)
  }
  return newItems
}

export function setProperty<T extends keyof ViewItem>(
  items: ViewItem[],
  id: string,
  property: T,
  setter: (value: ViewItem[T]) => ViewItem[T]
) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property])
      continue
    }
    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter)
    }
  }
  return [...items]
}

function countChildren(items: ViewItem[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1)
    }
    return acc + 1
  }, count)
}

export function getChildCount(items: ViewItem[], id: string) {
  const item = findItemDeep(items, id)
  return item ? countChildren(item.children) : 0
}

export function removeChildrenOf(items: FlattenedItem[], ids: string[]) {
  const excludeParentIds = [...ids]
  return items.filter((item) => {
    if (item.pid && excludeParentIds.includes(item.pid)) {
      if (item.children.length) {
        excludeParentIds.push(item.id)
      }
      return false
    }
    return true
  })
}
