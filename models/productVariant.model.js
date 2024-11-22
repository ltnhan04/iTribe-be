const mongoose = require("mongoose");
const Notification = require("./notification.model"); 
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
    rating: {
      type: Number,
      default: 0,
    },
    color: {
      colorName: {
        type: String,
        required: true,
      },
      colorCode: {
        type: String,
        required: true,
      },
    },
    storage: {
      type: String,
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
      required: true,
      unique: true,
    },
    images: { type: [String], required: true },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);
productVariantSchema.post("save", async function (doc) {
  try {
    if (doc.stock < 10) {
      // Create notification when stock is less than 10
      await Notification.create({
        message: `Stock of "${doc.name}" is low.`,
        type: "general",
        productVariantId: doc._id, // Save the product variant ID
      });
      console.log(
        `Notification created: Stock for "${doc.name}" is below 10.`
      );
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
});

module.exports = mongoose.model("ProductVariant", productVariantSchema);