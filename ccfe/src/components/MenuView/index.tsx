import React, { memo } from "react"
import { MenuHeader } from "./header"
import { MenuList } from "./list"
import styled from "@emotion/styled"
import { IFlexC } from "@/ui"

type Props = {
  spaceId: string
  viewId: string
}

export const MenuView = memo(({ spaceId, viewId }: Props) => {
  console.log("Render: Menu")
  return (
    <Aside>
      <MenuHeader spaceId={spaceId} />
      <MenuBody>
        <MenuList spaceId={spaceId} viewId={viewId} />
      </MenuBody>
    </Aside>
  )
})

const Aside = styled(IFlexC)({
  height: "100%",
})
const MenuBody = styled("div")({
  width: "100%",
  flex: 1,
  overflow: "hidden",
})
