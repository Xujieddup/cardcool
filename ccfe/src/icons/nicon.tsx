import React, { memo } from "react"
import { icons } from "lucide-react"
import cc from "classcat"
import Icon from "@ant-design/icons"

export type IconProps = {
  icon: keyof typeof icons
  className?: string
  strokeWidth?: number
}

export const NIcon = memo(({ icon, className, strokeWidth }: IconProps) => {
  const IconComponent = icons[icon]
  if (!IconComponent) return null
  return (
    <Icon
      className="nicon iicon ifont"
      component={() => <IconComponent className={cc("w-4 h-4")} />}
    />
  )
  // <IconComponent className={cc("w-4 h-4")} strokeWidth={strokeWidth || 2.5} />
})

NIcon.displayName = "Icon"
