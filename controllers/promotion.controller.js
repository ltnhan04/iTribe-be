const Promotion = require("../models/promotion.model");

const applyPromotion = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    const promotion = await Promotion.findOne({ code });

    if (!promotion) {
      return res.status(404).json({ message: "Invalid promotion code" });
    }
    const currentDate = new Date();

    if (
      promotion.validFrom > currentDate ||
      promotion.validTo < currentDate ||
      !promotion.isActive
    ) {
      return res
        .status(400)
        .json({ message: "Promotion is not valid or expired" });
    }
    if (totalAmount < promotion.minOrderAmount) {
      return res
        .status(400)
        .json({
          message: `Order must be at least ${promotion.minOrderAmount} to use this promotion`,
        });
    }
    if (promotion.usedCount >= promotion.maxUsage) {
      return res.status(400).json({ message: "Promotion usage limit reached" });
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
    await promotion.save();

    res.status(200).json({
      message: "Promotion applied successfully",
      discountedAmount: discountedAmount,
    });
  } catch (error) {
    console.log("Error in applyPromotion controller", error.message);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getActivePromotions = async (_, res) => {
  try {
    const currentDate = new Date();

    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validTo: { $gte: currentDate },
    });

    res.status(200).json({ promotions });
  } catch (error) {
    console.error("Error in getActivePromotions:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { applyPromotion, getActivePromotions };
