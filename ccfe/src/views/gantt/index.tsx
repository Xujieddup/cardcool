import React, { memo, useCallback, useMemo, useRef, useState } from "react"
import type { RuleConfig } from "@/types"
import { parseRuleConfig, parseViewConfig } from "@/utils"
import { ListHeader } from "../common"
import { Gantt } from "./gantt"
import styled from "@emotion/styled"
import { IFlexC } from "@/ui"
import { setLocalTypeId } from "@/datasource"

type Props = {
  viewId: string
  spaceId: string
  viewType: number
  viewConfig: string
}

export const GanttView = memo(({ spaceId, viewId, viewType, viewConfig }: Props) => {
  const cfgRef = useRef<{ ruleId: string; ruleCfg: RuleConfig }>()
  // 手动触发组件刷新
  const [, setRefresh] = useState(0)
  const viewCfg = useMemo(() => {
    const cfg = parseViewConfig(viewConfig)
    const ruleId = cfg.ruleId
    const ruleCfg = parseRuleConfig(cfg, ruleId)
    setLocalTypeId(ruleCfg.typeId)
    cfgRef.current = { ruleId, ruleCfg }
    return cfg
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, viewId, viewConfig])
  const setRuleId = useCallback(
    (newRuleId: string) => {
      const ruleCfg = parseRuleConfig(viewCfg, newRuleId)
      setLocalTypeId(ruleCfg.typeId)
      cfgRef.current = { ruleId: newRuleId, ruleCfg }
      setRefresh(Date.now())
    },
    [viewCfg]
  )
  const setRuleCfg = useCallback((func: (oldCfg: RuleConfig) => RuleConfig) => {
    if (cfgRef.current) {
      cfgRef.current.ruleCfg = func(cfgRef.current.ruleCfg)
      setRefresh(Date.now())
    }
  }, [])
  // 根据关键词实时过滤
  const [keyword, setKeyword] = useState("")
  console.log("Render - GanttView")
  return cfgRef.current ? (
    <>
      <ListHeader
        spaceId={spaceId}
        viewId={viewId}
        viewCfg={viewCfg}
        ruleCfg={cfgRef.current.ruleCfg}
        viewType={viewType}
        setRuleCfg={setRuleCfg}
        setRuleId={setRuleId}
        setKeyword={setKeyword}
      />
      <GanttContainer>
        <Gantt spaceId={spaceId} ruleCfg={cfgRef.current.ruleCfg} keyword={keyword} />
      </GanttContainer>
    </>
  ) : null
})

export const GanttContainer = styled(IFlexC)({
  flex: 1,
  padding: "4px 12px 12px",
})
