const User = require("../../models/user.model");

const getPaginatedUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(parseInt(limit));
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  getPaginatedUser,
};
