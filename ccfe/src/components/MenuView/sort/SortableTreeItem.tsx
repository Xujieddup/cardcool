import React, { CSSProperties } from "react"
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TreeItem, Props as TreeItemProps } from "./TreeItem"

interface Props extends TreeItemProps {
  id: string
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true

export function SortableTreeItem({ id, depth, ...props }: Props) {
  const {
    attributes,
    isDragging,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }
  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      isDragging={isDragging}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  )
}
