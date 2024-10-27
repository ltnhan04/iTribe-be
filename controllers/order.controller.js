const Order = require("../models/order.model");
const User = require("../models/user.model");

const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod } = req.body;
    if (!products || !products.length) {
      return res.status(400).json({ message: "Products are required" });
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

    // Lấy lại order đã lưu và thực hiện populate
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("user", "name")
      .populate("products.product", "name color storage");

    await User.updateOne(
      { _id: req.user._id },
      { $push: { orderHistory: savedOrder._id } }
    );

    const response = {
      orderId: populatedOrder._id,
      user: {
        id: populatedOrder.user._id,
        name: populatedOrder.user.name,
      },
      products: populatedOrder.products.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        productColor: item.product.color,
        productStorage: item.product.storage,
        quantity: item.quantity,
      })),
      totalAmount: populatedOrder.totalAmount,
      status: populatedOrder.status,
      shippingAddress: populatedOrder.shippingAddress,
      paymentMethod: populatedOrder.paymentMethod,
      createdAt: populatedOrder.createdAt,
      updatedAt: populatedOrder.updatedAt,
    };

    res.status(201).json({ message: "Order created successfully", order: response });
  } catch (error) {
    console.log("Error in createOrder controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name")
      .populate("products.product", "name color storage");

    if (!orders || !orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    const response = orders.map(order => ({
      orderId: order._id,
      user: { id: order.user._id, name: order.user.name },
      products: order.products.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        productColor: item.product.color,
        productStorage: item.product.storage,
        quantity: item.quantity,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    res.status(200).json({ orders: response });
  } catch (error) {
    console.log("Error in getOrdersByUser controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};


const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name")
      .populate("products.product", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending" && order.status !== "processing") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.status = "cancel";
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name")
      .populate("products.product", "name");

    res.status(200).json({ message: "Order cancelled successfully", order: updatedOrder });
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
