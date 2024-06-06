"use server";
import Stripe from "stripe";
import { db } from "../db";
interface Subscription extends Stripe.Subscription {
  plan: {
    id: "price_1OYxkqFj9oKEERu1NbKUxXxN" | "price_1OYxkqFj9oKEERu1KfJGWxgN";
  };
}
export const subscriptionCreated = async (
  subscription: Subscription,
  customerId: string,
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        SubAccount: true,
      },
    });
    if (!agency) {
      throw new Error("Could not find and agency to upsert the subscription");
    }

    const data = {
      active: subscription.status === "active",
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      priceId: subscription.plan.id,
      subscritiptionId: subscription.id,
      plan: subscription.plan.id,
    };

    const res = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: data,
      update: data,
    });
    console.log(`🟢 Created Subscription for ${subscription.id}`);
  } catch (error) {
    console.log("🔴 Error from Create action", error);
  }
};

// export const getConnectAccountProducts = async (stripeAccount: string) => {
//   const products = await stripe.products.list(
//     {
//       limit: 50,
//       expand: ["data.default_price"],
//     },
//     {
//       stripeAccount,
//     },
//   );
//   return products.data;
// };
