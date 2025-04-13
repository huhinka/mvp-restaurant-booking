# mvp-restaurant-booking

## 项目介绍

某餐厅在线预订系统，可以让顾客方便地预订座位。顾客可以通过提供个人联系方式来完成预订，餐厅员工则可以高效地查看和管理这些预订信息。

## 系统架构

### 系统整体介绍

系统分为前端与后端两个项目，前端使用 React，后端使用 Express.js，数据库使用 MongoDB。

1. server：后端项目，使用 Node.js 框架，提供 RESTful 与 GraphQL 接口，处理业务逻辑，与数据库交互。
2. web: 前端项目，SPA，使用 React 框架，提供用户界面，与后端接口交互。
3. server-nestjs: Nest.js 版本的后端项目，使用 Nest.js 框架，与 server 功能一致，但在类型安全上更优。

- server 后端项目详情请参见 [server 后端项目说明](./apps/server/README.md)。
- server-nestjs 后端项目详情请参见 [server-nestjs 后端项目说明](./apps/server-nestjs/README.md)。
- 前端项目详情请参见 [前端项目说明](./apps/web/README.md)。

## 组织结构

```
project
├── apps -- 项目目录
|   ├── server -- 后端应用
|   ├── server-nestjs -- 后端应用 Nest.js 版本
|   └── web -- 前端应用
├── docs -- 项目文档说明集合
|   ├── images -- 这里面存放用于本文档的引用的图片
|   ├── arch.mmd -- 整体架构图
|   ├── event-storming.puml -- 事件风暴图
|   └── lib-eventstorming.puml -- 事件风暴库
|── .gitignore -- 事件风暴库
|── mvp-restaurant-booking.code-workspace -- vscode 工作区配置文件
|── package-lock.json -- 包依赖锁文件
|── package.json -- 项目配置文件
└── README.md -- 项目说明文档
```

## 技术概要

详情查看具体 app 的 README.md 文件。

前端：

- Next.js SPA
- Shadcn UI
- GraphQL Apollo Client

后端：

- Express.js/Nest.js
- MongoDB
- GraphQL Apollo Server
- JWT
- migrate-mongo
- Mocha/Jest/supertest


工程：

- Docker
- Docker Compose
- Git Hook
- Husky
- Eslint
- Prettier

## 后端代码覆盖率报告

### server

```
=============================== Coverage summary ===============================
Statements   : 98.28% ( 688/700 )
Branches     : 93.25% ( 83/89 )
Functions    : 92.85% ( 26/28 )
Lines        : 98.28% ( 688/700 )
================================================================================
```

2025-04-06 21:20 由 c8 生成。

### server-nestjs

```
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------------|---------|----------|---------|---------|-------------------
All files                  |   62.77 |    84.09 |   45.23 |   63.28 |                   
 src                       |      50 |    68.75 |   46.15 |   51.47 |                   
  app-exception.filter.ts  |    90.9 |    84.61 |   83.33 |    90.9 | 45-52             
  app.exception.ts         |     100 |      100 |     100 |     100 |                   
  app.module.ts            |       0 |        0 |       0 |       0 | 1-50              
  main.ts                  |       0 |        0 |       0 |       0 | 1-21              
 src/auth                  |   86.15 |      100 |      90 |   88.13 |                   
  auth.controller.ts       |     100 |      100 |     100 |     100 |                   
  auth.exception.ts        |   83.33 |      100 |      50 |   83.33 | 12                
  auth.module.ts           |       0 |      100 |     100 |       0 | 1-20              
  auth.service.ts          |     100 |      100 |     100 |     100 |                   
 src/auth/dtos             |     100 |      100 |     100 |     100 |                   
  auth.response.dto.ts     |     100 |      100 |     100 |     100 |                   
  login.dto.ts             |     100 |      100 |     100 |     100 |                   
  register.dto.ts          |     100 |      100 |     100 |     100 |                   
 src/reservation           |   52.73 |    86.66 |    32.6 |   51.85 |                   
  reservation.exception.ts |     100 |      100 |     100 |     100 |                   
  reservation.guard.ts     |   82.35 |      100 |   66.66 |   76.92 | 29-32             
  reservation.module.ts    |       0 |      100 |     100 |       0 | 1-24              
  reservation.resolver.ts  |       0 |      100 |       0 |       0 | 1-123             
  reservation.service.ts   |     100 |    86.66 |     100 |     100 | 119,204           
 src/reservation/dtos      |       0 |      100 |       0 |       0 |                   
  reservation-input.dto.ts |       0 |      100 |       0 |       0 | 1-49              
 src/reservation/entities  |   88.88 |      100 |   16.66 |   87.17 |                   
  reservation.entity.ts    |   88.88 |      100 |   16.66 |   87.17 | 23,49,53,91,94    
 src/user                  |      80 |      100 |   85.71 |   81.81 |                   
  user.module.ts           |       0 |      100 |     100 |       0 | 1-13              
  user.schema.ts           |   93.75 |      100 |      50 |   92.85 | 15                
  user.service.ts          |     100 |      100 |     100 |     100 |                   
---------------------------|---------|----------|---------|---------|-------------------

Test Suites: 6 passed, 6 total
Tests:       53 passed, 53 total
Snapshots:   0 total
Time:        7.097 s
```

2025-04-12 17:34 由 Jest 生成

## 本地运行搭建

### 环境依赖

| 工具   | 版本号 | 下载                                            |
| ------ | ------ | ----------------------------------------------- |
| Docker | 27.4.0 | https://docs.docker.com/get-started/get-docker/ |

### 以 server 为后端，使用 docker compose 快速启动

请确保已经安装 Docker，然后在当前目录执行以下命令启动项目：

```bash
sh quick_start.sh
```

浏览器地址栏输入 http://localhost:3033/login/ 访问网站。

使用以下测试账号进行登录：

| email             | 手机号      | 密码     |
| ----------------- | ----------- | -------- |
| staff@example.com | 13912341234 | 12345678 |
| guest@example.com | 13612341234 | 12345678 |

guest 账号无法访问预约管理页面。

### 以 server-nestjs 为后端，使用 docker compose 快速启动

请确保已经安装 Docker，然后在当前目录执行以下命令启动项目：

```bash
sh quick_start_nestjs.sh
```

浏览器地址栏输入 http://localhost:3033/login/ 访问网站。

注意：server-nestjs 默认没有添加测试账号数据，请先以 server 为后端，使用 docker compose 快速启动项目，添加测试账号数据，再切换到 server-nestjs 启动项目。

注意：两种启动方式占用相同端口，不能一起启动。
注意：两种启动方式使用相同的数据库 volume，web 上看到的数据相同。

## 网页截图

![登录页面](./docs/images/snapshot00.png)
![我的预约](./docs/images/snapshot01.png)
![预约管理](./docs/images/snapshot02.png)

Copyright (c) 2022 Huhinka
