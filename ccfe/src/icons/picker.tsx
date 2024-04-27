import React, { memo, useCallback, useState } from "react"
import { Button, Popover, Space, Typography } from "antd"
import styled from "@emotion/styled"
import { IIcon } from "./iicon"
import iconData from "./data.json"

type DataType = {
  group: string
  icons: string[]
}
const data: DataType[] = iconData

type Props = {
  icon: string
  handleIconSelect: (icon: string) => void
}

export const IPicker: React.FC<Props> = memo(({ icon, handleIconSelect }: Props) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
  const handleSelect = useCallback(
    (newIcon: string) => {
      setOpen(false)
      handleIconSelect(newIcon)
    },
    [handleIconSelect]
  )
  return (
    <Popover
      content={
        <PickerBox>
          {data.map((item) => (
            <React.Fragment key={"pickerGroup_" + item.group}>
              <Typography.Title level={5}>{item.group}</Typography.Title>
              <IconSpace size={0} wrap>
                {item.icons.map((ii) => (
                  <Button
                    onClick={() => handleSelect(ii)}
                    key={"pickerIcon_" + ii}
                    type="text"
                    shape="circle"
                  >
                    <IIcon icon={ii} />
                  </Button>
                ))}
              </IconSpace>
            </React.Fragment>
          ))}
        </PickerBox>
      }
      trigger="click"
      open={open}
      placement="bottomLeft"
      onOpenChange={handleOpenChange}
      arrow={false}
    >
      <PickerButton type="dashed" icon={<IIcon icon={icon} />} />
    </Popover>
  )
})

const PickerBox = styled("div")({
  width: 360,
  "button.ant-btn": {
    width: 36,
    height: 36,
    ".anticon": {
      fontSize: 16,
      transform: "scale(1.5)",
    },
    ".icon": {
      transform: "scale(1.333333333)",
    },
  },
})
const IconSpace = styled(Space)({
  marginBottom: 6,
})
const PickerButton = styled(Button)({
  "&.ant-btn .anticon": {
    fontSize: 16,
    transform: "scale(1.25)",
  },
  ".icon": {
    transform: "scale(1.111111111)",
  },
})
