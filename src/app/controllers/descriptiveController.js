const jwt = require('jsonwebtoken');

const Descriptive = require('../model/descriptive');
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
        amost
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
        if (!varPesq || data.length === 0)
            return res.status(400).send({
                error: 'Existem campos vazios'
            });

        const decoded = jwt.decode(token, {
            complete: true
        });

        const userId = decoded.payload["id"];
        const typeVar = descriptiveService.CheckDataType(data, subTypeMeasure);

        const dataOrder = descriptiveService.orderby(data, typeVar, subTypeMeasure);
        var dataFrequency = descriptiveService.simpleFrequency(dataOrder, data, subTypeMeasure); //quando não é contínua
        if (subTypeMeasure === undefined) {
            subType = descriptiveService.subTypeVar(dataFrequency.length, typeVar);
        } else {
            subType = subTypeMeasure;
        };
        if (subType === 'Contínua') {
            amplitude = descriptiveService.stepAmplitude(dataOrder);
            lines = parseFloat(Math.sqrt(dataOrder.length).toFixed(2));
            classInterval = descriptiveService.calculateInterv(amplitude, parseInt(lines), dataOrder);
            initialElements = descriptiveService.calculateValue1(dataOrder, classInterval);
            finalElements = descriptiveService.calculateValue2(initialElements, classInterval);
            countClass = descriptiveService.countByClass(dataOrder, initialElements, finalElements); //quando é contínua
            mediumPoint = descriptiveService.calculateMediumPoint(subType, initialElements, finalElements);
            dataFrequency = descriptiveService.mountDataCont(initialElements, finalElements, countClass, mediumPoint)
        }

        const countElements = descriptiveService.calculateElements(dataOrder);
        const mode = descriptiveService.calculateMode(dataFrequency, subType, countElements, dataOrder);
        // const mean = descriptiveService.calculatemean(dataOrder);
        const weightedMean = descriptiveService.calculateWeightedMean(dataFrequency, typeVar, subType);
        const accumulatedFrequency = descriptiveService.calculateAccumulatedFrequency(dataFrequency);
        const median = descriptiveService.calculateMedian(dataOrder, classInterval, dataFrequency, subType, accumulatedFrequency);

        const variance = descriptiveService.calculateVariance(dataFrequency, weightedMean, typeVar, amost, subType);
        const deviation = descriptiveService.calculateDP(variance, typeVar);
        const coefvar = descriptiveService.calculateCV(deviation, weightedMean, typeVar);
        const percentile = descriptiveService.calculatePercentile(dataOrder, subType, dataFrequency, accumulatedFrequency, classInterval);
        const dataDescriptive = descriptiveService.mountsDescriptive(dataOrder.length, dataFrequency, subType);

        return res.send({
            amplitude,
            lines,
            classInterval,
            // initialElements,
            // finalElements,
            // countClass,
            varPesq,
            typeVar,
            subType,
            // mediumPoint,
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
            error: err + ''
        });
    }
};
