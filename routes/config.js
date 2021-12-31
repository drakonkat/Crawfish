const {exec, spawn} = require("child_process");
const express = require('express');
const ConfigStorage = require("./classes/ConfigStorage");
// const {handleRes} = require("./utility");
const router = express.Router();



router.post('/edit', async (req, res, next) => {
    /*
        #swagger.tags = ['Config']
        #swagger.summary = "Modify the configuration about the torrent client"
        #swagger.parameters['config'] = {
            in: 'body',
            description: 'Configuration of the client',
            schema: {
                $path: './'
            }
         }
         #swagger.responses[200] = {
        description: "Set the path",
        schema: true
        }
    */
    console.log('Body:', req.body);
    console.log("CHECK DATA: ", req.app.locals.storage.getDownload())
    req.app.locals.storage.setDownload(req.body.path);
    console.log("CHECK DATA: ", req.app.locals.storage.getDownload())
    res.status(200).json(true)
});

module.exports = router;
