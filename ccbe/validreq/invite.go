package validreq

type GenerateCodesReq struct {
	LimitType int8 `json:"limit_type"`
	StartTime int  `json:"start_time"`
	EndTime   int  `json:"end_time"`
	Num       int  `json:"num" binding:"required"`
}
