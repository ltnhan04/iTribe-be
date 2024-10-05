const router = require("express").Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  createOrder,
  getOrdersByUser,
  cancelOrder,
} = require("../controllers/order.controller");

router.post("/", verifyToken, createOrder),
  router.get("/", verifyToken, getOrdersByUser),
  router.put("/:orderId", verifyToken, cancelOrder);
module.exports = router;
