import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/me", "/api/logout", "/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  // Check for JWT cookie
  const jwt = req.cookies.get("jwt");
  if (!jwt) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
