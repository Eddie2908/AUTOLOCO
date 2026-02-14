// Données pour le dashboard administrateur

import type { User } from "./users"
import { locataires, proprietaires } from "./users"

export interface AdminUser extends User {
  totalTransactions: number
  lastActivity: string
  flags: number
  totalSpent?: number
  totalEarned?: number
}

// Convertir les utilisateurs en AdminUser
export const adminUsers: AdminUser[] = [
  ...locataires.map(
    (l) =>
      ({
        ...l,
        totalTransactions: l.NombreReservationsEffectuees,
        lastActivity: "2024-12-20T14:30:00",
        flags: 0,
        totalSpent: l.NombreReservationsEffectuees * 85000,
      }) as AdminUser,
  ),
  ...proprietaires.map(
    (p) =>
      ({
        ...p,
        totalTransactions: p.NombreReservationsEffectuees,
        lastActivity: "2024-12-21T09:15:00",
        flags: 0,
        totalEarned: p.NombreReservationsEffectuees * 75000,
      }) as AdminUser,
  ),
]

// Statistiques globales des utilisateurs
export const userStats = {
  total: 4521,
  newThisWeek: 89,
  locataires: 3456,
  proprietaires: 1065,
  verified: 3987,
  pending: 423,
  suspended: 111,
}

// Réservations pour l'admin
export interface AdminBooking {
  id: number
  NumeroReservation: string
  vehicleName: string
  vehicleImage: string
  renterName: string
  renterAvatar: string
  ownerName: string
  ownerAvatar: string
  DateDebut: string
  DateFin: string
  MontantTotal: number
  StatutReservation: string
  LocalisationVille: string
  DateCreationReservation: string
  StatutPaiement: string
}

export const adminBookings: AdminBooking[] = [
  {
    id: 1, NumeroReservation: "RES-2024-001",
    vehicleName: "Toyota Corolla 2022", vehicleImage: "/placeholder.jpg",
    renterName: "Samuel MBARGA", renterAvatar: "/placeholder-user.jpg",
    ownerName: "Jean-Pierre KAMGA", ownerAvatar: "/placeholder-user.jpg",
    DateDebut: "2024-12-15", DateFin: "2024-12-18", MontantTotal: 115500,
    StatutReservation: "EnCours", LocalisationVille: "Douala",
    DateCreationReservation: "2024-12-14T10:30:00", StatutPaiement: "Paye",
  },
  {
    id: 2, NumeroReservation: "RES-2024-002",
    vehicleName: "Mercedes Classe C 2023", vehicleImage: "/placeholder.jpg",
    renterName: "Florence NGUEMO", renterAvatar: "/placeholder-user.jpg",
    ownerName: "AUTO SERVICES SARL", ownerAvatar: "/placeholder-logo.png",
    DateDebut: "2024-12-20", DateFin: "2024-12-25", MontantTotal: 412500,
    StatutReservation: "Confirmee", LocalisationVille: "Yaoundé",
    DateCreationReservation: "2024-12-18T09:00:00", StatutPaiement: "Paye",
  },
  {
    id: 3, NumeroReservation: "RES-2024-003",
    vehicleName: "BMW X5 2022", vehicleImage: "/placeholder.jpg",
    renterName: "Kevin FOTSO", renterAvatar: "/placeholder-user.jpg",
    ownerName: "Sandrine MOUKOUDI", ownerAvatar: "/placeholder-user.jpg",
    DateDebut: "2024-12-28", DateFin: "2024-12-30", MontantTotal: 280500,
    StatutReservation: "EnAttente", LocalisationVille: "Douala",
    DateCreationReservation: "2024-12-20T16:30:00", StatutPaiement: "EnAttente",
  },
  {
    id: 4, NumeroReservation: "RES-2024-004",
    vehicleName: "Renault Duster 2021", vehicleImage: "/placeholder.jpg",
    renterName: "Paul ESSOMBA", renterAvatar: "/placeholder-user.jpg",
    ownerName: "Christian ATANGANA", ownerAvatar: "/placeholder-user.jpg",
    DateDebut: "2024-12-10", DateFin: "2024-12-12", MontantTotal: 88000,
    StatutReservation: "Terminee", LocalisationVille: "Yaoundé",
    DateCreationReservation: "2024-12-08T11:00:00", StatutPaiement: "Paye",
  },
  {
    id: 5, NumeroReservation: "RES-2024-005",
    vehicleName: "Toyota Hiace 2020", vehicleImage: "/placeholder.jpg",
    renterName: "Marie TCHINDA", renterAvatar: "/placeholder-user.jpg",
    ownerName: "Emmanuel FOKO", ownerAvatar: "/placeholder-user.jpg",
    DateDebut: "2025-01-10", DateFin: "2025-01-12", MontantTotal: 132000,
    StatutReservation: "Annulee", LocalisationVille: "Bafoussam",
    DateCreationReservation: "2025-01-05T08:00:00", StatutPaiement: "Rembourse",
  },
  {
    id: 6, NumeroReservation: "RES-2024-006",
    vehicleName: "Honda CR-V 2021", vehicleImage: "/placeholder.jpg",
    renterName: "Samuel MBARGA", renterAvatar: "/placeholder-user.jpg",
    ownerName: "Marie-Claire NJOYA", ownerAvatar: "/placeholder-user.jpg",
    DateDebut: "2024-12-22", DateFin: "2024-12-26", MontantTotal: 275000,
    StatutReservation: "Litige", LocalisationVille: "Yaoundé",
    DateCreationReservation: "2024-12-19T15:00:00", StatutPaiement: "Paye",
  },
]

// Statistiques des réservations
export const bookingStats = {
  today: 23,
  thisWeek: 156,
  disputes: 3,
  cancellationRate: 4.2,
}

export const userStatusLabels = {
  verifie: "Vérifié",
  en_attente: "En attente",
  suspendu: "Suspendu",
}

export const userStatusColors = {
  verifie: "bg-green-500/10 text-green-600",
  en_attente: "bg-amber-500/10 text-amber-600",
  suspendu: "bg-red-500/10 text-red-600",
}

export const bookingStatusLabels = {
  pending: "En attente",
  confirmed: "Confirmée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
  dispute: "Litige",
}

export const bookingStatusColors = {
  pending: "bg-amber-500/10 text-amber-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-600",
  cancelled: "bg-gray-500/10 text-gray-600",
  dispute: "bg-red-500/10 text-red-600",
}
