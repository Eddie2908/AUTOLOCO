/**
 * Clear Token Cookie Route
 * =========================
 *
 * Clears the access token cookie on logout.
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear the access token cookie
    cookieStore.delete(AUTH_CONFIG.ACCESS_TOKEN_KEY)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ClearToken] Error:", error)
    return NextResponse.json({ error: "Failed to clear token" }, { status: 500 })
  }
}
