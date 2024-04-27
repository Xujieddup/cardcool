package resp

type ServerTime struct {
	LastUpdateTime int64 `json:"last_update_time"`
	CurrentTime    int64 `json:"current_time"`
}
