const routes = require('express');
const multer = require('multer')

const multerConfig = require('../src/config/multer')

routes.post("/posts", multer(multerConfig).single('file'), (require, response) => {
    Console.log(req.file);
    return response.json({ hello :"Ok true" });
});

module.exports = routes;