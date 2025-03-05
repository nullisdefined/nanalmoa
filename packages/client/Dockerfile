# 1. Node.js 환경에서 빌드 (Yarn 사용)
FROM node:18 AS builder
WORKDIR /app

# 종속성 설치
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 프로젝트 파일 복사 및 빌드 실행
COPY . .
RUN yarn workspace client build

# 2. Nginx를 사용하여 정적 파일 제공
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 빌드된 정적 파일을 Nginx 컨테이너로 복사
COPY --from=builder /app/dist ./

# Nginx 설정 복사
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 포트 설정
EXPOSE 80

# 컨테이너 실행 시 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]