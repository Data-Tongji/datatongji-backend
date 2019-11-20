require('dotenv/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const User = require('../model/User');
const UserConfig = require('../model/UserConfig');
const authServices = require('../Services/authServices')
const UserPhoto = require('../model/UserPhoto');



exports.getUser = async (req, res) => {
    try {
        const token = req.query.token;

        const decoded = jwt.decode(token, {
            complete: true
        });
        var userId = decoded.payload;

        const user = await User.findOne({
            '_id': userId.id
        }).sort('-createdAt');

        const userImg = await UserPhoto.findOne({
            'idUser': userId.id
        }).sort('-createdAt');
        const data = { user, userImg }

        return res.send(data)

    } catch (error) {
        return res.status(400).send({
            error: error
        });
    }
};

exports.getUserConfig = async (req, res) => {
    const token = req.query.token;

    const decoded = jwt.decode(token, {
        complete: true
    });

    const userId = decoded.payload;
    const config = await UserConfig.findOne({ userId: userId.id }).sort('-createdAt');

    return res.json(config);
};

exports.userConfig = async (req, res) => {
    const {
        sidebarColor
    } = req.body;
    const token = req.query.token;

    const decoded = jwt.decode(token, {
        complete: true
    });

    try {
        const config = await UserConfig.findOne({
            userId
        });

        var defaultMessage = config.defaultLanguage !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');

        config.sidebarColor = sidebarColor;

        await user.save();
        return res.status(200).send(JSON.stringify('OK'));

    } catch (err) {
        return res.status(400).send({
            error: defaultMessage.userconfig.error
        });
    }
};

exports.register = async (req, res) => {
    const {
        email,
        name,
        language
    } = req.body;

    try {
        var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');

        if (!await authServices.validateEmailAddress(email))
            return res.status(400).send({
                error: defaultMessage.register.emailerror
            });

        if (await User.findOne({
            email
        }))
            return res.status(400).send({
                error: defaultMessage.register.usererror
            });

        const user = await User.create(req.body);

        const config = await UserConfig.create({
            userId: user.id,
            userName: name,
            defaultLanguage: language
        });

        user.password = undefined;

        mailer.sendMail({
            to: `${email};datatongji@gmail.com`,
            from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            subject: defaultMessage.register.email.sub,
            template: 'auth/new_user',
            context: {
                text1: defaultMessage.register.email.body.text1,
                text2: defaultMessage.register.email.body.text2,
                text3: defaultMessage.register.email.body.text3,
                text4: defaultMessage.register.email.body.text4,
                name
            }
        }, (er) => {
            if (er)
                return res.status(400).send({
                    error: er
                })
        });

        return res.send({
            user,
            token: await authServices.generateToken({
                id: user.id
            })
        });

    } catch (err) {
        return res.status(400).send({
            error: defaultMessage.error
        });
    }
};

exports.authenticate = async (req, res) => {
    const {
        email,
        password,
        language
    } = req.body;

    const user = await User.findOne({
        email
    }).select('+password');
    var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');

    if (!user)
        return res.status(400).send({
            error: defaultMessage.login.usererror
        });

    if (!await bcrypt.compare(password, user.password))
        return res.status(401).send({
            error: defaultMessage.login.invaliderror
        });

    user.password = undefined;

    res.send(JSON.stringify(await authServices.generateToken({ id: user.id })));
};

exports.authenticateToken = async (req, res) => {
    const {
        token
    } = req.body;

    jwt.verify(token, process.env.AUTH, (err, decoded) => {
        if (err) return res.status(401).send(JSON.stringify('NO'));

        return res.status(200).send(JSON.stringify('OK'));
    });
};

exports.forgotPassword = async (req, res) => {
    const {
        email,
        language
    } = req.body

    try {
        const user = await User.findOne({
            email
        });
        var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');


        if (!user)
            return res.status(400).send({
                error: defaultMessage.login.usererror
            });

        const token = crypto.randomBytes(20).toString('hex');
        const name = user.name;
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: `${email};datatongji@gmail.com`,
            from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            subject: defaultMessage.forgotpass.forgotemail.sub,
            template: 'auth/forgot_password',
            context: {
                text1: defaultMessage.forgotpass.forgotemail.body.text1,
                text2: defaultMessage.forgotpass.forgotemail.body.text2,
                text3: defaultMessage.forgotpass.forgotemail.body.text3,
                token,
                name
            },
        }, (err) => {
            if (err)
                return res.status(400).send({
                    error: err
                });

            return res.status(200).send(JSON.stringify(token));

        });

    } catch (err) {
        res.status(400).send({
            error: err + ' - ' + defaultMessage.forgotpass.error
        });
    }
};

exports.updateuser = async (req, res) => {
    const {
        token,
        sidebarColor,
        backgroundColor,
        language
    } = req.body

    try {
        var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');

        const decoded = jwt.decode(token, {
            complete: true
        });
        var userId = decoded.payload;

        const user = await UserConfig.findOne({
            'userId': userId.id
        });
        if (!user)
            return res.status(400).send({
                error: defaultMessage.login.usererror
            });
        if (sidebarColor !== '') {
            user.sidebarColor = String(sidebarColor);
        }
        if (backgroundColor !== '') {
            user.backgroundColor = String(backgroundColor);
        }

        await user.save();

        return res.status(200).send(JSON.stringify('OK'));
    } catch (err) {
        res.status(400).send({
            error: defaultMessage.userconfig.saveconfigerror + ' ' + err
        })
    }
};

exports.resetPassword = async (req, res) => {
    const {
        email,
        token,
        password,
        language
    } = req.body

    try {
        var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');
        const user = await User.findOne({
            email
        })
            .select('+passwordResetToken passwordResetExpires name');

        if (!user)
            return res.status(400).send({
                error: defaultMessage.login.usererror
            });

        if (token !== user.passwordResetToken)
            return res.status(400).send({
                error: defaultMessage.forgotpass.token.error1
            });

        const now = new Date();

        if (!now > user.passwordResetExpires)
            return res.status(400).send({
                error: defaultMessage.forgotpass.token.error2
            })

        const name = user.name;
        user.password = password;
        user.passwordResetToken = '';
        user.passwordResetExpires = now;

        await user.save();

        mailer.sendMail({
            to: `${email};datatongji@gmail.com`,
            from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            subject: defaultMessage.forgotpass.resetemail.sub,
            template: 'auth/reset_password',
            context: {
                text1: defaultMessage.forgotpass.resetemail.body.text1,
                text2: defaultMessage.forgotpass.resetemail.body.text2,
                text3: defaultMessage.forgotpass.resetemail.body.text3,
                text4: defaultMessage.register.email.body.text4,
                name
            },
        }, (err) => {
            if (err)
                return res.status(400).send({
                    error: err + ' ' + defaultMessage.forgotpass.mailerror
                });
        });

        return res.status(200).send(JSON.stringify('OK'));
    } catch (err) {
        res.status(400).send({
            error: defaultMessage.forgotpass.error
        })
    }

};

exports.validToken = async (req, res) => {
    const {
        email,
        token,
        language
    } = req.body

    try {
        var defaultMessage = language !== 'pt-br' ? require('../../locales/en-us.js') : require('../../locales/pt-br.js');
        const user = await User.findOne({
            email
        })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({
                error: defaultMessage.login.usererror
            });

        if (token !== user.passwordResetToken)
            return res.status(400).send({
                error: defaultMessage.forgotpass.token.error1
            });

        const now = new Date();

        if (!now > user.passwordResetExpires)
            return res.status(400).send({
                error: defaultMessage.forgotpass.token.error2
            })

        return res.status(200).send(JSON.stringify('OK'));
    } catch (err) {
        res.status(400).send({
            error: defaultMessage.error
        })
    }
};
