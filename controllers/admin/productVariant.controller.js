const { uploadImage, deleteImage } = require("../../services/upload.services");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");

const getAllProductVariants = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).populate("variants");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ variants: product.variants });
  } catch (error) {
    console.log("Error in getAllProductVariants controller:", error.message);
    res.status(500).json({ message: "Server Error!" });
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

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrls = [];
    if (req.file) {
      imageUrls = await uploadImage(req.file);
    }

    const productVariant = new ProductVariant({
      productId,
      name,
      color: { colorName, colorCode },
      storage,
      price,
      stock,
      slug,
      image: imageUrls,
    });

    const savedProductVariant = await productVariant.save();

    if (!savedProductVariant) {
      return res
        .status(400)
        .json({ message: "Failed to create product variant" });
    }

    product.variants.push(productVariant._id);
    await product.save();

    const productVariantData = savedProductVariant.toObject();

    res.status(201).json({
      message: "Product variant created successfully!",
      productVariant: productVariantData,
    });
  } catch (error) {
    console.log("Error in createProductVariant controller:", error.message);
    res.status(500).json({ message: "Server Error!" });
  }
};

const updateProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    if (!variantId) {
      return res.status(400).json({ message: "Variant ID is required" });
    }

    let imageUrls;
    if (req.file) {
      const productVariant = await ProductVariant.findById(variantId);
      if (!productVariant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      if (productVariant.image) {
        await deleteImage(productVariant.image);
      }
      imageUrls = await uploadImage(req.file);
    }

    const updates = { ...req.body };
    if (imageUrls) updates.image = imageUrls;

    const updatedProductVariant = await ProductVariant.findByIdAndUpdate(
      variantId,
      updates,
      { new: true }
    );

    if (!updatedProductVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    res.status(200).json({
      message: "Product variant updated successfully",
      productVariant: updatedProductVariant,
    });
  } catch (error) {
    console.error("Error in updateProductVariant:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteProductVariant = async (req, res) => {
  const { variantId } = req.params;

  try {
    const productVariant = await ProductVariant.findById(variantId);

    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    const productId = productVariant.productId;

    await ProductVariant.findByIdAndDelete(variantId);
    await Product.findByIdAndUpdate(productId, {
      $pull: { variants: variantId },
    });

    res.status(200).json({ message: "Product variant deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteProductVariant:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
