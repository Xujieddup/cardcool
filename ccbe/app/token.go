package app

import (
	"time"

	"cc/be/global"
	"cc/be/utils"

	jwt "github.com/golang-jwt/jwt/v4"
)

type Claims struct {
	Uid int `json:"uid"`
	// 每次登录生成的随机唯一 ID，用于标识当前登录token
	Rid string `json:"rid"`
	jwt.RegisteredClaims
}

// 生成 token
func GenerateToken(uid int) (string, int64, error) {
	expireTime := time.Now().Add(global.JwtSetting.Expire)
	claims := Claims{
		Uid: uid,
		Rid: utils.Unid(expireTime.UnixMilli()),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime), // 过期时间
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &claims)
	res, err := token.SignedString(getSecret())
	return res, expireTime.Unix(), err
}

func getSecret() []byte {
	return []byte(global.JwtSetting.Secret)
}
func secretFunc(token *jwt.Token) (interface{}, error) {
	return getSecret(), nil
}

// 解析 token
func ParseToken(token string) (*Claims, error) {
	tokenClaims, err := jwt.ParseWithClaims(token, &Claims{}, secretFunc)
	if err != nil || tokenClaims == nil {
		return nil, err
	}
	if claims, ok := tokenClaims.Claims.(*Claims); ok && tokenClaims.Valid {
		return claims, nil
	}
	return nil, err
}
