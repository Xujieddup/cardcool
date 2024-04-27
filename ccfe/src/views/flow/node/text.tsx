import React, {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import styled from "@emotion/styled"
import type { NodeProps } from "@/reactflow/core"
import type { NodeData } from "@/types"
import { BaseNode } from "./base"
import { GetDBTypes, useDBStore } from "@/store"
import { shallow } from "zustand/shallow"
import { useRF } from "../hooks"
import { Editor, EditorEvents } from "@tiptap/react"
import { formatNodeObj, isShapeNode, parseNodeContent } from "@/utils"
import { LinkNodeType, NodeTypeEnum, VNTypeEnum } from "@/enums"
import { initValue } from "@/config"
import cc from "classcat"
import { NODE_STYLE_FOLD, VIEW_NODE_BG } from "@/constant"
import { NodeEditor, getHTML } from "@/editor"

export const TextFlowNode = ({ id, type, selected, dragging, data }: NodeProps<NodeData>) => {
  const { nodeType, pid, bgColor, width, autoWidth, ext, etime } = data
  // console.log("ReactFlow: TextFlowNode")
  return (
    <TextNodeBox>
      <BaseNode
        id={id}
        vnType={type}
        nodeType={nodeType}
        pid={pid}
        bgColor={bgColor}
        width={width}
        autoWidth={autoWidth}
        ext={ext}
        etime={etime}
        active={selected && !dragging}
      />
    </TextNodeBox>
  )
}
const TextNodeBox = styled("div")({
  // borderRadius: 6,
})

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]

// 校验是否触发卡片转换
const checkNodeConvert = (editor: any) => {
  // console.log("Check CardConvert", editor.getJSON())
  const { type, content } = editor.getJSON()
  if (type === "doc" && content && content.length === 1) {
    const { type: pt, content: pc } = content[0]
    if (pt === "paragraph" && pc && pc.length === 2) {
      if (pc[0].type === "mention" && pc[1].type === "text" && pc[1].text === " ") {
        // console.log("Hit CardConvert", pc[0].attrs)
        return pc[0].attrs
      }
    }
  }
  return null
}
const defaultHtml = '<p data-placeholder="输入文字" class="is-empty is-editor-empty"></p>'

type TextNodeProps = {
  id: string
  type: string
  textNodeStyle: CSSProperties
  aMindNode?: boolean
  ext?: string
  et: number
}

export const TextNode = memo(({ id, et, ext, type, textNodeStyle, aMindNode }: TextNodeProps) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const rfIns = useRF<NodeData>()
  const contentHTML = useMemo(() => getHTML(ext ? JSON.parse(ext) : null) || defaultHtml, [ext])
  // 文本编辑器样式
  // const editorStyle = useMemo(
  //   () => (isShapeNode(type) ? { width: "100%" } : autoWidth ? { maxWidth: width } : { width }),
  //   [autoWidth, type, width]
  // )
  const useShiftEnter = aMindNode || isShapeNode(type)
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
  // 更新视图节点信息
  const updateNode = useCallback(
    (newExt?: string) => {
      const nodes = rfIns.getNodes()
      const node = nodes.find((n) => n.id === id)
      if (!node) {
        return
      }
      // 判断是否需要更新
      if (node.data.ext !== newExt) {
        const content = parseNodeContent(node)
        content.ext = newExt
        db?.viewnode.updateVNContent(id, content).then(() => {
          switchEditStatus(false)
          const newNode = {
            ...node,
            data: { ...node.data, ext: newExt },
          }
          rfIns.setNodes(nodes.map((n) => (n.id === id ? newNode : n)))
        })
      } else {
        switchEditStatus(false)
      }
    },
    [db?.viewnode, rfIns, id, switchEditStatus]
  )
  // 将文本节点转换为卡片或视图节点
  const convertNode = useCallback(
    (attrs: any) => {
      const nodes = rfIns.getNodes()
      const node = nodes.find((n) => n.id === id)
      if (!node) return
      const content = parseNodeContent(node)
      content.ext = undefined
      const { id: nodeId, type } = attrs
      const nodeType = type === LinkNodeType.VIEW ? NodeTypeEnum.VIEW : NodeTypeEnum.CARD
      const vnType =
        node.type === VNTypeEnum.TEXT
          ? nodeType === NodeTypeEnum.CARD
            ? VNTypeEnum.CARD
            : VNTypeEnum.VIEW
          : node.type
      if (nodeType === NodeTypeEnum.VIEW) {
        content.bgColor = VIEW_NODE_BG
        content.styleId = NODE_STYLE_FOLD
      }
      const cont = JSON.stringify(content)
      db?.viewnode.updateNode(id, "", nodeId, nodeType, cont, vnType).then(() => {
        switchEditStatus(false)
        if (nodeType === NodeTypeEnum.CARD) {
          db?.card.getCard(nodeId).then((card) => {
            if (card) {
              const cardInfo = formatNodeObj(
                card,
                types.find((t) => t.id === card.type_id)
              )
              const newNode = {
                ...node,
                type: vnType,
                data: {
                  ...node.data,
                  nodeId,
                  nodeType,
                  ext: undefined,
                  cardInfo,
                },
              }
              rfIns.setNodes(nodes.map((n) => (n.id === id ? newNode : n)))
            }
          })
        } else if (nodeType === NodeTypeEnum.VIEW) {
          db?.view.getViewById(nodeId).then((view) => {
            if (view) {
              const newNode = {
                ...node,
                type: vnType,
                data: {
                  ...node.data,
                  nodeId,
                  nodeType,
                  bgColor: VIEW_NODE_BG,
                  styleId: NODE_STYLE_FOLD,
                  ext: undefined,
                  viewInfo: view,
                },
              }
              rfIns.setNodes(nodes.map((n) => (n.id === id ? newNode : n)))
            }
          })
        }
      })
    },
    [rfIns, db, id, switchEditStatus, types]
  )
  const config = useMemo(
    () => ({
      autofocus: "end",
      content: ext ? JSON.parse(ext) : initValue,
      onBeforeCreate({ editor }: EditorEvents["beforeCreate"]) {
        editorRef.current = editor as Editor
        // setEditorLoading(false)
        setEditStatus(true)
      },
      // 每次选中 Editor，再点击其他地方，都会触发 onBlur
      onBlur({ editor, event }: EditorEvents["blur"]) {
        if (!editor.isEditable) return
        console.log("onBlur", Date.now(), editor, event)
        // 点击双链候选项失去焦点，该场景应该排除，转换卡片场景也应该排除
        const clickMentionBlur = (
          (event.relatedTarget as HTMLLIElement)?.parentNode as HTMLUListElement
        )
          ?.getAttribute("class")
          ?.includes("ddmenu")
        if (!clickMentionBlur && !checkNodeConvert(editor)) {
          console.log("call updateNode()")
          updateNode(editor.getText() === "" ? undefined : JSON.stringify(editor.getJSON()))
        }
      },
      onUpdate: ({ editor, transaction }: EditorEvents["update"]) => {
        if (!editor.isEditable) return
        // console.log("onUpdate", Date.now(), editor, transaction)
        // 编辑器每次更新都检测内容是否符合转换卡片格式，失去焦点时也会触发 onUpdate 事件，应该排除
        if ((transaction as any).updated) {
          const attrs = checkNodeConvert(editor)
          if (attrs) {
            console.log("call convertNode()")
            convertNode(attrs)
          }
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  )
  // 双击进入编辑状态
  const handleDbClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation()
      !editStatus && switchEditStatus(true)
    },
    [editStatus, switchEditStatus]
  )
  useEffect(() => {
    et > 0 && switchEditStatus(true)
  }, [et, switchEditStatus])
  // 编辑状态禁止事件冒泡
  const handleKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // console.log("TextNode handleKeydown", e)
      if (editStatus) {
        e.stopPropagation()
        if (e.code === "Escape") {
          editorRef.current?.commands.blur()
        }
      }
    },
    [editStatus]
  )
  // console.log("ReactFlow: TextNode")
  return (
    <NEditorBox
      className={cc(["nodeItem", { nodrag: editStatus, editing: editStatus }])}
      onDoubleClick={(e) => handleDbClick(e)}
      onKeyDown={(e) => handleKeydown(e)}
      textNodeStyle={textNodeStyle}
    >
      {/* <div style={{ position: "absolute", top: -8, left: 2, fontSize: 10, color: "green" }}>
        {id}
      </div> */}
      {!editorRef.current && (
        <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: contentHTML }} />
      )}
      {(editorRef.current || editorLoading) && (
        <NodeEditor config={config} useShiftEnter={useShiftEnter} />
      )}
    </NEditorBox>
  )
})

const NEditorBox = styled("div")(({ textNodeStyle }: { textNodeStyle?: any }) => ({
  minWidth: 48,
  minHeight: 38,
  padding: "8px 10px",
  borderRadius: 6,
  maxWidth: textNodeStyle?.maxWidth || undefined,
  width: textNodeStyle?.width || "max-content",
  "&.editing": {
    position: "absolute",
    top: 0,
    left: 0,
  },
}))
