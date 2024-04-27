import React, { memo, useCallback, useEffect, useState } from "react"
import type { RuleConfig } from "@/types"
import { IconTextSmallBtn } from "@/components/ui"
import { Popover } from "antd"
import { IIcon } from "@/icons"
import { CardViewPanel } from "./panel"
import { GRuleOpenTime, useModelStore } from "@/store"

type Props = {
  spaceId: string
  viewId: string
  ruleCfg: RuleConfig
  viewType?: number
  setRuleCfg: React.Dispatch<React.SetStateAction<RuleConfig>>
  setRuleId: React.Dispatch<React.SetStateAction<string>>
}

const ruleOpenSelector: GRuleOpenTime = (state) => state.ruleOpenTime

export const CardViewWrapper = memo(
  ({ spaceId, viewId, ruleCfg, viewType, setRuleCfg, setRuleId }: Props) => {
    const [open, setOpen] = useState(false)
    const ruleOpenTime = useModelStore(ruleOpenSelector)
    const handleOpenChange = useCallback((newOpen: boolean) => {
      setOpen(newOpen)
    }, [])
    useEffect(() => {
      ruleOpenTime > 0 && Date.now() - ruleOpenTime < 3000 && setOpen(true)
    }, [ruleOpenTime])
    console.log("Render: CardViewWrapper")
    return (
      <Popover
        content={
          <CardViewPanel
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
        <IconTextSmallBtn size="small" icon={<IIcon icon="cardview" />} className="mr4">
          卡片样式
        </IconTextSmallBtn>
      </Popover>
    )
  }
)
