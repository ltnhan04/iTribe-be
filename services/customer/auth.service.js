const CustomerService = require("../customer.service");
const RedisHelper = require("../../helpers/redis.helper");
const OtpHelper = require("../../helpers/otp.helper");

class AuthService {
  static signUp = async ({ name, email, password }) => {
    await CustomerService.findCustomerByEmail(email);
    const { verificationCode, createdAt } = await OtpHelper.generateOTP();
    await RedisHelper.set(
      `signup:${email}`,
      JSON.stringify({ name, password, verificationCode, createdAt }),
      300
    );
    return { email, verificationCode };
  };

  static verifyAccount = async ({ email, otp }) => {
    const { name, password } = await OtpHelper.verifyOtp(email, otp);
    const customer = await CustomerService.createNewCustomer(
      name,
      email,
      password
    );
    return customer;
  };
}

module.exports = AuthService;
