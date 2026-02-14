import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

export interface AuthenticatedUser {
  userId: number
  tokenType: "local" | "backend" | "demo"
  accessToken: string
}

/**
 * Centralized auth middleware that resolves the current user from the request cookie.
 * Returns null if the user is not authenticated.
 * Handles all 3 token types: local_, demo_, and backend JWT.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

  if (!accessToken) {
    return null
  }

  // Demo token
  if (accessToken.startsWith("demo_")) {
    return { userId: -1, tokenType: "demo", accessToken }
  }

  // Local DB token
  if (accessToken.startsWith("local_")) {
    const parts = accessToken.split("_")
    const userId = Number.parseInt(parts[1] || "", 10)
    if (!Number.isFinite(userId) || userId <= 0) {
      return null
    }
    return { userId, tokenType: "local", accessToken }
  }

  // Backend JWT -- decode the user id from the JWT payload without verifying
  // (the backend verifies the token when we proxy the request)
  try {
    const payload = accessToken.split(".")[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString())
    const userId = decoded.sub ? Number.parseInt(decoded.sub, 10) : null
    if (userId && Number.isFinite(userId) && userId > 0) {
      return { userId, tokenType: "backend", accessToken }
    }
    // If we can't extract the id from the JWT, still return a valid auth for proxy
    return { userId: 0, tokenType: "backend", accessToken }
  } catch {
    // If JWT parsing fails but it looks like a token, still allow backend proxy
    if (accessToken.includes(".")) {
      return { userId: 0, tokenType: "backend", accessToken }
    }
    return null
  }
}
