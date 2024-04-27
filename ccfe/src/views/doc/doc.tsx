import React, { useCallback, useEffect, useRef } from "react"
import type { GSRefreshMenu, GetDB, SViewEditStatus } from "@/store"
import { useDBStore, useModelStore } from "@/store"
import styled from "@emotion/styled"
import { Editor, EditorContent } from "@tiptap/react"
import { DocExtensions, MDocExtensions, TextMenu, useEditor } from "@/editor"
import type { StyledToken } from "@/types"
import { App, Input, theme } from "antd"
import { ViewTypeEnum } from "@/enums"
import { isMac, useMergeState } from "@/utils"
import { IFlexC } from "@/ui"
import { useDebounceCallback } from "@react-hook/debounce"

const dbTypesSelector: GetDB = (state) => state.db
const menuSelector: GSRefreshMenu = (state) => state.refreshMenu
const viewEditStatusSelector: SViewEditStatus = (state) => state.setViewEditStatus

type Props = {
  viewId: string
  viewName: string
  viewType: ViewTypeEnum
  content: string
}

export const Doc = React.memo(({ viewId, viewName, viewType, content }: Props) => {
  const db = useDBStore(dbTypesSelector)
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const refreshMenu = useModelStore(menuSelector)
  const setViewEditStatus = useDBStore(viewEditStatusSelector)
  const editStatusRef = useRef(0)
  const setEditStatus = useCallback(
    (status: number) => {
      editStatusRef.current = status
      setViewEditStatus(status)
    },
    [setViewEditStatus]
  )
  const [name, setName] = useMergeState(viewName)
  const contentRef = useRef("")
  contentRef.current = content
  // 更新视图名称
  const changeTitle = useCallback(
    (e: any) => {
      e.preventDefault()
      const name = (e.target as HTMLTextAreaElement).value.trim()
      if (name.length > 32) {
        message.error("标题不能超过32个字符")
        return
      }
      if (viewName !== name) {
        db?.view.updateViewName(viewId, name).then(() => {
          refreshMenu()
          // setViewOp({ op: OpEnum.UPDATE, ids: [viewId] })
        })
      }
    },
    [db?.view, message, refreshMenu, viewId, viewName]
  )
  // 更新视图内容
  const updateContent = useCallback(
    (viewId: string) => {
      // 已保存后，避免再次保存
      if (editStatusRef.current !== 1) return
      // 卡片内容
      const cont = editorRef.current?.getJSON() || undefined
      const contentJson = cont && editorRef.current?.getText() !== "" ? JSON.stringify(cont) : ""
      // 卡片内容中的双链卡片 ID
      // const linkCardIds = parseLinkCardId(cont)
      if (contentJson !== contentRef.current) {
        db?.view.updateViewContent(viewId, contentJson).then(() => {
          setEditStatus(0)
        })
      } else {
        setEditStatus(0)
      }
    },
    [db, setEditStatus]
  )
  // 5s 内没有编辑，则触发自动保存
  const updateViewContent = useDebounceCallback(updateContent, 5000)
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.key === "Tab") e.preventDefault()
      if (e.key === "s" && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
        e.stopPropagation()
        updateContent(viewId)
      }
    },
    [updateContent, viewId]
  )
  // 每次 viewId 更新之后，会尝试更新文档内容，另外添加浏览器关闭事件监听
  useEffect(() => {
    const fn = () => updateContent(viewId)
    window.addEventListener("beforeunload", fn)
    const autoSave = setInterval(fn, 120000)
    return () => {
      window.removeEventListener("beforeunload", fn)
      clearInterval(autoSave)
      updateContent(viewId)
    }
  }, [updateContent, viewId])

  const editorRef = useRef<Editor | null>(null)
  editorRef.current = useEditor(
    {
      extensions: [...(viewType === ViewTypeEnum.DOC ? DocExtensions : MDocExtensions)],
      onCreate: () => {
        // console.log("onCreate", editor)
        setEditStatus(0)
      },
      onUpdate: () => {
        // console.log("onUpdate", editor)
        setEditStatus(1)
        updateViewContent(viewId)
      },
      onDestroy: () => {
        updateViewContent(viewId)
      },
      content: contentRef.current ? JSON.parse(contentRef.current) : undefined,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          class: "doc",
        },
      },
    },
    [viewId]
  )
  console.log("Render: doc")
  return (
    <DocContainer token={token} onKeyDown={onKeyDown}>
      {/* <DocCate>目录</DocCate> 
      - 宽度较小时，目录栏浮动，自动隐藏，文档居中，占据所有宽度
      - 宽度适中时，左侧展示目录，右侧展示文档，占所有宽度，隐藏目录时，文档占所有宽度 ×
      - 宽度较宽时，限制文档最大宽度，目录显示和隐藏不影响文档展示
      - 目录宽度 240px，文档宽度 820px
      */}
      <DocTitle
        placeholder="文档标题"
        value={name}
        onPressEnter={changeTitle}
        onBlur={changeTitle}
        onChange={(e) => setName(e.target.value)}
        spellCheck={false}
        bordered={false}
        className="title"
        autoComplete="new-user"
        maxLength={32}
        autoSize
      />
      <DocBox editor={editorRef.current} />
      {editorRef.current && viewType === ViewTypeEnum.DOC && (
        <TextMenu editor={editorRef.current} />
      )}
    </DocContainer>
  )
})

const DocContainer = styled(IFlexC)(({ token }: StyledToken) => ({
  flex: 1,
  paddingBottom: 4,
  overflowY: "auto",
  position: "relative",
  ".activeBtn": {
    backgroundColor: token.colorBorder,
  },
  ".textMenu .nicon": {
    opacity: 0.8,
    width: 14,
    height: 14,
    svg: {
      strokeWidth: 2.5,
    },
  },
  ".textMenu .activeBtn .nicon": {
    opacity: 1,
  },
}))
const DocTitle = styled(Input.TextArea)({
  display: "block",
  fontSize: 28,
  fontWeight: 500,
  margin: "0 auto",
  padding: "8px 16px 4px",
  flexShrink: 0,
  "&.ant-input": {
    maxWidth: 824,
    lineHeight: "56px",
  },
})
const DocBox = styled(EditorContent)({
  maxWidth: 824,
  margin: "0 auto",
  padding: "8px 16px 8px",
  width: "100%",
  flex: 1,
  ".ProseMirror": {
    minHeight: "100%",
  },
})
