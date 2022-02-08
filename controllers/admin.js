const User = require("../models").User
const Meal = require("../models").Meal
const meal_rate = require("../models").meal_rate
const payment_variation = require("../models").payment_variation
const invoice = require("../models").invoice
var bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
module.exports = {
    // create account for user
    signUpAdmin: (req, res) => {
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: "ADMIN",
            phone: req.body.phone
        }).then((user) => {
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken: token,
                status:true
            });
        }).catch(err => {
            return res.status(400).json({ err })
        })
    },
    signInAdmin: (req, res) => {
        console.log(req.body)
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then((user) => {
            if (!user) {
                return res.status(200).json({ 
                    message: "Admin with this email is not found.",                   
                    status:false
            });
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.status(200).json({
                    accessToken: null,
                    message: "Invalid Password!",
                    status:false
                });
            }
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken: token,
                status:true
            });
        })
            .catch(err => {
                res.status(500).send({ message: err.message });
            })
    },
    // get all users
    getAllUsers: (req, res) => {
        User.findAll({
            attributes: ['id','name', 'email', 'phone', 'address', 'post_code', 'city', 'role', 'payment_vary', 'subscription'],
            where: { role: 'CLIENT' },
            order: [['id', 'DESC']],
            include: [{
                model: invoice,
                as: 'invoice'
            }]

        }).then(users => {
            return res.status(200).json({
                users
            })
        }).catch(err => {
            return res.status(400).json({ err })
        })
    },
    //add menu
    addMenu: (req, res) => {
        if (req.body.rates != null) {
            Meal.create({
                menu: req.body.menu,
                day: req.body.day,
                date: req.body.date,
                week: req.body.week,
            }).then((meal) => {
                meal_rate.create({
                    meal_id: meal.id,
                    rates: req.body.rates
                }).then((meal_rate) => {
                    return res.status(200).json({
                        "message": "Menu is created successfully",
                        meal, meal_rate,
                        status:true,
                    })
                }).catch(err => {
                    if (err.name === 'SequelizeValidationError') {
                        return res.status(200).json({
                            status: false,
                            msg: err.errors.map(e => e.message)
                        })
                    } else {
                        return res.status(400).json({ err })
                    }
                })
            }).catch(err => {
                if (err.name === 'SequelizeValidationError') {
                    return res.status(200).json({
                        status: false,
                        msg: err.errors.map(e => e.message)
                    })
                } else {
                    return res.status(400).json({ err })
                }
            })
        } else {
            return res.status(200).json({ 
                message: 'Rate field is required',                    
            status:false,
        });

        }
    },
    //Delete Menu
    deleteMenuById: (req, res) => {
        let id = req.params.id
        meal_rate.destroy({
            where: {
                meal_id: id
            }
        }).then(() => {
            Meal.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                return res.status(200).json({
                    status: true,
                    message: "Requested Menu is deleted"
                })
            }).catch(err => {
                return res.status(400).json({
                    err,
                    status:false,
                })
            })
        }).catch(err => {
            return res.status(400).json({
                err,
                status:false,

            })
        })
    },
    //Update Menu
    updateMenuById: (req, res) => {
        let menu = req.body.menu
        let day = req.body.day
        let id = req.params.id
        let date = req.body.date
        let week = req.body.week
        var values = { menu: menu, day: day, date: date, week: week };
        var selector = {
            where: { id: id }
        };
        Meal.update(values, selector)
            .then(() => {
                return res.status(200).json({
                    "message": "Meal is updated successfully",
                })
            }).catch(error => {
                return res.status(400).json({
                    "error": error
                })
            })
    },
    // get all meal
    getAllMeal: (req, res) => {
        Meal.findAll({
            attributes: ['menu', 'day', 'date', 'week'],
            order: [['id', 'DESC']],
            include: [{
                model: meal_rate,
                as: 'rate'
            }]
        }).then(meal => {
            return res.status(200).json({
                meal
            })
        }).catch(err => {
            return res.status(400).json({ err })
        })
    },
    //update menu rates by id
    updateRateById: (req, res) => {
        let mealId = req.params.mealId
        var values = { rates: req.body.rates };
        var selector = {
            where: { meal_id: mealId }
        };
        meal_rate.update(values, selector)
            .then(() => {
                return res.status(200).json({
                    "message": "Meal rates are updated successfully",
                })
            }).catch(error => {
                return res.status(400).json({
                    "error": error
                })
            })
    },

    //add payment variations
    addPayementVariation: (req, res) => {
        payment_variation.create({
            type: req.body.type,
            amount: req.body.amount,
        }).then((type) => {
            return res.status(200).json({
                message: "Payment variation is added successfully",
                type,
                status:true,

            })
        }).catch(err => {
            if (err.name === 'SequelizeValidationError') {
                return res.status(200).json({
                    status: false,
                    msg: err.errors.map(e => e.message)
                })
            } else {
                return res.status(400).json({ err })
            }
        })
    },

      // get payment variations
    getPayVary: (req, res) => {
        payment_variation.findAll({
            attributes: ['type', 'amount'],
            order: [['id', 'DESC']],
        
        }).then(pay => {
            return res.status(200).json({
                pay
            })
        }).catch(err => {
            return res.status(400).json({ err })
        })
    },
      //update menu rates by id
    updateRateById: (req, res) => {
        let mealId = req.params.mealId
        var values = { rates: req.body.rates };
        var selector = {
            where: { meal_id: mealId }
        };
        meal_rate.update(values, selector)
            .then(() => {
                return res.status(200).json({
                    "message": "Meal rates are updated successfully",
                })
            }).catch(error => {
                return res.status(400).json({
                    "error": error
                })
            })
    },

      // get payment variation rates by type
      getPayVaryRate: (req, res) => {
        payment_variation.findOne({
            where: { type: req.body.type }
        }).then(pay => {
            return res.status(200).json({
                pay
            })
        }).catch(err => {
            return res.status(400).json({ err })
        })
    },
    //update variation rates by type
      updateRateByType: (req, res) => {
        let type = req.body.type
        var values = { amount: req.body.amount };
        var selector = {
            where: { type: type }
        };
        payment_variation.update(values, selector)
            .then(() => {
                return res.status(200).json({
                    message: "Rates are updated successfully",
                    status:true
                })
            }).catch(error => {
                return res.status(400).json({
                    error: error,
                    status:false
                })
            })
    },

     // get user invoice
     getUserInvoice: (req, res) => {
        invoice.findAll({
            attributes: ['plan', 'status', 'createdAt'],
            where: { user_id: req.body.userId },
            order: [['id', 'DESC']],

        }).then(invoices => {
            return res.status(200).json({
                invoices
            })
        }).catch(err => {
            return res.status(400).json({ err })
        })
    },
}