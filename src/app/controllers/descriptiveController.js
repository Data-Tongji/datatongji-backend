const jwt = require('jsonwebtoken');

const express = require('express');
const Descriptive = require('../model/descriptive');
const User = require('../model/User');
const mailer = require('../../modules/mailer');
const descriptiveService = require('../Services/descriptiveServices')

exports.userSimpleFrequency = async (req, res) => {
    const {
        userId
    } = req.body;
    if (!userId)
        return res.status(400).send({
            error: 'Informe o id do usuário'
        });

    const descriptive = await Descriptive.find({
        userId
    });

    if (descriptive.length === 0)
        return res.status(400).send({
            error: 'Usuário informado não possui dados'
        });

    return res.json(descriptive)
};

exports.simpleFrequency = async (req, res) => {
    const {
        varPesq,
        data,
        subTypeMeasure, //enviar apenas se for ordinal
        amost,
        language
    } = req.body;

    const token = req.headers.authorization;
    var subType = null;
    var amplitude = null;
    var lines = null;
    var classInterval = null;
    var initialElements = null;
    var finalElements = null;
    var countClass = null;
    var mediumPoint = null;

    try {

        const decoded = jwt.decode(token, {
            complete: true
        });

        const userId = decoded.payload["id"];
        const typeVar = await descriptiveService.CheckDataType(data, subTypeMeasure);

        const dataOrder = await descriptiveService.orderby(data, typeVar, subTypeMeasure);
        var dataFrequency = await descriptiveService.simpleFrequency(dataOrder, data, subTypeMeasure); //quando não é contínua
        if (subTypeMeasure === undefined) {
            subType = await descriptiveService.subTypeVar(dataFrequency.length, typeVar);
        } else {
            subType = subTypeMeasure;
        };
        if (subType === 'Continuous') {
            amplitude = await descriptiveService.stepAmplitude(dataOrder);
            lines = parseFloat(Math.sqrt(dataOrder.length).toFixed(2));
            classInterval = await descriptiveService.calculateInterv(amplitude, parseInt(lines), dataOrder);
            initialElements = await descriptiveService.calculateValue1(dataOrder, classInterval);
            finalElements = await descriptiveService.calculateValue2(initialElements, classInterval);
            countClass = await descriptiveService.countByClass(dataOrder, initialElements, finalElements); //quando é contínua
            mediumPoint = await descriptiveService.calculateMediumPoint(subType, initialElements, finalElements);
            dataFrequency = await descriptiveService.mountDataCont(initialElements, finalElements, countClass, mediumPoint)
        }

        const countElements = await descriptiveService.calculateElements(dataOrder);
        const mode = await descriptiveService.calculateMode(dataFrequency, subType, countElements, dataOrder, language);
        // const mean = await descriptiveService.calculatemean(dataOrder);
        const weightedMean = await descriptiveService.calculateWeightedMean(dataFrequency, typeVar, subType);
        const accumulatedFrequency = await descriptiveService.calculateAccumulatedFrequency(dataFrequency);
        const median = await descriptiveService.calculateMedian(dataOrder, classInterval, dataFrequency, subType, accumulatedFrequency);

        const variance = await descriptiveService.calculateVariance(dataFrequency, weightedMean, typeVar, amost, subType);
        const deviation = await descriptiveService.calculateDP(variance, typeVar);
        const coefvar = await descriptiveService.calculateCV(deviation, weightedMean, typeVar);
        const percentile = await descriptiveService.calculatePercentile(dataOrder, subType, dataFrequency, accumulatedFrequency, classInterval);
        const dataDescriptive = await descriptiveService.mountsDescriptive(dataOrder.length, dataFrequency, subType);

        return res.send({
            // amplitude,
            lines,
            classInterval,
            varPesq,
            typeVar,
            subType,
            mode,
            weightedMean,
            median,
            variance,
            deviation,
            coefvar,
            percentile,
            dataDescriptive
        });

    } catch (err) {
        return res.status(400).send({
            error: err.message
        });
    }
};

exports.save = async (req, res) => {
    const {
        name,
        data,
        results,
        language
    } = req.body;
    const token = req.headers.authorization;
    const decoded = jwt.decode(token, {
        complete: true
    });
    const userId = decoded.payload["id"];
    try {
        var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');
        const Atype = language !== 'pt-br' ? `Descriptive Analysis` : `Análise Descritiva`;

        const user = await User.findOne({
            _id: userId
        });
        if (!user)
            return res.status(400).send({
                error: defaultMessage.login.usererror
            });
        const username = user.name;
        const email = user.email;
        const anl = await Descriptive.create({
            userId,
            name,
            data,
            results
        });

        mailer.sendMail({
            to: `${email};datatongji@gmail.com`,
            from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            subject: defaultMessage.analysis.email.sub,
            template: 'auth/saved_analysis',
            context: {
                text1: defaultMessage.analysis.email.body.text1,
                text2: defaultMessage.analysis.email.body.text2,
                text3: defaultMessage.analysis.email.body.text3,
                text4: defaultMessage.analysis.email.body.text4,
                username,
                name,
                Atype
            },
        });


        return res.send({
            anl
        });
    } catch (err) {
        return res.status(400).send({
            error: err.message
        });
    }
};