const router = require("express").Router();
const {
  revenueADay,
  calculateTotalRevenue,
  revenueByProduct,
  revenueLastDays,
} = require("../../controllers/admin/revenue.controller");

const { verifyAdmin } = require("../../middleware/auth.middleware");

router.get("/day", verifyAdmin, revenueADay);
router.get("/last/:days", revenueLastDays);
router.get("/total", verifyAdmin, calculateTotalRevenue);
router.get("/product", verifyAdmin, revenueByProduct);
module.exports = router;
