FROM node:18.16.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENTRYPOINT [ "npm", "start" ]
