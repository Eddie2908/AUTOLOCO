"use client"

import { useState } from "react"
import { Search, Plus, Archive, Trash2, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ConversationItem } from "@/hooks/use-messages"

interface ConversationListProps {
  conversations: ConversationItem[]
  selectedId: number | null
  onSelect: (conversation: ConversationItem) => void
  onNewConversation: () => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
  isLoading: boolean
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  onArchive,
  onDelete,
  isLoading,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Messages</h2>
            {totalUnread > 0 && (
              <Badge className="bg-primary text-primary-foreground h-5 min-w-5 rounded-full px-1.5 text-xs">
                {totalUnread}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            aria-label="Nouvelle conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-muted/50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "Aucun resultat" : "Aucune conversation"}
            </p>
            {!searchQuery && (
              <Button
                variant="link"
                className="text-primary mt-2 text-sm"
                onClick={onNewConversation}
              >
                Demarrer une conversation
              </Button>
            )}
          </div>
        ) : (
          filtered.map((conversation) => (
            <div
              key={conversation.id}
              className="relative group"
            >
              <button
                onClick={() => onSelect(conversation)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-border/50",
                  "hover:bg-muted/50",
                  selectedId === conversation.id &&
                    "bg-primary/5 border-l-2 border-l-primary",
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={conversation.avatar}
                      alt={conversation.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {conversation.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "font-medium truncate text-sm",
                        conversation.unread > 0 && "font-semibold",
                      )}
                    >
                      {conversation.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {conversation.time}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm truncate mt-0.5",
                      conversation.unread > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {conversation.lastMessage || "Aucun message"}
                  </p>
                  {conversation.vehicle && (
                    <p className="text-xs text-primary/70 truncate mt-0.5">
                      {conversation.vehicle}
                    </p>
                  )}
                </div>
                {conversation.unread > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-5 min-w-5 p-0 flex items-center justify-center text-xs rounded-full flex-shrink-0">
                    {conversation.unread}
                  </Badge>
                )}
              </button>

              {/* Actions */}
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive(conversation.id)
                      }}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archiver
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(conversation.id)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
