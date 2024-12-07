const XLSX = require("xlsx");
const fs = require("fs");
const { uploadImage, deleteImage } = require("../../helpers/cloudinary.helper");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");

class ProductVariantService {
  static handleGetProductVariants = async (productId) => {
    const product = await Product.findById(productId).populate("variants");
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  };

  static handleGetProductVariant = async (id) => {
    const variant = await ProductVariant.findById(id).populate({
      path: "reviews",
      populate: { path: "user", select: "name email" },
    });
    console.log(variant);
    if (!variant) {
      throw new AppError("Product variant not found", 404);
    }

    const totalRatings = variant.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      variant.reviews.length > 0
        ? (totalRatings / variant.reviews.length).toFixed(2)
        : 0;

    variant.rating = averageRating;
    return variant;
  };

  static handleCreateProductVariant = async (
    productId,
    colorName,
    colorCode,
    storage,
    price,
    stock,
    name,
    slug,
    files
  ) => {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    let imageUrls = [];
    if (files && files.length > 0) {
      imageUrls = await uploadImage(files);
    }

    const productVariant = new ProductVariant({
      productId,
      name,
      color: { colorName, colorCode },
      storage,
      price,
      stock,
      slug,
      images: imageUrls,
    });

    const savedProductVariant = await productVariant.save();
    if (!savedProductVariant) {
      throw new AppError("Failed to create product variant", 404);
    }

    product.variants.push(savedProductVariant._id);

    if (!product.image && imageUrls.length > 0) {
      product.image = imageUrls[0];
    }
    await product.save();
    return savedProductVariant;
  };

  static handleUpdateProductVariant = async (
    variantId,
    existingImages,
    colorName,
    colorCode,
    storage,
    price,
    stock,
    name,
    slug,
    productId,
    files
  ) => {
    const productVariant = await ProductVariant.findById(variantId);
    if (!productVariant) {
      throw new AppError("Product variant not found", 404);
    }

    const parsedExistingImages = existingImages
      ? JSON.parse(existingImages)
      : [];
    const imagesToDelete = productVariant.images.filter(
      (image) => !parsedExistingImages.includes(image)
    );

    if (imagesToDelete.length > 0) {
      await deleteImage(imagesToDelete);
    }

    let newImages = [];
    if (files && files.length > 0) {
      newImages = await uploadImage(files);
    }

    const updatedImages = [...parsedExistingImages, ...newImages];

    const updates = {
      productId,
      name,
      slug,
      color: { colorName, colorCode },
      storage,
      price: Number(price),
      stock: Number(stock),
      images: updatedImages,
    };

    const updatedProductVariant = await ProductVariant.findByIdAndUpdate(
      variantId,
      updates,
      { new: true }
    );

    if (!updatedProductVariant) {
      throw new AppError("Product variant not found after update", 404);
    }
    return updatedProductVariant;
  };

  static handleDeleteProductVariant = async (variantId) => {
    const productVariant = await ProductVariant.findById(variantId);
    if (!productVariant) {
      throw new AppError("Product variant not found", 404);
    }

    const productId = productVariant.productId;
    const product = await Product.findById(productId);

    await ProductVariant.findByIdAndDelete(variantId);
    await Product.findByIdAndUpdate(productId, {
      $pull: { variants: variantId },
    });

    if (product.image === productVariant.images[0]) {
      const newVariant = await ProductVariant.findOne({ productId });
      if (newVariant && newVariant.images.length > 0) {
        product.image = newVariant.images[0];
      } else {
        product.image = null;
      }
      await product.save();
    }
    return { message: "Product variant deleted successfully!" };
  };

  static handleImportVariantFromExcel = async (productId, file) => {
    if (!file) {
      throw new AppError("No file uploaded", 404);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const variants = sheetData.map((row) => ({
      productId,
      name: row["Name"],
      slug: row["Slug"],
      color: {
        colorName: row["Color Name"],
        colorCode: row["Color Code"],
      },
      storage: row["Storage"],
      price: row["Price"],
      stock: row["Stock"],
      images: row["Image URLs"] ? row["Image URLs"].split(",") : [],
    }));

    const savedVariants = [];
    for (const variant of variants) {
      const productVariant = new ProductVariant(variant);

      const savedVariant = await productVariant.save();
      product.variants.push(savedVariant._id);

      if (!product.image && savedVariant.images.length > 0) {
        product.image = savedVariant.images[0];
      }

      savedVariants.push(savedVariant);
    }

    await product.save();

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("Temporary file deleted:", file.path);
      }
    });
    return savedVariants;
  };
}

module.exports = ProductVariantService;
