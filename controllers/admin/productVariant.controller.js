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

    // const variantsWithRatings = await ProductVariant.aggregate([
    //   { $match: { productId: mongoose.Types.ObjectId(productId) } },
    //   {
    //     $lookup: {
    //       from: "reviews",
    //       localField: "_id",
    //       foreignField: "productId",
    //       as: "reviews",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       averageRating: {
    //         $cond: {
    //           if: { $gt: [{ $size: "$reviews" }, 0] },
    //           then: { $avg: "$reviews.rating" },
    //           else: 0,
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       reviews: 0,
    //     },
    //   },
    // ]);

    res.status(200).json({ variants: product });
  } catch (error) {
    console.log("Error in getAllProductVariants controller:", error.message);
    res.status(500).json({ message: "Server Error!" });
  }
};

const getProductVariant = async (req, res) => {
  const { id } = req.params;
  try {
    const variant = await ProductVariant.findById(id).populate({
      path: "reviews",
      populate: { path: "user", select: "name email" },
    });
    if (!variant) {
      return res.status(404).json({ message: "Product variant not found" });
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
    res.status(200).json({ variant });
  } catch (error) {
    console.log("Error in getProductVariant controller:", error.message);
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
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImage(req.files);
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
      return res
        .status(400)
        .json({ message: "Failed to create product variant" });
    }

    product.variants.push(savedProductVariant._id);

    if (!product.image && imageUrls.length > 0) {
      product.image = imageUrls[0];
    }
    await product.save();

    res.status(201).json({
      message: "Product variant created successfully!",
      productVariant: savedProductVariant,
    });
  } catch (error) {
    console.log("Error in createProductVariant controller:", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const updateProductVariant = async (req, res) => {
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

    if (!variantId) {
      return res.status(400).json({ message: "Variant ID is required" });
    }

    const productVariant = await ProductVariant.findById(variantId);
    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
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
    if (req.files && req.files.length > 0) {
      newImages = await uploadImage(req.files);
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
      return res
        .status(404)
        .json({ message: "Product variant not found after update" });
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

    res.status(200).json({ message: "Product variant deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteProductVariant:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
