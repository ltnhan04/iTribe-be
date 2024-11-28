const User = require("../models/user.model");

class CustomerService {
  static findCustomerByEmail = async (email) => {
    const customer = await User.findOne({ email });
    if (!customer) {
      return status(400).json({ message: "Customer already exists" });
    }
  };
}
