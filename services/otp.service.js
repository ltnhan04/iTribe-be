const RedisHelper = require("../helpers/redis.helper");
const AppError = require("../helpers/appError.helper");
const CustomerService = require("./customer.service");

class OtpService {
  static generateOTP = async () => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const createdAt = Date.now();
    return {
      verificationCode,
      createdAt,
    };
  };
  static checkExpiredOtp = async (email) => {
    const storedData = await RedisHelper.get(`signup:${email}`);
    if (!storedData) {
      throw new AppError("OTP doesn't exist", 404);
    }

    const { name, password, verificationCode, createdAt } =
      JSON.parse(storedData);

    const timeElapsed = (Date.now() - createdAt) / 1000;
    if (timeElapsed > 60) {
      throw new AppError("OTP expired", 400);
    }
    return { name, password, verificationCode };
  };

  static verifyOtp = async (email, otp) => {
    const { name, password, verificationCode } = await this.checkExpiredOtp(
      email
    );

    if (otp !== verificationCode.toString()) {
      throw new AppError("Invalid OTP", 400);
    }
    return { name, password, email };
  };

  static checkCountOtp = async (email) => {
    const storedData = await RedisHelper.get(`signup:${email}`);
    if (!storedData) {
      throw new AppError("OTP doesn't exist", 404);
    }
    const { name, password } = JSON.parse(storedData);
    let resendCount = await RedisHelper.get(`signup:count:${email}`);
    resendCount = resendCount ? parseInt(resendCount) : 0;

    if (resendCount > 2) {
      throw new AppError(
        "You have reached the limit for resending OTP. Please try after 10 mins.",
        429
      );
    }

    const { verificationCode, createdAt } = await this.generateOTP();

    await RedisHelper.set(
      `signup:${email}`,
      JSON.stringify({ name, password, verificationCode, createdAt }),
      300
    );

    if (resendCount === 0) {
      await RedisHelper.set(`signup:count:${email}`, 1, 10 * 60);
    } else {
      await RedisHelper.incr(`signup:count:${email}`);
    }

    return { verificationCode };
  };
}

module.exports = OtpService;
