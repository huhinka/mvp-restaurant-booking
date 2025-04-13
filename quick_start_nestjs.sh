# 通过 Docker 快速启动项目

cd apps/server-nestjs
docker build -t mvp-restaurant-booking-server-nestjs --build-context proj-root=../.. .

cd ../web
docker build -t mvp-restaurant-booking-web --build-context proj-root=../.. .

cd ../..
docker compose -f docker-compose-nestjs.yml up