/**
 * API Client
 * ===========
 *
 * Unified API client that uses the token manager for authentication
 * and provides automatic token refresh capabilities.
 */

import { toast } from "@/hooks/use-toast"
import { tokenManager } from "@/lib/auth/token-manager"
import { AUTH_CONFIG } from "@/lib/auth/config"

// Base URL for the FastAPI backend
const API_BASE_URL = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}`

export interface ApiError {
  error: string
  message: string
  detail?: any
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  status: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Make an authenticated request to the API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // Get a valid access token
    const accessToken = await tokenManager.getValidAccessToken()

    if (accessToken) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`
    }

    try {
      let response = await fetch(url, { ...options, headers })

      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && tokenManager.getRefreshToken()) {
        const refreshed = await tokenManager.refreshAccessToken()
        if (refreshed) {
          // Retry with new token
          const newToken = tokenManager.getAccessToken()
          if (newToken) {
            ;(headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`
            response = await fetch(url, { ...options, headers })
          }
        } else {
          // Refresh failed, clear tokens
          tokenManager.clearTokens()
          if (typeof window !== "undefined") {
            window.location.href = AUTH_CONFIG.ROUTES.LOGIN
          }
        }
      }

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        return {
          error: data || {
            error: "API_ERROR",
            message: "Erreur de communication avec le serveur",
          },
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error("[ApiClient] Request error:", error)
      return {
        error: {
          error: "NETWORK_ERROR",
          message: "Erreur de connexion au serveur",
          detail: error instanceof Error ? error.message : "Unknown error",
        },
        status: 0,
      }
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Upload file with FormData
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {}

    const accessToken = await tokenManager.getValidAccessToken()
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        return { error: data, status: response.status }
      }

      return { data, status: response.status }
    } catch (error) {
      return {
        error: {
          error: "UPLOAD_ERROR",
          message: "Erreur lors de l'upload du fichier",
          detail: error instanceof Error ? error.message : "Unknown error",
        },
        status: 0,
      }
    }
  }

  // Legacy methods for backward compatibility
  setTokens(accessToken: string, refreshToken: string): void {
    tokenManager.setTokens(accessToken, refreshToken)
  }

  clearTokens(): void {
    tokenManager.clearTokens()
  }

  getAccessToken(): string | null {
    return tokenManager.getAccessToken()
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Helper function to handle API errors with toast notifications
export function handleApiError(error: ApiError, customMessage?: string) {
  const message = customMessage || error.message || "Une erreur est survenue"

  toast({
    variant: "destructive",
    title: "Erreur",
    description: message,
  })

  console.error("[API Error]", error)
}
