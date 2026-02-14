/**
 * Backend Authentication Service
 * ===============================
 *
 * Handles direct communication with the FastAPI backend for authentication.
 * This is used by NextAuth to validate credentials and sync sessions.
 */

import { AUTH_CONFIG, DEMO_USERS, type UserType, type UserStatus } from "./config"

export interface BackendUser {
  id: string
  email: string
  nom: string
  prenom: string | null
  type: UserType
  avatar: string | null
  statut: UserStatus
  telephone?: string
  ville?: string
  quartier?: string
  note_globale?: number
  badge?: string
  date_inscription?: string
}

export interface BackendLoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: BackendUser
}

export interface BackendRegisterResponse {
  user_id: number
  email: string
  type_utilisateur: UserType
  access_token: string
  refresh_token: string
  message: string
}

export interface BackendAuthResult {
  success: boolean
  data?: BackendLoginResponse | BackendRegisterResponse
  error?: string
  isDemoUser?: boolean
}

function withIpv4Localhost(url: string): string {
  return url.replace("http://localhost:", "http://127.0.0.1:").replace("https://localhost:", "https://127.0.0.1:")
}

/**
 * Authenticate with the FastAPI backend
 */
export async function authenticateWithBackend(email: string, password: string): Promise<BackendAuthResult> {
  const apiUrl = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}/auth/login`

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const data: BackendLoginResponse = await response.json()
      return {
        success: true,
        data,
        isDemoUser: false,
      }
    }

    // If backend returns 401, invalid credentials
    if (response.status === 401) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      }
    }

    // If backend returns 403, account is disabled/suspended
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || "Ce compte a été désactivé ou suspendu",
      }
    }

    // Other errors
    const errorData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errorData.detail || "Erreur de connexion au serveur",
    }
  } catch (error) {
    console.warn("[BackendAuth] Backend unavailable", {
      apiUrl,
      error: error instanceof Error ? error.message : String(error),
    })

    // Retry with 127.0.0.1 (common fix on Windows/Node when localhost resolves to IPv6)
    if (apiUrl.includes("localhost")) {
      try {
        const response = await fetch(withIpv4Localhost(apiUrl), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          const data: BackendLoginResponse = await response.json()
          return {
            success: true,
            data,
            isDemoUser: false,
          }
        }
      } catch {
        // ignore and continue to fallback logic
      }
    }

    // Only allow demo users when backend is unavailable
    const demoResult = authenticateWithDemoUsers(email, password)
    if (demoResult.success) {
      return demoResult
    }

    return {
      success: false,
      error: "BACKEND_UNAVAILABLE",
    }
  }
}

/**
 * Authenticate with demo users (fallback)
 */
function authenticateWithDemoUsers(email: string, password: string): BackendAuthResult {
  const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)

  if (!demoUser) {
    return {
      success: false,
      error: "Email ou mot de passe incorrect",
    }
  }

  // Create mock tokens for demo user
  const mockAccessToken = `demo_access_${demoUser.id}_${Date.now()}`
  const mockRefreshToken = `demo_refresh_${demoUser.id}_${Date.now()}`

  return {
    success: true,
    data: {
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
      token_type: "bearer",
      user: {
        id: demoUser.id,
        email: demoUser.email,
        nom: demoUser.nom,
        prenom: demoUser.prenom,
        type: demoUser.type,
        avatar: demoUser.avatar,
        statut: demoUser.statut,
        telephone: demoUser.telephone,
        ville: demoUser.ville,
      },
    },
    isDemoUser: true,
  }
}

/**
 * Register a new user with the FastAPI backend
 */
export async function registerWithBackend(data: {
  email: string
  password: string
  nom: string
  prenom?: string
  telephone?: string
  ville?: string
  type_utilisateur: UserType
}): Promise<BackendAuthResult> {
  const apiUrl = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}/auth/register`

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const responseData: BackendRegisterResponse = await response.json()
      return {
        success: true,
        data: responseData,
      }
    }

    if (response.status === 409) {
      return {
        success: false,
        error: "Un compte avec cet email existe déjà",
      }
    }

    const errorData = await response.json().catch(() => ({}))
    return {
      success: false,
      error: errorData.detail || "Erreur lors de l'inscription",
    }
  } catch (error) {
    console.error("[BackendAuth] Registration error:", error)
    return {
      success: false,
      error: "Impossible de contacter le serveur. Veuillez réessayer.",
    }
  }
}

/**
 * Get current user from backend
 */
export async function getCurrentUserFromBackend(accessToken: string): Promise<BackendUser | null> {
  const apiUrl = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}/auth/me`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[BackendAuth] Error fetching current user:", error)
    return null
  }
}

/**
 * Logout from backend (invalidate tokens)
 */
export async function logoutFromBackend(accessToken: string, refreshToken?: string): Promise<boolean> {
  const apiUrl = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}/auth/logout`

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        logout_all_devices: false,
      }),
      signal: AbortSignal.timeout(5000),
    })

    return response.ok
  } catch (error) {
    console.error("[BackendAuth] Logout error:", error)
    return false
  }
}

/**
 * Refresh access token
 */
export async function refreshBackendToken(
  refreshToken: string,
): Promise<{ access_token: string; token_type: string } | null> {
  const apiUrl = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}/auth/refresh`

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[BackendAuth] Token refresh error:", error)
    return null
  }
}
