/**
 * Auth Service
 * =============
 *
 * Service for authentication-related API calls.
 * Uses the unified token manager for authentication.
 */

import { apiClient, handleApiError } from "../client"
import { tokenManager } from "@/lib/auth/token-manager"
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "../types"

export const authService = {
  // Login
  async login(credentials: LoginRequest) {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials)

    if (response.error) {
      handleApiError(response.error, "Identifiants invalides")
      return null
    }

    // Store tokens using token manager
    if (response.data) {
      tokenManager.setTokens(response.data.access_token, response.data.refresh_token)
    }

    return response.data
  },

  // Register
  async register(data: RegisterRequest) {
    const response = await apiClient.post<{ message: string }>("/auth/register", data)

    if (response.error) {
      handleApiError(response.error, "Erreur lors de l'inscription")
      return null
    }

    return response.data
  },

  // Logout
  async logout() {
    const response = await apiClient.post("/auth/logout")
    tokenManager.clearTokens()
    return response.data
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get<User>("/users/me")

    if (response.error) {
      if (response.status === 401) {
        tokenManager.clearTokens()
      }
      return null
    }

    return response.data
  },

  // Verify email
  async verifyEmail(token: string) {
    const response = await apiClient.post<{ message: string }>("/auth/verify-email", { token })

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Request password reset
  async requestPasswordReset(email: string) {
    const response = await apiClient.post<{ message: string }>("/auth/reset-password", { email })

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenManager.hasTokens()
  },

  // Get access token
  getAccessToken(): string | null {
    return tokenManager.getAccessToken()
  },

  // Get valid access token (refreshing if needed)
  async getValidAccessToken(): Promise<string | null> {
    return tokenManager.getValidAccessToken()
  },
}
