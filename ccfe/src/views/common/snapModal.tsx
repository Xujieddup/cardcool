import React, { memo, useCallback, useEffect } from "react"
import type { RuleSnap } from "@/types"
import { App, Form, Input, Modal } from "antd"
import { GetDB, UseRuleSnap, useDBStore, useModelStore } from "@/store"

const dbSelector: GetDB = (state) => state.db
const ruleSnapSelector: UseRuleSnap = (state) => [state.ruleSnap, state.setRuleSnap]

export const SnapModal = memo(() => {
  const [form] = Form.useForm<RuleSnap>()
  const { message } = App.useApp()
  const db = useDBStore(dbSelector)
  const [ruleSnap, setRuleSnap] = useModelStore(ruleSnapSelector)
  useEffect(() => {
    if (ruleSnap) {
      form.setFieldsValue(ruleSnap)
    }
  }, [form, ruleSnap])
  const handleOk = useCallback(() => {
    const { viewId, ruleId, ruleName } = form.getFieldsValue()
    const name = ruleName.trim()
    if (!viewId || !ruleId) {
      message.error("参数异常，请刷新重试！")
      return
    }
    if (!name) {
      message.error("名称不能为空")
      return
    }
    db?.view.updateRuleSnapName(viewId, ruleId, ruleName).then(() => {
      setRuleSnap(undefined)
    })
  }, [db?.view, form, message, setRuleSnap])
  const handleCancel = useCallback(() => {
    setRuleSnap(undefined)
  }, [setRuleSnap])
  console.log("Render: DateRule")
  return (
    <Modal
      title="规则快照"
      open={!!ruleSnap}
      onOk={handleOk}
      onCancel={handleCancel}
      closable={false}
      width={300}
    >
      <Form name="ruleSnapForm" autoComplete="off" form={form}>
        <Form.Item name="viewId" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="ruleId" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="ruleName" noStyle>
          <Input className="mt-4 mb-4" placeholder="规则快照名称..." />
        </Form.Item>
      </Form>
    </Modal>
  )
})
