const Order = require("../models/order.model");
const User = require("../models/user.model");

const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod } = req.body;
    if (!products || !products.length) {
      res.status(400).json({ message: "Products are required" });
    }

    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    const savedOrder = await order.save();
    if (!savedOrder) {
      return res.status(400).json({ message: "Failed to create order" });
    }
    await User.updateOne(
      { _id: req.user._id },
      { $push: { orderHistory: savedOrder._id } }
    );
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.log("Error in createOrder controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "products.product"
    );
    if (!orders || !orders.length) {
      res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.log("Error in getOrdersByUser controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "pending" && order.status !== "processing") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.status === "cancel";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.log("Error in cancelOrder controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrdersByUser,
  cancelOrder,
};
