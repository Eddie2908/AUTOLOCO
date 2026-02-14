/**
 * Utilitaires de Test AUTOLOCO
 * =============================
 * 
 * Fonctions utilitaires pour faciliter les tests
 */

import type { TestUserRole } from "./user-generator"

/**
 * Liste des utilisateurs pré-configurés pour les tests
 */
export const PRESET_USERS = {
  locataires: [
    {
      email: "locataire@autoloco.cm",
      password: "Demo@2024!",
      role: "locataire" as TestUserRole,
      label: "Locataire Standard",
      description: "12 réservations, note 4.8/5",
    },
    {
      email: "premium@autoloco.cm",
      password: "Demo@2024!",
      role: "locataire" as TestUserRole,
      label: "Locataire Premium",
      description: "45 réservations, niveau Gold",
    },
    {
      email: "nouveau@autoloco.cm",
      password: "Demo@2024!",
      role: "locataire" as TestUserRole,
      label: "Nouveau Locataire",
      description: "Sans historique, non vérifié",
    },
  ],
  proprietaires: [
    {
      email: "proprietaire@autoloco.cm",
      password: "Demo@2024!",
      role: "proprietaire" as TestUserRole,
      label: "Propriétaire Particulier",
      description: "2 véhicules, 87 locations",
    },
    {
      email: "agence@autoloco.cm",
      password: "Demo@2024!",
      role: "proprietaire" as TestUserRole,
      label: "Agence Professionnelle",
      description: "8 véhicules, 456 locations",
    },
    {
      email: "flotte@autoloco.cm",
      password: "Demo@2024!",
      role: "proprietaire" as TestUserRole,
      label: "Gestionnaire de Flotte",
      description: "15 véhicules, 1250 locations",
    },
  ],
  admins: [
    {
      email: "admin@autoloco.cm",
      password: "Admin@2024!",
      role: "admin" as TestUserRole,
      label: "Administrateur Principal",
      description: "Accès complet",
    },
    {
      email: "moderateur@autoloco.cm",
      password: "Modo@2024!",
      role: "admin" as TestUserRole,
      label: "Modérateur",
      description: "Modération contenu",
    },
    {
      email: "support@autoloco.cm",
      password: "Support@2024!",
      role: "admin" as TestUserRole,
      label: "Support Client",
      description: "Support utilisateurs",
    },
  ],
}

/**
 * Récupère tous les utilisateurs pré-configurés
 */
export function getAllPresetUsers() {
  return [
    ...PRESET_USERS.locataires,
    ...PRESET_USERS.proprietaires,
    ...PRESET_USERS.admins,
  ]
}

/**
 * Récupère un utilisateur pré-configuré par email
 */
export function getPresetUserByEmail(email: string) {
  return getAllPresetUsers().find((u) => u.email === email)
}

/**
 * Récupère les utilisateurs par rôle
 */
export function getPresetUsersByRole(role: TestUserRole) {
  switch (role) {
    case "locataire":
      return PRESET_USERS.locataires
    case "proprietaire":
      return PRESET_USERS.proprietaires
    case "admin":
      return PRESET_USERS.admins
    default:
      return []
  }
}

/**
 * Vérifie si un email est un utilisateur de test
 */
export function isTestUser(email: string): boolean {
  return (
    email.includes("@email.cm") ||
    email.includes("test@") ||
    email.includes(".test") ||
    getAllPresetUsers().some((u) => u.email === email)
  )
}

/**
 * Génère un scénario de test complet
 */
export interface TestScenario {
  name: string
  description: string
  steps: Array<{
    step: number
    action: string
    user?: string
    expectedResult: string
  }>
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    name: "Parcours Locataire Complet",
    description: "Simulation d'une réservation complète",
    steps: [
      {
        step: 1,
        action: "Connexion avec nouveau@autoloco.cm",
        user: "nouveau@autoloco.cm",
        expectedResult: "Dashboard locataire affiché",
      },
      {
        step: 2,
        action: "Recherche véhicule à Douala",
        expectedResult: "Liste des véhicules disponibles",
      },
      {
        step: 3,
        action: "Sélection d'un véhicule",
        expectedResult: "Page détail du véhicule",
      },
      {
        step: 4,
        action: "Création réservation 3 jours",
        expectedResult: "Page de paiement",
      },
      {
        step: 5,
        action: "Simulation paiement",
        expectedResult: "Confirmation de réservation",
      },
    ],
  },
  {
    name: "Gestion Véhicule Propriétaire",
    description: "Ajout et configuration d'un véhicule",
    steps: [
      {
        step: 1,
        action: "Connexion avec proprietaire@autoloco.cm",
        user: "proprietaire@autoloco.cm",
        expectedResult: "Dashboard propriétaire affiché",
      },
      {
        step: 2,
        action: "Navigation vers Mes Véhicules",
        expectedResult: "Liste des véhicules actuels",
      },
      {
        step: 3,
        action: "Clic sur Ajouter un véhicule",
        expectedResult: "Formulaire d'ajout affiché",
      },
      {
        step: 4,
        action: "Remplissage des informations",
        expectedResult: "Formulaire validé",
      },
      {
        step: 5,
        action: "Upload photos",
        expectedResult: "Photos ajoutées",
      },
      {
        step: 6,
        action: "Configuration tarifs",
        expectedResult: "Tarifs enregistrés",
      },
      {
        step: 7,
        action: "Publication du véhicule",
        expectedResult: "Véhicule en ligne",
      },
    ],
  },
  {
    name: "Administration et Modération",
    description: "Gestion complète par l'administrateur",
    steps: [
      {
        step: 1,
        action: "Connexion avec admin@autoloco.cm",
        user: "admin@autoloco.cm",
        expectedResult: "Dashboard admin affiché",
      },
      {
        step: 2,
        action: "Consultation des statistiques",
        expectedResult: "Graphiques et KPIs affichés",
      },
      {
        step: 3,
        action: "Navigation vers Gestion Utilisateurs",
        expectedResult: "Liste complète des utilisateurs",
      },
      {
        step: 4,
        action: "Filtrage par statut",
        expectedResult: "Utilisateurs filtrés",
      },
      {
        step: 5,
        action: "Navigation vers Gestion Véhicules",
        expectedResult: "Liste complète des véhicules",
      },
      {
        step: 6,
        action: "Modération d'un véhicule",
        expectedResult: "Statut mis à jour",
      },
      {
        step: 7,
        action: "Consultation des réclamations",
        expectedResult: "Liste des réclamations",
      },
    ],
  },
  {
    name: "Test Contrôles d'Accès",
    description: "Vérification des permissions et redirections",
    steps: [
      {
        step: 1,
        action: "Connexion avec locataire@autoloco.cm",
        user: "locataire@autoloco.cm",
        expectedResult: "Dashboard locataire",
      },
      {
        step: 2,
        action: "Tentative d'accès /dashboard/proprietaire",
        expectedResult: "Redirection vers /dashboard/unauthorized",
      },
      {
        step: 3,
        action: "Tentative d'accès /dashboard/admin",
        expectedResult: "Redirection vers /dashboard/unauthorized",
      },
      {
        step: 4,
        action: "Déconnexion",
        expectedResult: "Redirection vers login",
      },
      {
        step: 5,
        action: "Connexion avec proprietaire@autoloco.cm",
        user: "proprietaire@autoloco.cm",
        expectedResult: "Dashboard propriétaire",
      },
      {
        step: 6,
        action: "Tentative d'accès /dashboard/admin",
        expectedResult: "Redirection vers /dashboard/unauthorized",
      },
      {
        step: 7,
        action: "Connexion avec admin@autoloco.cm",
        user: "admin@autoloco.cm",
        expectedResult: "Accès à tous les dashboards",
      },
    ],
  },
]

/**
 * Génère un rapport de test
 */
export interface TestReport {
  scenario: string
  startTime: Date
  endTime?: Date
  duration?: number
  steps: Array<{
    step: number
    action: string
    status: "pending" | "success" | "failed"
    error?: string
    timestamp: Date
  }>
  status: "pending" | "success" | "failed"
}

export function createTestReport(scenarioName: string): TestReport {
  const scenario = TEST_SCENARIOS.find((s) => s.name === scenarioName)
  if (!scenario) {
    throw new Error(`Scenario not found: ${scenarioName}`)
  }

  return {
    scenario: scenarioName,
    startTime: new Date(),
    steps: scenario.steps.map((step) => ({
      step: step.step,
      action: step.action,
      status: "pending",
      timestamp: new Date(),
    })),
    status: "pending",
  }
}

/**
 * Utilitaires de formatage
 */
export function formatTestUserEmail(nom: string, prenom: string, index = 0): string {
  const nomClean = nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  const prenomClean = prenom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  const domain = index % 2 === 0 ? "autoloco.cm" : "email.cm"
  return `${prenomClean}.${nomClean}${index > 0 ? index : ""}@${domain}`
}

export function formatTestUserPhone(): string {
  const indicatifs = ["+237 6", "+237 69", "+237 67", "+237 65"]
  const indicatif =
    indicatifs[Math.floor(Math.random() * indicatifs.length)]
  const suffix = Math.floor(Math.random() * 9000000 + 1000000).toString()
  return `${indicatif}${suffix.substring(0, 1)} ${suffix.substring(1, 4)} ${suffix.substring(4, 7)}`
}

/**
 * Constantes utiles
 */
export const TEST_CONSTANTS = {
  PASSWORD: "Test@2024!",
  DEMO_PASSWORD: "Demo@2024!",
  ADMIN_PASSWORD: "Admin@2024!",
  MODO_PASSWORD: "Modo@2024!",
  SUPPORT_PASSWORD: "Support@2024!",
  MAX_LOCATAIRES: 50,
  MAX_PROPRIETAIRES: 20,
  MAX_ADMINS: 5,
  TEST_DOMAINS: ["@email.cm", "test@", ".test"],
}
