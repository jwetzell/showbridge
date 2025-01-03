## Usage

### Source
`npm install`

add and configure a `.env` file if you would like to provide any of the environment variables below.

`npm start`

### Docker
`docker build -t showbridge-cloud .`

`docker run -p 8888:8888 showbridge-cloud`

### NPX
`npx @showbridge/cloud`

## Environment Variables
- `LOG_LEVEL` (optional): log level to pass to pino logger i.e 10, 20, 30, etc.
- `PORT` (optional): the port to run on defuault: 8888
- `ADMIN_UI_USERNAME` (optional): Username for the admin ui
- `ADMIN_UI_PASSWORD` (optional): Password for the admin ui
- `REDIS_URL` (optional): redis client url for socket.io redis-streams adapter if no url is provided then socket.io starts up as a solo instance
- `DISCORD_WEBHOOK_URL`(optional): discord webhook url to send some status messages to
- `DISCORD_EVENTS` (optional): comma separated list of events to send to the configured discord webhook
    - events: `connect`,`disconnect`,`leave`,`join` (defaults to all)


## Info
- connect to admin ui using [socket.io hosted version](https://admin.socket.io) or [host the admin UI yourself](https://github.com/socketio/socket.io-admin-ui/) 
- server ready endpoint at `/ready` return 200 when server is up and running, 503 while starting up for use in things like k8s readinessProbe
