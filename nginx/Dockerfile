FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package.json yarn.lock ./
COPY packages/client/package.json ./client/

# 의존성 설치
RUN yarn install && yarn build:client

# 소스 파일 복사
COPY ./packages/client ./client
COPY ./packages/client/.env ./client/env

# 빌드
RUN yarn build:client --frozen-lockfile

# nginx 웹서버
FROM nginx:alphine

WORKDIR /

# 빌드 파일 복사
COPY --from=builder /app/client/dist ./usr/share/nginx/html
COPY --from=builder /app/client/.env ./usr/share/nginx/html/.env

CMD [ "nginx", "-g", "daemon off" ]