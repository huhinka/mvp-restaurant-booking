FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=proj-root package*.json .
COPY package.json apps/server-nestjs/package.json
# build 依赖 dev 依赖
RUN npm ci --workspace=server-nestjs --ignore-scripts --registry https://registry.npmmirror.com \
  && npm cache clean --force

COPY . apps/server-nestjs

RUN npm run --workspace=server-nestjs build



FROM node:20-alpine

RUN apk --update add tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone \
  && apk del tzdata

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY --from=proj-root package*.json .
COPY package.json apps/server-nestjs/package.json
# 这次仅安装生产依赖
RUN npm ci --omit=dev --workspace=server-nestjs --ignore-scripts --registry https://registry.npmmirror.com \
  # 修复 bcrypt DDL 缺失问题
  && npm rebuild bcrypt \
  && npm cache clean --force

COPY --from=builder /app/apps/server-nestjs/dist apps/server-nestjs/dist

WORKDIR /app/apps/server-nestjs

CMD ["node", "dist/main"]
