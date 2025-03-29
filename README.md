# mvp-restaurant-booking

## 项目介绍

Someone restaurant want to create an online table reservation system to allow guests to reserve tables. Guests will make a reservation with their personal contact info, and the restaurant employees will browse and manage those reservations.

## 系统架构

![系统架构图](./docs/images/arch.jpg)

### 系统整体介绍

系统分为前端与后端两个项目，前端使用 React 框架，后端使用 Node.js 框架，数据库使用 MongoDB。

1. server：后端项目，使用 Node.js 框架，提供 RESTful 与 GraphQL 接口，处理业务逻辑，与数据库交互。
2. web: 前端项目，SPA，使用 React 框架，提供用户界面，与后端接口交互。

## 系统模块

### server

![](./docs/images/event-storming.jpg)


### 模块 B

![](./docs/image/module-xxx.png)

在这里描述模块 B 设计说明

1. 模块 B 的设计思路，作用，说明，
2. 模块 B 与其它模块之间的关系

### ...

## 组织结构

```lua
project
├── docs -- 项目文档说明集合
|   ├── image -- 这里面存放用于本文档的引用的图片
|   ├── pdm -- 数据库设计文件及相关说明
|   ├── design -- 这里面存放 visio, x-mind 等设计过程文档
|   ├── reference -- 这里面存放 其它设计说明文档
|   ├── resource -- 这里面存放 该项目相关的资源文件
|   ├── custom -- 自定义文档存放，自定义名称
|   └── ... -- ...
├── packages -- 模块1，简要说明
|   ├── server -- 子模块1，简要说明
|   ├── web -- ...
```

## 技术概要

| 技术       | 说明             | 官网                  |
| ---------- | ---------------- | --------------------- |
| Node.js    | JS 运行时        | https://nodejs.org/en |
| Express.js | Node.js web 框架 | https://expressjs.com |

## 环境搭建

### 开发环境

| 工具    | 版本号  | 下载                           |
| ------- | ------- | ------------------------------ |
| Node.js | 20.12.1 | https://nodejs.org/en/download |

### 开发配置

1. ...
2. ...

### 运行步骤

运行步骤说明

## 开发环境地址

- 项目地址：
  1. api： http://192.168.1.242:port
  2. web: http://192.168.1.242:port
- 相关服务地址： http://192.168.1.242:9039

## 项目关键注意点

### 开发注意点

1. ....
2. ....

### 遗留问题

1. ....
2. ....

## 外部项目参考

- 在这里描述用于借鉴的项目

Copyright (c) 2022 Huhinka
