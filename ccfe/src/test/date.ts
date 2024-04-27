import { DateRuleEnum, DateRuleUnitEnum } from "@/enums"
import { checkDateRule } from "@/utils"

export const testDeteRuleCheck = () => {
  const dateRule = {
    type: DateRuleEnum.DRR,
    unit: DateRuleUnitEnum.DAY,
    start: -1,
    end: 2,
  }
  const date = "2023-07-18"
  // console.log("firstDay", firstDay.format("YYYY-MM-DD"))
  // console.log("startDay", startDay.format("YYYY-MM-DD"))
  // console.log("endDay", endDay.format("YYYY-MM-DD"))
  console.log("checkDateRule", checkDateRule(dateRule, date))
}
