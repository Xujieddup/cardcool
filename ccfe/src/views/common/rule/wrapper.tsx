import React, { memo, useCallback, useEffect, useState } from "react"
import type { RuleConfig } from "@/types"
import { IconTextSmallBtn } from "@/components/ui"
import { Popover } from "antd"
import { IIcon } from "@/icons"
import { RulePanel } from "./panel"
import { GRuleOpenTime, useModelStore } from "@/store"

type Props = {
  spaceId: string
  viewId: string
  ruleCfg: RuleConfig
  viewType?: number
  setRuleCfg: (func: (oldCfg: RuleConfig) => RuleConfig) => void
  setRuleId: (newRuleId: string) => void
}

const ruleOpenSelector: GRuleOpenTime = (state) => state.ruleOpenTime

export const RuleWrapper = memo(
  ({ spaceId, viewId, ruleCfg, viewType, setRuleCfg, setRuleId }: Props) => {
    const [open, setOpen] = useState(false)
    const ruleOpenTime = useModelStore(ruleOpenSelector)
    const handleOpenChange = useCallback((newOpen: boolean) => {
      setOpen(newOpen)
    }, [])
    useEffect(() => {
      ruleOpenTime > 0 && Date.now() - ruleOpenTime < 3000 && setOpen(true)
    }, [ruleOpenTime])
    const ruleCnt =
      ruleCfg.filters.length +
      ruleCfg.groupers.length +
      ruleCfg.sorters.length +
      (ruleCfg.typeId ? 1 : 0)
    console.log("Render: RuleWrapper")
    return (
      <Popover
        content={
          <RulePanel
            spaceId={spaceId}
            viewId={viewId}
            ruleCfg={ruleCfg}
            viewType={viewType}
            setRuleCfg={setRuleCfg}
            setRuleId={setRuleId}
            setOpen={setOpen}
          />
        }
        trigger="click"
        placement="bottomLeft"
        open={open}
        onOpenChange={handleOpenChange}
        overlayInnerStyle={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <IconTextSmallBtn size="small" icon={<IIcon icon="filter" />} className="mr4">
          {ruleCnt > 0 ? ruleCnt + " 规则" : "规则"}
        </IconTextSmallBtn>
      </Popover>
    )
  }
)
