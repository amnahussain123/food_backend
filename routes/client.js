const { verifySignUp, authJwt } = require("../middleware");
const headerMiddleware = require("../middleware/header");
const express = require('express')
const router = express.Router()
const { signUp, signIn, updateSignUp, listOfMenu, subscription, paymentVary, uploadInvoice } = require('../controllers/client')

// -------------------------CUSTOM ROUTE-------------------------
//Clients
router.use(headerMiddleware.header);
router.post("/sign-up", [verifySignUp.checkDuplicateEmail], signUp);
router.post("/sign-in", [verifySignUp.checkUser], signIn);
router.get("/get-menu", [authJwt.verifyToken], listOfMenu);

//Client profile
router.put("/update-profile/:id", [authJwt.verifyToken, verifySignUp.updateEmail], updateSignUp);
router.put("/subscription", [authJwt.verifyToken], subscription);
router.put("/payment-vary", [authJwt.verifyToken], paymentVary);
router.put("/upload-invoice",[authJwt.verifyToken], uploadInvoice);

// -------------------------EXPORT ROUTER-------------------------
module.exports = router