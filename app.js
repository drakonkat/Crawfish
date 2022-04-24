const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const configRouter = require('./routes/config');
const torrentRouter = require('./routes/torrent');
const categoryRouter = require('./routes/category');
const streamRouter = require('./routes/stream');
const fileRouter = require('./routes/files');
const ConfigStorage = require("./routes/classes/ConfigStorage");
const SearxFetcher = require("./routes/classes/SearxFetcher");
const app = express();

// view engine setup
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
app.engine('pug', require('pug').__express)
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/config', configRouter);
app.use('/torrent', torrentRouter);
app.use('/stream', streamRouter);
app.use('/category', categoryRouter);
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
