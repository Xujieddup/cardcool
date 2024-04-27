import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { App, Button, Col, Empty, MenuProps, Tooltip } from "antd"
import { Dropdown, Row } from "antd"
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from "@ant-design/icons"
import { MyDatabase, NodeType, NodeTypeObj, NodeTypeProp, TypeItemObj } from "@/types"
import { TypeEdit } from "./edit"
import { useModelStore } from "@/store"
import type { GScreenProp, SMTypeId, UseMTypeAndPropId } from "@/store"
import { IIcon } from "@/icons"
import { shallow } from "zustand/shallow"
import { CardContainer } from "@/components/ui"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import { EmptyBox, IText, IconBtn } from "@/ui"
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { TypeItem } from "./item"
import { TypePanel } from "./panel"

const dbSelector: GetDB = (state) => state.db

const mTypeSelector: SMTypeId = (state) => state.setMTypeId
const selector: UseMTypeAndPropId = (state) => [state.setMTypeId, state.setMTPropTypeId]
const screenSelector: GScreenProp = (state) => state.screenProp

let queryHandler: any = null

const items: MenuProps["items"] = [
  {
    key: "edit",
    icon: <EditOutlined />,
    label: "修改信息",
  },
  {
    type: "divider",
  },
  {
    key: "delete",
    icon: <DeleteOutlined />,
    danger: true,
    label: "删除",
  },
]
const typeStat = new Map<string, number>()
const statTypes = async (db: MyDatabase, types: NodeTypeObj[]) => {
  const newTypes = []
  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    if (typeStat.has(type.id)) {
      newTypes.push({ ...type, cardCnt: typeStat.get(type.id) })
    } else {
      const cardCnt = await db.card.getTypeCardCnt(type.id)
      typeStat.set(type.id, cardCnt)
      newTypes.push({ ...type, cardCnt })
    }
  }
  return newTypes
}

export const TypeView: React.FC = () => {
  const db = useDBStore(dbSelector)
  const setMTypeId = useModelStore(mTypeSelector)
  // 获取所有卡片列表
  const [types, setTypes] = useState<TypeItemObj[]>()
  useEffect(() => {
    db?.type.getTypesQuery().then((query) => {
      queryHandler = query.$.subscribe((allTypeDocs) => {
        const types = allTypeDocs.map((typeDoc) => {
          const type = typeDoc.toJSON() as NodeType
          const props = type.props ? (JSON.parse(type.props) as NodeTypeProp[]) : []
          return {
            id: type.id,
            name: type.name,
            icon: type.icon,
            snum: type.snum,
            props: props,
            desc: type.desc,
          } as NodeTypeObj
        })
        statTypes(db, types).then((nts) => setTypes(nts))
      })
    })
    return () => queryHandler?.unsubscribe()
  }, [db])
  console.log("Render: TypeView")
  return (
    <CardContainer>
      {types &&
        (types.length ? (
          <TypeList db={db} types={types} setTypes={setTypes} />
        ) : (
          <EmptyBox image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无卡片模板">
            <Button onClick={() => setMTypeId("")} type="primary">
              新增模板
            </Button>
          </EmptyBox>
        ))}
      <TypeEdit />
      <TypePanel />
    </CardContainer>
  )
}

type TypeListProp = {
  db: MyDatabase | undefined
  types: TypeItemObj[]
  setTypes: React.Dispatch<React.SetStateAction<TypeItemObj[] | undefined>>
}
export const TypeList = memo(({ db, types, setTypes }: TypeListProp) => {
  const { modal } = App.useApp()
  const showDeleteConfirm = useCallback(
    (tId: string) => {
      modal.confirm({
        title: "删除卡片模板？",
        icon: <ExclamationCircleFilled />,
        content: "一经删除，所有属于该模板的卡片将丢失其模板属性！请慎重操作！",
        okText: "确认",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          db?.type.deleteType(tId).then(() => {
            console.log("删除卡片模板成功")
          })
        },
      })
    },
    [db?.type, modal]
  )
  // 卡片模板信息编辑弹窗 & 卡片模板属性编辑弹窗
  const [setMTypeId, setMTPropTypeId] = useModelStore(selector, shallow)
  const screenProp = useModelStore(screenSelector)
  const handleClick = useCallback(
    ({ key }: { key: string }, typeId: string) => {
      if (typeId) {
        if (key === "edit") {
          setMTypeId(typeId)
        } else if (key === "delete") {
          showDeleteConfirm(typeId)
        }
      }
    },
    [setMTypeId, showDeleteConfirm]
  )
  const [activeId, setActiveId] = useState<string>()
  const activeItem = useMemo(
    () => (activeId ? types.find((s) => s.id === activeId) : undefined),
    [types, activeId]
  )
  // 拖拽排序
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      console.log("handleDragEnd", active, over)
      if (over && active.id !== over.id && types) {
        const currId = active.id as string
        const oldIndex = types.findIndex((space) => space.id === currId)
        if (oldIndex === -1) {
          return
        }
        const newIndex = types.findIndex((space) => space.id === over.id)
        // 移动后的列表
        const newTypes = arrayMove(types, oldIndex, newIndex)
        // 需要变更的数据
        const nodeMap: Map<string, number> = new Map()
        const idx = newTypes.findIndex((i) => i.id === currId)
        // 判断新位置的前一个节点
        const prevItem = idx <= 0 ? undefined : newTypes[idx - 1]
        const nextItem = idx >= newTypes.length ? undefined : newTypes[idx + 1]
        if (newTypes.length === 1) {
          // 只有一个节点，则 snum 置为 10000
          nodeMap.set(currId, 10000)
        } else {
          if (!prevItem) {
            // 移动到第一个位置，则判断第二个位置的节点的 snum 是否大于 0
            if (nextItem && nextItem.snum > 1) {
              // 只需更新当前节点的 snum
              nodeMap.set(currId, Math.floor(nextItem.snum / 2))
            } else {
              // 当前节点的 snum 置为 10000，后面的节点依次叠加 10000
              let snum = 10000
              nodeMap.set(currId, snum)
              newTypes.forEach((i, index) => {
                if (index > idx) {
                  snum += 10000
                  nodeMap.set(i.id, snum)
                }
              })
            }
          } else if (!nextItem) {
            // 移动到最后一个位置，则在前一个位置的节点的 snum + 10000
            nodeMap.set(currId, prevItem.snum + 10000)
          } else {
            // 移动到中间位置，则计算前后位置节点的 snum 的平均值
            const middleSnum = Math.floor((prevItem.snum + nextItem.snum) / 2)
            // 中间值如果和前一个值相等，则在前一个值的基础上，依次叠加 10000
            if (middleSnum === prevItem.snum) {
              let snum = middleSnum + 10000
              nodeMap.set(currId, snum)
              newTypes.forEach((i, index) => {
                if (index > idx) {
                  snum += 10000
                  nodeMap.set(i.id, snum)
                }
              })
            } else {
              // 否则直接应用中间值
              nodeMap.set(currId, middleSnum)
            }
          }
        }
        setActiveId(undefined)
        setTypes?.(newTypes)
        db?.type.batchUpdateSorts(nodeMap)
      }
    },
    [db?.type, setTypes, types]
  )
  console.log("Render: TypeList")
  return (
    <DndContext
      onDragStart={({ active }) => {
        active && setActiveId(active.id as string)
      }}
      onDragCancel={() => setActiveId(undefined)}
      onDragEnd={handleDragEnd}
    >
      <Row gutter={[16, 16]}>
        <SortableContext items={types}>
          {types.map((t) => (
            <Col key={"type_" + t.id} {...screenProp}>
              <TypeItem
                type={t}
                title={
                  <IText ellipsis>
                    <IIcon icon="dup" />
                    {t.name}
                  </IText>
                }
                onDoubleClick={() => setMTPropTypeId(t.id)}
                actions={[
                  <Tooltip title={t.cardCnt + " 张卡片"} placement="bottom" key="cards">
                    <IText type="secondary">
                      <IIcon icon="card" />
                      {t.cardCnt}
                    </IText>
                  </Tooltip>,
                  <Tooltip title="编辑模板" placement="bottom" key="edit">
                    <IconBtn
                      onClick={() => setMTPropTypeId(t.id)}
                      type="text"
                      size="small"
                      icon={<IIcon icon="edit" />}
                      className="cardActBtn"
                    />
                  </Tooltip>,
                  <Dropdown
                    menu={{ items, onClick: (i) => handleClick(i, t.id) }}
                    trigger={["click"]}
                    key="more"
                  >
                    <IconBtn
                      icon={<IIcon icon="more" />}
                      className="cardActBtn"
                      size="small"
                      type="text"
                    />
                  </Dropdown>,
                ]}
              />
            </Col>
          ))}
        </SortableContext>
      </Row>
      {createPortal(
        <DragOverlay>
          {activeItem && (
            <TypeItem
              type={activeItem}
              title={
                <IText ellipsis>
                  <IIcon icon="dup" />
                  {activeItem.name}
                </IText>
              }
              isDragOverlay
              actions={[
                <IText key="cards" type="secondary">
                  <IIcon icon="card" />
                  {activeItem.cardCnt}
                </IText>,
                <IconBtn
                  key="edit"
                  type="text"
                  size="small"
                  icon={<IIcon icon="edit" />}
                  className="cardActBtn"
                />,
                <IconBtn
                  key="more"
                  icon={<IIcon icon="more" />}
                  className="cardActBtn"
                  size="small"
                  type="text"
                />,
              ]}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
})
