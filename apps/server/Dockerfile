FROM node:20-alpine

RUN apk --update add tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone \
  && apk del tzdata

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY --from=proj-root package*.json .
COPY package.json apps/server/package.json
RUN npm ci --omit-dev --ignore-scripts --workspace=server --registry https://registry.npmmirror.com \
  # 修复 bcrypt DDL 缺失问题
  && npm rebuild bcrypt \
  && npm cache clean --force

COPY . apps/server/

WORKDIR /app/apps/server

CMD ["node", "src/server.js"]
