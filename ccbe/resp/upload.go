package resp

type UploadToken struct {
	Token      string `json:"token" redis:"token"`
	ExpireTime int64  `json:"expire_time" redis:"expire_time"`
}
