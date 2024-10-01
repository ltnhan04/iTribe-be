const { uploadImage, deleteImage } = require("../../services/upload.services");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");
const Review = require("../../models/reviews.model");

const getAllProductsAdmin = async (_, res) => {
  try {
    const products = await Product.find({});

    const data = products.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.images.length > 0 ? product.images[0] : null,
      rating: product.rating,
      status: product.status,
    }));

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
    const product = await Product.findById(id).populate("variants reviews");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error in getProductDetailsAdmin:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, category, slug } = req.body;

  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImage(req.files);
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      images: imageUrls,
      slug,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully!", product });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createProductVariant = async (req, res) => {
  try {
    let imageUrls = [];
    const { productId, color, storage, price, stock } = req.body;

    if (req.files) {
      imageUrls = await uploadImage(req.files);
      console.log(imageUrls);
    }

    const productVariant = new ProductVariant({
      productId,
      color,
      storage,
      price,
      image: imageUrls,
      stock,
    });

    await productVariant.save();

    await Product.findByIdAndUpdate(productId, {
      $push: { variants: productVariant._id },
    });

    res.status(201).json({ message: "Product variant created successfully!" });
  } catch (error) {
    console.log("Error in createProductVariant controller", error.message);
    res.status(500).json({ message: "Server Error!" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Updated successfully", product });
  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
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
    if (req.files && req.files.length > 0) {
      await deleteImage(productVariant.image);
      imageUrls = await uploadImage(req.files);
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
    console.error("Error in updateProductVariant:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

    await deleteImage(product.images);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const deleteProductVariant = async (req, res) => {
  const { variantId, productId } = req.params;
  try {
    const productVariant = await ProductVariant.findByIdAndDelete(variantId);

    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

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
  getAllProductsAdmin,
  getProductDetailsAdmin,
  updateProductVariant,
  deleteProductVariant,
  createProduct,
  createProductVariant,
  updateProduct,
  deleteProduct,
};
