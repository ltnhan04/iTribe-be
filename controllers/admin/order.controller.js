const Order = require("../../models/order.model");

const getAllOrders = async (_, res) => {
  try {
    const orders = await Order.find()
      .populate({ path: "user", select: "name email phoneNumber address ", match: { _id: { $ne: null } } })
      .populate("productVariants.productVariant", "name color storage images");

    const filteredOrders = orders.filter(
      (order) =>
        order.user && order.productVariants.every((item) => item.productVariant)
    );

    if (filteredOrders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    const response = filteredOrders.map((order) => ({
      orderId: order._id,
      user: {
        id: order.user._id,
        name: order.user.name,
        email: order.user.email,
        phoneNumber: order.user.phoneNumber,
        address: order.user.address,
      },
      productVariants: order.productVariants.map((item) => ({
        productVariantId: item.productVariant._id,
        productName: item.productVariant.name,
        productColorName: item.productVariant.color?.colorName,
        productColorCode: item.productVariant.color?.colorCode,
        productStorage: item.productVariant.storage,
        quantity: item.quantity,
        productImages: item.productVariant.images,
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

const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Tìm đơn hàng bằng orderId
    const order = await Order.findById(orderId)
      .populate({ path: "user", select: "name email phoneNumber address" }) // Populate thông tin user
      .populate("productVariants.productVariant", "name color storage images"); // Populate thông tin sản phẩm

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Chuẩn bị dữ liệu trả về
    const response = {
      orderId: order._id,
      user: {
        id: order.user._id,
        name: order.user.name,
        email: order.user.email,
        phoneNumber: order.user.phoneNumber,
        address: order.user.address,
      },
      productVariants: order.productVariants.map((item) => ({
        productVariantId: item.productVariant._id,
        productName: item.productVariant.name,
        productColorName: item.productVariant.color?.colorName,
        productColorCode: item.productVariant.color?.colorCode,
        productStorage: item.productVariant.storage,
        quantity: item.quantity,
        productImages: item.productVariant.images,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.status(200).json({ order: response });
  } catch (error) {
    console.log("Error in getOrderDetail controller", error.message);
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


const getPaginatedOrder = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const orders = await Order.find()
      .skip(skip)
      .limit(parseInt(limit))
      .populate({ path: "user", select: "name" })
      .populate("productVariants.productVariant", "name color storage");

    const response = orders.map((order) => ({
      orderId: order._id,
      user: {
        id: order.user._id,
        name: order.user.name,
      },
      productVariants: order.productVariants.map((item) => ({
        productVariantId: item.productVariant._id,
        productName: item.productVariant.name,
        productColorName: item.productVariant.color?.colorName,
        productColorCode: item.productVariant.color?.colorCode,
        productStorage: item.productVariant.storage,
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
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  getPaginatedOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderDetail

};
