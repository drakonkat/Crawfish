const {exec, spawn} = require("child_process");
const express = require('express');
// const {handleRes} = require("./utility");
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./../swagger-output.json');
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));


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
