/**
 * Utilitaires de Gestion des Mots de Passe
 * =========================================
 *
 * Fonctions sécurisées pour le hachage et la vérification
 * des mots de passe avec bcrypt.
 *
 * IMPORTANT: Ne jamais stocker les mots de passe en clair!
 */

import bcrypt from "bcryptjs"

// Nombre de rounds pour le salt (12 = bon équilibre sécurité/performance)
const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10)

/**
 * Hache un mot de passe en utilisant bcrypt
 * @param password - Mot de passe en clair
 * @returns Mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères")
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

/**
 * Vérifie si un mot de passe correspond au hash stocké
 * @param password - Mot de passe en clair à vérifier
 * @param hashedPassword - Hash stocké en base de données
 * @returns true si le mot de passe est correct
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false
  }

  return bcrypt.compare(password, hashedPassword)
}

/**
 * Vérifie la force d'un mot de passe
 * @param password - Mot de passe à évaluer
 * @returns Score de force et suggestions
 */
export function checkPasswordStrength(password: string): {
  score: number
  level: "weak" | "fair" | "good" | "strong"
  suggestions: string[]
} {
  const suggestions: string[] = []
  let score = 0

  // Longueur
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (password.length < 8) suggestions.push("Utilisez au moins 8 caractères")

  // Caractères variés
  if (/[a-z]/.test(password)) score += 1
  else suggestions.push("Ajoutez des lettres minuscules")

  if (/[A-Z]/.test(password)) score += 1
  else suggestions.push("Ajoutez des lettres majuscules")

  if (/[0-9]/.test(password)) score += 1
  else suggestions.push("Ajoutez des chiffres")

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else suggestions.push("Ajoutez des caractères spéciaux")

  // Patterns à éviter
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    suggestions.push("Évitez les caractères répétés")
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    score -= 1
    suggestions.push("Mélangez lettres, chiffres et symboles")
  }

  // Normaliser le score
  const normalizedScore = Math.max(0, Math.min(4, Math.floor(score / 2)))

  const levels: Record<number, "weak" | "fair" | "good" | "strong"> = {
    0: "weak",
    1: "weak",
    2: "fair",
    3: "good",
    4: "strong",
  }

  return {
    score: normalizedScore,
    level: levels[normalizedScore],
    suggestions,
  }
}

/**
 * Génère un mot de passe aléatoire sécurisé
 * @param length - Longueur du mot de passe (défaut: 16)
 * @returns Mot de passe généré
 */
export function generateSecurePassword(length = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = lowercase + uppercase + numbers + symbols

  // Garantir au moins un caractère de chaque type
  let password = ""
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Compléter avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Mélanger le mot de passe
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
