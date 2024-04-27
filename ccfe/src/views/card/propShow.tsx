import React, { ReactNode } from "react"
import { CardProp, Colors } from "@/types"
import { Tag, Typography } from "antd"
import styled from "@emotion/styled"
import {
  AlignLeftOutlined,
  BarsOutlined,
  CalendarOutlined,
  DownCircleOutlined,
  LockOutlined,
  MobileOutlined,
  NumberOutlined,
} from "@ant-design/icons"
import { formatLinkData } from "@/utils"

type PropShowProps = {
  icon: ReactNode
  prop: CardProp
  children?: React.ReactNode
}
type ShowProps = {
  prop: CardProp
}
type SelectProps = ShowProps & {
  colors: Colors
}

const { Text, Link, Paragraph } = Typography

const PropShow: React.FC<PropShowProps> = ({ icon, prop, children }) => {
  // const isInline = prop.show?.some((i) => i === "inline")
  return (
    // <PropTypography ellipsis={isInline}>
    //   <Text className="propName">
    //     {icon} {prop.name}
    //   </Text>
    //   {children}
    // </PropTypography>
    <div className="cardPropLine">
      <span className="propName">
        {icon} {prop.name}
      </span>
      {children}
    </div>
  )
}

const PropTypography = styled(Paragraph)({
  wordBreak: "break-all",
  "&.ant-typography": {
    marginBottom: 1,
  },
  ".propName": {
    fontSize: 12,
    lineHeight: "22px",
    marginRight: 6,
    verticalAlign: "bottom",
    opacity: 0.45,
  },
})

export const TextPropShow: React.FC<ShowProps> = ({ prop }) => {
  return (
    <PropShow icon={<AlignLeftOutlined />} prop={prop}>
      {prop.val}
    </PropShow>
  )
}

export const PasswordPropShow: React.FC<ShowProps> = ({ prop }) => {
  return (
    <PropShow icon={<LockOutlined />} prop={prop}>
      {prop.val ? "••••••••" : ""}
    </PropShow>
  )
}

export const NumberPropShow: React.FC<ShowProps> = ({ prop }) => {
  return (
    <PropShow icon={<NumberOutlined />} prop={prop}>
      {prop.val}
    </PropShow>
  )
}

export const SelectShow: React.FC<SelectProps> = ({ prop, colors }) => {
  const opt = prop.options?.find((opt) => prop.val === opt.id)
  return (
    <PropShow icon={<DownCircleOutlined />} prop={prop}>
      {opt && (
        <Tag color={colors.get(opt.color)?.bg || opt.color} className="align-bottom">
          {opt.label}
        </Tag>
      )}
    </PropShow>
  )
}

export const MSelectShow: React.FC<SelectProps> = ({ prop, colors }) => {
  const vals = (prop.val as string[]) || []
  const opts = prop.options?.filter((opt) => vals.some((v) => v === opt.id))
  return (
    <PropShow icon={<BarsOutlined />} prop={prop}>
      {opts?.map((opt) => (
        <Tag key={opt.id} color={colors.get(opt.color)?.bg || opt.color} className="align-bottom">
          {opt.label}
        </Tag>
      ))}
    </PropShow>
  )
}

export const LinkPropShow: React.FC<ShowProps> = ({ prop }) => {
  const { link, text } = formatLinkData(prop.val)
  return (
    <PropShow icon={<AlignLeftOutlined />} prop={prop}>
      <Link href={link} target="_blank">
        {text || link}
      </Link>
    </PropShow>
  )
}

export const PhonePropShow: React.FC<ShowProps> = ({ prop }) => {
  return (
    <PropShow icon={<MobileOutlined />} prop={prop}>
      {prop.val}
    </PropShow>
  )
}
export const DatePropShow: React.FC<ShowProps> = ({ prop }) => {
  return (
    <PropShow icon={<CalendarOutlined />} prop={prop}>
      {prop.val}
    </PropShow>
  )
}
