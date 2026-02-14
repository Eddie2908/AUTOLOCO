// Données d'évaluations pour la démonstration AUTOLOCO
// Synchronisé avec Prisma model Avis (table Avis)

export interface Review {
  id: number
  IdentifiantReservation: number
  IdentifiantAuteur: number
  IdentifiantCible: number
  TypeCible: string
  NoteGlobale: number
  NoteProprete?: number
  NoteConformite?: number
  NoteCommunication?: number
  NoteEtatVehicule?: number
  NoteRapportQualitePrix?: number
  CommentaireAvis: string
  StatutAvis: string
  DateCreation: string
  ReponseProprietaire?: string
  DateReponse?: string
  // Champs de présentation (joints)
  evaluateurNom: string
  evaluateurAvatar: string
  evalueNom: string
}

export const reviews: Review[] = [
  {
    id: 1, IdentifiantReservation: 1, IdentifiantAuteur: 1, IdentifiantCible: 4,
    TypeCible: "Proprietaire", NoteGlobale: 5, NoteCommunication: 5, NoteEtatVehicule: 5, NoteRapportQualitePrix: 4,
    CommentaireAvis: "Excellent propriétaire ! Véhicule impeccable, M. Kamga était très réactif et le véhicule correspondait parfaitement aux photos. Je recommande vivement.",
    StatutAvis: "Publie", DateCreation: "2024-12-19T14:00:00",
    ReponseProprietaire: "Merci beaucoup M. Mbarga ! Ce fut un plaisir de vous accueillir. À bientôt sur AUTOLOCO !",
    DateReponse: "2024-12-19T16:30:00",
    evaluateurNom: "Samuel MBARGA", evaluateurAvatar: "/placeholder-user.jpg", evalueNom: "Jean-Pierre KAMGA",
  },
  {
    id: 2, IdentifiantReservation: 1, IdentifiantAuteur: 4, IdentifiantCible: 1,
    TypeCible: "Locataire", NoteGlobale: 5, NoteCommunication: 5,
    CommentaireAvis: "Locataire exemplaire, véhicule rendu propre et à l'heure. Un plaisir de traiter avec M. Mbarga.",
    StatutAvis: "Publie", DateCreation: "2024-12-19T15:30:00",
    evaluateurNom: "Jean-Pierre KAMGA", evaluateurAvatar: "/placeholder-user.jpg", evalueNom: "Samuel MBARGA",
  },
  {
    id: 3, IdentifiantReservation: 2, IdentifiantAuteur: 2, IdentifiantCible: 5,
    TypeCible: "Proprietaire", NoteGlobale: 4, NoteCommunication: 5, NoteEtatVehicule: 4, NoteRapportQualitePrix: 4,
    CommentaireAvis: "Très bon service de la part d'Auto Services. La Mercedes était superbe. Petit retard à la livraison mais rien de grave.",
    StatutAvis: "Publie", DateCreation: "2024-12-26T10:00:00",
    ReponseProprietaire: "Merci pour votre retour Mme Nguemo. Nous nous excusons pour le léger retard et ferons mieux la prochaine fois !",
    DateReponse: "2024-12-26T14:00:00",
    evaluateurNom: "Florence NGUEMO", evaluateurAvatar: "/placeholder-user.jpg", evalueNom: "AUTO SERVICES SARL",
  },
  {
    id: 4, IdentifiantReservation: 6, IdentifiantAuteur: 1, IdentifiantCible: 5,
    TypeCible: "Proprietaire", NoteGlobale: 5, NoteCommunication: 5, NoteEtatVehicule: 5, NoteRapportQualitePrix: 5,
    CommentaireAvis: "Expérience parfaite avec Mme Njoya. Le Honda CR-V était en excellent état, très spacieux pour notre voyage en famille.",
    StatutAvis: "Publie", DateCreation: "2024-11-26T11:00:00",
    evaluateurNom: "Samuel MBARGA", evaluateurAvatar: "/placeholder-user.jpg", evalueNom: "Marie-Claire NJOYA",
  },
  {
    id: 5, IdentifiantReservation: 6, IdentifiantAuteur: 5, IdentifiantCible: 1,
    TypeCible: "Locataire", NoteGlobale: 5, NoteCommunication: 5,
    CommentaireAvis: "M. Mbarga est un locataire de confiance. Véhicule restitué dans un état impeccable. Je le recommande sans hésitation.",
    StatutAvis: "Publie", DateCreation: "2024-11-26T12:30:00",
    evaluateurNom: "Marie-Claire NJOYA", evaluateurAvatar: "/placeholder-user.jpg", evalueNom: "Samuel MBARGA",
  },
  {
    id: 6, IdentifiantReservation: 1, IdentifiantAuteur: 1, IdentifiantCible: 1,
    TypeCible: "Vehicule", NoteGlobale: 5, NoteProprete: 5, NoteEtatVehicule: 5, NoteConformite: 5,
    CommentaireAvis: "Véhicule en parfait état, très économique en carburant. Climatisation efficace et intérieur très propre.",
    StatutAvis: "Publie", DateCreation: "2024-12-19T14:15:00",
    evaluateurNom: "Samuel MBARGA", evaluateurAvatar: "/placeholder-user.jpg", evalueNom: "Toyota Corolla 2022",
  },
]

// Statistiques globales des avis
export const reviewStats = {
  totalAvis: 3245,
  noteMoyenne: 4.7,
  distribution: {
    5: 68,
    4: 22,
    3: 7,
    2: 2,
    1: 1,
  },
  tauxRecommandation: 94,
}

// Fonction pour obtenir les avis d'un utilisateur
export function getReviewsByUser(userId: number, role: "evaluateur" | "evalue"): Review[] {
  if (role === "evaluateur") {
    return reviews.filter((r) => r.IdentifiantAuteur === userId)
  }
  return reviews.filter((r) => r.IdentifiantCible === userId)
}

// Fonction pour obtenir les avis d'un véhicule
export function getReviewsByVehicle(vehicleId: number): Review[] {
  return reviews.filter((r) => r.IdentifiantCible === vehicleId && r.TypeCible === "Vehicule")
}

// Fonction pour calculer la note moyenne
export function calculateAverageRating(userId: number): number {
  const userReviews = reviews.filter((r) => r.IdentifiantCible === userId)
  if (userReviews.length === 0) return 0
  const sum = userReviews.reduce((acc, r) => acc + r.NoteGlobale, 0)
  return Math.round((sum / userReviews.length) * 10) / 10
}
