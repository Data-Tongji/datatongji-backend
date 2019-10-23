require('dotenv/config');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const User = require('../model/User');
const UserConfig = require('../model/UserConfig');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, process.env.AUTH, {
        expiresIn: 43200
    });
};

function validateEmailAddress(email) {
    var expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return expression.test(String(email).toLowerCase());
}

router.get('/get_user', async (req, res) => {
    try {
        const token = req.query.token;

        const decoded = jwt.decode(token, {
            complete: true
        });
        var userId = decoded.payload;

        const user = await User.findOne({
            '_id': userId.id
        }).sort('-createdAt');

        return res.json(user)
    } catch (error) {
        return res.status(400).send({
            error: error + ' register failure'
        });
    }


});

router.get('/get_user_cofig', async (req, res) => {
    const token = req.query.token;

    const decoded = jwt.decode(token, {
        complete: true
    });
    const userId = decoded.id;
    const config = await UserConfig.findOne(userId).sort('-createdAt');
    return res.json(config);

});

router.post('/user_config', async (req, res) => {
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
});

router.post('/register', async (req, res) => {
    const {
        email,
        name
    } = req.body;

    try {
        if (!validateEmailAddress(email))
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

        user.password = undefined;


        mailer.sendMail({
            to: email,
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
            token: generateToken({
                id: user.id
            })
        });

    } catch (err) {
        return res.status(400).send({
            error: 'Failure'
        });
    }
});

router.post('/authenticate', async (req, res) => {
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

    res.send(JSON.stringify(
        generateToken({
            id: user.id,
        })));
});

router.post('/authenticate_token', async (req, res) => {
    const {
        token
    } = req.body;

    jwt.verify(token, process.env.AUTH, (err, decoded) => {
        if (err) return res.status(401).send(JSON.stringify('NO'));

        return res.status(200).send(JSON.stringify('OK'));
    });
});

router.post('/forgot_password', async (req, res) => {
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
            to: email,
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

        })

    } catch (err) {
        res.status(400).send({
            error: err + 'Failed to change password'
        });
    }
});

router.post('/reset_password', async (req, res) => {
    const {
        email,
        token,
        password
    } = req.body

    try {
        const user = await User.findOne({
            email
        })
            .select('+passwordResetToken passwordResetExpires');

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

        user.password = password;

        await user.save();

        return res.status(200).send(JSON.stringify('OK'));
    } catch (err) {
        res.status(400).send({
            error: 'Failed to change password'
        })
    }

})

router.post('/valid_token', async (req, res) => {
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
})

module.exports = app => app.use('/auth', router);