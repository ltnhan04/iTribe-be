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
    try {
      // Validate required fields
      if (!productId || !colorName || !colorCode || !storage || !price || !stock || !name || !slug) {
        throw new AppError("All fields are required", 400);
      }

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Check if slug is unique
      const existingVariant = await ProductVariant.findOne({ slug });
      if (existingVariant) {
        throw new AppError("Slug already exists", 400);
      }

      // Upload images
      let imageUrls = [];
      if (files && files.length > 0) {
        imageUrls = await uploadImage(files);
      }
      if (imageUrls.length === 0) {
        throw new AppError("At least one image is required", 400);
      }

      // Create new variant
      const productVariant = new ProductVariant({
        product: productId,
        name,
        color: { 
          colorName, 
          colorCode 
        },
        storage,
        price: Number(price),
        stock_quantity: Number(stock),
        slug,
        images: imageUrls
      });

      const savedProductVariant = await productVariant.save();
      if (!savedProductVariant) {
        throw new AppError("Failed to create product variant", 500);
      }

      // Update product's variants array
      product.variants.push(savedProductVariant._id);

      // Update product's main image if needed
      if (!product.image && imageUrls.length > 0) {
        product.image = imageUrls[0];
      }
      
      await product.save();
      return savedProductVariant;
    } catch (error) {
      // If there's an error, delete uploaded images
      if (files && files.length > 0) {
        try {
          await deleteImage(files.map(file => file.path));
        } catch (deleteError) {
          console.error("Error deleting uploaded images:", deleteError);
        }
      }
      throw error;
    }
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
    try {
      // Validate required fields
      if (!colorName || !colorCode || !storage || !price || !stock || !name || !slug) {
        throw new AppError("All fields are required", 400);
      }

      // Check if variant exists
      const productVariant = await ProductVariant.findById(variantId);
      if (!productVariant) {
        throw new AppError("Product variant not found", 404);
      }

      // Check if new slug is unique (excluding current variant)
      const existingVariant = await ProductVariant.findOne({ 
        slug,
        _id: { $ne: variantId }
      });
      if (existingVariant) {
        throw new AppError("Slug already exists", 400);
      }

      // Handle images
      const parsedExistingImages = existingImages ? JSON.parse(existingImages) : [];
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
      if (updatedImages.length === 0) {
        throw new AppError("At least one image is required", 400);
      }

      // Update variant
      const updates = {
        product: productId,
        name,
        slug,
        color: { colorName, colorCode },
        storage,
        price: Number(price),
        stock_quantity: Number(stock),
        images: updatedImages
      };

      const updatedProductVariant = await ProductVariant.findByIdAndUpdate(
        variantId,
        updates,
        { new: true }
      );

      if (!updatedProductVariant) {
        throw new AppError("Product variant not found after update", 404);
      }

      // Update product's main image if needed
      const product = await Product.findById(productId);
      if (product && product.image === productVariant.images[0]) {
        product.image = updatedImages[0];
        await product.save();
      }

      return updatedProductVariant;
    } catch (error) {
      // If there's an error, delete newly uploaded images
      if (files && files.length > 0) {
        try {
          await deleteImage(files.map(file => file.path));
        } catch (deleteError) {
          console.error("Error deleting uploaded images:", deleteError);
        }
      }
      throw error;
    }
  };

  static handleDeleteProductVariant = async (variantId) => {
    try {
      // Find variant and product
      const productVariant = await ProductVariant.findById(variantId);
      if (!productVariant) {
        throw new AppError("Product variant not found", 404);
      }

      const product = await Product.findById(productVariant.product);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Delete variant's images from cloud storage
      if (productVariant.images && productVariant.images.length > 0) {
        await deleteImage(productVariant.images);
      }

      // Delete variant from database
      await ProductVariant.findByIdAndDelete(variantId);

      // Remove variant from product's variants array
      product.variants = product.variants.filter(
        (id) => id.toString() !== variantId
      );

      // Update product's main image if needed
      if (product.image === productVariant.images[0]) {
        const newVariant = await ProductVariant.findOne({ product: product._id });
        if (newVariant && newVariant.images.length > 0) {
          product.image = newVariant.images[0];
        } else {
          product.image = null;
        }
      }

      await product.save();
      return { message: "Product variant deleted successfully!" };
    } catch (error) {
      throw error;
    }
  };

  static handleImportVariantFromExcel = async (productId, file) => {
    try {
      if (!file) {
        throw new AppError("No file uploaded", 400);
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Validate required fields in Excel data
      const requiredFields = ["Name", "Slug", "Color Name", "Color Code", "Storage", "Price", "Stock"];
      const missingFields = requiredFields.filter(field => !sheetData[0].hasOwnProperty(field));
      if (missingFields.length > 0) {
        throw new AppError(`Missing required fields in Excel: ${missingFields.join(", ")}`, 400);
      }

      const savedVariants = [];
      for (const row of sheetData) {
        // Check if slug is unique
        const existingVariant = await ProductVariant.findOne({ slug: row["Slug"] });
        if (existingVariant) {
          throw new AppError(`Slug already exists: ${row["Slug"]}`, 400);
        }

        // Validate images
        const images = row["Image URLs"] ? row["Image URLs"].split(",") : [];
        if (images.length === 0) {
          throw new AppError(`At least one image is required for variant: ${row["Name"]}`, 400);
        }

        const variant = new ProductVariant({
          product: productId,
          name: row["Name"],
          slug: row["Slug"],
          color: {
            colorName: row["Color Name"],
            colorCode: row["Color Code"]
          },
          storage: row["Storage"],
          price: Number(row["Price"]),
          stock_quantity: Number(row["Stock"]),
          images: images
        });

        const savedVariant = await variant.save();
        product.variants.push(savedVariant._id);

        // Update product's main image if needed
        if (!product.image && savedVariant.images.length > 0) {
          product.image = savedVariant.images[0];
        }

        savedVariants.push(savedVariant);
      }

      await product.save();

      // Clean up temporary file
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Temporary file deleted:", file.path);
        }
      });

      return savedVariants;
    } catch (error) {
      // Clean up temporary file in case of error
      if (file && file.path) {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      throw error;
    }
  };
}

module.exports = ProductVariantService;
