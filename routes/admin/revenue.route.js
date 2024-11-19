const router = require("express").Router();
const {
  revenueADay,
  calculateTotalRevenue,
  revenueByProduct
} = require("../../controllers/admin/revenue.controller");

const { verifyAdmin } = require("../../middleware/auth.middleware");

router.get("/day", revenueADay);
router.get("/total", calculateTotalRevenue);
router.get("/product", revenueByProduct);
module.exports = router;
