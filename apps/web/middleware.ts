import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAppRoute = createRouteMatcher([
  "/home(.*)",
  "/today(.*)",
  "/journal(.*)",
  "/programs(.*)",
  "/calm(.*)",
  "/journey(.*)",
  "/profile(.*)",
]);

function hasClerkKeys() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return Boolean(key && key.startsWith("pk_") && key.length > 20);
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname;

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const { userId } = await auth();
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up");

  if (userId && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  if (!userId && isAppRoute(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = userId ? "/home" : "/sign-in";
    return NextResponse.redirect(url);
  }

  if (path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }
});

export default function middleware(
  request: Parameters<typeof clerkHandler>[0],
  event: Parameters<typeof clerkHandler>[1]
) {
  if (!hasClerkKeys()) {
    const path = request.nextUrl.pathname;
    if (path === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
