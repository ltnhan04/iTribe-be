const RevenueService = require("../../services/admin/revenue.service");

const revenueADay = async (_, res, next) => {
  try {
    const { savedRevenue } = await RevenueService.handleRevenueADay();
    res.status(200).json({
      message: "Revenue a day created successfully",
      revenue: savedRevenue,
    });
  } catch (error) {
    next(error);
  }
};

const revenueLastDays = async (req, res, next) => {
  try {
    const { days } = req.params;
    const { message, totalSales, totalOrders, details } =
      await RevenueService.handleRevenueLastDays(days);

    res.status(200).json({ message, totalSales, totalOrders, details });
  } catch (error) {
    next(error);
  }
};

const calculateTotalRevenue = async (_, res, next) => {
  try {
    const { totalSales, totalOrders, details } =
      await RevenueService.handleCalculateTotalRevenue();
    res.status(200).json({
      totalSales,
      totalOrders,
      details,
    });
  } catch (error) {
    next(error);
  }
};

const revenueByProduct = async (_, res, next) => {
  try {
    const { message, result } = await RevenueService.handleRevenueByProduct();
    res.status(200).json({ message, result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  revenueADay,
  revenueLastDays,
  calculateTotalRevenue,
  revenueByProduct,
};
