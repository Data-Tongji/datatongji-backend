'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const corrRegServices = require('../Services/corrRegServices')
const router = express.Router();
const { factorial, sqrt, format } = require('mathjs')
const User = require('../model/User');
const CorrReg = require('../model/corrReg');

exports.corrReg = async (req, res) => {
      const {
            X,
            Y
      } = req.body;

      const token = req.headers.authorization;

      try {

            let distribution = {
                  "correlation": await corrRegServices.pearsonCorrelation([X, Y], 0, 1),
                  "regression": await corrRegServices.Regression(X, Y)
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

exports.save =async (req, res) => {
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
      try {
            if (await User.findOne({
                  userId
            }))
                  return res.status(400).send({
                        error: 'Could not find user!'
                  });
            const anl = await CorrReg.create({
                  userId,
                  name,
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
};
