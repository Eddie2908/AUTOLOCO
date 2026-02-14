"use client"

import { useUnreadCount } from "@/hooks/use-messages"

export function MessageBadge() {
  const { unreadCount } = useUnreadCount()

  if (!unreadCount) return null

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )
}
