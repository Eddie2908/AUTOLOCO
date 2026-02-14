import { NextResponse } from "next/server"
import { emailService } from "@/lib/email/service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { applyRateLimit } from "@/lib/security/rate-limiter"
import { logResourceAction } from "@/lib/security/audit-log"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const currentUser = accessToken.startsWith("demo_") ? null : await getCurrentUserFromBackend(accessToken)
    const userId = currentUser?.id || "demo-user"
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value || "locataire"
    const userEmail = currentUser?.email
    const userName = currentUser ? `${currentUser.prenom || ""} ${currentUser.nom}`.trim() || currentUser.nom : "Client"

    // Vérifier les permissions (seulement locataires et admin)
    if (userRole !== "locataire" && userRole !== "admin") {
      await logResourceAction(
        "PERMISSION_DENIED",
        null,
        req,
        { id: "new", type: "booking" },
        false,
        undefined,
        "Rôle insuffisant pour créer une réservation"
      )
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    // Rate limiting pour la création de réservations
    const rateLimitResult = await applyRateLimit(req, "CRITICAL", userId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const body = await req.json()

    // Vérifier que l'utilisateur crée la réservation pour lui-même
    if (body.locataire_id && body.locataire_id !== userId) {
      await logResourceAction(
        "PERMISSION_DENIED",
        null,
        req,
        { id: "new", type: "booking" },
        false,
        { attempted_locataire_id: body.locataire_id },
        "Tentative de créer une réservation pour un autre utilisateur"
      )
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 })
    }

    // S'assurer que le locataire_id est celui de l'utilisateur connecté
    body.locataire_id = userId

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${apiUrl}/api/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      await logResourceAction(
        "CREATE_BOOKING",
        null,
        req,
        { id: "new", type: "booking" },
        false,
        undefined,
        error.detail || "Erreur backend"
      )
      return NextResponse.json(
        { error: "Impossible de créer la réservation" },
        { status: response.status, headers: rateLimitResult.headers }
      )
    }

    const booking = await response.json()

    // Logger la création réussie
    await logResourceAction(
      "CREATE_BOOKING",
      null,
      req,
      { id: booking.id, type: "booking" },
      true,
      { vehicule_id: booking.vehicule_id }
    )

    try {
      const emailResult = await emailService.sendBookingConfirmation({
        to: userEmail || "",
        userName,
        bookingId: booking.id,
        vehicleName: `${booking.vehicule?.marque} ${booking.vehicule?.modele}`,
        vehicleImage: booking.vehicule?.photos?.[0]?.url || "/placeholder.svg",
        startDate: format(new Date(booking.date_debut), "d MMMM yyyy", { locale: fr }),
        endDate: format(new Date(booking.date_fin), "d MMMM yyyy", { locale: fr }),
        pickupLocation: booking.lieu_prise,
        totalPrice: booking.prix_total,
        ownerName: booking.vehicule?.proprietaire?.nom || "Propriétaire",
        ownerPhone: booking.vehicule?.proprietaire?.telephone || "",
        bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/booking/confirmation/${booking.id}`,
      })

      if (!emailResult.success) {
        console.error("Failed to send confirmation email:", emailResult.error)
      }
    } catch (emailError) {
      console.error("Email error:", emailError)
    }

    const responseObj = NextResponse.json(booking, { status: 201 })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error: any) {
    console.error("Booking creation error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await req.json()
    const bookingId = body.booking_id
    const motif = body.motif || "Annulée par le locataire"

    if (!bookingId) {
      return NextResponse.json({ error: "ID de réservation manquant" }, { status: 400 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${apiUrl}/api/v1/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ motif }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.detail || "Impossible d'annuler la réservation" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Booking cancel error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const currentUser = accessToken.startsWith("demo_") ? null : await getCurrentUserFromBackend(accessToken)
    const userId = currentUser?.id || "demo-user"
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value || "locataire"

    // Rate limiting pour les requêtes GET
    const rateLimitResult = await applyRateLimit(req, "API", userId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${apiUrl}/api/v1/bookings`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les réservations" },
        { status: response.status, headers: rateLimitResult.headers }
      )
    }

    let bookings = await response.json()

    // Filtrer les réservations accessibles par l'utilisateur
    // (le backend devrait déjà le faire, mais double vérification côté frontend)
    if (userRole !== "admin") {
      bookings = bookings.filter((booking: any) => {
        if (booking?.locataire_id && booking.locataire_id === userId) return true
        if (booking?.vehicule?.proprietaire_id && booking.vehicule.proprietaire_id === userId) return true
        return false
      })
    }

    const responseObj = NextResponse.json(bookings)
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error) {
    console.error("Bookings fetch error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
