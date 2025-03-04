# 1단계: 빌드 (Node.js 사용)
FROM node:18-alpine AS build

WORKDIR /app

# 의존성 파일 복사
COPY package.json yarn.lock ./
COPY packages/client/package.json ./client/

# 의존성 설치
RUN yarn global add typescript
RUN yarn install --frozen-lockfile

# 소스 파일 복사 후 빌드
COPY ./packages/client ./client

# client 디렉토리로 이동 후 빌드 실행
WORKDIR /app/client
RUN yarn build

# 2단계: Nginx 컨테이너에서 정적 파일 제공
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# 빌드된 파일을 Nginx 정적 파일 경로로 복사
COPY --from=build /app/client/dist .

# Nginx 설정 복사
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
