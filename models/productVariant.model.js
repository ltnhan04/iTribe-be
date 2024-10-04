const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    storage: {
      type: String,
      unique: true,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    image: { type: [String], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);
