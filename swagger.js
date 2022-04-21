import swaggerAutogen from 'swagger-autogen'

const outputFile = './swagger-output.json'
const endpointsFiles = ['./app.js']

swaggerAutogen()(outputFile, endpointsFiles)
