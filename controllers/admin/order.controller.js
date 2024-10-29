const Order = require("../../models/order.model");


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name")
      .populate("products.product", "name color storage");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    const response = orders.map(order => ({
      orderId: order._id,
      user: {
        id: order.user._id,
        name: order.user.name,
      },
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
    console.log("Error in getAllOrders controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (
      !["pending", "processing", "shipped", "delivered", "cancel"].includes(
        status
      )
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const savedOrder = await order.save();
    if (!savedOrder) {
      return res.status(400).json({ message: "Failed to update order status" });
    }
    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.log("Error in updateOrderStatus controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.log("Error in deleteOrder controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const getPaginatedOrder = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const orders = await Order.find().skip(skip).limit(parseInt(limit));
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  getPaginatedOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
