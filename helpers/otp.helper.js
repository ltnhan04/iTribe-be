const RedisHelper = require("./redis.helper");
const AppError = require("./appError.helper");

class OtpHelper {
  static generateOTP = async () => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const createdAt = Date.now();
    return {
      verificationCode,
      createdAt,
    };
  };

  static verifyOtp = async (email, otp) => {
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
    if (otp !== verificationCode.toString()) {
      throw new AppError("Invalid OTP", 400);
    }
    return { name, password, email };
  };

  static checkCountOtp = async (email) => {};
}

module.exports = OtpHelper;
