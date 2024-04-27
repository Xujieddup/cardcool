import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Theme } from "@/components/ui"
import { App } from "./App"
import "antd/dist/reset.css"
import "./index.css"
import "./main.css"
import "./reactflow.css"
import "@/assets/emojis.css"
import "virtual:svg-icons-register"

console.log("CardCool Start !!!")

window.onerror = (err) => {
  const msg = typeof err === "string" ? err : err.type
  const ignoreErrors = [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
  ]
  if (ignoreErrors.includes(msg)) {
    return
  }
  console.error("window.error", err, msg)
}
// 阻止 Ctrl+S 生效
window.onkeydown = (e) => {
  if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Theme>
      <App />
    </Theme>
  </BrowserRouter>
)
