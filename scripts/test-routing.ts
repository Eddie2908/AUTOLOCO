#!/usr/bin/env node

/**
 * Script de Diagnostic du Routage
 * ================================
 *
 * Ce script vérifie la configuration du routage et identifie
 * les problèmes potentiels.
 *
 * Usage: node scripts/test-routing.ts
 */

const fs = require("fs");
const path = require("path");

// Couleurs pour la sortie console
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath: string, description: string): boolean {
  const exists = fs.existsSync(filePath);
  const status = exists ? "✅" : "❌";
  log(exists ? colors.green : colors.red, `${status} ${description}`);
  if (exists) {
    log(colors.cyan, `   → ${filePath}`);
  }
  return exists;
}

function checkFileContent(
  filePath: string,
  searchStrings: string[],
  description: string,
): boolean {
  if (!fs.existsSync(filePath)) {
    log(colors.red, `❌ ${description} - Fichier non trouvé`);
    return false;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const allFound = searchStrings.every((str) => content.includes(str));

  if (allFound) {
    log(colors.green, `✅ ${description}`);
    return true;
  } else {
    log(colors.red, `❌ ${description} - Contenu incorrect`);
    searchStrings.forEach((str) => {
      const found = content.includes(str);
      log(
        found ? colors.green : colors.yellow,
        `   ${found ? "✓" : "✗"} "${str}"`,
      );
    });
    return false;
  }
}

// Début du diagnostic
log(colors.blue, "\n═══════════════════════════════════════════");
log(colors.blue, "  DIAGNOSTIC DU ROUTAGE - AUTOLOCO");
log(colors.blue, "═══════════════════════════════════════════\n");

const rootDir = path.join(__dirname, "..");
const checks = {
  passed: 0,
  failed: 0,
};

// ===== SECTION 1: Fichiers Critiques =====
log(colors.cyan, "📁 FICHIERS CRITIQUES");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFile(
    path.join(rootDir, "middleware.ts"),
    "Middleware principal (middleware.ts)",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

if (
  checkFile(path.join(rootDir, "proxy.ts"), "Configuration proxy (proxy.ts)")
) {
  checks.passed++;
} else {
  checks.failed++;
}

if (
  checkFile(
    path.join(rootDir, "app", "api", "auth", "[...nextauth]", "route.ts"),
    "Route NextAuth ([...nextauth]/route.ts)",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

if (
  checkFile(
    path.join(rootDir, "contexts", "auth-context.tsx"),
    "Contexte d'authentification",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 2: Configuration du Middleware =====
log(colors.cyan, "\n📋 CONFIGURATION DU MIDDLEWARE");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "middleware.ts"),
    ["export { proxy as middleware } from", "matcher:", "/dashboard", "/auth"],
    "Middleware exporté avec configuration matcher",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 3: Routes Protégées =====
log(colors.cyan, "\n🔐 ROUTES PROTÉGÉES");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "proxy.ts"),
    [
      "const PROTECTED_ROUTES = [",
      '"/dashboard"',
      '"/booking"',
      '"/profile"',
      '"/vehicles"',
      '"/favorites"',
    ],
    "Routes protégées complètes",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

if (
  checkFileContent(
    path.join(rootDir, "proxy.ts"),
    ["const AUTH_ROUTES = [", '"/auth/login"', '"/auth/register"'],
    "Routes d'authentification",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 4: Logique d'Authentification =====
log(colors.cyan, "\n🔑 LOGIQUE D'AUTHENTIFICATION");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "proxy.ts"),
    [
      "const isAuthenticated = !!token || !!backendToken",
      "const userRole = token?.role",
      "getToken({",
      "req: request,",
      "secret: process.env.NEXTAUTH_SECRET",
    ],
    "Vérification d'authentification",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 5: CallbackUrl =====
log(colors.cyan, "\n🔄 GESTION DE CALLBACK URL");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "proxy.ts"),
    [
      'const callbackUrl = pathname + (request.nextUrl.search ? request.nextUrl.search : "")',
      "callbackUrl",
    ],
    "CallbackUrl inclut query params",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 6: Redirections Basées sur le Rôle =====
log(colors.cyan, "\n👥 REDIRECTIONS BASÉES SUR LE RÔLE");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "proxy.ts"),
    [
      "function getDashboardUrlForRole(role?: string): string {",
      'case "admin":',
      'case "proprietaire":',
      'case "locataire":',
      '"/dashboard/admin"',
      '"/dashboard/owner"',
      '"/dashboard/renter"',
    ],
    "Routage par rôle d'utilisateur",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 7: Logs de Débogage =====
log(colors.cyan, "\n🐛 LOGS DE DÉBOGAGE");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "proxy.ts"),
    [
      'if (process.env.NODE_ENV === "development") {',
      "console.log",
      "[Middleware] Route:",
    ],
    "Logs de débogage pour le développement",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 8: Configuration NextAuth =====
log(colors.cyan, "\n🔧 CONFIGURATION NEXTAUTH");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "app", "api", "auth", "[...nextauth]", "route.ts"),
    [
      "CredentialsProvider",
      "pages: {",
      'signIn: "/auth/login"',
      'error: "/auth/error"',
      "async jwt({",
      "async session({",
      "async redirect({",
    ],
    "Configuration NextAuth complète",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== SECTION 9: Contexte d'Authentification =====
log(colors.cyan, "\n🎯 CONTEXTE D'AUTHENTIFICATION");
log(colors.cyan, "─────────────────────────────────────────\n");

if (
  checkFileContent(
    path.join(rootDir, "contexts", "auth-context.tsx"),
    [
      "async login(credentials",
      "redirectTo || ",
      "await signIn(",
      "router.push(destination)",
    ],
    "Fonction login avec redirection",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

if (
  checkFileContent(
    path.join(rootDir, "contexts", "auth-context.tsx"),
    [
      "export function useRequireAuth",
      "useAuth()",
      "router.push(loginUrl.toString())",
    ],
    "Hook useRequireAuth pour protection",
  )
) {
  checks.passed++;
} else {
  checks.failed++;
}

// ===== RÉSUMÉ =====
log(colors.blue, "\n═══════════════════════════════════════════");
log(colors.blue, "  RÉSUMÉ DU DIAGNOSTIC");
log(colors.blue, "═══════════════════════════════════════════\n");

const total = checks.passed + checks.failed;
const percentage = Math.round((checks.passed / total) * 100);

log(colors.green, `✅ Vérifications réussies: ${checks.passed}/${total}`);
if (checks.failed > 0) {
  log(colors.red, `❌ Vérifications échouées: ${checks.failed}/${total}`);
}

log(colors.blue, `\nScore: ${percentage}%`);

if (percentage === 100) {
  log(colors.green, "\n🎉 Tous les contrôles sont passés!");
  log(colors.green, "Le système de routage est correctement configuré.\n");
  process.exit(0);
} else if (percentage >= 80) {
  log(colors.yellow, "\n⚠️  La plupart des contrôles sont passés.");
  log(colors.yellow, "Quelques éléments nécessitent une attention.\n");
  process.exit(1);
} else {
  log(colors.red, "\n❌ De nombreux contrôles ont échoué.");
  log(colors.red, "Le système de routage nécessite des corrections.\n");
  process.exit(1);
}
