const Review = require("../models/reviews.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment, isAnonymous } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const review = new Review({
      productId,
      user,
      rating,
      comment,
      isAnonymous,
    });
    const savedReview = await review.save();
    if (!savedReview) {
      return res.status(400).json({ message: "Failed to create review" });
    }
    product.reviews.push(savedReview._id);
    await product.save();
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
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        rating,
        comment,
        isAnonymous,
      },
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
    await Product.updateOne({ _id: id }, { $pull: { reviews: id } });
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
  createReview,
  updateReview,
  deleteReview,
};
