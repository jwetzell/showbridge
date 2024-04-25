FROM node:20-alpine
ENV NODE_ENV production
RUN apk add --no-cache tini
WORKDIR /app
COPY --chown=node:node package*.json .
RUN npm ci
COPY --chown=node:node main.js main.js
COPY --chown=node:node schema schema
COPY --chown=node:node sample/config/default.json sample/config/default.json
COPY --chown=node:node sample/vars/default.json sample/vars/default.json
USER node
ENTRYPOINT [ "/sbin/tini", "/app/main.js"]
