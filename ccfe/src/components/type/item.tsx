import React, { CSSProperties, ReactNode, useMemo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Typography } from "antd"
import type { TypeItemObj } from "@/types"
import { IconBtn } from "@/ui"
import { CardItem } from "../ui"
import { IIcon } from "@/icons"

type Props = {
  type: TypeItemObj
  title: ReactNode
  actions?: ReactNode[]
  isDragOverlay?: boolean
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>
}

export const TypeItem = React.memo(
  ({ type, title, actions, onDoubleClick, isDragOverlay = false }: Props) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: type.id,
    })
    const style: CSSProperties = useMemo(
      () => ({
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
        boxShadow: isDragOverlay
          ? "-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
          : undefined,
      }),
      [isDragOverlay, isDragging, transform, transition]
    )
    // console.log("Type - item: render");
    return (
      <CardItem
        ref={setNodeRef}
        {...attributes}
        style={style}
        title={title}
        onDoubleClick={onDoubleClick}
        hoverable
        size="small"
        extra={
          <IconBtn
            {...listeners}
            ref={setActivatorNodeRef}
            icon={<IIcon icon="holder" />}
            size="small"
            type="text"
            className="hide"
          />
        }
        actions={actions}
      >
        <Typography.Paragraph type="secondary" ellipsis={{ rows: 3 }}>
          {type.desc || "暂无卡片模板简介..."}
        </Typography.Paragraph>
      </CardItem>
    )
  }
)
