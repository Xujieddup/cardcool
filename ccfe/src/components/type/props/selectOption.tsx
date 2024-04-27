import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { App, Button, Input, InputRef, Popover, Tag, theme, Typography } from "antd"
import { DeleteOutlined, EditOutlined, EnterOutlined } from "@ant-design/icons"
import styled from "@emotion/styled"
import { ColorPicker } from "@/components/color"
import { unid } from "@/utils"
import { SelectOpt, StyledToken } from "@/types"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { IconBtn } from "@/ui"
import { IIcon } from "@/icons"
import { GetColors, useConfigStore } from "@/store"
import { getRandColor } from "@/config"

const colorsSelector: GetColors = (state) => state.colors

type AddOptProps = {
  addOption: (opt: SelectOpt) => void
}

const AddOpt: React.FC<AddOptProps> = memo(({ addOption }: AddOptProps) => {
  const { message } = App.useApp()
  const [colorType, setColorType] = useState<string>(() => getRandColor())
  const inputRef = useRef<InputRef>(null)
  // 添加 item
  const addItem = useCallback(() => {
    if (!inputRef.current?.input?.value) {
      message.error("请输入选项名称")
      return
    }
    const newLabel = inputRef.current?.input?.value || ""
    addOption({
      id: unid(),
      label: newLabel,
      color: colorType,
    })
    setColorType(getRandColor())
    const clearBtn = document.getElementsByClassName("ant-input-clear-icon")[0] as HTMLButtonElement
    clearBtn?.click()
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [addOption, colorType, message])
  return (
    <Input
      placeholder="新增选项"
      ref={inputRef}
      allowClear
      onPressEnter={addItem}
      style={{ padding: "3px 6px" }}
      prefix={<ColorPicker colorType={colorType} setColorType={setColorType} />}
      suffix={<Button onClick={addItem} type="text" size="small" icon={<EnterOutlined />} />}
    />
  )
})

type EditOptProps = {
  option: SelectOptItem
  updateOption: (opt: SelectOpt) => void
}

const EditOpt: React.FC<EditOptProps> = memo(({ option, updateOption }: EditOptProps) => {
  const [opt, setOpt] = useState<SelectOpt>(option)
  const { message } = App.useApp()
  useEffect(() => {
    setOpt(option)
  }, [option])
  const handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpt((o) => ({ ...o, label: e.target.value }))
  }
  const handleChangeColor = (newColor: string) => {
    setOpt((o) => ({ ...o, color: newColor }))
  }
  // 更新选项
  const updateOpt = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (!opt.label) {
        message.error("请输入选项名称")
        return
      }
      updateOption(opt)
    },
    [message, opt, updateOption]
  )
  return (
    <Input
      placeholder="选项名称"
      value={opt.label}
      onPressEnter={updateOpt}
      onChange={handleChangeLabel}
      style={{ padding: "3px 6px", marginBottom: 2 }}
      prefix={<ColorPicker colorType={opt.color} setColorType={handleChangeColor} />}
      suffix={<Button onClick={updateOpt} type="text" size="small" icon={<EnterOutlined />} />}
    />
  )
})

type SelectOptionProps = {
  value?: SelectOpt[]
  onChange?: (value: SelectOpt[]) => void
}
type SelectOptItem = SelectOpt & { c: string }

export const SelectOption: React.FC<SelectOptionProps> = memo(
  ({ value, onChange }: SelectOptionProps) => {
    // console.log("SelectOption", items)
    const colors = useConfigStore(colorsSelector)
    const items: SelectOptItem[] = useMemo(
      () => value?.map((v) => ({ ...v, c: colors.get(v.color)?.bg || v.color })) || [],
      [colors, value]
    )
    const [editId, setEditId] = useState<string | undefined>()
    const addOption = useCallback(
      (opt: SelectOpt) => {
        onChange?.([...items, opt])
      },
      [items, onChange]
    )
    const updateOption = useCallback(
      (opt: SelectOpt) => {
        onChange?.(items.map((i) => (i.id === opt.id ? opt : i)))
        setEditId(undefined)
      },
      [items, onChange]
    )
    const handleDeleteOpt = useCallback(
      (id: string) => {
        onChange?.(items.filter((i) => i.id !== id))
      },
      [items, onChange]
    )
    // 拖拽排序
    const handleDragEnd = useCallback(
      ({ active, over }: DragEndEvent) => {
        console.log("handleDragEnd", active, over)
        if (over && active.id !== over.id) {
          const oldIndex = items.findIndex((item) => item.id === active.id)
          const newIndex = items.findIndex((item) => item.id === over.id)
          if (oldIndex === -1 || newIndex === -1) {
            return
          }
          onChange?.(arrayMove(items, oldIndex, newIndex))
        }
      },
      [items, onChange]
    )
    // 样式
    const { token } = theme.useToken()
    return (
      <Popover
        trigger={["click"]}
        placement="bottomLeft"
        arrow={false}
        overlayInnerStyle={{ padding: 0, width: 209 }}
        content={
          <MenuUl token={token}>
            <DndContext
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext items={items}>
                {items.map((item) =>
                  item.id === editId ? (
                    <EditOpt
                      key={"optItemEdit" + item.id}
                      option={item}
                      updateOption={updateOption}
                    />
                  ) : (
                    <OptSortItem
                      key={"optItem" + item.id}
                      item={item}
                      setEditId={setEditId}
                      handleDeleteOpt={handleDeleteOpt}
                    />
                  )
                )}
              </SortableContext>
            </DndContext>
            <AddOpt addOption={addOption} />
          </MenuUl>
        }
      >
        <OptionShowBtn block>
          <OptionBox type="secondary">
            {items.length > 0
              ? items.map((item) => (
                  <Tag key={"optItem" + item.id} color={item.c}>
                    {item.label}
                  </Tag>
                ))
              : "点击创建选项"}
          </OptionBox>
        </OptionShowBtn>
      </Popover>
    )
  }
)

type SortItemProps = {
  item: SelectOptItem
  setEditId: React.Dispatch<React.SetStateAction<string | undefined>>
  handleDeleteOpt: (id: string) => void
}

export const OptSortItem = React.memo(({ item, setEditId, handleDeleteOpt }: SortItemProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({
      id: item.id,
    })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  console.log("Render: OptSortItem")
  return (
    <MenuLi key={"optItem" + item.id} ref={setNodeRef} style={style} {...attributes}>
      <IconBtn
        {...listeners}
        ref={setActivatorNodeRef}
        icon={<IIcon icon="holder" />}
        size="small"
        type="text"
        className="holder"
        style={{ width: 16 }}
      />
      <div className="flexPlace">
        <Tag color={item.c}>{item.label}</Tag>
      </div>
      <Button
        onClick={(e: any) => {
          e.stopPropagation()
          setEditId(item.id)
        }}
        size="small"
        type="text"
        icon={<EditOutlined className="smallIcon" />}
      />
      <Button
        size="small"
        type="text"
        onClick={(e: any) => {
          e.stopPropagation()
          handleDeleteOpt(item.id)
        }}
        icon={<DeleteOutlined className="smallIcon" />}
      />
    </MenuLi>
  )
})

const MenuUl = styled("ul")(({ token }: StyledToken) => ({
  marginBottom: 0,
  padding: "8px 8px",
  "li:hover": {
    backgroundColor: token.colorBgTextHover,
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
    margin: "0 6px",
    overflow: "hidden",
  },
  ".ant-tag": {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "bottom",
  },
})

const OptionShowBtn = styled(Button)({
  padding: "4px 6px",
  textAlign: "left",
  ".ant-tag": {
    marginRight: 4,
    verticalAlign: "bottom",
  },
})
const OptionBox = styled(Typography.Paragraph)({
  overflowX: "hidden",
  "&.ant-typography": {
    marginBottom: 0,
  },
})
