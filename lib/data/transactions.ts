// Données de transactions pour la démonstration AUTOLOCO
// Synchronisé avec Prisma model Transaction (table Transactions)

export interface Transaction {
  id: number
  NumeroTransaction: string
  IdentifiantReservation: number | null
  IdentifiantUtilisateur: number
  TypeTransaction: string
  Montant: number
  Devise: string
  MethodePaiement: string
  FournisseurPaiement: string | null
  ReferenceExterne: string | null
  StatutTransaction: string
  DateTransaction: string
  DateTraitement: string | null
  FraisTransaction: number
  FraisCommission: number
  MontantNet: number | null
  Description: string | null
  EstRembourse: boolean
}

export const transactions: Transaction[] = [
  {
    id: 1, NumeroTransaction: "TRX-2024-001", IdentifiantReservation: 1, IdentifiantUtilisateur: 1,
    TypeTransaction: "PaiementLocation", Montant: 115500, Devise: "XOF",
    MethodePaiement: "MobileMoney_MTN", FournisseurPaiement: "MTN", ReferenceExterne: "MTN-PAY-2024-789456",
    StatutTransaction: "Succes", DateTransaction: "2024-12-14T15:28:00", DateTraitement: "2024-12-14T15:30:00",
    FraisTransaction: 1155, FraisCommission: 5250, MontantNet: 103950,
    Description: "Paiement location Toyota Corolla 2022 - 3 jours", EstRembourse: false,
  },
  {
    id: 2, NumeroTransaction: "TRX-2024-002", IdentifiantReservation: 1, IdentifiantUtilisateur: 1,
    TypeTransaction: "Caution", Montant: 100000, Devise: "XOF",
    MethodePaiement: "MobileMoney_MTN", FournisseurPaiement: "MTN", ReferenceExterne: "MTN-CAU-2024-789457",
    StatutTransaction: "Succes", DateTransaction: "2024-12-14T15:32:00", DateTraitement: "2024-12-19T11:00:00",
    FraisTransaction: 0, FraisCommission: 0, MontantNet: null,
    Description: "Caution libérée - Toyota Corolla 2022", EstRembourse: true,
  },
  {
    id: 3, NumeroTransaction: "TRX-2024-003", IdentifiantReservation: 2, IdentifiantUtilisateur: 2,
    TypeTransaction: "PaiementLocation", Montant: 412500, Devise: "XOF",
    MethodePaiement: "CarteBancaire", FournisseurPaiement: "Stripe", ReferenceExterne: "STRIPE-2024-456123",
    StatutTransaction: "Succes", DateTransaction: "2024-12-19T10:10:00", DateTraitement: "2024-12-19T10:15:00",
    FraisTransaction: 12375, FraisCommission: 18750, MontantNet: 362625,
    Description: "Paiement location Mercedes Classe C 2023 - 5 jours", EstRembourse: false,
  },
  {
    id: 4, NumeroTransaction: "TRX-2024-004", IdentifiantReservation: 3, IdentifiantUtilisateur: 3,
    TypeTransaction: "PaiementLocation", Montant: 88000, Devise: "XOF",
    MethodePaiement: "MobileMoney_Orange", FournisseurPaiement: "Orange", ReferenceExterne: null,
    StatutTransaction: "EnAttente", DateTransaction: "2024-12-20T16:35:00", DateTraitement: null,
    FraisTransaction: 880, FraisCommission: 4000, MontantNet: 79200,
    Description: "Paiement en attente - Renault Duster 2021 - 2 jours", EstRembourse: false,
  },
  {
    id: 5, NumeroTransaction: "TRX-2024-005", IdentifiantReservation: 4, IdentifiantUtilisateur: 1,
    TypeTransaction: "PaiementLocation", Montant: 280500, Devise: "XOF",
    MethodePaiement: "MobileMoney_MTN", FournisseurPaiement: "MTN", ReferenceExterne: "MTN-PAY-2025-001234",
    StatutTransaction: "Succes", DateTransaction: "2024-12-30T11:40:00", DateTraitement: "2024-12-30T11:45:00",
    FraisTransaction: 2805, FraisCommission: 12750, MontantNet: 252450,
    Description: "Paiement location BMW X5 2022 - 3 jours", EstRembourse: false,
  },
  {
    id: 6, NumeroTransaction: "TRX-2024-006", IdentifiantReservation: 5, IdentifiantUtilisateur: 2,
    TypeTransaction: "Remboursement", Montant: 132000, Devise: "XOF",
    MethodePaiement: "CarteBancaire", FournisseurPaiement: "Stripe", ReferenceExterne: "STRIPE-REF-2024-789012",
    StatutTransaction: "Succes", DateTransaction: "2025-01-06T09:00:00", DateTraitement: "2025-01-06T09:30:00",
    FraisTransaction: 0, FraisCommission: 0, MontantNet: null,
    Description: "Remboursement - Réservation annulée Toyota Hiace 2020", EstRembourse: true,
  },
  {
    id: 7, NumeroTransaction: "TRX-2024-007", IdentifiantReservation: 6, IdentifiantUtilisateur: 1,
    TypeTransaction: "PaiementLocation", Montant: 275000, Devise: "XOF",
    MethodePaiement: "MobileMoney_MTN", FournisseurPaiement: "MTN", ReferenceExterne: "MTN-PAY-2024-654321",
    StatutTransaction: "Succes", DateTransaction: "2024-11-18T10:25:00", DateTraitement: "2024-11-18T10:30:00",
    FraisTransaction: 2750, FraisCommission: 12500, MontantNet: 247500,
    Description: "Paiement location Honda CR-V 2021 - 5 jours", EstRembourse: false,
  },
]

// Statistiques financières
export const financialStats = {
  revenuTotal: 287650000,
  commissionPlateforme: 28765000,
  transactionsReussies: 4218,
  transactionsEchouees: 156,
  tauxReussite: 96.4,
  moyenneTransaction: 63600,
  methodesPopulaires: [
    { methode: "MTN Mobile Money", pourcentage: 58 },
    { methode: "Orange Money", pourcentage: 24 },
    { methode: "Carte bancaire", pourcentage: 15 },
    { methode: "Espèces", pourcentage: 3 },
  ],
}

// Codes de test pour les paiements sandbox
export const testPaymentCodes = {
  mobileMoney: {
    mtn: [
      { numero: "+237 650 000 001", pin: "1234", resultat: "Succès" },
      { numero: "+237 650 000 002", pin: "1234", resultat: "Solde insuffisant" },
      { numero: "+237 650 000 003", pin: "1234", resultat: "Timeout" },
    ],
    orange: [
      { numero: "+237 690 000 001", pin: "5678", resultat: "Succès" },
      { numero: "+237 690 000 002", pin: "5678", resultat: "Échec" },
    ],
  },
  cartes: [
    { type: "Visa", numero: "4242 4242 4242 4242", expiration: "12/25", cvc: "123", resultat: "Succès" },
    { type: "Visa", numero: "4000 0000 0000 0002", expiration: "12/25", cvc: "123", resultat: "Refusée" },
    { type: "Mastercard", numero: "5555 5555 5555 4444", expiration: "12/25", cvc: "123", resultat: "Succès" },
  ],
}

// Fonction pour obtenir les transactions d'un utilisateur
export function getTransactionsByUser(userId: number): Transaction[] {
  return transactions.filter((t) => t.IdentifiantUtilisateur === userId)
}

// Fonction pour obtenir les statistiques financières d'un propriétaire
export function getOwnerFinancialStats(ownerId: number) {
  // Simulation de statistiques pour un propriétaire
  return {
    revenus: {
      total: 875000,
      enAttente: 115500,
      verse: 759500,
    },
    transactions: {
      total: 12,
      reussies: 10,
      enAttente: 1,
      echouees: 1,
    },
    prochainVersement: {
      montant: 252450,
      date: "2025-01-05",
    },
  }
}
