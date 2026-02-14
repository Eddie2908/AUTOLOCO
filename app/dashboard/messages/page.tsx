"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import {
  useConversations,
  useConversationMessages,
  sendMessage,
  deleteMessage,
  deleteConversation,
  archiveConversation,
} from "@/hooks/use-messages"
import type { ConversationItem } from "@/hooks/use-messages"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatArea } from "@/components/messages/chat-area"
import { NewConversationDialog } from "@/components/messages/new-conversation-dialog"

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationItem | null>(null)
  const [showConversationList, setShowConversationList] = useState(true)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const {
    conversations,
    isLoading: conversationsLoading,
    mutate: mutateConversations,
  } = useConversations()

  const {
    messages,
    isLoading: messagesLoading,
    mutate: mutateMessages,
  } = useConversationMessages(selectedConversation?.id ?? null)

  const handleSelectConversation = useCallback(
    (conversation: ConversationItem) => {
      setSelectedConversation(conversation)
      setShowConversationList(false)
    },
    [],
  )

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedConversation) return
      setIsSending(true)
      try {
        await sendMessage(selectedConversation.id, content)
        await mutateMessages()
        await mutateConversations()
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'envoyer le message",
          variant: "destructive",
        })
      } finally {
        setIsSending(false)
      }
    },
    [selectedConversation, mutateMessages, mutateConversations],
  )

  const handleDeleteMessage = useCallback(
    async (messageId: number) => {
      try {
        await deleteMessage(messageId)
        await mutateMessages()
        toast({ title: "Message supprime" })
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de supprimer le message",
          variant: "destructive",
        })
      }
    },
    [mutateMessages],
  )

  const handleArchiveConversation = useCallback(
    async (id: number) => {
      try {
        await archiveConversation(id)
        if (selectedConversation?.id === id) {
          setSelectedConversation(null)
          setShowConversationList(true)
        }
        await mutateConversations()
        toast({ title: "Conversation archivee" })
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'archiver la conversation",
          variant: "destructive",
        })
      }
    },
    [selectedConversation, mutateConversations],
  )

  const handleDeleteConversation = useCallback(
    async (id: number) => {
      try {
        await deleteConversation(id)
        if (selectedConversation?.id === id) {
          setSelectedConversation(null)
          setShowConversationList(true)
        }
        await mutateConversations()
        toast({ title: "Conversation supprimee" })
      } catch (error: any) {
        toast({
          title: "Erreur",
          description:
            error.message || "Impossible de supprimer la conversation",
          variant: "destructive",
        })
      }
    },
    [selectedConversation, mutateConversations],
  )

  const handleNewConversationUser = useCallback(
    async (userId: number, userName: string) => {
      setIsSending(true)
      try {
        const res = await sendMessage(null, `Bonjour ${userName} !`, userId)
        await mutateConversations()

        // Find the new or existing conversation in the refreshed list
        if (res.conversation_id) {
          const refreshed = await fetch("/api/messages").then((r) => r.json())
          const found = refreshed.conversations?.find(
            (c: ConversationItem) => c.id === res.conversation_id,
          )
          if (found) {
            setSelectedConversation(found)
            setShowConversationList(false)
          }
        }

        toast({ title: "Conversation demarree" })
      } catch (error: any) {
        toast({
          title: "Erreur",
          description:
            error.message || "Impossible de demarrer la conversation",
          variant: "destructive",
        })
      } finally {
        setIsSending(false)
      }
    },
    [mutateConversations],
  )

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border overflow-hidden bg-card">
        {/* Conversations list */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0",
            !showConversationList && "hidden md:block",
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id ?? null}
            onSelect={handleSelectConversation}
            onNewConversation={() => setShowNewConversation(true)}
            onArchive={handleArchiveConversation}
            onDelete={handleDeleteConversation}
            isLoading={conversationsLoading}
          />
        </div>

        {/* Chat area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            showConversationList && "hidden md:flex",
          )}
        >
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            isLoading={messagesLoading}
            onSend={handleSend}
            onBack={() => setShowConversationList(true)}
            onDeleteMessage={handleDeleteMessage}
            isSending={isSending}
          />
        </div>
      </div>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onSelectUser={handleNewConversationUser}
      />
    </>
  )
}
