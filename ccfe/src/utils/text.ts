// 计算单行文本宽度
let textEl: HTMLElement | null = null
export const getTextWidth = (text: string): number => {
  if (!textEl) {
    textEl = document.getElementById("text")
    if (!textEl) return 56
  }
  textEl.innerText = text
  return Math.ceil(textEl.getBoundingClientRect().width)
}
