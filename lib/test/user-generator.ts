/**
 * Générateur d'Utilisateurs de Test
 * ==================================
 * 
 * Génère des profils utilisateurs fictifs pour les tests
 * avec des données cohérentes et variées
 */

import { hash } from "bcryptjs"

export type TestUserRole = "locataire" | "proprietaire" | "admin"
export type TestUserStatus = "Actif" | "Suspendu" | "EnAttente"

export interface TestUserData {
  Nom: string
  Prenom: string
  Email: string
  MotDePasse: string
  NumeroTelephone: string
  TypeUtilisateur: TestUserRole
  StatutCompte: TestUserStatus
  EmailVerifie: boolean
  TelephoneVerifie: boolean
  DateNaissance?: Date
  NotesUtilisateur?: number
  NombreReservationsEffectuees?: number
  NombreVehiculesLoues?: number
  NiveauFidelite?: string
  PointsFideliteTotal?: number
}

// Noms camerounais courants
const PRENOMS_HOMMES = [
  "Samuel", "Jean", "Pierre", "Paul", "David", "Emmanuel", "Joseph",
  "Thomas", "Daniel", "Michel", "André", "François", "Martin", "Luc"
]

const PRENOMS_FEMMES = [
  "Florence", "Marie", "Jeanne", "Sophie", "Caroline", "Sandrine",
  "Nadège", "Christelle", "Vanessa", "Patricia", "Brigitte", "Claire"
]

const NOMS = [
  "MBARGA", "NGUEMO", "FOTSO", "KAMGA", "TCHOUA", "NKENG", "MVONDO",
  "ETAME", "ONANA", "BESSALA", "FOUDA", "NJOYA", "SIMO", "TCHAMBA",
  "MBASSI", "WOUABOU", "DJOUMESSI", "MANGA", "KENNE", "NDJANA"
]

const VILLES = [
  "Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda", 
  "Maroua", "Ngaoundéré", "Bertoua", "Ebolowa", "Kribi"
]

const INDICATIFS = ["+237 6", "+237 69", "+237 67", "+237 65", "+237 233"]

/**
 * Génère un numéro de téléphone aléatoire
 */
function generatePhoneNumber(): string {
  const indicatif = INDICATIFS[Math.floor(Math.random() * INDICATIFS.length)]
  const suffix = Math.floor(Math.random() * 9000000 + 1000000).toString()
  return `${indicatif}${suffix.substring(0, 1)} ${suffix.substring(1, 4)} ${suffix.substring(4, 7)}`
}

/**
 * Génère un email unique basé sur le nom
 */
function generateEmail(prenom: string, nom: string, index: number): string {
  const prenomClean = prenom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const nomClean = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const domain = index % 2 === 0 ? "autoloco.cm" : "email.cm"
  return `${prenomClean}.${nomClean}${index > 0 ? index : ""}@${domain}`
}

/**
 * Génère une date de naissance aléatoire (18-65 ans)
 */
function generateDateNaissance(): Date {
  const today = new Date()
  const yearsBefore = 18 + Math.floor(Math.random() * 47) // 18 à 65 ans
  const date = new Date(today)
  date.setFullYear(date.getFullYear() - yearsBefore)
  date.setMonth(Math.floor(Math.random() * 12))
  date.setDate(Math.floor(Math.random() * 28) + 1)
  return date
}

/**
 * Génère un locataire de test
 */
export async function generateTestLocataire(index: number, options?: {
  verified?: boolean
  hasBookings?: boolean
  premium?: boolean
}): Promise<TestUserData> {
  const isVerified = options?.verified ?? Math.random() > 0.2
  const hasBookings = options?.hasBookings ?? Math.random() > 0.3
  const isPremium = options?.premium ?? Math.random() > 0.8
  
  const prenom = Math.random() > 0.5 
    ? PRENOMS_HOMMES[Math.floor(Math.random() * PRENOMS_HOMMES.length)]
    : PRENOMS_FEMMES[Math.floor(Math.random() * PRENOMS_FEMMES.length)]
  
  const nom = NOMS[Math.floor(Math.random() * NOMS.length)]
  const email = generateEmail(prenom, nom, index)
  
  const nombreReservations = hasBookings 
    ? Math.floor(Math.random() * 20) + 1
    : 0
  
  return {
    Nom: nom,
    Prenom: prenom,
    Email: email,
    MotDePasse: await hash("Test@2024!", 10),
    NumeroTelephone: generatePhoneNumber(),
    TypeUtilisateur: "locataire",
    StatutCompte: isVerified ? "Actif" : "EnAttente",
    EmailVerifie: isVerified,
    TelephoneVerifie: isVerified,
    DateNaissance: generateDateNaissance(),
    NotesUtilisateur: hasBookings ? Number((3.5 + Math.random() * 1.5).toFixed(1)) : undefined,
    NombreReservationsEffectuees: nombreReservations,
    NiveauFidelite: isPremium ? "GOLD" : undefined,
    PointsFideliteTotal: isPremium ? Math.floor(Math.random() * 5000) + 500 : undefined,
  }
}

/**
 * Génère un propriétaire de test
 */
export async function generateTestProprietaire(index: number, options?: {
  verified?: boolean
  hasVehicles?: boolean
  professional?: boolean
}): Promise<TestUserData> {
  const isVerified = options?.verified ?? Math.random() > 0.15
  const hasVehicles = options?.hasVehicles ?? Math.random() > 0.2
  const isProfessional = options?.professional ?? Math.random() > 0.7
  
  let nom: string, prenom: string
  
  if (isProfessional) {
    const companies = [
      "AUTO SERVICES", "FLEET MANAGER", "RENT CAR", "MOBILITY PLUS",
      "CARS SERVICES", "LOCATION AUTO", "DRIVE EASY", "RENTAL PRO"
    ]
    nom = companies[Math.floor(Math.random() * companies.length)]
    prenom = "SARL"
  } else {
    prenom = Math.random() > 0.5 
      ? PRENOMS_HOMMES[Math.floor(Math.random() * PRENOMS_HOMMES.length)]
      : PRENOMS_FEMMES[Math.floor(Math.random() * PRENOMS_FEMMES.length)]
    nom = NOMS[Math.floor(Math.random() * NOMS.length)]
  }
  
  const email = generateEmail(prenom, nom, index + 1000)
  const nombreVehicules = hasVehicles 
    ? (isProfessional ? Math.floor(Math.random() * 15) + 3 : Math.floor(Math.random() * 3) + 1)
    : 0
  
  const nombreLocations = nombreVehicules > 0
    ? nombreVehicules * (20 + Math.floor(Math.random() * 80))
    : 0
  
  return {
    Nom: nom,
    Prenom: prenom,
    Email: email,
    MotDePasse: await hash("Test@2024!", 10),
    NumeroTelephone: generatePhoneNumber(),
    TypeUtilisateur: "proprietaire",
    StatutCompte: isVerified ? "Actif" : "EnAttente",
    EmailVerifie: isVerified,
    TelephoneVerifie: isVerified,
    NotesUtilisateur: hasVehicles ? Number((4.0 + Math.random() * 1.0).toFixed(1)) : undefined,
    NombreVehiculesLoues: nombreLocations,
  }
}

/**
 * Génère un admin de test
 */
export async function generateTestAdmin(index: number, role?: string): Promise<TestUserData> {
  const roles = role ? [role] : ["Admin", "Modérateur", "Support", "Superviseur"]
  const selectedRole = roles[index % roles.length]
  
  const prenom = Math.random() > 0.5 
    ? PRENOMS_HOMMES[Math.floor(Math.random() * PRENOMS_HOMMES.length)]
    : PRENOMS_FEMMES[Math.floor(Math.random() * PRENOMS_FEMMES.length)]
  
  const nom = NOMS[Math.floor(Math.random() * NOMS.length)]
  const email = `${selectedRole.toLowerCase()}.${nom.toLowerCase()}${index > 0 ? index : ""}@autoloco.cm`
  
  return {
    Nom: nom,
    Prenom: `${prenom} (${selectedRole})`,
    Email: email,
    MotDePasse: await hash("Admin@2024!", 10),
    NumeroTelephone: generatePhoneNumber(),
    TypeUtilisateur: "admin",
    StatutCompte: "Actif",
    EmailVerifie: true,
    TelephoneVerifie: true,
  }
}

/**
 * Génère un lot d'utilisateurs de test
 */
export async function generateBatchUsers(config: {
  locataires?: number
  proprietaires?: number
  admins?: number
}): Promise<TestUserData[]> {
  const users: TestUserData[] = []
  
  // Générer les locataires
  if (config.locataires) {
    for (let i = 0; i < config.locataires; i++) {
      users.push(await generateTestLocataire(i))
    }
  }
  
  // Générer les propriétaires
  if (config.proprietaires) {
    for (let i = 0; i < config.proprietaires; i++) {
      users.push(await generateTestProprietaire(i))
    }
  }
  
  // Générer les admins
  if (config.admins) {
    for (let i = 0; i < config.admins; i++) {
      users.push(await generateTestAdmin(i))
    }
  }
  
  return users
}

/**
 * Mot de passe par défaut pour tous les utilisateurs de test
 */
export const TEST_USER_PASSWORD = "Test@2024!"

/**
 * Informations d'identification des utilisateurs de test
 */
export function getTestCredentials(users: TestUserData[]): Array<{
  email: string
  password: string
  role: TestUserRole
  nom: string
}> {
  return users.map(user => ({
    email: user.Email,
    password: TEST_USER_PASSWORD,
    role: user.TypeUtilisateur,
    nom: `${user.Prenom} ${user.Nom}`,
  }))
}
