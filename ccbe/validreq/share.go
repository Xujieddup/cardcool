package validreq

// 创建或刷新视图分享
type CreateShareReq struct {
	ViewId  string `json:"view_id" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Type    int8   `json:"type"`
	Icon    string `json:"icon" binding:"required"`
	Content string `json:"content" binding:"required"`
}

// 更新视图分享状态
type UpdateShareStatusReq struct {
	ViewId string `json:"view_id" binding:"required"`
	Status int8   `json:"status"`
}
