'use strict';

const jwt = require('jsonwebtoken');
const { factorial, sqrt, format } = require('mathjs')
const User = require('../model/User');
const Probability = require('../model/probability');
const probabilityServeice = require('../Services/probabilityService');
const mailer = require('../../modules/mailer');

exports.binomial = async (req, res) => {
      const {
            k,
            n,
            p,
            q,
            Opt
      } = req.body;
      const token = req.headers.authorization;

      try {

            let distribution = await probabilityServeice.Binomial(k,
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
};

exports.uniform = async (req, res) => {
      const {
            PMin,
            PMax,
            Min,
            Max,
            Opt
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = await probabilityServeice.Uniform([PMin, PMax],
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
};

exports.normal = async (req, res) => {
      const {
            Mean,
            stdDev,
            Min,
            Max,
            Opt
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = await probabilityServeice.Normal(Mean,
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
};

exports.save = async (req, res) => {
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
      const Atype = `${type} Probability` 
      try {
            const user = await User.findOne({
                  _id: userId
            });
            if (!user)
                  return res.status(400).send({
                        error: 'Could not find user!'
                  });
            const username = user.name;
            const email = user.email;

            const anl = await Probability.create({
                  userId,
                  name,
                  type,
                  data,
                  results
            });

            mailer.sendMail({
                  to: `${email};datatongji@gmail.com`,
                  from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
                  subject: 'Saved analysis!',
                  template: 'auth/saved_analysis',
                  context: {
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
                  error: 'Failed to save analysis'
            });
      }
};
