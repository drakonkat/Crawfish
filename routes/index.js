const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./../swagger-output.json');
const moment = require("moment/moment");

const router = express.Router();
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));
router.get('/health-check', async (req, res, next) => {
    /*
        #swagger.tags = ['Index']
        #swagger.summary = "Return true if the server is operative"
        #swagger.responses[200] = {
                description: "The status of the server",
                schema: true
            }
    */
    res.status(200).json(true)
});


module.exports = router;
