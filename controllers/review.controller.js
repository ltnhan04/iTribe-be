const Review = require("../models/reviews.model");
const ProductVariant = require("../models/productVariant.model");
const User = require("../models/user.model");

const getReviews = async (_, res) => {
  try {
    const reviews = await Review.find().populate("user");
    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    console.log("Error in getReviews controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
const createReview = async (req, res) => {
  try {
    const { productVariantId, rating, comment, isAnonymous } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productVariant = await ProductVariant.findById(productVariantId);
    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    const existingReview = await Review.findOne({
      user: userId,
      productId: productVariantId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = new Review({
      productId: productVariantId,
      user: userId,
      rating,
      comment,
      isAnonymous,
    });

    const savedReview = await review.save();
    if (!savedReview) {
      return res.status(400).json({ message: "Failed to create review" });
    }

    productVariant.reviews.push(savedReview._id);
    await productVariant.save();

    res
      .status(201)
      .json({ message: "Review created successfully", review: savedReview });
  } catch (error) {
    console.log("Error in createReview controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, isAnonymous } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own reviews" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, comment, isAnonymous },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    console.log("Error in updateReview controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    await ProductVariant.updateOne(
      { _id: review.productId },
      { $pull: { reviews: id } }
    );

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error in deleteReview controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
