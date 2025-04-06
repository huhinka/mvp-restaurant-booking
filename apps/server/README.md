# mvp-restaurant-booking server

## 项目介绍

某餐厅预约系统后端。

## 系统架构

### 系统整体介绍

该系统是一个基于 Node.js 和 Express.js 的后端系统，用于处理餐厅预约相关的业务逻辑。系统采用 GraphQL 作为 API 查询语言，通过 Apollo Server 实现了 GraphQL 服务器。系统使用 Mongoose ORM 与 MongoDB 数据库进行交互，实现了用户和预约的增删改查功能。系统还包含了认证鉴权模块，用于保护敏感数据。

## 系统模块

### auth

认证鉴权模块，用于处理用户的注册、登录等操作。该模块包含了用户模型、认证鉴权中间件、认证鉴权路由和用户请求验证器等组件。

### infrastructure

基础设施模块，用于处理系统的底层功能，如数据库连接、错误处理和日志记录等。该模块包含了数据库连接、错误处理器和日志等组件。

### reservation

预约模块，用于处理餐厅预约相关的业务逻辑。该模块包含了预约模型、预约 GraphQL 路由接口、预约 GraphQL 解析器和预约 GraphQL 模式等组件。

## 事件风暴

![事件风暴](../../docs/images/event-storming.jpg)

## 组织结构

```
server
├── migrations -- 数据库迁移脚本
|   ├── 20250404044758-create_user_index.js -- 创建用户索引
├── src -- 源代码
|   ├── auth -- 认证鉴权相关模块
|   |   ├── auth.middleware.js -- 认证鉴权中间件
|   |   ├── auth.route.js -- 认证鉴权路由
|   |   ├── user.model.js -- 用户模型
|   |   └── validators.js -- 用户请求验证器
|   ├── infrastructure -- 基础设施相关模块
|   |   ├── db.js -- 数据库连接
|   |   ├── error-handler.js -- 错误处理器
|   |   └── logger.js -- 日志
|   ├── reservation -- 预约相关模块
|   |   ├── reservation.graphql.js -- 预约 GraphQL 路由接口
|   |   ├── reservation.model.js -- 预约模型
|   |   ├── reservation.resolver.js -- 预约 GraphQL 解析器
|   |   └── reservation.schema.js -- 预约 GraphQL 模式
|   ├── app.js -- 应用
|   └── server.js -- 应用服务器
├── test -- 测试代码
|   ├── auth -- 认证鉴权测试相关模块
|   |   ├── auth.middleware.test.js -- 认证鉴权中间件测试
|   |   └── auth.route.test.js -- 认证鉴权路由测试
|   ├── reservation -- 预约相关模块
|   |   └── reservation.test.js -- 预约 GraphQL 接口测试
|   └── setup.js -- 测试环境设置
├── .env.example -- 环境变量示例
├── Dockerfile -- Docker 镜像构建
├── eslint.config.mjs -- eslint 配置
├── package.json -- 项目配置
└── README.md -- 项目说明
```

## 技术概要

| 技术          | 说明                                | 官网                                             |
| ------------- | ----------------------------------- | ------------------------------------------------ |
| Node.js       | JS 运行时                           | https://nodejs.org/en                            |
| Express.js    | Node.js web 框架                    | https://expressjs.com                            |
| Docker        | 虚拟化应用容器引擎                  | https://www.docker.com                           |
| GraphQL       | 可以精确返回指定字段的 API 查询语言 | https://expressjs.com                            |
| Apollo Server | 开源的，符合规范的 GraphQL 服务器   | https://www.apollographql.com/docs/apollo-server |
| Mongoose ORM  | 优雅的 MongoDB 对象建模             | https://mongoosejs.com                           |
| migrate-mongo | 数据库迁移工具                      | https://github.com/seppevs/migrate-mongo#readme  |
| mocha         | 功能丰富的 JavaScript 测试框架      | https://mochajs.org                              |
| chai          | BDD/TDD 断言库                      | https://www.chaijs.com                           |
| sinon         | 独立的测试 spies、stubs 与 mocks 库 | https://sinonjs.org                              |

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

运行测试与覆盖率报告：

```bash
npm run test
npm run coverage
```

## 项目构建

### 构建 Docker 镜像

在当前目录下运行以下命令构建镜像：

```bash
docker build -t mvp-restaurant-booking-server --build-context proj-root=../.. .
```

项目依赖 MongoDB，请参考 [Docker Compose 项目构建说明](../../README.md) 运行完整的应用。

## 项目关键注意点

### 开发注意点

#### 数据库索引及内置数据创建

在 `src/infrastructure/db.js` 文件中，我们使用了 `migrate-mongo` 工具来创建数据库索引和内置数据。在 `migrate-mongo` 配置文件中，我们定义了数据库迁移脚本的位置和顺序。在 `src/infrastructure/db.js` 文件中，我们使用 `migrate-mongo` 工具来执行数据库迁移脚本，并创建数据库索引和内置数据。

运行下面命令创建迁移脚本：

```bash
npm run migrate:create -- <your-migration-name>
```

在 `migrations` 目录下找到迁移脚本，修改脚本内容，然后在程序启动时会自动执行迁移操作，如果遇到异常程序会直接退出。

#### 统一错误处理

在 `src/infrastructure/error-handler.js` 文件中，我们定义了一个全局的错误处理中间件，用于处理程序中的错误。在中间件中，我们根据错误类型和请求类型，返回不同的错误响应。在 `src/app.js` 文件中，我们将错误处理中间件添加到应用程序中，以确保所有的错误都能被正确处理。

错误分为应用错误和未定义错误。

应用错误属于业务逻辑错误，如用户名或密码错误，预约时间冲突等。应用错误会返回一个包含错误信息的 JSON 响应。
每个模块可以继承 AppError 定义自己模块相关的应用错误。

未定义错误属于程序运行时错误，如数据库连接错误，服务器内部错误等。未定义错误会返回一个包含错误信息的 JSON 响应。
如果错误不在 web 框架内，那它不会被框架捕获，这是一个严重错误，为了快速失败发现问题，程序会直接退出。

以下是应用错误和未定义错误的示例：

| 错误           | HTTP 状态码 | 说明                               |
| -------------- | ----------- | ---------------------------------- |
| AppError       | 400         | 应用错误，如参数校验错误           |
| AuthError      | 401         | 认证错误                           |
| ForbiddenError | 403         | 鉴权错误                           |
| MongoError     | 500         | 程序内部错误，如未处理的数据库错误 |

##### 错误响应格式

应用错误和未定义错误都会返回一个包含错误信息的 JSON 响应。

```json
{
  "message": "错误信息",
  "errors": {
    "field1": "错误信息1",
    "field2": "错误信息2"
  }
}
```

errors 字段是可选的，只有参数校验错误才会出现。

##### 应用错误扩展

随业务复杂度增加，可为每个业务错误分配错误码。

##### GraphQL 错误处理

GraphQL 错误处理遵循 Apollo Server 默认行为，与统一错误处理分开。但是默认情况参数校验错误返回的状态码也是 400，是一致的。

#### 日志记录

在 `src/infrastructure/logger.js` 文件中，我们定义了一个全局的日志记录器，用于记录程序中的日志。在日志记录器中，我们根据日志级别和请求类型，记录不同的日志信息。在 `src/app.js` 文件中，我们将日志记录器添加到应用程序中，以确保所有的日志都能被正确记录。

日志文件会生成到 `logs` 目录下，日志文件名格式为 `combine.log.YYYY-MM-DD`、`error.log.YYYY-MM-DD`。
格式为 JSON，方便日志平台解析。

Copyright (c) 2022 Huhinka
