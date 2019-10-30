'use strict';
require('dotenv/config');

exports.pearsonCorrelation = async (prefs, p1, p2) => {
    var si = [];
    for (var key in prefs[p1]) {
          if (prefs[p2][key]) si.push(key);
    }
    var n = si.length;
    if (n == 0) return 0;
    var sum1 = 0;
    for (var i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];
    var sum2 = 0;
    for (var i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];
    var sum1Sq = 0;
    for (var i = 0; i < si.length; i++) {
          sum1Sq += Math.pow(prefs[p1][si[i]], 2);
    }
    var sum2Sq = 0;
    for (var i = 0; i < si.length; i++) {
          sum2Sq += Math.pow(prefs[p2][si[i]], 2);
    }

    var pSum = 0;
    for (var i = 0; i < si.length; i++) {
          pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
    }

    var num = pSum - (sum1 * sum2 / n);
    var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
          (sum2Sq - Math.pow(sum2, 2) / n));

    if (den == 0) return 0;

    return parseFloat((num / den).toFixed(4));
};

exports.Regression = async (X, Y) => {
    var EY = Y.reduce((a, b) => a + b, 0);
    var EX = X.reduce((a, b) => a + b, 0);
    var YX = 0;
    var Xsqrt = 0;
    for (var i = 0; i <= X.length - 1; i++) {
          YX = YX + (X[i] * Y[i]);
          Xsqrt = Xsqrt + Math.pow(X[i], 2);
    }
    let r = ((X.length * YX) - (EY * EX)) /
          ((X.length * Xsqrt) - (Math.pow(EX, 2)));

    let a = (EY - (r * EX)) / X.length;

    return {
          "aCoef": parseFloat(r.toFixed(4)),
          "iPoint": parseFloat(a.toFixed(4))
    };
};