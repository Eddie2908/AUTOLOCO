import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"
import { getAuthenticatedUser } from "@/lib/auth/get-auth-user"
import { notificationPreferencesSchema, formatZodErrors } from "@/lib/validations/profile"

// ---- GET /api/users/me/preferences ----
export async function GET() {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (auth.tokenType === "demo") {
      // Return sensible defaults for demo users
      return NextResponse.json({
        notificationsEmail: true,
        notificationsSMS: true,
        notificationsPush: true,
        notificationsReservations: true,
        notificationsPromotions: false,
        notificationsMessages: true,
        notificationsAvis: true,
      })
    }

    if (auth.tokenType === "local") {
      const prefs = await prisma.preferenceUtilisateur.findUnique({
        where: { utilisateurId: auth.userId },
      })

      // Return defaults if no prefs record exists yet
      return NextResponse.json({
        notificationsEmail: prefs?.NotificationsEmail ?? true,
        notificationsSMS: prefs?.NotificationsSMS ?? true,
        notificationsPush: prefs?.NotificationsPush ?? true,
        notificationsReservations: prefs?.NotificationsReservations ?? true,
        notificationsPromotions: prefs?.NotificationsPromotions ?? false,
        notificationsMessages: prefs?.NotificationsMessages ?? true,
        notificationsAvis: prefs?.NotificationsAvis ?? true,
      })
    }

    // Backend proxy -- the preferences table is the same across both paths
    // For now, just return defaults since backend might not have a dedicated endpoint
    return NextResponse.json({
      notificationsEmail: true,
      notificationsSMS: true,
      notificationsPush: true,
      notificationsReservations: true,
      notificationsPromotions: false,
      notificationsMessages: true,
      notificationsAvis: true,
    })
  } catch (error) {
    console.error("[API] GET preferences error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// ---- PUT /api/users/me/preferences ----
export async function PUT(req: Request) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (auth.tokenType === "demo") {
      return NextResponse.json({ error: "Non disponible en mode demo" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Corps de requete invalide" }, { status: 400 })
    }

    // Validate with Zod
    const validation = notificationPreferencesSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: formatZodErrors(validation.error) },
        { status: 422 },
      )
    }

    const data = validation.data

    if (auth.tokenType === "local" || auth.tokenType === "backend") {
      const userId = auth.userId
      if (userId <= 0) {
        return NextResponse.json({ error: "Utilisateur non identifie" }, { status: 400 })
      }

      await prisma.preferenceUtilisateur.upsert({
        where: { utilisateurId: userId },
        update: {
          NotificationsEmail: data.notificationsEmail,
          NotificationsSMS: data.notificationsSMS,
          NotificationsPush: data.notificationsPush,
          NotificationsReservations: data.notificationsReservations,
          NotificationsPromotions: data.notificationsPromotions,
          NotificationsMessages: data.notificationsMessages,
          NotificationsAvis: data.notificationsAvis,
          DateMiseAJour: new Date(),
        },
        create: {
          utilisateurId: userId,
          NotificationsEmail: data.notificationsEmail,
          NotificationsSMS: data.notificationsSMS,
          NotificationsPush: data.notificationsPush,
          NotificationsReservations: data.notificationsReservations,
          NotificationsPromotions: data.notificationsPromotions,
          NotificationsMessages: data.notificationsMessages,
          NotificationsAvis: data.notificationsAvis,
        },
      })

      return NextResponse.json({ message: "Preferences mises a jour avec succes", ...data })
    }

    return NextResponse.json({ error: "Operation non supportee" }, { status: 400 })
  } catch (error) {
    console.error("[API] PUT preferences error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
