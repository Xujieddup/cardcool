import { presetColors, tagColors } from "./color"

export const getRandColor = (): string => {
  const num = Math.floor(Math.random() * 33)
  return tagColors[num]
}

export const getPresetColor = (): string => {
  const num = Math.floor(Math.random() * 13)
  return presetColors[num]
}
