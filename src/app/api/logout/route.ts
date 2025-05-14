import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  // Remove the JWT cookie
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
