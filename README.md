# cardcool

## 介绍

Slogan：组织碎片信息，构建知识模型！

简介：可离线使用的个人笔记应用，以可自定义结构的卡片作为基石，自由组织各种视图，构建多维度的知识模型。可以按规则对卡片进行筛选、分组、排序等操作，还可在白板上自由排列卡片(可视化笔记)！

## 软件架构

### 后端技术栈

- golang
- gin
- gorm

### 数据库

- mysql
- redis
- 浏览器本地存储

### 前端技术栈

- react
- antd
- rxdb
- reactflow
- tiptap

## 安装教程

1. [可选] 使用 docker 启动本地 mysql 和 redis（也可直接使用云端 mysql 和 redis）

```
cd db
docker compose up -d
```

2. 初始化数据库：db/cardcool.sql

3. 修改配置文件：ccbe/config.yaml

- Database：数据库配置
- Redis：Redis 缓存配置
- Qiniu：七牛云图床配置（不配置图片上传将会报错）

4. 启动后端服务：

```
cd ccbe
go mod tidy
go run main.go
```

5. 启动前端服务：

```
cd ccfe
npm install
npm run dev
```

- 初始账号：00000000000
- 初始密码：Abc123!

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request

#### 特技

1.  使用 Readme_XXX.md 来支持不同的语言，例如 Readme_en.md, Readme_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)

# Documents

- go run github.com/99designs/gqlgen generate

## 发布流程

- 合并 dev 到 master，master 不能合并到 dev!!!
- 更新 package.json 和 .env.production 中的版本号
- 前端打包: npm install & npm run build

```
- 后台启动：nohup ./main &
- 查看进程：ps -ef | grep main
- 杀死进程：kill -9 8814
```
