const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalSales: {
      type: Number,
      required: true,
    },
    totalOrders: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Revenue", revenueSchema);
