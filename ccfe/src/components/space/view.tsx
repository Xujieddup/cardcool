import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { App, Button, Col, Dropdown, Empty, MenuProps, Row, Tooltip, Typography, theme } from "antd"
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled } from "@ant-design/icons"
import type {
  MenuItemClickEventHandler,
  MyDatabase,
  Space,
  SpaceObj,
  SpaceStat,
  StyledToken,
} from "@/types"
import { useModelStore } from "@/store"
import type { GScreenProp, SMSpaceId } from "@/store"
import { CardContainer } from "@/components/ui"
import { SpaceEdit } from "./edit"
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { Item } from "./item"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import { EmptyBox, IText, IconBtn } from "@/ui"
import { createPortal } from "react-dom"
import { IIcon } from "@/icons"
import styled from "@emotion/styled"

const dbSelector: GetDB = (state) => state.db
const selector: SMSpaceId = (state) => state.setMSpaceId
const screenSelector: GScreenProp = (state) => state.screenProp

const items: MenuProps["items"] = [
  {
    key: "edit",
    icon: <EditOutlined />,
    label: "修改空间",
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

let queryHandler: any = null
const spaceStat = new Map<string, SpaceStat>()
const statSpaces = async (db: MyDatabase, spaces: Space[]) => {
  const newSpaces = []
  for (let i = 0; i < spaces.length; i++) {
    const space = spaces[i]
    const stat = spaceStat.get(space.id)
    if (stat) {
      newSpaces.push({ ...space, viewCnt: stat.viewCnt, cardCnt: stat.cardCnt })
    } else {
      const viewCnt = await db.view.getSpaceViewCnt(space.id)
      const cardCnt = await db.card.getSpaceCardCnt(space.id)
      spaceStat.set(space.id, { viewCnt, cardCnt })
      newSpaces.push({ ...space, viewCnt, cardCnt })
    }
  }
  return newSpaces
}

export const SpaceView: React.FC = memo(() => {
  const db = useDBStore(dbSelector)
  // 初始化节点空间
  const [spaces, setSpaces] = React.useState<SpaceObj[]>()
  useEffect(() => {
    db?.space.getSpacesQuery().then((query) => {
      queryHandler = query.$.subscribe((docs) => {
        const ss = docs.map((doc) => doc.toJSON() as Space)
        statSpaces(db, ss).then((newSpaces) => setSpaces(newSpaces))
        console.log("Sub - space update", ss)
      })
    })
    return () => queryHandler?.unsubscribe()
  }, [db])
  // 卡片空间信息编辑弹窗 & 卡片空间属性编辑弹窗
  const setMSpaceId = useModelStore(selector)
  console.log("Render: SpaceView")
  return (
    <CardContainer>
      {spaces &&
        (spaces.length ? (
          <SpaceList db={db} spaces={spaces} setSpaces={setSpaces} />
        ) : (
          <EmptyBox image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无卡片空间">
            <Button onClick={() => setMSpaceId("")} type="primary">
              创建空间
            </Button>
          </EmptyBox>
        ))}
      <SpaceEdit />
    </CardContainer>
  )
})

type SpaceListProp = {
  db: MyDatabase | undefined
  spaces: SpaceObj[]
  setSpaces: React.Dispatch<React.SetStateAction<SpaceObj[] | undefined>>
}
export const SpaceList = memo(({ db, spaces, setSpaces }: SpaceListProp) => {
  const { modal } = App.useApp()
  const { token } = theme.useToken()
  const screenProp = useModelStore(screenSelector)
  const showDeleteConfirm = useCallback(
    (sId: string) => {
      modal.confirm({
        title: "删除卡片空间？",
        icon: <ExclamationCircleFilled />,
        content: "删除卡片空间将清空所有卡片和视图！请慎重操作！",
        okText: "确认",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          db?.space.deleteSpace(sId).then(() => {
            console.log("删除卡片空间成功")
          })
        },
      })
    },
    [db?.space, modal]
  )
  // 卡片空间信息编辑弹窗 & 卡片空间属性编辑弹窗
  const setMSpaceId = useModelStore(selector)
  const handleClick = useCallback<MenuItemClickEventHandler>(
    ({ key }, spaceId) => {
      if (spaceId) {
        if (key === "edit") {
          setMSpaceId(spaceId)
        } else if (key === "delete") {
          showDeleteConfirm(spaceId)
        }
      }
    },
    [setMSpaceId, showDeleteConfirm]
  )
  const [activeId, setActiveId] = useState<string>()
  const activeItem = useMemo(
    () => (activeId ? spaces.find((s) => s.id === activeId) : undefined),
    [spaces, activeId]
  )
  // 拖拽排序
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      console.log("handleDragEnd", active, over)
      if (over && active.id !== over.id && spaces) {
        const currId = active.id as string
        const oldIndex = spaces.findIndex((space) => space.id === currId)
        if (oldIndex === -1) {
          return
        }
        const newIndex = spaces.findIndex((space) => space.id === over.id)
        // 移动后的列表
        const newSpaces = arrayMove(spaces, oldIndex, newIndex)
        // 需要变更的数据
        const nodeMap: Map<string, number> = new Map()
        const idx = newSpaces.findIndex((i) => i.id === currId)
        // 判断新位置的前一个节点
        const prevItem = idx <= 0 ? undefined : newSpaces[idx - 1]
        const nextItem = idx >= newSpaces.length ? undefined : newSpaces[idx + 1]
        if (newSpaces.length === 1) {
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
              newSpaces.forEach((i, index) => {
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
              newSpaces.forEach((i, index) => {
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
        setSpaces?.(newSpaces)
        db?.space.batchUpdateSorts(nodeMap)
      }
    },
    [db?.space, setSpaces, spaces]
  )
  console.log("Render: SpaceList")
  return (
    <DndContext
      onDragStart={({ active }) => {
        active && setActiveId(active.id as string)
      }}
      onDragCancel={() => setActiveId(undefined)}
      onDragEnd={handleDragEnd}
    >
      <Row gutter={[16, 16]}>
        <SortableContext items={spaces}>
          {spaces.map((space) => (
            <Col key={"space_" + space.id} {...screenProp}>
              <Item
                space={space}
                title={
                  <BgIconTextBox ellipsis token={token}>
                    <span className="bgIcon">
                      <IIcon icon={space.icon} />
                    </span>
                    {space.name}
                  </BgIconTextBox>
                }
                actions={[
                  <Tooltip title={space.viewCnt + " 个视图"} placement="bottom" key="views">
                    <IText type="secondary">
                      <IIcon icon="board" />
                      {space.viewCnt}
                    </IText>
                  </Tooltip>,
                  <Tooltip title={space.cardCnt + " 张卡片"} placement="bottom" key="cards">
                    <IText type="secondary">
                      <IIcon icon="card" />
                      {space.cardCnt}
                    </IText>
                  </Tooltip>,
                  <Dropdown
                    menu={{
                      items,
                      onClick: (i) => handleClick(i, space.id),
                    }}
                    trigger={["click"]}
                    key="more"
                  >
                    <IconBtn
                      className="cardActBtn"
                      icon={<IIcon icon="more" />}
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
            <Item
              space={activeItem}
              title={
                <BgIconTextBox ellipsis token={token}>
                  <span className="bgIcon">
                    <IIcon icon={activeItem.icon} />
                  </span>
                  {activeItem.name}
                </BgIconTextBox>
              }
              isDragOverlay
              actions={[
                <Tooltip title={activeItem.viewCnt + " 个视图"} placement="bottom" key="views">
                  <IText type="secondary">
                    <IIcon icon="board" />
                    {activeItem.viewCnt}
                  </IText>
                </Tooltip>,
                <Tooltip title={activeItem.cardCnt + " 张卡片"} placement="bottom" key="cards">
                  <IText type="secondary">
                    <IIcon icon="card" />
                    {activeItem.cardCnt}
                  </IText>
                </Tooltip>,
                <Dropdown menu={{ items }} trigger={["click"]} key="more">
                  <IconBtn
                    className="cardActBtn"
                    icon={<IIcon icon="more" />}
                    size="small"
                    type="text"
                  />
                </Dropdown>,
              ]}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
})

const BgIconTextBox = styled(Typography.Text)(({ token }: StyledToken) => ({
  position: "relative",
  paddingLeft: 30,
  lineHeight: "24px",
  ".bgIcon": {
    display: "inline-block",
    backgroundColor: token.colorPrimary,
    color: token.colorBgContainer,
    borderRadius: 4,
    lineHeight: 1,
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
    padding: 3,
    ".ifont": {
      fontSize: 18,
    },
  },
}))
