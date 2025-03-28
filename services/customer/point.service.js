const Point = require("../../models/point.model");
const PointVoucher = require("../../models/pointVoucher.model");
const AppError = require("../../helpers/appError.helper");

class PointService {
  // Tính điểm dựa trên giá trị đơn hàng
  static calculatePoints(orderAmount) {
    return Math.floor(orderAmount / 100000); // 100.000 VND = 1 điểm
  }

  // Tích điểm khi đơn hàng hoàn thành
  static async addPointsForOrder(order) {
    try {
      const points = this.calculatePoints(order.totalAmount);
      if (points <= 0) return null;

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 tháng

      const point = new Point({
        customer: order.user,
        points,
        order: order._id,
        expiryDate,
      });

      await point.save();
      return point;
    } catch (error) {
      console.error("Error adding points for order:", error);
      throw error;
    }
  }

  // Lấy tổng điểm của khách hàng
  static async getCustomerPoints(customerId) {
    try {
      const points = await Point.find({
        customer: customerId,
        isExpired: false,
        expiryDate: { $gt: new Date() },
      });

      return points.reduce((total, point) => total + point.points, 0);
    } catch (error) {
      console.error("Error getting customer points:", error);
      throw error;
    }
  }

  // Đổi điểm lấy voucher
  static async exchangePointsForVoucher(customerId, pointsToUse) {
    try {
      // Kiểm tra số điểm có đủ không
      const availablePoints = await this.getCustomerPoints(customerId);
      if (availablePoints < pointsToUse) {
        throw new AppError("Insufficient points", 400);
      }

      // Xác định giá trị voucher
      let discountAmount;
      if (pointsToUse >= 500) {
        discountAmount = 1000000; // 500 điểm = 1 triệu
      } else if (pointsToUse >= 300) {
        discountAmount = 500000; // 300 điểm = 500k
      } else if (pointsToUse >= 100) {
        discountAmount = 100000; // 100 điểm = 100k
      } else {
        throw new AppError("Invalid points amount", 400);
      }

      // Tạo voucher mới
      const voucher = new PointVoucher({
        customer: customerId,
        code: `POINT_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discountAmount,
        pointsUsed: pointsToUse,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
      });

      await voucher.save();

      // Trừ điểm đã sử dụng
      await this.deductPoints(customerId, pointsToUse);

      return voucher;
    } catch (error) {
      console.error("Error exchanging points for voucher:", error);
      throw error;
    }
  }

  // Trừ điểm đã sử dụng
  static async deductPoints(customerId, pointsToDeduct) {
    try {
      const points = await Point.find({
        customer: customerId,
        isExpired: false,
        expiryDate: { $gt: new Date() },
      }).sort({ expiryDate: 1 }); // Sắp xếp theo thời hạn sử dụng

      let remainingPoints = pointsToDeduct;
      for (const point of points) {
        if (remainingPoints <= 0) break;

        if (point.points <= remainingPoints) {
          remainingPoints -= point.points;
          point.points = 0;
          point.isExpired = true;
        } else {
          point.points -= remainingPoints;
          remainingPoints = 0;
        }

        await point.save();
      }
    } catch (error) {
      console.error("Error deducting points:", error);
      throw error;
    }
  }

  // Kiểm tra và xóa điểm hết hạn
  static async checkAndRemoveExpiredPoints() {
    try {
      const expiredPoints = await Point.find({
        isExpired: false,
        expiryDate: { $lte: new Date() },
      });

      for (const point of expiredPoints) {
        point.isExpired = true;
        await point.save();
      }

      return expiredPoints.length;
    } catch (error) {
      console.error("Error checking expired points:", error);
      throw error;
    }
  }

  // Kiểm tra voucher hợp lệ
  static async validateVoucher(code, customerId) {
    try {
      const voucher = await PointVoucher.findOne({
        code,
        customer: customerId,
        status: "unused",
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
      });

      if (!voucher) {
        throw new AppError("Invalid or expired voucher", 400);
      }

      return voucher;
    } catch (error) {
      console.error("Error validating voucher:", error);
      throw error;
    }
  }

  // Đánh dấu voucher đã sử dụng
  static async markVoucherAsUsed(voucherId, orderId) {
    try {
      const voucher = await PointVoucher.findByIdAndUpdate(
        voucherId,
        {
          status: "used",
          usedOrder: orderId,
        },
        { new: true }
      );

      return voucher;
    } catch (error) {
      console.error("Error marking voucher as used:", error);
      throw error;
    }
  }
}

module.exports = PointService; 