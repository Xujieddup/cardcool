package utils

import (
	"math/rand"
	"time"
)

const base string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const cnt int64 = 62

func RandStrBySeed(n int) string {
	//利用当前时间的UNIX时间戳初始化rand包
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, n)
	for i := range b {
		b[i] = base[rand.Intn(62)]
	}
	return string(b)
}

func RandStr(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = base[rand.Intn(62)]
	}
	return string(b)
}

func Unid(t int64) string {
	arr := make([]byte, 7)
	for i := 6; t > 0 && i >= 0; i-- {
		arr[i] = base[t%cnt]
		t = t / cnt
	}
	return string(arr) + RandStrBySeed(5)
}

func UnidByNum(num int) string {
	t := time.Now().UnixMilli()
	arr := make([]byte, 7)
	for i := 6; t > 0 && i >= 0; i-- {
		arr[i] = base[t%cnt]
		t = t / cnt
	}
	return string(arr) + RandStrBySeed(num-7)
}
