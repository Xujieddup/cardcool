import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from "react"
import { useHistory } from "react-router-dom"
import styled from "@emotion/styled"
import { App, Dropdown, Form, Input, MenuProps, Select, Tooltip } from "antd"
import copy from "copy-to-clipboard"
import { shallow } from "zustand/shallow"
import { useDBStore, useModelStore } from "@/store"
import type { GetDBTypes, UseMCardId, SCardOp } from "@/store"
import type { Card, FormNode, PropObj } from "@/types"
import { EditorBox, IFlexC, IFlexRB } from "@/ui"
import {
  TextProp,
  PasswordProp,
  SelectProp,
  MSelectProp,
  NumberProp,
  LinkProp,
  PhoneProp,
  DateProp,
} from "./props"
import { arrToMap, formatLinkData, isEmpty, isMac } from "@/utils"
import { CardDrawer } from "./drawer"
import { DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons"
import { IIcon } from "@/icons"
import { Editor, EditorContent } from "@tiptap/react"
import { deleteCard, getLocalSpaceId, getLocalTypeId } from "@/datasource"
import { IText, IconBtn } from "@/ui"
import { useHotkeys } from "react-hotkeys-hook"
import { OpEnum } from "@/enums"
import { CardTag } from "./tag"
import { parseLinkCardId } from "@/utils"
import { initValue } from "@/config"
import cc from "classcat"
import { getPropGridRow, isBaseProp, isEmptyContent, isEmptyProps, tempParse } from "@/biz"
import { CardExtensions, TextMenu } from "@/editor"
import { useDebounceCallback } from "@react-hook/debounce"

const selector: UseMCardId = (state) => [state.mCardId, state.setMCardId]
const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const cardOpSelector: SCardOp = (state) => state.setCardOp

const moreItems: MenuProps["items"] = [
  {
    type: "divider",
  },
  {
    key: "delete",
    icon: <DeleteOutlined />,
    danger: true,
    label: "删除",
  },
]

export const ICard: React.FC = memo(() => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const { message, modal } = App.useApp()
  // 初始化编辑的卡片
  const [mCardId, setMCardId] = useModelStore(selector, shallow)
  const setCardOp = useDBStore(cardOpSelector)
  const open = mCardId !== undefined
  const [full, setFull] = useState(false)
  const handleSwitchFull = useCallback(() => {
    setFull((f) => !f)
  }, [])

  const cardRef = useRef<Card | null>(null)
  const [form] = Form.useForm()
  // 编辑状态，0-未编辑，1-编辑中
  const editStatusRef = useRef(0)
  const typeId = Form.useWatch("type_id", form)
  const prevTypeId = useRef<string>()
  const typeProps = useMemo(
    () => types.find((item) => item.id === typeId)?.props2 || [],
    [types, typeId]
  )
  const gridRows = useMemo(() => getPropGridRow(typeProps), [typeProps])
  const editor = useMemo(() => new Editor({ extensions: CardExtensions() }), [])
  // 更新卡片，并判断是否跳转到新卡片(false 表示不跳转，undefined 表示关闭，"" 表示新建，"xxx" 表示跳转)
  const updateCard = useCallback(
    (jumpCardId: string | false | undefined) => {
      // console.log("editor?.getJSON(): ", jumpCardId, editStatusRef.current, editor?.getJSON())
      // 已保存后，避免再次保存
      if (editStatusRef.current !== 1) {
        jumpCardId !== false && setMCardId(jumpCardId)
        return
      }
      editStatusRef.current = 0
      const data: any = form.getFieldsValue()
      // 卡片名字不能超过64个字符
      const name: string = data.name.trim().substring(0, 64)
      // 标签不能超过8个
      const tags: string[] = data.tags.slice(0, 8)
      const tId = data.type_id
      // 卡片内容
      const cont = editor?.getJSON() || undefined
      const contentJson = cont && editor?.getText() !== "" ? JSON.stringify(cont) : "{}"
      // 卡片内容中的双链卡片 ID
      const linkCardIds = parseLinkCardId(cont)
      // 卡片属性
      const props: PropObj = {}
      types
        .find((t) => t.id === tId)
        ?.props.forEach((typeProp) => {
          if (!isBaseProp(typeProp.id)) {
            props[typeProp.id] = data[typeProp.id as keyof typeof data]
          }
        })
      props.links = linkCardIds.length ? linkCardIds : undefined
      const propsJson = JSON.stringify(props)
      // data.id 为 "" 表示新增卡片
      if (!data.id) {
        db?.card
          .createNewCard(getLocalSpaceId(), name, data.type_id, tags, propsJson, contentJson)
          .then((newCard) => {
            if (newCard) {
              setCardOp({ id: newCard.id, op: OpEnum.ADD })
              jumpCardId !== false ? setMCardId(jumpCardId) : form.setFieldValue("id", newCard.id)
            } else {
              message.error("创建卡片出现异常，请刷新后重试")
            }
          })
      } else {
        // 对比卡片是否需要更新
        let needUpdate = true
        if (cardRef.current) {
          const { id, type_id, name: oldName, tags: oldTags, props, content } = cardRef.current
          needUpdate =
            id !== data.id ||
            type_id !== data.type_id ||
            oldName !== name ||
            JSON.stringify(oldTags) !== JSON.stringify(tags) ||
            props !== propsJson ||
            content !== contentJson
        }
        if (needUpdate) {
          console.log("Need Update node", data.id)
          db?.card
            .updateCard(data.id, name, data.type_id, tags, propsJson, contentJson)
            .then((newCard) => {
              if (newCard) {
                setCardOp({ id: newCard.id, op: OpEnum.UPDATE })
                jumpCardId !== false && setMCardId(jumpCardId)
              } else {
                message.error("编辑卡片出现异常，请刷新后重试")
              }
            })
        } else {
          console.log("Not Need Update node", data.id)
          jumpCardId !== false && setMCardId(jumpCardId)
        }
      }
    },
    [db?.card, editor, form, message, setCardOp, setMCardId, types]
  )
  // 5s 内没有编辑，则触发自动保存
  const updateCardData = useDebounceCallback(updateCard, 5000)
  const delayUpdateCard = useCallback(() => {
    editStatusRef.current = 1
    updateCardData(false)
  }, [updateCardData])
  // 禁用默认的 Ctrl+S 逻辑(保存页面)
  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.key === "Tab") e.preventDefault()
      else if (e.key === "Escape") {
        e.stopPropagation()
        updateCard(undefined)
      } else if (e.key === "s" && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        updateCard(false)
      }
    },
    [updateCard]
  )
  // 每次 viewId 更新之后，会尝试更新文档内容，另外添加浏览器关闭事件监听
  useEffect(() => {
    let fn: any, autoSave: any
    if (mCardId !== undefined) {
      fn = () => updateCard(false)
      window.addEventListener("beforeunload", fn)
      autoSave = setInterval(fn, 120000)
    }
    return () => {
      fn && window.removeEventListener("beforeunload", fn)
      autoSave && clearInterval(autoSave)
      updateCard(false)
    }
  }, [updateCard, mCardId])
  useEffect(() => {
    if (editor) {
      editor.on("create", () => {
        // console.log("onCreate", editor)
        editStatusRef.current = 0
      })
      editor.on("update", () => {
        // console.log("onUpdate", editor)
        delayUpdateCard()
      })
      // editor.on("destroy", () => {
      //   updateViewContent(viewId)
      // })
    }
  }, [delayUpdateCard, editor])
  useEffect(() => {
    if (mCardId !== undefined) {
      setFull(false)
      form.resetFields()
      db?.card.getCardById(mCardId).then((card) => {
        if (!card) {
          message.error("查询卡片信息失败")
          setMCardId()
          return
        }
        cardRef.current = card
        const { id, type_id, name, tags, props, content } = card
        // 处理卡片模板
        let tId = name === "" && type_id === "default" ? getLocalTypeId() : type_id
        const typeInfo = types.find((item) => item.id === tId)
        // 已经删除的模板，自动重置为 default
        if (!typeInfo) tId = "default"
        const propsData = JSON.parse(props)
        let contentData = null
        let data: FormNode
        prevTypeId.current = tId
        const propMap = arrToMap(typeInfo?.props2 || [], "id")
        // 设置卡片属性
        // 判定为新卡片，自动填充默认值
        if (isEmptyProps(props) && tId !== "default" && typeInfo) {
          // 卡片属性
          const propObj: PropObj = {}
          typeInfo.props2.forEach((typeProp) => {
            if (!isBaseProp(typeProp.id)) {
              propObj[typeProp.id] = isEmpty(propsData[typeProp.id])
                ? typeProp.type === "date"
                  ? tempParse(typeProp.defaultVal)
                  : typeProp.defaultVal
                : propsData[typeProp.id]
            }
          })
          data = {
            id,
            name: name || tempParse(propMap.get("name")?.defaultVal),
            type_id: tId,
            tags: tags.length ? tags : propMap.get("tags")?.defaultVal || [],
            ...propObj,
          }
          contentData = isEmptyContent(content)
            ? propMap.get("content")?.defaultVal || initValue
            : JSON.parse(content)
        } else {
          data = { id, name, type_id: tId, tags, ...propsData }
          contentData = isEmptyContent(content) ? initValue : JSON.parse(content)
        }
        form.setFieldsValue(data)
        if (editor) {
          editor.storage.placeholder.text = propMap.get("content")?.name || ""
          editor.commands.setContent(contentData)
        }
      })
    } else {
      cardRef.current = null
    }
  }, [db?.card, editor, form, mCardId, message, setMCardId, types])
  // 类型切换之后，填充默认值
  useEffect(() => {
    // console.log("typeId change", typeId, cardRef.current, prevTypeId.current)
    if (typeId) {
      if (cardRef.current && prevTypeId.current !== typeId) {
        prevTypeId.current = typeId
        const { id, name, tags, props, content } = cardRef.current
        // 判定为新卡片，自动填充默认值
        const typeInfo = types.find((item) => item.id === typeId)
        const propMap = arrToMap(typeInfo?.props2 || [], "id")
        if (isEmptyProps(props) && typeInfo) {
          // 卡片属性
          const propObj: PropObj = {}
          const propsData = JSON.parse(props)
          typeInfo.props2.forEach((typeProp) => {
            if (!isBaseProp(typeProp.id)) {
              propObj[typeProp.id] = isEmpty(propsData[typeProp.id])
                ? typeProp.type === "date"
                  ? tempParse(typeProp.defaultVal)
                  : typeProp.defaultVal
                : propsData[typeProp.id]
            }
          })
          const data: FormNode = {
            id,
            name: name || tempParse(propMap.get("name")?.defaultVal),
            type_id: typeId,
            tags: tags.length ? tags : propMap.get("tags")?.defaultVal || [],
            ...propObj,
          }
          const contentData = isEmptyContent(content)
            ? propMap.get("content")?.defaultVal || initValue
            : JSON.parse(content)
          form.setFieldsValue(data)
          editor?.commands.setContent(contentData)
        }
        if (editor) {
          editor.storage.placeholder.text = propMap.get("content")?.name || ""
          editor.commands.focus()
        }
      }
    }
  }, [editor, form, typeId, types])
  const handleCopy = useCallback(
    (propId: string, propType?: string) => {
      let text = form.getFieldValue(propId)
      if (propType === "link") {
        const link = formatLinkData(text)
        text = link.link || ""
      }
      const copyRes = copy(text)
      copyRes && message.success("复制成功")
      console.log("handle Copy", propId, copyRes)
    },
    [form, message]
  )
  const handleCallPhone = useCallback(
    (propId: string) => {
      const phone = form.getFieldValue(propId)
      if (/^1[3456789]\d{9}$/.test(phone)) {
        console.log("phone", phone)
        window.open(`tel:${phone}`, "_blank")
      }
    },
    [form]
  )
  const handleClear = useCallback(
    (propId: string) => {
      form.setFieldValue(propId, "")
    },
    [form]
  )
  const history = useHistory()
  const handleJumpTypes = useCallback(() => {
    history.push("/_/types")
  }, [history])
  const options = useMemo(() => {
    const list = types.map((t) => {
      return {
        label: (
          <IText ellipsis>
            <IIcon icon="dup" />
            {t.name}
          </IText>
        ),
        value: t.id,
      }
    })
    return [
      {
        label: (
          <IFlexRB>
            <span>卡片模板</span>
            <Tooltip title="模板管理" placement="right">
              <IconBtn
                onClick={handleJumpTypes}
                icon={<IIcon icon="setting" />}
                type="text"
                size="small"
              />
            </Tooltip>
          </IFlexRB>
        ),
        options: list,
      },
    ]
  }, [handleJumpTypes, types])
  const showDeleteConfirm = useCallback(() => {
    mCardId &&
      db &&
      modal.confirm({
        title: "确认删除卡片？",
        icon: <ExclamationCircleFilled />,
        content: "仅会删除卡片内容，白板中卡片对应节点将自动重置为卡片标题！",
        okText: "确认",
        okType: "danger",
        cancelText: "取消",
        onOk: () => {
          deleteCard(db, mCardId)
            .then(() => {
              setMCardId()
              setCardOp({ id: mCardId, op: OpEnum.DELETE })
              message.success("删除卡片成功")
            })
            .catch((err) => {
              console.error("删除卡片出现异常", err)
              message.error("删除卡片出现异常")
            })
        },
      })
  }, [db, mCardId, message, modal, setCardOp, setMCardId])
  const handleClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === "delete") {
        showDeleteConfirm()
      }
    },
    [showDeleteConfirm]
  )
  useHotkeys("esc", () => updateCard(undefined))
  // Cmd+N 无法阻止 Mac-Chrome 打开新的浏览器窗口
  useHotkeys("mod+n", (e) => {
    e.preventDefault()
    e.stopPropagation()
    updateCard("")
  })
  let offsetH = 0
  console.log("Render: ICard", mCardId)
  return (
    <CardDrawer open={open} full={full}>
      <EditBox className="editBox" onKeyDown={handleKeyDown}>
        <Form form={form} onValuesChange={delayUpdateCard}>
          <EditHeader>
            <IconBtn
              onClick={() => updateCard(undefined)}
              type="text"
              icon={<IIcon icon="close" />}
              className="mr2"
            />
            <IconBtn
              onClick={handleSwitchFull}
              type="text"
              icon={<IIcon icon={full ? "exitfull" : "full"} fontSize={14} />}
              className="mr2"
            />
            <Form.Item name="type_id" noStyle>
              <TypeSelect
                bordered={false}
                popupClassName="selectGroup"
                className="greyHoverBg"
                suffixIcon={false}
                options={options}
              />
            </Form.Item>
            {mCardId && (
              <Dropdown menu={{ items: moreItems, onClick: handleClick }} trigger={["click"]}>
                <IconBtn icon={<IIcon icon="more" />} type="text" className="ml2" />
              </Dropdown>
            )}
          </EditHeader>
          <EditContainer>
            <Form.Item name="id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <EditBody style={{ gridTemplateRows: gridRows }}>
              {typeProps.length > 0 &&
                typeProps.map((item) => {
                  const { x, y, w, h } = item.layout
                  const isContent = item.id === "content"
                  const style = {
                    gridColumnStart: x + 1,
                    gridColumnEnd: x + w + 1,
                    gridRowStart: y + 1,
                    gridRowEnd: y + (isContent ? 1 : h) + 1 - offsetH,
                  }
                  if (isContent) {
                    offsetH = h - 1
                  }
                  return (
                    <EditItem
                      key={"card_prop_" + item.id}
                      className={cc({ content: isContent })}
                      style={style}
                    >
                      {item.id === "name" && (
                        <TextProp key={item.id} item={item} handleCopy={handleCopy} />
                      )}
                      {item.id === "tags" && (
                        <Form.Item name="tags" noStyle>
                          <CardTag name={item.name} />
                        </Form.Item>
                      )}
                      {isContent && (
                        <EditorBox>
                          <EditorContent editor={editor} spellCheck={false} />
                          {editor && <TextMenu editor={editor} />}
                        </EditorBox>
                      )}
                      {item.type === "text" && (
                        <TextProp key={item.id} item={item} handleCopy={handleCopy} />
                      )}
                      {item.type === "password" && (
                        <PasswordProp key={item.id} item={item} handleCopy={handleCopy} />
                      )}
                      {item.type === "number" && (
                        <NumberProp key={item.id} item={item} handleCopy={handleCopy} />
                      )}
                      {item.type === "date" && (
                        <DateProp
                          key={item.id}
                          item={item}
                          handleCopy={handleCopy}
                          handleClear={handleClear}
                        />
                      )}
                      {item.type === "select" && <SelectProp key={item.id} item={item} />}
                      {item.type === "mselect" && <MSelectProp key={item.id} item={item} />}
                      {item.type === "link" && (
                        <LinkProp key={item.id} item={item} handleCopy={handleCopy} />
                      )}
                      {item.type === "phone" && (
                        <PhoneProp
                          key={item.id}
                          item={item}
                          handleCopy={handleCopy}
                          handleCallPhone={handleCallPhone}
                        />
                      )}
                    </EditItem>
                  )
                })}
            </EditBody>
          </EditContainer>
        </Form>
      </EditBox>
    </CardDrawer>
  )
})

const EditBox = styled("div")({
  height: "100%",
  paddingTop: "46px",
  "&>form": {
    width: "100%",
    height: "100%",
    padding: "4px 0 10px",
  },
})
const EditHeader = styled(IFlexRB)({
  padding: "8px",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  ".flexPlace": {
    overflow: "hidden",
  },
})
const EditContainer = styled(IFlexC)({
  height: "100%",
})
const EditBody = styled("div")({
  height: "100%",
  padding: "0 8px",
  overflowY: "auto",
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gridGap: "2px 8px",
  ".content": {
    padding: "4px 6px",
  },
})
const EditItem = styled("div")({
  // width: "100%",
})
const TypeSelect = styled(Select)({
  flex: 1,
  textAlign: "center",
  borderRadius: 6,
  ".ant-select-selection-item > .ant-typography": {
    lineHeight: "30px",
  },
})
