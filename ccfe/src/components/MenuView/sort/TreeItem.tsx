import React, { forwardRef, HTMLAttributes, memo, MouseEventHandler, ReactNode } from "react"
import cc from "classcat"
import styled from "@emotion/styled"
import { IconBtn, IFlexR } from "@/ui"
import { IIcon } from "@/icons"
import { Badge, GlobalToken, Typography } from "antd"
import type { StyledToken } from "@/types"

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
  name: string
  icon: string
  childCount?: number
  clone?: boolean
  collapsed?: boolean
  selected?: boolean
  depth: number
  disableInteraction?: boolean
  disableSelection?: boolean
  isDragging?: boolean
  handleProps?: any
  indentationWidth: number
  onCollapse?(): void
  onJump?: MouseEventHandler
  onRemove?(): void
  wrapperRef?(node: HTMLLIElement): void
  token: GlobalToken
  moreBtn?: ReactNode
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      selected,
      name,
      icon,
      isDragging,
      handleProps,
      indentationWidth,
      collapsed,
      onCollapse,
      onJump,
      style,
      wrapperRef,
      token,
      moreBtn,
      ...props
    },
    ref
  ) => {
    // console.log("TreeItem")
    return (
      <MenuLi
        ref={wrapperRef}
        className={cc({ clone, ghost: isDragging })}
        style={{ paddingLeft: clone ? undefined : indentationWidth * depth }}
        token={token}
        {...props}
      >
        <MenuItem className={cc(["item", "relative", { selected }])} ref={ref} style={style}>
          {!isDragging && (
            <>
              <IconBtn
                icon={<IIcon icon={selected ? icon + "fill" : icon} />}
                type="text"
                size="small"
                className="dndIcon"
                {...handleProps}
              />
              <Typography.Text ellipsis className="flexPlace" onClick={onJump}>
                {name}
              </Typography.Text>
              {moreBtn}
              {onCollapse && (
                <IconBtn
                  onClick={onCollapse}
                  className={cc(["collapseBtn", { collapsed }])}
                  type="text"
                  size="small"
                  icon={<IIcon icon="arrowbottom" />}
                />
              )}
              {clone && childCount && childCount > 1 && (
                <Badge className="sortBadge" count={childCount} size="small" />
              )}
            </>
          )}
        </MenuItem>
      </MenuLi>
    )
  }
)
export const SimpleItem = memo(
  ({ selected, name, icon, onJump, style, token, moreBtn, ...props }: Props) => {
    // console.log("TreeItem")
    return (
      <MenuLi token={token} {...props}>
        <MenuItem className={cc(["item", "relative", { selected }])} style={style}>
          <SimpleIcon>
            <IIcon icon={selected ? icon + "fill" : icon} />
          </SimpleIcon>
          <Typography.Text ellipsis className="flexPlace" onClick={onJump}>
            {name}
          </Typography.Text>
          {moreBtn}
        </MenuItem>
      </MenuLi>
    )
  }
)

// .clone 是 body 层新生成的拖拽元素，.ghost 是被拖拽的元素
const MenuLi = styled("li")(({ token }: StyledToken) => ({
  listStyle: "none",
  marginTop: 2,
  "&.ghost .item": {
    height: 2,
    margin: "4px 12px 4px 12px",
    padding: 0,
    backgroundColor: token.colorPrimary,
    position: "relative",
    "&:before": {
      position: "absolute",
      top: -3,
      left: -6,
      content: "''",
      borderStyle: "solid",
      borderColor: "transparent",
      borderWidth: 4,
      borderRightColor: token.colorPrimary,
    },
  },
  "&.clone .item": {
    opacity: 0.8,
    backgroundColor: token.colorBgTextHover,
    boxShadow: "0px 15px 15px 0 " + token.colorBgTextHover,
  },
}))
const MenuItem = styled(IFlexR)({
  padding: "4px 6px 4px 30px",
  borderRadius: 6,
  ".dndIcon": {
    position: "absolute",
    top: 4,
    left: 4,
  },
  ".dndIcon:hover": {
    cursor: "grabbing",
  },
})

const SimpleIcon = styled("div")({
  position: "absolute",
  top: 9,
  left: 9,
  ".anticon": {
    display: "block",
    fontSize: 14,
  },
})
