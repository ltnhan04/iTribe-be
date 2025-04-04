const OrderService = require("../../services/admin/order.service");

const getAllOrders = async (_, res, next) => {
  try {
    const orders = await OrderService.handleGetOrders();
    res.status(200).json({ message: "Get orders successfully", data: orders });
  } catch (error) {
    next(error);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.handleGetOrderDetail(orderId);
    res
      .status(200)
      .json({ message: "Get order details successfully", data: order });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const savedOrder = await OrderService.handleUpdateOrderStatus(
      orderId,
      status
    );
    res.status(200).json({
      message: "Order status updated successfully",
      order: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getPaginatedOrder = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await OrderService.handlePaginatedOrder(page, limit);
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaginatedOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderDetail,
};
