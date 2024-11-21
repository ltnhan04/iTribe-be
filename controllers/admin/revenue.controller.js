const Order = require("../../models/order.model");
const Revenue = require("../../models/revenue.model");

Date.prototype.getWeek = function () {
  const date = new Date(this.valueOf());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

const revenueADay = async (_, res) => {
  try {
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
        $group: {
          _id: "$productVariants.productVariant",
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
        week: today.getWeek(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        productVariants: result.map((item) => ({
          productVariant: item._id,
          totalSales: item.totalSales,
          totalOrders: item.totalOrders,
        })),
      });
      await revenue.save();
      res
        .status(200)
        .json({ message: "Revenue created successfully", revenue });
    } else {
      res.status(404).json({ message: "No delivered orders found for today" });
    }
  } catch (error) {
    console.log("Error in revenueADay controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const revenueLastDays = async (req, res) => {
  try {
    const { days } = req.params;
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
        $group: {
          _id: "$productVariants.productVariant",
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
      res.status(200).json({
        message: `Revenue for the last ${days} days retrieved successfully`,
        totalSales,
        totalOrders,
        details: result,
      });
    } else {
      res
        .status(404)
        .json({ message: `No revenue data found for the last ${days} days` });
    }
  } catch (error) {
    console.log("Error in revenueLastDays controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const calculateTotalRevenue = async (_, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ result });
  } catch (error) {
    console.log("Error in calculateTotalRevenue controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const revenueByProduct = async (_, res) => {
  try {
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
      res
        .status(200)
        .json({ message: "Revenue by product retrieved successfully", result });
    } else {
      res.status(404).json({ message: "No revenue data found for products" });
    }
  } catch (error) {
    console.log("Error in revenueByProduct controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  revenueADay,
  revenueLastDays,
  calculateTotalRevenue,
  revenueByProduct,
};
