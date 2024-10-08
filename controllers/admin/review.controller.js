const Review = require("../models/reviews.model");
const Product = require("../models/product.model");
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(400).json({ message: "Failed to delete review" });
    }
    await Product.updateOne(
      { _id: review.productId },
      { $pull: { reviews: id } }
    );
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error in deleteReview controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};
module.exports = { deleteReview };
