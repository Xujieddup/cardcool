package service

import (
	"crypto/md5"
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"
	"unicode/utf8"

	"cc/be/cache"
	"cc/be/global"
	"cc/be/model"
	"cc/be/utils"
	"cc/be/validreq"

	mpoauth2 "github.com/chanxuehong/wechat/mp/oauth2"
	// "github.com/chanxuehong/wechat/oauth2"
	// "gorm.io/gorm"
)

const defaultPassword = "qMY0SIQoKOtZW6vA"

func genPassword(p string) string {
	password := fmt.Sprintf("%x", md5.Sum([]byte(fmt.Sprint("Jhz4iogIwGqP1a7N", p, "mg1fZbL9s34FiQpuaeNzcBGkIJPA6YHE"))))
	// log.Printf("genPassword: %s -> %s", p, password)
	return password
}

func genCode() string {
	u := &model.User{}
	code := utils.RandStrBySeed(12)
	for u.ExistByCode(code) {
		u = &model.User{}
		code = utils.RandStrBySeed(12)
	}
	return code
}

// 获取用户信息
func (srv *Service) GetUser() (*model.User, error) {
	u := &model.User{}
	err := u.SelectById(global.Uid)
	if err != nil {
		return nil, errors.New("查询用户信息异常")
	}
	return u, nil
}

// 获取用户信息
func (srv *Service) GetUserInfo() (*map[string]string, error) {
	// 优先从 redis 中查询
	cacheInfo := cache.GetUserInfo(global.Uid)
	if cacheInfo != nil {
		return cacheInfo, nil
	}
	// 没有则查询数据库
	user, err := srv.GetUser()
	if err != nil {
		return nil, err
	}
	// 查询配置信息
	if user.Config == "" {
		p := &model.Propext{}
		user.Config = p.GetExtPropByUid(user.Id, model.USER_CONFIG_ID, model.TYPE_USER_CONFIG)
	}
	// 查询用户上传文件大小
	f := &model.Filelog{}
	fsize := f.SumSize(user.Id)
	// 缓存用户信息
	info := &map[string]string{
		"username": user.Username,
		"avatar":   user.Avatar,
		"mobile":   user.Mobile,
		"openid":   user.Openid,
		"config":   user.Config,
		"code":     user.Code,
		"fsize":    strconv.FormatInt(fsize, 10),
	}
	// fmt.Println("info", info)
	cache.SetUserInfo(user.Id, info)
	return info, nil
}

// 登录账号
func (srv *Service) Login(param *validreq.LoginReq) (*model.User, error) {
	u := &model.User{}
	err := u.SelectByMobile(param.Mobile)
	if err != nil {
		log.Printf("查询用户信息出现异常: %s", err)
		return nil, errors.New("查询用户账号异常")
	}
	// 判断账号密码
	if u.Password != genPassword(param.Password) {
		return nil, errors.New("账号密码不正确")
	}
	// 判断账号状态
	if u.Status != 0 {
		return nil, errors.New("账号状态异常")
	}
	return u, nil
}

// 根据微信扫码授权回调绑定原手机账号
func (srv *Service) BindUser(param *validreq.BindUserReq) (*model.User, error) {
	u := &model.User{}
	err := u.SelectByMobile(param.Mobile)
	if err != nil {
		log.Printf("查询用户账号出现异常: %s", err)
		return nil, errors.New("查询用户账号异常")
	}
	// 判断账号密码
	if u.Password != genPassword(param.Password) {
		return nil, errors.New("账号密码不正确")
	}
	// 判断账号状态
	if u.Status != 0 {
		return nil, errors.New("账号状态异常")
	}
	if u.ExistByOpenid(param.Openid) {
		return nil, errors.New("该微信账号已绑定其他账号")
	}
	// 绑定微信 openid
	if u.Username == "未命名" {
		u.Username = param.Username
	}
	if u.Avatar == "/cc/avatar.png" {
		u.Avatar = param.Avatar
	}
	err = u.UpdateUserBind(u.Id, param.Openid, param.Unionid, u.Username, u.Avatar)
	if err != nil {
		log.Printf("更新用户绑定出现异常: %s", err)
		return nil, errors.New("更新用户绑定异常")
	}
	return u, nil
}

// 微信扫码登录回调
func (srv *Service) Callback(param *validreq.CallbackReq) (*model.User, error) {
	return nil, errors.New("暂不支持微信扫码登录回调")
	// // 调用微信接口，根据 code 获取用户信息
	// oauth2Endpoint := mpoauth2.NewEndpoint(global.WechatOpenSetting.AppId, global.WechatOpenSetting.AppSecret)
	// oauth2Client := oauth2.Client{
	// 	Endpoint: oauth2Endpoint,
	// }
	// token, err := oauth2Client.ExchangeToken(param.Code)
	// log.Printf("换取 token [%s]: %+v\r\n", param.Code, token)
	// if err != nil {
	// 	log.Printf("换取token异常: %s", err)
	// 	return nil, errors.New("换取token异常")
	// }
	// if token.OpenId == "" {
	// 	return nil, errors.New("获取OpenID异常")
	// }
	// u := &model.User{}
	// err = u.SelectByOpenId(token.OpenId)
	// if err != nil {
	// 	// 根据 openid 没有找到用户，则注册账号
	// 	if errors.Is(err, gorm.ErrRecordNotFound) {
	// 		// 调用接口获取用户信息
	// 		userinfo, _ := mpoauth2.GetUserInfo(token.AccessToken, token.OpenId, "", nil)
	// 		log.Printf("根据 openid 未查询到用户，注册新账号 %+v\r\n", userinfo)
	// 		u, err = srv.registerByCode(userinfo, token.OpenId, token.UnionId, param.InviteCode)
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		// 初始化用户数据: 默认空间
	// 		ti := time.Now().UnixMilli()
	// 		sid, err := srv.InitSpace(u.Id, ti)
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		ts, err := srv.InitType(u.Id, ti+1)
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		cs, err := srv.InitCard(u.Id, ti+10, sid, ts)
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		_, err = srv.InitView(u.Id, ti+20, sid, (*cs)[1])
	// 		if err != nil {
	// 			return nil, err
	// 		}
	// 		// 刷新更新时间缓存
	// 		cache.SetUserUpdateTime(u.Id, ti+100)
	// 	} else {
	// 		log.Printf("查询用户信息出现异常: %s", err)
	// 		return nil, errors.New("查询用户账号异常")
	// 	}
	// } else {
	// 	// 判断账号状态
	// 	if u.Status != 0 {
	// 		return nil, errors.New("账号状态异常")
	// 	}
	// }
	// return u, nil
}

// 根据微信用户信息注册账号
func (srv *Service) registerByCode(userinfo *mpoauth2.UserInfo, openId, unionId, inviteCode string) (*model.User, error) {
	u := &model.User{}
	// 校验邀请码
	pid := 0
	if inviteCode != "" {
		u1 := &model.User{}
		pid = u1.GetIdByCode(inviteCode)
	}
	dbpsw := genPassword("cardcool" + utils.RandStrBySeed(12))
	code := genCode()
	err := u.InsertWechatUser(openId, unionId, userinfo.Nickname, userinfo.HeadImageURL, dbpsw, code, pid)
	if err != nil {
		return nil, errors.New("创建账号失败")
	}
	return u, nil
}

// 注册账号
func (srv *Service) Register(param *validreq.RegisterReq) (*model.User, error) {
	u := &model.User{}
	// 校验手机号
	if u.ExistByMobile(param.Mobile) {
		return nil, errors.New("该手机号已注册账号")
	}
	// 校验邀请码
	pid := u.GetIdByCode(param.Code)
	useInviteId := 0
	im := &model.Invite{}
	if pid == 0 {
		err := im.GetByCode(param.Code)
		if err == nil {
			t := int(time.Now().Unix())
			if im.Status == -1 {
				return nil, errors.New("该邀请码已失效")
			} else if im.Status == 1 {
				return nil, errors.New("该邀请码已被使用")
			} else if im.StartTime > t {
				return nil, errors.New("该邀请码暂无法使用")
			} else if im.EndTime != 0 && im.EndTime < t {
				return nil, errors.New("该邀请码已过期")
			} else {
				pid = im.CreateUid
				if im.LimitType == 1 {
					useInviteId = im.Id
				}
			}
		}
	} else {
		u = &model.User{}
	}
	if pid == 0 {
		return nil, errors.New("该邀请码无效")
	}
	// 校验验证码 TODO
	psw := genPassword(param.Password)
	dbpsw := genPassword(psw + utils.RandStrBySeed(12))
	code := genCode()
	err := u.InsertUser(param.Mobile, psw, dbpsw, code, pid)
	if err != nil {
		return nil, errors.New("创建账号失败")
	}
	// 核销一次性邀请码
	if useInviteId > 0 {
		im.UpdateInviteStatus()
	}
	return u, nil
}

// 注册账号
func (srv *Service) RegisterByCode(param *validreq.RegcodeReq) (*model.User, error) {
	u := &model.User{}
	// 校验 openid
	if u.ExistByOpenid(param.Openid) {
		return nil, errors.New("已存在账号，请稍后重试")
	}
	// 校验邀请码
	pid := u.GetIdByCode(param.Code)
	useInviteId := 0
	im := &model.Invite{}
	if pid == 0 {
		err := im.GetByCode(param.Code)
		if err == nil {
			t := int(time.Now().Unix())
			if im.Status == -1 {
				return nil, errors.New("该邀请码已失效")
			} else if im.Status == 1 {
				return nil, errors.New("该邀请码已被使用")
			} else if im.StartTime > t {
				return nil, errors.New("该邀请码暂无法使用")
			} else if im.EndTime != 0 && im.EndTime < t {
				return nil, errors.New("该邀请码已过期")
			} else {
				pid = im.CreateUid
				if im.LimitType == 1 {
					useInviteId = im.Id
				}
			}
		}
	} else {
		u = &model.User{}
	}
	if pid == 0 {
		return nil, errors.New("该邀请码无效")
	}
	dbpsw := genPassword("cardcool" + utils.RandStrBySeed(12))
	code := genCode()
	err := u.InsertWechatUser(param.Openid, param.Unionid, param.Username, param.Avatar, dbpsw, code, pid)
	if err != nil {
		return nil, errors.New("创建账号失败")
	}
	// 核销一次性邀请码
	if useInviteId > 0 {
		im.UpdateInviteStatus()
	}
	return u, nil
}

func (srv *Service) AddAccount(mobile string) (*model.User, error) {
	u := &model.User{}
	err := u.SelectByMobile(mobile)
	if err == nil {
		return nil, errors.New("该手机号已注册账号")
	}
	return srv.addUser(mobile, global.Uid)
}

func (srv *Service) addUser(mobile string, pid int) (*model.User, error) {
	u := &model.User{}
	psw := genPassword(defaultPassword)
	dbpsw := genPassword(psw + utils.RandStrBySeed(12))
	code := genCode()
	err := u.InsertUser(mobile, psw, dbpsw, code, pid)
	if err != nil {
		return nil, errors.New("创建账号失败")
	}
	return u, nil
}

// 绑定微信
func (srv *Service) BindWechat(param *validreq.BindWechatReq) (string, error) {
	return "", errors.New("暂不支持微信扫码")
	// // 调用微信接口，根据 code 获取用户信息
	// oauth2Endpoint := mpoauth2.NewEndpoint(global.WechatOpenSetting.AppId, global.WechatOpenSetting.AppSecret)
	// oauth2Client := oauth2.Client{
	// 	Endpoint: oauth2Endpoint,
	// }
	// token, err := oauth2Client.ExchangeToken(param.Code)
	// log.Printf("换取 token [%s]: %+v\r\n", param.Code, token)
	// if err != nil {
	// 	log.Printf("换取token异常: %s", err)
	// 	return "", errors.New("换取token异常")
	// }
	// if token.OpenId == "" {
	// 	return "", errors.New("获取OpenID异常")
	// }
	// u := &model.User{}
	// err = u.SelectByOpenId(token.OpenId)
	// if err != nil {
	// 	// 根据 openid 没有找到用户，则绑定账号
	// 	if errors.Is(err, gorm.ErrRecordNotFound) {
	// 		u2 := &model.User{}
	// 		err := u2.BindWechat(global.Uid, token.OpenId, token.UnionId)
	// 		if err != nil {
	// 			return "", errors.New("更新 openid 失败")
	// 		}
	// 	} else {
	// 		log.Printf("查询用户信息出现异常: %s", err)
	// 		return "", errors.New("查询用户账号异常")
	// 	}
	// } else {
	// 	return "", errors.New("该微信号已绑定其他账号")
	// }
	// // 清除缓存信息
	// cache.ClearUserInfo(global.Uid)
	// return token.OpenId, nil
}

// 修改账号
func (srv *Service) UpdateMobileAccount(param *validreq.UpdateMobileAccountReq) error {
	u := &model.User{}
	err := u.SelectById(global.Uid)
	if err != nil {
		return errors.New("查询用户信息异常")
	}
	password := ""
	// 设置手机号和密码(之前没有)
	if param.EditType == 1 {
		if u.Mobile != "" || u.Password != "" {
			return errors.New("账号已设置，无法直接重置")
		}
		if len(param.NewPassword) < 6 || len(param.NewPassword) > 32 {
			return errors.New("密码需为 6-32 字符")
		}
		password = genPassword(param.NewPassword)
	} else if param.EditType == 2 {
		if u.Mobile == "" || u.Password == "" {
			return errors.New("账号还未设置，无法直接更新")
		}
		if u.Mobile == param.Mobile {
			return nil
		}
		password = u.Password
	} else if param.EditType == 3 {
		if u.Mobile == "" || u.Password == "" {
			return errors.New("账号还未设置，无法直接更新")
		}
		if len(param.NewPassword) < 6 || len(param.NewPassword) > 32 {
			return errors.New("新密码需为 6-32 字符")
		}
		if op := genPassword(param.OldPassword); op != u.Password {
			return errors.New("原密码错误，请重试输入")
		}
		password = genPassword(param.NewPassword)
	} else {
		return errors.New("操作类型异常")
	}
	if param.Mobile != u.Mobile {
		nu := &model.User{}
		err = nu.SelectByMobile(param.Mobile)
		if err == nil {
			return errors.New("手机号已被注册，请使用其他手机号")
		}
	}
	err = u.UpdateMobileAccount(global.Uid, param.Mobile, password)
	if err != nil {
		return errors.New("修改手机账号数据失败")
	}
	// 清除缓存信息
	cache.ClearUserInfo(global.Uid)
	return nil
}

// 修改账号
func (srv *Service) UpdateUserinfo(param *validreq.UpdateUserinfoReq) error {
	u := &model.User{}
	err := u.UpdateUserinfo(global.Uid, param.Username, param.Avatar)
	if err != nil {
		return errors.New("修改账号失败")
	}
	// 清除缓存信息
	cache.ClearUserInfo(global.Uid)
	return nil
}

func (srv *Service) UpdateConfig(config string) error {
	mu := &model.User{}
	mp := &model.Propext{}
	configId := model.USER_CONFIG_ID
	// 查询已经保存在 propext 扩展表的信息
	extIdMap, err := mp.GetExtIdMap(global.Uid, &[]string{configId}, model.TYPE_USER_CONFIG)
	if err != nil {
		return errors.New("查询扩展配置异常")
	}
	var insertPropList []*model.Propext
	var updatePropList []*model.Propext
	// 如果 propext 表中已经存在扩展数据，则直接更新扩展数据
	if _, ok := (*extIdMap)[configId]; ok {
		prop := &model.Propext{
			Uid:    global.Uid,
			Id:     configId,
			TypeId: model.TYPE_USER_CONFIG,
			Props:  config,
		}
		updatePropList = append(updatePropList, prop)
		err = mp.UpdatePropexts(&updatePropList)
	} else if utf8.RuneCountInString(config) > model.LIMIT_2048 {
		// 否则判断当前字段长度，如果超长则添加到 propext 表
		prop := &model.Propext{
			Uid:    global.Uid,
			Id:     configId,
			TypeId: model.TYPE_USER_CONFIG,
			Props:  config,
		}
		insertPropList = append(insertPropList, prop)
		err = mp.CreatePropexts(&insertPropList)
	} else {
		err = mu.UpdateConfig(global.Uid, config)
	}
	if err != nil {
		return errors.New("修改配置失败")
	}
	// 清除缓存信息
	cache.ClearUserInfo(global.Uid)
	return nil
}

// 修改账号
func (srv *Service) Change(param *validreq.ChangeReq) (*model.User, error) {
	u := &model.User{}
	err := u.SelectById(global.Uid)
	if err != nil {
		return nil, errors.New("查询用户信息异常")
	}
	if param.Mobile != "" && param.Mobile != u.Mobile {
		nu := &model.User{}
		err = nu.SelectByMobile(param.Mobile)
		if err == nil {
			return nil, errors.New("新手机号已被注册，请使用其他手机号")
		}
	}
	password := ""
	if newPassword := genPassword(param.Password); param.Password != "" && newPassword != u.Password {
		password = newPassword
	}
	err = u.UpdateUser(param.Mobile, param.Username, password)
	if err != nil {
		return nil, errors.New("修改账号数据失败")
	}
	return u, nil
}

// 七牛云文件上传回调
func (srv *Service) QiniuCallback(param *validreq.QiniuCallbackReq) error {
	if param.Uid == 0 {
		return errors.New("七牛回调uid异常")
	}
	// 保存文件上传记录
	f := &model.Filelog{
		Uid:  param.Uid,
		Hash: param.Hash,
		Size: param.Fsize,
	}
	// 判断记录是否已经存在
	isExist := f.ExistByHash(param.Hash)
	if isExist {
		return nil
	}
	err := f.CreateFilelog()
	if err != nil {
		return errors.New("保存文件上传记录失败")
	}
	// 更新用户信息
	cache.UpdateUserFsize(param.Uid, param.Fsize)
	return nil
}
