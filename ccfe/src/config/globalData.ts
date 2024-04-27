type DropParam = {
  id: number
  offsetX: number
  offsetY: number
  width: number
  height: number
}
type DataType = {
  // 拖拽新建节点时的参数(onDragOver 中使用)
  dropParam: DropParam
  // 拖拽节点尺寸的节点 id(多个 id 以 _ 分割，比如：页面初时加载时第一次全量更新节点尺寸，触发的二次更新)
  resizingId: string
  // 已经重置尺寸的分组节点，避免再次因 onNodeChange 事件触发 relayout 计算
  resizedGroupIds?: Set<string>
}

const data: DataType = {
  dropParam: { id: 0, offsetX: 0, offsetY: 0, width: 0, height: 0 },
  // 拖拽节点尺寸的节点 id(多个 id 以 _ 分割，比如：页面初时加载时第一次全量更新节点尺寸，触发的二次更新)
  resizingId: "",
  // 已经重置尺寸的节点，避免再次因 onNodeChange 事件触发 relayout 计算
  resizedGroupIds: undefined,
}

export const gd = {
  getDropParam: () => data.dropParam,
  setDropParam: (param: DropParam) => (data.dropParam = param),
  getResizingId: () => data.resizingId,
  setResizingId: (id: string) => (data.resizingId = id),
  getResizedGroupIds: () => data.resizedGroupIds,
  setResizedGroupIds: (ids?: Set<string>) => (data.resizedGroupIds = ids),
}
