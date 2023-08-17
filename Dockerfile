FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY ./lib/package.json ./lib/package.json
RUN cd lib && npm install
COPY ./webui/package.json ./webui/package.json
RUN cd webui && npm install
COPY webui webui
RUN cd webui && npm run build
COPY main.js main.js
COPY lib lib
COPY schema schema
COPY config config
ENTRYPOINT [ "node", "main.js", "-h","dist/webui"]
