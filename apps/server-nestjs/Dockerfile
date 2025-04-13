FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
# lock 存在于项目根目录，运行 docker build 时需要指定 --build-arg proj-root=/path/to/project-root
COPY --from=proj-root package-lock.json ./
RUN npm ci --registry https://registry.npmmirror.com \
  && npm cache clean --force

COPY . .

RUN npm run build



FROM node:20-alpine

RUN apk --update add tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone \
  && apk del tzdata

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY --from=builder /app/package*.json .
# 这次仅安装生产依赖
RUN npm ci --omit=dev --registry https://registry.npmmirror.com \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]
