/**
 * Register API Route
 * ===================
 *
 * Handles user registration with SQL Server database.
 * Supports both direct database registration and FastAPI backend fallback.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_CONFIG, type UserType } from "@/lib/auth/config";
import { registerUser, isEmailAvailable } from "@/lib/auth/register";
import { syncNewUserToBackend } from "@/lib/api/sync-service";

async function registerWithBackendFallback(data: {
  email: string;
  password: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
  type_utilisateur: UserType;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, nom, prenom, telephone, ville, type_utilisateur } =
      body;

    if (!email || !password || !nom) {
      return NextResponse.json(
        { error: "Email, mot de passe et nom sont requis" },
        { status: 400 },
      );
    }

    const result = await registerUser({
      email,
      password,
      nom,
      prenom: prenom || nom,
      telephone,
      type: (type_utilisateur as "locataire" | "proprietaire") || "locataire",
      ville,
    });

    if (result.success && result.user) {
      // ✨ NOUVEAU: Synchroniser aussi au backend
      const syncResult = await syncNewUserToBackend({
        email,
        password,
        nom,
        prenom,
        telephone,
        ville,
        type_utilisateur: (type_utilisateur as UserType) || "locataire",
      });

      console.log("[API] Backend sync result:", syncResult);

      return NextResponse.json(
        {
          success: true,
          message: "Inscription réussie",
          data: {
            user: result.user,
          },
          backendSynced: syncResult.synced,
        },
        { status: 201 },
      );
    }

    if (result.code === "INTERNAL_ERROR") {
      const backendResult = await registerWithBackendFallback({
        email,
        password,
        nom,
        prenom,
        telephone,
        ville,
        type_utilisateur: (type_utilisateur as UserType) || "locataire",
      });

      if (backendResult) {
        // Set cookie if backend returns token
        if (backendResult.access_token) {
          const cookieStore = await cookies();
          cookieStore.set(
            AUTH_CONFIG.ACCESS_TOKEN_KEY,
            backendResult.access_token,
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE,
              path: "/",
            },
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: "Inscription réussie",
            data: backendResult,
          },
          { status: 201 },
        );
      }
    }

    // Return the error from direct registration
    return NextResponse.json(
      { error: result.error || "Erreur lors de l'inscription" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[API] Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const available = await isEmailAvailable(email);

    return NextResponse.json({ available });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
