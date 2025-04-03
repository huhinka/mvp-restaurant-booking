FROM node:20-alpine

WORKDIR /app

COPY package.json /app
RUN npm install --registry=https://registry.npmmirror.com

COPY . /app

CMD ["node", "src/server.js"]
