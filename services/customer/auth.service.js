const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const CustomerService = require("../customer.service");
const RedisHelper = require("../../helpers/redis.helper");
const OtpService = require("../otp.service");
const AppError = require("../../helpers/appError.helper");
const {
  generateToken,
  storeRefreshToken,
  generateNewToken,
} = require("../token.service");
const { setCookie } = require("../../helpers/cookie.helper");

class AuthService {
  static signUp = async ({ name, email, password }) => {
    await CustomerService.findCustomerByEmail(email);
    const { verificationCode, createdAt } = await OtpService.generateOTP();
    await RedisHelper.set(
      `signup:${email}`,
      JSON.stringify({ name, password, verificationCode, createdAt }),
      300
    );
    return { email, verificationCode };
  };

  static verifyAccount = async ({ email, otp }) => {
    const { name, password } = await OtpService.verifyOtp(email, otp);
    const customer = await CustomerService.createNewCustomer(
      name,
      email,
      password
    );
    return customer;
  };
  static handleResendOtp = async (email) => {
    await CustomerService.findCustomerByEmail(email);
    const { verificationCode } = await OtpService.checkCountOtp(email);
    return { verificationCode };
  };

  static verifyRole = async ({ email, role }) => {
    const customer = await CustomerService.registeredAccount(email);

    if (customer.role !== role) {
      throw new AppError("Access denied - Admin only", 403);
    }
    return customer;
  };

  static handleLogin = async ({ email, password, role, res }) => {
    const customer = await this.verifyRole({ email, role });
    if (customer && (await customer.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(customer._id);
      setCookie(res, "refreshToken", refreshToken);

      await storeRefreshToken(customer._id, refreshToken);

      return { accessToken, name: customer.name, message: "Login success" };
    } else {
      throw new AppError("Invalid email or password", 400);
    }
  };

  static handleLogout = async (refreshToken, res) => {
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await RedisHelper.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("refreshToken");
    return { message: "Logged out successfully" };
  };

  static handleRefreshToken = async (refreshToken, res) => {
    if (!refreshToken) {
      throw new AppError("No refresh token provided", 404);
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RedisHelper.get(
      `refresh_token:${decoded.userId}`
    );

    if (storedToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 400);
    }

    const { newAccessToken, newRefreshToken } = generateNewToken(
      decoded.userId
    );
    setCookie(res, "refreshToken", newRefreshToken);
    return { newAccessToken, message: "Token refreshed successfully" };
  };

  static handleGetProfile = async (id) => {
    const customer = (await CustomerService.findCustomerById(id)).populate({
      path: "orderHistory",
      populate: {
        path: "productVariants.productVariant",
        select: "name color storage price",
      },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }
    return customer;
  };

  static handleChangePassword = async (email) => {
    const customer = await CustomerService.registeredAccount(email);
    const resetToken = crypto.randomBytes(20).toString("hex");

    await RedisHelper.set(
      `resetpassword:${resetToken}`,
      JSON.stringify({ userId: customer._id, resetToken }),
      5 * 60
    );
    return { resetToken };
  };

  static handleResetPassword = async (token, password) => {
    const storedData = await RedisHelper.get(`resetpassword:${token}`);
    if (!storedData) {
      throw new AppError("Reset token expired", 400);
    }

    const parsedData = JSON.parse(storedData);
    const { userId } = parsedData;

    const customer = CustomerService.findCustomerById(userId);
    customer.password = password;
    (await customer).save();
    return { email };
  };
}

module.exports = AuthService;