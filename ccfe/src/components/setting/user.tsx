import React, { ChangeEventHandler, memo, useCallback, useEffect, useMemo, useState } from "react"
import {
  LinkOutlined,
  LockOutlined,
  MobileOutlined,
  PlusOutlined,
  WechatOutlined,
} from "@ant-design/icons"
import { Button, Input, Upload, Typography, App, theme, Row, Col, Modal, Form, Popover } from "antd"
import type { RcFile, UploadFile } from "antd/es/upload/interface"
import type { UploadRequestOption } from "rc-upload/lib/interface"
import { IFlexR, IFlexRB, IconBtn } from "@/ui"
import styled from "@emotion/styled"
import { uploadImage } from "@/services"
import { updateUserinfoApi, setUserinfoParams, updateMobileAccountApi } from "@/datasource"
import cc from "classcat"
import type { Resp, Userinfo } from "@/types"
import { GetSetUserinfoFunc, SetUserinfoFunc, useConfigStore } from "@/store"
import { APP_ID, INVITE_URL, STATIC_URL } from "@/config"
import { IIcon } from "@/icons"
import copy from "copy-to-clipboard"
import { MessageInstance } from "antd/es/message/interface"

const userinfoSelector: GetSetUserinfoFunc = (state) => state.setUserinfo

type UserData = Userinfo & {
  status?: number // 状态，0-初始化，1-可修改，2-已修改
}

type Props = {
  userinfo: Userinfo | null
}

const deafultInfo = {
  username: "",
  avatar: "",
  mobile: "",
  openid: "",
  code: "",
  fsize: "",
  status: 0,
}
const redirectUri = encodeURIComponent("https://i.cardcool.top/bindwechat")
const wechatSrc = `https://open.weixin.qq.com/connect/qrconnect?appid=${APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&login_type=jssdk&self_redirect=false&state=`

export const UserSetting = memo(({ userinfo }: Props) => {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const setUserinfo = useConfigStore(userinfoSelector)
  const [editMobile, setEditMobile] = useState(false)
  const [bindWechat, setBindWechat] = useState(false)
  const [info, setInfo] = useState<UserData>(deafultInfo)
  const inviteUrl = useMemo(() => (info.code ? INVITE_URL + "?" + info.code : ""), [info.code])

  useEffect(() => {
    if (userinfo) {
      setInfo({ ...userinfo, status: 1 })
    }
  }, [userinfo])
  const customRequest = useCallback((options: UploadRequestOption<UploadFile>) => {
    // console.log("customRequest", options)
    uploadImage(options.file as File).then((url) => {
      // console.log("uploadImage url", url)
      setInfo((oldUser) => ({ ...oldUser, status: 2, avatar: STATIC_URL + url }))
    })
  }, [])
  const handleChangeName: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setInfo((oldUser) => ({ ...oldUser, status: 2, username: e.target.value.trim() }))
  }, [])
  const beforeUpload = useCallback(
    (file: RcFile) => {
      const checkFileType = file.type === "image/jpeg" || file.type === "image/png"
      if (!checkFileType) {
        message.error("只支持 JPG/PNG 格式图片")
      }
      const checkFileSize = file.size / 1024 / 1024 < 1
      if (!checkFileSize) {
        message.error("图片不能超过 1M")
      }
      return checkFileType && checkFileSize
    },
    [message]
  )
  const handleUpdate = useCallback(
    (info: UserData) => {
      // console.log("handleUpdate", info)
      const { username, avatar } = info
      if (!avatar) {
        message.error("请设置头像")
        return
      }
      if (!username) {
        message.error("昵称不能为空")
        return
      }
      if (username.length > 32) {
        message.error("昵称不能超过32个字符")
        return
      }
      const avatarName = avatar.replace(STATIC_URL, "")
      updateUserinfoApi(username, avatarName).then((res) => {
        if (!res) {
          message.error("同步服务端账号信息失败")
        } else {
          message.success("更新账号信息成功")
        }
        setUserinfoParams({ username, avatar: avatarName })
        setUserinfo({ username, avatar })
      })
    },
    [message, setUserinfo]
  )
  const handleCopy = useCallback(
    (url: string) => {
      const copyRes = copy(url)
      copyRes && message.success("复制成功，请分享给您的邀请对象")
    },
    [message]
  )
  console.log("Render: AccountSetting")
  return (
    <>
      <ItemBox>
        <TextLabel type="secondary">头像昵称</TextLabel>
        <IFlexR>
          <UploadBox>
            <Upload
              name="avatar"
              accept="image/png,image/jpeg"
              listType="picture-card"
              showUploadList={false}
              customRequest={customRequest}
              beforeUpload={beforeUpload}
            >
              {info.avatar ? (
                <img src={info.avatar} alt="avatar" style={{ width: "100%", height: "100%" }} />
              ) : (
                <PlusOutlined />
              )}
            </Upload>
          </UploadBox>
          <Input
            value={info.username}
            onChange={handleChangeName}
            spellCheck={false}
            placeholder="用户昵称"
            className="mr8"
          />
          <Button onClick={() => handleUpdate(info)} className={cc({ hidden: info.status !== 2 })}>
            确认
          </Button>
        </IFlexR>
      </ItemBox>
      <ItemBox>
        <TextLabel type="secondary">账号绑定</TextLabel>
        <Row gutter={8}>
          <Col span={12}>
            <ItemBlock style={{ backgroundColor: token.colorBorderSecondary }}>
              <ItemText ellipsis>
                <WechatOutlined />
                {info.openid ? "微信账号" : "未绑定微信"}
              </ItemText>
              {info.openid ? (
                <Typography.Text type="success" style={{ marginRight: 12 }}>
                  已绑定
                </Typography.Text>
              ) : (
                <Button type="link" onClick={() => setBindWechat(true)}>
                  绑定
                </Button>
              )}
            </ItemBlock>
          </Col>
          <Col span={12}>
            <ItemBlock style={{ backgroundColor: token.colorBorderSecondary }}>
              <ItemText ellipsis>
                <MobileOutlined />
                {info.mobile || "未设置手机号"}
              </ItemText>
              <Popover
                trigger="click"
                placement="bottomRight"
                arrow={false}
                open={editMobile}
                onOpenChange={(openStatus) => setEditMobile(openStatus)}
                destroyTooltipOnHide
                content={
                  <MobileForm
                    setEditMobile={setEditMobile}
                    mobile={info.mobile}
                    message={message}
                    setUserinfo={setUserinfo}
                  />
                }
              >
                <IconBtn
                  onClick={() => setEditMobile(true)}
                  type="link"
                  icon={<IIcon icon="edit" />}
                />
              </Popover>
            </ItemBlock>
          </Col>
        </Row>
      </ItemBox>
      {inviteUrl && (
        <ItemBox>
          <TextLabel type="secondary">邀请链接</TextLabel>
          <ItemBlock style={{ backgroundColor: token.colorBorderSecondary }}>
            <ItemText ellipsis>
              <LinkOutlined />
              {inviteUrl}
            </ItemText>
            <IconBtn
              onClick={() => handleCopy(inviteUrl)}
              type="link"
              icon={<IIcon icon="copy" />}
            />
          </ItemBlock>
        </ItemBox>
      )}
      {bindWechat && (
        <Modal
          width={348}
          centered
          open
          closeIcon={false}
          footer={null}
          onCancel={() => setBindWechat(false)}
        >
          <iframe
            src={wechatSrc}
            frameBorder={0}
            width={300}
            height={400}
            sandbox="allow-scripts allow-top-navigation allow-same-origin"
          />
        </Modal>
      )}
    </>
  )
})

const UploadBox = styled("div")({
  "& .ant-upload-wrapper .ant-upload.ant-upload-select": {
    width: 32,
    height: 32,
    marginBottom: 0,
  },
  img: {
    borderRadius: 8,
  },
})

const ItemBox = styled("div")({
  marginBottom: 16,
})

const TextLabel = styled(Typography.Paragraph)({
  "&.ant-typography": {
    marginBottom: 6,
  },
})

const ItemBlock = styled(IFlexR)({
  borderRadius: 6,
  paddingLeft: 8,
})
const ItemText = styled(Typography.Text)({
  flex: 1,
  lineHeight: "32px",
  ".anticon": { marginRight: 6 },
})

type MobileFormProps = {
  setEditMobile: React.Dispatch<React.SetStateAction<boolean>>
  mobile: string
  message: MessageInstance
  setUserinfo: SetUserinfoFunc
}
type MobileForm = {
  mobile: string
  oldPassword: string
  newPassword: string
}
const MobileForm = memo(({ setEditMobile, mobile, message, setUserinfo }: MobileFormProps) => {
  const [form] = Form.useForm<MobileForm>()
  // 编辑类型，1-新增手机号和密码，2-修改手机号(需输入密码)，3-修改手机号和密码(需输入原密码和新密码)
  const [editType, setEditType] = useState(mobile ? 2 : 1)
  useEffect(() => {
    form.setFieldsValue({ mobile, oldPassword: mobile ? "" : undefined, newPassword: "" })
  }, [form, mobile])
  const onFinish = useCallback(
    (values: any) => {
      console.log("values", values)
      const mobile = (values.mobile || "").trim()
      const oldPassword = (values.oldPassword || "").trim()
      const newPassword = (values.newPassword || "").trim()
      if (!mobile || mobile.length !== 11) {
        message.error("手机号格式异常")
        return
      }
      if (editType === 1) {
        if (!newPassword || newPassword.length < 6 || newPassword.length > 32) {
          message.error("密码需 6-32 个字符")
          return
        }
      } else if (editType === 2) {
        // 不用校验
      } else if (editType === 3) {
        if (!oldPassword || oldPassword.length < 6 || oldPassword.length > 32) {
          message.error("原密码需 6-32 个字符")
          return
        }
        if (!newPassword || newPassword.length < 6 || newPassword.length > 32) {
          message.error("新密码需 6-32 个字符")
          return
        }
        if (newPassword === oldPassword) {
          message.error("新密码和原密码不能一样")
          return
        }
      } else {
        message.error("系统异常，请刷新页面重试")
        return
      }
      updateMobileAccountApi(mobile, editType, oldPassword, newPassword).then(
        (res: Resp) => {
          const { code, msg } = res
          if (code !== 0) {
            message.error(msg)
          } else {
            const tip =
              editType === 1
                ? "手机账号设置成功"
                : editType === 2
                ? "手机号修改成功"
                : editType === 3
                ? "密码修改成功"
                : ""
            message.success(tip)
            setUserinfo({ mobile })
            if (editType === 3) setEditType(2)
            setEditMobile(false)
          }
        },
        (error: Error) => {
          console.error("登录请求异常", error)
          message.error("登录请求异常")
        }
      )
    },
    [editType, message, setEditMobile, setUserinfo]
  )
  // console.log("MobileForm - render", mobile)
  return (
    <MobileFormBox form={form} name="mobileEditForm" onFinish={onFinish}>
      <Form.Item name="mobile" noStyle>
        <Input prefix={<MobileOutlined />} type="text" placeholder="手机号" />
      </Form.Item>
      {editType === 1 ? (
        <Form.Item name="newPassword" noStyle>
          <Input.Password prefix={<LockOutlined />} type="password" placeholder="密码" />
        </Form.Item>
      ) : editType === 3 ? (
        <>
          <Form.Item name="oldPassword" noStyle>
            <Input.Password prefix={<LockOutlined />} type="password" placeholder="原密码" />
          </Form.Item>
          <Form.Item name="newPassword" noStyle>
            <Input.Password prefix={<LockOutlined />} type="password" placeholder="新密码" />
          </Form.Item>
        </>
      ) : (
        <></>
      )}
      <IFlexRB>
        {editType === 2 ? (
          <Button type="link" htmlType="button" size="small" onClick={() => setEditType(3)}>
            修改密码
          </Button>
        ) : editType === 3 ? (
          <Button type="link" htmlType="button" size="small" onClick={() => setEditType(2)}>
            修改手机号
          </Button>
        ) : (
          <span />
        )}
        <Button type="primary" htmlType="submit" size="small">
          确定
        </Button>
      </IFlexRB>
    </MobileFormBox>
  )
})

const MobileFormBox = styled(Form)({
  ".ant-input-affix-wrapper": {
    display: "flex",
    width: 240,
    marginBottom: 12,
  },
})
