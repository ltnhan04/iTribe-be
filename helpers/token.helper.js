const RedisHelper = require("../helpers/redis.helper");
const jwt = require("jsonwebtoken");

class TokenHelper {
  static generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return { accessToken, refreshToken };
  };

  static storeRefreshToken = async (userId, refreshToken) => {
    await RedisHelper.set(
      `refresh_token:${userId}`,
      refreshToken,
      7 * 24 * 60 * 60
    );
  };
}

module.exports = TokenHelper;
