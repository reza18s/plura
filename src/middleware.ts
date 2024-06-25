import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/agency(.*)", "/subaccount(.*)"]);

const isPublicRoute = createRouteMatcher([
  "/agency/sign-in",
  "/agency/sign-up",
]);

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers;
  const searchParams = url.searchParams.toString();
  const pathWithSearchParams = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
  const customSubDomain = hostname
    .get("host")
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];
  if (!auth().userId && isProtectedRoute(req)) {
    // // Add custom logic to run before redirecting
    if (isPublicRoute(req)) return;
    return auth().redirectToSignIn();
  }
  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url),
    );
  }
  if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/agency/sign-in", req.url));
  }
  if (
    url.pathname === "/" ||
    (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL("/site", req.url));
  }
  if (
    url.pathname.startsWith("/agency") ||
    url.pathname.startsWith("/subaccount")
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }
});
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
