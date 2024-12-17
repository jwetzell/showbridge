FROM node:22.12.0-slim
ENV NODE_ENV production
RUN apt-get update && apt-get install -y tini libasound2
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY main.js main.js
COPY schema schema
COPY sample/config/default.json sample/config/default.json
COPY sample/config/default.json /data/config.json
COPY sample/vars/default.json sample/vars/default.json
COPY sample/vars/default.json /data/vars.json
ENTRYPOINT [ "/usr/bin/tini", "--", "/app/main.js"]
CMD [ "--disable-protocol", "midi", "-c", "/data/config.json", "-v", "/data/vars.json"]
