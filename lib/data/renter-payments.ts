// Données des paiements du locataire
// Synchronisé avec Prisma model Transaction (table Transactions)

export interface RenterPayment {
  id: number
  NumeroTransaction: string
  IdentifiantReservation: number
  vehicleName: string
  vehicleImage: string
  ownerName: string
  ownerAvatar: string
  dates: string
  Montant: number
  MethodePaiement: string
  StatutTransaction: string
  DateTransaction: string
  invoiceUrl?: string
}

export const renterPayments: RenterPayment[] = [
  {
    id: 1, NumeroTransaction: "TRX-RNT-001", IdentifiantReservation: 1,
    vehicleName: "Toyota Corolla 2022", vehicleImage: "/placeholder.jpg",
    ownerName: "Jean-Pierre KAMGA", ownerAvatar: "/placeholder-user.jpg",
    dates: "15 - 18 Déc 2024", Montant: 215500,
    MethodePaiement: "MobileMoney_MTN", StatutTransaction: "Succes",
    DateTransaction: "2024-12-14", invoiceUrl: "/invoices/PAY-R-001.pdf",
  },
  {
    id: 2, NumeroTransaction: "TRX-RNT-002", IdentifiantReservation: 4,
    vehicleName: "BMW X5 2022", vehicleImage: "/placeholder.jpg",
    ownerName: "Sandrine MOUKOUDI", ownerAvatar: "/placeholder-user.jpg",
    dates: "02 - 05 Jan 2025", Montant: 630500,
    MethodePaiement: "MobileMoney_MTN", StatutTransaction: "Succes",
    DateTransaction: "2024-12-30", invoiceUrl: "/invoices/PAY-R-002.pdf",
  },
  {
    id: 3, NumeroTransaction: "TRX-RNT-003", IdentifiantReservation: 6,
    vehicleName: "Honda CR-V 2021", vehicleImage: "/placeholder.jpg",
    ownerName: "Marie-Claire NJOYA", ownerAvatar: "/placeholder-user.jpg",
    dates: "20 - 25 Nov 2024", Montant: 425000,
    MethodePaiement: "MobileMoney_MTN", StatutTransaction: "Succes",
    DateTransaction: "2024-11-18", invoiceUrl: "/invoices/PAY-R-003.pdf",
  },
  {
    id: 4, NumeroTransaction: "TRX-RNT-004", IdentifiantReservation: 7,
    vehicleName: "Renault Duster 2021", vehicleImage: "/placeholder.jpg",
    ownerName: "Christian ATANGANA", ownerAvatar: "/placeholder-user.jpg",
    dates: "05 - 07 Oct 2024", Montant: 188000,
    MethodePaiement: "CarteBancaire", StatutTransaction: "Rembourse",
    DateTransaction: "2024-10-03",
  },
]

// Statistiques du locataire
export const renterFinancialStats = {
  totalSpent: 1459000,
  thisMonth: 630500,
  loyaltyPoints: 850,
  savedPaymentMethods: 2,
}

// Méthodes de paiement enregistrées
export const savedPaymentMethods = [
  {
    id: "pm-1",
    type: "mobile_money_mtn",
    label: "MTN Mobile Money",
    number: "+237 691 234 567",
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "mobile_money_orange",
    label: "Orange Money",
    number: "+237 655 111 222",
    isDefault: false,
  },
]

export const paymentMethodLabels = {
  mobile_money_mtn: "MTN MoMo",
  mobile_money_orange: "Orange Money",
  carte_bancaire: "Carte bancaire",
}

export const renterPaymentStatusLabels = {
  completed: "Payé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
}

export const renterPaymentStatusColors = {
  completed: "bg-green-500/10 text-green-600",
  pending: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-blue-500/10 text-blue-600",
}
