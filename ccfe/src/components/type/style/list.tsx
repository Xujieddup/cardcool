import React, { ReactNode, memo, useCallback } from "react"
import { Dropdown, MenuProps, theme, Typography } from "antd"
import { EditOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import type { EditStyleName, StyledToken, TypePropStyle } from "@/types"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { IconBtn } from "@/ui"
import { IIcon } from "@/icons"

type Props = {
  styles: TypePropStyle[]
  setStyles: React.Dispatch<React.SetStateAction<TypePropStyle[]>>
  styleId: string
  setStyleId: React.Dispatch<React.SetStateAction<string>>
  setEditStyleName: React.Dispatch<React.SetStateAction<EditStyleName | undefined>>
  copyStyle: (id: string) => void
  deleteStyle: (id: string) => void
}

const subItems: MenuProps["items"] = [
  {
    key: "edit",
    icon: <EditOutlined />,
    label: "重命名",
  },
  {
    key: "copy",
    icon: <IIcon icon="copy" />,
    label: "复制样式",
  },
  {
    type: "divider",
  },
  {
    key: "delete",
    icon: <IIcon icon="delete" />,
    danger: true,
    label: "删除",
  },
]

export const StyleList = memo(
  ({ styles, setStyles, styleId, setStyleId, setEditStyleName, copyStyle, deleteStyle }: Props) => {
    const { token } = theme.useToken()
    const handleClick = useCallback(
      (info: any, id: string, name: string) => {
        info.domEvent.stopPropagation()
        if (id) {
          if (info.key === "edit") {
            setEditStyleName({ id, name })
          } else if (info.key === "copy") {
            copyStyle(id)
          } else if (info.key === "delete") {
            deleteStyle(id)
          }
        }
      },
      [copyStyle, deleteStyle, setEditStyleName]
    )
    // 拖拽排序
    const handleDragEnd = useCallback(
      ({ active, over }: DragEndEvent) => {
        console.log("handleDragEnd", active, over)
        if (over && active.id !== over.id) {
          setStyles((oldStyles) => {
            const oldIndex = oldStyles.findIndex((item) => item.id === active.id)
            const newIndex = oldStyles.findIndex((item) => item.id === over.id)
            if (oldIndex === -1 || newIndex === -1) {
              return oldStyles
            }
            return arrayMove(oldStyles, oldIndex, newIndex)
          })
        }
      },
      [setStyles]
    )
    return (
      <MenuUl token={token}>
        <DndContext
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={styles}>
            {styles.map((item) => (
              <SortItem
                key={"styleItem" + item.id}
                item={item}
                className={item.id === styleId ? "selected" : ""}
                onClick={() => setStyleId(item.id)}
                moreAction={
                  <Dropdown
                    menu={{
                      items: subItems,
                      onClick: (i) => handleClick(i, item.id, item.name),
                    }}
                    trigger={["click"]}
                  >
                    <IconBtn
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      type="text"
                      className="hide"
                      icon={<IIcon icon="more" fontSize={14} />}
                    />
                  </Dropdown>
                }
              />
            ))}
          </SortableContext>
        </DndContext>
      </MenuUl>
    )
  }
)

type ItemProps = {
  item: TypePropStyle
  moreAction: ReactNode
  className: string
  onClick: React.MouseEventHandler<HTMLLIElement>
}

export const SortItem = React.memo(({ item, moreAction, className, onClick }: ItemProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: item.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  // console.log("Render: SortItem")
  return (
    <MenuLi ref={setNodeRef} style={style} className={className} onClick={onClick} {...attributes}>
      <IconBtn
        {...listeners}
        ref={setActivatorNodeRef}
        icon={<IIcon icon="holder" />}
        size="small"
        type="text"
        className="holder"
        style={{ width: 16 }}
      />
      <Typography.Text className="flexPlace" ellipsis>
        {item.name}
      </Typography.Text>
      {moreAction}
    </MenuLi>
  )
})

const MenuUl = styled("ul")(({ token }: StyledToken) => ({
  marginBottom: 0,
  paddingLeft: 0,
  "li:hover": {
    cursor: "pointer",
    backgroundColor: token.colorBgTextHover,
    ".hide": {
      display: "inline-block",
    },
  },
  "li.selected": {
    backgroundColor: token.colorBgTextActive,
    ".hide": {
      display: "inline-block",
    },
  },
}))
const MenuLi = styled("li")({
  listStyle: "none",
  marginBottom: 2,
  display: "flex",
  alignItems: "center",
  padding: "4px 6px",
  borderRadius: 6,
  ".flexPlace": {
    marginLeft: 4,
  },
  ".ant-tag": {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "bottom",
  },
})
