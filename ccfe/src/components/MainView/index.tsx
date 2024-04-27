import React, { memo } from "react"
import type { View } from "@/types"
import styled from "@emotion/styled"
import { DocView, FlowGraphView, GanttView, KanbanView, ListView } from "@/views"
import { TypeView } from "@/components/type"
import { SpaceView } from "@/components/space"
import { ICard } from "@/components/card"
import { HeaderView } from "./header"
import { ViewInlineType, ViewTypeEnum } from "@/enums"
import { TagView } from "../tag"
import { IFlexC } from "@/ui"

type Props = { view: View }
export const MainView = memo(({ view }: Props) => {
  const docView = view.type === ViewTypeEnum.DOC
  const mdocView = view.type === ViewTypeEnum.MDOC
  const listView = view.type === ViewTypeEnum.LIST || view.type === -1
  const graphView = view.type === ViewTypeEnum.BOARD || view.type === -2
  const kanbanView = view.type === ViewTypeEnum.KANBAN
  const ganttView = view.type === ViewTypeEnum.GANTT
  const spaceView = view.type === -3
  const typeView = view.type === -4
  const tagView = view.type === -5
  const mainViewId = view.inline_type === ViewInlineType.INLINE ? view.pid : undefined
  console.log("Render: MainView")
  return view ? (
    <>
      <HeaderView
        spaceId={view.space_id}
        viewId={view.id}
        viewName={view.name}
        viewIcon={view.icon}
        viewType={view.type}
        mainViewId={mainViewId}
      />
      <MainContainer>
        {(docView || mdocView) && (
          <DocView
            spaceId={view.space_id}
            viewId={view.id}
            viewName={view.name}
            viewType={view.type}
            content={view.content}
          />
        )}
        {listView && <ListView spaceId={view.space_id} viewId={view.id} viewConfig={view.config} />}
        {kanbanView && (
          <KanbanView
            spaceId={view.space_id}
            viewId={view.id}
            viewType={view.type}
            viewConfig={view.config}
          />
        )}
        {ganttView && (
          <GanttView
            spaceId={view.space_id}
            viewId={view.id}
            viewType={view.type}
            viewConfig={view.config}
          />
        )}
        {graphView && <FlowGraphView spaceId={view.space_id} viewId={view.id} />}
        {spaceView && <SpaceView />}
        {typeView && <TypeView />}
        {tagView && <TagView spaceId={view.space_id} />}
      </MainContainer>
      <ICard />
    </>
  ) : null
})

const MainContainer = styled(IFlexC)({
  flex: 1,
  overflow: "hidden",
  userSelect: "none",
  position: "relative",
})
