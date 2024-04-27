import React, { memo, useMemo, useState } from "react"
import type { RuleConfig } from "@/types"
import { parseRuleConfig, parseViewConfig } from "@/utils"
import { ListHeader } from "../common"
import { Kanban } from "./kanban"
import styled from "@emotion/styled"
import { IFlexC } from "@/ui"

type Props = {
  viewId: string
  spaceId: string
  viewType: number
  viewConfig: string
}

let lastViewRuleCfg: RuleConfig | undefined = undefined
export const KanbanView = memo(({ spaceId, viewId, viewType, viewConfig }: Props) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const viewCfg = useMemo(() => parseViewConfig(viewConfig), [viewId, viewConfig])
  const [ruleId, setRuleId] = useState<string>(viewCfg.ruleId)
  const viewRuleCfg = useMemo(() => parseRuleConfig(viewCfg, ruleId), [viewCfg, ruleId])
  // 每次上层传递下来的参数变更，则触发当前组件的刷新
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const reloadTime = useMemo(() => Date.now(), [viewId, viewConfig])
  const [ruleCfg, setRuleCfg] = useState<RuleConfig>(viewRuleCfg)
  // 真实生效的规则配置
  let realRuleCfg = ruleCfg
  if (lastViewRuleCfg !== viewRuleCfg) {
    lastViewRuleCfg = viewRuleCfg
    realRuleCfg = viewRuleCfg
    setRuleCfg(realRuleCfg)
  }
  // 根据关键词实时过滤
  const [keyword, setKeyword] = useState("")
  return realRuleCfg ? (
    <>
      <ListHeader
        spaceId={spaceId}
        viewId={viewId}
        viewCfg={viewCfg}
        ruleCfg={realRuleCfg}
        viewType={viewType}
        setRuleCfg={setRuleCfg}
        setRuleId={setRuleId}
        setKeyword={setKeyword}
      />
      <KanbanContainer>
        <Kanban spaceId={spaceId} ruleCfg={realRuleCfg} keyword={keyword} />
      </KanbanContainer>
    </>
  ) : null
})

export const KanbanContainer = styled(IFlexC)({
  flex: 1,
  overflow: "hidden",
  padding: "0px 12px",
})
