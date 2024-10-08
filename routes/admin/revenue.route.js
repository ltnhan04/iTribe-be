const router = require("express").Router();
const {
  revenueADay,
  revenueAWeek,
  revenueAYear,
  calculateTotalRevenue,
} = require("../../controllers/admin/revenue.controller");

const { verifyAdmin } = require("../../middleware/auth.middleware");

router.get("/day", verifyAdmin, revenueADay);
router.get("/week", verifyAdmin, revenueAWeek);
router.get("/year", verifyAdmin, revenueAYear);
router.get("/total", verifyAdmin, calculateTotalRevenue);
module.exports = router;
