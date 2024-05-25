FROM node:20.12.2-slim
ENV NODE_ENV production
RUN apt-get update && apt-get install -y tini libasound2
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY main.js main.js
COPY schema schema
COPY sample/config/default.json sample/config/default.json
COPY sample/vars/default.json sample/vars/default.json
ENTRYPOINT [ "/usr/bin/tini", "--", "/app/main.js"]
CMD [ "--disable-protocol", "midi"]
