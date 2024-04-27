import React, { CSSProperties, ReactNode, useCallback, useMemo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Typography } from "antd"
import type { SpaceObj } from "@/types"
import { IconBtn } from "@/ui"
import { useHistory } from "react-router-dom"
import { CardItem } from "../ui"
import { IIcon } from "@/icons"

type Props = {
  space: SpaceObj
  title: ReactNode
  actions?: ReactNode[]
  isDragOverlay?: boolean
}

export const Item: React.FC<Props> = React.memo(
  ({ space, title, actions, isDragOverlay = false }: Props) => {
    const history = useHistory()
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: space.id,
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
    const jumpSpace = useCallback(
      (spaceId: string) => {
        spaceId && history.push("/" + spaceId)
      },
      [history]
    )
    // console.log("Space - item: render");
    return (
      <CardItem
        ref={setNodeRef}
        {...attributes}
        style={style}
        title={title}
        hoverable
        size="small"
        onDoubleClick={() => jumpSpace(space.id)}
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
          {space.desc || "暂无空间简介..."}
        </Typography.Paragraph>
      </CardItem>
    )
  }
)
