import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import styled from "@emotion/styled"
import type { NodeProps } from "@/reactflow/core"
import type { NodeData } from "@/types"
import { BaseNode } from "./base"
import { GetDB, useDBStore } from "@/store"
import { useRF } from "../hooks"
import { Editor, EditorEvents } from "@tiptap/react"
import { initValue } from "@/config"
import cc from "classcat"
import { parseNodeContent } from "@/utils"
import { GroupEditor, getSimpleHTML } from "@/editor"

export const GroupFlowNode = ({ id, type, selected, dragging, data }: NodeProps<NodeData>) => {
  const { nodeType, pid, bgColor, width, autoWidth, layout, ext, etime, forbidEdit } = data
  // console.log("ReactFlow: GroupFlowNode")
  return (
    <GroupNodeBox className="groupNodeBox">
      <BaseNode
        id={id}
        vnType={type}
        nodeType={nodeType}
        pid={pid}
        bgColor={bgColor}
        width={width}
        autoWidth={autoWidth}
        layout={layout}
        ext={ext}
        etime={etime}
        forbidEdit={forbidEdit}
        active={selected && !dragging}
      />
    </GroupNodeBox>
  )
}
const GroupNodeBox = styled("div")({
  height: "100%",
  // 分组的宽高设置最小为 1，才能触发 ResizeObserver 重置布局
  minWidth: 1,
  minHeight: 1,
})

const dbSelector: GetDB = (state) => state.db

// const defaultHtml = '<p data-placeholder="分组名" class="is-empty is-editor-empty"></p>'

type GroupNodeProps = {
  id: string
  ext?: string
  et: number
}

export const GroupNode = memo(({ id, et, ext }: GroupNodeProps) => {
  const db = useDBStore(dbSelector)
  const rfIns = useRF<NodeData>()
  const contentHTML = useMemo(() => getSimpleHTML(ext ? JSON.parse(ext) : null), [ext])
  // 编辑器的加载状态
  const [editorLoading, setEditorLoading] = useState(false)
  const editorRef = useRef<Editor | null>(null)
  // 编辑状态
  const [editStatus, setEditStatus] = useState(false)
  // 切换编辑状态
  const switchEditStatus = useCallback((open: boolean) => {
    console.log("switchEditStatus", open)
    // editorRef.current 不为空，表示当前节点已经转变为 editor 节点
    if (editorRef.current) {
      if (open) {
        editorRef.current.setEditable(true)
        editorRef.current.commands.focus("end")
      } else {
        editorRef.current.setEditable(false)
      }
      setEditStatus(open)
    } else {
      // 非 editor 节点，则初始化编辑器
      setEditorLoading(true)
    }
  }, [])
  // 更新分组名
  const updateName = useCallback(
    (newExt?: string) => {
      const nodes = rfIns.getNodes()
      const node = nodes.find((n) => n.id === id)
      if (!node) return
      // 判断是否需要更新
      if (node.data.ext !== newExt) {
        const content = parseNodeContent(node)
        content.ext = newExt
        db?.viewnode.updateVNContent(id, content).then(() => {
          switchEditStatus(false)
          const newNode = { ...node, data: { ...node.data, ext: newExt } }
          rfIns.setNodes(nodes.map((n) => (n.id === id ? newNode : n)))
        })
      } else {
        switchEditStatus(false)
      }
    },
    [db?.viewnode, rfIns, id, switchEditStatus]
  )
  const config = useMemo(
    () => ({
      autofocus: "end",
      content: ext ? JSON.parse(ext) : initValue,
      onBeforeCreate({ editor }: EditorEvents["beforeCreate"]) {
        editorRef.current = editor as Editor
        setEditStatus(true)
      },
      // 每次选中 Editor，再点击其他地方，都会触发 onBlur
      onBlur({ editor, event }: EditorEvents["blur"]) {
        if (!editor.isEditable) return
        console.log("onBlur", Date.now(), editor, event, editor.getText())
        updateName(editor.getText() === "" ? undefined : JSON.stringify(editor.getJSON()))
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  )
  // 双击进入编辑状态
  const handleDbClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation()
      switchEditStatus(true)
    },
    [switchEditStatus]
  )
  useEffect(() => {
    et > 0 && switchEditStatus(true)
  }, [et, switchEditStatus])
  // 编辑状态禁止事件冒泡
  const handleKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // console.log("GroupNode handleKeydown", e)
      if (editStatus) {
        e.stopPropagation()
        if (e.code === "Escape") {
          editorRef.current?.commands.blur()
        }
      }
    },
    [editStatus]
  )
  // console.log("ReactFlow: GroupNode", id)
  return (
    <GroupNameBox
      className={cc(["groupName", "nopan", { nodrag: editStatus, emptyName: !ext && !editStatus }])}
      onDoubleClick={(e) => handleDbClick(e)}
      onKeyDown={(e) => handleKeydown(e)}
    >
      {!editorRef.current && (
        <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: contentHTML }} />
      )}
      {(editorRef.current || editorLoading) && <GroupEditor config={config} />}
    </GroupNameBox>
  )
})

const GroupNameBox = styled("div")({
  position: "absolute",
  top: -4,
  left: -2,
  transform: "translateY(-100%)",
  borderRadius: 4,
  padding: "2px 6px",
  "&.emptyName": {
    padding: 0,
  },
})
