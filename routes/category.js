const {exec, spawn} = require("child_process");
const express = require('express');
const ConfigStorage = require("./classes/ConfigStorage");
const router = express.Router();


router.get('/', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Get all the category that identify the default path for that category"
        #swagger.responses[200] = {
        description: "List of the available category",
        schema: [{
            $name: name
            $path: path
        }]

        }
        }
    */
    res.status(200).json(true)
});
router.post('/', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Create a category"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'Create a category',
            schema: {
                $name: 'telefilm'
                $path: './Downloads/telefilm'
            }
         }
        #swagger.responses[200] = {
        description: "If the operation gone fine",
        schema: true
        }
    */
    res.status(200).json(true)
});

module.exports = router;
