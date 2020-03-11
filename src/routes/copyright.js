'use strict';

const express = require('express');
const router = express.Router();

var development = ["Data Tongji"];
development.push({
    name: 'Lucas Damas Corrêa',
    age: '19',
    occupation: 'Developer',
})
development.push({
    name: 'Leonardo Ronne',
    age: '24',
    occupation: 'Product Manager',
})


const route = router.get('/', (req, res, next) => {
    res.status(200).send({
        development
    });
});

module.exports = router;