const router = require("express").Router();
const {
  getPaginatedOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderDetail,
} = require("../../controllers/admin/order.controller");
const { verifyAdmin } = require("../../middleware/auth.middleware");

router.get("/", getAllOrders);
router.get("/paginate", verifyAdmin, getPaginatedOrder);
router.get("/:orderId", getOrderDetail);
router.put("/:orderId", verifyAdmin, updateOrderStatus);
module.exports = router;
