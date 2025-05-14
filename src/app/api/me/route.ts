import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  const jwt = req.cookies.get("jwt")?.value;
  if (!jwt) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const user = await res.json();
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
