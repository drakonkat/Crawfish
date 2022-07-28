var app = require('./app');
var http = require('http');
var open = require('open');
var schedule = require('node-schedule');

function start(port = 3000) {

    process.env.NODE_ENV = "development"


    process.on('SIGINT', function () {
        schedule.gracefulShutdown()
            .then(() => process.exit(0))
    })

    process.on('uncaughtException', function (err) {
        try {
            console.error('*** uncaughtException:', err);
            if (process.send) {
                // Say my process is ready
                process.send({message: "ERROR: " + err.message, data: err});
            }
        } catch (err) {

        }
    });
    /**
     * Get port from environment and store in Express.
     */
    port = normalizePort(port || process.env.PORT || '3000');
    if (process.send) {
        // Say my process is ready
        process.send({message: "PORT", data: port});
    }
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
        console.error("Error in main process", error.code)
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
                console.error(bind + ' is already in use. Change to: ' + (port + 1));
                if (port < 65535) {
                    start(port + 1)
                }
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


}

module.exports = start;
