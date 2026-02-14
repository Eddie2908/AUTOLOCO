import { apiClient } from "../client"
import type { NotificationResponse } from "../types"

export const notificationService = {
  // Get notifications
  async getNotifications(params: { skip?: number; limit?: number; unread_only?: boolean } = {}) {
    const queryParams = new URLSearchParams()
    if (params.skip) queryParams.append("skip", String(params.skip))
    if (params.limit) queryParams.append("limit", String(params.limit))
    if (params.unread_only) queryParams.append("unread_only", "true")

    const response = await apiClient.get<NotificationResponse>(`/notifications?${queryParams.toString()}`)

    if (response.error) {
      return null
    }

    return response.data
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`)

    if (response.error) {
      return false
    }

    return true
  },

  // Mark all as read
  async markAllAsRead() {
    const response = await apiClient.put("/notifications/read-all")

    if (response.error) {
      return false
    }

    return true
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const response = await apiClient.delete(`/notifications/${notificationId}`)

    if (response.error) {
      return false
    }

    return true
  },
}
