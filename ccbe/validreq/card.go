package validreq

type CreateCardReq struct {
	Name    string `json:"name" binding:"required"`
	TypeId  uint8  `json:"type_id" binding:"required,min=1"`
	CateId  uint8  `json:"cate_id" binding:"required,min=1"`
	Content string `json:"content" binding:"required"`
}
