const Product = require("../models/product.model");

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
    const product = await Product.findById(id).populate("variants reviews");
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    console.log("Error in getProductById controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const getRecommendedProducts = async (_, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 8 } },
      {
        $project: {
          name: 1,
          images: 1,
          _id: 1,
          price: 1,
          category: 1,
          rating: 1,
          status: 1,
          variants: 1,
        },
      },
    ]);
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const getProductByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getProductByCategory controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const searchProducts = async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
      status: "active",
    });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in searchProducts controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getProductByPriceRange = async (req, res) => {
  const { min, max } = req.query;
  try {
    const products = await Product.find({
      price: { $gte: min, $lte: max || Infinity },
      status: "active",
    });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getProductByPriceRange controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getProductsByRating = async (req, res) => {
  try {
    const { rating } = req.params;
    const products = await Product.find({
      rating: { $gte: rating },
      status: "active",
    });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getPaginatedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const products = await Product.find({ status: "active" })
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  getAllProductsUser,
  getProductById,
  getProductByCategory,
  getRecommendedProducts,
  searchProducts,
  getProductByPriceRange,
  getProductsByRating,
  getPaginatedProducts,
};
