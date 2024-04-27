import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { App, Button, Form, Input, Radio, Select, Space } from "antd"
import { useConfigStore, useDBStore, useModelStore } from "@/store"
import type { UseMEditView, GetDB, SViewOp, GetViewConfFunc } from "@/store"
import { shallow } from "zustand/shallow"
import { CardModalContainer } from "@/components/ui"
import styled from "@emotion/styled"
import type { FlattenedItem, RuleItem, ViewItem } from "@/types"
import { convertData } from "./sort"
import { IText } from "@/ui"
import { IIcon } from "@/icons"
import { defaultViewCfg } from "@/config"
import { OpEnum, ViewInlineType, ViewTypeEnum } from "@/enums"
import { useWatch } from "antd/es/form/Form"

// 编辑的模板结构
type EditType = {
  id: string
  spaceId: string
  pid: string
  type: number
  inlineType: ViewInlineType
  name: string
  desc: string
}
type ViewType = {
  id: string
  pid: string
  snum: number
  inlineType: ViewInlineType
  forbidInline: boolean // 是否禁止选择内联视图
}

const dbSelector: GetDB = (state) => state.db
const selector: UseMEditView = (state) => [state.mEditView, state.setMEditView, state.refreshMenu]
const viewOpSelector: SViewOp = (state) => state.setViewOp
const viewConfSelector: GetViewConfFunc = (state) => state.viewConf

const viewOpt = {
  value: "",
  label: (
    <IText ellipsis>
      <IIcon icon="board" />
      视图集
    </IText>
  ),
}
const typeOptions = [
  { label: "文档", value: ViewTypeEnum.DOC },
  { label: "大纲", value: ViewTypeEnum.MDOC },
  { label: "白板", value: ViewTypeEnum.BOARD },
  { label: "列表", value: ViewTypeEnum.LIST },
  { label: "看板", value: ViewTypeEnum.KANBAN },
  { label: "甘特", value: ViewTypeEnum.GANTT },
]
const inlineTypeOptions = [
  { label: "一般视图", value: ViewInlineType.NOTINLINE },
  { label: "内联视图", value: ViewInlineType.INLINE },
]

export const ViewEdit = memo(() => {
  const db = useDBStore(dbSelector)
  const { message } = App.useApp()
  const [form] = Form.useForm<EditType>()
  const [mEditView, setMEditView, refreshMenu] = useModelStore(selector, shallow)
  const setViewOp = useDBStore(viewOpSelector)
  const viewConf = useConfigStore(viewConfSelector)
  const initCfg = useMemo(() => (mEditView ? mEditView.config : undefined), [mEditView])
  const [views, setViews] = useState<FlattenedItem[]>([])
  const [view, setView] = useState<ViewType>()
  const opts = useMemo(() => {
    if (!mEditView || !views.length) {
      return [viewOpt]
    }
    // 判断视图选项深度，undefined-不检查
    let checkDepth: number | undefined = undefined
    const viewOpts = views.map((v) => {
      let disabled = false
      // 修改视图时，需要限定上级视图不能为当前视图及其子视图
      if (mEditView.viewId !== "") {
        if (v.id === mEditView.viewId) {
          disabled = true
          checkDepth = v.depth
        } else if (checkDepth !== undefined) {
          if (v.depth > checkDepth) {
            disabled = true
          } else {
            checkDepth = undefined
          }
        }
      }
      return {
        value: v.id,
        label: (
          <IText ellipsis style={{ marginLeft: (v.depth + 1) * 14 }}>
            <IIcon icon={v.icon} />
            {v.name}
          </IText>
        ),
        disabled,
      }
    })
    return [viewOpt, ...viewOpts]
  }, [mEditView, views])
  const typeOpts = useMemo(() => {
    if (mEditView) {
      return typeOptions.map((o) => ({
        ...o,
        disabled:
          mEditView.viewId !== "" ||
          (mEditView.allowTypes !== undefined && o.value === ViewTypeEnum.BOARD),
      }))
    } else {
      return typeOptions
    }
  }, [mEditView])
  useEffect(() => {
    // console.log("mEditView", mEditView)
    if (mEditView !== undefined) {
      // viewId 为 "" 表示新增，否则表示修改
      if (mEditView.viewId === "") {
        form.setFieldsValue({
          id: "",
          spaceId: mEditView.spaceId,
          pid: mEditView.pid || "",
          type: mEditView.currType !== undefined ? mEditView.currType : ViewTypeEnum.DOC,
          inlineType: mEditView.inlineType || ViewInlineType.NOTINLINE,
          name: "",
          desc: "",
        })
      } else {
        db?.view.getViewAndInlineViews(mEditView.viewId).then((views) => {
          if (views.length) {
            const v = views[0]
            form.setFieldsValue({
              id: v.id,
              spaceId: v.space_id,
              pid: v.pid,
              type: v.type,
              inlineType: v.inline_type,
              name: v.name === "未命名" ? "" : v.name,
              desc: v.desc,
            })
            setView({
              id: v.id,
              pid: v.pid,
              snum: v.snum,
              inlineType: v.inline_type,
              forbidInline: views.length > 1,
            })
          }
        })
      }
      db?.view.getMenuViews(mEditView.spaceId).then((vs) => {
        const viewList: ViewItem[] = vs.map((v) => ({
          id: v.id,
          name: v.name,
          pid: v.pid,
          snum: v.snum,
          type: v.type,
          icon: v.icon,
          is_favor: v.is_favor,
          children: [],
        }))
        const views = convertData(viewList)
        setViews(views)
      })
    }
  }, [db, form, mEditView])
  const handleCancel = useCallback(() => {
    setMEditView()
  }, [setMEditView])
  const handleFinish = useCallback(() => {
    const {
      id,
      spaceId,
      pid,
      type,
      inlineType = ViewInlineType.NOTINLINE,
      name,
      desc,
    } = form.getFieldsValue()
    const viewName = name.trim()
    const viewDesc = desc.trim()
    if (!viewName) {
      message.error("名称不能为空")
      return
    }
    if (viewName.length > 32) {
      message.error("名称不能超过32个字符")
      return
    }
    if (viewDesc.length > 128) {
      message.error("简介不能超过128个字符")
      return
    }
    if (!pid && inlineType === ViewInlineType.INLINE) {
      message.error("视图集下不能创建内联视图")
      return
    }
    if (id === "") {
      if (!spaceId) {
        message.error("创建视图异常，请刷新重试")
        return
      }
      const snum = (views.findLast((v) => v.pid === pid)?.snum || 0) + 10000
      let config: any = {}
      if (initCfg && type !== ViewTypeEnum.BOARD) {
        const { ruleId, gantt, rules: ruleList, kanbanRules } = initCfg
        let rules: RuleItem[] = []
        if (type === ViewTypeEnum.LIST) {
          rules = ruleList
        } else if (type === ViewTypeEnum.KANBAN) {
          rules = kanbanRules
        } else if (type === ViewTypeEnum.GANTT && ruleList.length > 0) {
          ruleList[0].gantt = gantt
          rules = ruleList
        }
        config = { ruleId, rules }
      } else {
        config = defaultViewCfg
      }
      const cfg = JSON.stringify(config)
      db?.view
        .createView(spaceId, pid, type, inlineType, snum, viewName, viewDesc, cfg)
        .then((v) => {
          message.success("创建视图成功")
          setMEditView()
          refreshMenu(v.id)
        })
    } else {
      if (!view) {
        message.error("修改视图出现异常，请刷新重试")
        return
      }
      let queryInlineSnum = false
      let snum = view.snum
      if (inlineType === ViewInlineType.INLINE) {
        // 一般视图变为内联视图，或主视图变更的内联视图，修改时需要先查询所有内联视图的最大 snum
        if (view.inlineType === ViewInlineType.NOTINLINE || pid !== view.pid) {
          queryInlineSnum = true
        }
      } else {
        // 内联视图变为一般视图，或上级视图变更的一般视图，修改更新 snum
        if (view.inlineType === ViewInlineType.INLINE || pid !== view.pid) {
          snum = (views.findLast((v) => v.pid === pid)?.snum || 0) + 10000
        }
      }
      db?.view.editView(id, pid, inlineType, viewName, viewDesc, snum, queryInlineSnum).then(() => {
        message.success("修改视图成功")
        setViewOp({ op: OpEnum.UPDATE, ids: [id] })
        setMEditView()
        refreshMenu()
      })
    }
  }, [db?.view, view, form, initCfg, message, refreshMenu, setMEditView, views, setViewOp])
  const inlineType = useWatch("inlineType", form)
  const pid = useWatch("pid", form) ?? ""
  // 当前视图存在内联视图，或指定上级视图为视图集时，不允许选择内联视图
  const inlineTypeOpts = useMemo(
    () =>
      view?.forbidInline || !pid
        ? inlineTypeOptions.map((o) => ({ ...o, disabled: o.value === ViewInlineType.INLINE }))
        : inlineTypeOptions,
    [pid, view]
  )
  // 动态监听类型属性变更
  const handleFormChange = useCallback(
    (changedValues: any, values: EditType) => {
      if (!values.pid && values.inlineType === ViewInlineType.INLINE) {
        form.setFieldValue("inlineType", ViewInlineType.NOTINLINE)
      }
    },
    [form]
  )
  console.log("Render: TypeEdit")
  return mEditView ? (
    <CardModalContainer
      title={mEditView.viewId === "" ? "新建视图" : "编辑视图"}
      open={true}
      onCancel={handleCancel}
      footer={null}
      width={400}
    >
      <Form
        name="viewEdit"
        autoComplete="off"
        form={form}
        onValuesChange={handleFormChange}
        onFinish={handleFinish}
      >
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="spaceId" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Space direction="vertical" size="middle" style={{ width: "100%", paddingTop: 16 }}>
          <Form.Item noStyle>
            <Form.Item name="icon" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="name" noStyle>
              <Input placeholder="视图名称" />
            </Form.Item>
          </Form.Item>
          <Form.Item name="type" label="视图类型" style={{ marginBottom: 0 }}>
            <Radio.Group options={typeOpts} />
          </Form.Item>
          {(viewConf.inlineView || view?.inlineType === ViewInlineType.INLINE) && (
            <Form.Item name="inlineType" label="内联视图" style={{ marginBottom: 0 }}>
              <Radio.Group options={inlineTypeOpts} />
            </Form.Item>
          )}
          <Form.Item
            name="pid"
            label={inlineType === ViewInlineType.INLINE ? "主视图" : "上级视图"}
            style={{ marginBottom: 0 }}
          >
            <ViewSelect options={opts} />
          </Form.Item>
          <Form.Item name="desc" noStyle>
            <Input.TextArea rows={4} placeholder="视图简介（选填）" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {mEditView.viewId === "" ? "新建" : "确认"}
          </Button>
        </Space>
      </Form>
    </CardModalContainer>
  ) : null
})

export const ViewSelect = styled(Select)({
  ".ant-select-selection-item .ant-typography": {
    marginLeft: "4px!important",
    verticalAlign: "inherit",
  },
})
