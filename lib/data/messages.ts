// Données de messagerie pour la démonstration AUTOLOCO
// Synchronisé avec Prisma models Message et Conversation

export interface Message {
  id: number
  IdentifiantConversation: number
  IdentifiantExpediteur: number
  IdentifiantDestinataire: number
  ContenuMessage: string
  TypeMessage: string
  DateEnvoi: string
  EstLu: boolean
  // Champs de présentation
  expediteurNom: string
  expediteurAvatar: string
}

export interface Conversation {
  id: number
  IdentifiantUtilisateur1: number
  IdentifiantUtilisateur2: number
  IdentifiantReservation: number | null
  IdentifiantVehicule: number | null
  SujetConversation: string | null
  StatutConversation: string
  DateCreation: string
  DateDernierMessage: string
  NombreMessages: number
  // Champs de présentation
  participantNoms: string[]
  participantAvatars: string[]
  vehiculeNom: string | null
  nonLus: number
  messages: Message[]
}

export const conversations: Conversation[] = [
  {
    id: 1, IdentifiantUtilisateur1: 1, IdentifiantUtilisateur2: 4, IdentifiantReservation: 1, IdentifiantVehicule: 1,
    SujetConversation: "Toyota Corolla 2022", StatutConversation: "Active",
    DateCreation: "2024-12-13T10:30:00", DateDernierMessage: "2024-12-14T15:40:00", NombreMessages: 4,
    participantNoms: ["Samuel MBARGA", "Jean-Pierre KAMGA"],
    participantAvatars: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
    vehiculeNom: "Toyota Corolla 2022", nonLus: 1,
    messages: [
      { id: 1, IdentifiantConversation: 1, IdentifiantExpediteur: 1, IdentifiantDestinataire: 4, ContenuMessage: "Bonjour, je suis intéressé par votre Toyota Corolla.", TypeMessage: "Texte", DateEnvoi: "2024-12-13T10:30:00", EstLu: true, expediteurNom: "Samuel MBARGA", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 2, IdentifiantConversation: 1, IdentifiantExpediteur: 4, IdentifiantDestinataire: 1, ContenuMessage: "Bonjour Samuel, oui elle est disponible.", TypeMessage: "Texte", DateEnvoi: "2024-12-13T10:45:00", EstLu: true, expediteurNom: "Jean-Pierre KAMGA", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 3, IdentifiantConversation: 1, IdentifiantExpediteur: 1, IdentifiantDestinataire: 4, ContenuMessage: "Parfait ! Je fais la réservation.", TypeMessage: "Texte", DateEnvoi: "2024-12-13T11:00:00", EstLu: true, expediteurNom: "Samuel MBARGA", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 4, IdentifiantConversation: 1, IdentifiantExpediteur: 4, IdentifiantDestinataire: 1, ContenuMessage: "Super, réservation confirmée. À bientôt !", TypeMessage: "Texte", DateEnvoi: "2024-12-14T15:40:00", EstLu: false, expediteurNom: "Jean-Pierre KAMGA", expediteurAvatar: "/placeholder-user.jpg" },
    ],
  },
  {
    id: 2, IdentifiantUtilisateur1: 2, IdentifiantUtilisateur2: 5, IdentifiantReservation: 2, IdentifiantVehicule: 3,
    SujetConversation: "Mercedes Classe C 2023", StatutConversation: "Active",
    DateCreation: "2024-12-18T09:00:00", DateDernierMessage: "2024-12-18T09:15:00", NombreMessages: 2,
    participantNoms: ["Florence NGUEMO", "AUTO SERVICES SARL"],
    participantAvatars: ["/placeholder-user.jpg", "/placeholder-logo.png"],
    vehiculeNom: "Mercedes Classe C 2023", nonLus: 0,
    messages: [
      { id: 5, IdentifiantConversation: 2, IdentifiantExpediteur: 2, IdentifiantDestinataire: 5, ContenuMessage: "Bonjour, la Mercedes dispose du chauffeur en option ?", TypeMessage: "Texte", DateEnvoi: "2024-12-18T09:00:00", EstLu: true, expediteurNom: "Florence NGUEMO", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 6, IdentifiantConversation: 2, IdentifiantExpediteur: 5, IdentifiantDestinataire: 2, ContenuMessage: "Oui, service chauffeur à 25 000 FCFA/jour.", TypeMessage: "Texte", DateEnvoi: "2024-12-18T09:15:00", EstLu: true, expediteurNom: "AUTO SERVICES SARL", expediteurAvatar: "/placeholder-logo.png" },
    ],
  },
  {
    id: 3, IdentifiantUtilisateur1: 1, IdentifiantUtilisateur2: 6, IdentifiantReservation: 4, IdentifiantVehicule: 5,
    SujetConversation: "BMW X5 2022", StatutConversation: "Active",
    DateCreation: "2024-12-30T11:30:00", DateDernierMessage: "2024-12-30T12:00:00", NombreMessages: 3,
    participantNoms: ["Samuel MBARGA", "Sandrine MOUKOUDI"],
    participantAvatars: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
    vehiculeNom: "BMW X5 2022", nonLus: 2,
    messages: [
      { id: 7, IdentifiantConversation: 3, IdentifiantExpediteur: 1, IdentifiantDestinataire: 6, ContenuMessage: "Bonjour, j'ai réservé votre BMW X5. Confirmez l'heure de prise en charge ?", TypeMessage: "Texte", DateEnvoi: "2024-12-30T11:30:00", EstLu: true, expediteurNom: "Samuel MBARGA", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 8, IdentifiantConversation: 3, IdentifiantExpediteur: 6, IdentifiantDestinataire: 1, ContenuMessage: "Le véhicule sera prêt à 10h à Bonanjo.", TypeMessage: "Texte", DateEnvoi: "2024-12-30T11:45:00", EstLu: false, expediteurNom: "Sandrine MOUKOUDI", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 9, IdentifiantConversation: 3, IdentifiantExpediteur: 6, IdentifiantDestinataire: 1, ContenuMessage: "Merci pour la réservation, le véhicule sera prêt le 2 janvier à 10h.", TypeMessage: "Texte", DateEnvoi: "2024-12-30T12:00:00", EstLu: false, expediteurNom: "Sandrine MOUKOUDI", expediteurAvatar: "/placeholder-user.jpg" },
    ],
  },
  {
    id: 4, IdentifiantUtilisateur1: 3, IdentifiantUtilisateur2: 4, IdentifiantReservation: 3, IdentifiantVehicule: 6,
    SujetConversation: "Renault Duster 2021", StatutConversation: "Active",
    DateCreation: "2024-12-20T16:35:00", DateDernierMessage: "2024-12-20T16:45:00", NombreMessages: 2,
    participantNoms: ["Kevin FOTSO", "Christian ATANGANA"],
    participantAvatars: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
    vehiculeNom: "Renault Duster 2021", nonLus: 1,
    messages: [
      { id: 10, IdentifiantConversation: 4, IdentifiantExpediteur: 3, IdentifiantDestinataire: 4, ContenuMessage: "Bonjour, je viens de faire une demande de réservation pour le Duster.", TypeMessage: "Texte", DateEnvoi: "2024-12-20T16:35:00", EstLu: true, expediteurNom: "Kevin FOTSO", expediteurAvatar: "/placeholder-user.jpg" },
      { id: 11, IdentifiantConversation: 4, IdentifiantExpediteur: 4, IdentifiantDestinataire: 3, ContenuMessage: "Votre réservation est en attente de paiement.", TypeMessage: "Texte", DateEnvoi: "2024-12-20T16:45:00", EstLu: false, expediteurNom: "Christian ATANGANA", expediteurAvatar: "/placeholder-user.jpg" },
    ],
  },
]

// Fonction pour obtenir les conversations d'un utilisateur
export function getConversationsByUser(userId: number): Conversation[] {
  return conversations.filter((c) => c.IdentifiantUtilisateur1 === userId || c.IdentifiantUtilisateur2 === userId)
}

// Fonction pour obtenir une conversation par ID
export function getConversationById(id: number): Conversation | undefined {
  return conversations.find((c) => c.id === id)
}

// Fonction pour compter les messages non lus
export function getUnreadCount(userId: number): number {
  const userConversations = getConversationsByUser(userId)
  return userConversations.reduce((total, conv) => {
    const unread = conv.messages.filter((m) => m.IdentifiantExpediteur !== userId && !m.EstLu).length
    return total + unread
  }, 0)
}
