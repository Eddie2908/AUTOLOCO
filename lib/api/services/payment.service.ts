import { apiClient, handleApiError } from "../client"
import type { Payment, CreatePaymentRequest } from "../types"

export const paymentService = {
  // Create payment
  async createPayment(data: CreatePaymentRequest) {
    const response = await apiClient.post<Payment>("/payments", data)

    if (response.error) {
      handleApiError(response.error, "Erreur lors du paiement")
      return null
    }

    return response.data
  },

  // Get payment status
  async getPaymentStatus(paymentId: string) {
    const response = await apiClient.get<Payment>(`/payments/${paymentId}`)

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },

  // Get payments for booking
  async getBookingPayments(bookingId: string) {
    const response = await apiClient.get<Payment[]>(`/payments/booking/${bookingId}`)

    if (response.error) {
      handleApiError(response.error)
      return null
    }

    return response.data
  },
}
