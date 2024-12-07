const PromotionService = require("../../services/admin/promotion.service");

const createPromotion = async (req, res, next) => {
  try {
    const {
      code,
      discountPercentage,
      validFrom,
      validTo,
      maxUsage,
      minOrderAmount,
    } = req.body;
    const savedPromotion = await PromotionService.handleCreatePromotion(
      code,
      discountPercentage,
      validFrom,
      validTo,
      maxUsage,
      minOrderAmount
    );
    res
      .status(201)
      .json({ message: "Promotion created successfully!", savedPromotion });
  } catch (error) {
    next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await PromotionService.handleUpdatePromotion(
      id,
      req.body
    );

    res
      .status(200)
      .json({ message: "Promotion updated successfully", promotion });
  } catch (error) {
    next(error);
  }
};

const getAllPromotions = async (_, res, next) => {
  try {
    const promotions = await PromotionService.handleGetPromotions();
    res.status(200).json({ promotions });
  } catch (error) {
    next(error);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await PromotionService.handleDeletePromotion(id);

    res
      .status(200)
      .json({ message: "Promotion deleted successfully", promotion });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPromotion,
  updatePromotion,
  getAllPromotions,
  deletePromotion,
};
