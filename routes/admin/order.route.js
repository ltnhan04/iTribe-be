const router = require("express").Router();
const {
  getPaginatedOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../../controllers/admin/order.controller");
const { verifyAdmin } = require("../../middleware/auth.middleware");

router.get("/", verifyAdmin, getAllOrders);
router.get("/paginate", verifyAdmin, getPaginatedOrder);
router.put("/:orderId", verifyAdmin, updateOrderStatus);
router.delete("/:orderId", verifyAdmin, deleteOrder);
module.exports = router;
