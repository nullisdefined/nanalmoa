# 1. Node.js 환경에서 NestJS 빌드
FROM node:18 AS builder
WORKDIR /app

# 서버 관련 파일만 복사
COPY packages/server/package.json packages/server/package-lock.json ./packages/server/
WORKDIR /app/packages/server

# 종속성 설치
RUN npm install --frozen-lockfile

# 프로젝트 파일 복사 및 빌드 실행
COPY packages/server ./packages/server
RUN npm run build

# 2. 런타임용 컨테이너 생성
FROM node:18
WORKDIR /app/packages/server

# 빌드된 파일만 복사하여 최적화
COPY --from=builder /app/packages/server/dist ./dist
COPY packages/server/package.json packages/server/package-lock.json ./

# 의존성 설치
RUN npm install --only=production

# 환경 변수 적용
COPY packages/server/.env ./

# 포트 개방
EXPOSE 3333

# NestJS 서버 실행
CMD ["node", "dist/main"]