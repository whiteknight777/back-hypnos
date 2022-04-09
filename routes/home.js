const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerConfig = require('../config/swagger');
const openApiSpec = swaggerJsdoc(swaggerConfig);
const router = express.Router();
const AccessLink = `${process.env.HOST}:${process.env.PORT}`

// Swagger options
const swaggerOptions = {
    explorer: false,
    swagger: "3.0",
    servers: [
      { url: AccessLink },
    ],
};

// HOME 
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiSpec, swaggerOptions))

module.exports = router;