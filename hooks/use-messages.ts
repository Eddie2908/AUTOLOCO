"use client"

import useSWR from "swr"

// ---------- Types ----------

export interface ConversationItem {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  online: boolean
  vehicle: string
  role?: string
}

export interface MessageItem {
  id: number
  sender: "me" | "other"
  content: string
  time: string
  status: "read" | "delivered" | "sent"
  type?: string
}

// ---------- Fetchers ----------

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Erreur de chargement")
  return res.json()
}

// ---------- Conversations Hook ----------

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<{
    conversations: ConversationItem[]
    total: number
  }>("/api/messages", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 15000,
  })

  return {
    conversations: data?.conversations ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}

// ---------- Messages Hook ----------

export function useConversationMessages(conversationId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<{
    messages: MessageItem[]
  }>(
    conversationId ? `/api/messages/conversations/${conversationId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 8000,
    },
  )

  return {
    messages: data?.messages ?? [],
    isLoading,
    error,
    mutate,
  }
}

// ---------- Unread Count Hook ----------

export function useUnreadCount() {
  const { data, mutate } = useSWR<{ count: number }>(
    "/api/messages/unread-count",
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 20000,
    },
  )

  return {
    unreadCount: data?.count ?? 0,
    mutate,
  }
}

// ---------- Actions ----------

export async function sendMessage(
  conversationId: number | null,
  contenu: string,
  destinataireId?: number,
) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      contenu,
      destinataire_id: destinataireId,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Erreur d'envoi")
  }
  return res.json()
}

export async function deleteMessage(messageId: number) {
  const res = await fetch(`/api/messages/${messageId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Erreur de suppression")
  }
  return res.json()
}

export async function deleteConversation(conversationId: number) {
  const res = await fetch(`/api/messages/conversations/${conversationId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Erreur de suppression")
  }
  return res.json()
}

export async function archiveConversation(conversationId: number) {
  const res = await fetch(`/api/messages/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "archive" }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Erreur d'archivage")
  }
  return res.json()
}

export async function searchUsers(query: string) {
  const res = await fetch(
    `/api/messages/search-users?q=${encodeURIComponent(query)}`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.users ?? []
}
