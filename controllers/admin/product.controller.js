const { uploadImage, deleteImage } = require("../../services/upload.service");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");

const getAllProductsAdmin = async (_, res) => {
  try {
    const products = await Product.find({}).populate("variants");

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    const data = await Promise.all(
      products.map(async (product) => {
        const firstVariant = await ProductVariant.findOne({
          productId: product._id,
        });
        const price = firstVariant ? firstVariant.price : 0;
        const firstProduct = firstVariant ? firstVariant.images[0] : null;
        const newStatus = firstVariant ? "active" : "inactive";

        return {
          _id: product._id,
          name: product.name,
          image: firstProduct,
          price,
          status: newStatus,
        };
      })
    );

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in getAllProductsAdmin:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve products", error: error.message });
  }
};

const getProductDetailsAdmin = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findById(id).populate({
      path: "variants",
      populate: { path: "reviews", model: "Review" },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.variants = product.variants.map((variant) => {
      if (variant.reviews && variant.reviews.length > 0) {
        const totalRating = variant.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        variant.rating = (totalRating / variant.reviews.length).toFixed(1);
      } else {
        variant.rating = 0;
      }
      return variant;
    });

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error in getProductDetailsAdmin:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createProduct = async (req, res) => {
  const { description, name, slug } = req.body;

  try {
    const product = new Product({
      description,
      name,
      slug,
      image: [],
    });

    const savedProduct = await product.save();
    if (!savedProduct) {
      return res.status(400).json({ message: "Failed to create product" });
    }

    res.status(201).json({
      message: "Product created successfully!",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrls = product.image;

    if (req.file) {
      const newImages = await uploadImage(req.file);
      imageUrls = [...imageUrls, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, image: imageUrls },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Updated successfully", product: updatedProduct });
  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ message: "Server Error!" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    await ProductVariant.deleteMany({ productId: id });

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await deleteImage(product.image);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllProductsAdmin,
  getProductDetailsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};
