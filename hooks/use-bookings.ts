"use client"

import useSWR, { type SWRConfiguration } from "swr"
import { bookingService } from "@/lib/api/services/booking.service"

export function useBookings(
  filters?: {
    status?: string
    startDate?: string
    endDate?: string
  },
  options?: SWRConfiguration,
) {
  const queryKey = filters ? `/bookings?${JSON.stringify(filters)}` : "/bookings"

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    async () => {
      const response = await bookingService.getMyBookings(filters)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30s
      ...options,
    },
  )

  return {
    bookings: data?.bookings || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}

export function useBooking(id: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/bookings/${id}` : null,
    async () => {
      if (!id) return null
      const response = await bookingService.getBookingById(id)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      ...options,
    },
  )

  return {
    booking: data || null,
    isLoading,
    error,
    mutate,
  }
}

export function useOwnerBookings(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    "/bookings/owner",
    async () => {
      const response = await bookingService.getMyBookings({ role: "owner" })
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
      ...options,
    },
  )

  return {
    bookings: data?.bookings || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}

export function useAdminBookings(filters?: any, options?: SWRConfiguration) {
  const queryKey = filters ? `/admin/bookings?${JSON.stringify(filters)}` : "/admin/bookings"

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    async () => {
      // TODO: Replace with actual admin service when available
      const response = await bookingService.getMyBookings(filters)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      ...options,
    },
  )

  return {
    bookings: data?.bookings || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}
