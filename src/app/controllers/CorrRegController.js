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
                  error: err + ''
            });
      }
};

exports.save = async (req, res) => {
      const {
            name,
            data,
            results
      } = req.body;
      const token = req.headers.authorization;
      const decoded = jwt.decode(token, {
            complete: true
      });
      const userId = decoded.payload["id"];
      const Atype = 'Correlation and Regression';
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
            const anl = await CorrReg.create({
                  userId,
                  name,
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
