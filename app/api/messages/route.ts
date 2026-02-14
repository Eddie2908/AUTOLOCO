import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (localUserId) {
      const conversations = await prisma.conversations.findMany({
        where: {
          OR: [{ IdentifiantUtilisateur1: localUserId }, { IdentifiantUtilisateur2: localUserId }],
        },
        orderBy: { DateDernierMessage: "desc" },
        take: 100,
        select: {
          IdentifiantConversation: true,
          IdentifiantUtilisateur1: true,
          IdentifiantUtilisateur2: true,
          DateDernierMessage: true,
          Vehicules: { select: { TitreAnnonce: true } },
          Utilisateurs_Conversations_IdentifiantUtilisateur1ToUtilisateurs: {
            select: { id: true, Nom: true, Prenom: true, PhotoProfil: true },
          },
          Utilisateurs_Conversations_IdentifiantUtilisateur2ToUtilisateurs: {
            select: { id: true, Nom: true, Prenom: true, PhotoProfil: true },
          },
          Messages: {
            take: 1,
            orderBy: { DateEnvoi: "desc" },
            select: { ContenuMessage: true, DateEnvoi: true },
          },
          _count: {
            select: {
              Messages: true,
            },
          },
        },
      })

      const withUnread = await Promise.all(
        conversations.map(async (c) => {
          const otherUser =
            c.Utilisateurs_Conversations_IdentifiantUtilisateur1ToUtilisateurs.id === localUserId
              ? c.Utilisateurs_Conversations_IdentifiantUtilisateur2ToUtilisateurs
              : c.Utilisateurs_Conversations_IdentifiantUtilisateur1ToUtilisateurs

          const unread = await prisma.message.count({
            where: {
              conversationId: c.IdentifiantConversation,
              destinataireId: localUserId,
              EstLu: false,
            },
          })

          const last = c.Messages[0]
          const lastDate = last?.DateEnvoi ? new Date(last.DateEnvoi) : c.DateDernierMessage ? new Date(c.DateDernierMessage) : null
          const time = lastDate
            ? lastDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            : ""

          const name = `${otherUser.Prenom || ""} ${otherUser.Nom || ""}`.trim() || "Utilisateur"

          return {
            id: c.IdentifiantConversation,
            name,
            avatar: otherUser.PhotoProfil || "/placeholder-user.jpg",
            lastMessage: last?.ContenuMessage || "",
            time,
            unread,
            online: false,
            vehicle: c.Vehicules?.TitreAnnonce || "",
          }
        }),
      )

      return NextResponse.json({ conversations: withUnread, total: withUnread.length })
    }

    const response = await backendApi.getConversations(token)

    if (response.error) {
      return NextResponse.json({ conversations: [], total: 0 })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Messages fetch error:", error)
    return NextResponse.json({ conversations: [], total: 0 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { destinataire_id, contenu, conversation_id, identifiant_destinataire } = body || {}
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (localUserId) {
      const content = String(contenu || "").trim()
      if (!content) {
        return NextResponse.json({ error: "Message vide" }, { status: 400 })
      }

      let conversationId: number | null = null
      if (conversation_id != null) {
        const n = Number.parseInt(String(conversation_id), 10)
        if (Number.isFinite(n)) conversationId = n
      }

      if (!conversationId) {
        const destId = Number.parseInt(String(destinataire_id || ""), 10)
        if (!Number.isFinite(destId)) {
          return NextResponse.json({ error: "Destinataire invalide" }, { status: 400 })
        }

        const [a, b] = localUserId < destId ? [localUserId, destId] : [destId, localUserId]
        const existing = await prisma.conversations.findFirst({
          where: {
            IdentifiantUtilisateur1: a,
            IdentifiantUtilisateur2: b,
            StatutConversation: "Active",
          },
          select: { IdentifiantConversation: true },
        })

        if (existing) {
          conversationId = existing.IdentifiantConversation
        } else {
          const created = await prisma.conversations.create({
            data: {
              IdentifiantUtilisateur1: a,
              IdentifiantUtilisateur2: b,
              SujetConversation: null,
              StatutConversation: "Active",
              DateCreation: new Date(),
              DateDernierMessage: new Date(),
              NombreMessages: 0,
            },
            select: { IdentifiantConversation: true },
          })
          conversationId = created.IdentifiantConversation
        }
      }

      const conv = await prisma.conversations.findUnique({
        where: { IdentifiantConversation: conversationId },
        select: {
          IdentifiantUtilisateur1: true,
          IdentifiantUtilisateur2: true,
        },
      })

      if (!conv) {
        return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 })
      }

      const isMember = conv.IdentifiantUtilisateur1 === localUserId || conv.IdentifiantUtilisateur2 === localUserId
      if (!isMember) {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
      }

      const destId = conv.IdentifiantUtilisateur1 === localUserId ? conv.IdentifiantUtilisateur2 : conv.IdentifiantUtilisateur1

      const msg = await prisma.message.create({
        data: {
          conversationId,
          expediteurId: localUserId,
          destinataireId: destId,
          ContenuMessage: content,
          TypeMessage: "Texte",
          DateEnvoi: new Date(),
          EstLu: false,
        },
        select: { id: true, DateEnvoi: true },
      })

      await prisma.conversations.update({
        where: { IdentifiantConversation: conversationId },
        data: {
          DateDernierMessage: new Date(),
          NombreMessages: { increment: 1 },
        },
      })

      // Create a notification for the recipient
      const sender = await prisma.user.findUnique({
        where: { id: localUserId },
        select: { Prenom: true, Nom: true },
      })
      const senderName = sender
        ? `${sender.Prenom || ""} ${sender.Nom || ""}`.trim()
        : "Quelqu'un"

      await prisma.notification.create({
        data: {
          utilisateurId: destId,
          TypeNotification: "Message",
          TitreNotification: `Nouveau message de ${senderName}`,
          MessageNotification:
            content.length > 100 ? content.slice(0, 100) + "..." : content,
          LienNotification: "/dashboard/messages",
          PrioriteNotification: "Normal",
          CanalEnvoi: "InApp",
          DateCreation: new Date(),
          EstLu: false,
          EstArchive: false,
        },
      }).catch(() => {
        // Non-critical: don't block message sending if notification fails
      })

      return NextResponse.json({ id: msg.id, conversation_id: conversationId }, { status: 201 })
    }

    const recipientIdRaw = destinataire_id ?? identifiant_destinataire
    const recipientId = Number.parseInt(String(recipientIdRaw ?? ""), 10)

    if (!Number.isFinite(recipientId)) {
      return NextResponse.json({ error: "Destinataire invalide" }, { status: 400 })
    }

    const response = await backendApi.sendMessage(recipientId, contenu, token)

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: response.status || 400 })
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error("[API] Send message error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
