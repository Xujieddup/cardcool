import React, { memo, useCallback, useEffect } from "react"
import { Typography, Switch, Form } from "antd"
import { IFlexRB } from "@/ui"
import styled from "@emotion/styled"
import { updateSystemConfApi } from "@/datasource"
import { UseSystemConfFunc, useConfigStore } from "@/store"
import { shallow } from "zustand/shallow"
import { SystemConf } from "@/types"

const systemConfSelector: UseSystemConfFunc = (state) => [state.systemConf, state.setSystemConf]

export const OtherSetting = memo(() => {
  const [systemConf, setSystemConf] = useConfigStore(systemConfSelector, shallow)
  const [form] = Form.useForm<SystemConf>()
  // 监听表单数据变更
  const handleValuesChange = useCallback(
    (changedValues: any, values: SystemConf) => {
      console.log("handleValuesChange", changedValues, values)
      const newSystemConf = { ...values }
      updateSystemConfApi(newSystemConf)
      setSystemConf(newSystemConf)
    },
    [setSystemConf]
  )
  useEffect(() => {
    form.setFieldsValue(systemConf)
  }, [form, systemConf])
  console.log("Render: SystemSetting")
  return (
    <Form name="systemConf" autoComplete="off" form={form} onValuesChange={handleValuesChange}>
      <ItemBox>
        <TextLabel type="secondary">微信浮动弹窗</TextLabel>
        <IFlexRB>
          <Typography.Text>是否显示右下角的微信浮动按钮</Typography.Text>
          <Form.Item name="wechatFloat" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </IFlexRB>
      </ItemBox>
    </Form>
  )
})

const ItemBox = styled("div")({
  marginBottom: 16,
  "&>div": {
    marginBottom: 4,
  },
})

const TextLabel = styled(Typography.Paragraph)({
  "&.ant-typography": {
    marginBottom: 6,
  },
})
