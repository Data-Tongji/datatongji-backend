const jwt = require('jsonwebtoken');
require('dotenv/config');

exports.CheckDataType = async (data, subTypeMeasure) => {
    if (subTypeMeasure !== 'Ordinal') {
        var vetor = data
        let answer = 'Quantitative'
        for (let i = 0; i < vetor.length; i++) {
            if (isNaN(vetor[i])) {
                answer = 'Qualitative'
            };
        }
        return answer
    }
    else { return 'Qualitative' }
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
};

exports.simpleFrequency = async (NewData, data, subTypeMeasure) => {
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

exports.mountDataCont = async (initialElements, finalElements, frequency, mediumPoint) => {
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
};

exports.countByClass = async (arr, initialElements, finalElements) => {
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
};

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

exports.orderby = async (data, answer, subTypeMeasure) => {
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

exports.calculateWeightedMean = async (frequencyValue, type, subType) => {
    let sum = 0;
    let n = frequencyValue.reduce((total, frequencyValue) => total + frequencyValue.frequency, 0);

    if (type === 'Qualitative') {
        return "n/a"
    } else {
        if (subType !== 'Continuous') {
            for (let i = 0; i < frequencyValue.length; i++) {
                sum = sum + (parseFloat(frequencyValue[i].frequency) * parseFloat(frequencyValue[i].value));
            }
            return (sum / n);
        }
        else {
            for (let i = 0; i < frequencyValue.length; i++) {
                sum = sum + (parseFloat(frequencyValue[i].frequency) * parseFloat(frequencyValue[i].mediumPoint));
            }
            return (sum / n);
        }
    }
};


exports.calculateVariance = async (frequencyValue, mean, type, amost, subType) => {
    let sum = 0;
    let n = frequencyValue.reduce((total, frequencyValue) => total + frequencyValue.frequency, 0);

    if (type === 'Qualitative') {
        return "n/a"
    }
    if (subType !== 'Continuous') {
        for (let i = 0; i < frequencyValue.length; i++) {
            sum = sum + ((Math.pow((parseFloat(frequencyValue[i].value) - mean), 2)) * parseFloat(frequencyValue[i].frequency));
        }
        if (amost === 'Population') {
            return parseFloat((sum / n).toFixed(4));
        } else {
            return parseFloat((sum / (n - 1)).toFixed(4));
        }
    } else if (subType === 'Continuous') {
        for (let i = 0; i < frequencyValue.length; i++) {
            sum = sum + ((Math.pow((parseFloat(frequencyValue[i].mediumPoint) - mean), 2)) * parseFloat(frequencyValue[i].frequency));
        }
        if (amost === 'Population') {
            return parseFloat((sum / n).toFixed(4));
        } else {
            return parseFloat((sum / (n - 1)).toFixed(4));
        }
    }
};

exports.calculateDP = async (variance, type) => {
    if (type === 'Qualitative') {
        return 'n/a'
    }
    return parseFloat((Math.sqrt(variance)).toFixed(4));
};

exports.calculateCV = async (dp, mp, type) => {
    if (type === 'Qualitative') {
        return 'n/a'
    }
    return ((dp / mp) * 100).toFixed(3) + '%';
};

exports.calculatemean = async (data) => {
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        if (isNaN(data[i])) {
            return "n/a"
        }
        sum = sum + parseFloat(data[i]);
    }
    return (sum / data.length)
};

exports.calculateAccumulatedFrequency = async (dataFrequency) => {
    let fac = [];
    for (let i = 0; i < dataFrequency.length; i++) {
        if (i === 0) {
            fac.push(dataFrequency[i].frequency);
        } else {
            fac.push(dataFrequency[i].frequency + fac[i - 1]);
        }
    }
    return fac;
};

exports.calculateMedian = async (arr, interval, dataFrequency, subType, fac, language) => {
    let n = arr.length;
    var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');
    if (subType !== 'Continuous') {

        if (n % 2 === 0) {
            let a = arr[(n / 2) - 1];
            let b = arr[((n / 2) + 1) - 1];

            if (!isNaN(a) && !isNaN(b)) {
                if (parseFloat(a) === parseFloat(b)) {
                    return (n / 2) + 'º e ' + ((n / 2) + 1) + 'º '+defaultMessage.descrip.pos+': ' + a;
                } else {
                    return (n / 2) + 'º '+defaultMessage.descrip.pos+': ' + a + ' | ' + ((n / 2) + 1) + 'º '+defaultMessage.descrip.pos+': ' + b;
                }
            } else if (a === b) {
                return (n / 2) + 'º e ' + ((n / 2) + 1) + 'º '+defaultMessage.descrip.pos+': ' + a;
            } else {
                return (n / 2) + 'º '+defaultMessage.descrip.pos+': ' + a + ' | ' + ((n / 2) + 1) + 'º '+defaultMessage.descrip.pos+': ' + b;
            }
        } else {
            return (parseInt(n / 2) + 1) + 'º '+defaultMessage.descrip.pos+': ' + arr[(parseInt(n / 2) + 1)];
        }
    }
    else if (subType === 'Continuous') {
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
};

exports.calculateMediumPoint = async (subType, initialElements, finalElements) => {
    let mediumPoint = [];
    if (subType === 'Continuous') {
        for (let i = 0; i < initialElements.length; i++) {

            mediumPoint.push((initialElements[i] + finalElements[i]) / 2);
        }
    }
    return mediumPoint;
};

exports.calculateElements = async (dataOrder) => {
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
};

exports.calculateMode = async (frequencyValue, type, countElements, dataOrder, language) => {
    let mode = [];
    let higherNumber = parseFloat(frequencyValue[0].frequency);
    let x = countElements[0];
    var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');
            
    if (dataOrder.every((val, i, dataOrder) => val === dataOrder[0])) {
        return [{
            "mode": frequencyValue[0].frequency,
            "Value": defaultMessage.descrip.nomode
        }]
    }

    if (type !== 'Continuous') {
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

exports.mountsDescriptive = async (dataLength, dataFrequency, subType) => {
    var relativeFrequency = [];
    var freqAcum = 0;
    var accumulatedPercentage = [];
    var descriptive = [];
    for (var i = 0; i < dataFrequency.length; i++) {
        freqAcum = freqAcum + parseFloat(dataFrequency[i].frequency)
        accumulatedPercentage.push(Accumulated(freqAcum, dataLength));
        relativeFrequency.push(simplePercentage(dataFrequency[i].frequency, dataLength));
        if (subType === 'Continuous') {
            descriptive.push({
                "value": dataFrequency[i].value + ' → ' + dataFrequency[i].value2,
                "frequency": dataFrequency[i].frequency,
                "cumulativeFrequency": freqAcum,
                "relativeFrequency": relativeFrequency[i],
                "accumulatedPercentage": accumulatedPercentage[i]
            })
        }
        if (subType !== 'Continuous') {
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

exports.subTypeVar = async (dataLength, typeVar) => {
    if (typeVar === 'Qualitative')
        return 'Nominal';

    if (dataLength >= 7)
        return 'Continuous';

    return 'Discrete';
};

exports.stepAmplitude = async (dataOrder) => {
    const index = (dataOrder.length - 1);
    const min = parseFloat(dataOrder[0]);
    const max = parseFloat(dataOrder[index]);
    return ((max - min) + 1);
};

exports.calculatePercentile = async (dataOrder, subType, dataFrequency, accumulatedFrequency, classInterval) => {
    let P = 0;
    let percs = [];
    if (subType === 'Continuous') {
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
    else if (subType !== 'Continuous') {
        for (var i = 1; i <= 100; i++) {
            P = (i * (dataOrder.length - 1)) / 100;

            if (((i * (dataOrder.length - 1)) % 100) === 0) {
                percs.push(dataOrder[P]);
            } else {
                percs.push(dataOrder[(parseInt(P))]);
            }
        }
    }
    return percs;
};

exports.calculateValue1 = async (elements, interval) => {
    let k = interval[1];
    let res = [];
    for (let i = 0; i < k; i++) {
        res.push(elements[0] + (i * interval[0]));
    }
    return res;
};

exports.calculateValue2 = async (initialElements, interval) => {
    let k = interval[1];
    let res = [];
    for (let i = 0; i < k; i++) {
        res.push(initialElements[i] + interval[0]);
    }
    return res;
};

exports.calculateInterv = async (amplitude, lines, vet) => {
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