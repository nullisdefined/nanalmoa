# 1. Node.js 환경에서 NestJS 빌드
FROM node:18 AS builder
WORKDIR /app

# 종속성 설치
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# 프로젝트 파일 복사 및 빌드 실행
COPY . .
RUN npm run build

# 2. 런타임용 컨테이너 생성
FROM node:18
WORKDIR /app

# 빌드된 파일만 복사하여 최적화
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 환경 변수 적용
COPY .env ./

# 포트 개방
EXPOSE 3333

# NestJS 서버 실행
CMD ["node", "dist/main"]