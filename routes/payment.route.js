const router = require("express").Router();
const { createCheckoutSession } = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

module.exports = router;
