const Order = require("../../models/order.model");
const AppError = require("../../helpers/appError.helper");

class OrderService {
  static handleGetOrders = async () => {
    const orders = await Order.find()
      .populate({
        path: "user",
        select: "name email phoneNumber address ",
        match: { _id: { $ne: null } },
      })
      .populate("productVariants.productVariant", "name color storage images");

    const filteredOrders = orders.filter(
      (order) =>
        order.user && order.productVariants.every((item) => item.productVariant)
    );

    if (filteredOrders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    return filteredOrders;
  };

  static handleGetOrderDetail = async (orderId) => {
    const order = await Order.findById(orderId)
      .populate({ path: "user", select: "name email phoneNumber address" })
      .populate("productVariants.productVariant", "name color storage images");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  };

  static handleUpdateOrderStatus = async (orderId, status) => {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancel",
    ];

    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const order = await Order.findById(orderId).populate(
      "productVariants.productVariant"
    );
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const currentStatus = order.status;

    if (["delivered", "cancel"].includes(currentStatus)) {
      throw new AppError(
        "Order cannot be updated from its current status",
        400
      );
    }

    const validTransitions = {
      pending: ["processing", "cancel"],
      processing: ["shipped", "cancel"],
      shipped: ["delivered"],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      throw new AppError(
        `Cannot change status from ${currentStatus} to ${status}`,
        400
      );
    }

    if (currentStatus === "pending" && status === "processing") {
      for (const item of order.productVariants) {
        const productVariant = item.productVariant;
        if (!productVariant) continue;

        const newStock = productVariant.stock - item.quantity;
        if (newStock < 0) {
          throw new AppError(
            `Insufficient stock for product ${productVariant.name}`,
            400
          );
        }

        productVariant.stock = newStock;
        await productVariant.save();
      }
    }

    if (status === "cancel") {
      for (const item of order.productVariants) {
        const productVariant = item.productVariant;
        if (!productVariant) continue;

        productVariant.stock += item.quantity;
        await productVariant.save();
      }
    }

    order.status = status;
    const savedOrder = await order.save();
    if (!savedOrder) {
      throw new AppError("Failed to update order status", 400);
    }
    return savedOrder;
  };

  static handlePaginatedOrder = async (page, limit) => {
    const skip = (page - 1) * limit;
    const orders = await Order.find()
      .skip(skip)
      .limit(parseInt(limit))
      .populate({ path: "user", select: "name" })
      .populate("productVariants.productVariant", "name color storage");

    return orders;
  };
}

module.exports = OrderService;
