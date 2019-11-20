'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const corrRegServices = require('../Services/corrRegServices')
const router = express.Router();
const { factorial, sqrt, format } = require('mathjs')
const User = require('../model/User');
const CorrReg = require('../model/corrReg');
const mailer = require('../../modules/mailer');

exports.corrReg = async (req, res) => {
      const {
            X,
            Y
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = {
                  "correlation": await corrRegServices.pearsonCorrelation([X, Y], 0, 1),
                  "regression": await corrRegServices.Regression(X, Y),
                  "line": [[Math.min.apply(null, X), Math.min.apply(null, Y)], [Math.max.apply(null, X), Math.max.apply(null, Y)]]
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
                  error: err
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
            const Atype = language !== 'pt-br' ? `Correlation and Regression` : `Correlação e Regressão`; 
            
            const user = await User.findOne({
                  _id: userId
            });
            if (!user)
                  return res.status(400).send({
                        error: defaultMessage.login.usererror
                  });
            const username = user.name;
            const email = user.email;
            const anl = await CorrReg.create({
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
                  error: err
            });
      }
};
