import React, { memo } from "react"
import { Position } from "@/reactflow/core"
import { Handle } from "@/reactflow"
import { IIcon } from "@/icons"

type Props = {
  pos: Position
  id: string
}

export const BaseHandle = memo(({ pos, id }: Props) => {
  return (
    <Handle type="source" id={id} position={pos}>
      {/* 这儿必须加上 source 才能够触发拖拽连线 */}
      <div className="handleAnchor source colorPrimary">
        <div className="anchorPointer bgPrimary" />
        <IIcon icon="arrow" fontSize={20} />
      </div>
    </Handle>
  )
})
