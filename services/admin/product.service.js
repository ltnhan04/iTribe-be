const { deleteImage } = require("../../helpers/cloudinary.helper");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");

class ProductService {
  static handleGetProducts = async () => {
    const products = await Product.find({}).populate("variants");

    if (!products.length) {
      throw new AppError("No products found", 404);
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
    return data;
  };
  static handleGetProductDetails = async (id) => {
    const product = await Product.findById(id).populate({
      path: "variants",
      populate: { path: "reviews", model: "Review" },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
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
    return product;
  };

  static handleCreateProduct = async (description, name, slug) => {
    const product = new Product({
      description,
      name,
      slug,
      image: [],
    });

    const savedProduct = await product.save();
    if (!savedProduct) {
      throw new AppError("Failed to create product", 400);
    }
    return savedProduct;
  };

  static handleUpdateProduct = async (id, updates) => {
    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true }
    );
    return updatedProduct;
  };

  static handleDeleteProduct = async (id) => {
    await ProductVariant.deleteMany({ productId: id });

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await deleteImage(product.image);
    return product;
  };
}

module.exports = ProductService;
