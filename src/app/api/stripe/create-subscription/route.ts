import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json();
  if (!customerId || !priceId) {
    return new NextResponse("Customer Id or price id is missing", {
      status: 400,
    });
  }

  const subscriptionExists = await db.agency.findFirst({
    where: { customerId },
    include: { Subscription: true },
  });

  try {
    if (
      subscriptionExists?.Subscription?.subscritiptionId &&
      subscriptionExists.Subscription.active
    ) {
      if (!subscriptionExists.Subscription.subscritiptionId) {
        throw new Error(
          "Could not find the subscription Id to update the subscription.",
        );
      }
      console.log("Updating the subscription");
      return NextResponse.json({
        subscriptionId: "12345678",
        clientSecret: "12345678",
      });
    } else {
      return NextResponse.json({
        subscriptionId: "12345678",
        clientSecret: "12345678",
      });
    }
  } catch (error) {
    console.log("🔴 Error", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
