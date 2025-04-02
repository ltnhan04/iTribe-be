const express = require("express");
const router = express.Router();
const pointController = require("../../controllers/customer/point.controller");
const { verifyToken } = require("../../middleware/auth.middleware");

router.get("/points", verifyToken, pointController.getCustomerPoints);
router.post(
  "/exchange-voucher",
  verifyToken,
  pointController.exchangePointsForVoucher
);
router.get("/vouchers", verifyToken, pointController.getCustomerVouchers);

module.exports = router;
