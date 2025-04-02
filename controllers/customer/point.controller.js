const PointService = require("../../services/customer/point.service");
const AppError = require("../../helpers/appError.helper");
//Lấy số điểm của user
const getCustomerPoints = async (req, res, next) => {
  try {
    const points = await PointService.getCustomerPoints(req.user._id);
    res.status(200).json({
      message: "Customer points retrieved successfully",
      data: { points },
    });
  } catch (error) {
    next(error);
  }
};
//Đổi điểm lấy voucher
const exchangePointsForVoucher = async (req, res, next) => {
  try {
    const { pointsToUse } = req.body;

    if (!pointsToUse) {
      throw new AppError("Points amount is required", 400);
    }

    const voucher = await PointService.exchangePointsForVoucher(
      req.user._id,
      pointsToUse
    );

    res.status(200).json({
      message: "Points exchanged for voucher successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};
//Lấy voucher của user
const getCustomerVouchers = async (req, res, next) => {
  try {
    const vouchers = await PointVoucher.find({
      customer: req.user._id,
      status: "unused",
      validTo: { $gte: new Date() },
    });

    res.status(200).json({
      message: "Customer vouchers retrieved successfully",
      data: vouchers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerPoints,
  exchangePointsForVoucher,
  getCustomerVouchers,
};
