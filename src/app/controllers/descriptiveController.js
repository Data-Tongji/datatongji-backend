const express = require('express');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/auth');

const Descriptive = require('../model/descriptive');

const router = express.Router();

router.use(authMiddleware);

function CheckDataType(data, subTypeMeasure) {
    if (subTypeMeasure !== 'Ordinal') {
        var vetor = data
        let answer = 'Quantitativo'
        for (let i = 0; i < vetor.length; i++) {
            if (isNaN(vetor[i])) {
                answer = 'Qualitativo'
            };
        }
        return answer
    }
    else { return 'Qualitativo' }
};

function compareNumbers(a, b) {
    return a - b;
};

function TransformArrayOrd(dataOrder) {
    let arr = [];
    for (let i = 0; i < dataOrder.length; i++) {
        for (let j = 0; j < dataOrder[i].frequency; j++) {
            arr.push(dataOrder[i].value);
        }
    }
    return arr;
    // console.log(arr);
}

function simpleFrequency(NewData, data, subTypeMeasure) {
    if (subTypeMeasure !== 'Ordinal') {
        let result = {};
        let resultUnic = [];
        let DataFrequency = []
        let count = 0;
        NewData.forEach(function (v, i) {

            if (!result[v]) {
                result[v] = [i];
                count++;
                resultUnic.push(v);
            } else {
                result[v].push(i);
            }
        })
        for (var i = 0; i < resultUnic.length; i++) {
            DataFrequency.push({
                "value": resultUnic[i].toString(),
                "frequency": result[resultUnic[i]].length
            })
        }
        return DataFrequency
    } else {
        return data;
    }
};


function mountDataCont(initialElements, finalElements, frequency, mediumPoint) {
    let res = [];

    for (let i = 0; i < initialElements.length; i++) {
        res.push({
            value: initialElements[i],
            value2: finalElements[i],
            frequency: frequency[i],
            mediumPoint: mediumPoint[i]
        })
    }
    return res;
}

function countByClass(arr, initialElements, finalElements) {
    let res = [];
    for (let i = 0; i < initialElements.length; i++) {
        res.push(0);
    }
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < initialElements.length; j++) {
            if (arr[i] >= initialElements[j] && arr[i] < finalElements[j]) {
                res[j]++;
            }
        }
    }
    return res;
}

function Accumulated(freqAcum, freqAcumLength) {
    let porAcum = 0;
    porAcum = (100 * (freqAcum)) / (freqAcumLength);
    porAcum = porAcum.toFixed(2);
    return porAcum;
};

function simplePercentage(quant, dataLenght) {
    let simplePercentage = 0;
    simplePercentage = (100 * (quant)) / (dataLenght);
    simplePercentage = simplePercentage.toFixed(2);

    return simplePercentage;
};

function compareNumbers(a, b) {
    return a - b;
}

function orderby(data, answer, subTypeMeasure) {
    let = finalArray = [];
    let = numerical = [];
    let = alphabetical = [];

    if (subTypeMeasure !== 'Ordinal') {
        for (let i = 0; i < data.length; i++) {
            if (!isNaN(data[i])) {
                numerical.push(parseFloat(data[i]));
            } else {
                alphabetical.push(data[i]);
            }
        }
        numerical.sort(compareNumbers);
        alphabetical.sort(compareNumbers)
        for (let i = 0; i < numerical.length; i++) {
            finalArray.push(numerical[i]);
        }
        for (let i = 0; i < alphabetical.length; i++) {
            finalArray.push(alphabetical[i]);
        }
        return finalArray;
    }
    else {
        return TransformArrayOrd(data);
    }
};

function calculateWeightedMean(frequencyValue, type, subType) {
    let soma = 0;
    let n = frequencyValue.reduce((total, frequencyValue) => total + frequencyValue.frequency, 0);

    if (type === 'Qualitativo') {
        return "Não existe"
    } else {
        if (subType !== 'Contínua') {
            for (let i = 0; i < frequencyValue.length; i++) {
                soma = soma + (parseFloat(frequencyValue[i].frequency) * parseFloat(frequencyValue[i].value));
            }
            return (soma / n);
        }
        else {
            for (let i = 0; i < frequencyValue.length; i++) {
                soma = soma + (parseFloat(frequencyValue[i].frequency) * parseFloat(frequencyValue[i].mediumPoint));
            }
            return (soma / n);
        }
    }
}

function calculateVariance(frequencyValue, mean, type, amost, subType) {
    let soma = 0;
    let n = frequencyValue.reduce((total, frequencyValue) => total + frequencyValue.frequency, 0);

    if (type === 'Qualitativo') {
        return "Não existe"
    }
    if (subType !== 'Contínua') {
        for (let i = 0; i < frequencyValue.length; i++) {
            soma = soma + ((Math.pow((parseFloat(frequencyValue[i].value) - mean), 2)) * parseFloat(frequencyValue[i].frequency));
        }
        if (amost === 'População') {
            return parseFloat((soma / n).toFixed(4));
        } else {
            return parseFloat((soma / (n - 1)).toFixed(4));
        }
    } else if (subType === 'Contínua') {
        for (let i = 0; i < frequencyValue.length; i++) {
            soma = soma + ((Math.pow((parseFloat(frequencyValue[i].mediumPoint) - mean), 2)) * parseFloat(frequencyValue[i].frequency));
        }
        if (amost === 'População') {
            return parseFloat((soma / n).toFixed(4));
        } else {
            return parseFloat((soma / (n - 1)).toFixed(4));
        }
    }
}

function calculateDP(variance, type) {
    if (type === 'Qualitativo') {
        return 'Não existe'
    }
    return parseFloat((Math.sqrt(variance)).toFixed(4));
}

function calculateCV(dp, mp, type) {
    if (type === 'Qualitativo') {
        return 'Não existe'
    }
    return ((dp / mp) * 100).toFixed(3) + '%';
}

function calculatemean(data) {
    let soma = 0;

    for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i])) {
            return "Não existe"
        }
        soma = soma + parseFloat(data[i]);
    }
    return (soma / data.length)
}

function calculateAccumulatedFrequency(dataFrequency) {
    let fac = [];
    for (let i = 0; i < dataFrequency.length; i++) {
        if (i === 0) {
            fac.push(dataFrequency[i].frequency);
        } else {
            fac.push(dataFrequency[i].frequency + fac[i - 1]);
        }
    }
    return fac;
}

function calculateMedian(arr, interval, dataFrequency, subType, fac) {
    let n = arr.length;
    if (subType !== 'Contínua') {

        if (n % 2 === 0) {
            let a = arr[(n / 2) - 1];
            let b = arr[((n / 2) + 1) - 1];

            if (!isNaN(a) && !isNaN(b)) {
                if (parseFloat(a) === parseFloat(b)) {
                    return (n / 2) + 'º e ' + ((n / 2) + 1) + 'º Posição: ' + a;
                } else {
                    return (n / 2) + 'º Posição: ' + a + ' | ' + ((n / 2) + 1) + 'º Posição: ' + b;
                }
            } else if (a === b) {
                return (n / 2) + 'º e ' + ((n / 2) + 1) + 'º Posição: ' + a;
            } else {
                return (n / 2) + 'º Posição: ' + a + ' | ' + ((n / 2) + 1) + 'º Posição: ' + b;
            }
        } else {
            return (parseInt(n / 2) + 1) + 'º Posição: ' + arr[(parseInt(n / 2) + 1)];
        }
    }
    else if (subType === 'Contínua') {
        let medpos = arr.length / 2;
        let Li = 0;
        let Fai = 0;
        let Fm = 0;
        for (let i = 0; i < fac.length; i++) {
            if (fac[i] > medpos) {
                Li = dataFrequency[i].value;
                Fm = dataFrequency[i].frequency;
                if (i === 0) {
                    Fai = fac[i];
                }
                else { Fai = fac[i - 1]; }
                break;
            }
        }
        let median = Li + ((medpos - Fai) / Fm) * (interval[0])
        return parseFloat(median.toFixed(4));
    }
}
function calculateMediumPoint(subType, initialElements, finalElements) {
    let mediumPoint = [];
    if (subType === 'Contínua') {
        for (let i = 0; i < initialElements.length; i++) {

            mediumPoint.push((initialElements[i] + finalElements[i]) / 2);
        }
    }
    return mediumPoint;
}

function calculateElements(dataOrder) {
    elements = [];
    contVet = [];
    elements.push(dataOrder[0]);
    contVet.push(1);
    for (let i = 1; i < dataOrder.length; i++) {
        let exists = false;
        for (let j = 0; j < elements.length; j++) {
            if (elements[j] == dataOrder[i]) {
                exists = true;
                contVet[j]++;
            }
        }
        if (!exists) {
            elements.push(dataOrder[i]);
            contVet.push(1);
        }
    }
    return elements;
}

function calculateMode(frequencyValue, type, countElements, dataOrder) {
    let mode = [];
    let higherNumber = parseFloat(frequencyValue[0].frequency);
    let x = countElements[0];

    if (dataOrder.every((val, i, dataOrder) => val === dataOrder[0])) {
        return [{
            "mode": frequencyValue[0].frequency,
            "Value": 'Série Amodal'
        }]
    }


    if (type !== 'Contínua') {
        mode.push({
            "mode": frequencyValue[0].frequency,
            "Value": frequencyValue[0].value
        });
        for (let i = 1; i < frequencyValue.length; i++) {
            let frequencyVerificador = frequencyValue[i].frequency;
            frequencyVerificador = parseFloat(frequencyVerificador);
            if (higherNumber > frequencyVerificador) { } else if (higherNumber < frequencyVerificador) {
                higherNumber = frequencyVerificador
                mode = [];
                mode.push({
                    "Freq": frequencyValue[i].frequency,
                    "Value": frequencyValue[i].value
                });
            } else if (higherNumber === frequencyVerificador) {
                mode.push({
                    "Freq": frequencyValue[i].frequency,
                    "Value": frequencyValue[i].value
                });
                higherNumber = frequencyVerificador;
            };
        };
        return mode;
    }
    else {
        mode.push({
            "Freq": frequencyValue[0].frequency,
            "Value": frequencyValue[0].mediumPoint
        });
        for (let i = 1; i < frequencyValue.length; i++) {
            let frequencyVerificador = frequencyValue[i].frequency;
            frequencyVerificador = parseFloat(frequencyVerificador);
            if (higherNumber > frequencyVerificador) { } else if (higherNumber < frequencyVerificador) {
                higherNumber = frequencyVerificador
                mode = [];
                mode.push({
                    "Freq": frequencyValue[i].frequency,
                    "Value": frequencyValue[i].mediumPoint
                });
            } else if (higherNumber === frequencyVerificador) {
                mode.push({
                    "Freq": frequencyValue[i].frequency,
                    "Value": frequencyValue[i].mediumPoint
                });
                higherNumber = frequencyVerificador;
            };
        };
        return mode;
    }
};


function mountsDescriptive(dataLength, dataFrequency, subType) {
    var relativeFrequency = [];
    var freqAcum = 0;
    var accumulatedPercentage = [];
    var descriptive = [];
    for (var i = 0; i < dataFrequency.length; i++) {
        freqAcum = freqAcum + parseFloat(dataFrequency[i].frequency)
        accumulatedPercentage.push(Accumulated(freqAcum, dataLength));
        relativeFrequency.push(simplePercentage(dataFrequency[i].frequency, dataLength));
        if (subType === 'Contínua') {
            descriptive.push({
                "value": dataFrequency[i].value + ' → ' + dataFrequency[i].value2,
                "frequency": dataFrequency[i].frequency,
                "cumulativeFrequency": freqAcum,
                "relativeFrequency": relativeFrequency[i],
                "accumulatedPercentage": accumulatedPercentage[i]
            })
        }
        if (subType !== 'Contínua') {
            descriptive.push({
                "value": dataFrequency[i].value,
                "frequency": dataFrequency[i].frequency,
                "cumulativeFrequency": freqAcum,
                "relativeFrequency": relativeFrequency[i],
                "accumulatedPercentage": accumulatedPercentage[i]
            })
        }
    };

    return descriptive;
};

function subTypeVar(dataLength, typeVar) {
    if (typeVar === 'Qualitativo')
        return 'Nominal';

    if (dataLength >= 9)
        return 'Contínua';

    return 'Discreta';
};

function stepAmplitude(dataOrder) {
    const index = (dataOrder.length - 1);
    const min = parseFloat(dataOrder[0]);
    const max = parseFloat(dataOrder[index]);
    return ((max - min) + 1);
};

function calculatePercentile(dataOrder, subType, dataFrequency, accumulatedFrequency, classInterval) {
    // console.log(accumulatedFrequency);
    let P = 0;
    let percs = [];
    if (subType === 'Contínua') {
        for (var i = 1; i <= 100; i++) {
            P = (i * (dataOrder.length)) / 100;
            let Li = [];
            let Fai = [];
            let Fm = [];

            for (var j = 0; j < accumulatedFrequency.length; j++) {
                if (accumulatedFrequency[j] > P) {
                    Li.push(dataFrequency[j].value);
                    Fm.push(dataFrequency[j].frequency);
                    if (j === 0) {
                        Fai.push(0);
                    }
                    else { Fai.push(accumulatedFrequency[j - 1]); }
                }
            }
            if (i === 100) {
                Li.push(dataFrequency[accumulatedFrequency.length - 1].value);
                Fm.push(dataFrequency[accumulatedFrequency.length - 1].frequency);
                Fai.push(accumulatedFrequency[accumulatedFrequency.length - 2]);
            }
            percs.push(
                parseFloat((Li[0] + (((P - Fai[0]) / Fm[0]) * classInterval[0])).toFixed(4))
            );
        }
    }
    else if (subType !== 'Contínua') {
        for (var i = 1; i <= 100; i++) {
            P = (i * (dataOrder.length - 1)) / 100;

            if (((i * (dataOrder.length - 1)) % 100) === 0) {
                percs.push(dataOrder[P]);
            } else {
                percs.push(/*P.toFixed(1) + 'º Posição: ' +*/ dataOrder[(parseInt(P))]);
            }
        }
    }
    return percs;
}

function calculateValue1(elements, interval) {
    let k = interval[1];
    let res = [];
    for (let i = 0; i < k; i++) {
        res.push(elements[0] + (i * interval[0]));
    }
    return res;
}

function calculateValue2(initialElements, interval) {
    let k = interval[1];
    let res = [];
    for (let i = 0; i < k; i++) {
        res.push(initialElements[i] + interval[0]);
    }
    return res;
}

function calculateInterv(amplitude, lines, vet) {
    let r = [];
    let flag = false;
    let amp = Math.round(amplitude);
    do {
        if ((amp % lines) === 0) {
            flag = true;
            r.push(amp / lines);
            r.push(lines);
        } else if (amp % (lines - 1) == 0) {
            flag = true;
            r.push(amp / (lines - 1));
            r.push((lines - 1));
        } else if (amp % (lines + 1) == 0) {
            flag = true;
            r.push(amp / (lines + 1));
            r.push((lines + 1));
        }
        amp++;
    } while (flag === false);
    return r;
};

router.get('/user_simple_frequency', async (req, res) => {
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
});

router.post('/simple_frequency', async (req, res) => {
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
        const typeVar = CheckDataType(data, subTypeMeasure);

        const dataOrder = orderby(data, typeVar, subTypeMeasure);
        var dataFrequency = simpleFrequency(dataOrder, data, subTypeMeasure); //quando não é contínua
        if (subTypeMeasure === undefined) {
            subType = subTypeVar(dataFrequency.length, typeVar);
        } else {
            subType = subTypeMeasure;
        };
        if (subType === 'Contínua') {
            amplitude = stepAmplitude(dataOrder);
            lines = parseFloat(Math.sqrt(dataOrder.length).toFixed(2));
            classInterval = calculateInterv(amplitude, parseInt(lines), dataOrder);
            initialElements = calculateValue1(dataOrder, classInterval);
            finalElements = calculateValue2(initialElements, classInterval);
            countClass = countByClass(dataOrder, initialElements, finalElements); //quando é contínua
            mediumPoint = calculateMediumPoint(subType, initialElements, finalElements);
            dataFrequency = mountDataCont(initialElements, finalElements, countClass, mediumPoint)
        }

        const countElements = calculateElements(dataOrder);
        const mode = calculateMode(dataFrequency, subType, countElements, dataOrder);
        // const mean = calculatemean(dataOrder);
        const weightedMean = calculateWeightedMean(dataFrequency, typeVar, subType);
        const accumulatedFrequency = calculateAccumulatedFrequency(dataFrequency);
        const median = calculateMedian(dataOrder, classInterval, dataFrequency, subType, accumulatedFrequency);

        const variance = calculateVariance(dataFrequency, weightedMean, typeVar, amost, subType);
        const deviation = calculateDP(variance, typeVar);
        const coefvar = calculateCV(deviation, weightedMean, typeVar);
        const percentile = calculatePercentile(dataOrder, subType, dataFrequency, accumulatedFrequency, classInterval);
        const dataDescriptive = mountsDescriptive(dataOrder.length, dataFrequency, subType);

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
});

module.exports = app => app.use('/descriptive', router);