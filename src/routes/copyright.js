'use strict';

const express = require('express');
const router = express.Router();

var development = ["Data Tongji"];
development.push({
    nome: 'Lucas Damas Corrêa',
    idade: '19',
    profissao: 'Developer',
})
development.push({
    nome: 'Leonardo Ronne',
    idade: '24',
    profissao: 'Analyst and Developer',
})


const route = router.get('/', (req, res, next) => {
    res.status(200).send({
        development
    });
});

module.exports = router;