const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ProductVariant = require("../models/productVariant.model");

const createCheckoutSession = async (req, res) => {
  try {
    const { productVariants, orderId } = req.body;

    if (
      !productVariants ||
      !Array.isArray(productVariants) ||
      productVariants.length === 0
    ) {
      return res.status(400).json({ message: "Invalid productVariants" });
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
        };
      })
    );

    const exchangeRate = 24000;

    const lineItems = variants.map((variant) => {
      const priceInUSD = variant.price / exchangeRate;
      const unitAmountInCents = Math.round(priceInUSD * 100);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: variant.name,
          },
          unit_amount: unitAmountInCents,
        },
        quantity: variant.quantity,
      };
    });

    const totalAmountInCents = lineItems.reduce((sum, item) => {
      return sum + item.price_data.unit_amount * item.quantity;
    }, 0);

    if (totalAmountInCents > 99999999) {
      return res
        .status(400)
        .json({ message: "Total amount exceeds the limit" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&&orderId=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log("Error in createCheckoutSession controller", error.message);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

module.exports = { createCheckoutSession };
