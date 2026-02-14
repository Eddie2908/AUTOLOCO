"use client"

import useSWR, { type SWRConfiguration } from "swr"
import { authService } from "@/lib/api/services/auth.service"
import { apiClient } from "@/lib/api/client"

export function useCurrentUser(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    "/users/me",
    async () => {
      const response = await authService.getCurrentUser()
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      ...options,
    },
  )

  return {
    user: data || null,
    isLoading,
    error,
    mutate,
  }
}

export function useUserProfile(userId: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/users/${userId}` : null,
    async () => {
      if (!userId) return null
      const response = await apiClient.get(`/users/${userId}`)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: false,
      ...options,
    },
  )

  return {
    user: data || null,
    isLoading,
    error,
    mutate,
  }
}

export function useAdminUsers(
  filters?: {
    type?: string
    status?: string
    search?: string
  },
  options?: SWRConfiguration,
) {
  const queryKey = filters ? `/admin/users?${JSON.stringify(filters)}` : "/admin/users"

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    async () => {
      const response = await apiClient.get("/admin/users", filters)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      ...options,
    },
  )

  return {
    users: data?.users || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}
