const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Hypnos - REST API',
        version: 'V1.0.0',
        description: 'An Express API Library'
      },
    },
    apis: ['./routes/V1/*'], // files containing annotations as above
};

module.exports = swaggerOptions