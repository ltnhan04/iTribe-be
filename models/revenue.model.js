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
    productVariants: [
      {
        productVariant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
        },
        totalSales: {
          type: Number,
          default: 0,
        },
        totalOrders: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Revenue", revenueSchema);
