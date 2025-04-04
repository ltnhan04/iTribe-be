const router = require("express").Router();
const {
  revenueADay,
  calculateTotalRevenue,
  revenueByProduct,
  revenueLastDays,
  getRevenueByMonth,
  getRevenueByYear,
  getRevenueByCustomDateRange
} = require("../../controllers/admin/revenue.controller");

const { verifyAdmin } = require("../../middleware/auth.middleware");

router.get("/day", verifyAdmin, revenueADay);
router.get("/last/:days", revenueLastDays);
router.get("/total", verifyAdmin, calculateTotalRevenue);
router.get("/product", verifyAdmin, revenueByProduct);
router.get("/month", verifyAdmin, getRevenueByMonth);
router.get("/year", verifyAdmin, getRevenueByYear);
router.get("/custom", verifyAdmin, getRevenueByCustomDateRange);

module.exports = router;
