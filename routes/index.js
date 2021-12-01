const {exec, spawn} = require("child_process");
var express = require('express');
// const {handleRes} = require("./utility");
var router = express.Router();


var data = null;
var history = [];
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/start-command', async (req, res, next) => {
    // handleRes(res);

    exec("webtorrent --help", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            // res.status(400).json(error.message)
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            // res.status(400).json(stderr)
            return;
        }
        console.log(`stdout: ${stdout}`);
        data = stdout;
        history.push(stdout)
    });
    res.status(200).json({name: 'Hello World!', description: 'Description body!'})
});

router.get('/get-data', async (req, res, next) => {
    res.status(200).json({
        latestResponde: data,
        history
    })
});


module.exports = router;
