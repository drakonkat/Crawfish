const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const timeout = require('connect-timeout')
const rfs = require("rotating-file-stream");
const compression = require('compression');
const indexRouter = require('./routes/index');
const configRouter = require('./routes/config');
const torrentRouter = require('./routes/torrent');
const categoryRouter = require('./routes/category');
const indexerRouter = require('./routes/indexer');
const streamRouter = require('./routes/stream');
const fileRouter = require('./routes/files');
const ConfigStorage = require("./routes/classes/ConfigStorage");
const SearxFetcher = require("./routes/classes/SearxFetcher");
const app = express();

// Setup storage part
var storage;
if (!storage) {
    storage = new ConfigStorage();
}
app.locals.storage = storage;
var searx;
if (!searx) {
    searx = new SearxFetcher();
}
app.locals.searx = searx;

// Api configuration log and similiar
const pad = num => (num > 9 ? "" : "0") + num;
const generator = (time, index) => {
    if (!time) return "request.log";

    let month = time.getFullYear() + "" + pad(time.getMonth() + 1);
    let day = pad(time.getDate());

    return `${month}/${day}-file-${index}.log`;
};
const stream = rfs.createStream(generator, {
    size: "20M", // rotate every 10 MegaBytes written
    compress: "gzip", // compress rotated files
    maxFiles: 10
});
logger.token('bearer', function (req, res) {
    return req.headers.authorization || "No auth";
})
logger.token('body', function (req, res) {
    return JSON.stringify(req.body);
})
app.use(logger('[:date[clf]] :response-time ms :remote-addr ":method :url" :status ":user-agent" :bearer', {
    stream
}));
app.use(logger('[:date[clf]] :response-time ms :remote-addr ":method :url" :status ":user-agent" :bearer'));
app.use(compression())
app.use(logger('dev'));
app.use(cors());
app.use(timeout('10s'))


app.engine('pug', require('pug').__express)
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/config', configRouter);
app.use('/torrent', torrentRouter);
app.use('/stream', streamRouter);
app.use('/category', categoryRouter);
app.use('/indexer', indexerRouter);
app.use('/file', fileRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json('error');
});

module.exports = app;
