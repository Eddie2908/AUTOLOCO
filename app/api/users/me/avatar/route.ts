import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

const BACKEND_API = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}`

function isValidAvatarUrl(url: string): boolean {
  if (url.length > 2048) return false
  // Accept relative paths (e.g. /uploads/xxx.jpg) from local upload
  if (url.startsWith("/uploads/")) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (accessToken.startsWith("demo_")) {
      return NextResponse.json({ error: "Non disponible en mode démo" }, { status: 403 })
    }

    const body = (await req.json().catch(() => null)) as null | { avatarUrl?: string }
    const avatarUrl = body?.avatarUrl

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json(
        { error: "Champs manquants", message: "avatarUrl est requis" },
        { status: 400 },
      )
    }

    if (!isValidAvatarUrl(avatarUrl)) {
      return NextResponse.json(
        { error: "URL invalide", message: "avatarUrl doit être une URL HTTP(S) valide" },
        { status: 400 },
      )
    }

    const backendRes = await fetch(`${BACKEND_API}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ photo_profil: avatarUrl }),
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail || "Erreur backend" },
        { status: backendRes.status },
      )
    }

    const data = await backendRes.json()
    return NextResponse.json(
      { id: String(data.id), avatar: data.photo_profil },
      { status: 200 },
    )
  } catch (error) {
    console.error("[API] Update avatar error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (accessToken.startsWith("demo_")) {
      return NextResponse.json({ avatar_url: null, has_avatar: false })
    }

    const backendRes = await fetch(`${BACKEND_API}/users/avatar`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!backendRes.ok) {
      return NextResponse.json({ avatar_url: null, has_avatar: false })
    }

    return NextResponse.json(await backendRes.json())
  } catch (error) {
    console.error("[API] Get avatar error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
