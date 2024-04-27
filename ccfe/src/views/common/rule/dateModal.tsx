import React, { memo, useCallback, useEffect, useState } from "react"
import styled from "@emotion/styled"
import type { DateRule } from "@/types"
import { IFlexR } from "@/ui"
import { DatePicker, Form, Input, InputNumber, Modal, Select, Typography } from "antd"
import { DateRuleEnum, DateRuleUnitEnum } from "@/enums"
import { dateAbsRuleUnitOpts, dateRelateRuleUnitOpts, isAbsRule, parseDateRuleDesc } from "@/utils"

type DateModalProps = {
  odr?: DateRule
  setODR: React.Dispatch<React.SetStateAction<DateRule | undefined>>
  updateDateRule: (dateRule?: DateRule) => void
}
const initData: DateRule = {
  propId: "",
  type: DateRuleEnum.DAD,
  unit: DateRuleUnitEnum.DAY,
  start: null,
  end: null,
}
// 日期条件列表，适用于日期类型属性
const dateRuleOpts = [
  { value: DateRuleEnum.DAD, label: "绝对日期" },
  { value: DateRuleEnum.DAR, label: "绝对日期范围" },
  { value: DateRuleEnum.DRD, label: "相对日期" },
  { value: DateRuleEnum.DRR, label: "相对日期范围" },
]
export const DateModal = memo(({ odr, setODR, updateDateRule }: DateModalProps) => {
  const [form] = Form.useForm<DateRule>()
  const [dateRule, setDateRule] = useState<DateRule>(initData)
  useEffect(() => {
    if (odr) {
      setDateRule(odr)
      form.setFieldsValue(odr)
    }
  }, [form, odr])
  const ruleType = dateRule.type
  const absRule = isAbsRule(ruleType)
  const desc = parseDateRuleDesc(dateRule)
  const onValuesChange = useCallback(
    (changedValues: any, values: any) => {
      console.log("handleValuesChange", changedValues, values)
      setDateRule((oldRule) => {
        let newValue = values as DateRule
        if (oldRule.type !== newValue.type) {
          newValue = {
            propId: newValue.propId,
            type: newValue.type,
            unit: DateRuleUnitEnum.DAY,
            start: null,
            end: null,
          }
          form.setFieldsValue(newValue)
        }
        return newValue
      })
    },
    [form]
  )
  const handleOk = useCallback(() => {
    const ruleVal = form.getFieldsValue()
    let rule: DateRule | undefined = undefined
    if (ruleVal && ruleVal.propId) {
      if (ruleVal.type === DateRuleEnum.DAD) {
        if (ruleVal.start) {
          rule = { ...ruleVal, start: ruleVal.start.format("YYYY-MM-DD"), end: null }
        }
      } else if (ruleVal.type === DateRuleEnum.DAR) {
        if (ruleVal.start && ruleVal.end) {
          rule = {
            ...ruleVal,
            start: ruleVal.start.format("YYYY-MM-DD"),
            end: ruleVal.end.format("YYYY-MM-DD"),
          }
        } else if (ruleVal.start) {
          rule = { ...ruleVal, start: ruleVal.start.format("YYYY-MM-DD"), end: null }
        } else if (ruleVal.end) {
          rule = { ...ruleVal, end: ruleVal.end.format("YYYY-MM-DD"), start: null }
        }
      } else if (ruleVal.type === DateRuleEnum.DRD) {
        if (ruleVal.start !== null) {
          rule = { ...ruleVal, start: Math.floor(ruleVal.start), end: null }
        }
      } else if (ruleVal.type === DateRuleEnum.DRR) {
        if (ruleVal.start !== null && ruleVal.end !== null) {
          const start = Math.floor(ruleVal.start)
          const end = Math.floor(ruleVal.end)
          rule = {
            ...ruleVal,
            start: start < end ? start : end,
            end: start > end ? start : end,
          }
        } else if (ruleVal.start !== null) {
          rule = { ...ruleVal, start: Math.floor(ruleVal.start), end: null }
        } else if (ruleVal.end !== null) {
          rule = { ...ruleVal, end: Math.floor(ruleVal.end), start: null }
        }
      }
    }
    console.log("updateDateRule", ruleVal, rule)
    updateDateRule(rule)
  }, [form, updateDateRule])
  const handleCancel = () => {
    setODR(undefined)
  }
  console.log("Render: DateRule")
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Modal
        title="自定义日期筛选规则"
        open={!!odr}
        okButtonProps={{ disabled: !desc }}
        onOk={handleOk}
        onCancel={handleCancel}
        getContainer={false}
        zIndex={1031}
      >
        <DateRuleForm form={form} name="dateRule" size="small" onValuesChange={onValuesChange}>
          <IFlexR className="mb-4">
            <Form.Item name="propId" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item label="规则类型" name="type" style={{ marginRight: 8 }}>
              <Select style={{ width: 128 }} options={dateRuleOpts} />
            </Form.Item>
            <Form.Item name="unit" label="日期单位">
              <Select
                style={{ width: 70 }}
                options={absRule ? dateAbsRuleUnitOpts : dateRelateRuleUnitOpts}
              />
            </Form.Item>
          </IFlexR>
          <IFlexR className="mb-4">
            {ruleType === DateRuleEnum.DAD ? (
              <Form.Item name="start" label="选择日期">
                <DatePicker format="YYYY-MM-DD" placeholder="选择日期" />
              </Form.Item>
            ) : ruleType === DateRuleEnum.DAR ? (
              <>
                <Form.Item name="start" label="选择范围">
                  <DatePicker format="YYYY-MM-DD" placeholder="开始日期" />
                </Form.Item>
                <span className="divide">~</span>
                <Form.Item name="end">
                  <DatePicker format="YYYY-MM-DD" placeholder="结束日期" />
                </Form.Item>
              </>
            ) : ruleType === DateRuleEnum.DRD ? (
              <Form.Item name="start" label="选择日期">
                <InputNumber placeholder="输入数字" />
              </Form.Item>
            ) : (
              <>
                <Form.Item name="start" label="选择范围">
                  <InputNumber placeholder="开始日期" />
                </Form.Item>
                <span className="divide">~</span>
                <Form.Item name="end">
                  <InputNumber placeholder="结束日期" />
                </Form.Item>
              </>
            )}
          </IFlexR>
          <Form.Item label="规则解析">
            {desc ? (
              <Typography.Text type="success">{desc}</Typography.Text>
            ) : (
              <Typography.Text type="warning">请选择日期筛选规则</Typography.Text>
            )}
          </Form.Item>
        </DateRuleForm>
      </Modal>
    </div>
  )
})

const DateRuleForm = styled(Form)({
  paddingTop: 12,
  ".ant-form-item": {
    marginBottom: 0,
  },
  ".divide": {
    margin: "0 6px",
  },
})
