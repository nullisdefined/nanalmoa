FROM node:18-alpine

WORKDIR /app

# 소스 코드 복사
COPY . .

# NestJS 빌드
RUN npm install && npm run build

# 환경변수 로드
ENV NODE_ENV=production

EXPOSE 3333

# 서버 실행
CMD ["npm", "run", "start:prod"]
