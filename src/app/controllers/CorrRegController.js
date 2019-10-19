const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const { factorial, sqrt, format } = require('mathjs')
const User = require('../model/User');
router.use(authMiddleware);

function pearsonCorrelation(prefs, p1, p2) {
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

function Regression(X, Y) {
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

router.post('/corrreg', async (req, res) => {
      const {
            X,
            Y
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = {
                  "correlation": pearsonCorrelation([X, Y], 0, 1),
                  "regression": Regression(X, Y)
            };

            const decoded = jwt.decode(token, {
                  complete: true
            });

            const userId = decoded.payload["id"];

            return res.send({
                  distribution
            });

      } catch (err) {
            return res.status(400).send({
                  error: err + ''
            });
      }
});

router.post('/save', async (req, res) => {
      const {
            type,
            name,
            data,
            results
      } = req.body;
      const token = req.headers.authorization;
      const decoded = jwt.decode(token, {
            complete: true
      });
      const userId = decoded.payload["id"];
      try {
            if (await User.findOne({
                  userId
            }))
                  return res.status(400).send({
                        error: 'Could not find user!'
                  });
            // const anl = await Probability.create({
            //       userIdF
            // });
            // mailer.sendMail({
            //       to: email,
            //       from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            //       subject: 'Bem vindo ao Data Tongjì!',
            //       template: 'auth/new_user',
            //       context: {
            //             name
            //       }
            // }, (er) => {
            //       if (er)
            //             return res.status(400).send({
            //                   error: er + 'Cannot email'
            //             })
            // });
            return res.send({
                  anl
            });
      } catch (err) {
            return res.status(400).send({
                  error: 'Failed to save analysis'
            });
      }
});

module.exports = app => app.use('/correlation', router);