# mvp-restaurant-booking server

## 项目介绍

某餐厅预约系统前端 SPA。

## 系统架构

### 系统整体介绍

该系统是一个基于 Node.js 和 Express.js 的后端服务，用于处理餐厅预约相关的业务逻辑。系统采用了 GraphQL 作为 API 查询语言，通过 Apollo Server 实现了 GraphQL 的解析和路由。系统还包含了用户认证和授权模块，用于处理用户的注册、登录和权限验证等操作。系统还使用了 Docker 容器化技术，方便了部署和扩展。

### 系统架构图

![系统架构图](../../docs/images/architecture.jpg)

## 组织结构

```
web
├── app -- 应用路由
├── components -- 组件
|   ├── ui -- UI 组件
|   └── server.js -- 应用服务器
├── public -- 静态资源
├── queries -- GraphQL 查询
├── types -- 公用类型定义
├── .env.example -- 环境变量示例
├── Dockerfile -- Docker 镜像构建
├── eslint.config.mjs -- eslint 配置
├── package.json -- 项目配置
└── README.md -- 项目说明
```

## 技术概要

| 技术          | 说明                                | 官网                                     |
| ------------- | ----------------------------------- | ---------------------------------------- |
| Next.js       | React Web 框架                      | https://nextjs.org                       |
| Docker        | 虚拟化应用容器引擎                  | https://www.docker.com                   |
| GraphQL       | 可以精确返回指定字段的 API 查询语言 | https://expressjs.com                    |
| Apollo Client | 开源的，符合规范的 GraphQL 客户端   | https://www.apollographql.com/docs/react |
| Shadcn        | 美观的 UI 组件库                    | https://ui.shadcn.com                    |

## 环境搭建

### 开发环境

| 工具    | 版本号  | 下载                                           |
| ------- | ------- | ---------------------------------------------- |
| Node.js | 20.19.0 | https://nodejs.org/en/download                 |
| MongoDB | 4.4.5   | https://www.mongodb.com/try/download/community |

### 开发配置

1. 拷贝 `.env.example` 文件为 `.env` 文件，并修改其中的配置项。主要修改数据库连接信息。

### 运行步骤

运行开发环境：

```bash
npm install
npm run dev
```

访问 http://localhost:3000 即可查看项目。

## 项目构建

### 构建 Docker 镜像

在当前目录下运行以下命令构建镜像：

```bash
docker build -t mvp-restaurant-booking-web --build-context proj-root=../.. .
```

修改 Dockerfile 中 NEXT_PUBLIC_SERVER_URL、NEXT_PUBLIC_SERVER_GRAPHQL_URL 的值，使其指向后端服务地址。

TODO 添加运行时修改环境变量的方法。

### 本地运行 Docker 容器

在当前目录下运行以下命令启动容器：

```bash
docker run -d -p 3000:3000 --name mvp-restaurant-booking-web mvp-restaurant-booking-web
```

项目依赖后端项目 server，请参考 [Docker Compose 项目构建说明](../../README.md) 运行完整的应用。

Copyright (c) 2022 Huhinka
