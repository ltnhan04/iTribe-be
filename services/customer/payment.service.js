const stripe = require("../../libs/stripe");
const ProductVariant = require("../../models/productVariant.model");
const AppError = require("../../helpers/appError.helper");
const { vndLimit, priceInUSD } = require("../../constants");

class PaymentService {
  static handleCheckoutSession = async (productVariants, orderId) => {
    if (
      !productVariants ||
      !Array.isArray(productVariants) ||
      productVariants.length === 0
    ) {
      throw new AppError("Invalid product variants", 400);
    }

    const variants = await Promise.all(
      productVariants.map(async (item) => {
        const product = await ProductVariant.findById(item.productVariant);
        if (!product) {
          throw new Error(`ProductVariant ${item.productVariant} not found`);
        }
        return {
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0],
        };
      })
    );

    const lineItems = variants.map((variant) => {
      const price = priceInUSD(variant.price);
      const unitAmountInCents = Math.round(price * 100);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: variant.name,
            images: [variant.image],
          },
          unit_amount: unitAmountInCents,
        },
        quantity: variant.quantity,
      };
    });

    const totalAmount = lineItems.reduce((sum, item) => {
      return sum + item.price_data.unit_amount * item.quantity;
    }, 0);

    if (totalAmount > vndLimit) {
      throw new AppError("Total amount exceeds the limit", 400);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&&orderId=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });
    return session;
  };
}

module.exports = PaymentService;
