// Synchronisé avec Prisma model Vehicle (table Vehicules)
export interface Vehicle {
  id: number
  IdentifiantProprietaire: number
  IdentifiantCategorie: number
  IdentifiantModele: number
  TitreAnnonce: string
  DescriptionVehicule: string
  Annee: number
  Couleur?: string
  NombrePlaces: number
  TypeCarburant: string
  TypeTransmission: string
  PrixJournalier: number
  CautionRequise: number
  KilometrageInclus: number
  LocalisationVille: string
  LocalisationRegion?: string
  Climatisation?: boolean
  GPS?: boolean
  Bluetooth?: boolean
  CameraRecul?: boolean
  SiegesEnCuir?: boolean
  ToitOuvrant?: boolean
  EstAssure: boolean
  StatutVehicule: string
  StatutVerification: string
  NotesVehicule: number
  NombreReservations: number
  EstVedette: boolean
  EstPromotion?: boolean
  // Champs de présentation (calculés ou joints)
  image: string
  images: string[]
  owner: {
    name: string
    avatar: string
    rating: number
    responseTime: string
    memberSince: string
    verified: boolean
  }
  features: string[]
}

export const vehicles: Vehicle[] = [
  {
    id: 1,
    IdentifiantProprietaire: 4,
    IdentifiantCategorie: 1,
    IdentifiantModele: 1,
    TitreAnnonce: "Toyota Corolla 2022",
    DescriptionVehicule: "Toyota Corolla en excellent état, idéale pour vos déplacements en ville ou sur longue distance. Véhicule économique et confortable.",
    Annee: 2022,
    NombrePlaces: 5,
    TypeCarburant: "Essence",
    TypeTransmission: "Automatique",
    PrixJournalier: 35000,
    CautionRequise: 100000,
    KilometrageInclus: 200,
    LocalisationVille: "Douala",
    Climatisation: true,
    GPS: true,
    Bluetooth: true,
    CameraRecul: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.9,
    NombreReservations: 124,
    EstVedette: true,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Jean-Pierre K.", avatar: "/placeholder-user.jpg", rating: 4.9, responseTime: "< 1 heure", memberSince: "2022", verified: true },
    features: ["Climatisation", "GPS", "Bluetooth", "USB", "Caméra de recul"],
  },
  {
    id: 2,
    IdentifiantProprietaire: 5,
    IdentifiantCategorie: 2,
    IdentifiantModele: 2,
    TitreAnnonce: "Honda CR-V 2021",
    DescriptionVehicule: "SUV spacieux et confortable, parfait pour les familles ou les voyages d'affaires. Excellent état général.",
    Annee: 2021,
    NombrePlaces: 7,
    TypeCarburant: "Diesel",
    TypeTransmission: "Automatique",
    PrixJournalier: 50000,
    CautionRequise: 150000,
    KilometrageInclus: 250,
    LocalisationVille: "Yaoundé",
    Climatisation: true,
    GPS: true,
    Bluetooth: true,
    ToitOuvrant: true,
    SiegesEnCuir: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.8,
    NombreReservations: 89,
    EstVedette: false,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Marie-Claire N.", avatar: "/placeholder-user.jpg", rating: 4.8, responseTime: "< 2 heures", memberSince: "2021", verified: true },
    features: ["Climatisation", "GPS", "Bluetooth", "Toit ouvrant", "Sièges cuir", "4x4"],
  },
  {
    id: 3,
    IdentifiantProprietaire: 6,
    IdentifiantCategorie: 3,
    IdentifiantModele: 3,
    TitreAnnonce: "Mercedes Classe C 2023",
    DescriptionVehicule: "Mercedes Classe C dernière génération, luxe et confort garantis. Idéale pour vos événements ou déplacements VIP.",
    Annee: 2023,
    NombrePlaces: 5,
    TypeCarburant: "Essence",
    TypeTransmission: "Automatique",
    PrixJournalier: 75000,
    CautionRequise: 300000,
    KilometrageInclus: 150,
    LocalisationVille: "Douala",
    Climatisation: true,
    GPS: true,
    Bluetooth: true,
    SiegesEnCuir: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 5.0,
    NombreReservations: 56,
    EstVedette: true,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Paul T.", avatar: "/placeholder-user.jpg", rating: 5.0, responseTime: "< 30 min", memberSince: "2020", verified: true },
    features: ["Climatisation bizone", "GPS", "Bluetooth", "Sièges chauffants", "Sièges cuir", "Système audio premium"],
  },
  {
    id: 4,
    IdentifiantProprietaire: 4,
    IdentifiantCategorie: 4,
    IdentifiantModele: 4,
    TitreAnnonce: "Toyota Hiace 2020",
    DescriptionVehicule: "Minibus idéal pour le transport de groupe, événements familiaux ou excursions. Véhicule bien entretenu.",
    Annee: 2020,
    NombrePlaces: 15,
    TypeCarburant: "Diesel",
    TypeTransmission: "Manuelle",
    PrixJournalier: 60000,
    CautionRequise: 200000,
    KilometrageInclus: 300,
    LocalisationVille: "Bafoussam",
    Climatisation: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.7,
    NombreReservations: 201,
    EstVedette: false,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Emmanuel F.", avatar: "/placeholder-user.jpg", rating: 4.7, responseTime: "< 1 heure", memberSince: "2019", verified: true },
    features: ["Climatisation", "Grande capacité", "Porte-bagages"],
  },
  {
    id: 5,
    IdentifiantProprietaire: 5,
    IdentifiantCategorie: 5,
    IdentifiantModele: 5,
    TitreAnnonce: "BMW X5 2022",
    DescriptionVehicule: "BMW X5 haut de gamme, puissance et élégance pour vos déplacements. Parfait état.",
    Annee: 2022,
    NombrePlaces: 5,
    TypeCarburant: "Diesel",
    TypeTransmission: "Automatique",
    PrixJournalier: 85000,
    CautionRequise: 350000,
    KilometrageInclus: 200,
    LocalisationVille: "Douala",
    Climatisation: true,
    GPS: true,
    Bluetooth: true,
    ToitOuvrant: true,
    SiegesEnCuir: true,
    CameraRecul: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.9,
    NombreReservations: 67,
    EstVedette: true,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Sandrine M.", avatar: "/placeholder-user.jpg", rating: 4.9, responseTime: "< 2 heures", memberSince: "2021", verified: true },
    features: ["Climatisation bizone", "GPS", "Bluetooth", "Toit panoramique", "Sièges cuir", "4x4", "Caméra 360°"],
  },
  {
    id: 6,
    IdentifiantProprietaire: 6,
    IdentifiantCategorie: 2,
    IdentifiantModele: 6,
    TitreAnnonce: "Renault Duster 2021",
    DescriptionVehicule: "SUV compact et robuste, idéal pour la ville et les routes difficiles. Économique et fiable.",
    Annee: 2021,
    NombrePlaces: 5,
    TypeCarburant: "Essence",
    TypeTransmission: "Manuelle",
    PrixJournalier: 40000,
    CautionRequise: 100000,
    KilometrageInclus: 250,
    LocalisationVille: "Yaoundé",
    Climatisation: true,
    Bluetooth: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.6,
    NombreReservations: 145,
    EstVedette: false,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Christian A.", avatar: "/placeholder-user.jpg", rating: 4.6, responseTime: "< 3 heures", memberSince: "2022", verified: true },
    features: ["Climatisation", "Bluetooth", "USB", "4x4"],
  },
  {
    id: 7,
    IdentifiantProprietaire: 4,
    IdentifiantCategorie: 5,
    IdentifiantModele: 7,
    TitreAnnonce: "Toyota Land Cruiser 2020",
    DescriptionVehicule: "Land Cruiser robuste, parfait pour les expéditions et les routes difficiles du Grand Nord. Véhicule tout-terrain par excellence.",
    Annee: 2020,
    NombrePlaces: 7,
    TypeCarburant: "Diesel",
    TypeTransmission: "Automatique",
    PrixJournalier: 95000,
    CautionRequise: 400000,
    KilometrageInclus: 300,
    LocalisationVille: "Garoua",
    Climatisation: true,
    GPS: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.8,
    NombreReservations: 78,
    EstVedette: true,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Ibrahim D.", avatar: "/placeholder-user.jpg", rating: 4.8, responseTime: "< 1 heure", memberSince: "2020", verified: true },
    features: ["Climatisation", "GPS", "4x4", "Treuil", "Porte-bagages", "Réservoir supplémentaire"],
  },
  {
    id: 8,
    IdentifiantProprietaire: 5,
    IdentifiantCategorie: 2,
    IdentifiantModele: 8,
    TitreAnnonce: "Hyundai Tucson 2023",
    DescriptionVehicule: "Hyundai Tucson nouvelle génération, design moderne et technologies embarquées. Très confortable.",
    Annee: 2023,
    NombrePlaces: 5,
    TypeCarburant: "Essence",
    TypeTransmission: "Automatique",
    PrixJournalier: 55000,
    CautionRequise: 150000,
    KilometrageInclus: 200,
    LocalisationVille: "Yaoundé",
    Climatisation: true,
    GPS: true,
    Bluetooth: true,
    CameraRecul: true,
    EstAssure: true,
    StatutVehicule: "Disponible",
    StatutVerification: "Verifie",
    NotesVehicule: 4.7,
    NombreReservations: 42,
    EstVedette: false,
    image: "/placeholder.jpg",
    images: ["/placeholder.jpg"],
    owner: { name: "Françoise B.", avatar: "/placeholder-user.jpg", rating: 4.7, responseTime: "< 2 heures", memberSince: "2023", verified: true },
    features: ["Climatisation", "GPS", "Bluetooth", "Apple CarPlay", "Android Auto", "Caméra de recul"],
  },
]

export const vehicleTypes = [
  { value: "all", label: "Tous les types" },
  { value: "berline", label: "Berline" },
  { value: "suv", label: "SUV" },
  { value: "4x4", label: "4x4" },
  { value: "luxe", label: "Luxe" },
  { value: "utilitaire", label: "Utilitaire" },
  { value: "moto", label: "Moto" },
]

export const cities = [
  { value: "all", label: "Toutes les villes" },
  { value: "Douala", label: "Douala" },
  { value: "Yaoundé", label: "Yaoundé" },
  { value: "Bafoussam", label: "Bafoussam" },
  { value: "Bamenda", label: "Bamenda" },
  { value: "Garoua", label: "Garoua" },
  { value: "Maroua", label: "Maroua" },
]

export const fuelTypes = [
  { value: "all", label: "Tous" },
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "electrique", label: "Électrique" },
  { value: "hybride", label: "Hybride" },
]

export const transmissions = [
  { value: "all", label: "Toutes" },
  { value: "automatique", label: "Automatique" },
  { value: "manuelle", label: "Manuelle" },
]
