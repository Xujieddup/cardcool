package errcode

var (
	Success = NewError(0, "success")

	// 服务端错误码
	ServerError     = NewError(10000000, "服务内部错误")
	NotFound        = NewError(10000002, "找不到")
	TooManyRequests = NewError(10000007, "请求过多")

	// 通用错误码
	InvalidParams   = NewError(1000, "参数异常")
	TokenParamEmpty = NewError(1001, "Token 参数为空")
	TokenExpired    = NewError(1002, "Token 已过期")
	TokenParseError = NewError(1003, "Token 解析异常")

	// 业务异常错误码
	// 用户 & Token
	LoginError               = NewError(2001, "账号登陆异常")
	GenerateTokenError       = NewError(2002, "生成 token 异常")
	UpdateTokenStatusError   = NewError(2003, "更新 token 使用状态异常")
	LoginCodeInfoError       = NewError(2004, "登陆码信息异常")
	AdminAuthError           = NewError(2005, "非超级管理员，禁止进行该操作")
	RegisterError            = NewError(2006, "账号注册异常")
	GenerateCodeError        = NewError(2007, "生成邀请码异常")
	WechatCallbackUserError  = NewError(2008, "微信回调用户登录异常")
	BindWechatError          = NewError(2009, "绑定微信异常")
	UpdateMobileAccountError = NewError(2010, "更新手机账号异常")
	QueryUserError           = NewError(2020, "查询用户信息异常")
	// 视图分享
	QueryShareError        = NewError(2030, "查询视图分享信息异常")
	CreateShareError       = NewError(2031, "创建视图分享失败")
	UpdateShareStatusError = NewError(2032, "更新视图分享状态失败")
	QueryShareNullError    = NewError(2033, "未查询分享信息")
	ShareStatusError       = NewError(2034, "当前分享已取消")
	// 上传文件
	UploadTokenError             = NewError(2091, "获取文件上传凭证异常")
	QiniuCallbackAuthVerifyError = NewError(2092, "七牛文件上传回调auth校验异常")
	QiniuCallbackAuthError       = NewError(2093, "七牛文件上传回调auth校验失败")
	QiniuCallbackError           = NewError(2094, "七牛文件上传回调异常")
	// 节点类型
	NodeTypeListError = NewError(2101, "查询节点类型列表异常")
	// 节点分组
	NodeCateListError = NewError(2201, "查询节点分组列表异常")
	// 信息项
	CreateInfoError = NewError(3003, "创建信息异常")
)
