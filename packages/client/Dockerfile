# 1. Node.js 환경에서 빌드
FROM node:18 AS builder
WORKDIR /app

# package.json과 package-lock.json 복사 후 의존성 설치
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# 프로젝트 전체 복사
COPY . .

# NestJS 빌드
RUN npm run build

# 2. 실행 환경 세팅
FROM node:18
WORKDIR /app

# 실행에 필요한 파일 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 환경 변수 복사
COPY packages/server/.env ./.env

# 실행을 위한 의존성 설정
RUN npm install --only=production

# 포트 설정
EXPOSE 3000

# NestJS 실행
CMD ["node", "dist/main"]