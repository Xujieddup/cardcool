package api

type NodeApi struct{}

func NewNodeApi() *NodeApi {
	return &NodeApi{}
}

// 新建节点
// func (n *NodeApi) CreateNode(c *gin.Context) {
// 	param := &validreq.CreateNodeReq{}
// 	resp, err := validParams(c, param)
// 	if err != nil {
// 		return
// 	}
// 	srv := service.New(c.Request.Context())
// 	nodeId, err := srv.CreateNode(param)
// 	if err != nil {
// 		resp.Error(errcode.CreateInfoError, err)
// 		return
// 	}
// 	resp.Success(gin.H{
// 		"id": nodeId,
// 	})
// }
