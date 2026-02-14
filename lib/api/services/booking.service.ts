import { apiClient, handleApiError } from "../client"
import type { Booking, CreateBookingRequest } from "../types"

export const bookingService = {
  // Get all bookings for current user
  async getBookings() {
    const response = await apiClient.get<Booking[]>("/bookings")

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Get single booking
  async getBooking(id: string) {
    const response = await apiClient.get<Booking>(`/bookings/${id}`)

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Create booking
  async createBooking(data: CreateBookingRequest) {
    const response = await apiClient.post<Booking>("/bookings", data)

    if (response.error) {
      handleApiError(response.error, "Erreur lors de la création de la réservation")
      return null
    }

    return response.data
  },

  // Confirm booking (owner)
  async confirmBooking(id: string) {
    const response = await apiClient.put<Booking>(`/bookings/${id}/confirm`)

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Cancel booking
  async cancelBooking(id: string, reason?: string) {
    const response = await apiClient.put<Booking>(`/bookings/${id}/cancel`, { reason })

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Start rental
  async startRental(id: string) {
    const response = await apiClient.post<Booking>(`/bookings/${id}/start`)

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Complete rental
  async completeRental(id: string) {
    const response = await apiClient.post<Booking>(`/bookings/${id}/complete`)

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },
}
