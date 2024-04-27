import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { FlattenedItem, StyledToken, ViewItem } from "@/types"
import { App, MenuProps } from "antd"
import { Dropdown, theme } from "antd"
import { IIcon } from "@/icons"
import { EditOutlined, ExclamationCircleFilled } from "@ant-design/icons"
import styled from "@emotion/styled"
import { ViewEdit } from "./edit"
import { useModelStore, useDBStore } from "@/store"
import type { UseByMenu, GetDB, SViewOp } from "@/store"
import { IFlexR } from "@/ui"
import cc from "classcat"
import { IText, IconBtn } from "@/ui"
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  getProjection,
  getChildCount,
  removeChildrenOf,
  SortableTreeItem,
  convertData,
  parseTreePath,
} from "./sort"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import { shallow } from "zustand/shallow"
import { deleteView } from "@/datasource"
import { OpEnum, SpecialViewEnum, ViewInlineType, ViewTypeEnum } from "@/enums"
import { SimpleItem } from "./sort/TreeItem"

const dbSelector: GetDB = (state) => state.db
const viewOpSelector: SViewOp = (state) => state.setViewOp
const mselector: UseByMenu = (state) => [
  state.menuRefreshVal,
  state.refreshMenu,
  state.setMEditView,
]

type Props = {
  spaceId: string
  viewId: string
}
type ViewItemData = ViewItem & { inline_type: ViewInlineType; update_time: number }

const subItems: MenuProps["items"] = [
  {
    key: "add",
    icon: <IIcon icon="plus" />,
    label: "新建视图",
  },
  {
    key: "edit",
    icon: <EditOutlined />,
    label: "编辑视图",
  },
  {
    key: "favor",
    icon: <IIcon icon="favor" />,
    label: "标记",
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
const subItems2: MenuProps["items"] = [
  {
    key: "add",
    icon: <IIcon icon="plus" />,
    label: "新建视图",
  },
  {
    key: "edit",
    icon: <EditOutlined />,
    label: "编辑视图",
  },
  {
    key: "unfavor",
    icon: <IIcon icon="favorfill" />,
    label: "取消标记",
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
const subItems3: MenuProps["items"] = [
  {
    key: "edit",
    icon: <EditOutlined />,
    label: "编辑视图",
  },
  {
    key: "unfavor",
    icon: <IIcon icon="favorfill" />,
    label: "取消标记",
  },
]
const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

// 数据库中最顶级的视图集的 ID，以此将菜单转换成树形结构
const TOP_VIEW_ID = ""
const indentationWidth = 14
export const MenuList: React.FC<Props> = ({ spaceId, viewId }) => {
  const history = useHistory()
  const { token } = theme.useToken()
  const { modal, message } = App.useApp()
  const db = useDBStore(dbSelector)
  const setViewOp = useDBStore(viewOpSelector)
  const [menuRefreshVal, refreshMenu, setMEditView] = useModelStore(mselector, shallow)
  const cacheParam = useRef({ spaceId: "", viewId, refreshTime: 0 })
  const [expands, setExpands] = useState<string[]>([SpecialViewEnum.STARS])
  // 转换之后的菜单项数组，可按 depth 缩进样式
  const [items, setItems] = useState<FlattenedItem[]>()
  // 收藏视图列表
  const [stars, setStars] = useState<ViewItem[]>([])
  const selectedCards = viewId === SpecialViewEnum.CARDS
  const selectedViews = viewId === SpecialViewEnum.VIEWS
  const selectedTypes = viewId === SpecialViewEnum.TYPES
  const selectedTags = viewId === SpecialViewEnum.TAGS
  const selectedStars = viewId === SpecialViewEnum.STARS
  const expandedStar = expands.some((item) => item === SpecialViewEnum.STARS)
  const starViews = useMemo(() => (expandedStar ? stars : []), [expandedStar, stars])
  // 当前拖拽的元素 id
  const [activeId, setActiveId] = useState<string | null>(null)
  // 拖拽停止的元素 id
  const [overId, setOverId] = useState<string | null>(null)
  // 拖拽时沿水平方向移动的相对距离，正数表示右移，负数表示左溢
  const [offsetLeft, setOffsetLeft] = useState(0)
  // 过滤掉被折叠的元素之后的菜单数组
  const flattenedItems = useMemo(() => {
    if (items === undefined || !expands.some((i) => i === "")) return []
    // 遍历数组，筛选出所有折叠的目录的 id
    const collapsedItems = items.reduce<string[]>(
      (acc, { children, id }) =>
        children.length && !expands.some((i) => i === id) ? [...acc, id] : acc,
      []
    )
    return removeChildrenOf(items, activeId ? [activeId, ...collapsedItems] : collapsedItems)
  }, [items, activeId, expands])
  const projected =
    activeId && overId
      ? getProjection(flattenedItems, activeId, overId, offsetLeft, indentationWidth)
      : null
  const sensors = useSensors(useSensor(PointerSensor))
  const sortedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems])
  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null
  const handleJump = useCallback(
    (viewId: string) => {
      history.push("/" + spaceId + "/" + viewId)
    },
    [history, spaceId]
  )
  // 初始化查询视图列表
  useEffect(() => {
    // console.log("useEffect", spaceId, viewId, menuRefreshVal, cacheParam.current)
    // 场景匹配
    const { spaceId: sid, viewId: vid, refreshTime: rtime } = cacheParam.current
    // 更新参数缓存
    cacheParam.current = { spaceId, viewId, refreshTime: menuRefreshVal.time }
    // 页面刷新之后的第一次加载，以及切换空间之后，均需初始化菜单项和展开项
    if (spaceId !== sid) {
      db?.view.getAll(spaceId).then((vs) => {
        const allViews: ViewItemData[] = vs.map((v) => ({
          id: v.id,
          name: v.name || "未命名",
          pid: v.pid,
          snum: v.snum,
          type: v.type,
          icon: v.icon,
          inline_type: v.inline_type,
          update_time: v.update_time,
          is_favor: v.is_favor,
          children: [],
        }))
        const stars = allViews.filter((v) => v.is_favor)
        stars.sort((a, b) => b.update_time - a.update_time)
        const views = allViews.filter((v) => v.inline_type === ViewInlineType.NOTINLINE)
        const its = convertData(views)
        setItems(its)
        setStars(stars)
        if (viewId === SpecialViewEnum.VIEWS || viewId === SpecialViewEnum.CARDS) {
          setExpands([SpecialViewEnum.STARS, TOP_VIEW_ID])
        } else if (
          viewId !== SpecialViewEnum.TYPES &&
          viewId !== SpecialViewEnum.SPACES &&
          viewId !== SpecialViewEnum.TAGS
        ) {
          const expandIds = parseTreePath(its, viewId, []) || []
          setExpands([TOP_VIEW_ID, SpecialViewEnum.STARS, ...expandIds])
        }
      })
    } else if (menuRefreshVal.time !== rtime) {
      // 菜单项新增、更新、删除，触发菜单刷新，需初始化菜单项，如果带上 viewId，则刷新之后再跳转
      db?.view.getAll(spaceId).then((vs) => {
        const allViews: ViewItemData[] = vs.map((v) => ({
          id: v.id,
          name: v.name || "未命名",
          pid: v.pid,
          snum: v.snum,
          type: v.type,
          icon: v.icon,
          inline_type: v.inline_type,
          update_time: v.update_time,
          is_favor: v.is_favor,
          children: [],
        }))
        const stars = allViews.filter((v) => v.is_favor)
        stars.sort((a, b) => b.update_time - a.update_time)
        const views = allViews.filter((v) => v.inline_type === ViewInlineType.NOTINLINE)
        const its = convertData(views)
        setItems(its)
        setStars(stars)
        // 跳转页面
        menuRefreshVal.viewId && handleJump(menuRefreshVal.viewId)
      })
    } else if (viewId !== vid) {
      // 页面跳转，只需更新展开项
      if (
        viewId !== SpecialViewEnum.VIEWS &&
        viewId !== SpecialViewEnum.CARDS &&
        viewId !== SpecialViewEnum.TYPES &&
        viewId !== SpecialViewEnum.SPACES &&
        viewId !== SpecialViewEnum.TAGS &&
        viewId !== SpecialViewEnum.STARS
      ) {
        const expandIds = parseTreePath(items || [], viewId, []) || []
        expandIds.length > 0 &&
          setExpands((oldExpands) => {
            const oldSet = new Set(oldExpands)
            if (expandIds.every((id) => oldSet.has(id))) {
              return oldExpands
            } else {
              return Array.from(new Set([...oldExpands, ...expandIds]))
            }
          })
      }
    }
  }, [db, spaceId, viewId, menuRefreshVal, handleJump, items])
  const handleAddView = useCallback(
    (id: string, viewType: ViewTypeEnum) => {
      setMEditView({
        viewId: "",
        spaceId: spaceId,
        pid: id,
        currType: viewType,
      })
    },
    [setMEditView, spaceId]
  )
  const showDeleteConfirm = useCallback(
    (id: string) => {
      modal.confirm({
        title: "删除视图？",
        icon: <ExclamationCircleFilled />,
        content: "一经删除，当前视图及其所有子视图均将被删除！请慎重操作！",
        okText: "确认",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          deleteView(db, id).then((vids) => {
            message.success("删除视图成功！")
            setViewOp({ op: OpEnum.DELETE, ids: vids })
            refreshMenu(id === viewId ? "views" : undefined)
          })
        },
      })
    },
    [db, message, modal, refreshMenu, setViewOp, viewId]
  )
  // 设置和取消星标
  const setFavor = useCallback(
    (id: string, isFavor: boolean) => {
      db?.view.updateViewFavor(id, isFavor).then(() => {
        refreshMenu()
      })
    },
    [db?.view, refreshMenu]
  )
  const handleClick = useCallback(
    ({ key }: { key: string }, id: string, viewType: ViewTypeEnum) => {
      if (id) {
        if (key === "add") {
          handleAddView(id, viewType)
        } else if (key === "edit") {
          setMEditView({
            viewId: id,
            spaceId: spaceId,
          })
        } else if (key === "delete") {
          showDeleteConfirm(id)
        } else if (key === "favor") {
          setFavor(id, true)
        } else if (key === "unfavor") {
          setFavor(id, false)
        }
      }
    },
    [handleAddView, setFavor, setMEditView, showDeleteConfirm, spaceId]
  )
  // 切换菜单项的展开和折叠
  const handleExpansion = useCallback((id: string) => {
    setExpands((state) => {
      const newExpands = state.filter((item) => item !== id)
      if (newExpands.length === state.length) {
        return [...state, id]
      } else {
        return newExpands
      }
    })
  }, [])
  // 更新视图排序
  const updateViews = useCallback(
    (flattendItems: FlattenedItem[], pid: string, currId: string) => {
      // 找到新位置的所有同级节点
      const peerItems: FlattenedItem[] = flattendItems.filter((i) => i.pid === pid)
      const viewMap: Map<string, number> = new Map()
      const idx = peerItems.findIndex((i) => i.id === currId)
      // 判断新位置的前一个节点
      const prevItem = idx <= 0 ? undefined : peerItems[idx - 1]
      const nextItem = idx >= peerItems.length ? undefined : peerItems[idx + 1]
      if (peerItems.length === 1) {
        // 只有一个节点，则 snum 置为 10000
        viewMap.set(currId, 10000)
      } else {
        if (!prevItem) {
          // 移动到第一个位置，则判断第二个位置的节点的 snum 是否大于 0
          if (nextItem && nextItem.snum > 1) {
            // 只需更新当前节点的 snum
            viewMap.set(currId, Math.floor(nextItem.snum / 2))
          } else {
            // 当前节点的 snum 置为 10000，后面的节点依次叠加 10000
            let snum = 10000
            viewMap.set(currId, snum)
            peerItems.forEach((i, index) => {
              if (index > idx) {
                snum += 10000
                viewMap.set(i.id, snum)
              }
            })
          }
        } else if (!nextItem) {
          // 移动到最后一个位置，则在前一个位置的节点的 snum + 10000
          viewMap.set(currId, prevItem.snum + 10000)
        } else {
          // 移动到中间位置，则计算前后位置节点的 snum 的平均值
          const middleSnum = Math.floor((prevItem.snum + nextItem.snum) / 2)
          // 中间值如果和前一个值相等，则在前一个值的基础上，依次叠加 10000
          if (middleSnum === prevItem.snum) {
            let snum = middleSnum + 10000
            viewMap.set(currId, snum)
            peerItems.forEach((i, index) => {
              if (index > idx) {
                snum += 10000
                viewMap.set(i.id, snum)
              }
            })
          } else {
            // 否则直接应用中间值
            viewMap.set(currId, middleSnum)
          }
        }
      }
      db?.view.batchUpdateSortViews(viewMap, pid)
      return viewMap
    },
    [db]
  )
  const handleDragStart = useCallback(({ active: { id: activeId } }: DragStartEvent) => {
    setActiveId(activeId as string)
    setOverId(activeId as string)
    document.body.style.setProperty("cursor", "grabbing")
  }, [])
  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x)
  }, [])
  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    setOverId((over?.id as string) ?? null)
  }, [])
  const resetState = useCallback(() => {
    setOverId(null)
    setActiveId(null)
    setOffsetLeft(0)
    document.body.style.setProperty("cursor", "")
  }, [])
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      resetState()
      if (projected && over && items) {
        const currId = active.id as string
        const overId = over.id as string
        const { depth, pid } = projected
        const currItem = items.find(({ id }) => id === currId)
        if (currItem && (currId !== overId || currItem.pid !== pid)) {
          const clonedItems: FlattenedItem[] = JSON.parse(JSON.stringify(items))
          const newIndex = clonedItems.findIndex(({ id }) => id === overId)
          // 遍历，计算出需要移动的元素，-1-还未找到当前元素，-2-已经找完当前元素及其子元素
          let idx = -1
          let oldIndex = -1
          const beforeItems: FlattenedItem[] = []
          const moveItems: FlattenedItem[] = []
          const afterItems: FlattenedItem[] = []
          clonedItems.forEach((item, index) => {
            if (item.id === currId) {
              idx = index
              oldIndex = index
              moveItems.push({ ...item, depth, pid })
            } else {
              if (idx === -2) {
                afterItems.push(item)
              } else if (idx === -1) {
                beforeItems.push(item)
              } else {
                if (item.depth > currItem.depth) {
                  moveItems.push({ ...item, depth: depth - currItem.depth + item.depth })
                } else {
                  idx = -2
                  afterItems.push(item)
                }
              }
            }
          })
          // console.log("arr", beforeItems, moveItems, afterItems)
          // 组装数组
          const newItems: FlattenedItem[] = []
          if (newIndex < oldIndex) {
            beforeItems.forEach((item, index) => {
              if (index < newIndex) {
                newItems.push(item)
              } else if (index === newIndex) {
                newItems.push(...moveItems, item)
              } else {
                newItems.push(item)
              }
            })
            newItems.push(...afterItems)
          } else if (newIndex > oldIndex) {
            newItems.push(...beforeItems)
            let nIdx = newIndex - (beforeItems.length + moveItems.length)
            // 从前往后移，移动到新位置的下级，且新位置折叠，则应该移动到最后位置
            if (overId === pid && !expands.some((i) => i === pid)) {
              nIdx += clonedItems[newIndex].children.length
            }
            afterItems.forEach((item, index) => {
              if (index < nIdx) {
                newItems.push(item)
              } else if (index === nIdx) {
                newItems.push(item, ...moveItems)
              } else {
                newItems.push(item)
              }
            })
          } else {
            newItems.push(...beforeItems, ...moveItems, ...afterItems)
          }
          // 需要变更的数据
          const viewMap = updateViews(newItems, pid, currId)
          let sortedItems = newItems.map((item) => {
            const snum = viewMap.get(item.id)
            if (snum !== undefined) {
              return { ...item, snum }
            } else {
              return item
            }
          })
          // 刷新原父级的 children
          if (currItem.pid !== "") {
            const oldPidChildren = sortedItems.filter((i) => i.pid === currItem.pid)
            sortedItems = sortedItems.map((item) =>
              item.id === currItem.pid ? { ...item, children: oldPidChildren } : item
            )
          }
          // 刷新新父级的 children
          if (pid !== "" && currItem.pid !== pid) {
            const newPidChildren = sortedItems.filter((i) => i.pid === pid)
            sortedItems = sortedItems.map((item) =>
              item.id === pid ? { ...item, children: newPidChildren } : item
            )
          }
          setItems(sortedItems)
          // 展开菜单项
          if (!expands.some((i) => i === pid)) {
            setExpands([...expands, pid])
          }
        }
      }
    },
    [expands, items, projected, resetState, updateViews]
  )
  console.log("Render: MenuList", Date.now())
  return (
    <MenuContainer token={token}>
      {items !== undefined && (
        <MenuUl>
          <MenuLi>
            <MenuItem className={cc(["item", { selected: selectedCards }])}>
              <IText
                ellipsis
                className="flexPlace titleText"
                onClick={() => handleJump(SpecialViewEnum.CARDS)}
              >
                <IIcon icon={selectedCards ? "catesfill" : "cates"} />
                卡片盒
              </IText>
            </MenuItem>
          </MenuLi>
          {stars.length > 0 && (
            <MenuLi>
              <MenuItem className={cc(["item", { selected: selectedStars }])}>
                <IText
                  ellipsis
                  className="flexPlace titleText"
                  onClick={() => handleExpansion(SpecialViewEnum.STARS)}
                >
                  <IIcon icon={selectedStars ? "favorfill" : "favor"} />
                  星标
                </IText>
                <IconBtn
                  onClick={() => handleExpansion(SpecialViewEnum.STARS)}
                  className={cc([
                    "collapseBtn",
                    { collapsed: expands.every((item) => item !== SpecialViewEnum.STARS) },
                  ])}
                  type="text"
                  size="small"
                  icon={<IIcon icon="arrowbottom" />}
                />
              </MenuItem>
              <MenuItemList>
                {starViews.map(({ id, name, icon, type }) => (
                  <SimpleItem
                    key={"star" + id}
                    name={name}
                    icon={icon}
                    depth={0}
                    indentationWidth={indentationWidth}
                    selected={viewId === id}
                    onJump={() => handleJump(id)}
                    token={token}
                    moreBtn={
                      <Dropdown
                        menu={{ items: subItems3, onClick: (i) => handleClick(i, id, type) }}
                        trigger={["click"]}
                      >
                        <IconBtn
                          size="small"
                          type="text"
                          className="hide"
                          icon={<IIcon icon="more" fontSize={14} />}
                        />
                      </Dropdown>
                    }
                  />
                ))}
              </MenuItemList>
            </MenuLi>
          )}
          <MenuLi>
            <MenuItem className={cc(["item", { selected: selectedViews }])}>
              <IText
                ellipsis
                className="flexPlace titleText"
                onClick={() => handleJump(SpecialViewEnum.VIEWS)}
              >
                <IIcon icon={selectedViews ? "boardsfill" : "boards"} />
                视图集
              </IText>
              <IconBtn
                onClick={() => handleAddView(TOP_VIEW_ID, ViewTypeEnum.DOC)}
                type="text"
                size="small"
                className="hide"
                icon={<IIcon icon="plus" fontSize={14} />}
              />
              {items.length > 0 && (
                <IconBtn
                  onClick={() => handleExpansion(TOP_VIEW_ID)}
                  className={cc([
                    "collapseBtn",
                    { collapsed: expands.every((item) => item !== TOP_VIEW_ID) },
                  ])}
                  type="text"
                  size="small"
                  icon={<IIcon icon="arrowbottom" />}
                />
              )}
            </MenuItem>
            <MenuItemList>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                measuring={measuring}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={resetState}
              >
                <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                  {flattenedItems.map(({ id, name, icon, type, is_favor, children, depth }) => (
                    <SortableTreeItem
                      key={id}
                      id={id}
                      name={name}
                      icon={icon}
                      depth={id === activeId && projected ? projected.depth : depth}
                      indentationWidth={indentationWidth}
                      selected={viewId === id}
                      collapsed={children.length > 0 && !expands.some((i) => i === id)}
                      onCollapse={children.length ? () => handleExpansion(id) : undefined}
                      onJump={() => handleJump(id)}
                      token={token}
                      moreBtn={
                        <Dropdown
                          menu={{
                            items: is_favor ? subItems2 : subItems,
                            onClick: (i) => handleClick(i, id, type),
                          }}
                          trigger={["click"]}
                        >
                          <IconBtn
                            size="small"
                            type="text"
                            className="hide"
                            icon={<IIcon icon="more" fontSize={14} />}
                          />
                        </Dropdown>
                      }
                    />
                  ))}
                  {createPortal(
                    <DragOverlay>
                      {activeItem ? (
                        <SortableTreeItem
                          id={activeItem.id}
                          name={activeItem.name}
                          icon={activeItem.icon}
                          depth={activeItem.depth}
                          clone
                          childCount={getChildCount(items, activeItem.id) + 1}
                          indentationWidth={indentationWidth}
                          token={token}
                        />
                      ) : null}
                    </DragOverlay>,
                    document.body
                  )}
                </SortableContext>
              </DndContext>
            </MenuItemList>
          </MenuLi>
          <div className="flexPlace" />
          <MenuLi>
            <MenuItem className={cc(["item", { selected: selectedTags }])}>
              <IText ellipsis className="flexPlace titleText" onClick={() => handleJump("tags")}>
                <IIcon icon={selectedTags ? "tagsfill" : "tags"} />
                卡片标签
              </IText>
            </MenuItem>
          </MenuLi>
          <MenuLi>
            <MenuItem className={cc(["item", { selected: selectedTypes }])}>
              <IText ellipsis className="flexPlace titleText" onClick={() => handleJump("types")}>
                <IIcon icon={selectedTypes ? "cards2fill" : "cards2"} />
                卡片模板
              </IText>
            </MenuItem>
          </MenuLi>
        </MenuUl>
      )}
      <ViewEdit />
    </MenuContainer>
  )
}
const MenuContainer = styled("div")(({ token }: StyledToken) => ({
  height: "100%",
  padding: "0 4px 8px 0",
  overflowY: "auto",
  ".titleText": {
    fontWeight: 500,
  },
  "&>ul": {
    display: "flex",
    flexDirection: "column",
    marginBottom: 0,
    minHeight: "100%",
  },
  ".item": {
    backgroundColor: token.colorBgLayout,
  },
  ".item:hover": {
    cursor: "pointer",
    backgroundColor: token.colorBgTextHover,
    ".hide": {
      display: "inline-block",
    },
  },
  ".item.selected": {
    backgroundColor: token.colorBgTextActive,
  },
  ".item .ant-typography": {
    paddingTop: "1px",
    paddingBottom: "1px",
  },
}))
const MenuUl = styled("ul")({
  paddingLeft: 10,
  overflow: "hidden",
})
const MenuItemList = styled("ul")({
  paddingLeft: 14,
  // paddingBottom: 8,
  overflow: "hidden",
})
const MenuLi = styled("li")({
  listStyle: "none",
  marginTop: 2,
})
const MenuItem = styled(IFlexR)({
  padding: "4px 6px 4px 8px",
  borderRadius: 6,
})
