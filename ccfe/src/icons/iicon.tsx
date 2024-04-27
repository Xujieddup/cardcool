import React from "react"
import cc from "classcat"
import { createFromIconfontCN } from "@ant-design/icons"

const IFont = createFromIconfontCN({
  scriptUrl: [
    "https://at.alicdn.com/t/c/font_3977862_0a74dx6ta4j.js",
    "https://at.alicdn.com/t/c/font_4049691_ux17v2tkn6.js",
  ],
})

type Props = {
  icon?: string
  fontSize?: number
  color?: string
}

export const IIcon: React.FC<Props> = ({ icon, fontSize, color }) => {
  if (!icon) return null
  return icon.substring(0, 2) === "e_" ? (
    <i className={cc(["iicon", "icon", "icon-" + icon])} />
  ) : (
    <IFont type={"icon-" + icon} className="iicon ifont" style={{ fontSize, color }} />
  )
}
