const Promotion = require("../../models/promotion.model");

const createPromotion = async (req, res) => {
  try {
    const {
      code,
      discountPercentage,
      validFrom,
      validTo,
      maxUsage,
      minOrderAmount,
    } = req.body;
    const existingPromotion = await Promotion.findOne({ code });
    if (existingPromotion) {
      return res.status(400).json({ message: "Promotion code already exists" });
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

    if (!savedPromotion) {
      return res.status(400).json({ message: "Failed to create promotion" });
    }

    res
      .status(201)
      .json({ message: "Promotion created successfully!", newPromotion });
  } catch (error) {
    console.error("Error in createPromotion:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const promotion = await Promotion.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res
      .status(200)
      .json({ message: "Promotion updated successfully", promotion });
  } catch (error) {
    console.error("Error in updatePromotion:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllPromotions = async (_, res) => {
  try {
    const promotions = await Promotion.find();
    res.status(200).json({ promotions });
  } catch (error) {
    console.error("Error in getAllPromotions:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Error in deletePromotion:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createPromotion,
  updatePromotion,
  getAllPromotions,
  deletePromotion,
};
