## Usage

### Source
`npm install`

add and configure a `.env` file if you would like to provide any of the environment variables below.

`npm start`

### Docker
`docker build -t showbridge-cloud .`

`docker run -p 8888:8888 showbridge-cloud`

## Environment Variables
- `LOG_LEVEL` (optional): log level to pass to pino logger i.e 10, 20, 30, etc.
- `PORT` (optional): the port to run on defuault: 8888
- `ADMIN_UI_USERNAME` (optional): Username for the admin ui
- `ADMIN_UI_PASSWORD` (optional): Password for the admin ui
- `REDIS_URL` (optional): redis client url for socket.io redis-streams adapter if no url is provided then socket.io starts up as a solo instance
