const User = require("../../models/user.model");
const ProductVariant = require("../../models/productVariant.model"); 
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

const getAllUser = async (_, res) => {
  try {
    const users = await User.find().select(
      "_id name email phoneNumber role active"
    );
    if (!users.length) {
      return res.status(404).json({ message: "No users found!" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "_id name email phoneNumber role orderHistory active"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }

const getUserOrder = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user orders with populated product variants (but no full product details yet)
    const user = await User.findById(userId)
      .populate({
        path: 'orderHistory', // Assuming orderHistory is an array of orders
        populate: {
          path: 'products.product', // Populate the product field inside products array
          model: 'ProductVariant', // Model to populate
          select: 'name price color stock',  // Include the fields you want from ProductVariant
        },
      });


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.orderHistory || user.orderHistory.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({ orderHistory: user.orderHistory });
  } catch (error) {
    console.error("Error fetching user order:", error);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};


const getUserOrderDetail = async (req, res) => {

  try {
    const { productVariantId } = req.params;
    
    console.log(productVariantId)
    const productVariant = await ProductVariant.findById(productVariantId).populate({
      path: 'productId', 
      model: 'Product',
      select: 'name price ', 
    });


    if (!productVariant) {
      return res.status(404).json({ message: "Product variant not found" });
    }

    res.status(200).json({ productVariant });

  } catch (error) {
    console.error("Error fetching product variant details:", error);
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.active = false;
    await user.save();

    res
      .status(200)
      .json({ message: "User has been banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

const unBanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.active = true;
    await user.save();

    res
      .status(200)
      .json({ message: "User has been unbanned successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error!", error: error.message });
  }
};

module.exports = {
  getPaginatedUser,
  getAllUser,
  getUserOrder,
  getUserOrderDetail,
  getUserDetail,
  banUser,
  unBanUser,
};
