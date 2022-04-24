#!/usr/bin/env node

/**
 * Module dependencies.
 */

const  app = require('../app.js');
const http = require('http');
const open = require('open');
const log = require('electron-log');
log.transports.file.resolvePath = () => "main.log";
console.log = log.log;
log.catchErrors({
    showDialog:true,
    onError: (error, versions, submitIssue) =>{
        log.error(error)
    }
});
log.info("Main life")

process.env.NODE_ENV = "development"
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, async () => {
    console.log('Express server stared! Mode: ', process.env.NODE_ENV);
    if (process.env.NODE_ENV == "production") {
        await open("http://localhost:" + port + "/build/index.html"); // opens `web/index.html` page
    }
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
}
