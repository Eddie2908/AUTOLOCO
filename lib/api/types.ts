// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nom: string
  prenom?: string
  telephone: string
  user_type: "Locataire" | "Proprietaire"
  ville: string
  quartier: string
  date_naissance?: string
  type_profil?: "particulier" | "professionnel" | "entreprise"
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: "bearer"
  expires_in: number
  user: User
}

// User - Synchronisé avec Prisma model User (table Utilisateurs)
export interface User {
  id: number
  Nom: string
  Prenom: string
  Email: string
  NumeroTelephone?: string
  DateNaissance?: string
  PhotoProfil?: string
  TypeUtilisateur: "Locataire" | "Proprietaire" | "Admin"
  StatutCompte?: string
  EmailVerifie?: boolean
  TelephoneVerifie?: boolean
  DateInscription?: string
  DerniereConnexion?: string
  AdresseIP?: string
  DeviceInfo?: string
  LanguePreferee?: string
  DevisePreferee?: string
  BiographieUtilisateur?: string
  SiteWeb?: string
  ReseauxSociaux?: string
  NotesUtilisateur?: number
  NombreReservationsEffectuees?: number
  NombreVehiculesLoues?: number
  MembreDepuis?: number
  NiveauFidelite?: string
  PointsFideliteTotal?: number
}

// Vehicle - Synchronisé avec Prisma model Vehicle (table Vehicules)
export interface Vehicle {
  id: number
  proprietaireId: number
  categorieId: number
  modeleId: number
  TitreAnnonce: string
  DescriptionVehicule?: string
  Immatriculation?: string
  Annee: number
  Couleur?: string
  Kilometrage?: number
  NumeroChassisVIN?: string
  NombrePlaces: number
  TypeCarburant: string
  TypeTransmission: string
  Climatisation?: boolean
  GPS?: boolean
  Bluetooth?: boolean
  CameraRecul?: boolean
  SiegesEnCuir?: boolean
  ToitOuvrant?: boolean
  RegulateursVitesse?: boolean
  AirbagsMultiples?: boolean
  EquipementsSupplementaires?: string
  PrixJournalier: number
  PrixHebdomadaire?: number
  PrixMensuel?: number
  CautionRequise?: number
  KilometrageInclus?: number
  FraisKilometrageSupplementaire?: number
  LocalisationVille: string
  LocalisationRegion?: string
  AdresseComplete?: string
  Latitude?: number
  Longitude?: number
  DisponibiliteLundi?: boolean
  DisponibiliteMardi?: boolean
  DisponibiliteMercredi?: boolean
  DisponibiliteJeudi?: boolean
  DisponibiliteVendredi?: boolean
  DisponibiliteSamedi?: boolean
  DisponibiliteDimanche?: boolean
  HeureDebutDisponibilite?: string
  HeureFinDisponibilite?: string
  LivraisonPossible?: boolean
  FraisLivraison?: number
  RayonLivraison?: number
  StatutVehicule?: string
  StatutVerification?: string
  NotesVehicule?: number
  NombreReservations?: number
  NombreVues?: number
  DateCreation?: string
  DateDerniereModification?: string
  DateDerniereReservation?: string
  EstPromotion?: boolean
  EstVedette?: boolean
  EstAssure?: boolean
  CompagnieAssurance?: string
  NumeroPoliceAssurance?: string
  DateExpirationAssurance?: string
  DernierEntretien?: string
  ProchainEntretien?: string
  TarificationDynamiqueActive?: boolean
  TauxOccupationActuel?: number
  // Relations chargées
  photos?: VehiclePhoto[]
  proprietaire?: User
  categorie?: CategorieVehicule
  modele?: ModeleVehicule
}

export interface VehiclePhoto {
  id: number
  vehiculeId: number
  URLPhoto: string
  URLMiniature?: string
  LegendePhoto?: string
  OrdreAffichage?: number
  EstPhotoPrincipale?: boolean
  TailleFichier?: number
  FormatImage?: string
  DateAjout?: string
}

export interface CategorieVehicule {
  id: number
  NomCategorie: string
  DescriptionCategorie?: string
  IconeCategorie?: string
  OrdreAffichage?: number
  EstActif?: boolean
}

export interface MarqueVehicule {
  id: number
  NomMarque: string
  LogoMarque?: string
  PaysOrigine?: string
  SiteWeb?: string
  EstPopulaire?: boolean
}

export interface ModeleVehicule {
  id: number
  marqueId: number
  NomModele: string
  AnneeDebut?: number
  AnneeFin?: number
  TypeCarburant?: string
  TypeTransmission?: string
  NombrePlaces?: number
  NombrePortes?: number
  CapaciteCoffre?: number
  ConsommationMoyenne?: number
  ImageModele?: string
  marque?: MarqueVehicule
}

export interface VehicleSearchParams {
  ville?: string
  type_vehicule?: string
  carburant?: string
  transmission?: string
  prix_min?: number
  prix_max?: number
  date_debut?: string
  date_fin?: string
  nombre_places?: number
  skip?: number
  limit?: number
}

export interface VehicleSearchResponse {
  items: Vehicle[]
  total: number
  skip: number
  limit: number
}

// Booking - Synchronisé avec Prisma model Reservation (table Reservations)
export interface Booking {
  id: number
  NumeroReservation: string
  vehiculeId: number
  locataireId: number
  proprietaireId: number
  DateDebut: string
  DateFin: string
  DateCreationReservation?: string
  HeureDebut?: string
  HeureFin?: string
  LieuPriseEnCharge?: string
  LieuRestitution?: string
  LivraisonDemandee?: boolean
  AdresseLivraison?: string
  FraisLivraison?: number
  NombreJours?: number
  PrixJournalier: number
  MontantLocation: number
  MontantCaution?: number
  FraisService?: number
  FraisAssurance?: number
  FraisSupplementaires?: number
  DetailsSupplementaires?: string
  Remise?: number
  CodePromo?: string
  MontantTotal: number
  StatutReservation?: string
  StatutPaiement?: string
  MethodePaiement?: string
  KilometrageDepart?: number
  KilometrageRetour?: number
  KilometrageParcouru?: number
  KilometrageInclus?: number
  FraisKilometrageSupplementaire?: number
  MontantKilometrageSupplementaire?: number
  NiveauCarburantDepart?: string
  NiveauCarburantRetour?: string
  EtatVehiculeDepart?: string
  EtatVehiculeRetour?: string
  CommentairesLocataire?: string
  CommentairesProprietaire?: string
  MotifAnnulation?: string
  DateAnnulation?: string
  annuleParId?: number
  FraisAnnulation?: number
  EstAssurance?: boolean
  TypeAssurance?: string
  MontantAssurance?: number
  ConducteursSupplementaires?: string
  NombreConducteurs?: number
  NotesSpeciales?: string
  DateConfirmation?: string
  DateDebutEffectif?: string
  DateFinEffective?: string
  RetardRetour?: number
  FraisRetard?: number
  // Relations chargées
  vehicule?: Vehicle
  locataire?: User
  proprietaire?: User
}

export interface CreateBookingRequest {
  vehiculeId: number
  DateDebut: string
  DateFin: string
  LieuPriseEnCharge: string
  LieuRestitution: string
  LivraisonDemandee?: boolean
  EstAssurance?: boolean
  TypeAssurance?: string
}

// Transaction - Synchronisé avec Prisma model Transaction (table Transactions)
export interface Payment {
  id: number
  NumeroTransaction: string
  reservationId?: number
  utilisateurId: number
  TypeTransaction: string
  Montant: number
  Devise?: string
  MethodePaiement: string
  FournisseurPaiement?: string
  ReferenceExterne?: string
  StatutTransaction?: string
  DateTransaction?: string
  DateTraitement?: string
  FraisTransaction?: number
  FraisCommission?: number
  MontantNet?: number
  Description?: string
  DetailsTransaction?: string
  CodeErreur?: string
  MessageErreur?: string
  NombreTentatives?: number
  EstRembourse?: boolean
  DateRemboursement?: string
}

export interface CreatePaymentRequest {
  reservationId: number
  MethodePaiement: string
  Montant: number
  TypeTransaction: string
}

// Message - Synchronisé avec Prisma model Message (table Messages)
export interface Message {
  id: number
  conversationId: number
  expediteurId: number
  destinataireId: number
  ContenuMessage: string
  TypeMessage?: string
  PiecesJointes?: string
  DateEnvoi?: string
  DateLecture?: string
  EstLu?: boolean
  EstArchive?: boolean
  EstSupprime?: boolean
  // Relations chargées
  expediteur?: User
  destinataire?: User
}

// Conversation - Synchronisé avec Prisma model Conversations
export interface Conversation {
  IdentifiantConversation: number
  IdentifiantUtilisateur1: number
  IdentifiantUtilisateur2: number
  IdentifiantReservation?: number
  IdentifiantVehicule?: number
  SujetConversation?: string
  StatutConversation?: string
  DateCreation?: string
  DateDernierMessage?: string
  NombreMessages?: number
  // Relations chargées
  Messages?: Message[]
}

// Avis - Synchronisé avec Prisma model Avis (table Avis)
export interface Review {
  id: number
  reservationId: number
  auteurId: number
  cibleId: number
  TypeCible: string
  NoteGlobale: number
  NoteProprete?: number
  NoteConformite?: number
  NoteCommunication?: number
  NoteEtatVehicule?: number
  NoteRapportQualitePrix?: number
  CommentaireAvis?: string
  PhotosAvis?: string
  RecommandeCible?: boolean
  StatutAvis?: string
  DateCreation?: string
  DateModification?: string
  NombreSignalements?: number
  NombreUtile?: number
  NombreInutile?: number
  ReponseProprietaire?: string
  DateReponse?: string
  // Relations chargées
  auteur?: User
}

// Notification - Synchronisé avec Prisma model Notification (table Notifications)
export interface Notification {
  id: number
  utilisateurId: number
  TypeNotification: string
  TitreNotification: string
  MessageNotification: string
  LienNotification?: string
  IconeNotification?: string
  PrioriteNotification?: string
  CanalEnvoi?: string
  DateCreation?: string
  DateEnvoi?: string
  DateLecture?: string
  EstLu?: boolean
  EstArchive?: boolean
  MetaDonnees?: string
}

export interface NotificationResponse {
  items: Notification[]
  total: number
  unread_count: number
}

// Analytics types
export interface AnalyticsOverview {
  total_revenus: number
  total_reservations: number
  taux_occupation: number
  note_moyenne: number
  evolution_revenus: number
  evolution_reservations: number
}

// Pagination wrapper
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}
