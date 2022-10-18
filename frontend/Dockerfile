FROM node:18

WORKDIR /frontend

ADD package.json ./
ADD package-lock.json ./

RUN npm ci -D

EXPOSE 3000
