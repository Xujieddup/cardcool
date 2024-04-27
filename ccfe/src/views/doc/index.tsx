import React, { memo, useMemo, useState } from "react"
import type { RuleConfig } from "@/types"
import { parseRuleConfig, parseViewConfig } from "@/utils"
import { ListHeader } from "../common"
import { Doc } from "./doc"
import styled from "@emotion/styled"
import { IFlexC } from "@/ui"

type Props = {
  viewId: string
  spaceId: string
  viewName: string
  viewType: number
  content: string
}

// let lastViewRuleCfg: RuleConfig | undefined = undefined
export const DocView = memo(({ spaceId, viewId, viewName, viewType, content }: Props) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const viewCfg = useMemo(() => parseViewConfig(viewConfig), [viewId, viewConfig])
  // const [ruleId, setRuleId] = useState<string>(viewCfg.ruleId)
  // const viewRuleCfg = useMemo(() => parseRuleConfig(viewCfg, ruleId), [viewCfg, ruleId])
  // // 每次上层传递下来的参数变更，则触发当前组件的刷新
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // // const reloadTime = useMemo(() => Date.now(), [viewId, viewConfig])
  // const [ruleCfg, setRuleCfg] = useState<RuleConfig>(viewRuleCfg)
  // // 真实生效的规则配置
  // let realRuleCfg = ruleCfg
  // if (lastViewRuleCfg !== viewRuleCfg) {
  //   lastViewRuleCfg = viewRuleCfg
  //   realRuleCfg = viewRuleCfg
  //   setRuleCfg(realRuleCfg)
  // }
  // 根据关键词实时过滤
  // const [keyword, setKeyword] = useState("")
  return (
    <>
      {/* <ListHeader
        spaceId={spaceId}
        viewId={viewId}
        viewCfg={viewCfg}
        ruleCfg={realRuleCfg}
        viewType={viewType}
        setRuleCfg={setRuleCfg}
        setRuleId={setRuleId}
        setKeyword={setKeyword}
      /> */}
      <Doc viewId={viewId} viewName={viewName} viewType={viewType} content={content} />
    </>
  )
})

export const DocContainer = styled("div")({})
