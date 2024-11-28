class OtpHelper {
  static generateOTP = async () => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const createAt = Date.now();
    return {
      verificationCode,
      createAt,
    };
  };
}

module.exports = OtpHelper;
