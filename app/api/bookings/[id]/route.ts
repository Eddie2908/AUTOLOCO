import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/security/rate-limiter"
import { logResourceAction, logPermissionDenied } from "@/lib/security/audit-log"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"

function canAccessBookingForUser(userRole: string, userId: string, booking: any): boolean {
  if (userRole === "admin") return true
  if (booking?.locataire_id && booking.locataire_id === userId) return true
  if (booking?.vehicule?.proprietaire_id && booking.vehicule.proprietaire_id === userId) return true
  return false
}

function canModifyBookingForUser(userRole: string, userId: string, booking: any): boolean {
  if (userRole === "admin") return true
  if (booking?.locataire_id === userId && (booking?.statut === "en_attente" || booking?.statut === "confirmee")) {
    return true
  }
  return false
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const accessToken = headerToken || cookieToken

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const currentUser = accessToken.startsWith("demo_") ? null : await getCurrentUserFromBackend(accessToken)
    const userId = currentUser?.id || "demo-user"
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value || "locataire"

    // Rate limiting
    const rateLimitResult = await applyRateLimit(req, "API", userId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${apiUrl}/api/v1/bookings/${params.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      // Ne pas révéler si la réservation existe ou non
      return NextResponse.json(
        { error: "Réservation non accessible" },
        { status: 404, headers: rateLimitResult.headers }
      )
    }

    const booking = await response.json()

    // Vérifier que l'utilisateur a le droit d'accéder à cette réservation
    if (!canAccessBookingForUser(userRole, userId, booking)) {
      await logPermissionDenied(
        null,
        req,
        { id: params.id, type: "booking" },
        "GET booking"
      )
      
      // Retourner 404 plutôt que 403 pour ne pas révéler l'existence de la ressource
      return NextResponse.json(
        { error: "Réservation non accessible" },
        { status: 404, headers: rateLimitResult.headers }
      )
    }

    const responseObj = NextResponse.json(booking)
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error) {
    console.error("Booking fetch error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const accessToken = headerToken || cookieToken

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const currentUser = accessToken.startsWith("demo_") ? null : await getCurrentUserFromBackend(accessToken)
    const userId = currentUser?.id || "demo-user"
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value || "locataire"

    // Rate limiting pour les modifications
    const rateLimitResult = await applyRateLimit(req, "CRITICAL", userId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    // D'abord récupérer la réservation pour vérifier les permissions
    const getResponse = await fetch(`${apiUrl}/api/v1/bookings/${params.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!getResponse.ok) {
      return NextResponse.json(
        { error: "Réservation non accessible" },
        { status: 404, headers: rateLimitResult.headers }
      )
    }

    const booking = await getResponse.json()

    // Vérifier les permissions de modification
    if (!canModifyBookingForUser(userRole, userId, booking)) {
      await logPermissionDenied(
        null,
        req,
        { id: params.id, type: "booking" },
        "PATCH booking"
      )
      
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier cette réservation" },
        { status: 403, headers: rateLimitResult.headers }
      )
    }

    const body = await req.json()

    // Empêcher la modification de certains champs sensibles
    const allowedFields = ["statut", "date_debut", "date_fin", "lieu_prise", "lieu_retour"]
    const sanitizedBody = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: body[key] }), {})

    const patchResponse = await fetch(`${apiUrl}/api/v1/bookings/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(sanitizedBody),
    })

    if (!patchResponse.ok) {
      const error = await patchResponse.json()
      await logResourceAction(
        "MODIFY_BOOKING",
        null,
        req,
        { id: params.id, type: "booking" },
        false,
        sanitizedBody,
        error.detail
      )
      
      return NextResponse.json(
        { error: "Impossible de modifier la réservation" },
        { status: patchResponse.status, headers: rateLimitResult.headers }
      )
    }

    const updatedBooking = await patchResponse.json()

    await logResourceAction(
      "MODIFY_BOOKING",
      null,
      req,
      { id: params.id, type: "booking" },
      true,
      sanitizedBody
    )

    const responseObj = NextResponse.json(updatedBooking)
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error) {
    console.error("Booking update error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const accessToken = headerToken || cookieToken

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const currentUser = accessToken.startsWith("demo_") ? null : await getCurrentUserFromBackend(accessToken)
    const userId = currentUser?.id || "demo-user"
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value || "locataire"

    // Rate limiting
    const rateLimitResult = await applyRateLimit(req, "CRITICAL", userId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    // Récupérer la réservation pour vérifier les permissions
    const getResponse = await fetch(`${apiUrl}/api/v1/bookings/${params.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!getResponse.ok) {
      return NextResponse.json(
        { error: "Réservation non accessible" },
        { status: 404, headers: rateLimitResult.headers }
      )
    }

    const booking = await getResponse.json()

    // Vérifier les permissions
    if (!canModifyBookingForUser(userRole, userId, booking)) {
      await logPermissionDenied(
        null,
        req,
        { id: params.id, type: "booking" },
        "DELETE booking"
      )
      
      return NextResponse.json(
        { error: "Vous ne pouvez pas annuler cette réservation" },
        { status: 403, headers: rateLimitResult.headers }
      )
    }

    const deleteResponse = await fetch(`${apiUrl}/api/v1/bookings/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!deleteResponse.ok) {
      await logResourceAction(
        "CANCEL_BOOKING",
        null,
        req,
        { id: params.id, type: "booking" },
        false,
        undefined,
        "Erreur backend"
      )
      
      return NextResponse.json(
        { error: "Impossible d'annuler la réservation" },
        { status: deleteResponse.status, headers: rateLimitResult.headers }
      )
    }

    await logResourceAction(
      "CANCEL_BOOKING",
      null,
      req,
      { id: params.id, type: "booking" },
      true
    )

    const responseObj = NextResponse.json({ success: true })
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error) {
    console.error("Booking delete error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
