FROM node:20.12.2-alpine
ENV NODE_ENV production
RUN apk add --no-cache tini
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY main.js main.js
COPY schema schema
COPY sample/config/default.json sample/config/default.json
COPY sample/vars/default.json sample/vars/default.json
ENTRYPOINT [ "/sbin/tini", "/app/main.js"]
