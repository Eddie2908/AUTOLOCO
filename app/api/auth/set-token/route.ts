/**
 * Set Token Cookie Route
 * =======================
 *
 * Sets the access token as an HTTP-only cookie for middleware authentication.
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    const cookieStore = await cookies()

    // Set the access token as HTTP-only cookie
    cookieStore.set(AUTH_CONFIG.ACCESS_TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SetToken] Error:", error)
    return NextResponse.json({ error: "Failed to set token" }, { status: 500 })
  }
}
