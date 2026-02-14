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

// DELETE a message (soft delete)
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
      return NextResponse.json(
        { error: "Session locale requise" },
        { status: 400 },
      )
    }

    const { id } = await ctx.params
    const messageId = Number.parseInt(id || "", 10)
    if (!Number.isFinite(messageId)) {
      return NextResponse.json(
        { error: "Message invalide" },
        { status: 400 },
      )
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { expediteurId: true, conversationId: true },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message introuvable" },
        { status: 404 },
      )
    }

    // Only the sender can delete their message
    if (message.expediteurId !== localUserId) {
      return NextResponse.json(
        { error: "Vous ne pouvez supprimer que vos propres messages" },
        { status: 403 },
      )
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { EstSupprime: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Delete message error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - update a message
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
      return NextResponse.json(
        { error: "Session locale requise" },
        { status: 400 },
      )
    }

    const { id } = await ctx.params
    const messageId = Number.parseInt(id || "", 10)
    if (!Number.isFinite(messageId)) {
      return NextResponse.json(
        { error: "Message invalide" },
        { status: 400 },
      )
    }

    const body = await req.json()
    const { contenu } = body || {}
    const content = String(contenu || "").trim()

    if (!content) {
      return NextResponse.json(
        { error: "Le contenu ne peut pas etre vide" },
        { status: 400 },
      )
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { expediteurId: true },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message introuvable" },
        { status: 404 },
      )
    }

    if (message.expediteurId !== localUserId) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que vos propres messages" },
        { status: 403 },
      )
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { ContenuMessage: content },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Update message error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
