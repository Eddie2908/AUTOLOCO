/**
 * Unified Authentication Configuration
 * =====================================
 *
 * This module provides centralized configuration for the authentication system
 * that bridges NextAuth.js with the FastAPI backend.
 */

// Token storage keys
export const AUTH_CONFIG = {
  // Storage keys
  ACCESS_TOKEN_KEY: "autoloco_access_token",
  REFRESH_TOKEN_KEY: "autoloco_refresh_token",
  SESSION_USER_KEY: "autoloco_user",

  // Token expiration (in seconds)
  ACCESS_TOKEN_EXPIRE: 60 * 60, // 1 hour
  REFRESH_TOKEN_EXPIRE: 30 * 24 * 60 * 60, // 30 days
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days

  // API endpoints
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  API_V1_PREFIX: "/api/v1",

  // Auth routes
  ROUTES: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    CALLBACK: "/api/auth/callback",
    ERROR: "/auth/error",
  },

  // Protected route patterns
  PROTECTED_ROUTES: ["/dashboard", "/booking", "/profile"],

  // Auth routes (redirect to dashboard if already authenticated)
  AUTH_ROUTES: ["/auth/login", "/auth/register"],

  // Public routes
  PUBLIC_ROUTES: ["/", "/vehicles", "/about", "/contact", "/help"],

  // User types
  USER_TYPES: {
    LOCATAIRE: "locataire",
    PROPRIETAIRE: "proprietaire",
    ADMIN: "admin",
  } as const,

  // User statuses
  USER_STATUS: {
    VERIFIED: "verifie",
    ACTIVE: "Actif",
    PENDING: "en_attente",
    SUSPENDED: "suspendu",
  } as const,
} as const

// Type exports
export type UserType = (typeof AUTH_CONFIG.USER_TYPES)[keyof typeof AUTH_CONFIG.USER_TYPES]
export type UserStatus = (typeof AUTH_CONFIG.USER_STATUS)[keyof typeof AUTH_CONFIG.USER_STATUS]

// Demo users for fallback when backend is unavailable
export const DEMO_USERS = [
  {
    id: "USR-LOC-001",
    email: "locataire@autoloco.cm",
    password: "Demo@2024!",
    nom: "MBARGA",
    prenom: "Samuel",
    type: "locataire" as UserType,
    avatar: null,
    statut: "verifie" as UserStatus,
    telephone: "+237 690 000 001",
    ville: "Douala",
  },
  {
    id: "USR-PRO-001",
    email: "proprietaire@autoloco.cm",
    password: "Demo@2024!",
    nom: "KAMGA",
    prenom: "Jean-Pierre",
    type: "proprietaire" as UserType,
    avatar: null,
    statut: "verifie" as UserStatus,
    telephone: "+237 690 000 002",
    ville: "Yaoundé",
  },
  {
    id: "USR-ADM-001",
    email: "admin@autoloco.cm",
    password: "Admin@2024!",
    nom: "Administrateur",
    prenom: "Principal",
    type: "admin" as UserType,
    avatar: null,
    statut: "verifie" as UserStatus,
    telephone: "+237 690 000 000",
    ville: "Douala",
  },
  {
    id: "USR-LOC-002",
    email: "alice@autoloco.cm",
    password: "Demo@2024!",
    nom: "Nguema",
    prenom: "Alice",
    type: "locataire" as UserType,
    avatar: null,
    statut: "verifie" as UserStatus,
    telephone: "+237 690 000 003",
    ville: "Douala",
  },
  {
    id: "USR-PRO-002",
    email: "marc@autoloco.cm",
    password: "Demo@2024!",
    nom: "Fotso",
    prenom: "Marc",
    type: "proprietaire" as UserType,
    avatar: null,
    statut: "verifie" as UserStatus,
    telephone: "+237 690 000 004",
    ville: "Yaoundé",
  },
] as const

// Helper to get dashboard URL based on user type
export function getDashboardUrl(userType: UserType): string {
  switch (userType) {
    case "admin":
      return "/dashboard/admin"
    case "proprietaire":
      return "/dashboard/owner"
    case "locataire":
      return "/dashboard/renter"
    default:
      return "/dashboard"
  }
}

// Helper to check if a route is protected
export function isProtectedRoute(pathname: string): boolean {
  return AUTH_CONFIG.PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}

// Helper to check if a route is an auth route
export function isAuthRoute(pathname: string): boolean {
  return AUTH_CONFIG.AUTH_ROUTES.some((route) => pathname.startsWith(route))
}
