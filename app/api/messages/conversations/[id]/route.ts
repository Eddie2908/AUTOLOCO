import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

// DELETE a conversation (soft delete / archive)
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (!localUserId) {
      return NextResponse.json({ error: "Session locale requise" }, { status: 400 })
    }

    const { id } = await ctx.params
    const conversationId = Number.parseInt(id || "", 10)
    if (!Number.isFinite(conversationId)) {
      return NextResponse.json({ error: "Conversation invalide" }, { status: 400 })
    }

    const conversation = await prisma.conversations.findUnique({
      where: { IdentifiantConversation: conversationId },
      select: { IdentifiantUtilisateur1: true, IdentifiantUtilisateur2: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 })
    }

    const isMember =
      conversation.IdentifiantUtilisateur1 === localUserId ||
      conversation.IdentifiantUtilisateur2 === localUserId
    if (!isMember) {
      return NextResponse.json({ error: "Acces non autorise" }, { status: 403 })
    }

    await prisma.conversations.update({
      where: { IdentifiantConversation: conversationId },
      data: { StatutConversation: "Supprimee" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Delete conversation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH a conversation (archive)
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (!localUserId) {
      return NextResponse.json({ error: "Session locale requise" }, { status: 400 })
    }

    const { id } = await ctx.params
    const conversationId = Number.parseInt(id || "", 10)
    if (!Number.isFinite(conversationId)) {
      return NextResponse.json({ error: "Conversation invalide" }, { status: 400 })
    }

    const body = await req.json()
    const { action } = body || {}

    const conversation = await prisma.conversations.findUnique({
      where: { IdentifiantConversation: conversationId },
      select: { IdentifiantUtilisateur1: true, IdentifiantUtilisateur2: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 })
    }

    const isMember =
      conversation.IdentifiantUtilisateur1 === localUserId ||
      conversation.IdentifiantUtilisateur2 === localUserId
    if (!isMember) {
      return NextResponse.json({ error: "Acces non autorise" }, { status: 403 })
    }

    if (action === "archive") {
      await prisma.conversations.update({
        where: { IdentifiantConversation: conversationId },
        data: { StatutConversation: "Archivee" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Patch conversation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
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
    if (!localUserId) {
      return NextResponse.json({ error: "Session locale requise" }, { status: 400 })
    }

    const { id } = await ctx.params
    const conversationId = Number.parseInt(id || "", 10)
    if (!Number.isFinite(conversationId)) {
      return NextResponse.json({ error: "Conversation invalide" }, { status: 400 })
    }

    const conversation = await prisma.conversations.findUnique({
      where: { IdentifiantConversation: conversationId },
      select: {
        IdentifiantConversation: true,
        IdentifiantUtilisateur1: true,
        IdentifiantUtilisateur2: true,
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 })
    }

    const isMember =
      conversation.IdentifiantUtilisateur1 === localUserId || conversation.IdentifiantUtilisateur2 === localUserId
    if (!isMember) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        destinataireId: localUserId,
        EstLu: false,
      },
      data: {
        EstLu: true,
        DateLecture: new Date(),
      },
    })

    const messages = await prisma.message.findMany({
      where: { conversationId, EstSupprime: { not: true } },
      orderBy: { DateEnvoi: "asc" },
      take: 200,
      select: {
        id: true,
        expediteurId: true,
        ContenuMessage: true,
        DateEnvoi: true,
        EstLu: true,
      },
    })

    const mapped = messages.map((m) => {
      const date = m.DateEnvoi ? new Date(m.DateEnvoi) : new Date()
      const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

      return {
        id: m.id,
        sender: m.expediteurId === localUserId ? ("me" as const) : ("other" as const),
        content: m.ContenuMessage,
        time,
        status: m.EstLu ? ("read" as const) : ("delivered" as const),
      }
    })

    return NextResponse.json({ messages: mapped })
  } catch (error) {
    console.error("[API] Conversation messages fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
