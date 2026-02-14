/**
 * Service d'Inscription Utilisateur
 * ===================================
 *
 * Gère l'inscription des nouveaux utilisateurs
 * avec validation, hachage du mot de passe et
 * création en base de données.
 */

import { prisma } from "@/lib/db/prisma-client";
import { hashPassword, checkPasswordStrength } from "./password";

// Types pour l'inscription
export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  type: "locataire" | "proprietaire";
  ville?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    type: string;
  };
  error?: string;
  code?: string;
}

/**
 * Valide les données d'inscription
 */
function validateRegistrationData(data: RegisterData): string[] {
  const errors: string[] = [];

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Email invalide");
  }

  // Mot de passe
  if (!data.password || data.password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  const passwordStrength = checkPasswordStrength(data.password || "");
  if (passwordStrength.level === "weak") {
    errors.push(
      "Mot de passe trop faible: " + passwordStrength.suggestions.join(", "),
    );
  }

  // Nom/Prénom
  if (!data.nom || data.nom.length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  }

  if (!data.prenom || data.prenom.length < 2) {
    errors.push("Le prénom doit contenir au moins 2 caractères");
  }

  // Type
  if (!["locataire", "proprietaire"].includes(data.type)) {
    errors.push("Type d'utilisateur invalide");
  }

  // Téléphone (optionnel mais validé si fourni)
  if (data.telephone) {
    const phoneRegex = /^\+?[0-9\s-]{8,20}$/;
    if (!phoneRegex.test(data.telephone)) {
      errors.push("Numéro de téléphone invalide");
    }
  }

  return errors;
}

/**
 * Inscrit un nouvel utilisateur
 */
export async function registerUser(
  data: RegisterData,
): Promise<RegisterResult> {
  try {
    // 1. Validation des données
    const validationErrors = validateRegistrationData(data);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(". "),
        code: "VALIDATION_ERROR",
      };
    }

    // 2. Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { Email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Un compte existe déjà avec cet email",
        code: "EMAIL_EXISTS",
      };
    }

    // 3. Hacher le mot de passe
    const hashedPassword = await hashPassword(data.password);

    // 4-5. Créer l'utilisateur + préférences par défaut (transaction)
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          Email: data.email.toLowerCase(),
          MotDePasse: hashedPassword,
          Nom: data.nom,
          Prenom: data.prenom,
          NumeroTelephone: data.telephone || null,
          TypeUtilisateur: data.type,
          StatutCompte: "Actif",
          EmailVerifie: false,
          TelephoneVerifie: false,
          NiveauFidelite: "BRONZE",
          PointsFideliteTotal: 0,
          LanguePreferee: "fr",
          DevisePreferee: "XOF",
        },
        select: {
          id: true,
          Email: true,
          Nom: true,
          Prenom: true,
          TypeUtilisateur: true,
        },
      })

      await tx.preferenceUtilisateur.create({
        data: {
          utilisateurId: createdUser.id,
          NotificationsEmail: true,
          NotificationsSMS: false,
          NotificationsPush: true,
          ModeTheme: "Systeme",
          AffichageMonnaie: "XOF",
          FormatDate: "DD/MM/YYYY",
          FuseauHoraire: "Africa/Dakar",
          VisibiliteProfile: "Public",
          AfficherNumeroTelephone: false,
          AfficherEmail: false,
          AutoriserMessages: true,
        },
      })

      return createdUser
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.Email,
        nom: user.Nom,
        prenom: user.Prenom,
        type: user.TypeUtilisateur,
      },
    };
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'inscription",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Vérifie si un email est disponible
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { Email: email.toLowerCase() },
    select: { id: true },
  });
  return !user;
}
