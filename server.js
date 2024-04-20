const http = require('http');
const app = require('./app');
//const config = require('./config/config'); ---> enable in production mode <----

const port = process.env.PORT;

const server = http.createServer(app);

server.listen(port);

