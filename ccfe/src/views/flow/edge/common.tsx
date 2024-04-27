import React, {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { EdgeProps } from "@/reactflow"
import type { EdgeData, StyledToken } from "@/types"
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@/reactflow"
import styled from "@emotion/styled"
import type { NodeData } from "@/types"
import { GetDB, useDBStore } from "@/store"
import { useRF } from "../hooks"
import { Editor, EditorEvents } from "@tiptap/react"
import cc from "classcat"
import { theme } from "antd"
import { EdgeEditor } from "@/editor"

const dbTypesSelector: GetDB = (state) => state.db

const formatLabel = (label?: string) => {
  if (!label) return ""
  return "<p>" + label.replace("\n", "<br/>") + "</p>"
}
const edgeStyle: CSSProperties = { strokeWidth: 2 }

export const CommonEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
  }: EdgeProps<EdgeData>) => {
    const label = useMemo(() => formatLabel(data?.label), [data?.label])
    const db = useDBStore(dbTypesSelector)
    const rfIns = useRF<NodeData>()
    const { token } = theme.useToken()
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
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
    const config = useMemo(
      () => ({
        autofocus: "end",
        content: label,
        onBeforeCreate({ editor }: EditorEvents["beforeCreate"]) {
          editorRef.current = editor as Editor
          setEditStatus(true)
        },
        // 每次选中 Editor，再点击其他地方，都会触发 onBlur
        onBlur({ editor, event }: EditorEvents["blur"]) {
          if (!editor.isEditable) return
          console.log("onBlur", Date.now(), editor, event, editor.getText())
          const newLabel = editor.getText().trim().substring(0, 32)
          const edges = rfIns.getEdges()
          const edge = edges.find((e) => e.id === id)
          if (!edge) return
          // 判断是否需要更新
          if (edge.data.label !== newLabel) {
            db?.viewedge.updateName(id, newLabel).then(() => {
              const newEdge = { ...edge, data: { ...edge.data, label: newLabel } }
              rfIns.setEdges(edges.map((n) => (n.id === id ? newEdge : n)))
              switchEditStatus(false)
            })
          } else {
            switchEditStatus(false)
          }
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id]
    )
    useEffect(() => {
      data?.et && switchEditStatus(true)
    }, [data?.et, switchEditStatus])
    // 编辑状态禁止事件冒泡
    const handleKeydown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        // console.log("CommonEdge handleKeydown", e)
        if (editStatus) {
          e.stopPropagation()
          if (e.code === "Escape") {
            editorRef.current?.commands.blur()
          }
        }
      },
      [editStatus]
    )
    // 不能直接在 LabelBox 触发事件，必须依赖 Edge 事件
    // console.log("ReactFlow: CommonEdge", id)
    return (
      <>
        <BaseEdge path={edgePath} style={edgeStyle} markerEnd={markerEnd} />
        <EdgeLabelRenderer>
          <LabelBox
            className={cc(["nodrag", "nopan", { editing: editStatus, hasContent: !!label }])}
            onKeyDown={(e) => handleKeydown(e)}
            token={token}
            labelX={labelX}
            labelY={labelY}
          >
            {!editorRef.current && label && (
              <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: label }} />
            )}
            {(editorRef.current || editorLoading) && <EdgeEditor config={config} />}
          </LabelBox>
        </EdgeLabelRenderer>
      </>
    )
  }
)

const LabelBox = styled("div")(
  ({ token, labelX, labelY }: StyledToken & { labelX: number; labelY: number }) => ({
    position: "absolute",
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    backgroundColor: token.colorBgContainer,
    borderRadius: 4,
    ".ProseMirror p": {
      fontSize: 13,
      lineHeight: "18px",
      minHeight: 18,
      textAlign: "center",
      userSelect: "none",
    },
    "&.hasContent": {
      padding: "4px 6px",
    },
    "&.editing": {
      padding: "4px 6px",
      boxShadow: "0 0 0 2px " + token.colorPrimary,
    },
  })
)
