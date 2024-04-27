import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Button, Form, Input, Popover, Typography } from "antd"
import { IIcon } from "@/icons"
import type { PropLink, TypeProp } from "@/types"
import { BaseProp } from "./base"
import { AlignLeftOutlined, LinkOutlined } from "@ant-design/icons"
import { IFlexR, PropName } from "@/ui"
import styled from "@emotion/styled"
import { formatLinkData } from "@/utils"
import { IconBtn } from "@/ui"
import { PropNameEnum } from "@/enums"

type LinkEditFormProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  link: PropLink
  onChange?: (value?: string | PropLink) => void
}
export const LinkEditForm: React.FC<LinkEditFormProps> = ({ setOpen, link, onChange }) => {
  const [form] = Form.useForm<PropLink>()
  useEffect(() => {
    form.setFieldsValue(link)
  }, [form, link])
  const onFinish = useCallback(
    (values: any) => {
      const { text = "", link = "" } = values
      const newValue = !link ? undefined : { link, text }
      onChange?.(newValue)
      setOpen(false)
    },
    [onChange, setOpen]
  )
  const onReset = useCallback(() => {
    onChange?.(undefined)
    setOpen(false)
  }, [onChange, setOpen])
  // console.log("LinkEditForm - render", link)
  return (
    <LinkForm form={form} name="linkEditForm" onFinish={onFinish}>
      <Form.Item name="link" noStyle>
        <Input prefix={<LinkOutlined />} type="text" placeholder="链接地址" />
      </Form.Item>
      <Form.Item name="text" noStyle>
        <Input prefix={<AlignLeftOutlined />} placeholder="文本" />
      </Form.Item>
      <div className="handleBox">
        <Button type="text" htmlType="button" size="small" onClick={onReset}>
          清除
        </Button>
        <Button type="primary" htmlType="submit" size="small">
          确定
        </Button>
      </div>
    </LinkForm>
  )
}

const LinkForm = styled(Form)({
  ".ant-input-affix-wrapper": {
    display: "flex",
    width: 240,
    marginBottom: 12,
  },
  ".handleBox": {
    textAlign: "right",
    button: {
      marginLeft: 12,
    },
  },
})

type LinkEditProps = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  placeholder?: string
  disabled?: boolean
  value?: string | PropLink
  onChange?: (value?: string | PropLink) => void
}

const LinkEdit: React.FC<LinkEditProps> = ({
  open,
  setOpen,
  placeholder = "空",
  disabled = false,
  value = "",
  onChange,
}) => {
  const link = useMemo(() => formatLinkData(value), [value])
  const handleOpenChange = (newOpen: boolean) => {
    console.log("handleOpenChange", newOpen)
    setOpen(newOpen)
  }
  // console.log("Render: LinkEdit", value, link)
  return (
    <IFlexR className={"propItem linkProp" + (open ? " linkPropFocus" : "")}>
      {link.link && (
        <Typography.Link href={disabled ? undefined : link.link} target="_blank" ellipsis>
          {link.text || link.link}
        </Typography.Link>
      )}
      <Popover
        trigger="click"
        placement="bottomRight"
        arrow={false}
        open={open}
        onOpenChange={handleOpenChange}
        content={<LinkEditForm setOpen={setOpen} link={link} onChange={onChange} />}
      >
        <div className="linkPlace">
          {!link.link && <span style={{ color: "rgba(0, 0, 0, 0.25)" }}>{placeholder}</span>}
        </div>
      </Popover>
    </IFlexR>
  )
}

type Props = {
  item: TypeProp
  handleCopy?: (propId: string, propType?: string) => void
  disabled?: boolean
}

export const LinkProp: React.FC<Props> = ({ item, handleCopy, disabled = false }) => {
  const [open, setOpen] = useState(false)
  const supportCopy = useMemo(() => item.handles?.includes("copy"), [item.handles])
  const setOpenFunc = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(true)
  }, [])
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <LinkOutlined /> {item.name}
          </PropName>
        )
      }
      handler={
        <>
          {supportCopy && (
            <IconBtn
              onClick={() => handleCopy?.(item.id, "link")}
              icon={<IIcon icon="copy" />}
              size="small"
              type="text"
            />
          )}
          <IconBtn onClick={setOpenFunc} icon={<IIcon icon="edit" />} size="small" type="text" />
        </>
      }
    >
      <LinkEdit
        open={disabled ? false : open}
        setOpen={setOpen}
        placeholder={placeholder}
        disabled={disabled}
      />
    </BaseProp>
  )
}
