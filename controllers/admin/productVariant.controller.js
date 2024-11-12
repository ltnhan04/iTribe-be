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

    const variantsWithRatings = await ProductVariant.aggregate([
      { $match: { productId: mongoose.Types.ObjectId(productId) } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: { $avg: "$reviews.rating" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
    ]);

    res.status(200).json({ variants: variantsWithRatings });
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
    if (!variantId) {
      return res.status(400).json({ message: "Variant ID is required" });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const productVariant = await ProductVariant.findById(variantId);
      if (!productVariant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      if (productVariant.images) {
        await deleteImage(productVariant.images);
      }
      imageUrls = await uploadImage(req.files);
    }

    const updates = { ...req.body };
    if (imageUrls) updates.images = imageUrls;

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
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
