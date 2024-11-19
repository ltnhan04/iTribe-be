const mongoose = require("mongoose");
const Order = require("../../models/order.model");
const Revenue = require("../../models/revenue.model");

Date.prototype.getWeek = function () {
  const date = new Date(this.valueOf());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7)); // Đặt lại ngày để xác định thứ 5 của tuần
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

const revenueADay = async (req, res) => {
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
          totalSales: { $sum: { $multiply: ["$productVariants.quantity", "$totalAmount"] } },
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
      res.status(200).json({ message: "Revenue created successfully", revenue });
    } else {
      res.status(404).json({ message: "No delivered orders found for today" });
    }
  } catch (error) {
    console.log("Error in revenueADay controller", error.message);
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
const revenueByProduct = async (req, res) => {
  try {
    // Tìm tất cả các đơn hàng đã giao
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered", // Chỉ tính doanh thu từ đơn hàng đã giao
        },
      },
      { 
        $unwind: "$productVariants", // Phân tách sản phẩm trong đơn hàng
      },
      {
        $lookup: {
          from: "productvariants", // Tên collection trong MongoDB
          localField: "productVariants.productVariant", // Trường productVariant trong productVariants của đơn hàng
          foreignField: "_id", // Trường _id trong productvariant collection
          as: "productDetails", // Kết quả nối sẽ được lưu vào mảng productDetails
        },
      },
      {
        $unwind: "$productDetails", // Phân tách dữ liệu từ productDetails để lấy tên sản phẩm
      },
      {
        $group: {
          _id: "$productVariants.productVariant", // Nhóm theo productVariant ID
          name: { $first: "$productDetails.name" }, // Lấy tên sản phẩm từ productDetails
          totalSales: { $sum: { $multiply: ["$productVariants.quantity", "$totalAmount"] } }, // Tổng doanh thu cho sản phẩm
          totalOrders: { $sum: 1 }, // Tổng số lượng đơn hàng cho sản phẩm
        },
      },
      {
        $sort: { totalSales: -1 }, // Sắp xếp theo doanh thu giảm dần
      },
    ]);
    
    // Nếu có kết quả, trả về dữ liệu
    if (result.length > 0) {
      res.status(200).json({ message: "Revenue by product retrieved successfully", result });
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
  calculateTotalRevenue,
  revenueByProduct
};
