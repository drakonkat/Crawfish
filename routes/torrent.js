const {exec, spawn} = require("child_process");
var express = require('express');
// const {handleRes} = require("./utility");
var router = express.Router();

router.post('/add', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/check-status', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/remove', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/list', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/server-status', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

module.exports = router;
