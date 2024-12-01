const PromotionService = require("../services/customer/promotion.service");

const applyPromotion = async (req, res, next) => {
  try {
    const { code, totalAmount, userId } = req.body;
    const discountedAmount = await PromotionService.handleApplyPromotion(
      code,
      totalAmount,
      userId
    );

    res.status(200).json({
      message: "Promotion applied successfully",
      discountedAmount: discountedAmount,
    });
  } catch (error) {
    next(error);
  }
};

const getActivePromotions = async (_, res, next) => {
  try {
    const promotions = await PromotionService.handleGetActivePromotions();
    res.status(200).json({ promotions });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyPromotion, getActivePromotions };
