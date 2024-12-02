const User = require("../../models/user.model");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");

class CustomerService {
  static handleGetPaginatedCustomer = async (page, limit) => {
    const skip = (page - 1) * limit;
    const customer = await User.find({}).skip(skip).limit(parseInt(limit));
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    return customer;
  };

  static handleGetCustomers = async () => {
    const customers = await User.find({});
    if (!customers) {
      throw new AppError("No customers found", 404);
    }
    return customers;
  };

  static handleGetCustomer = async (id) => {
    const customer = await User.findById(id).select("-password");
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    return customer;
  };

  static handleGetCustomerOrder = async (id) => {
    const customer = await User.findById(id).populate({
      path: "orderHistory",
      populate: {
        path: "productVariants.productVariant",
        select: "name price color storage",
      },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    if (!customer.orderHistory || customer.orderHistory.length === 0) {
      throw new AppError("No order found", 404);
    }
    return customer.orderHistory;
  };

  static handleGetOrderDetails = async (id) => {
    const productVariant = await ProductVariant.findById(id);
    if (!productVariant) {
      throw new AppError("No product found", 404);
    }
    return productVariant;
  };

  static handleBanCustomer = async (id) => {
    const customer = await User.findById(id);
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    customer.active = false;
    await customer.save();
    return customer;
  };

  static handleUnbanCustomer = async (id) => {
    const customer = await User.findById(id);
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    customer.active = true;
    await customer.save();
    return customer;
  };
}

module.exports = CustomerService;
