const PaymentService = require("../../services/customer/payment.service");

const createCheckoutSession = async (req, res, next) => {
  try {
    const { productVariants, orderId } = req.body;

    const session = await PaymentService.handleCheckoutSession(
      productVariants,
      orderId
    );
    res.status(200).json({ url: session.url });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCheckoutSession };
