import { StripeCustomerType } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address, email, name, shipping }: StripeCustomerType =
    await req.json();

  if (!email || !address || !name || !shipping) {
    return new NextResponse("Missing data", {
      status: 400,
    });
  }
  try {
    return Response.json({ customerId: "1234578" });
  } catch (error) {
    console.log("🔴 Error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
