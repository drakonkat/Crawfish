const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./../swagger-output.json');

const router = express.Router();
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));


module.exports =  router;
