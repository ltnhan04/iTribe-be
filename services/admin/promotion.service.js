const Promotion = require("../../models/promotion.model");
const AppError = require("../../helpers/appError.helper");

class PromotionService {
  static handleCreatePromotion = async (
    code,
    discountPercentage,
    validFrom,
    validTo,
    maxUsage,
    minOrderAmount
  ) => {
    const existingPromotion = await Promotion.findOne({ code });
    if (existingPromotion) {
      throw new AppError("Promotion code already exists", 400);
    }

    const newPromotion = new Promotion({
      code,
      discountPercentage,
      validFrom,
      validTo,
      maxUsage,
      minOrderAmount,
    });

    const savedPromotion = await newPromotion.save();
    return savedPromotion;
  };

  static handleUpdatePromotion = async (id, updates) => {
    const promotion = await Promotion.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    return promotion;
  };

  static handleGetPromotions = async () => {
    const promotions = await Promotion.find({});
    return promotions;
  };

  static handleDeletePromotion = async (id) => {
    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    return promotion;
  };
}

module.exports = PromotionService;
