const { transporter } = require("../email/key");
const User = require("../models").User
const payment_variation = require("../models").payment_variation
const invoice = require("../models").invoice
module.exports = {
    job: (req, res) => {
        User.findAll({
           where:{role:'CLIENT'},
           order: [['id', 'DESC']],
            include: [{
                model: invoice,
                as: 'invoice'
            }]
        }).then(meal => {
            meal.forEach(function (to, i , array) {
                payment_variation.findOne({
                    where: { type: array[i].invoice[i].plan }
                }).then(data=>{
                    if(array[i].invoice[i].status === 'UNPAID'){
                        let mailOptions = {
                            to: array[i].email,
                            subject: "Invoice",
                            html: "<p>Your "+array[i].invoice[i].plan+ "subscription amount is "+data.amount+". Please pay your bill.</p>"
                        }
                        
                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                console.log("error occurred", err)
                            } else {
                                console.log("email sent", info)
                            }
                        })
                    }
                })
            });
         
        }).catch(error => {
            return res.status(400).json({
                "error": error
            })
        })
    },
}

