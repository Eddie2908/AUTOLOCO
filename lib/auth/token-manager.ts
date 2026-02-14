/**
 * Token Manager
 * =============
 *
 * Centralized token management for handling JWT tokens from the FastAPI backend.
 * Simplified version that works with NextAuth sessions.
 */

export interface TokenPayload {
  sub: string
  email: string
  type: string
  exp: number
  iat: number
  jti: string
}

class TokenManager {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  /**
   * Decode JWT token without verification (client-side only)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) return null

      const payload = JSON.parse(atob(parts[1]))
      return payload as TokenPayload
    } catch {
      return null
    }
  }

  /**
   * Set tokens after successful authentication
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken
  }

  /**
   * Check if tokens are available
   */
  hasTokens(): boolean {
    return !!this.accessToken && !!this.refreshToken
  }

  /**
   * Get a valid access token
   */
  async getValidAccessToken(): Promise<string | null> {
    return this.accessToken
  }

  /**
   * Get user info from access token
   */
  getUserFromToken(): { id: string; email: string; type: string } | null {
    if (!this.accessToken) return null

    const payload = this.decodeToken(this.accessToken)
    if (!payload) return null

    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
    }
  }
}

// Export singleton instance
export const tokenManager = new TokenManager()
