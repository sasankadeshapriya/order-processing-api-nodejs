const http = require('http');
const app = require('./app');
//const config = require('./config/config'); ---> enable in production mode <----

//add to change time Zone in Server
process.env.TZ = 'Asia/Colombo';

const port = process.env.PORT;

const server = http.createServer(app);

server.listen(port);

