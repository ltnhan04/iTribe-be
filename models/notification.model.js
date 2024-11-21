// const mongoose = require("mongoose");
// const notificationSchema = new mongoose.Schema(
//   {
//     message: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ["order", "promotion", "general"],
//       required: true,
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   productVariantId: { // New field for referencing the product variant
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "ProductVariant",
//   },
//   { timestamps: true }
// );
// module.exports = mongoose.model("Notification", notificationSchema);
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "promotion", "general"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    productVariantId: { // New field for referencing the product variant
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
