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
    const { productId, color, storage, price, stock } = req.body;

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
      color,
      storage,
      price,
      stock,
      image: imageUrls,
    });

    await productVariant.save();

    product.variants.push(productVariant._id);
    await product.save();

    res.status(201).json({ message: "Product variant created successfully!" });
  } catch (error) {
    console.log("Error in createProductVariant controller:", error.message);
    res.status(500).json({ message: "Server Error!" });
  }
};

const updateProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updates = req.body;

    const productVariant = await ProductVariant.findById(variantId);

    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    let imageUrls = productVariant.image;
    if (req.file) {
      if (productVariant.image) {
        await deleteImage(productVariant.image);
      }
      imageUrls = await uploadImage(req.file);
    }

    productVariant.color = updates.color || productVariant.color;
    productVariant.storage = updates.storage || productVariant.storage;
    productVariant.price = updates.price || productVariant.price;
    productVariant.stock = updates.stock || productVariant.stock;
    productVariant.image = imageUrls;

    await productVariant.save();

    res.status(200).json({
      message: "Product variant updated successfully",
      productVariant,
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
