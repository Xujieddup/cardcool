import React, { memo } from "react"
import type { TypeProp } from "@/types"
import {
  DateProp,
  LinkProp,
  MSelectProp,
  NumberProp,
  PasswordProp,
  PhoneProp,
  SelectProp,
  TextProp,
} from "@/components/card/props"
import styled from "@emotion/styled"
import { CardTagShow } from "@/components/card/tagShow"
import { getHTML } from "@/editor"

export const PropShow = memo(({ item }: { item: TypeProp }) => {
  return (
    <>
      {item.id === "name" && <TextProp key={item.id} item={item} disabled />}
      {item.id === "tags" && <CardTagShow name={item.name} value={item.defaultVal} />}
      {item.id === "content" && (
        <CardContent>
          {item.defaultVal ? (
            <div
              className="ProseMirror"
              dangerouslySetInnerHTML={{ __html: getHTML(item.defaultVal) }}
            />
          ) : (
            <span className="phtext">{item.name}</span>
          )}
        </CardContent>
      )}
      {item.type === "text" && <TextProp item={item} disabled />}
      {item.type === "password" && <PasswordProp item={item} disabled />}
      {item.type === "number" && <NumberProp item={item} disabled />}
      {item.type === "select" && <SelectProp item={item} disabled />}
      {item.type === "mselect" && <MSelectProp item={item} disabled />}
      {item.type === "link" && <LinkProp item={item} disabled />}
      {item.type === "phone" && <PhoneProp item={item} disabled />}
      {item.type === "date" && <DateProp item={item} disabled />}
    </>
  )
})

const CardContent = styled("div")({
  height: "100%",
  padding: 4,
  overflow: "hidden",
  ".ProseMirror": {
    height: "100%",
  },
})
