const Order = require("../models/order.model");
const User = require("../models/user.model");
const ProductVariant = require("../models/productVariant.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res) => {
  try {
    const { productVariants, totalAmount, shippingAddress, paymentMethod } =
      req.body;

    if (!productVariants || !productVariants.length) {
      return res.status(400).json({ message: "Product variants are required" });
    }

    const order = new Order({
      user: req.user?._id,
      productVariants,
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

    res
      .status(201)
      .json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    console.log("Error in createOrder controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name")
      .populate({
        path: "productVariants.productVariant",
        select:
          "name color.colorName color.colorCode storage price stock slug images",
      });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    const response = orders.map((order) => ({
      orderId: order._id,
      user: { id: order.user._id, name: order.user.name },
      products: order.productVariants
        .filter((item) => item.productVariant !== null)
        .map((item) => ({
          productId: item.productVariant._id,
          productName: item.productVariant.name,
          productColor: item.productVariant.color.colorName,
          productColorCode: item.productVariant.color.colorCode,
          productStorage: item.productVariant.storage,
          productPrice: item.productVariant.price,
          productStock: item.productVariant.stock,
          productSlug: item.productVariant.slug,
          productImages: item.productVariant.images,
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
      .populate(
        "productVariants.productVariant",
        "name color.colorName color.colorCode storage price stock slug images"
      );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending" && order.status !== "processing") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    for (const item of order.productVariants) {
      const productVariant = await ProductVariant.findById(
        item.productVariant._id
      );
      if (productVariant) {
        productVariant.stock += item.quantity;
        await productVariant.save();
      }
    }

    order.status = "cancel";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error in cancelOrder controller:", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const updateOrderPayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({ message: "Missing sessionId or orderId" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "processing";
    order.stripeSessionId = session.id;

    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Error in updateOrderAfterPayment controller:",
      error.message
    );
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrdersByUser,
  cancelOrder,
  updateOrderPayment,
};
