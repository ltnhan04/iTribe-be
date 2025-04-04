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
    res
      .status(200)
      .json({ message: "Get customers successfully", data: customers });
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



module.exports = {
  getPaginatedUser,
  getAllUser,
  getUserDetail,
};
