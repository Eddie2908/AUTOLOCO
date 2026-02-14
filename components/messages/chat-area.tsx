"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  Trash2,
  Copy,
  MessageSquare,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { ConversationItem, MessageItem } from "@/hooks/use-messages"
import { deleteMessage } from "@/hooks/use-messages"

interface ChatAreaProps {
  conversation: ConversationItem | null
  messages: MessageItem[]
  isLoading: boolean
  onSend: (content: string) => void
  onBack: () => void
  onDeleteMessage: (messageId: number) => void
  isSending: boolean
}

export function ChatArea({
  conversation,
  messages,
  isLoading,
  onSend,
  onBack,
  onDeleteMessage,
  isSending,
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (conversation) {
      inputRef.current?.focus()
    }
  }, [conversation?.id])

  const handleSend = () => {
    const content = newMessage.trim()
    if (!content || isSending) return
    onSend(content)
    setNewMessage("")
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copie", description: "Message copie dans le presse-papiers" })
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Vos messages</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Selectionnez une conversation ou demarrez-en une nouvelle pour
          commencer a discuter.
        </p>
      </div>
    )
  }

  const initials = conversation.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {conversation.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {conversation.online ? (
                <span className="text-green-500">En ligne</span>
              ) : (
                "Hors ligne"
              )}
              {conversation.vehicle && (
                <>
                  {" -- "}
                  <span className="text-primary/70">
                    {conversation.vehicle}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        {conversation.role && (
          <span
            className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0",
              conversation.role === "Admin"
                ? "bg-destructive/10 text-destructive"
                : conversation.role === "Proprietaire"
                  ? "bg-accent/10 text-accent-foreground"
                  : "bg-secondary text-secondary-foreground",
            )}
          >
            {conversation.role}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex animate-pulse",
                  i % 2 === 0 ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3",
                    i % 2 === 0
                      ? "bg-primary/20 w-48"
                      : "bg-muted w-56",
                  )}
                >
                  <div className="h-3 w-full bg-muted-foreground/10 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-muted-foreground/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-muted-foreground text-sm">
              Aucun message dans cette conversation.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Envoyez le premier message !
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMe = message.sender === "me"
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex group",
                    isMe ? "justify-end" : "justify-start",
                  )}
                >
                  <div className="relative max-w-[75%]">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-xs",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md",
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 mt-1",
                          isMe
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="text-[10px]">{message.time}</span>
                        {isMe &&
                          (message.status === "read" ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          ))}
                      </div>
                    </div>

                    {/* Message actions */}
                    <div
                      className={cn(
                        "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                        isMe ? "-left-8" : "-right-8",
                      )}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align={isMe ? "start" : "end"}
                          className="w-40"
                        >
                          <DropdownMenuItem
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copier
                          </DropdownMenuItem>
                          {isMe && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteMessage(message.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ecrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isSending}
              className="w-full h-10 rounded-full border border-input bg-muted/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>
          <Button
            size="icon"
            className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10 w-10"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
