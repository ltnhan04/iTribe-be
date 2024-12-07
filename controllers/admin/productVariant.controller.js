const XLSX = require("xlsx");
const fs = require("fs");
const { uploadImage, deleteImage } = require("../../helpers/cloudinary.helper");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");
const ProductVariantService = require("../../services/admin/productVariant.service");

const getAllProductVariants = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await ProductVariantService.handleGetProductVariants(
      productId
    );

    res.status(200).json({ variants: product });
  } catch (error) {
    next(error);
  }
};

const getProductVariant = async (req, res, next) => {
  const { id } = req.params;
  try {
    const variant = await ProductVariantService.handleGetProductVariant(id);
    res.status(200).json({ variant });
  } catch (error) {
    next(error);
  }
};

const createProductVariant = async (req, res) => {
  try {
    const {
      productId,
      colorName,
      colorCode,
      storage,
      price,
      stock,
      name,
      slug,
    } = req.body;

    const productVariant =
      await ProductVariantService.handleCreateProductVariant(
        productId,
        colorName,
        colorCode,
        storage,
        price,
        stock,
        name,
        slug,
        req.files
      );

    res.status(201).json({
      message: "Product variant created successfully!",
      productVariant,
    });
  } catch (error) {
    console.log("Error in createProductVariant controller:", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const updateProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const {
      existingImages,
      colorName,
      colorCode,
      storage,
      price,
      stock,
      name,
      slug,
      productId,
    } = req.body;

    const updatedProductVariant =
      await ProductVariantService.handleUpdateProductVariant(
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
        req.files
      );

    res.status(200).json({
      message: "Product variant updated successfully",
      productVariant: updatedProductVariant,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductVariant = async (req, res, next) => {
  const { variantId } = req.params;

  try {
    const { message } = await ProductVariantService.handleDeleteProductVariant(
      variantId
    );
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

const importVariantFromExcel = async (req, res, next) => {
  const { productId } = req.body;

  try {
    const savedVariants =
      await ProductVariantService.handleImportVariantFromExcel(
        productId,
        req.file
      );

    res.status(201).json({
      message: "Variants imported successfully!",
      variants: savedVariants,
    });
  } catch (error) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    next(error);
  }
};

module.exports = {
  getAllProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  importVariantFromExcel,
};
