# cardcool

## 介绍

Slogan：组织碎片信息，构建知识模型！

简介：可离线使用的个人笔记应用，以可自定义结构的卡片作为基石，自由组织各种视图(列表、白板、文档、看板等)，构建多维度的知识模型。可以按规则对卡片进行筛选、分组、排序等操作，还可在白板上自由排列卡片(可视化笔记)！

备注：本人是一个拥有九年研发经验的初级 PHP 程序员，中级 CURD 工程师，高级 Ctrl C/V 架构师，用一年多的业余时间，实现了这么一款笔记软件的基本功能，但 2024 年开年以来，工作任务翻倍，加上行业不景气，面临裁员困境，实在无心继续开发和维护，所以直接开源 =.=!

PS: 本项目所用的 golang 和 react 都是业务自学的，代码水平有限，请谅解！

### 界面样式

[](./imgs/1.png)
[](./imgs/2.png)
[](./imgs/3.png)
[](./imgs/5.png)
[](./imgs/6.png)
[](./imgs/7.png)
[](./imgs/8.png)
[](./imgs/9.png)

## 技术栈

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

- 访问 http://localhost:5173/
- 初始账号：00000000000
- 初始密码：Abc123!
