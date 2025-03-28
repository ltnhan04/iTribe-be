const { deleteImage } = require("../../helpers/cloudinary.helper");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");

class ProductService {
  static handleGetProducts = async () => {
    const products = await Product.find({}).populate({
      path: "variants",
      select: "color storage price stock_quantity images rating"
    });

    if (!products.length) {
      throw new AppError("No products found", 404);
    }

    return products.map(product => {
      const firstVariant = product.variants[0];
      return {
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: firstVariant ? firstVariant.price : 0,
        stock: firstVariant ? firstVariant.stock_quantity : 0,
        rating: firstVariant ? firstVariant.rating : 0,
        image: firstVariant?.images[0] || null,
        variantCount: product.variants.length
      };
    });
  };

  static handleGetProductDetails = async (id) => {
    const product = await Product.findById(id).populate({
      path: "variants",
      populate: {
        path: "reviews",
        populate: {
          path: "user",
          select: "name email"
        }
      }
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Tính toán rating trung bình cho mỗi variant
    product.variants = product.variants.map(variant => {
      if (variant.reviews && variant.reviews.length > 0) {
        const totalRating = variant.reviews.reduce((sum, review) => sum + review.rating, 0);
        variant.rating = (totalRating / variant.reviews.length).toFixed(1);
      }
      return variant;
    });

    return product;
  };

  static handleCreateProduct = async (description, name, category) => {
    const product = new Product({
      description,
      name,
      category
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

    // Nếu có ảnh mới, xóa ảnh cũ
    if (updates.image && product.image) {
      await deleteImage(product.image);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true }
    );
    return updatedProduct;
  };

  static handleDeleteProduct = async (id) => {
    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Xóa tất cả variants của product
    await ProductVariant.deleteMany({ product: id });

    // Xóa ảnh của product nếu có
    if (product.image) {
      await deleteImage(product.image);
    }

    // Xóa product
    await Product.findByIdAndDelete(id);
    return { message: "Product and its variants deleted successfully" };
  };
}

module.exports = ProductService;
