import React, { memo, useCallback, useMemo, useRef, useState } from "react"
import type { RuleConfig } from "@/types"
import { parseRuleConfig, parseViewConfig } from "@/utils"
import { CardList } from "./list"
import { ListHeader } from "../common"
import styled from "@emotion/styled"
import { GetConf, useConfigStore } from "@/store"
import { shallow } from "zustand/shallow"
import { SHOW_UNNAMED } from "@/constant"
import { SpecialViewEnum } from "@/enums"
import { setLocalTypeId } from "@/datasource"

type Props = {
  viewId: string
  spaceId: string
  viewConfig: string
}

const confSelector: GetConf = (state) => [state.viewConf]

export const ListView = memo(({ spaceId, viewId, viewConfig }: Props) => {
  const cfgRef = useRef<{ ruleId: string; ruleCfg: RuleConfig }>()
  const [viewConf] = useConfigStore(confSelector, shallow)
  // 手动触发组件刷新
  const [, setRefresh] = useState(0)
  const viewCfg = useMemo(() => {
    const cfg = parseViewConfig(viewConfig)
    const ruleId =
      viewId === SpecialViewEnum.CARDS && viewConf.showUnnamed ? SHOW_UNNAMED : cfg.ruleId
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
  console.log("Render - ListView")
  return cfgRef.current ? (
    <>
      <ListHeader
        spaceId={spaceId}
        viewId={viewId}
        viewCfg={viewCfg}
        ruleCfg={cfgRef.current.ruleCfg}
        setRuleCfg={setRuleCfg}
        setRuleId={setRuleId}
        setKeyword={setKeyword}
      />
      <ListContainer>
        <CardList spaceId={spaceId} ruleCfg={cfgRef.current.ruleCfg} keyword={keyword} />
      </ListContainer>
    </>
  ) : null
})

export const ListContainer = styled("div")({
  flex: 1,
  overflowY: "auto",
  padding: "4px 12px 12px",
})
