// import dagre from "dagre"

// const dagreGraph = new dagre.graphlib.Graph()
// dagreGraph.setDefaultEdgeLabel(() => ({}))
// export const getLayoutedElements = (nodes, edges, direction = "TB") => {
//   console.log("dagreGraph - getLayoutedElements", nodes, edges, direction)
//   if (nodes.length === 0) return { nodes: [], edges: [] }
//   const isHorizontal = direction === "LR" || direction === "RL"
//   dagreGraph.setGraph({ rankdir: direction, ranker: "tight-tree" })
//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, {
//       width: node.width,
//       height: node.height,
//     })
//   })
//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target)
//   })
//   dagre.layout(dagreGraph)
//   // 基于根节点计算相对间距
//   const rootNode = nodes[0]
//   const newRootNode = dagreGraph.node(rootNode.id)
//   // const relateX = newRootNode.x - newRootNode.width / 2 - rootNode.position.x
//   // const relateY = newRootNode.y - newRootNode.height / 2 - rootNode.position.y
//   const relateX = newRootNode.x - (isHorizontal ? 0 : newRootNode.width / 2)
//   const relateY = newRootNode.y - (!isHorizontal ? 0 : newRootNode.height / 2)
//   nodes.forEach((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id)
//     // node.targetPosition = isHorizontal ? "left" : "top"
//     // node.sourcePosition = isHorizontal ? "right" : "bottom"
//     // We are shifting the dagre node position (anchor=center center) to the top left
//     // so it matches the React Flow node anchor point (top left).
//     node.position = {
//       x: nodeWithPosition.x - (isHorizontal ? 0 : nodeWithPosition.width / 2) - relateX,
//       y: nodeWithPosition.y - (!isHorizontal ? 0 : nodeWithPosition.height / 2) - relateY,
//     }
//   })
//   edges.forEach((edge) => {
//     // const newEdge = dagreGraph.edge(edge.id)
//     edge.sourceHandle = isHorizontal ? "sr" : "sb"
//     edge.targetHandle = isHorizontal ? "tl" : "tt"
//   })
//   console.log("dagreGraph", dagreGraph.nodes())
//   return { nodes, edges }
// }
