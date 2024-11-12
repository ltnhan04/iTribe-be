const Product = require("../models/product.model");
const ProductVariant = require("../models/productVariant.model");

const getAllProductsUser = async (_, res) => {
  try {
    const products = await Product.find({}).populate("variants");

    const data = await Promise.all(
      products.map(async (product) => {
        const firstVariant = await ProductVariant.findOne({
          productId: product._id,
        });

        const price = firstVariant ? firstVariant.price : 0;
        const firstImage =
          firstVariant?.images?.length > 0 ? firstVariant.images[0] : null;

        return {
          _id: product._id,
          price,
          name: product.name,
          colors: [
            ...new Set(product.variants.map((variant) => variant.color)),
          ],
          storages: [
            ...new Set(product.variants.map((variant) => variant.storage)),
          ],
          image:
            firstImage ||
            (product.image && product.image.length > 0
              ? product.image[0]
              : null),
          status: product.status,
          slug: product.slug,
        };
      })
    );

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
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id).populate({
      path: "variants",
      populate: {
        path: "reviews",
        model: "Review",
        populate: {
          path: "user",
          model: "User",
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
          images: 1,
          _id: 1,
          price: 1,
          name: 1,
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
const getProductByName = async (req, res) => {
  let { name } = req.params;
  name = name.trim();

  try {
    const products = await Product.find({
      name: new RegExp(`^${name}$`, "i"),
    }).populate("variants");

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const data = await Promise.all(
      products.map(async (product) => {
        const firstVariant = await ProductVariant.findOne({
          productId: product._id,
        });

        const price = firstVariant ? firstVariant.price : 0;
        const firstImage =
          firstVariant?.images?.length > 0 ? firstVariant.images[0] : null;

        return {
          _id: product._id,
          price,
          name: product.name,
          colors: [
            ...new Set(product.variants.map((variant) => variant.color)),
          ],
          storages: [
            ...new Set(product.variants.map((variant) => variant.storage)),
          ],
          image:
            firstImage ||
            (product.image && product.image.length > 0
              ? product.image[0]
              : null),
          status: product.status,
          slug: product.slug,
        };
      })
    );

    res.status(200).json({ data });
  } catch (error) {
    console.log("Error in getProductByName controller", error.message);
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
  getProductByName,
  getRecommendedProducts,
  searchProducts,
  getProductByPriceRange,
  getProductsByRating,
  getPaginatedProducts,
};
