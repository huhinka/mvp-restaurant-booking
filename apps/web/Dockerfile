# 阶段1：安装生产依赖
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./
# 从根目录拷贝 lock 文件
COPY --from=proj-root package-lock.json ./
RUN npm ci --omit-dev --registry https://registry.npmmirror.com


# 阶段2：构建应用
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 后端接口地址
ENV NEXT_PUBLIC_SERVER_URL=http://localhost:3030 \
  NEXT_PUBLIC_SERVER_GRAPHQL_URL=http://localhost:3030/reservation

RUN npm run build


# 阶段3：生产镜像
FROM nginx:1.27.4-alpine

RUN apk add --no-cache gettext

COPY --from=builder /app/out /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]