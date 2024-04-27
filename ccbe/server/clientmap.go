package server

import (
	"log"
)

// 所有客户端连接 map
type RidClientMap map[string]chan int64
type ClientMap map[int]RidClientMap

// 初始化客户端连接映射
func NewSSEClientMap() *ClientMap {
	m := make(ClientMap)
	return &m
}

func (m *ClientMap) AddClient(uid int, rid string, client chan int64) {
	if uid == 0 || rid == "" {
		return
	}
	if _, ok := (*m)[uid]; !ok {
		(*m)[uid] = make(RidClientMap)
	}
	(*m)[uid][rid] = client
}

func (m *ClientMap) DelClient(uid int, rid string) {
	if uid == 0 || rid == "" {
		return
	}
	delete((*m)[uid], rid)
}

func (m *ClientMap) PushMsg(uid int, rid string, msg int64) {
	if uid == 0 || rid == "" {
		return
	}
	defer func() {
		if r := recover(); r != nil {
			log.Println("PushMsg ex. ", uid, rid, msg, r)
		}
	}()
	if rm, ok := (*m)[uid]; ok {
		// fmt.Println("PushMsg", uid, rid, msg, rm)
		for ri, client := range rm {
			// fmt.Printf("%d - %s: %d\n", uid, rid, client)
			if ri != rid && client != nil {
				client <- msg
			}
		}
	}
}
