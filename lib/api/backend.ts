/**
 * Backend API client for connecting to FastAPI
 * This module provides a centralized way to communicate with the Python backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface BackendResponse<T> {
  data?: T
  error?: {
    error: string
    message: string
    detail?: any
  }
  status: number
}

/**
 * Make a request to the FastAPI backend
 */
export async function backendFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<BackendResponse<T>> {
  const url = `${BACKEND_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return {
        error: data || {
          error: "BACKEND_ERROR",
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
    console.error("[Backend] Fetch error:", error)
    return {
      error: {
        error: "NETWORK_ERROR",
        message: "Impossible de contacter le serveur",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      status: 0,
    }
  }
}

/**
 * Backend API methods
 */
export const backendApi = {
  // Auth
  async login(email: string, password: string) {
    return backendFetch<{
      access_token: string
      refresh_token: string
      token_type: string
      user: {
        id: string
        email: string
        nom: string
        prenom: string
        type: string
        avatar: string
        statut: string
      }
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async register(data: {
    email: string
    password: string
    nom: string
    prenom?: string
    telephone?: string
    ville?: string
    type_utilisateur: string
  }) {
    return backendFetch<{
      user_id: number
      email: string
      type_utilisateur: string
      access_token: string
      refresh_token: string
      message: string
    }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async refreshToken(refreshToken: string) {
    return backendFetch<{
      access_token: string
      token_type: string
    }>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  },

  async getMe(token: string) {
    return backendFetch<{
      id: string
      email: string
      nom: string
      prenom: string
      type: string
      avatar: string
      statut: string
      telephone: string
      ville: string
      quartier: string
      note_globale: number
      badge: string
      date_inscription: string
    }>("/api/v1/auth/me", {}, token)
  },

  // Vehicles
  async getVehicles(params?: {
    page?: number
    page_size?: number
    city?: string
    type?: string
    fuel?: string
    transmission?: string
    min_price?: number
    max_price?: number
    seats?: number
    available?: boolean
    featured?: boolean
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "all") {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return backendFetch<{
      vehicles: any[]
      total: number
      page: number
      page_size: number
    }>(`/api/v1/vehicles${query ? `?${query}` : ""}`)
  },

  async getVehicle(id: string) {
    return backendFetch<any>(`/api/v1/vehicles/${id}`)
  },

  async getFeaturedVehicles(limit = 6) {
    return backendFetch<any[]>(`/api/v1/vehicles/featured?limit=${limit}`)
  },

  async createVehicle(data: any, token: string) {
    return backendFetch<any>(
      "/api/v1/vehicles",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    )
  },

  async updateVehicle(id: string, data: any, token: string) {
    return backendFetch<any>(
      `/api/v1/vehicles/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token,
    )
  },

  async deleteVehicle(id: string, token: string) {
    return backendFetch<void>(
      `/api/v1/vehicles/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  // Bookings
  async getBookings(
    token: string,
    params?: {
      page?: number
      page_size?: number
      statut?: string
    },
  ) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return backendFetch<{
      bookings: any[]
      total: number
      page: number
      page_size: number
    }>(`/api/v1/bookings${query ? `?${query}` : ""}`, {}, token)
  },

  async getBooking(id: string, token: string) {
    return backendFetch<any>(`/api/v1/bookings/${id}`, {}, token)
  },

  async createBooking(
    data: {
      identifiant_vehicule: number
      date_debut: string
      date_fin: string
      lieu_prise_en_charge: string
      lieu_restitution?: string
    },
    token: string,
  ) {
    return backendFetch<any>(
      "/api/v1/bookings",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    )
  },

  async updateBookingStatus(id: string, statut: string, token: string) {
    return backendFetch<any>(
      `/api/v1/bookings/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ statut }),
      },
      token,
    )
  },

  async cancelBooking(id: string, token: string) {
    return backendFetch<void>(
      `/api/v1/bookings/${id}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  // Payments
  async createPayment(
    data: {
      identifiant_reservation: number
      methode_paiement: string
    },
    token: string,
  ) {
    return backendFetch<any>(
      "/api/v1/payments",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    )
  },

  async confirmPayment(paymentId: number, reference: string, token: string) {
    return backendFetch<any>(
      `/api/v1/payments/${paymentId}/confirm?reference=${reference}`,
      {
        method: "POST",
      },
      token,
    )
  },

  async getPaymentMethods() {
    return backendFetch<any[]>("/api/v1/payments/methods/available")
  },

  // Favorites
  async getFavorites(token: string) {
    return backendFetch<any[]>("/api/v1/favorites", {}, token)
  },

  async addFavorite(vehicleId: number, token: string) {
    return backendFetch<any>(
      `/api/v1/favorites/${vehicleId}`,
      {
        method: "POST",
      },
      token,
    )
  },

  async removeFavorite(vehicleId: number, token: string) {
    return backendFetch<void>(
      `/api/v1/favorites/${vehicleId}`,
      {
        method: "DELETE",
      },
      token,
    )
  },

  async checkFavorite(vehicleId: number, token: string) {
    return backendFetch<{ is_favorite: boolean }>(`/api/v1/favorites/${vehicleId}/check`, {}, token)
  },

  // Messages
  async getConversations(token: string) {
    return backendFetch<{
      conversations: any[]
      total: number
      page: number
      page_size: number
    }>("/api/v1/messages/conversations", {}, token)
  },

  async getMessages(conversationId: number, token: string) {
    return backendFetch<any[]>(`/api/v1/messages/conversations/${conversationId}/messages`, {}, token)
  },

  async sendMessage(destinataireId: number, contenu: string, token: string) {
    return backendFetch<any>(
      "/api/v1/messages",
      {
        method: "POST",
        body: JSON.stringify({
          identifiant_destinataire: destinataireId,
          contenu,
        }),
      },
      token,
    )
  },

  async getUnreadCount(token: string) {
    return backendFetch<{ unread_count: number }>("/api/v1/messages/unread/count", {}, token)
  },

  // Reviews
  async getVehicleReviews(vehicleId: number) {
    return backendFetch<{
      reviews: any[]
      total: number
      page: number
      page_size: number
    }>(`/api/v1/reviews/vehicle/${vehicleId}`)
  },

  async createReview(
    data: {
      identifiant_reservation: number
      note: number
      commentaire?: string
    },
    token: string,
  ) {
    return backendFetch<any>(
      "/api/v1/reviews",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    )
  },

  // Search
  async searchVehicles(q: string, city?: string, type?: string) {
    const params = new URLSearchParams({ q })
    if (city) params.append("city", city)
    if (type) params.append("type", type)
    return backendFetch<any[]>(`/api/v1/search/vehicles?${params}`)
  },

  async getSearchSuggestions(q: string) {
    return backendFetch<any[]>(`/api/v1/search/suggestions?q=${q}`)
  },

  // Admin
  async getAdminDashboardStats(token: string) {
    return backendFetch<{
      total_users: number
      total_vehicles: number
      total_bookings: number
      total_revenue: number
      new_users_week: number
      new_bookings_week: number
      platform_commission: number
    }>("/api/v1/admin/dashboard/stats", {}, token)
  },

  async getAdminUsers(
    token: string,
    params?: {
      page?: number
      page_size?: number
      type_utilisateur?: string
      statut?: string
      search?: string
    },
  ) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return backendFetch<any[]>(`/api/v1/admin/users${query ? `?${query}` : ""}`, {}, token)
  },

  async getPendingVehicles(token: string) {
    return backendFetch<any[]>("/api/v1/admin/vehicles/pending", {}, token)
  },

  async moderateVehicle(vehicleId: number, action: string, reason?: string, token?: string) {
    return backendFetch<any>(
      `/api/v1/admin/vehicles/${vehicleId}/moderate`,
      {
        method: "POST",
        body: JSON.stringify({ action, reason }),
      },
      token,
    )
  },

  async suspendUser(userId: number, reason: string, token: string) {
    return backendFetch<any>(
      `/api/v1/admin/users/${userId}/suspend?reason=${encodeURIComponent(reason)}`,
      {
        method: "POST",
      },
      token,
    )
  },

  async unsuspendUser(userId: number, token: string) {
    return backendFetch<any>(
      `/api/v1/admin/users/${userId}/unsuspend`,
      {
        method: "POST",
      },
      token,
    )
  },

  // GPS
  async getCities() {
    return backendFetch<{
      cities: Array<{
        name: string
        lat: number
        lng: number
        vehicles_count: number
      }>
    }>("/api/v1/gps/cities")
  },

  async getNearbyVehicles(lat: number, lng: number, radius = 10) {
    return backendFetch<{
      vehicles: any[]
      center: { lat: number; lng: number }
      radius_km: number
    }>(`/api/v1/gps/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
  },

  // Health check
  async healthCheck() {
    return backendFetch<{
      status: string
      environment: string
      version: string
    }>("/health")
  },
}
