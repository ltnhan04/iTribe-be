const Review = require("../models/reviews.model");
const ProductVariant = require("../models/productVariant.model");
const ReviewService = require("../services/customer/review.service");

const getReviews = async (_, res, next) => {
  try {
    const reviews = await ReviewService.handleGetReview();
    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    next(error);
  }
};
const createReview = async (req, res, next) => {
  try {
    const { productVariantId, rating, comment, isAnonymous } = req.body;
    const userId = req.user._id;

    const savedReview = await ReviewService.handleCreateReview(
      productVariantId,
      rating,
      comment,
      isAnonymous,
      userId
    );

    res
      .status(201)
      .json({ message: "Review created successfully", review: savedReview });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, isAnonymous } = req.body;

    const updatedReview = await ReviewService.handleUpdateReview(
      id,
      req.user._id,
      rating,
      comment,
      isAnonymous
    );

    res
      .status(200)
      .json({ message: "Review updated successfully", review: updatedReview });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedReview = await ReviewService.handleDeleteReview(
      id,
      req.user._id
    );

    res
      .status(200)
      .json({ message: "Review deleted successfully", review: deletedReview });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
