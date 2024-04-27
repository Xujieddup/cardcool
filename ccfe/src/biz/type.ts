// 计算卡片内容的高度
export const calcContentHight = (
  layouts: ReactGridLayout.Layout[],
  includeNewProp?: boolean
): [number, number] => {
  // 被占用了高度的索引，从 0 开始
  const set = new Set<number>()
  let contentHeight = 0
  layouts.forEach((l) => {
    if (l.i === "content") {
      contentHeight = l.h
    } else if (l.i !== "new_prop" || includeNewProp) {
      for (let i = 0; i < l.h; i++) {
        set.add(l.y + i)
      }
    }
  })
  return [contentHeight, set.size >= 8 ? 4 : 12 - set.size]
}
