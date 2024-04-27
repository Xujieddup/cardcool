import { PropLink } from "@/types"
import { customAlphabet } from "nanoid"
import { formatDate } from "./date"

// 62 进制字符转换
const base = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const ben = base.length
const baseMap = new Map([
  ["0", 0],
  ["1", 1],
  ["2", 2],
  ["3", 3],
  ["4", 4],
  ["5", 5],
  ["6", 6],
  ["7", 7],
  ["8", 8],
  ["9", 9],
  ["A", 10],
  ["B", 11],
  ["C", 12],
  ["D", 13],
  ["E", 14],
  ["F", 15],
  ["G", 16],
  ["H", 17],
  ["I", 18],
  ["J", 19],
  ["K", 20],
  ["L", 21],
  ["M", 22],
  ["N", 23],
  ["O", 24],
  ["P", 25],
  ["Q", 26],
  ["R", 27],
  ["S", 28],
  ["T", 29],
  ["U", 30],
  ["V", 31],
  ["W", 32],
  ["X", 33],
  ["Y", 34],
  ["Z", 35],
  ["a", 36],
  ["b", 37],
  ["c", 38],
  ["d", 39],
  ["e", 40],
  ["f", 41],
  ["g", 42],
  ["h", 43],
  ["i", 44],
  ["j", 45],
  ["k", 46],
  ["l", 47],
  ["m", 48],
  ["n", 49],
  ["o", 50],
  ["p", 51],
  ["q", 52],
  ["r", 53],
  ["s", 54],
  ["t", 55],
  ["u", 56],
  ["v", 57],
  ["w", 58],
  ["x", 59],
  ["y", 60],
  ["z", 61],
])
const nanoid = customAlphabet(base, 5)
// 基于时间戳(ms)生成唯一字符串(12位)
export const convId = (time: number) => {
  const arr = []
  while (time > 0) {
    arr.push(base[time % ben])
    time = Math.floor(time / ben)
  }
  // 数组反转，因为个位在索引0的位置，应反过来显示
  return arr.reverse().join("") + nanoid()
}

// id
export const unid = () => {
  return convId(Date.now())
}

// 从生成的 id 解析出时间戳
export const parseUnidTime = (id: string) => {
  const arr = id.substring(0, 7).split("").reverse()
  let time = 0
  let v = 1
  arr.forEach((val) => {
    const num = baseMap.get(val) || 0
    time += num * v
    v *= ben
  })
  return time
}

// [id, timestamp(ms)]
export const unidtime = (): [string, number] => {
  const time: number = Date.now()
  return [convId(time), time]
}

// [id, timestamp(ms)]
export const unidtimems = (timestamp?: number): [string, number] => {
  const time: number = timestamp ? timestamp + 1 : Date.now()
  return [convId(time), time]
}

export const getTime = (): number => {
  return Math.floor(Date.now() / 1000)
}

// export const getTimems = (): number => {
//   return Date.now()
// };

// 根据 id 解析日期
export const formatDateById = (id: string): string => {
  return formatDate(parseUnidTime(id))
}

export const formatLinkData = (value: string | PropLink) => {
  if (typeof value === "string") {
    let text = ""
    let link = ""
    if (value) {
      const res = value.match(/^\[(.*?)\]\((.*?)\)$/)
      if (res !== null && res.length === 3) {
        text = res[1]
        link = res[2]
      } else {
        link = value
      }
    }
    return { text, link }
  } else {
    return value
  }
}

export const opacity = (hex: string, opacity: number) => {
  let color = hex.substring(1)
  if (color.length === 8) color = color.substring(0, color.length - 2)
  if (color.length === 3) color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
  color += Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")
  return `#${color}`.toUpperCase()
}
