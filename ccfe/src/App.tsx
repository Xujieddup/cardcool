import React, { useEffect } from "react"
import { Switch, Route, useHistory, useLocation } from "react-router-dom"
import { Index } from "@/pages/Index"
import { BindWechat, Callback, LoginMobile } from "@/pages/Account"
import { getUserData } from "@/datasource"

const accountPages = ["/login_mobile", "/callback"]

export const App: React.FC = () => {
  const { pathname, search } = useLocation()
  const history = useHistory()
  // 初始化登录状态
  const user = getUserData()
  useEffect(() => {
    const isAccountPage = accountPages.some((p) => p === pathname)
    if (!user && !isAccountPage) {
      console.log("App - not login, need jump to login path")
      history.push("/login_mobile")
    } else if (user && isAccountPage) {
      history.replace("/")
    }
  })
  console.log("Render: App")
  return (
    <Switch>
      <Route path="/callback">
        <Callback />
      </Route>
      <Route path="/bindwechat">
        <BindWechat />
      </Route>
      <Route path="/login_mobile">
        <LoginMobile codeStr={search} />
      </Route>
      <Route path={["/:spaceId/:viewId", "/:spaceId", "/"]}>{user && <Index />}</Route>
    </Switch>
  )
}
