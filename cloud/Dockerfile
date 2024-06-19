FROM node:20.14.0-slim
RUN apt-get update && apt-get install tini
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./
ENTRYPOINT [ "/usr/bin/tini", "/app/main.js" ]