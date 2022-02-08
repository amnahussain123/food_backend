var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amna.hussain@invozone.com',
      pass: 'dlfiomgmjfpmxdpe'
    }
  });
  module.exports = { transporter };