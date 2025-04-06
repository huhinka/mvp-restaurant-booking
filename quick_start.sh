# 通过 Docker 快速启动项目

cd apps/server
docker build -t mvp-restaurant-booking-server --build-context proj-root=../.. .

cd ../web
docker build -t mvp-restaurant-booking-web --build-context proj-root=../.. .

cd ../..
docker compose up