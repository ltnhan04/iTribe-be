const mongoose = require("mongoose");
const Order = require("../../models/order.model");
const Revenue = require("../../models/revenue.model");

Date.prototype.getWeek = function () {
  const date = new Date(this.valueOf());
  date.setHours(0, 0, 0, 0); 
  date.setDate(date.getDate() + 4 - (date.getDay() || 7)); // Đặt lại ngày để xác định thứ 5 của tuần
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7); 
};

const revenueADay = async (req, res) => {
  try {
    const today = new Date();
    const result = await Order.aggregate([
      {
        $match: { // Sử dụng $match
          createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          },
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
    if (result.length > 0) {
      const { totalSales, totalOrders } = result[0];
      const revenue = new Revenue({
        date: new Date(),
        totalSales: totalSales || 0,
        totalOrders: totalOrders || 0,
        week: today.getWeek(), 
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      });
      await revenue.save();
      res.status(200).json({ message: "Revenue created successfully", revenue });
    } else {
      res.status(404).json({ message: "No delivered orders found for today" });
    }
  } catch (error) {
    console.log("Error in revenueADay controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const revenueAWeek = async (_, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
    res.status(200).json({ result });
  } catch (error) {
    console.log("Error in revenueAWeek controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const revenueAYear = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
        },
      },
    ]);
    res.status(200).json({ result });
  } catch (error) {
    console.log("Error in revenueAYear controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const calculateTotalRevenue = async (req, res) => {
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

module.exports = {
  revenueADay,
  revenueAWeek,
  revenueAYear,
  calculateTotalRevenue,
};
