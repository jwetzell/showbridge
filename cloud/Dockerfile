FROM node:20-alpine
ENV NODE_ENV production
RUN apk add --no-cache tini
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
USER node
ENTRYPOINT [ "/sbin/tini", "/app/src/main.js" ]