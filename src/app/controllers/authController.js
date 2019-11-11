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
            error: error + ' register failure'
        });
    }


};

exports.getUserCofig = async (req, res) => {
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

        config.sidebarColor = sidebarColor;

        await user.save();
        return res.status(200).send(JSON.stringify('OK'));

    } catch (err) {
        return res.status(400).send({
            error: 'Faile to refresh user configuration'
        });
    }
};

exports.register = async (req, res) => {
    const {
        email,
        name
    } = req.body;

    try {
        if (!await authServices.validateEmailAddress(email))
            return res.status(400).send({
                error: 'Invalid e-mail'
            });

        if (await User.findOne({
            email
        }))
            return res.status(400).send({
                error: 'User has already been registered'
            });

        const user = await User.create(req.body);

        const config = await UserConfig.create({
            userId: user.id,
            userName: name
        });

        user.password = undefined;

        mailer.sendMail({
            to: `${email};datatongji@gmail.com`,
            from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            subject: 'Welcome to Data Tongjì!',
            template: 'auth/new_user',
            context: {
                name
            }
        }, (er) => {
            if (er)
                return res.status(400).send({
                    error: er + 'Cannot send welcome email'
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
            error: 'Failure'
        });
    }
};

exports.authenticate = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    const user = await User.findOne({
        email
    }).select('+password');

    if (!user)
        return res.status(400).send({
            error: 'User not found'
        });

    if (!await bcrypt.compare(password, user.password))
        return res.status(401).send({
            error: 'Invalid credentials'
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
        email
    } = req.body

    try {
        const user = await User.findOne({
            email
        });

        if (!user)
            return res.status(400).send({
                error: 'User not found'
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
            subject: 'Reset password',
            template: 'auth/forgot_password',
            context: {
                token,
                name
            },
        }, (err) => {
            if (err)
                return res.status(400).send({
                    error: err + 'Cannot send forgot password email'
                });

            return res.status(200).send(JSON.stringify(token));

        });

    } catch (err) {
        res.status(400).send({
            error: err + 'Failed to change password'
        });
    }
};

exports.updateuser = async (req, res) => {
    const {
        token,
        sidebarColor,
        backgroundColor
    } = req.body

    try {

        const decoded = jwt.decode(token, {
            complete: true
        });
        var userId = decoded.payload;

        const user = await UserConfig.findOne({
            'userId': userId.id
        });
        if (!user)
            return res.status(400).send({
                error: 'User not found!'
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
            error: 'Failed to change user config' + err
        })
    }
};

exports.resetPassword = async (req, res) => {
    const {
        email,
        token,
        password
    } = req.body

    try {
        const user = await User.findOne({
            email
        })
            .select('+passwordResetToken passwordResetExpires name');

        if (!user)
            return res.status(400).send({
                error: 'User not found!'
            });

        if (token !== user.passwordResetToken)
            return res.status(400).send({
                error: 'Invalid token!'
            });

        const now = new Date();

        if (!now > user.passwordResetExpires)
            return res.status(400).send({
                error: 'Expired token!'
            })

        const name = user.name;
        user.password = password;  
        user.passwordResetToken = '';  
        user.passwordResetExpires = now;        

        await user.save();
        
        mailer.sendMail({
            to: `${email};datatongji@gmail.com`,
            from: '"Data Tongjì 统计" <no-reply@datatongji.com>',
            subject: 'Password successfully changed',
            template: 'auth/reset_password',
            context: {
                name
            },
        }, (err) => {
            if (err)
                return res.status(400).send({
                    error: err + 'Cannot send reset password email'
                });
        });

        return res.status(200).send(JSON.stringify('OK'));
    } catch (err) {
        res.status(400).send({
            error: 'Failed to change password'
        })
    }

};

exports.validToken = async (req, res) => {
    const {
        email,
        token
    } = req.body

    try {
        const user = await User.findOne({
            email
        })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({
                error: 'User not found'
            });

        if (token !== user.passwordResetToken)
            return res.status(400).send({
                error: 'Invalid token!'
            });

        const now = new Date();

        if (!now > user.passwordResetExpires)
            return res.status(400).send({
                error: 'Expired token!'
            })

        return res.status(200).send(JSON.stringify('OK'));
    } catch (err) {
        res.status(400).send({
            error: 'Failure'
        })
    }
};
