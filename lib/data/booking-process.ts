// Données pour le processus de réservation

export interface BookingOption {
  id: string
  name: string
  description: string
  pricePerDay: number
  icon: string
}

export const bookingOptions: BookingOption[] = [
  {
    id: "insurance_premium",
    name: "Assurance Premium",
    description: "Couverture tous risques, franchise réduite à 0",
    pricePerDay: 5000,
    icon: "shield",
  },
  {
    id: "gps",
    name: "GPS Navigation",
    description: "Système de navigation GPS intégré",
    pricePerDay: 2000,
    icon: "map-pin",
  },
  {
    id: "child_seat",
    name: "Siège enfant",
    description: "Siège auto homologué pour enfant",
    pricePerDay: 1500,
    icon: "baby",
  },
  {
    id: "additional_driver",
    name: "Conducteur supplémentaire",
    description: "Ajoutez un second conducteur autorisé",
    pricePerDay: 3000,
    icon: "users",
  },
]

export const pickupLocations = [
  { value: "douala-akwa", label: "Douala - Akwa", address: "123 Rue de la Liberté, Akwa" },
  { value: "douala-bonapriso", label: "Douala - Bonapriso", address: "45 Boulevard de la République" },
  { value: "douala-bonanjo", label: "Douala - Bonanjo", address: "12 Rue de la Gare" },
  { value: "yaounde-bastos", label: "Yaoundé - Bastos", address: "78 Avenue Kennedy" },
  { value: "yaounde-mvan", label: "Yaoundé - Mvan", address: "32 Boulevard du 20 Mai" },
  { value: "bafoussam-centre", label: "Bafoussam - Centre-ville", address: "15 Rue du Marché" },
]

export const paymentMethods = [
  {
    id: "mtn_momo",
    name: "MTN Mobile Money",
    icon: "/mtn-logo.png",
    description: "Paiement instantané via MTN MoMo",
    popular: true,
  },
  {
    id: "orange_money",
    name: "Orange Money",
    icon: "/orange-logo.png",
    description: "Paiement via Orange Money",
    popular: false,
  },
  {
    id: "card",
    name: "Carte bancaire",
    icon: "/card-icon.png",
    description: "Visa, Mastercard acceptées",
    popular: false,
  },
]

export const cancellationPolicies = {
  flexible: {
    name: "Flexible",
    description: "Annulation gratuite jusqu'à 24h avant",
    refundPercentage: 100,
  },
  moderate: {
    name: "Modérée",
    description: "Remboursement à 50% si annulation 48h avant",
    refundPercentage: 50,
  },
  strict: {
    name: "Stricte",
    description: "Aucun remboursement en cas d'annulation",
    refundPercentage: 0,
  },
}

// Calcul du prix de réservation
export function calculateBookingPrice(pricePerDay: number, days: number, options: string[], deposit: number) {
  const basePrice = pricePerDay * days

  const optionsPrice = options.reduce((total, optionId) => {
    const option = bookingOptions.find((o) => o.id === optionId)
    return total + (option ? option.pricePerDay * days : 0)
  }, 0)

  const subtotal = basePrice + optionsPrice
  const serviceFee = Math.round(subtotal * 0.05) // 5% frais de service
  const insurance = Math.round(subtotal * 0.05) // 5% assurance de base
  const total = subtotal + serviceFee + insurance

  return {
    basePrice,
    optionsPrice,
    subtotal,
    serviceFee,
    insurance,
    total,
    deposit,
    grandTotal: total + deposit,
  }
}
