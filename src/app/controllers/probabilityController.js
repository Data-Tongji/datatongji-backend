const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const { factorial, sqrt, format } = require('mathjs')
const User = require('../model/User');
const Probability = require('../model/probability');
router.use(authMiddleware);



function CalcZ(x, mean, dp) {
      let res = '';
      res = ((x - mean) / dp);
      if (res >= 4) { res = 3.9; }
      if (res <= -4) { res = -3.9; }
      return res;
};

function Area(x) {
      let l = x + '';
      l = parseInt(l.substr(0, 2));
      let c = x + '';
      c = parseInt(c.substr(2, 1));
      if (isNaN(l)) { l = 0 };
      if (isNaN(c)) { c = 0 };
      let NormalDistTable = [
            [0.0000, 0.0040, 0.0080, 0.0120, 0.0160, 0.0199, 0.0239, 0.0279, 0.0319, 0.0359],
            [0.0398, 0.0438, 0.0478, 0.0517, 0.0557, 0.0596, 0.0636, 0.0675, 0.0714, 0.0753],
            [0.0793, 0.0832, 0.0871, 0.0910, 0.0948, 0.0987, 0.1026, 0.1064, 0.1103, 0.1141],
            [0.1179, 0.1217, 0.1255, 0.1293, 0.1331, 0.1368, 0.1406, 0.1443, 0.1480, 0.1517],
            [0.1554, 0.1591, 0.1628, 0.1664, 0.1700, 0.1736, 0.1772, 0.1808, 0.1844, 0.1879],
            [0.1915, 0.1950, 0.1985, 0.2019, 0.2054, 0.2088, 0.2123, 0.2157, 0.2190, 0.2224],
            [0.2257, 0.2291, 0.2324, 0.2357, 0.2389, 0.2422, 0.2454, 0.2486, 0.2517, 0.2549],
            [0.2580, 0.2611, 0.2642, 0.2673, 0.2703, 0.2734, 0.2764, 0.2794, 0.2823, 0.2852],
            [0.2881, 0.2910, 0.2939, 0.2967, 0.2995, 0.3023, 0.3051, 0.3078, 0.3106, 0.3133],
            [0.3159, 0.3186, 0.3212, 0.3238, 0.3264, 0.3289, 0.3315, 0.3340, 0.3365, 0.3389],
            [0.3413, 0.3438, 0.3461, 0.3485, 0.3508, 0.3531, 0.3554, 0.3577, 0.3599, 0.3621],
            [0.3643, 0.3665, 0.3686, 0.3708, 0.3729, 0.3749, 0.3770, 0.3790, 0.3810, 0.3830],
            [0.3849, 0.3869, 0.3888, 0.3907, 0.3925, 0.3944, 0.3962, 0.3980, 0.3997, 0.4015],
            [0.4032, 0.4049, 0.4066, 0.4082, 0.4099, 0.4115, 0.4131, 0.4147, 0.4162, 0.4177],
            [0.4192, 0.4207, 0.4222, 0.4236, 0.4251, 0.4265, 0.4279, 0.4292, 0.4306, 0.4319],
            [0.4332, 0.4345, 0.4357, 0.4370, 0.4382, 0.4394, 0.4406, 0.4418, 0.4429, 0.4441],
            [0.4452, 0.4463, 0.4474, 0.4484, 0.4495, 0.4505, 0.4515, 0.4525, 0.4535, 0.4545],
            [0.4554, 0.4564, 0.4573, 0.4582, 0.4591, 0.4599, 0.4608, 0.4616, 0.4625, 0.4633],
            [0.4641, 0.4649, 0.4656, 0.4664, 0.4671, 0.4678, 0.4686, 0.4693, 0.4699, 0.4706],
            [0.4713, 0.4719, 0.4726, 0.4732, 0.4738, 0.4744, 0.4750, 0.4756, 0.4761, 0.4767],
            [0.4772, 0.4778, 0.4783, 0.4788, 0.4793, 0.4798, 0.4803, 0.4808, 0.4812, 0.4817],
            [0.4821, 0.4826, 0.4830, 0.4834, 0.4838, 0.4842, 0.4846, 0.4850, 0.4854, 0.4857],
            [0.4861, 0.4864, 0.4868, 0.4871, 0.4875, 0.4878, 0.4881, 0.4884, 0.4887, 0.4890],
            [0.4893, 0.4896, 0.4898, 0.4901, 0.4904, 0.4906, 0.4909, 0.4911, 0.4913, 0.4916],
            [0.4918, 0.4920, 0.4922, 0.4925, 0.4927, 0.4929, 0.4931, 0.4932, 0.4934, 0.4936],
            [0.4938, 0.4940, 0.4941, 0.4943, 0.4945, 0.4946, 0.4948, 0.4949, 0.4951, 0.4952],
            [0.4953, 0.4955, 0.4956, 0.4957, 0.4959, 0.4960, 0.4961, 0.4962, 0.4963, 0.4964],
            [0.4965, 0.4966, 0.4967, 0.4968, 0.4969, 0.4970, 0.4971, 0.4972, 0.4973, 0.4974],
            [0.4974, 0.4975, 0.4976, 0.4977, 0.4977, 0.4978, 0.4979, 0.4979, 0.4980, 0.4981],
            [0.4981, 0.4982, 0.4982, 0.4983, 0.4984, 0.4984, 0.4985, 0.4985, 0.4986, 0.4986],
            [0.4987, 0.4987, 0.4987, 0.4988, 0.4988, 0.4989, 0.4989, 0.4989, 0.4990, 0.4990],
            [0.4990, 0.4991, 0.4991, 0.4991, 0.4992, 0.4992, 0.4992, 0.4992, 0.4993, 0.4993],
            [0.4993, 0.4993, 0.4994, 0.4994, 0.4994, 0.4994, 0.4994, 0.4995, 0.4995, 0.4995],
            [0.4995, 0.4995, 0.4995, 0.4996, 0.4996, 0.4996, 0.4996, 0.4996, 0.4996, 0.4997],
            [0.4997, 0.4997, 0.4997, 0.4997, 0.4997, 0.4997, 0.4997, 0.4997, 0.4997, 0.4998],
            [0.4998, 0.4998, 0.4998, 0.4998, 0.4998, 0.4998, 0.4998, 0.4998, 0.4998, 0.4998],
            [0.4998, 0.4998, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999],
            [0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999],
            [0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999, 0.4999],
            [0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000, 0.5000],
      ];
      return NormalDistTable[l][c];
};

function Mean(values) {
      return (parseFloat((values.reduce(function (b, a) {
            return parseFloat(b) + parseFloat(a);
      })) / values.length));
};

function Normal(mean, dev, min, max, opt) {
      let res;
      let iniNeg = false;
      let finNeg = false;
      let zFinal = '';
      let fArea;
      let tArea = 0.5;
      let Zin = CalcZ(min, mean, dev);
      if (Zin < 0) {
            iniNeg = true;
            Zin *= -1;
      }

      Zin = Zin.toFixed(2);
      Zin = Zin.substr(0, 1) + Zin.substr(2, 2);
      let iArea = Area(Zin);
      if (opt === 2) {
            zFinal = CalcZ(max, mean, dev);
            if (zFinal < 0) {
                  finNeg = true;
                  zFinal *= -1;
            }
            zFinal = zFinal.toFixed(2);
            zFinal = zFinal.substr(0, 1) + zFinal.substr(2, 2);
            fArea = Area(zFinal);
      }
      switch (opt) {
            case 1:
                  if (iniNeg) {
                        res = tArea - iArea;
                  } else {
                        res = tArea + iArea;
                  }
                  break;
            case 2:
                  if (iniNeg) {
                        if (finNeg) {
                              if (iArea > fArea) {
                                    res = iArea - fArea;
                              } else {
                                    res = fArea - iArea;
                              }
                        } else {
                              res = iArea + fArea;
                        }
                  } else {
                        if (finNeg) {
                              res = iArea + fArea;
                        } else {
                              if (iArea > fArea) {
                                    res = iArea - fArea;
                              } else {
                                    res = fArea - iArea;
                              }
                        }
                  }
                  break;
            case 3:
                  if (iniNeg) {
                        res = tArea + iArea;
                  } else {
                        res = tArea - iArea;
                  }
                  break;
            default:
                  res = 0;
      }

      if (isNaN(res)) {
            res = 0;
      }
      return parseFloat((res * 100).toFixed(2));
};

function Binomial(k, n, p, q, opt) {
      var nk, bin = 0;
      var op = n - k;
      if (opt === 1) {        //less
            if (op > k) {
                  for (let i = 0; i < k; i++) {
                        nk = factorial(n) / (factorial(n - i) * factorial(i));
                        bin = bin + (
                              Math.pow((p), i) *
                              Math.pow((q), (n - i)) *
                              nk)
                  };
                  return parseFloat(((bin) * 100));
            }
            else if (op < k) { //to reduce number of loops 
                  for (let i = k; i <= n; i++) {
                        nk = factorial(n) / (factorial(n - i) * factorial(i));
                        bin = bin + (
                              Math.pow((p), i) *
                              Math.pow((q), (n - i)) *
                              nk)
                  };
                  return parseFloat(((1 - bin) * 100));
            }
      }
      else if (opt === 2) {   //between
            for (let i = k[0]; i <= k[1]; i++) {
                  nk = factorial(n) / (factorial(n - i) * factorial(i));
                  bin = bin + (
                        Math.pow((p), i) *
                        Math.pow((q), (n - i)) *
                        nk)
            };
            return parseFloat(((bin) * 100));
      }
      else if (opt === 3) {   //exactly
            nk = factorial(n) / (factorial(n - k) * factorial(k));
            return parseFloat(((Math.pow((p), k)) * (Math.pow((q), (n - k))) * nk * 100))
      }
      else if (opt === 4) {   //higher
            if (op > k) {
                  for (let i = 0; i < k; i++) {
                        nk = factorial(n) / (factorial(n - i) * factorial(i));
                        bin = bin + (
                              Math.pow((p), i) *
                              Math.pow((q), (n - i)) *
                              nk)
                  };
                  return parseFloat(((1 - bin) * 100));
            }
            else if (op < k) { //to reduce number of loops 
                  for (let i = k; i <= n; i++) {
                        nk = factorial(n) / (factorial(n - i) * factorial(i));
                        bin = bin + (
                              Math.pow((p), i) *
                              Math.pow((q), (n - i)) *
                              nk)
                  };
                  return parseFloat(((bin) * 100));
            }
      }
};

function Uniform(values, PMin, PMax, opt) {
      var prob = 0;
      var mean = Mean(values);
      var variance = (Math.pow(values[1] - values[0], 2)) / 12;
      var stdDev = sqrt(variance);
      var sdCoef = parseFloat(((stdDev / mean) * 100));

      switch (opt) { // 1 - less;  2 - between;  3 - higher
            case 1:
                  prob = (1 / (values[1] - values[0])) * (PMin - values[0]) * 100;
                  break;
            case 2:
                  prob = (1 / (values[1] - values[0])) * (PMax - PMin) * 100;
                  break;
            case 3:
                  prob = (1 / (values[1] - values[0])) * (values[1] - PMin) * 100;
                  break;
            default:
                  prob = 0;
      }
      return {
            "prob": parseFloat(prob.toFixed(3)),
            "Mean": parseFloat(mean.toFixed(3)),
            "variance": parseFloat(variance.toFixed(3)),
            "stdDev": parseFloat(stdDev.toFixed(3)),
            "sdCoef": parseFloat(sdCoef.toFixed(3))
      };
};

router.post('/binomial', async (req, res) => {
      const {
            k,
            n,
            p,
            q,
            Opt
      } = req.body;
      const token = req.headers.authorization;

      try {

            let distribution = Binomial(k,
                  n,
                  p,
                  q,
                  Opt);
            distribution =
                  {
                        "prob": format(distribution, { precision: 4, lowerExp: -10, upperExp: 10 }),
                        "Mean": parseFloat((n * p).toFixed(5)),
                        "variance": parseFloat((n * p * q).toFixed(5)),
                        "stdDev": parseFloat((sqrt(parseFloat((n * p * q).toFixed(5)))).toFixed(5))
                  }


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

router.post('/uniform', async (req, res) => {
      const {
            PMin,
            PMax,
            Min,
            Max,
            Opt
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = Uniform([PMin, PMax],
                  Min,
                  Max,
                  Opt);

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

router.post('/normal', async (req, res) => {
      const {
            Mean,
            stdDev,
            Min,
            Max,
            Opt
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = Normal(Mean,
                  stdDev,
                  Min,
                  Max,
                  Opt);

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
            const anl = await Probability.create({
                  userId,
                  name,
                  type,
                  data,
                  results
            });
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

module.exports = app => app.use('/probability', router);