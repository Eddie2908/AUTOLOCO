"use client"

import useSWR, { type SWRConfiguration } from "swr"
import { notificationService } from "@/lib/api/services/notification.service"

export function useNotifications(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    "/notifications",
    async () => {
      const response = await notificationService.getNotifications()
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Poll every 30 seconds
      ...options,
    },
  )

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    error,
    mutate,
  }
}

export async function markAsRead(notificationId: string) {
  return await notificationService.markAsRead(notificationId)
}

export async function markAllAsRead() {
  return await notificationService.markAllAsRead()
}
