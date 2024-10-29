const { uploadImage, deleteImage } = require("../../services/upload.services");
const Product = require("../../models/product.model");
const ProductVariant = require("../../models/productVariant.model");

const getAllProductsAdmin = async (_, res) => {
  try {
    const products = await Product.find({}).populate("reviews");
    if (!products.length) {
      res.status(404).json({ message: "No products found" });
    }
    const data = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0)
          : 0;
      return {
        _id: product._id,
        price: product.price,
        category: product.category,
        image: product.images.length > 0 ? product.images[0] : null,
        rating: avgRating,
        status: product.status,
      };
    });

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
  const { description, price, category, slug } = req.body;

  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImage(req.files);
    }

    const product = new Product({
      description,
      price,
      category,
      images: imageUrls,
      slug,
    });

    const savedProduct = await product.save();
    if (!savedProduct) {
      return res.status(400).json({ message: "Failed to create product" });
    }

    const productData = savedProduct.toObject();
    res
      .status(201)
      .json({ message: "Product created successfully!", product: productData });
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

    let imageUrls = product.images;

    if (req.files && req.files.length > 0) {
      const newImages = await uploadImage(req.files);
      imageUrls = [...imageUrls, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, images: imageUrls },
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

    await deleteImage(product.images);

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
