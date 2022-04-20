import createError from 'http-errors';
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index.js";
import configRouter from "./routes/config.js";
import torrentRouter from "./routes/torrent.js";
import categoryRouter from "./routes/category.js";
import streamRouter from "./routes/stream.js";
import fileRouter from "./routes/files.js";
import ConfigStorage from "./routes/classes/ConfigStorage.js";
import SearxFetcher from "./routes/classes/SearxFetcher.js";
import pug from "pug";
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
app.engine('pug', pug.__express)
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

export default app;
