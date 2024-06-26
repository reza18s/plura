import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  appInfo: {
    name: "Plura App",
    version: "0.1.0",
  },
});
