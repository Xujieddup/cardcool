import React, { memo, useCallback, useEffect } from "react"
import { Typography, Switch, Form } from "antd"
import { IFlexRB } from "@/ui"
import styled from "@emotion/styled"
import { updateViewConfApi } from "@/datasource"
import { UseViewConfFunc, useConfigStore } from "@/store"
import { shallow } from "zustand/shallow"
import { ViewConf } from "@/types"

const viewConfSelector: UseViewConfFunc = (state) => [state.viewConf, state.setViewConf]

export const ViewSetting = memo(() => {
  const [viewConf, setViewConf] = useConfigStore(viewConfSelector, shallow)
  const [form] = Form.useForm<ViewConf>()
  // 监听表单数据变更
  const handleValuesChange = useCallback(
    (changedValues: any, values: ViewConf) => {
      console.log("handleValuesChange", changedValues, values)
      const newViewConf = { ...values }
      updateViewConfApi(newViewConf)
      setViewConf(newViewConf)
    },
    [setViewConf]
  )
  useEffect(() => {
    form.setFieldsValue(viewConf)
  }, [form, viewConf])
  console.log("Render: ViewSetting")
  return (
    <Form name="viewConf" autoComplete="off" form={form} onValuesChange={handleValuesChange}>
      <ItemBox>
        <TextLabel type="secondary">视图功能</TextLabel>
        <IFlexRB>
          <Typography.Text>启用内联视图功能</Typography.Text>
          <Form.Item name="inlineView" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </IFlexRB>
        <IFlexRB>
          <Typography.Text>启用视图快照功能</Typography.Text>
          <Form.Item name="viewSnap" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </IFlexRB>
      </ItemBox>
      <ItemBox>
        <TextLabel type="secondary">卡片盒设置</TextLabel>
        <IFlexRB>
          <Typography.Text>卡片盒默认展示所有未命名的卡片</Typography.Text>
          <Form.Item name="showUnnamed" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </IFlexRB>
      </ItemBox>
      <ItemBox>
        <TextLabel type="secondary">白板设置</TextLabel>
        <IFlexRB>
          <Typography.Text>拖拽节点时显示辅助线</Typography.Text>
          <Form.Item name="helperLine" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </IFlexRB>
        <IFlexRB>
          <Typography.Text>拖拽文本、卡片、视图节点到导图后自动折叠</Typography.Text>
          <Form.Item name="mindAutoFold" valuePropName="checked" noStyle>
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
