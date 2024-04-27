import React, { memo, useCallback, useEffect, useState } from "react"
import { App, Button, Layout, Modal, Radio, RadioChangeEvent, Typography, theme } from "antd"
import { shallow } from "zustand/shallow"
import { useModelStore, useDBStore } from "@/store"
import type { UseMTPropTypeId, GetDB } from "@/store"
import styled from "@emotion/styled"
import type { StyledToken, TypeInfo } from "@/types"
import { TypeStruct } from "./struct"
import { TypeStyles } from "./style"

// 场景
enum ShowCaseEnum {
  STRUCT,
  STYLE,
}
const dbSelector: GetDB = (state) => state.db
const selector: UseMTPropTypeId = (state) => [state.mTPropTypeId, state.setMTPropTypeId]

export const TypePanel: React.FC = memo(() => {
  const db = useDBStore(dbSelector)
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const [mTPropTypeId, setMTPropTypeId] = useModelStore(selector, shallow)
  const isOpen = mTPropTypeId !== undefined
  const [showCase, setShowCase] = useState(ShowCaseEnum.STRUCT)
  const onChange = useCallback((e: RadioChangeEvent) => setShowCase(e.target.value), [])
  // 模板名称
  const [typeInfo, setTypeInfo] = useState<TypeInfo>()
  const [saveTime, setSaveTime] = useState(0)
  useEffect(() => {
    if (mTPropTypeId) {
      db?.type.getTypeInfo(mTPropTypeId).then((t) => {
        if (t) {
          setTypeInfo(t)
          setSaveTime(0)
          setShowCase(ShowCaseEnum.STRUCT)
        } else {
          message.error("查询卡片模板信息失败")
          setMTPropTypeId()
        }
      })
    }
  }, [db, mTPropTypeId, message, setMTPropTypeId])

  // 初始化时会刷新三次: 初始化、setTypeProps、reset
  console.log("Render: TypePanel")
  return (
    <ModalContainer
      open={isOpen}
      onCancel={() => setMTPropTypeId()}
      centered
      width={860}
      footer={null}
      token={token}
      closable={false}
    >
      <Layout className="panelContainer">
        <Layout.Header className="panelHeader">
          <Typography.Text className="title" strong>
            {typeInfo?.name}
          </Typography.Text>
          <Radio.Group onChange={onChange} value={showCase} buttonStyle="solid">
            <Radio.Button value={ShowCaseEnum.STRUCT}>卡片结构</Radio.Button>
            {/* <Radio.Button value={ShowCaseEnum.STYLE}>卡片样式</Radio.Button> */}
          </Radio.Group>
          <div className="handleBox">
            <Button onClick={() => setSaveTime(Date.now())} type="primary" size="small">
              保存
            </Button>
          </div>
        </Layout.Header>
        {showCase === ShowCaseEnum.STRUCT
          ? typeInfo && <TypeStruct typeInfo={typeInfo} saveTime={saveTime} />
          : typeInfo && <TypeStyles typeInfo={typeInfo} saveTime={saveTime} />}
      </Layout>
    </ModalContainer>
  )
})
const ModalContainer = styled(Modal)(({ token }: StyledToken) => ({
  ".ant-modal-content": {
    padding: 0,
  },
  ".panelContainer": {
    borderRadius: 8,
    padding: "0 16px",
    backgroundColor: token.colorBgContainer,
  },
  ".panelHeader": {
    backgroundColor: "inherit",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    margin: "0 -16px",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottom: "1px solid " + token.colorBorder,
    ".title": {
      position: "absolute",
      left: 16,
      fontSize: 16,
    },
    ".handleBox": {
      position: "absolute",
      right: 16,
    },
  },
  ".panelBody": {
    height: 480,
    backgroundColor: "inherit",
    ".panelLeft": {
      backgroundColor: "inherit",
      padding: "8px 16px 8px 0",
      boxShadow: "2px 0px 6px 0 " + token.colorFillSecondary,
      ".panelLeftTitle": {
        lineHeight: "24px",
        marginBottom: 8,
      },
      ".panelLeftBody .ant-btn": {
        textAlign: "left",
        padding: "4px 12px",
      },
    },
    ".panelContent": {
      backgroundColor: token.colorBgLayout,
      padding: "16px 0",
      ".cardBox": {
        height: "100%",
        padding: "8px 3px 6px",
        margin: "0 24px",
        borderRadius: 8,
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        overflowY: "auto",
        userSelect: "none",
        ".react-grid-item.react-grid-placeholder": {
          backgroundColor: token.colorPrimary,
          borderRadius: 4,
        },
        ".ant-input-disabled, .ant-select-disabled .ant-select-selector, .ant-select-disabled .ant-select-selector input, .ant-input-number-disabled .ant-input-number-input, .ant-picker.ant-picker-disabled, .ant-picker-input >input[disabled]":
          {
            cursor: "default",
            color: token.colorText,
            pointerEvents: "none",
          },
        ".hideProp": {
          opacity: 0.4,
        },
        ".phtext": {
          color: token.colorTextPlaceholder,
        },
        ".ant-select-multiple .ant-select-selection-overflow": {
          flexWrap: "nowrap",
        },
      },
    },
    ".panelRight": {
      backgroundColor: "inherit",
      padding: "8px 0 8px 16px",
      boxShadow: "-2px 0px 6px 0 " + token.colorFillSecondary,
      ".ant-form-item": {
        marginBottom: 8,
      },
    },
  },
  ".propActivite > div": {
    width: "100%",
  },
  ".propName": {
    width: 76,
  },
  // 这个样式需要放到最外层，避免影响 hover 时的背景
  ".ant-input-number-disabled, .ant-picker-disabled": {
    backgroundColor: "transparent",
  },
  ".propActivite.selected, .propActivite:hover": {
    borderColor: token.colorPrimary,
    ".react-resizable-handle-se::after, .react-resizable-handle-e::after": {
      borderColor: token.colorPrimary,
    },
  },
}))
