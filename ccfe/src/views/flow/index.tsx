import React from "react"
import { LeftSider } from "./leftSider"
import { RFView } from "./graph"
import { ReactFlowProvider } from "@/reactflow"

type Props = {
  spaceId: string
  viewId: string
}

export const FlowGraphView: React.FC<Props> = ({ spaceId, viewId }) => {
  console.log("FlowGraph - render")
  return (
    <ReactFlowProvider>
      <RFView spaceId={spaceId} viewId={viewId} />
      {viewId !== "views" && <LeftSider />}
    </ReactFlowProvider>
  )
}
