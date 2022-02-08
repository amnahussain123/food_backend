const db = require("../models");
const User = db.user;
checkDuplicateEmail = (req, res, next) => {
  // Email
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    if (req.body.name == '' || req.body.email == '' || req.body.password == '') {
      res.status(200).send({
        message: "Failed! Name, Email & Password fields are required!",
        status:false
      });
      return;
    } else if (user) {
      res.status(200).send({
        message: "Failed! Email is already in use!",
        status:false
      });
      return;
    } else
      next();
  });
};
updateEmail = (req, res, next) => {
  // Email
  User.count({
    where: {
      email: req.body.email
    }
  }).then(user => {
    if (user > 1) {
      res.status(200).json({message: "Failed! Email is already in use!", status:false})
      return;
    } else if (req.body.email == '') {
      
      res.status(200).send({
        message: "Failed! Email field is required!",
        status:false
      });
      return;
    }
    next();
  });
};
checkUser = (req, res, next) => {
  // Email
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    if (req.body.email == '' || req.body.password == '') {
      res.status(200).send({
        message: "Failed! Email & Password fields are required!",
        status:false
      });
      return;
    }
    else if(user === null){
      res.status(200).send({
        message: "Either Email or password is invalid",
        status:false
      })
    }
    else if (user['role'] == 'ADMIN') {
      res.status(200).send({
        message: "Unauthorized Access!",
        status:false
      });
      return;
    } else
      next();
  });
};
const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  updateEmail: updateEmail,
  checkUser: checkUser
};
module.exports = verifySignUp;