import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  App,
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  Layout,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd"
import styled from "@emotion/styled"
import { arrToMap, isEmpty, unid } from "@/utils"
import type { TypeProp, TypeInfo } from "@/types"
import { IFlexRB, IconBtn } from "@/ui"
import {
  AlignLeftOutlined,
  BarsOutlined,
  CalendarOutlined,
  DownCircleOutlined,
  ExclamationCircleFilled,
  LinkOutlined,
  LockOutlined,
  MobileOutlined,
  NumberOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import { SelectOption } from "./props/selectOption"
import cc from "classcat"
import { IIcon } from "@/icons"
import { PropHideEnum, isSelectProp } from "@/enums"
import GridLayout from "react-grid-layout"
import { PropDefault } from "./defaultProp"
import { PropShow } from "./show"
import { baseNameTypes, defaultTypeProps, handleOptions, nameTypes, showOptions } from "@/config"
import { calcContentHight, isBaseProp, tempParse } from "@/biz"

type Props = {
  typeInfo: TypeInfo
  saveTime: number
}
// 卡片属性模板列表
const propTypes = [
  {
    id: "text",
    icon: <AlignLeftOutlined />,
    label: "文本",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "password",
    icon: <LockOutlined />,
    label: "密码",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
  { id: "link", icon: <LinkOutlined />, label: "链接", layout: { w: 6, h: 1, minW: 3, maxH: 1 } },
  {
    id: "phone",
    icon: <MobileOutlined />,
    label: "手机",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "number",
    icon: <NumberOutlined />,
    label: "数字",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "date",
    icon: <CalendarOutlined />,
    label: "日期",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "select",
    icon: <DownCircleOutlined />,
    label: "单选",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
  {
    id: "mselect",
    icon: <BarsOutlined />,
    label: "多选",
    layout: { w: 6, h: 1, minW: 3, maxH: 1 },
  },
]

const dbSelector: GetDB = (state) => state.db

export const TypeStruct = memo(({ typeInfo, saveTime }: Props) => {
  const db = useDBStore(dbSelector)
  const { message, modal } = App.useApp()
  // 拖拽属性时确定属性尺寸
  const [dragSize, setDragSize] = useState({ i: "", w: 6, h: 1 })
  // 选择的模板的属性信息
  const [typeProps, setTypeProps] = useState<TypeProp[]>([])
  // 当前选择的模板属性 ID
  const [propId, setPropId] = useState("")
  const propInfo = useMemo(
    () => (propId ? typeProps.find((p) => p.id === propId) : undefined),
    [typeProps, propId]
  )
  // 是否是自定义属性: 卡片名称、标签、内容
  const baseProp = isBaseProp(propId)
  const propHandleOptions = useMemo(
    () =>
      propInfo
        ? handleOptions.filter((o) => o.types.some((t) => t == propInfo.type))
        : handleOptions,
    [propInfo]
  )
  const propShowOptions = useMemo(
    () =>
      propInfo ? showOptions.filter((o) => o.types.some((t) => t == propInfo.type)) : showOptions,
    [propInfo]
  )
  const showSelectOption = isSelectProp(propInfo?.type)
  const [form] = Form.useForm()
  useEffect(() => {
    if (propInfo) {
      // console.log("reset form", propInfo)
      // 因为链接和单选的 defaultVal 为 undefined，所以会被忽略，从而使用上一个表单的 defaultVal，所以需要显示赋值
      form.setFieldsValue({ ...propInfo, defaultVal: propInfo.defaultVal })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, propId])
  // 布局配置
  const [layouts, setLayouts] = useState<GridLayout.Layout[]>([])
  // 模板属性处理
  const layoutRef = useRef<GridLayout.Layout[] | null>(null)
  // 默认值表单
  const [iform] = Form.useForm()
  useEffect(() => {
    const propList = typeInfo.props
    setTypeProps(propList)
    const layoutList = propList.map((p) => p.layout)
    layoutRef.current = layoutList
    setLayouts(layoutList)
    // 组装默认值
    const data: any = {}
    propList.forEach((p) => {
      data[p.id] = p.id === "name" ? tempParse(p.defaultVal) : p.defaultVal
    })
    iform.setFieldsValue(data)
  }, [iform, typeInfo])

  // 动态监听模板属性变更
  const handlePropChange = useCallback(
    (changedValues: any, values: TypeProp) => {
      // console.log("values", changedValues, values)
      setTypeProps((oldProps) =>
        oldProps.map((p) => (p.id === values.id ? { ...p, ...changedValues } : p))
      )
      if (values.id !== "tags" && values.id !== "content" && "defaultVal" in changedValues) {
        iform.setFieldValue(
          values.id,
          values.id === "name" ? tempParse(changedValues.defaultVal) : changedValues.defaultVal
        )
      }
    },
    [iform]
  )
  // 删除属性
  const deleteProp = useCallback((pId: string) => {
    setTypeProps((oldProps) => oldProps.filter((p) => p.id !== pId))
  }, [])
  // 监听布局变更（属性拖拽、调整尺寸、每次外部拖入元素、代码改变都将触发）: 1. 判断 content 高度值是否需要更新
  const onLayoutChange = useCallback((layouts: GridLayout.Layout[]) => {
    console.log("onLayoutChange", layouts)
    const [ch, nch] = calcContentHight(layouts)
    if (ch !== nch) {
      const newLayout = layouts.map((l) => (l.i === "content" ? { ...l, h: nch } : l))
      setLayouts(newLayout)
      layoutRef.current = newLayout
    } else {
      layoutRef.current = layouts
    }
  }, [])
  // 拖拽增加属性项
  const onDrop = useCallback(
    (layouts: GridLayout.Layout[], layoutItem: GridLayout.Layout, event: any) => {
      console.log("onDrop", layouts, layoutItem)
      const typeId: string = event.dataTransfer.getData("type")
      const typeProp = defaultTypeProps.find((i) => i.type === typeId)
      if (typeProp) {
        const pId = unid()
        const prop: TypeProp = { ...typeProp, id: pId }
        setTypeProps((oldProps) => [...oldProps, prop])
        const [ch, nch] = calcContentHight(layouts, true)
        setLayouts(
          layouts.map((l) => {
            if (l.i === "new_prop") {
              return { ...l, i: pId, minW: typeProp.layout.minW, maxH: typeProp.layout.maxH }
            } else if (l.i === "content" && ch !== nch) {
              return { ...l, h: nch }
            } else {
              return l
            }
          })
        )
        setPropId(pId)
      }
    },
    []
  )
  const saveStruct = useCallback(
    (typeId: string, typeProps: TypeProp[]) => {
      if (!typeId) {
        message.error("参数异常，请刷新后重试")
        return
      }
      db?.card.getTypeCardCnt(typeId).then((cardCnt) => {
        if (cardCnt > 0) {
          modal.confirm({
            title: "确认修改卡片模板？",
            icon: <ExclamationCircleFilled />,
            content: "一经修改，将影响使用该模板的所有卡片！请慎重确认！",
            okText: "确认",
            cancelText: "取消",
            async onOk() {
              const props = JSON.stringify(typeProps)
              await db?.type.updateTypeProp(typeId, props)
              message.success("卡片模板保存成功")
            },
          })
        } else {
          const props = JSON.stringify(typeProps)
          db?.type.updateTypeProp(typeId, props).then(() => {
            message.success("卡片模板保存成功")
          })
        }
      })
    },
    [db, message, modal]
  )
  // 触发保存逻辑
  useEffect(() => {
    if (saveTime > 0 && Date.now() - saveTime <= 1000 && layoutRef.current) {
      // 组装属性信息和布局信息
      const layoutMap = arrToMap(layoutRef.current, "i")
      const tps = typeProps.map((p) => {
        const l = layoutMap.get(p.id)
        if (l) {
          const { i, w, h, x, y, minW, maxH } = l
          p.layout = { i, w, h, x, y, minW, maxH }
        }
        return p
      })
      const sortTps = tps.sort((a: TypeProp, b: TypeProp) => {
        if (a.layout.y < b.layout.y) {
          return -1
        } else if (a.layout.y === b.layout.y) {
          return a.layout.x < b.layout.x ? -1 : 1
        } else {
          return 1
        }
      })
      saveStruct(typeInfo.id, sortTps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveStruct, saveTime, typeInfo.id])
  // 初始化时会刷新三次: 初始化和两次 useEffect
  // console.log("Render: struct", propInfo)
  return (
    <Layout className="panelBody" hasSider>
      <Layout.Sider className="panelLeft" width={260}>
        <div className="panelLeftTitle">
          <Typography.Text strong>
            {"选择属性 "}
            <Tooltip title="选择属性拖拽至中间的卡片模板">
              <QuestionCircleOutlined />
            </Tooltip>
          </Typography.Text>
        </div>
        <Space className="panelLeftBody" wrap>
          {propTypes.map((t) => (
            <Button
              key={t.id}
              icon={t.icon}
              draggable={true}
              unselectable="on"
              style={{ width: 118 }}
              onDragStart={(e) => {
                setDragSize({ i: "new_prop", w: t.layout.w, h: t.layout.h })
                e.dataTransfer.setData("text/plain", "")
                e.dataTransfer.setData("type", t.id)
              }}
            >
              {t.label}
            </Button>
          ))}
        </Space>
      </Layout.Sider>
      <Layout.Content className="panelContent">
        <div className="cardBox">
          <Form form={iform}>
            <GridLayout
              layout={layouts}
              onLayoutChange={onLayoutChange}
              onDrop={onDrop}
              cols={6}
              rowHeight={34}
              width={254}
              isDroppable={true}
              margin={[4, 2]}
              resizeHandles={["e"]}
              droppingItem={dragSize}
            >
              {typeProps.map((item) => {
                const hide =
                  item.hide === PropHideEnum.ALLHIDE ||
                  (item.hide === PropHideEnum.EMPTYHIDE && isEmpty(item.defaultVal))
                return (
                  <TypeProp
                    key={item.id}
                    onClick={() => setPropId(item.id)}
                    className={cc([
                      "propActivite",
                      {
                        selected: propId === item.id,
                        hideProp: hide,
                      },
                    ])}
                  >
                    <PropShow item={item} />
                  </TypeProp>
                )
              })}
            </GridLayout>
          </Form>
        </div>
      </Layout.Content>
      <Layout.Sider className="panelRight" width={260}>
        <IFlexRB className="mb-2" style={{ height: 24 }}>
          <Typography.Text strong>属性设置</Typography.Text>
          {!baseProp && (
            <Tooltip title="删除属性" placement="left">
              <IconBtn
                onClick={() => deleteProp(propId)}
                type="text"
                size="small"
                icon={<IIcon icon="delete" fontSize={15} />}
              />
            </Tooltip>
          )}
        </IFlexRB>
        {propInfo ? (
          <Form form={form} onValuesChange={handlePropChange}>
            <Form.Item name="id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="type" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="name" label="属性名">
              <Input
                addonBefore={
                  <Form.Item name="nameType" noStyle>
                    <Select
                      options={baseProp ? baseNameTypes : nameTypes}
                      popupClassName="beforeSelect"
                    />
                  </Form.Item>
                }
              />
            </Form.Item>
            {showSelectOption && (
              <Form.Item name="options" label="选项值">
                <SelectOption />
              </Form.Item>
            )}
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.id !== curValues.id || prevValues.options !== curValues.options
              }
            >
              {() => {
                return (
                  <Form.Item label="默认值" name="defaultVal">
                    <PropDefault />
                  </Form.Item>
                )
              }}
            </Form.Item>
            {propHandleOptions.length > 0 && (
              <Form.Item name="handles" label="操作">
                <Checkbox.Group options={propHandleOptions} />
              </Form.Item>
            )}
            {propShowOptions.length > 0 && (
              <Form.Item name="show" label="展示">
                <Checkbox.Group options={propShowOptions} />
              </Form.Item>
            )}
            <Form.Item name="hide" noStyle>
              <Input type="hidden" />
            </Form.Item>
            {/* <Form.Item name="hide" label="隐藏">
              <Radio.Group>
                {(propId === "name" ? nameHideOptions : hideOptions).map((i) => (
                  <Radio key={i.value} value={i.value}>
                    {i.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item> */}
          </Form>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择属性" />
        )}
      </Layout.Sider>
    </Layout>
  )
})

const TypeProp = styled(IFlexRB)({
  padding: "1px 2px",
  marginBottom: 1,
  borderRadius: 4,
  border: "1px solid transparent",
  position: "relative",
  ".propFixed": {
    position: "absolute",
    top: -11,
    left: -11,
    zIndex: 1,
  },
})
