FROM node:20-alpine as build
WORKDIR /build
COPY ./webui/package.json ./webui/package.json
RUN cd webui && npm install
COPY webui webui
RUN cd webui && npm run build


FROM node:20-alpine
ENV NODE_ENV production
RUN apk add --no-cache tini
WORKDIR /app
COPY --chown=node:node package.json .
RUN npm install
COPY --chown=node:node --from=build /build/webui/dist/webui /app/webui/dist/webui
COPY --chown=node:node main.js main.js
COPY --chown=node:node schema schema
COPY --chown=node:node sample/config/default.json sample/config/default.json
COPY --chown=node:node sample/vars/default.json sample/vars/default.json
USER node
ENTRYPOINT [ "/sbin/tini","/app/main.js"]
