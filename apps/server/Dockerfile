FROM node:20-alpine

RUN apk --update add tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone \
  && apk del tzdata

# Defaults to production, docker-compose overrides this to development on build and run.
WORKDIR /app
# TODO 解决 logs/ 权限问题
# RUN chown node:node ./
# USER node

# Defaults to production, docker-compose overrides this to development on build and run.
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install dependencies first, as they change less often than code.
COPY package.json ./
COPY --from=proj-root package-lock.json ./
RUN npm ci --production --registry https://registry.npmmirror.com \
  && npm cache clean --force

COPY ./migrations ./migrations
COPY ./migrate-mongo-config.js ./migrate-mongo-config.js
COPY ./src ./src

COPY . /app

CMD ["node", "src/server.js"]
