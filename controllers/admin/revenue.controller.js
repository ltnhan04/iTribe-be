const RevenueService = require("../../services/admin/revenue.service");
const AppError = require("../../helpers/appError.helper");

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

const getRevenueByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      throw new AppError("Year and month are required", 400);
    }

    const result = await RevenueService.getRevenueByMonth(parseInt(year), parseInt(month));

    res.status(200).json({
      status: "success",
      data: {
        report: result.data,
        summary: {
          totalSales: result.summary.totalSales.toLocaleString() + "đ",
          totalOrders: result.summary.totalOrders,
          averageOrderValue: result.summary.averageOrderValue.toLocaleString() + "đ"
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueByYear = async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) {
      throw new AppError("Year is required", 400);
    }

    const result = await RevenueService.getRevenueByYear(parseInt(year));

    res.status(200).json({
      status: "success",
      data: {
        report: result.data,
        summary: {
          totalSales: result.summary.totalSales.toLocaleString() + "đ",
          totalOrders: result.summary.totalOrders,
          averageOrderValue: result.summary.averageOrderValue.toLocaleString() + "đ"
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueByCustomDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError("Start date and end date are required", 400);
    }

    const result = await RevenueService.getRevenueByCustomDateRange(startDate, endDate);

    res.status(200).json({
      status: "success",
      data: {
        report: result.data,
        summary: {
          totalSales: result.summary.totalSales.toLocaleString() + "đ",
          totalOrders: result.summary.totalOrders,
          averageOrderValue: result.summary.averageOrderValue.toLocaleString() + "đ"
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  revenueADay,
  revenueLastDays,
  calculateTotalRevenue,
  revenueByProduct,
  getRevenueByMonth,
  getRevenueByYear,
  getRevenueByCustomDateRange
};
