const User = require("../../models/user.model");
const CustomerService = require("../../services/admin/customer.service");

const getPaginatedUser = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const customer = await CustomerService.handleGetPaginatedCustomer(
      page,
      limit
    );
    res.status(200).json({ customers: customer });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (_, res, next) => {
  try {
    const customers = await CustomerService.handleGetCustomers();
    res.status(200).json({ customers });
  } catch (error) {
    next(error);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const customer = await CustomerService.handleGetCustomer(userId);
    res.status(200).json({ customer });
  } catch (error) {
    next(error);
  }
};

const getUserOrder = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const orders = await CustomerService.handleGetCustomerOrder(userId);

    res.status(200).json({ orderHistory: orders });
  } catch (error) {
    next(error);
  }
};

const getUserOrderDetail = async (req, res, next) => {
  try {
    const { productVariantId } = req.params;
    const productVariant = await CustomerService.handleGetOrderDetails(
      productVariantId
    );

    res.status(200).json({ productVariant });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const customer = await CustomerService.handleBanCustomer(userId);

    res
      .status(200)
      .json({ message: "Customer has been banned successfully", customer });
  } catch (error) {
    next(error);
  }
};

const unBanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const customer = await CustomerService.handleUnbanCustomer(userId);

    res
      .status(200)
      .json({ message: "Customer has been unbanned successfully", customer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaginatedUser,
  getAllUser,
  getUserOrder,
  getUserOrderDetail,
  getUserDetail,
  banUser,
  unBanUser,
};
