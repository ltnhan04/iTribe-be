const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");
const stripe = require("../../libs/stripe");
const PointService = require("./point.service");
const { sendOrderConfirmationEmail } = require("../nodemailer/email.service");

class OrderService {
  static handleCreateOrder = async ({
    user,
    productVariants,
    totalAmount,
    shippingAddress,
    paymentMethod,
  }) => {
    if (!productVariants || !productVariants.length) {
      throw new AppError("Product variants are required", 400);
    }
    const order = await Order.create({
      user,
      productVariants,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    const savedOrder = await order.save();
    if (!savedOrder) {
      throw new AppError("Failed to create order", 400);
    }

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $push: { orderHistory: savedOrder._id },
      }
    );

    return savedOrder;
  };

  static handleGetOrderUser = async (id) => {
    const orders = await Order.find({ user: id })
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "productVariants.productVariant",
        select: "name color colorName colorCode storage price stock images",
      })
      .lean();

    if (!orders.length) {
      throw new AppError("No orders found", 404);
    }
    return orders;
  };

  static handleCancelOrder = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "pending" && order.status !== "processing") {
      throw new AppError("Order cannot be cancelled", 400);
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
    const savedOrder = await order.save();
    return { message: "Order cancelled successfully", savedOrder };
  };

  static handleUpdateOrderPayment = async (sessionId, orderId) => {
    if (!sessionId || !orderId) {
      throw new AppError("Missing sessionId or orderId", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      throw new AppError("Payment not successful", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    order.status = "processing";
    order.stripeSessionId = session.id;

    const updatedOrder = await order.save();

    return { message: "Order updated successfully", updatedOrder };
  };

  static async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findById(orderId)
        .populate({
          path: "productVariants.productVariant",
          select: "name price"
        })
        .populate("user", "name email");

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      order.status = status;
      await order.save();

      // Tích điểm và gửi email khi đơn hàng hoàn thành
      if (status === "completed") {
        // Tích điểm
        await PointService.addPointsForOrder(order);

        // Gửi email xác nhận
        await sendOrderConfirmationEmail(order, order.user);
      }

      return order;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
}

module.exports = OrderService;
