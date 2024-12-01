const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");

class ProductService {
  static handleGetProducts = async () => {
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

    return data;
  };

  static handleGetProductById = async (id) => {
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
      throw new AppError("Product not found", 404);
    }
    return product;
  };

  static handleGetProductByName = async (name) => {
    const products = await Product.find({
      name: new RegExp(`^${name}$`, "i"),
    }).populate("variants");

    if (products.length === 0) {
      throw new AppError("Product not found", 404);
    }

    const data = await Promise.all(
      products.map(async (product) => {
        const firstVariant = await ProductVariant.findOne({
          productId: product._id,
        });

        const price = firstVariant ? firstVariant.price : 0;
        const firstImage =
          firstVariant.images.length > 0 ? firstVariant.images[0] : null;

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
    return data;
  };

  static handleSearchProducts = async (query) => {
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
      status: "active",
    });
    if (!products || products.length === 0) {
      throw new AppError("Products not found", 404);
    }
    return products;
  };

  static handleGetProductByRange = async (min, max) => {
    const products = await ProductVariant.find({
      price: { $gte: min, $lte: max || Infinity },
    });
    if (!products || products.length === 0) {
      throw new AppError("Products not found", 404);
    }
    return products;
  };

  static handlePaginatedProducts = async (page, limit) => {
    const skip = (page - 1) * limit;
    const products = await Product.find({
      status: "active",
    })
      .skip(skip)
      .limit(parseInt(limit));
    return products;
  };
}

module.exports = ProductService;
