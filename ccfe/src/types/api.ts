import { CardObj } from "./po"

export type ShareInfo = {
  uuid: string
  status: number
  viewId: string
  updateTime: number
}

export type ShareContent = {
  cards: CardObj[]
}

export type ShareData = {
  uuid: string
  viewId: string
  name: string
  type: number
  icon: string
  status: number
  content: ShareContent
  updateTime: number
}

export type ClientInfo = {
  version: string
  baidu: string
  kuake: string
}
