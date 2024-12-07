const Order = require("../../models/order.model");
const Revenue = require("../../models/revenue.model");
const AppError = require("../../helpers/appError.helper");

class RevenueService {
  static handleRevenueADay = async () => {
    const today = new Date();
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          },
          status: "delivered",
        },
      },
      {
        $unwind: "$productVariants",
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "productVariants.productVariant",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productVariants.productVariant",
          name: { $first: "$productDetails.name" },
          totalSales: {
            $sum: { $multiply: ["$productVariants.quantity", "$totalAmount"] },
          },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    if (result.length > 0) {
      const revenue = new Revenue({
        date: new Date(),
        totalSales: result.reduce((acc, curr) => acc + curr.totalSales, 0),
        totalOrders: result.reduce((acc, curr) => acc + curr.totalOrders, 0),
        productVariants: result.map((item) => ({
          productVariant: item._id,
          name: item.name,
          totalSales: item.totalSales,
          totalOrders: item.totalOrders,
        })),
      });
      const savedRevenue = await revenue.save();
      return savedRevenue;
    } else {
      throw new AppError("No delivered orders found for today", 404);
    }
  };

  static handleRevenueLastDays = async (days) => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days, 10));

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: daysAgo,
            $lt: new Date(),
          },
          status: "delivered",
        },
      },
      {
        $unwind: "$productVariants",
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "productVariants.productVariant",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productVariants.productVariant",
          name: { $first: "$productDetails.name" },
          totalSales: {
            $sum: { $multiply: ["$productVariants.quantity", "$totalAmount"] },
          },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    if (result.length > 0) {
      const totalSales = result.reduce((acc, curr) => acc + curr.totalSales, 0);
      const totalOrders = result.reduce(
        (acc, curr) => acc + curr.totalOrders,
        0
      );
      return {
        message: `Revenue for the last ${days} days retrieved successfully`,
        totalSales,
        totalOrders,
        details: result.map((item) => ({
          productVariant: item._id,
          name: item.name,
          totalSales: item.totalSales,
          totalOrders: item.totalOrders,
        })),
      };
    } else {
      throw new AppError(
        `No revenue data found for the last ${days} days`,
        404
      );
    }
  };

  static handleCalculateTotalRevenue = async () => {
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $unwind: "$productVariants",
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "productVariants.productVariant",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productVariants.productVariant",
          name: { $first: "$productDetails.name" },
          totalSales: {
            $sum: { $multiply: ["$productVariants.quantity", "$totalAmount"] },
          },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalSales = result.reduce((acc, curr) => acc + curr.totalSales, 0);
    const totalOrders = result.reduce((acc, curr) => acc + curr.totalOrders, 0);

    return {
      totalSales,
      totalOrders,
      details: result.map((item) => ({
        productVariant: item._id,
        name: item.name,
        totalSales: item.totalSales,
        totalOrders: item.totalOrders,
      })),
    };
  };

  static handleRevenueByProduct = async () => {
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $unwind: "$productVariants",
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "productVariants.productVariant",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productVariants.productVariant",
          name: { $first: "$productDetails.name" },
          totalSales: {
            $sum: { $multiply: ["$productVariants.quantity", "$totalAmount"] },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { totalSales: -1 },
      },
    ]);

    if (result.length > 0) {
      return { message: "Revenue by product retrieved successfully", result };
    } else {
      throw new AppError("No revenue data found for products", 404);
    }
  };
}

module.exports = RevenueService;
