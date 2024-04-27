package service

import (
	"errors"
	"net/http"
	"cc/be/cache"
	"cc/be/global"
	"cc/be/resp"
	"strconv"
	"time"

	"github.com/qiniu/go-sdk/v7/auth/qbox"
	"github.com/qiniu/go-sdk/v7/storage"
)

// 上传资源总额度: 1G = 1024*1024*1024
const SOURCE_LIMIT = 1073741824

// 登录账号
func (srv *Service) GetUploadToken() (*resp.UploadToken, error) {
	// 查询用户信息
	userinfo, err := srv.GetUserInfo()
	if err != nil {
		return nil, errors.New("查询用户信息异常")
	}
	fsize, isOk := (*userinfo)["fsize"]
	if !isOk {
		return nil, errors.New("查询用户资源总量异常")
	}
	size, _ := strconv.ParseInt(fsize, 10, 64)
	if size > SOURCE_LIMIT {
		return nil, errors.New("资源已超出额度")
	}
	uidStr := strconv.Itoa(global.Uid)
	data := cache.GetUploadToken(uidStr)
	if data.Token == "" {
		putPolicy := storage.PutPolicy{
			Scope:            global.QiniuSetting.Bucket,
			Expires:          uint64(global.QiniuSetting.ExpireTime),
			SaveKey:          "img/" + uidStr + "/${etag}${ext}",
			CallbackURL:      "https://i.cardcool.top/api/qiniucallback",
			CallbackBody:     `{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"uid":` + uidStr + `}`,
			CallbackBodyType: "application/json",
		}
		mac := qbox.NewMac(global.QiniuSetting.AccessKey, global.QiniuSetting.SecretKey)
		upToken := putPolicy.UploadToken(mac)
		if upToken == "" {
			return nil, errors.New("生成上传token异常")
		}
		data.Token = upToken
		data.ExpireTime = time.Now().Unix() + global.QiniuSetting.ExpireTime - 200
		cache.SetUploadToken(uidStr, data)
	}
	return data, nil
}

// 七牛云文件上传回调校验
// QBox ljccqOeFycTZDqb5N4cLADkvI1E4YJYortghRmS1:Nmm3ICp_Jt_lJt33ttWt6jjdLrU=
func (srv *Service) VerifyQiniuCallback(req *http.Request) (bool, error) {
	mac := qbox.NewMac(global.QiniuSetting.AccessKey, global.QiniuSetting.SecretKey)
	return qbox.VerifyCallback(mac, req)
}
