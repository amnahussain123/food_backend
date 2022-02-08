const User = require("../models").User
const meal = require("../models").Meal
const payment_variation = require("../models").payment_variation
const invoice = require("../models").invoice
const config = require("../config/auth.config.js");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var moment = require('moment');
const { transporter } = require("../email/key");
const { Op } = require("sequelize");
module.exports = {
    // create account for user
    signUp: (req, res) => {
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            address: req.body.address,
            post_code: req.body.post_code,
            city: req.body.city,
            phone: req.body.phone,
            role: "CLIENT",
        }).then((user) => {
            var mailOptions = {
                from: 'homemadesubs@gmail.com',
                to: user.email,
                subject: 'Login Details',
                text: 'Email: ' + user.email + '  ' + 'Password: ' + req.body.password
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            return res.status(200).json({
                message: "User is created successfully",
                id: user.id,
                name: user.name,
                email: user.email,
                accessToken: token,
                role: user.role,
                phone: user.phone,
                status: true,
                subscription: user.subscription
            });
        }).catch(err => {
            if (err.name === 'SequelizeValidationError') {
                return res.status(200).json({
                    status: false,
                    message: err.errors.map(e => e.message)
                })
            } else {
                res.status(500).send({ message: err.message });
            }
        })
    },
    signIn: (req, res) => {
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then((user) => {
            if (!user) {
                return res.status(200).json({ message: "User Not found.", status: false });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(200).json({
                    accessToken: null,
                    message: "Invalid Password!",
                    status: false
                });
            }
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            res.status(200).send({
                id: user.id,
                name: user.name,
                email: user.email,
                accessToken: token,
                subscription: user.subscription,
                role: user.role

            });
        })
            .catch(err => {
                res.status(500).send({ message: err.message });
            })
    },
    //update user profile
    updateSignUp: (req, res) => {
        let { name, email, city, address, post_code } = req.body
        let id = req.params.id
        User.findOne({
            where: { id: id }
        }).then(user => {
            if (user) {
                user.update({ name, email, city, address, post_code })
                    .then((updateUser) => {
                        return res.status(200).json({
                            message: "User is updated successfully",
                            updateUser,
                            status: true
                        })
                    })
            } else {
                return res.status(200).json({
                    message: "User is not found",
                    status: false
                })
            }
        }).catch(error => {
            return res.status(400).json({
                "error": error
            })
        })
    },

    //list of weekly menu
    listOfMenu: (req, res) => {
        var now = moment();
        var startDate = now.format('YYYY-MM-DD');
        var new_date = moment(startDate, "YYYY-MM-DD").add(7, 'days');
        var finalDate = new_date.format('YYYY') + '-' + new_date.format('MM') + '-' + new_date.format('DD');
        const weekNumber = moment().week();
        console.log(weekNumber);
        meal.findAll({
            where: {
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: finalDate,
                }, week: weekNumber
            },
        }).then(menu => {
            return res.status(200).json({
                menu
            })
        }).catch(error => {
            return res.status(400).json({
                "error": error
            })
        })
    },
    //subscription
    subscription: (req, res) => {
        var values = { subscription: 1 };
        var selector = {
            where: { id: req.body.userId }
        };
        User.update(values, selector)
            .then(user => {
                return res.status(200).json({
                    message: "Your subscription to meal is done. ",
                    user,
                    status: true
                })
            }).catch(error => {
                return res.status(400).json({
                    message: error,
                    status: false,
                })
            })
    },

    //payment variation
    paymentVary: (req, res) => {
        let { payment_vary } = req.body
        User.findOne({
            where: { id: req.body.userId }
        }).then(user => {
            if (user) {
                user.update({ payment_vary })
                    .then(user => {
                        payment_variation.findOne({
                            where: { type: user.payment_vary }
                        }).then(meal_rate => {
                            invoice.create({
                                user_id: user.id,
                                plan: user.payment_vary,
                                status: 'UNPAID'
                            })
                            var mailOptions = {
                                from: 'homemadesubs@gmail.com',
                                to: user.email,
                                subject: 'Subscription Success',
                                text: 'Your Payment variation is ' + user.payment_vary + '. Your subscription price is ' + meal_rate.amount + '. Please pay your invoice within 1 day online.'
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                            return res.status(200).json({
                                message: "Your payment variation is store in our record. ",
                                user,
                                status: true
                            })
                        }).catch(error => {
                            return res.status(400).json({
                                message: error,
                                status: false
                            })
                        })
                    }).catch(error => {
                        return res.status(400).json({
                            message: error,
                            status: false
                        })
                    })
            }
        }).catch(error => {
            return res.status(400).json({
                message: error,
                status: false
            })
        })
    },

    //upload invoice
    uploadInvoice: (req, res) => {
        var values = { status: 'PAID' };
        var selector = {
            where: { id: req.body.id, user_id: req.body.userId }
        };
        invoice.update(values, selector)
            .then(user => {
                return res.status(200).json({
                    message: "Your invoice is uploaded successfully. ",
                    user,
                    status: true
                })
            }).catch(error => {
                return res.status(400).json({
                    message: error,
                    status: false,
                })
            })
    },
}