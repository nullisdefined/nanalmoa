# 1. Node.js 환경에서 빌드
FROM node:18 AS builder
WORKDIR /app

# 루트 package.json과 yarn.lock을 복사하고 설치
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 프로젝트 전체 복사 (workspaces 포함)
COPY . .

# client 패키지만 빌드
RUN yarn workspace client build

# 2. Nginx를 사용하여 정적 파일 제공
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Vite의 빌드 결과물을 올바른 경로로 복사
COPY --from=builder /app/packages/client/dist ./

# Nginx 설정 복사
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 포트 설정
EXPOSE 80

# 컨테이너 실행 시 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]