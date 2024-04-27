import React, { ChangeEventHandler, memo, useCallback } from "react"
import styled from "@emotion/styled"
import type { RuleConfig, ViewCfg } from "@/types"
import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { useDebounceCallback } from "@react-hook/debounce"
import { IFlexR } from "@/ui"
import { RuleSnapshot, RuleWrapper } from "./rule"
import { SnapModal } from "./snapModal"
import { CardViewWrapper } from "./cardview"

type Props = {
  spaceId: string
  viewId: string
  viewCfg: ViewCfg
  ruleCfg: RuleConfig
  viewType?: number
  setRuleCfg: (func: (oldCfg: RuleConfig) => RuleConfig) => void
  setRuleId: (newRuleId: string) => void
  setKeyword: React.Dispatch<React.SetStateAction<string>>
}

export const ListHeader = memo(
  ({ spaceId, viewId, viewCfg, ruleCfg, viewType, setRuleCfg, setRuleId, setKeyword }: Props) => {
    // 延迟更新视图过滤的关键词
    const updateKeyword = useDebounceCallback((text: string) => {
      // console.log("updateKeyword", text)
      setKeyword(text)
    }, 400)
    const handleChangeKeyword: ChangeEventHandler<HTMLInputElement> = useCallback(
      (e) => updateKeyword(e.target.value),
      [updateKeyword]
    )
    console.log("Render: ListViewHeader")
    return (
      <HearderBox>
        <RuleWrapper
          spaceId={spaceId}
          viewId={viewId}
          ruleCfg={ruleCfg}
          viewType={viewType}
          setRuleCfg={setRuleCfg}
          setRuleId={setRuleId}
        />
        {/* <CardViewWrapper
          spaceId={spaceId}
          viewId={viewId}
          ruleCfg={ruleCfg}
          viewType={viewType}
          setRuleCfg={setRuleCfg}
          setRuleId={setRuleId}
        /> */}
        <SearchInput
          size="small"
          placeholder="搜索卡片..."
          allowClear
          prefix={<SearchOutlined />}
          onChange={handleChangeKeyword}
        />
        <div className="flexPlace" />
        <RuleSnapshot
          viewId={viewId}
          ruleId={ruleCfg.ruleId}
          rules={viewCfg.rules}
          setRuleId={setRuleId}
        />
        <SnapModal />
      </HearderBox>
    )
  }
)

const HearderBox = styled(IFlexR)({
  minHeight: 24,
  padding: "0 12px 4px",
})
const SearchInput = styled(Input)({
  maxWidth: 120,
})
