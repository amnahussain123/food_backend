const { verifySignUp, authJwt } = require("../middleware");
const headerMiddleware = require("../middleware/header");
const express = require('express')
const router = express.Router()
const { signUpAdmin, signInAdmin, getAllUsers, addMenu, deleteMenuById, updateMenuById, getAllMeal, updateRateById, addPayementVariation, getPayVary, getPayVaryRate, updateRateByType, getUserInvoice } = require('../controllers/admin')

// -------------------------CUSTOM ROUTE-------------------------
//Admin
router.use(headerMiddleware.header);
router.post("/sign-up", [verifySignUp.checkDuplicateEmail], signUpAdmin);
router.post("/sign-in", signInAdmin);
router.get("/all-clients", [authJwt.verifyToken], getAllUsers);
router.post("/add-menu", [authJwt.verifyToken], addMenu);
router.delete("/del-menu-by-id/:id", [authJwt.verifyToken], deleteMenuById);
router.put("/update-menu-by-id/:id", [authJwt.verifyToken], updateMenuById);
router.put("/update-rate-by-id/:mealId", [authJwt.verifyToken], updateRateById);
router.get("/all-meal", [authJwt.verifyToken], getAllMeal);
router.post("/add-payment-vary", [authJwt.verifyToken], addPayementVariation);
router.get("/all-pay-vary", [authJwt.verifyToken], getPayVary);
router.post("/pay-vary-by-type", [authJwt.verifyToken], getPayVaryRate);
router.put("/update-rate-by-type", [authJwt.verifyToken], updateRateByType);

router.post("/get-user-invoice", [authJwt.verifyToken], getUserInvoice);

// -------------------------EXPORT ROUTER-------------------------
module.exports = router