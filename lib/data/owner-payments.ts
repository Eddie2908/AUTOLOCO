// Données des paiements et revenus du propriétaire
// Synchronisé avec Prisma model Transaction (table Transactions)

export interface OwnerPayment {
  id: number
  NumeroTransaction: string
  IdentifiantReservation: number
  vehicleName: string
  vehicleImage: string
  renterName: string
  renterAvatar: string
  dates: string
  Montant: number
  FraisCommission: number
  MontantNet: number
  StatutTransaction: string
  DateTransaction: string
  DateTraitement: string | null
  MethodePaiement: string
}

export const ownerPayments: OwnerPayment[] = [
  {
    id: 1, NumeroTransaction: "TRX-OWN-001", IdentifiantReservation: 1,
    vehicleName: "Toyota Corolla 2022", vehicleImage: "/placeholder.jpg",
    renterName: "Samuel MBARGA", renterAvatar: "/placeholder-user.jpg",
    dates: "15 - 18 Déc 2024", Montant: 115500, FraisCommission: 11550, MontantNet: 103950,
    StatutTransaction: "Succes", DateTransaction: "2024-12-14", DateTraitement: "2024-12-16",
    MethodePaiement: "MobileMoney_MTN",
  },
  {
    id: 2, NumeroTransaction: "TRX-OWN-002", IdentifiantReservation: 4,
    vehicleName: "BMW X5 2022", vehicleImage: "/placeholder.jpg",
    renterName: "Florence NGUEMO", renterAvatar: "/placeholder-user.jpg",
    dates: "02 - 05 Jan 2025", Montant: 280500, FraisCommission: 28050, MontantNet: 252450,
    StatutTransaction: "EnAttente", DateTransaction: "2024-12-30", DateTraitement: null,
    MethodePaiement: "MobileMoney_MTN",
  },
  {
    id: 3, NumeroTransaction: "TRX-OWN-003", IdentifiantReservation: 6,
    vehicleName: "Toyota Corolla 2022", vehicleImage: "/placeholder.jpg",
    renterName: "Kevin FOTSO", renterAvatar: "/placeholder-user.jpg",
    dates: "20 - 25 Nov 2024", Montant: 275000, FraisCommission: 27500, MontantNet: 247500,
    StatutTransaction: "Succes", DateTransaction: "2024-11-18", DateTraitement: "2024-11-20",
    MethodePaiement: "MobileMoney_MTN",
  },
  {
    id: 4, NumeroTransaction: "TRX-OWN-004", IdentifiantReservation: 7,
    vehicleName: "Mercedes Classe C 2023", vehicleImage: "/placeholder.jpg",
    renterName: "Paul ESSOMBA", renterAvatar: "/placeholder-user.jpg",
    dates: "10 - 12 Nov 2024", Montant: 225000, FraisCommission: 22500, MontantNet: 202500,
    StatutTransaction: "Succes", DateTransaction: "2024-11-08", DateTraitement: "2024-11-10",
    MethodePaiement: "CarteBancaire",
  },
  {
    id: 5, NumeroTransaction: "TRX-OWN-005", IdentifiantReservation: 8,
    vehicleName: "BMW X5 2022", vehicleImage: "/placeholder.jpg",
    renterName: "Marie TCHINDA", renterAvatar: "/placeholder-user.jpg",
    dates: "01 - 03 Nov 2024", Montant: 255000, FraisCommission: 25500, MontantNet: 229500,
    StatutTransaction: "Succes", DateTransaction: "2024-10-30", DateTraitement: "2024-11-01",
    MethodePaiement: "MobileMoney_Orange",
  },
]

// Statistiques financières du propriétaire
export const ownerFinancialStats = {
  totalRevenue: 1550000,
  monthRevenue: 875000,
  pendingPayout: 252450,
  completedPayout: 1297550,
  thisMonthBookings: 12,
  averageBookingValue: 129166,
}

// Données pour le graphique des revenus
export const revenueChartData = [
  { month: "Juil", revenue: 320000, bookings: 5 },
  { month: "Août", revenue: 450000, bookings: 7 },
  { month: "Sept", revenue: 380000, bookings: 6 },
  { month: "Oct", revenue: 520000, bookings: 8 },
  { month: "Nov", revenue: 680000, bookings: 10 },
  { month: "Déc", revenue: 875000, bookings: 12 },
]

// Prochain versement programmé
export const nextPayout = {
  amount: 252450,
  date: "2025-01-05",
  method: "MTN Mobile Money",
  accountNumber: "+237 677 456 789",
}

export const paymentStatusLabels = {
  pending: "En attente",
  processing: "En cours",
  completed: "Versé",
  failed: "Échoué",
}

export const paymentStatusColors = {
  pending: "bg-amber-500/10 text-amber-600",
  processing: "bg-blue-500/10 text-blue-600",
  completed: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-600",
}
