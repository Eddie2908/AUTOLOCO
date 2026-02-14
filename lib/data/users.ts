// Données utilisateurs pour la démonstration AUTOLOCO
// Synchronisé avec Prisma model User (table Utilisateurs)

export interface User {
  id: number
  TypeUtilisateur: "Locataire" | "Proprietaire" | "Admin"
  Email: string
  Nom: string
  Prenom: string | null
  NumeroTelephone: string
  PhotoProfil: string
  DateInscription: string
  StatutCompte: "Actif" | "Suspendu" | "Desactive" | "EnAttente"
  EmailVerifie: boolean
  TelephoneVerifie: boolean
  NiveauFidelite: string | null
  NotesUtilisateur: number | null
  LanguePreferee: string
  DevisePreferee: string
  BiographieUtilisateur?: string
  SiteWeb?: string
  NombreReservationsEffectuees: number
  NombreVehiculesLoues: number
  MembreDepuis?: number
  PointsFideliteTotal: number
}

export interface Locataire extends User {
  TypeUtilisateur: "Locataire"
  DateNaissance: string
  // Documents associés via DocumentUtilisateur
  permisConduire: string
  numeroCNI: string
}

export interface Proprietaire extends User {
  TypeUtilisateur: "Proprietaire"
  typeProfil: "particulier" | "professionnel" | "entreprise"
  numeroRCCM?: string
  nombreVehicules: number
  tempsReponse: string
  tauxAcceptation: number
  compteBancaire?: string
  mobileMoneyMTN?: string
  mobileMoneyOrange?: string
}

// Locataires de démonstration
export const locataires: Locataire[] = [
  {
    id: 1,
    TypeUtilisateur: "Locataire",
    Email: "locataire@autoloco.cm",
    Nom: "MBARGA",
    Prenom: "Samuel",
    NumeroTelephone: "+237 691 234 567",
    PhotoProfil: "/placeholder-user.jpg",
    DateNaissance: "1988-05-15",
    permisConduire: "B",
    numeroCNI: "123456789012",
    DateInscription: "2024-01-15",
    NombreReservationsEffectuees: 12,
    NombreVehiculesLoues: 12,
    NotesUtilisateur: 4.8,
    StatutCompte: "Actif",
    EmailVerifie: true,
    TelephoneVerifie: true,
    NiveauFidelite: "BRONZE",
    LanguePreferee: "fr",
    DevisePreferee: "XOF",
    PointsFideliteTotal: 120,
  },
  {
    id: 2,
    TypeUtilisateur: "Locataire",
    Email: "premium@autoloco.cm",
    Nom: "NGUEMO",
    Prenom: "Florence",
    NumeroTelephone: "+237 699 876 543",
    PhotoProfil: "/placeholder-user.jpg",
    DateNaissance: "1985-11-20",
    permisConduire: "B",
    numeroCNI: "987654321098",
    DateInscription: "2023-06-10",
    NombreReservationsEffectuees: 45,
    NombreVehiculesLoues: 45,
    NotesUtilisateur: 4.9,
    StatutCompte: "Actif",
    EmailVerifie: true,
    TelephoneVerifie: true,
    NiveauFidelite: "OR",
    LanguePreferee: "fr",
    DevisePreferee: "XOF",
    PointsFideliteTotal: 450,
  },
  {
    id: 3,
    TypeUtilisateur: "Locataire",
    Email: "nouveau@autoloco.cm",
    Nom: "FOTSO",
    Prenom: "Kevin",
    NumeroTelephone: "+237 655 111 222",
    PhotoProfil: "/placeholder-user.jpg",
    DateNaissance: "1995-03-08",
    permisConduire: "B",
    numeroCNI: "456789123456",
    DateInscription: "2024-12-01",
    NombreReservationsEffectuees: 0,
    NombreVehiculesLoues: 0,
    NotesUtilisateur: null,
    StatutCompte: "EnAttente",
    EmailVerifie: false,
    TelephoneVerifie: false,
    NiveauFidelite: null,
    LanguePreferee: "fr",
    DevisePreferee: "XOF",
    PointsFideliteTotal: 0,
  },
]

// Propriétaires de démonstration
export const proprietaires: Proprietaire[] = [
  {
    id: 4,
    TypeUtilisateur: "Proprietaire",
    Email: "proprietaire@autoloco.cm",
    Nom: "KAMGA",
    Prenom: "Jean-Pierre",
    NumeroTelephone: "+237 677 456 789",
    PhotoProfil: "/placeholder-user.jpg",
    typeProfil: "particulier",
    DateInscription: "2023-03-20",
    nombreVehicules: 2,
    NombreReservationsEffectuees: 87,
    NombreVehiculesLoues: 87,
    NotesUtilisateur: 4.9,
    tempsReponse: "< 1 heure",
    tauxAcceptation: 95,
    StatutCompte: "Actif",
    EmailVerifie: true,
    TelephoneVerifie: true,
    NiveauFidelite: "PLATINE",
    LanguePreferee: "fr",
    DevisePreferee: "XOF",
    PointsFideliteTotal: 870,
    mobileMoneyMTN: "+237 677 456 789",
    mobileMoneyOrange: "+237 699 456 789",
  },
  {
    id: 5,
    TypeUtilisateur: "Proprietaire",
    Email: "agence@autoloco.cm",
    Nom: "AUTO SERVICES SARL",
    Prenom: null,
    NumeroTelephone: "+237 233 456 789",
    PhotoProfil: "/placeholder-logo.png",
    typeProfil: "professionnel",
    numeroRCCM: "RC/YAO/2020/A/1234",
    DateInscription: "2022-01-15",
    nombreVehicules: 8,
    NombreReservationsEffectuees: 456,
    NombreVehiculesLoues: 456,
    NotesUtilisateur: 4.7,
    tempsReponse: "< 30 min",
    tauxAcceptation: 98,
    StatutCompte: "Actif",
    EmailVerifie: true,
    TelephoneVerifie: true,
    NiveauFidelite: "PLATINE",
    LanguePreferee: "fr",
    DevisePreferee: "XOF",
    PointsFideliteTotal: 4560,
  },
  {
    id: 6,
    TypeUtilisateur: "Proprietaire",
    Email: "flotte@autoloco.cm",
    Nom: "CAMEROON FLEET MANAGEMENT",
    Prenom: null,
    NumeroTelephone: "+237 699 999 888",
    PhotoProfil: "/placeholder-logo.png",
    typeProfil: "entreprise",
    numeroRCCM: "RC/DLA/2019/B/5678",
    DateInscription: "2021-06-01",
    nombreVehicules: 15,
    NombreReservationsEffectuees: 1250,
    NombreVehiculesLoues: 1250,
    NotesUtilisateur: 4.8,
    tempsReponse: "< 15 min",
    tauxAcceptation: 99,
    StatutCompte: "Actif",
    EmailVerifie: true,
    TelephoneVerifie: true,
    NiveauFidelite: "PLATINE",
    LanguePreferee: "fr",
    DevisePreferee: "XOF",
    PointsFideliteTotal: 12500,
  },
]

// Identifiants de démonstration
export const demoCredentials = {
  locataires: [
    { email: "locataire@autoloco.cm", password: "Demo@2024!", role: "Locataire Standard" },
    { email: "premium@autoloco.cm", password: "Demo@2024!", role: "Locataire Premium" },
    { email: "nouveau@autoloco.cm", password: "Demo@2024!", role: "Locataire Nouveau" },
  ],
  proprietaires: [
    { email: "proprietaire@autoloco.cm", password: "Demo@2024!", role: "Propriétaire Particulier" },
    { email: "agence@autoloco.cm", password: "Demo@2024!", role: "Propriétaire Pro" },
    { email: "flotte@autoloco.cm", password: "Demo@2024!", role: "Super Propriétaire" },
  ],
  admins: [
    { email: "admin@autoloco.cm", password: "Admin@2024!", role: "Admin Principal" },
    { email: "moderateur@autoloco.cm", password: "Modo@2024!", role: "Modérateur" },
    { email: "support@autoloco.cm", password: "Support@2024!", role: "Support Client" },
  ],
}

// Fonction pour trouver un utilisateur par email
export function findUserByEmail(email: string): User | undefined {
  const allUsers = [...locataires, ...proprietaires]
  return allUsers.find((u) => u.Email === email)
}

// Fonction pour vérifier les identifiants
export function verifyCredentials(email: string, password: string): boolean {
  const allCredentials = [...demoCredentials.locataires, ...demoCredentials.proprietaires, ...demoCredentials.admins]
  return allCredentials.some((c) => c.email === email && c.password === password)
}
