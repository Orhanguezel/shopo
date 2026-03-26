import { NextResponse } from "next/server";
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get access_token from cookies
  const accessToken = request.cookies.get("access_token")?.value;

  // Check if token is valid (not empty and has reasonable length)
  const isValidToken = accessToken && accessToken.length > 10;

  // Define private routes that require authentication
  const privateRoutes = [
    "/become-seller",
    "/profile",
    "/tracking-order",
    "/wishlist",
    "/products-compaire",
  ];

  // Check if the current path is a private route
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if user is on login page
  const isLoginPage = pathname === "/login";

  // If user is not authenticated and trying to access private route
  if (!isValidToken && isPrivateRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access login page
  if (isValidToken && isLoginPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }
  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Only protect the private routes that need authentication
    "/profile/:path*",
    "/wishlist",
    "/products-compaire",
    "/become-seller",
    "/tracking-order",
  ],
};
