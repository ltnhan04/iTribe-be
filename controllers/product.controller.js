const Product = require("../models/product.model");
const ProductVariant = require("../models/productVariant.model");

const getAllProductsUser = async (_, res) => {
  try {
    const products = await Product.find({ status: "active" }).populate(
      "variants",
      "reviews"
    );
    const data = products.map((product) => ({
      _id: product._id,
      price: product.price,
      name: product.name,
      category: product.category,
      image: product.images.length > 0 ? product.images[0] : null,
      rating: product.rating,
      status: product.status,
    }));
    res.status(200).json({ data });
  } catch (error) {
    console.log("Error in getAllProductsUser controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
    }
    const product = await Product.findById(id).populate("variants", "reviews");
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    console.log("Error in getProductById controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getProductVariantById = async (req, res) => {
  try {
    const { id } = req.params;
    const productVariant = await ProductVariant.findById(id).populate(
      "productId"
    );
    if (!productVariant) {
      res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ productVariant });
  } catch (error) {
    console.log("Error in getProductVariantById controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
module.exports = {
  getAllProductsUser,
  getProductById,
  getProductVariantById,
};
