import React, { useMemo, useState } from "react"
import type { PropLink } from "@/types"
import { formatLinkData } from "@/utils"
import { Button, Popover, Typography } from "antd"
import { LinkEditForm } from "@/components/card/props"

type Props = {
  value?: string | PropLink
  onChange?: (value?: string | PropLink) => void
}

export const DefaultLink: React.FC<Props> = ({ value = "", onChange }) => {
  const [open, setOpen] = useState(false)
  const link = useMemo(() => formatLinkData(value), [value])
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
  console.log("Render: LinkEdit", value, link)
  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      content={<LinkEditForm setOpen={setOpen} link={link} onChange={onChange} />}
    >
      <Button block style={{ textAlign: "left", padding: "4px 11px" }}>
        {link.link ? (
          <Typography.Link ellipsis>{link.text || link.link}</Typography.Link>
        ) : (
          <span style={{ color: "rgba(0, 0, 0, 0.25)" }}>无</span>
        )}
      </Button>
    </Popover>
  )
}
