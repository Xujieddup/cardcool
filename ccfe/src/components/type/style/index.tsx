import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { App, Checkbox, Empty, Form, Input, Layout, Radio, Select, Typography } from "antd"
import styled from "@emotion/styled"
import { arrToMap, isEmpty, unid } from "@/utils"
import type {
  TypeProp,
  TypeInfo,
  EditStyleName,
  TypePropStyle,
  PropStyle,
  PropStyleLayout,
} from "@/types"
import { AddSmallBtn, IFlexRB } from "@/ui"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import cc from "classcat"
import { IIcon } from "@/icons"
import { PropHideEnum } from "@/enums"
import GridLayout from "react-grid-layout"
import { PropShow } from "../show"
import { StyleName } from "./name"
import { StyleList } from "./list"
import { baseNameTypes, hideOptions, nameHideOptions, nameTypes, showOptions } from "@/config"
import { calcContentHight, formatCardStyles, isBaseProp, tempParse } from "@/biz"

type Props = {
  typeInfo: TypeInfo
  saveTime: number
}

const dbSelector: GetDB = (state) => state.db

export const TypeStyles = memo(({ typeInfo, saveTime }: Props) => {
  const db = useDBStore(dbSelector)
  const { message } = App.useApp()

  const [styles, setStyles] = useState<TypePropStyle[]>([])
  const [styleId, setStyleId] = useState("")
  const styleInfo = useMemo(
    () => (styleId && styles.length ? styles.find((p) => p.id === styleId) : undefined),
    [styles, styleId]
  )
  // 新建或修改样式名称
  const [editStyleName, setEditStyleName] = useState<EditStyleName>()
  // 默认值表单
  const [iform] = Form.useForm()
  // 模板属性处理
  const layoutRef = useRef<GridLayout.Layout[] | null>(null)
  useEffect(() => {
    const ss = formatCardStyles(typeInfo)
    setStyles(ss)
    if (ss.length) {
      const first = ss[0]
      setStyleId(first.id)
      // 组装默认值
      const data: any = {}
      first.props.forEach((p) => {
        data[p.id] = p.id === "name" ? tempParse(p.defaultVal) : p.defaultVal
      })
      iform.setFieldsValue(data)
    } else {
      setStyleId("")
    }
  }, [iform, typeInfo])

  // 当前选择的模板属性 ID
  const [propId, setPropId] = useState("")
  const propInfo = useMemo(
    () => (propId && styleInfo?.props ? styleInfo.props.find((p) => p.id === propId) : undefined),
    [styleInfo?.props, propId]
  )
  const layouts = useMemo(() => styleInfo?.props.map((p) => p.layout) || [], [styleInfo?.props])
  // 是否是自定义属性: 卡片名称、标签、内容
  const baseProp = isBaseProp(propId)
  const propShowOptions = useMemo(
    () =>
      propInfo?.type
        ? showOptions.filter((o) => o.types.some((t) => t == propInfo.type))
        : showOptions,
    [propInfo?.type]
  )
  const [form] = Form.useForm<PropStyle>()
  useEffect(() => {
    if (propInfo) {
      form.setFieldsValue({ ...propInfo })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, propId])

  const changeName = useCallback(
    (id: string, name: string) => {
      setStyles((oldStyles) => {
        if (!id) {
          const newId = unid()
          setStyleId(newId)
          return [...oldStyles, { id: newId, name, props: typeInfo.props }]
        } else {
          return oldStyles.map((s) => (s.id === id ? { ...s, name } : s))
        }
      })
      setEditStyleName(undefined)
    },
    [typeInfo.props]
  )
  const copyStyle = useCallback((id: string) => {
    setStyles((oldStyles) => {
      const style = oldStyles.find((s) => s.id === id)
      if (style) {
        const newId = unid()
        setStyleId(newId)
        setEditStyleName({ id: newId, name: style.name })
        return [...oldStyles, { ...style, id: newId, name: style.name, props: [...style.props] }]
      }
      return oldStyles
    })
  }, [])
  const deleteStyle = useCallback((id: string) => {
    setStyles((oldStyles) => {
      const newStyles = oldStyles.filter((s) => s.id !== id)
      setStyleId((oldId) => (oldId === id ? (newStyles.length ? newStyles[0].id : "") : oldId))
      return newStyles
    })
  }, [])

  // 动态监听模板属性变更
  const handlePropChange = useCallback(
    (changedValues: any, values: PropStyle) => {
      // console.log("values", changedValues, values)
      setStyles((oldStyles) =>
        oldStyles.map((s) => {
          if (s.id === styleId) {
            return {
              ...s,
              props: s.props.map((p) => (p.id === values.id ? { ...p, ...changedValues } : p)),
            }
          } else {
            return s
          }
        })
      )
    },
    [styleId]
  )
  // 监听布局变更: 1. 判断 content 高度值是否需要更新
  const onLayoutChange = useCallback(
    (layouts: GridLayout.Layout[]) => {
      console.log("onLayoutChange", layouts)
      const [ch, nch] = calcContentHight(layouts)
      if (ch !== nch) {
        const newLayout = layouts.map((l) => (l.i === "content" ? { ...l, h: nch } : l))
        layoutRef.current = newLayout
      } else {
        layoutRef.current = layouts
      }
      // 组装属性信息和布局信息
      const layoutMap = arrToMap(layoutRef.current, "i")
      setStyles((oldStyles) => {
        return oldStyles.map((s) => {
          if (s.id === styleId) {
            const tps = s.props.map((p) => {
              const l = layoutMap.get(p.id)
              return l ? { ...p, layout: { ...l } } : p
            })
            return { ...s, props: tps }
          } else {
            return s
          }
        })
      })
    },
    [styleId]
  )
  // 触发保存逻辑
  useEffect(() => {
    if (saveTime > 0 && Date.now() - saveTime <= 1000 && layoutRef.current) {
      const typeStyles = styles.map((s) => {
        const styles: PropStyle[] = s.props.map((p) => {
          const { id, nameType, hide, show, layout } = p
          const styleLayout: PropStyleLayout = {
            w: layout.w,
            h: layout.h,
            x: layout.x,
            y: layout.y,
          }
          return { id, nameType, hide, show, layout: styleLayout }
        })
        const sortStyles = styles.sort((a: PropStyle, b: PropStyle) => {
          return a.layout.x < b.layout.x || a.layout.y < b.layout.y ? -1 : 1
        })
        return { id: s.id, name: s.name, styles: sortStyles }
      })
      const stylesStr = JSON.stringify(typeStyles)
      db?.type.updateTypeStyles(typeInfo.id, stylesStr).then(() => {
        message.success("卡片样式保存成功")
      })
    }
  }, [db?.type, message, saveTime, styles, typeInfo.id])
  // 初始化时会刷新三次: 初始化和两次 useEffect
  console.log("Render: TypeStyle", styleInfo)
  return (
    <Layout className="panelBody" hasSider>
      <Layout.Sider className="panelLeft" width={260}>
        <IFlexRB className="mb-2">
          <Typography.Text strong>样式列表</Typography.Text>
          <AddSmallBtn
            onClick={() => setEditStyleName({ id: "", name: "" })}
            icon={<IIcon icon="plus" fontSize={14} />}
            size="small"
          >
            新建
          </AddSmallBtn>
        </IFlexRB>
        {styles.length > 0 ? (
          <StyleList
            styles={styles}
            setStyles={setStyles}
            styleId={styleId}
            setStyleId={setStyleId}
            setEditStyleName={setEditStyleName}
            copyStyle={copyStyle}
            deleteStyle={deleteStyle}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请创建样式" />
        )}
      </Layout.Sider>
      <Layout.Content className="panelContent">
        <div className="cardBox">
          <Form form={iform}>
            <GridLayout
              onLayoutChange={onLayoutChange}
              cols={6}
              rowHeight={34}
              width={254}
              isDroppable={true}
              margin={[4, 2]}
              resizeHandles={["e"]}
              layout={layouts}
            >
              {styleInfo?.props.map((item) => {
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
          <Typography.Text strong>属性样式</Typography.Text>
        </IFlexRB>
        {propInfo ? (
          <Form form={form} onValuesChange={handlePropChange}>
            <Form.Item name="id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="nameType" label="属性名">
              <Select
                options={baseProp ? baseNameTypes : nameTypes}
                popupClassName="beforeSelect"
              />
            </Form.Item>
            {propShowOptions.length > 0 && (
              <Form.Item name="show" label="展示">
                <Checkbox.Group options={propShowOptions} />
              </Form.Item>
            )}
            <Form.Item name="hide" label="隐藏">
              <Radio.Group>
                {(propId === "name" ? nameHideOptions : hideOptions).map((i) => (
                  <Radio key={i.value} value={i.value}>
                    {i.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Form>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请选择属性" />
        )}
      </Layout.Sider>
      {editStyleName && (
        <StyleName
          editStyleName={editStyleName}
          setEditStyleName={setEditStyleName}
          changeName={changeName}
        />
      )}
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
    top: -6,
    left: -6,
    zIndex: 1,
  },
})
