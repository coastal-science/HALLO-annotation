FROM nginxinc/nginx-unprivileged:1-alpine

COPY default.conf /etc/nginx/conf.d/default.conf

USER root

RUN mkdir -p /media
RUN chmod 755 /media
RUN mkdir -p /staticfiles
RUN chmod 755 /staticfiles

USER nginx
