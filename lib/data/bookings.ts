// Données de réservations pour la démonstration AUTOLOCO
// Synchronisé avec Prisma model Reservation (table Reservations)

export interface Booking {
  id: number
  NumeroReservation: string
  IdentifiantVehicule: number
  IdentifiantLocataire: number
  IdentifiantProprietaire: number
  DateDebut: string
  DateFin: string
  NombreJours: number
  LieuPriseEnCharge: string
  LieuRestitution: string
  PrixJournalier: number
  MontantLocation: number
  FraisService: number
  FraisAssurance: number
  MontantTotal: number
  MontantCaution: number
  MethodePaiement: string
  StatutReservation: string
  StatutPaiement: string
  DateCreationReservation: string
  // Champs de présentation (joints)
  locataireNom: string
  vehiculeNom: string
  proprietaireNom: string
}

export const bookings: Booking[] = [
  {
    id: 1,
    NumeroReservation: "RES-2024-001",
    IdentifiantLocataire: 1,
    locataireNom: "Samuel MBARGA",
    IdentifiantVehicule: 1,
    vehiculeNom: "Toyota Corolla 2022",
    IdentifiantProprietaire: 4,
    proprietaireNom: "Jean-Pierre KAMGA",
    DateDebut: "2024-12-15",
    DateFin: "2024-12-18",
    NombreJours: 3,
    LieuPriseEnCharge: "123 Rue de la Liberté, Akwa, Douala",
    LieuRestitution: "123 Rue de la Liberté, Akwa, Douala",
    PrixJournalier: 35000,
    MontantLocation: 105000,
    FraisService: 5250,
    FraisAssurance: 5250,
    MontantTotal: 115500,
    MontantCaution: 100000,
    MethodePaiement: "MobileMoney_MTN",
    StatutReservation: "Confirmee",
    StatutPaiement: "Paye",
    DateCreationReservation: "2024-12-14T14:00:00",
  },
  {
    id: 2,
    NumeroReservation: "RES-2024-002",
    IdentifiantLocataire: 2,
    locataireNom: "Florence NGUEMO",
    IdentifiantVehicule: 3,
    vehiculeNom: "Mercedes Classe C 2023",
    IdentifiantProprietaire: 5,
    proprietaireNom: "AUTO SERVICES SARL",
    DateDebut: "2024-12-20",
    DateFin: "2024-12-25",
    NombreJours: 5,
    LieuPriseEnCharge: "45 Boulevard du 20 Mai, Mvan, Yaoundé",
    LieuRestitution: "45 Boulevard du 20 Mai, Mvan, Yaoundé",
    PrixJournalier: 75000,
    MontantLocation: 375000,
    FraisService: 18750,
    FraisAssurance: 18750,
    MontantTotal: 412500,
    MontantCaution: 300000,
    MethodePaiement: "CarteBancaire",
    StatutReservation: "EnCours",
    StatutPaiement: "Paye",
    DateCreationReservation: "2024-12-18T09:00:00",
  },
  {
    id: 3,
    NumeroReservation: "RES-2024-003",
    IdentifiantLocataire: 3,
    locataireNom: "Kevin FOTSO",
    IdentifiantVehicule: 6,
    vehiculeNom: "Renault Duster 2021",
    IdentifiantProprietaire: 4,
    proprietaireNom: "Christian ATANGANA",
    DateDebut: "2024-12-28",
    DateFin: "2024-12-30",
    NombreJours: 2,
    LieuPriseEnCharge: "78 Rue Omnisport, Yaoundé",
    LieuRestitution: "78 Rue Omnisport, Yaoundé",
    PrixJournalier: 40000,
    MontantLocation: 80000,
    FraisService: 4000,
    FraisAssurance: 4000,
    MontantTotal: 88000,
    MontantCaution: 100000,
    MethodePaiement: "MobileMoney_Orange",
    StatutReservation: "EnAttente",
    StatutPaiement: "EnAttente",
    DateCreationReservation: "2024-12-20T16:30:00",
  },
  {
    id: 4,
    NumeroReservation: "RES-2024-004",
    IdentifiantLocataire: 1,
    locataireNom: "Samuel MBARGA",
    IdentifiantVehicule: 5,
    vehiculeNom: "BMW X5 2022",
    IdentifiantProprietaire: 6,
    proprietaireNom: "Sandrine MOUKOUDI",
    DateDebut: "2025-01-02",
    DateFin: "2025-01-05",
    NombreJours: 3,
    LieuPriseEnCharge: "12 Rue Bonanjo, Douala",
    LieuRestitution: "12 Rue Bonanjo, Douala",
    PrixJournalier: 85000,
    MontantLocation: 255000,
    FraisService: 12750,
    FraisAssurance: 12750,
    MontantTotal: 280500,
    MontantCaution: 350000,
    MethodePaiement: "MobileMoney_MTN",
    StatutReservation: "Confirmee",
    StatutPaiement: "Paye",
    DateCreationReservation: "2024-12-30T11:00:00",
  },
  {
    id: 5,
    NumeroReservation: "RES-2024-005",
    IdentifiantLocataire: 2,
    locataireNom: "Florence NGUEMO",
    IdentifiantVehicule: 4,
    vehiculeNom: "Toyota Hiace 2020",
    IdentifiantProprietaire: 4,
    proprietaireNom: "Emmanuel FOKO",
    DateDebut: "2025-01-10",
    DateFin: "2025-01-12",
    NombreJours: 2,
    LieuPriseEnCharge: "Centre-ville, Bafoussam",
    LieuRestitution: "Centre-ville, Bafoussam",
    PrixJournalier: 60000,
    MontantLocation: 120000,
    FraisService: 6000,
    FraisAssurance: 6000,
    MontantTotal: 132000,
    MontantCaution: 200000,
    MethodePaiement: "CarteBancaire",
    StatutReservation: "Annulee",
    StatutPaiement: "Rembourse",
    DateCreationReservation: "2025-01-05T08:00:00",
  },
  {
    id: 6,
    NumeroReservation: "RES-2024-006",
    IdentifiantLocataire: 1,
    locataireNom: "Samuel MBARGA",
    IdentifiantVehicule: 2,
    vehiculeNom: "Honda CR-V 2021",
    IdentifiantProprietaire: 5,
    proprietaireNom: "Marie-Claire NJOYA",
    DateDebut: "2024-11-20",
    DateFin: "2024-11-25",
    NombreJours: 5,
    LieuPriseEnCharge: "Bastos, Yaoundé",
    LieuRestitution: "Bastos, Yaoundé",
    PrixJournalier: 50000,
    MontantLocation: 250000,
    FraisService: 12500,
    FraisAssurance: 12500,
    MontantTotal: 275000,
    MontantCaution: 150000,
    MethodePaiement: "MobileMoney_MTN",
    StatutReservation: "Terminee",
    StatutPaiement: "Paye",
    DateCreationReservation: "2024-11-18T10:00:00",
  },
]

// Statistiques de réservations
export const bookingStats = {
  total: 4521,
  enCours: 342,
  confirmees: 3876,
  annulees: 303,
  tauxConversion: 78.5,
  revenuMensuel: 287650000,
  moyenneParReservation: 63600,
}

// Fonction pour obtenir les réservations par utilisateur
export function getBookingsByUser(userId: number, role: "locataire" | "proprietaire"): Booking[] {
  if (role === "locataire") {
    return bookings.filter((b) => b.IdentifiantLocataire === userId)
  }
  return bookings.filter((b) => b.IdentifiantProprietaire === userId)
}

// Fonction pour obtenir une réservation par ID
export function getBookingById(id: number): Booking | undefined {
  return bookings.find((b) => b.id === id)
}

// Fonction pour obtenir les statistiques d'un propriétaire
export function getOwnerStats(ownerId: number) {
  const ownerBookings = bookings.filter((b) => b.IdentifiantProprietaire === ownerId)
  const confirmedBookings = ownerBookings.filter((b) => b.StatutReservation === "Confirmee" || b.StatutReservation === "Terminee")

  return {
    totalReservations: ownerBookings.length,
    confirmees: confirmedBookings.length,
    annulees: ownerBookings.filter((b) => b.StatutReservation === "Annulee").length,
    revenus: confirmedBookings.reduce((sum, b) => sum + b.MontantTotal, 0),
    tauxOccupation: Math.round((confirmedBookings.length / ownerBookings.length) * 100) || 0,
  }
}
