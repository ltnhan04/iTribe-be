const Order = require("../../models/order.model");

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
};
