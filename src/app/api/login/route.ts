import { NextRequest, NextResponse } from "next/server";

// Set your Strapi URL here
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();
  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data?.error?.message || "Invalid credentials" }, { status: 401 });
    }
    // Set JWT in HTTP-only cookie
    const response = NextResponse.json({ user: data.user });
    response.cookies.set("jwt", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
