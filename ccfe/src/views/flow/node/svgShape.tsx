import React, { CSSProperties, ReactNode } from "react"
import styled from "@emotion/styled"

type Props = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}
export const SvgShapeBase = ({ children, className, style, ...props }: Props) => {
  return (
    <SvgShapeBox {...props} className={className} style={style}>
      {children}
    </SvgShapeBox>
  )
}
const SvgShapeBox = styled("div")({
  position: "relative",
  svg: {
    display: "inline-block",
    width: "100%",
    height: "100%",
  },
})
