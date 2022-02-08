const express = require('express');
const bodyParser = require('body-parser');
const cron = require("node-cron");
const job= require("./jobs").job;

// router import
const client = require('./routes/client')
const admin = require('./routes/admin')

const app = express();
const cors = require('cors');
app.use(cors({
  origin: '*'
}))
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routing
app.use('/api', client)
app.use('/admin/api', admin)

// cron.schedule("* * * * *", () => {
//   console.log("sending email")
//   job();

// })
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});