# 1. Node.js 환경에서 React 빌드
FROM node:18 AS builder
WORKDIR /app

# 패키지 파일 복사 후 의존성 설치
COPY packages/client/package.json packages/client/package-lock.json ./packages/client/
WORKDIR /app/packages/client
RUN npm install --frozen-lockfile

# 프로젝트 전체 복사 후 React 빌드
COPY packages/client ./packages/client
RUN npm run build

# 2. 실행 환경 세팅 (Nginx 사용)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 빌드된 정적 파일 복사
COPY --from=builder /app/packages/client/dist ./

# Nginx 기본 설정 적용
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 포트 개방
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]