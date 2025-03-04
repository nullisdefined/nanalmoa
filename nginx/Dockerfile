FROM nginx:alpine

WORKDIR /

# Nginx 설정 복사
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# SSL 인증서 & Certbot 연동을 위한 폴더 생성
RUN mkdir -p /var/www/certbot

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
