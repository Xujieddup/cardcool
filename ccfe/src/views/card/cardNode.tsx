import React, { CSSProperties } from "react"
import type { CardObj, CardTag, NodeStyleType } from "@/types"
import styled from "@emotion/styled"
import {
  DatePropShow,
  LinkPropShow,
  MSelectShow,
  NumberPropShow,
  PasswordPropShow,
  PhonePropShow,
  SelectShow,
  TextPropShow,
} from "./propShow"
import { GetColors, SMCardId, useConfigStore, useModelStore } from "@/store"
import { IIcon } from "@/icons"
import cc from "classcat"
import { IParagraph } from "@/ui"
import { Tag } from "antd"
import { NODE_STYLE_FULL } from "@/constant"
import { getHTML } from "@/editor"

type Props = {
  card: CardObj
  scope: "list" | "siderlist" | "graph"
  tagMap: Map<string, CardTag>
  style?: CSSProperties
  styleId?: NodeStyleType
}

const cardSelector: SMCardId = (state) => state.setMCardId
const colorsSelector: GetColors = (state) => state.colors

export const CardNodeView = React.memo(
  ({ card, scope, tagMap, style, styleId = NODE_STYLE_FULL }: Props) => {
    const setMCardId = useModelStore(cardSelector)
    const colors = useConfigStore(colorsSelector)
    const contentHTML = getHTML(card.content)
    // console.log("CardNodeView")
    return (
      <CardBox
        onDoubleClick={() => setMCardId(card.id)}
        className={cc([
          "shadow-sm cardBox",
          {
            colorBgElevated: scope !== "graph",
            "hover:shadow-xl": scope !== "graph",
          },
        ])}
        style={style}
      >
        <CardHeaderBox className="cardHeader">
          <IParagraph strong>
            <IIcon icon="card" />
            {card.name || "未命名"}
          </IParagraph>
        </CardHeaderBox>
        {styleId === NODE_STYLE_FULL && (
          <>
            {card.tags.length > 0 && (
              <CardTagBox>
                {card.tags.map((tagId) => {
                  const tag = tagMap.get(tagId)
                  return tag ? (
                    <Tag key={tagId} color={tag.color}>
                      {tag.name}
                    </Tag>
                  ) : null
                })}
              </CardTagBox>
            )}
            {card.props.length > 0 && (
              <CardPropBox>
                {card.props.map((prop) => {
                  switch (prop.type) {
                    case "text":
                      return <TextPropShow key={prop.id} prop={prop} />
                    case "password":
                      return <PasswordPropShow key={prop.id} prop={prop} />
                    case "number":
                      return <NumberPropShow key={prop.id} prop={prop} />
                    case "select":
                      return <SelectShow key={prop.id} prop={prop} colors={colors} />
                    case "mselect":
                      return <MSelectShow key={prop.id} prop={prop} colors={colors} />
                    case "link":
                      return <LinkPropShow key={prop.id} prop={prop} />
                    case "phone":
                      return <PhonePropShow key={prop.id} prop={prop} />
                    case "date":
                      return <DatePropShow key={prop.id} prop={prop} />
                    default:
                      return null
                  }
                })}
              </CardPropBox>
            )}
            {contentHTML && contentHTML !== "<p></p>" && (
              <CardContentBox>
                <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: contentHTML }} />
              </CardContentBox>
            )}
          </>
        )}
      </CardBox>
    )
  }
)

const CardBox = styled("div")({
  padding: "8px 10px",
  borderRadius: 8,
  overflow: "hidden",
  wordBreak: "break-all",
  position: "relative",
  "&:hover": {
    cursor: "pointer",
  },
  "& > div:last-child": {
    marginBottom: 0,
  },
})

const CardHeaderBox = styled("div")({
  marginBottom: 6,
})
const CardTagBox = styled("div")({
  marginTop: -2,
  marginBottom: 6,
})
const CardPropBox = styled("div")({
  marginBottom: 8,
})
const CardContentBox = styled("div")({
  // ".ProseMirror *:last-child": {
  //   marginBottom: 0,
  // },
})
