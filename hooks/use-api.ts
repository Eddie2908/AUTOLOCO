"use client"

import useSWR, { type SWRConfiguration } from "swr"
import { apiClient } from "@/lib/api/client"

// Generic fetcher for SWR
const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url)
  if (response.error) {
    throw new Error(response.error.message)
  }
  return response.data!
}

// Hook for fetching data with SWR
export function useApi<T>(endpoint: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(endpoint, fetcher, {
    revalidateOnFocus: false,
    ...options,
  })

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

// Hook for current user
export function useCurrentUser() {
  return useApi<any>("/users/me")
}

// Hook for vehicles search
export function useVehicles(params?: any) {
  const queryParams = params ? `?${new URLSearchParams(params).toString()}` : ""
  return useApi<any>(`/search/vehicles${queryParams}`)
}

// Hook for single vehicle
export function useVehicle(id: string | null) {
  return useApi<any>(id ? `/vehicles/${id}` : null)
}

// Hook for bookings
export function useBookings() {
  return useApi<any>("/bookings")
}

// Hook for notifications
export function useNotifications() {
  return useApi<any>("/notifications")
}
