const Promotion = require("../../models/promotion.model");
const AppError = require("../../helpers/appError.helper");

class PromotionService {
  static handleApplyPromotion = async (code, totalAmount, userId) => {
    const promotion = await Promotion.findOne({
      code,
    });
    if (!promotion) {
      throw new AppError("Invalid promotion code", 404);
    }

    const currentDate = new Date();

    if (promotion.validFrom > currentDate) {
      throw new AppError("Promotion is not valid", 400);
    }

    if (promotion.validTo < currentDate) {
      throw new AppError("Promotion is expired");
    }
    if (!promotion.isActive) {
      throw new AppError("Promotion is inactive");
    }
    if (totalAmount < promotion.minOrderAmount) {
      throw new AppError(
        `Order must be at least ${promotion.minOrderAmount} to use this promotion`,
        400
      );
    }
    const userUsage = promotion.userUsage.find(
      (usage) => usage.userId === userId
    );
    if (userUsage && userUsage.usageCount >= promotion.maxUsagePerUser) {
      throw new AppError(
        `You can only use this promotion ${promotion.maxUsagePerUser} times`,
        400
      );
    }
    if (promotion.usedCount >= promotion.maxUsage) {
      promotion.isActive = false;
      await promotion.save();
      throw new AppError("Promotion usage limit reached", 400);
    }

    let discountedAmount = totalAmount;
    if (promotion.discountPercentage) {
      discountedAmount =
        totalAmount - totalAmount * (promotion.discountPercentage / 100);
    }
    if (discountedAmount < 0) {
      discountedAmount = 0;
    }
    promotion.usedCount += 1;
    if (userUsage) {
      userUsage.usageCount += 1;
    } else {
      promotion.userUsage.push({ userId, usageCount: 1 });
    }

    await promotion.save();
    return discountedAmount;
  };

  static handleGetActivePromotions = async () => {
    const currentDate = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validTo: { $gte: currentDate },
    }).lean();
    if (!promotions || promotions.length === 0) {
      throw new AppError("No active promotions found", 404);
    }
    return promotions;
  };
}

module.exports = PromotionService;
