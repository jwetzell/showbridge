FROM node:18-alpine as build
WORKDIR /build
COPY ./webui/package.json ./webui/package.json
RUN cd webui && npm install
COPY webui webui
RUN cd webui && npm run build
RUN pwd
RUN ls


FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY --from=build /build/dist/webui /app/webui
COPY main.js main.js
COPY schema schema
COPY config config
ENTRYPOINT [ "node", "main.js", "--webui","webui"]
