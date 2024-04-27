import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import styled from "@emotion/styled"
import { Select, Tooltip, Typography, theme } from "antd"
import { IFlexRB } from "@/ui"
import { Space, StyledToken } from "@/types"
import { HeaderUser } from "./user"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import { setLocalSpaceId } from "@/datasource"
import { IIcon } from "@/icons"
import { IconBtn } from "@/ui"

const dbSelector: GetDB = (state) => state.db

interface Props {
  spaceId: string
}

export const MenuHeader = memo(({ spaceId }: Props) => {
  const history = useHistory()
  const db = useDBStore(dbSelector)
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  // 初始化节点空间
  const [spaces, setSpaces] = React.useState<Space[]>([])
  useEffect(() => {
    let queryHandler: any = null
    db?.space.getSpacesQuery().then((query) => {
      queryHandler = query.$.subscribe((docs) => {
        const newSpaces = docs.map((doc) => doc.toJSON() as Space)
        // console.log("Sub - space update", newSpaces)
        setSpaces(newSpaces)
      })
    })
    return () => queryHandler?.unsubscribe()
  }, [db])
  const currentSpaceId = spaces.length > 0 ? spaceId : ""
  const handleJumpSpaces = useCallback(() => {
    setOpen(false)
    history.push("/" + spaceId + "/spaces")
  }, [history, spaceId])
  const options = useMemo(() => {
    const list = spaces.map((s) => {
      return {
        label: (
          <BgIconTextBox ellipsis token={token}>
            <span className="bgIcon">
              <IIcon icon={s.icon} />
            </span>
            {s.name}
          </BgIconTextBox>
        ),
        value: s.id,
      }
    })
    return [
      {
        label: (
          <IFlexRB>
            <span>卡片空间</span>
            <Tooltip title="空间管理" placement="right">
              <IconBtn
                onClick={handleJumpSpaces}
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
  }, [handleJumpSpaces, spaces, token])
  // 切换空间
  const handleChange: any = useCallback(
    (value: string) => {
      setLocalSpaceId(value)
      history.push("/" + value)
    },
    [history]
  )
  const handleDropdownVisibleChange = useCallback((open: boolean) => {
    setOpen(open)
  }, [])
  console.log("Menu - Header - render")
  return (
    <HeaderBox className="menuHeaderBox">
      <HeaderNoDragBox>
        <SpaceSelect
          bordered={false}
          popupClassName="selectGroup spaceSelectGroup"
          className="hoverBg"
          suffixIcon={false}
          value={currentSpaceId}
          options={options}
          onChange={handleChange}
          open={open}
          onDropdownVisibleChange={handleDropdownVisibleChange}
        />
        <HeaderUser spaceId={spaceId} />
      </HeaderNoDragBox>
    </HeaderBox>
  )
})

const HeaderBox = styled("div")({
  padding: "16px 4px 8px 10px",
})
const HeaderNoDragBox = styled(IFlexRB)({
  width: "100%",
})

const SpaceSelect = styled(Select)({
  flex: 1,
  borderRadius: 6,
  "&.ant-select-single .ant-select-selector": {
    padding: "0 6px 0 4px",
  },
  ".ant-select-selection-item > .ant-typography": {
    fontWeight: 500,
    lineHeight: "30px",
  },
})

// 空间下拉列表的带背景色icon文本
const BgIconTextBox = styled(Typography.Text)(({ token }: StyledToken) => ({
  position: "relative",
  paddingLeft: 30,
  ".bgIcon": {
    display: "inline-block",
    backgroundColor: token.colorPrimary,
    color: token.colorBgContainer,
    borderRadius: 4,
    lineHeight: 1,
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
    padding: 3,
    ".ifont": {
      fontSize: 18,
    },
  },
}))
