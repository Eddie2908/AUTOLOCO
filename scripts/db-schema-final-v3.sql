-- =============================================
-- AUTOLOCO - Schéma de Base de Données Optimisé v3 FINAL
-- Version: 3.0 (Intégration des améliorations avancées)
-- Date: 2025
-- Description: Schéma complet avec sécurité, géolocalisation, tarification dynamique,
--              fidélité, cache, optimisations de performance et business intelligence
-- =============================================

-- =============================================
-- SECTION 1: GESTION DES UTILISATEURS
-- =============================================

-- Table des utilisateurs
CREATE TABLE Utilisateurs (
    IdentifiantUtilisateur INT IDENTITY PRIMARY KEY,
    Nom NVARCHAR(100) NOT NULL,
    Prenom NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    MotDePasse NVARCHAR(255) NOT NULL,
    NumeroTelephone NVARCHAR(20),
    DateNaissance DATE,
    PhotoProfil NVARCHAR(500),
    TypeUtilisateur NVARCHAR(20) NOT NULL CHECK (TypeUtilisateur IN ('Locataire', 'Proprietaire', 'Admin')),
    StatutCompte NVARCHAR(20) DEFAULT 'Actif' CHECK (StatutCompte IN ('Actif', 'Suspendu', 'Desactive', 'EnAttente')),
    EmailVerifie BIT DEFAULT 0,
    TelephoneVerifie BIT DEFAULT 0,
    DateInscription DATETIME2 DEFAULT SYSDATETIME(),
    DerniereConnexion DATETIME2,
    AdresseIP NVARCHAR(45),
    DeviceInfo NVARCHAR(500),
    LanguePreferee NVARCHAR(10) DEFAULT 'fr',
    DevisePreferee NVARCHAR(3) DEFAULT 'XOF',
    BiographieUtilisateur NVARCHAR(1000),
    SiteWeb NVARCHAR(255),
    ReseauxSociaux NVARCHAR(MAX), -- JSON: {facebook, twitter, linkedin, instagram}
    NotesUtilisateur DECIMAL(3,2) DEFAULT 0.00,
    NombreReservationsEffectuees INT DEFAULT 0,
    NombreVehiculesLoues INT DEFAULT 0,
    MembreDepuis AS (DATEDIFF(MONTH, DateInscription, SYSDATETIME())),
    
    -- Nouveaux champs pour le programme de fidélité
    NiveauFidelite NVARCHAR(20) DEFAULT 'BRONZE' CHECK (NiveauFidelite IN ('BRONZE','ARGENT','OR','PLATINE')),
    PointsFideliteTotal INT DEFAULT 0,
    
    INDEX IX_Utilisateurs_Email (Email),
    INDEX IX_Utilisateurs_TypeUtilisateur (TypeUtilisateur),
    INDEX IX_Utilisateurs_StatutCompte (StatutCompte),
    INDEX IX_Utilisateurs_DateInscription (DateInscription),
    INDEX IX_Utilisateurs_NiveauFidelite (NiveauFidelite)
);

-- Table des adresses utilisateurs
CREATE TABLE AdressesUtilisateurs (
    IdentifiantAdresse INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    TypeAdresse NVARCHAR(20) NOT NULL CHECK (TypeAdresse IN ('Principale', 'Facturation', 'Livraison', 'Autre')),
    AdresseLigne1 NVARCHAR(255) NOT NULL,
    AdresseLigne2 NVARCHAR(255),
    Ville NVARCHAR(100) NOT NULL,
    Region NVARCHAR(100),
    CodePostal NVARCHAR(20),
    Pays NVARCHAR(100) NOT NULL DEFAULT 'Sénégal',
    
    -- Utilisation de GEOGRAPHY pour stockage géospatial optimisé
    Coordonnees GEOGRAPHY,
    Latitude DECIMAL(10,8),
    Longitude DECIMAL(11,8),
    
    EstAdressePrincipale BIT DEFAULT 0,
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_AdressesUtilisateurs_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    INDEX IX_AdressesUtilisateurs_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_AdressesUtilisateurs_Type (TypeAdresse)
);

-- Index spatial pour recherches géographiques rapides
CREATE SPATIAL INDEX SIDX_AdressesUtilisateurs_Coordonnees 
ON AdressesUtilisateurs(Coordonnees)
USING GEOGRAPHY_GRID
WITH (GRIDS = (LEVEL_1 = MEDIUM, LEVEL_2 = MEDIUM, LEVEL_3 = MEDIUM, LEVEL_4 = MEDIUM));

-- Table des documents utilisateurs
CREATE TABLE DocumentsUtilisateurs (
    IdentifiantDocument INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    TypeDocument NVARCHAR(50) NOT NULL CHECK (TypeDocument IN ('PermisConduire', 'CarteIdentite', 'Passeport', 'JustificatifDomicile', 'RIB', 'AssuranceVehicule', 'CarteGrise', 'Autre')),
    NomFichier NVARCHAR(255) NOT NULL,
    CheminFichier NVARCHAR(500) NOT NULL,
    TailleFichier BIGINT,
    FormatFichier NVARCHAR(10),
    NumeroDocument NVARCHAR(100),
    DateExpiration DATE,
    StatutVerification NVARCHAR(20) DEFAULT 'EnAttente' CHECK (StatutVerification IN ('EnAttente', 'Verifie', 'Rejete', 'Expire')),
    DateTeleversement DATETIME2 DEFAULT SYSDATETIME(),
    DateVerification DATETIME2,
    VerifiePar INT,
    CommentairesVerification NVARCHAR(500),
    
    -- Ajout du hash pour vérification d'intégrité
    HashFichier VARBINARY(64), -- SHA-256
    
    CONSTRAINT FK_DocumentsUtilisateurs_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    CONSTRAINT FK_DocumentsUtilisateurs_Verificateur
        FOREIGN KEY (VerifiePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_DocumentsUtilisateurs_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_DocumentsUtilisateurs_Type (TypeDocument),
    INDEX IX_DocumentsUtilisateurs_Statut (StatutVerification),
    INDEX IX_DocumentsUtilisateurs_Expiration (DateExpiration)
);

-- Table des préférences utilisateurs
CREATE TABLE PreferencesUtilisateurs (
    IdentifiantPreference INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL UNIQUE,
    NotificationsEmail BIT DEFAULT 1,
    NotificationsSMS BIT DEFAULT 1,
    NotificationsPush BIT DEFAULT 1,
    NotificationsReservations BIT DEFAULT 1,
    NotificationsPromotions BIT DEFAULT 0,
    NotificationsMessages BIT DEFAULT 1,
    NotificationsAvis BIT DEFAULT 1,
    ModeTheme NVARCHAR(10) DEFAULT 'Clair' CHECK (ModeTheme IN ('Clair', 'Sombre', 'Auto')),
    AffichageMonnaie NVARCHAR(3) DEFAULT 'XOF',
    FormatDate NVARCHAR(20) DEFAULT 'DD/MM/YYYY',
    FuseauHoraire NVARCHAR(50) DEFAULT 'Africa/Dakar',
    VisibiliteProfile NVARCHAR(20) DEFAULT 'Public' CHECK (VisibiliteProfile IN ('Public', 'Prive', 'Amis')),
    AfficherNumeroTelephone BIT DEFAULT 0,
    AfficherEmail BIT DEFAULT 0,
    AutoriserMessages BIT DEFAULT 1,
    DateMiseAJour DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PreferencesUtilisateurs_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE
);

-- =============================================
-- SECTION 1B: SÉCURITÉ RENFORCÉE (NOUVELLES TABLES)
-- =============================================

-- Table des tentatives de connexion (Protection anti-brute force)
CREATE TABLE TentativesConnexion (
    IdentifiantTentative INT IDENTITY PRIMARY KEY,
    AdresseEmail NVARCHAR(150) NOT NULL,
    AdresseIP NVARCHAR(50) NOT NULL,
    Reussie BIT DEFAULT 0,
    CodeErreur NVARCHAR(50),
    MotifEchec NVARCHAR(255),
    DateTentative DATETIME2 DEFAULT SYSDATETIME(),
    UserAgent NVARCHAR(500),
    Pays NVARCHAR(100),
    
    INDEX IDX_Tentatives_Email_Date (AdresseEmail, DateTentative),
    INDEX IDX_Tentatives_IP_Date (AdresseIP, DateTentative),
    INDEX IDX_Tentatives_Reussie (Reussie)
);

-- Table de chiffrement des données sensibles
CREATE TABLE DonneesChiffrees (
    IdentifiantChiffrement INT IDENTITY PRIMARY KEY,
    TableOrigine NVARCHAR(100) NOT NULL,
    ColonneOrigine NVARCHAR(100) NOT NULL,
    IdentifiantLigne INT NOT NULL,
    DonneesChiffrees VARBINARY(MAX) NOT NULL,
    Algorithme NVARCHAR(50) DEFAULT 'AES_256',
    VecteurInitialisation VARBINARY(16),
    DateChiffrement DATETIME2 DEFAULT SYSDATETIME(),
    ChiffrePar INT,
    
    CONSTRAINT FK_DonneesChiffrees_Utilisateur
        FOREIGN KEY (ChiffrePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IDX_Chiffrement_Origine (TableOrigine, ColonneOrigine, IdentifiantLigne)
);

-- =============================================
-- SECTION 2: GESTION DES VÉHICULES
-- =============================================

-- Table des catégories de véhicules
CREATE TABLE CategoriesVehicules (
    IdentifiantCategorie INT IDENTITY PRIMARY KEY,
    NomCategorie NVARCHAR(100) NOT NULL UNIQUE,
    DescriptionCategorie NVARCHAR(500),
    IconeCategorie NVARCHAR(255),
    OrdreAffichage INT DEFAULT 0,
    EstActif BIT DEFAULT 1,
    DateCreation DATETIME2 DEFAULT SYSDATETIME()
);

-- Table des marques de véhicules
CREATE TABLE MarquesVehicules (
    IdentifiantMarque INT IDENTITY PRIMARY KEY,
    NomMarque NVARCHAR(100) NOT NULL UNIQUE,
    LogoMarque NVARCHAR(255),
    PaysOrigine NVARCHAR(100),
    SiteWeb NVARCHAR(255),
    EstPopulaire BIT DEFAULT 0,
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    INDEX IX_MarquesVehicules_Populaire (EstPopulaire)
);

-- Table des modèles de véhicules
CREATE TABLE ModelesVehicules (
    IdentifiantModele INT IDENTITY PRIMARY KEY,
    IdentifiantMarque INT NOT NULL,
    NomModele NVARCHAR(100) NOT NULL,
    AnneeDebut INT,
    AnneeFin INT,
    TypeCarburant NVARCHAR(50) CHECK (TypeCarburant IN ('Essence', 'Diesel', 'Electrique', 'Hybride', 'GPL')),
    TypeTransmission NVARCHAR(50) CHECK (TypeTransmission IN ('Manuelle', 'Automatique', 'Semi-Automatique')),
    NombrePlaces INT,
    NombrePortes INT,
    CapaciteCoffre INT,
    ConsommationMoyenne DECIMAL(5,2),
    ImageModele NVARCHAR(255),
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ModelesVehicules_Marque
        FOREIGN KEY (IdentifiantMarque) REFERENCES MarquesVehicules(IdentifiantMarque),
    INDEX IX_ModelesVehicules_Marque (IdentifiantMarque),
    INDEX IX_ModelesVehicules_Carburant (TypeCarburant)
);

-- Table des véhicules
CREATE TABLE Vehicules (
    IdentifiantVehicule INT IDENTITY PRIMARY KEY,
    IdentifiantProprietaire INT NOT NULL,
    IdentifiantCategorie INT NOT NULL,
    IdentifiantModele INT NOT NULL,
    TitreAnnonce NVARCHAR(200) NOT NULL,
    DescriptionVehicule NVARCHAR(MAX),
    Immatriculation NVARCHAR(50) UNIQUE,
    Annee INT NOT NULL CHECK (Annee >= 1900 AND Annee <= YEAR(SYSDATETIME()) + 1),
    Couleur NVARCHAR(50),
    Kilometrage INT DEFAULT 0,
    NumeroChassisVIN NVARCHAR(50) UNIQUE,
    NombrePlaces INT NOT NULL,
    TypeCarburant NVARCHAR(50) NOT NULL,
    TypeTransmission NVARCHAR(50) NOT NULL,
    Climatisation BIT DEFAULT 0,
    GPS BIT DEFAULT 0,
    Bluetooth BIT DEFAULT 0,
    CameraRecul BIT DEFAULT 0,
    SiegesEnCuir BIT DEFAULT 0,
    ToitOuvrant BIT DEFAULT 0,
    RegulateursVitesse BIT DEFAULT 0,
    AirbagsMultiples BIT DEFAULT 0,
    EquipementsSupplementaires NVARCHAR(MAX),
    PrixJournalier DECIMAL(10,2) NOT NULL CHECK (PrixJournalier > 0),
    PrixHebdomadaire DECIMAL(10,2),
    PrixMensuel DECIMAL(10,2),
    CautionRequise DECIMAL(10,2) DEFAULT 0,
    KilometrageInclus INT DEFAULT 200,
    FraisKilometrageSupplementaire DECIMAL(10,2) DEFAULT 0,
    LocalisationVille NVARCHAR(100) NOT NULL,
    LocalisationRegion NVARCHAR(100),
    AdresseComplete NVARCHAR(500),
    
    -- Géolocalisation optimisée avec GEOGRAPHY
    Coordonnees GEOGRAPHY,
    Latitude DECIMAL(10,8),
    Longitude DECIMAL(11,8),
    
    DisponibiliteLundi BIT DEFAULT 1,
    DisponibiliteMardi BIT DEFAULT 1,
    DisponibiliteMercredi BIT DEFAULT 1,
    DisponibiliteJeudi BIT DEFAULT 1,
    DisponibiliteVendredi BIT DEFAULT 1,
    DisponibiliteSamedi BIT DEFAULT 1,
    DisponibiliteDimanche BIT DEFAULT 1,
    HeureDebutDisponibilite TIME DEFAULT '08:00',
    HeureFinDisponibilite TIME DEFAULT '20:00',
    LivraisonPossible BIT DEFAULT 0,
    FraisLivraison DECIMAL(10,2) DEFAULT 0,
    RayonLivraison INT,
    StatutVehicule NVARCHAR(20) DEFAULT 'Actif' CHECK (StatutVehicule IN ('Actif', 'Loue', 'Maintenance', 'Desactive', 'EnAttente')),
    StatutVerification NVARCHAR(20) DEFAULT 'EnAttente' CHECK (StatutVerification IN ('EnAttente', 'Verifie', 'Rejete')),
    NotesVehicule DECIMAL(3,2) DEFAULT 0.00,
    NombreReservations INT DEFAULT 0,
    NombreVues INT DEFAULT 0,
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateDerniereModification DATETIME2 DEFAULT SYSDATETIME(),
    DateDerniereReservation DATETIME2,
    EstPromotion BIT DEFAULT 0,
    EstVedette BIT DEFAULT 0,
    EstAssure BIT DEFAULT 0,
    CompagnieAssurance NVARCHAR(200),
    NumeroPoliceAssurance NVARCHAR(100),
    DateExpirationAssurance DATE,
    DernierEntretien DATE,
    ProchainEntretien DATE,
    
    -- Nouveaux champs pour tarification dynamique
    TarificationDynamiqueActive BIT DEFAULT 0,
    TauxOccupationActuel DECIMAL(5,2) DEFAULT 0.00,
    
    CONSTRAINT FK_Vehicules_Proprietaire
        FOREIGN KEY (IdentifiantProprietaire) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Vehicules_Categorie
        FOREIGN KEY (IdentifiantCategorie) REFERENCES CategoriesVehicules(IdentifiantCategorie),
    CONSTRAINT FK_Vehicules_Modele
        FOREIGN KEY (IdentifiantModele) REFERENCES ModelesVehicules(IdentifiantModele),
    INDEX IX_Vehicules_Proprietaire (IdentifiantProprietaire),
    INDEX IX_Vehicules_Categorie (IdentifiantCategorie),
    INDEX IX_Vehicules_Modele (IdentifiantModele),
    INDEX IX_Vehicules_Statut (StatutVehicule),
    INDEX IX_Vehicules_Ville (LocalisationVille),
    INDEX IX_Vehicules_Prix (PrixJournalier),
    INDEX IX_Vehicules_Notes (NotesVehicule),
    INDEX IX_Vehicules_DateCreation (DateCreation),
    INDEX IX_Vehicules_Vedette (EstVedette),
    INDEX IX_Vehicules_Promotion (EstPromotion),
    INDEX IX_Vehicules_Location (Latitude, Longitude)
);

-- Index spatial pour recherches géographiques ultra-rapides
CREATE SPATIAL INDEX SIDX_Vehicules_Coordonnees 
ON Vehicules(Coordonnees)
USING GEOGRAPHY_GRID
WITH (GRIDS = (LEVEL_1 = MEDIUM, LEVEL_2 = MEDIUM, LEVEL_3 = MEDIUM, LEVEL_4 = MEDIUM));

-- Table des photos de véhicules
CREATE TABLE PhotosVehicules (
    IdentifiantPhoto INT IDENTITY PRIMARY KEY,
    IdentifiantVehicule INT NOT NULL,
    URLPhoto NVARCHAR(500) NOT NULL,
    URLMiniature NVARCHAR(500),
    LegendePhoto NVARCHAR(255),
    OrdreAffichage INT DEFAULT 0,
    EstPhotoPrincipale BIT DEFAULT 0,
    TailleFichier BIGINT,
    FormatImage NVARCHAR(10),
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PhotosVehicules_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE,
    INDEX IX_PhotosVehicules_Vehicule (IdentifiantVehicule),
    INDEX IX_PhotosVehicules_Principale (EstPhotoPrincipale)
);

-- Table des caractéristiques techniques
CREATE TABLE CaracteristiquesTechniques (
    IdentifiantCaracteristique INT IDENTITY PRIMARY KEY,
    IdentifiantVehicule INT NOT NULL,
    Puissance INT,
    Couple INT,
    VitesseMaximale INT,
    Acceleration DECIMAL(4,2),
    CapaciteReservoir INT,
    PoidsVide INT,
    ChargeUtile INT,
    LongueurVehicule INT,
    LargeurVehicule INT,
    HauteurVehicule INT,
    EmpatementVehicule INT,
    NormeEmission NVARCHAR(50),
    TypeRoueMotrice NVARCHAR(50),
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_CaracteristiquesTechniques_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE
);

-- =============================================
-- SECTION 2B: GÉOLOCALISATION AVANCÉE (NOUVELLES TABLES)
-- =============================================

-- Table des zones géographiques optimisées
CREATE TABLE ZonesGeographiques (
    IdentifiantZone INT IDENTITY PRIMARY KEY,
    NomZone NVARCHAR(100) NOT NULL,
    TypeZone NVARCHAR(50) CHECK (TypeZone IN ('VILLE','QUARTIER','REGION','POINT_INTERET','AEROPORT','GARE')),
    ParentZone INT NULL,
    
    -- Géométrie optimisée
    GeoJSON NVARCHAR(MAX),
    Coordonnees GEOGRAPHY,
    CentroidLatitude DECIMAL(10,8),
    CentroidLongitude DECIMAL(11,8),
    RayonMetres INT,
    
    -- Métadonnées
    NombreVehicules INT DEFAULT 0,
    PrixMoyen DECIMAL(10,2),
    Popularite INT DEFAULT 0,
    
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateMiseAJour DATETIME2,
    
    CONSTRAINT FK_Zones_Parent
        FOREIGN KEY (ParentZone) REFERENCES ZonesGeographiques(IdentifiantZone),
    
    INDEX IDX_Zones_Type (TypeZone),
    INDEX IDX_Zones_Geospatial (CentroidLatitude, CentroidLongitude),
    INDEX IDX_Zones_Popularite (Popularite DESC)
);

-- Index spatial pour zones géographiques
CREATE SPATIAL INDEX SIDX_Zones_Coordonnees 
ON ZonesGeographiques(Coordonnees)
USING GEOGRAPHY_GRID
WITH (GRIDS = (LEVEL_1 = MEDIUM, LEVEL_2 = MEDIUM, LEVEL_3 = MEDIUM, LEVEL_4 = MEDIUM));

-- Table des distances pré-calculées pour performance
CREATE TABLE DistancesPrecalculees (
    IdentifiantOrigine INT NOT NULL,
    IdentifiantDestination INT NOT NULL,
    DistanceMetres INT NOT NULL,
    DureeMinutes INT NOT NULL,
    DateCalcul DATETIME2 DEFAULT SYSDATETIME(),
    
    PRIMARY KEY (IdentifiantOrigine, IdentifiantDestination),
    
    INDEX IDX_Distances_Origine (IdentifiantOrigine),
    INDEX IDX_Distances_Destination (IdentifiantDestination)
);

-- =============================================
-- SECTION 2C: TARIFICATION DYNAMIQUE (NOUVELLES TABLES)
-- =============================================

-- Table des règles de tarification dynamique
CREATE TABLE ReglesTarificationDynamique (
    IdentifiantRegle INT IDENTITY PRIMARY KEY,
    IdentifiantVehicule INT NOT NULL,
    
    -- Conditions d'application
    TypeCondition NVARCHAR(50) CHECK (TypeCondition IN (
        'SAISON','JOUR_SEMAINE','DEMANDE_ELEVEE','DERNIERE_MINUTE','DUREE_SEJOUR','EVENEMENT','METEO'
    )),
    ValeurCondition NVARCHAR(200),
    
    -- Modificateurs de prix
    TypeModificateur NVARCHAR(20) CHECK (TypeModificateur IN ('POURCENTAGE','MONTANT_FIXE','MULTIPLICATEUR')),
    ValeurModificateur DECIMAL(10,2) NOT NULL,
    Operation NVARCHAR(10) CHECK (Operation IN ('AJOUTER','SOUSTRAIRE','MULTIPLIER','REMPLACER')),
    
    -- Limites de prix
    PrixMinimum DECIMAL(10,2),
    PrixMaximum DECIMAL(10,2),
    
    -- Période d'application
    DateDebut DATETIME2 NOT NULL,
    DateFin DATETIME2,
    HeureDebut TIME,
    HeureFin TIME,
    JoursSemaine NVARCHAR(50), -- JSON: [1,2,3,4,5] pour Lun-Ven
    
    Priorite INT DEFAULT 0,
    Actif BIT DEFAULT 1,
    Description NVARCHAR(500),
    
    CONSTRAINT FK_RegleTarification_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE,
    
    INDEX IDX_ReglesTarification_Vehicule (IdentifiantVehicule),
    INDEX IDX_ReglesTarification_Dates (DateDebut, DateFin),
    INDEX IDX_ReglesTarification_Priorite (Priorite DESC),
    INDEX IDX_ReglesTarification_Actif (Actif)
);

-- Table de l'historique des prix pour analyse et machine learning
CREATE TABLE HistoriquePrixVehicules (
    IdentifiantHistorique BIGINT IDENTITY PRIMARY KEY,
    IdentifiantVehicule INT NOT NULL,
    
    PrixJournalier DECIMAL(10,2) NOT NULL,
    PrixHebdomadaire DECIMAL(10,2),
    PrixMensuel DECIMAL(10,2),
    
    FacteursInfluence NVARCHAR(MAX), -- JSON des facteurs affectant le prix
    TauxOccupation DECIMAL(5,2),
    DemandePrevue DECIMAL(5,2),
    SaisonTouristique NVARCHAR(50),
    EvenementsLocaux NVARCHAR(MAX), -- JSON
    
    DateApplication DATETIME2 DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_HistoriquePrix_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE,
    
    INDEX IDX_HistoriquePrix_Vehicule_Date (IdentifiantVehicule, DateApplication)
);

-- =============================================
-- SECTION 3: GESTION DES RÉSERVATIONS
-- =============================================

-- Table Reservations avec correction du NumeroReservation
CREATE TABLE Reservations (
    IdentifiantReservation INT IDENTITY PRIMARY KEY,
    NumeroReservation NVARCHAR(50) UNIQUE NOT NULL DEFAULT '', -- Généré par trigger
    IdentifiantVehicule INT NOT NULL,
    IdentifiantLocataire INT NOT NULL,
    IdentifiantProprietaire INT NOT NULL,
    DateDebut DATETIME2 NOT NULL,
    DateFin DATETIME2 NOT NULL,
    DateCreationReservation DATETIME2 DEFAULT SYSDATETIME(),
    HeureDebut TIME,
    HeureFin TIME,
    LieuPriseEnCharge NVARCHAR(500),
    LieuRestitution NVARCHAR(500),
    LivraisonDemandee BIT DEFAULT 0,
    AdresseLivraison NVARCHAR(500),
    FraisLivraison DECIMAL(10,2) DEFAULT 0,
    NombreJours AS (DATEDIFF(DAY, DateDebut, DateFin) + 1) PERSISTED,
    PrixJournalier DECIMAL(10,2) NOT NULL,
    MontantLocation DECIMAL(10,2) NOT NULL,
    MontantCaution DECIMAL(10,2) DEFAULT 0,
    FraisService DECIMAL(10,2) DEFAULT 0,
    FraisAssurance DECIMAL(10,2) DEFAULT 0,
    FraisSupplementaires DECIMAL(10,2) DEFAULT 0,
    DetailsSupplementaires NVARCHAR(MAX),
    Remise DECIMAL(10,2) DEFAULT 0,
    CodePromo NVARCHAR(50),
    MontantTotal DECIMAL(10,2) NOT NULL,
    StatutReservation NVARCHAR(30) DEFAULT 'EnAttente' CHECK (StatutReservation IN ('EnAttente', 'Confirmee', 'EnCours', 'Terminee', 'Annulee', 'RefuseeProprietaire', 'RefuseeLocataire')),
    StatutPaiement NVARCHAR(30) DEFAULT 'EnAttente' CHECK (StatutPaiement IN ('EnAttente', 'Paye', 'PartiellementPaye', 'Rembourse', 'Echoue')),
    MethodePaiement NVARCHAR(50),
    KilometrageDepart INT,
    KilometrageRetour INT,
    KilometrageParcouru AS (KilometrageRetour - KilometrageDepart),
    KilometrageInclus INT DEFAULT 200,
    FraisKilometrageSupplementaire DECIMAL(10,2) DEFAULT 0,
    MontantKilometrageSupplementaire AS (
        CASE 
            WHEN (KilometrageRetour - KilometrageDepart) > KilometrageInclus 
            THEN ((KilometrageRetour - KilometrageDepart) - KilometrageInclus) * FraisKilometrageSupplementaire 
            ELSE 0 
        END
    ),
    NiveauCarburantDepart NVARCHAR(20) CHECK (NiveauCarburantDepart IN ('Vide', '1/4', '1/2', '3/4', 'Plein')),
    NiveauCarburantRetour NVARCHAR(20) CHECK (NiveauCarburantRetour IN ('Vide', '1/4', '1/2', '3/4', 'Plein')),
    EtatVehiculeDepart NVARCHAR(MAX),
    EtatVehiculeRetour NVARCHAR(MAX),
    PhotosDepart NVARCHAR(MAX),
    PhotosRetour NVARCHAR(MAX),
    CommentairesLocataire NVARCHAR(1000),
    CommentairesProprietaire NVARCHAR(1000),
    MotifAnnulation NVARCHAR(500),
    DateAnnulation DATETIME2,
    AnnulePar INT,
    FraisAnnulation DECIMAL(10,2) DEFAULT 0,
    EstAssurance BIT DEFAULT 0,
    TypeAssurance NVARCHAR(100),
    MontantAssurance DECIMAL(10,2) DEFAULT 0,
    ConducteursSupplementaires NVARCHAR(MAX),
    NombreConducteurs INT DEFAULT 1,
    NotesSpeciales NVARCHAR(1000),
    DateConfirmation DATETIME2,
    DateDebutEffectif DATETIME2,
    DateFinEffective DATETIME2,
    RetardRetour INT DEFAULT 0,
    FraisRetard DECIMAL(10,2) DEFAULT 0,
    
    CONSTRAINT FK_Reservations_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule),
    CONSTRAINT FK_Reservations_Locataire
        FOREIGN KEY (IdentifiantLocataire) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Reservations_Proprietaire
        FOREIGN KEY (IdentifiantProprietaire) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Reservations_AnnulePar
        FOREIGN KEY (AnnulePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Reservations_Vehicule (IdentifiantVehicule),
    INDEX IX_Reservations_Locataire (IdentifiantLocataire),
    INDEX IX_Reservations_Proprietaire (IdentifiantProprietaire),
    INDEX IX_Reservations_Dates (DateDebut, DateFin),
    INDEX IX_Reservations_Statut (StatutReservation),
    INDEX IX_Reservations_Paiement (StatutPaiement),
    INDEX IX_Reservations_DateCreation (DateCreationReservation),
    CONSTRAINT CHK_Reservations_Dates CHECK (DateFin > DateDebut)
);
GO

-- Trigger pour générer le NumeroReservation de manière déterministe
CREATE TRIGGER TRG_GenerateNumeroReservation
ON Reservations
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE r
    SET NumeroReservation = 'RES-' + 
                           FORMAT(YEAR(i.DateCreationReservation), '0000') + '-' + 
                           RIGHT('00000' + CAST(i.IdentifiantReservation AS VARCHAR), 5)
    FROM Reservations r
    INNER JOIN inserted i ON r.IdentifiantReservation = i.IdentifiantReservation
    WHERE r.NumeroReservation = '';
END;
GO

-- Table des extensions de réservation
CREATE TABLE ExtensionsReservations (
    IdentifiantExtension INT IDENTITY PRIMARY KEY,
    IdentifiantReservation INT NOT NULL,
    NouvelleDateFin DATETIME2 NOT NULL,
    AncienneDateFin DATETIME2 NOT NULL,
    JoursSupplementaires AS (DATEDIFF(DAY, AncienneDateFin, NouvelleDateFin)),
    MontantSupplementaire DECIMAL(10,2) NOT NULL,
    StatutDemande NVARCHAR(20) DEFAULT 'EnAttente' CHECK (StatutDemande IN ('EnAttente', 'Acceptee', 'Refusee')),
    DateDemande DATETIME2 DEFAULT SYSDATETIME(),
    DateReponse DATETIME2,
    RaisonExtension NVARCHAR(500),
    RaisonRefus NVARCHAR(500),
    CONSTRAINT FK_ExtensionsReservations_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation) ON DELETE CASCADE,
    INDEX IX_ExtensionsReservations_Reservation (IdentifiantReservation),
    INDEX IX_ExtensionsReservations_Statut (StatutDemande)
);

-- =============================================
-- SECTION 4: GESTION DES PAIEMENTS
-- =============================================

-- Table des transactions
CREATE TABLE Transactions (
    IdentifiantTransaction INT IDENTITY PRIMARY KEY,
    NumeroTransaction NVARCHAR(100) UNIQUE NOT NULL,
    IdentifiantReservation INT,
    IdentifiantUtilisateur INT NOT NULL,
    TypeTransaction NVARCHAR(50) NOT NULL CHECK (TypeTransaction IN ('Paiement', 'Remboursement', 'Caution', 'LibérationCaution', 'Commission', 'Penalite', 'Bonus', 'Points')),
    Montant DECIMAL(10,2) NOT NULL,
    Devise NVARCHAR(3) DEFAULT 'XOF',
    MethodePaiement NVARCHAR(50) NOT NULL CHECK (MethodePaiement IN ('CarteBancaire', 'MobileMoney', 'Virement', 'Especes', 'PayPal', 'Stripe', 'Autre')),
    FournisseurPaiement NVARCHAR(100),
    ReferenceExterne NVARCHAR(255),
    StatutTransaction NVARCHAR(30) DEFAULT 'EnAttente' CHECK (StatutTransaction IN ('EnAttente', 'Reussie', 'Echouee', 'Annulee', 'EnCours', 'Remboursee')),
    DateTransaction DATETIME2 DEFAULT SYSDATETIME(),
    DateTraitement DATETIME2,
    FraisTransaction DECIMAL(10,2) DEFAULT 0,
    FraisCommission DECIMAL(10,2) DEFAULT 0,
    MontantNet DECIMAL(10,2),
    Description NVARCHAR(500),
    DetailsTransaction NVARCHAR(MAX),
    AdresseIPTransaction NVARCHAR(45),
    DeviceInfo NVARCHAR(500),
    CodeErreur NVARCHAR(50),
    MessageErreur NVARCHAR(500),
    NombreTentatives INT DEFAULT 1,
    EstRembourse BIT DEFAULT 0,
    DateRemboursement DATETIME2,
    IdentifiantTransactionRemboursement INT,
    CONSTRAINT FK_Transactions_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    CONSTRAINT FK_Transactions_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Transactions_Reservation (IdentifiantReservation),
    INDEX IX_Transactions_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_Transactions_Statut (StatutTransaction),
    INDEX IX_Transactions_Date (DateTransaction),
    INDEX IX_Transactions_Type (TypeTransaction)
);

-- Table des méthodes de paiement utilisateurs
CREATE TABLE MethodesPaiementUtilisateurs (
    IdentifiantMethode INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    TypeMethode NVARCHAR(50) NOT NULL CHECK (TypeMethode IN ('CarteBancaire', 'MobileMoney', 'CompteBancaire', 'PayPal')),
    EstMethodePrincipale BIT DEFAULT 0,
    Actif BIT DEFAULT 1,
    Alias NVARCHAR(100),
    DerniersChiffres NVARCHAR(10),
    Fournisseur NVARCHAR(100),
    DateExpiration DATE,
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    DateDerniereUtilisation DATETIME2,
    CONSTRAINT FK_MethodesPaiement_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    INDEX IX_MethodesPaiement_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_MethodesPaiement_Principal (EstMethodePrincipale)
);

-- Table des factures
CREATE TABLE Factures (
    IdentifiantFacture INT IDENTITY PRIMARY KEY,
    NumeroFacture NVARCHAR(50) UNIQUE NOT NULL,
    IdentifiantReservation INT NOT NULL,
    IdentifiantUtilisateur INT NOT NULL,
    DateEmission DATETIME2 DEFAULT SYSDATETIME(),
    DateEcheance DATETIME2,
    MontantHT DECIMAL(10,2) NOT NULL,
    TauxTVA DECIMAL(5,2) DEFAULT 0,
    MontantTVA AS (MontantHT * TauxTVA / 100) PERSISTED,
    MontantTTC AS (MontantHT * (1 + TauxTVA / 100)) PERSISTED,
    StatutFacture NVARCHAR(20) DEFAULT 'Emise' CHECK (StatutFacture IN ('Emise', 'Payee', 'Annulee', 'Remboursee')),
    CheminPDF NVARCHAR(500),
    DatePaiement DATETIME2,
    NotesFacture NVARCHAR(1000),
    CONSTRAINT FK_Factures_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    CONSTRAINT FK_Factures_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Factures_Reservation (IdentifiantReservation),
    INDEX IX_Factures_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_Factures_Statut (StatutFacture),
    INDEX IX_Factures_DateEmission (DateEmission)
);

-- Table des promotions et codes promo
CREATE TABLE CodesPromo (
    IdentifiantPromo INT IDENTITY PRIMARY KEY,
    CodePromo NVARCHAR(50) UNIQUE NOT NULL,
    TypePromo NVARCHAR(20) CHECK (TypePromo IN ('Pourcentage', 'Montant', 'NuitsGratuites')),
    ValeurPromo DECIMAL(10,2) NOT NULL,
    MontantMinimum DECIMAL(10,2),
    NombreUtilisationsMax INT,
    NombreUtilisationsActuel INT DEFAULT 0,
    UtilisationsParUtilisateur INT DEFAULT 1,
    DateDebut DATETIME2 NOT NULL,
    DateFin DATETIME2 NOT NULL,
    Actif BIT DEFAULT 1,
    CategoriesApplicables NVARCHAR(MAX), -- JSON array d'IdentifiantCategorie
    VehiculesApplicables NVARCHAR(MAX), -- JSON array d'IdentifiantVehicule
    UtilisateursApplicables NVARCHAR(MAX), -- JSON array d'IdentifiantUtilisateur
    Description NVARCHAR(500),
    CreePar INT,
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_CodesPromo_Createur
        FOREIGN KEY (CreePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_CodesPromo_Code (CodePromo),
    INDEX IX_CodesPromo_Dates (DateDebut, DateFin),
    INDEX IX_CodesPromo_Actif (Actif)
);

-- Table des utilisations de codes promo
CREATE TABLE UtilisationsCodesPromo (
    IdentifiantUtilisation INT IDENTITY PRIMARY KEY,
    IdentifiantPromo INT NOT NULL,
    IdentifiantUtilisateur INT NOT NULL,
    IdentifiantReservation INT NOT NULL,
    MontantRemise DECIMAL(10,2) NOT NULL,
    DateUtilisation DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_UtilisationsPromo_Promo
        FOREIGN KEY (IdentifiantPromo) REFERENCES CodesPromo(IdentifiantPromo),
    CONSTRAINT FK_UtilisationsPromo_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_UtilisationsPromo_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    INDEX IX_UtilisationsPromo_Promo (IdentifiantPromo),
    INDEX IX_UtilisationsPromo_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_UtilisationsPromo_Reservation (IdentifiantReservation)
);

-- =============================================
-- SECTION 5: PROGRAMME DE FIDÉLITÉ ET PARRAINAGE
-- =============================================

-- Table du programme de fidélité
CREATE TABLE ProgrammeFidelite (
    IdentifiantProgramme INT IDENTITY PRIMARY KEY,
    NomProgramme NVARCHAR(100) NOT NULL,
    Niveau NVARCHAR(50) CHECK (Niveau IN ('BRONZE','ARGENT','OR','PLATINE','DIAMANT')),
    
    SeuilPoints INT NOT NULL,
    
    -- Avantages
    PourcentageRemise DECIMAL(5,2) DEFAULT 0,
    PrioriteSuppor BIT DEFAULT 0,
    AnnulationGratuite BIT DEFAULT 0,
    AccesExclusif BIT DEFAULT 0,
    SurclassementGratuit BIT DEFAULT 0,
    
    Avantages NVARCHAR(MAX), -- JSON complet des avantages
    CouleurBadge NVARCHAR(20),
    IconeBadge NVARCHAR(255),
    Actif BIT DEFAULT 1,
    
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    
    INDEX IDX_ProgrammeFidelite_Niveau (Niveau),
    INDEX IDX_ProgrammeFidelite_Seuil (SeuilPoints)
);

-- Table des points de fidélité
CREATE TABLE PointsFidelite (
    IdentifiantPoint INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    
    TypeAcquisition NVARCHAR(50) CHECK (TypeAcquisition IN (
        'RESERVATION','PARRAINAGE','AVIS','COMPLETION_PROFIL','ANNIVERSAIRE',
        'PREMIERE_LOCATION','VERIFICATION_DOCUMENTS','PARTAGE_SOCIAL','EVENEMENT'
    )),
    
    PointsAcquis INT NOT NULL,
    PointsUtilises INT DEFAULT 0,
    SoldePoints AS (PointsAcquis - PointsUtilises) PERSISTED,
    
    DateAcquisition DATETIME2 DEFAULT SYSDATETIME(),
    DateExpiration DATETIME2,
    
    IdentifiantSource INT, -- ID de la réservation, parrainage, etc.
    TypeSource NVARCHAR(50),
    Description NVARCHAR(500),
    
    EstExpire AS (CASE WHEN DateExpiration < SYSDATETIME() THEN 1 ELSE 0 END),
    
    CONSTRAINT FK_PointsFidelite_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    
    INDEX IDX_Points_Utilisateur (IdentifiantUtilisateur),
    INDEX IDX_Points_Date (DateAcquisition),
    INDEX IDX_Points_Expiration (DateExpiration),
    INDEX IDX_Points_Type (TypeAcquisition)
);

-- Table du programme de parrainage
CREATE TABLE ProgrammeParrainage (
    IdentifiantParrainage INT IDENTITY PRIMARY KEY,
    IdentifiantParrain INT NOT NULL,
    IdentifiantFilleul INT,
    
    CodeParrainage NVARCHAR(50) UNIQUE NOT NULL,
    EmailFilleul NVARCHAR(255),
    DateInvitation DATETIME2 DEFAULT SYSDATETIME(),
    DateInscription DATETIME2,
    
    -- Récompenses
    PointsParrain INT DEFAULT 0,
    PointsFilleul INT DEFAULT 0,
    RemiseParrain DECIMAL(10,2) DEFAULT 0,
    RemiseFilleul DECIMAL(10,2) DEFAULT 0,
    CommissionParrain DECIMAL(5,2),
    
    StatutParrainage NVARCHAR(20) DEFAULT 'EnAttente' CHECK (StatutParrainage IN ('EnAttente','Inscrit','PremierAchat','Complet')),
    PremierAchatEffectue BIT DEFAULT 0,
    DatePremierAchat DATETIME2,
    MontantPremierAchat DECIMAL(10,2),
    
    RecompensesAttribuees BIT DEFAULT 0,
    DateAttributionRecompenses DATETIME2,
    
    CONSTRAINT FK_Parrainage_Parrain
        FOREIGN KEY (IdentifiantParrain) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    
    CONSTRAINT FK_Parrainage_Filleul
        FOREIGN KEY (IdentifiantFilleul) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    
    CONSTRAINT UQ_Parrain_Filleul UNIQUE (IdentifiantParrain, IdentifiantFilleul),
    
    INDEX IDX_Parrainage_Parrain (IdentifiantParrain),
    INDEX IDX_Parrainage_Filleul (IdentifiantFilleul),
    INDEX IDX_Parrainage_Code (CodeParrainage),
    INDEX IDX_Parrainage_Statut (StatutParrainage)
);

-- =============================================
-- SECTION 6: COMMUNICATION ET MESSAGERIE
-- =============================================

-- Table des conversations
CREATE TABLE Conversations (
    IdentifiantConversation INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur1 INT NOT NULL,
    IdentifiantUtilisateur2 INT NOT NULL,
    IdentifiantReservation INT,
    IdentifiantVehicule INT,
    SujetConversation NVARCHAR(255),
    StatutConversation NVARCHAR(20) DEFAULT 'Active' CHECK (StatutConversation IN ('Active', 'Archivee', 'Fermee')),
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateDernierMessage DATETIME2,
    NombreMessages INT DEFAULT 0,
    CONSTRAINT FK_Conversations_Utilisateur1
        FOREIGN KEY (IdentifiantUtilisateur1) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Conversations_Utilisateur2
        FOREIGN KEY (IdentifiantUtilisateur2) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Conversations_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    CONSTRAINT FK_Conversations_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule),
    INDEX IX_Conversations_Utilisateur1 (IdentifiantUtilisateur1),
    INDEX IX_Conversations_Utilisateur2 (IdentifiantUtilisateur2),
    INDEX IX_Conversations_Reservation (IdentifiantReservation),
    INDEX IX_Conversations_Statut (StatutConversation)
);

-- Table des messages
CREATE TABLE Messages (
    IdentifiantMessage INT IDENTITY PRIMARY KEY,
    IdentifiantConversation INT NOT NULL,
    IdentifiantExpediteur INT NOT NULL,
    IdentifiantDestinataire INT NOT NULL,
    ContenuMessage NVARCHAR(MAX) NOT NULL,
    TypeMessage NVARCHAR(20) DEFAULT 'Texte' CHECK (TypeMessage IN ('Texte', 'Image', 'Document', 'Audio', 'Systeme')),
    PiecesJointes NVARCHAR(MAX), -- JSON array
    DateEnvoi DATETIME2 DEFAULT SYSDATETIME(),
    DateLecture DATETIME2,
    EstLu BIT DEFAULT 0,
    EstArchive BIT DEFAULT 0,
    EstSupprime BIT DEFAULT 0,
    CONSTRAINT FK_Messages_Conversation
        FOREIGN KEY (IdentifiantConversation) REFERENCES Conversations(IdentifiantConversation) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Expediteur
        FOREIGN KEY (IdentifiantExpediteur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Messages_Destinataire
        FOREIGN KEY (IdentifiantDestinataire) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Messages_Conversation (IdentifiantConversation),
    INDEX IX_Messages_Expediteur (IdentifiantExpediteur),
    INDEX IX_Messages_Destinataire (IdentifiantDestinataire),
    INDEX IX_Messages_DateEnvoi (DateEnvoi),
    INDEX IX_Messages_EstLu (EstLu)
);

-- Table des templates de notifications
CREATE TABLE TemplatesNotifications (
    IdentifiantTemplate INT IDENTITY PRIMARY KEY,
    TypeNotification NVARCHAR(100) NOT NULL UNIQUE,
    NomTemplate NVARCHAR(200) NOT NULL,
    
    TitreTemplate NVARCHAR(255) NOT NULL,
    CorpsTemplate NVARCHAR(MAX) NOT NULL,
    CorpsHTML NVARCHAR(MAX),
    CorpsSMS NVARCHAR(500),
    
    VariablesDisponibles NVARCHAR(MAX), -- JSON: {user_name, vehicle_name, date, etc.}
    CanauxDisponibles NVARCHAR(MAX), -- JSON: ["email", "sms", "push", "in_app"]
    
    Categorie NVARCHAR(50), -- Reservation, Paiement, Marketing, etc.
    Langue NVARCHAR(10) DEFAULT 'fr',
    
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateModification DATETIME2,
    Actif BIT DEFAULT 1,
    
    INDEX IDX_Templates_Type (TypeNotification),
    INDEX IDX_Templates_Categorie (Categorie),
    INDEX IDX_Templates_Actif (Actif)
);

-- Table des déclencheurs de notifications automatiques
CREATE TABLE DeclencheursNotifications (
    IdentifiantDeclencheur INT IDENTITY PRIMARY KEY,
    TypeDeclencheur NVARCHAR(100) NOT NULL,
    NomDeclencheur NVARCHAR(200) NOT NULL,
    
    IdentifiantTemplate INT NOT NULL,
    DelaiMinutes INT DEFAULT 0, -- 0 = immédiat, -X = avant événement, +X = après événement
    
    Conditions NVARCHAR(MAX), -- JSON des conditions supplémentaires
    Actif BIT DEFAULT 1,
    Priorite INT DEFAULT 5,
    
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_Declencheur_Template
        FOREIGN KEY (IdentifiantTemplate) REFERENCES TemplatesNotifications(IdentifiantTemplate),
    
    INDEX IDX_Declencheurs_Type (TypeDeclencheur),
    INDEX IDX_Declencheurs_Actif (Actif),
    INDEX IDX_Declencheurs_Priorite (Priorite DESC)
);

-- Table des notifications
CREATE TABLE Notifications (
    IdentifiantNotification INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    TypeNotification NVARCHAR(50) NOT NULL,
    TitreNotification NVARCHAR(255) NOT NULL,
    MessageNotification NVARCHAR(MAX) NOT NULL,
    LienNotification NVARCHAR(500),
    IconeNotification NVARCHAR(50),
    PrioriteNotification NVARCHAR(20) DEFAULT 'Normal' CHECK (PrioriteNotification IN ('Faible', 'Normal', 'Elevee', 'Urgente')),
    CanalEnvoi NVARCHAR(20) CHECK (CanalEnvoi IN ('Application', 'Email', 'SMS', 'Push')),
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateEnvoi DATETIME2,
    DateLecture DATETIME2,
    EstLu BIT DEFAULT 0,
    EstArchive BIT DEFAULT 0,
    MetaDonnees NVARCHAR(MAX), -- JSON: {reservation_id, vehicle_id, etc.}
    CONSTRAINT FK_Notifications_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    INDEX IX_Notifications_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_Notifications_Type (TypeNotification),
    INDEX IX_Notifications_EstLu (EstLu),
    INDEX IX_Notifications_DateCreation (DateCreation),
    INDEX IX_Notifications_Priorite (PrioriteNotification)
);

-- =============================================
-- SECTION 7: AVIS ET ÉVALUATIONS
-- =============================================

-- Table des avis
CREATE TABLE Avis (
    IdentifiantAvis INT IDENTITY PRIMARY KEY,
    IdentifiantReservation INT NOT NULL UNIQUE,
    IdentifiantAuteur INT NOT NULL,
    IdentifiantCible INT NOT NULL, -- Utilisateur ou Véhicule
    TypeCible NVARCHAR(20) NOT NULL CHECK (TypeCible IN ('Vehicule', 'Locataire', 'Proprietaire')),
    NoteGlobale DECIMAL(3,2) NOT NULL CHECK (NoteGlobale BETWEEN 1 AND 5),
    NoteProprete DECIMAL(3,2) CHECK (NoteProprete BETWEEN 1 AND 5),
    NoteConformite DECIMAL(3,2) CHECK (NoteConformite BETWEEN 1 AND 5),
    NoteCommunication DECIMAL(3,2) CHECK (NoteCommunication BETWEEN 1 AND 5),
    NoteEtatVehicule DECIMAL(3,2) CHECK (NoteEtatVehicule BETWEEN 1 AND 5),
    NoteRapportQualitePrix DECIMAL(3,2) CHECK (NoteRapportQualitePrix BETWEEN 1 AND 5),
    CommentaireAvis NVARCHAR(2000),
    PhotosAvis NVARCHAR(MAX), -- JSON array d'URLs
    RecommandeCible BIT DEFAULT 1,
    StatutAvis NVARCHAR(20) DEFAULT 'Publie' CHECK (StatutAvis IN ('EnAttente', 'Publie', 'Modere', 'Supprime')),
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateModification DATETIME2,
    NombreSignalements INT DEFAULT 0,
    NombreUtile INT DEFAULT 0,
    NombreInutile INT DEFAULT 0,
    ReponseProprietaire NVARCHAR(1000),
    DateReponse DATETIME2,
    CONSTRAINT FK_Avis_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    CONSTRAINT FK_Avis_Auteur
        FOREIGN KEY (IdentifiantAuteur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Avis_Reservation (IdentifiantReservation),
    INDEX IX_Avis_Auteur (IdentifiantAuteur),
    INDEX IX_Avis_Cible (IdentifiantCible, TypeCible),
    INDEX IX_Avis_Statut (StatutAvis),
    INDEX IX_Avis_DateCreation (DateCreation),
    INDEX IX_Avis_Note (NoteGlobale DESC)
);

-- Table des signalements d'avis
CREATE TABLE SignalementsAvis (
    IdentifiantSignalement INT IDENTITY PRIMARY KEY,
    IdentifiantAvis INT NOT NULL,
    IdentifiantSignaleur INT NOT NULL,
    MotifSignalement NVARCHAR(50) NOT NULL CHECK (MotifSignalement IN ('ContenuOffensant', 'FausseInformation', 'Spam', 'HorsSujet', 'Autre')),
    DescriptionSignalement NVARCHAR(1000),
    DateSignalement DATETIME2 DEFAULT SYSDATETIME(),
    StatutTraitement NVARCHAR(20) DEFAULT 'EnAttente' CHECK (StatutTraitement IN ('EnAttente', 'EnCours', 'Rejete', 'Accepte')),
    DateTraitement DATETIME2,
    TraitePar INT,
    CommentairesTraitement NVARCHAR(500),
    CONSTRAINT FK_SignalementsAvis_Avis
        FOREIGN KEY (IdentifiantAvis) REFERENCES Avis(IdentifiantAvis),
    CONSTRAINT FK_SignalementsAvis_Signaleur
        FOREIGN KEY (IdentifiantSignaleur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_SignalementsAvis_Traiteur
        FOREIGN KEY (TraitePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_SignalementsAvis_Avis (IdentifiantAvis),
    INDEX IX_SignalementsAvis_Signaleur (IdentifiantSignaleur),
    INDEX IX_SignalementsAvis_Statut (StatutTraitement)
);

-- =============================================
-- SECTION 8: RÉCLAMATIONS ET INCIDENTS
-- =============================================

-- Table des réclamations
CREATE TABLE Reclamations (
    IdentifiantReclamation INT IDENTITY PRIMARY KEY,
    NumeroReclamation NVARCHAR(50) UNIQUE NOT NULL,
    IdentifiantReservation INT,
    IdentifiantReclamant INT NOT NULL,
    TypeReclamation NVARCHAR(50) NOT NULL CHECK (TypeReclamation IN ('Dommage', 'Retard', 'Proprete', 'Panne', 'Facturation', 'Service', 'Autre')),
    CategorieReclamation NVARCHAR(50) CHECK (CategorieReclamation IN ('Technique', 'Commercial', 'Comportement', 'Qualite')),
    SujetReclamation NVARCHAR(255) NOT NULL,
    DescriptionReclamation NVARCHAR(MAX) NOT NULL,
    PieceJointes NVARCHAR(MAX), -- JSON array
    MontantReclame DECIMAL(10,2),
    StatutReclamation NVARCHAR(30) DEFAULT 'Ouverte' CHECK (StatutReclamation IN ('Ouverte', 'EnCours', 'Resolue', 'Fermee', 'Rejetee')),
    PrioriteReclamation NVARCHAR(20) DEFAULT 'Normal' CHECK (PrioriteReclamation IN ('Faible', 'Normal', 'Elevee', 'Urgente')),
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateResolution DATETIME2,
    DateFermeture DATETIME2,
    AssigneA INT,
    ReponseReclamation NVARCHAR(MAX),
    ActionsPrises NVARCHAR(MAX), -- JSON array
    MontantRembourse DECIMAL(10,2),
    SatisfactionClient DECIMAL(3,2),
    CONSTRAINT FK_Reclamations_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    CONSTRAINT FK_Reclamations_Reclamant
        FOREIGN KEY (IdentifiantReclamant) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_Reclamations_Assignation
        FOREIGN KEY (AssigneA) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Reclamations_Reservation (IdentifiantReservation),
    INDEX IX_Reclamations_Reclamant (IdentifiantReclamant),
    INDEX IX_Reclamations_Statut (StatutReclamation),
    INDEX IX_Reclamations_Type (TypeReclamation),
    INDEX IX_Reclamations_Priorite (PrioriteReclamation),
    INDEX IX_Reclamations_DateCreation (DateCreation)
);

-- Table des incidents
CREATE TABLE Incidents (
    IdentifiantIncident INT IDENTITY PRIMARY KEY,
    NumeroIncident NVARCHAR(50) UNIQUE NOT NULL,
    IdentifiantReservation INT NOT NULL,
    IdentifiantVehicule INT NOT NULL,
    TypeIncident NVARCHAR(50) NOT NULL CHECK (TypeIncident IN ('Accident', 'Panne', 'Vol', 'Vandalisme', 'Contravention', 'Autre')),
    GraviteIncident NVARCHAR(20) NOT NULL CHECK (GraviteIncident IN ('Mineure', 'Moderee', 'Grave', 'Critique')),
    DescriptionIncident NVARCHAR(MAX) NOT NULL,
    DateIncident DATETIME2 NOT NULL,
    LieuIncident NVARCHAR(500),
    CoordonneesIncident GEOGRAPHY,
    PhotosIncident NVARCHAR(MAX), -- JSON array
    RapportPolice NVARCHAR(500), -- chemin du document
    NumeroConstat NVARCHAR(100),
    TierImplique BIT DEFAULT 0,
    InfoTiers NVARCHAR(MAX), -- JSON
    AssuranceNotifiee BIT DEFAULT 0,
    DateNotificationAssurance DATETIME2,
    NumeroSinistre NVARCHAR(100),
    EstimationDommages DECIMAL(10,2),
    CoutReparations DECIMAL(10,2),
    ResponsabiliteLocataire BIT,
    StatutTraitement NVARCHAR(30) DEFAULT 'Declare' CHECK (StatutTraitement IN ('Declare', 'EnCours', 'EnReparation', 'Resolu', 'Clos')),
    DateDeclaration DATETIME2 DEFAULT SYSDATETIME(),
    DateResolution DATETIME2,
    TraitePar INT,
    NotesTraitement NVARCHAR(MAX),
    CONSTRAINT FK_Incidents_Reservation
        FOREIGN KEY (IdentifiantReservation) REFERENCES Reservations(IdentifiantReservation),
    CONSTRAINT FK_Incidents_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule),
    CONSTRAINT FK_Incidents_Traiteur
        FOREIGN KEY (TraitePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_Incidents_Reservation (IdentifiantReservation),
    INDEX IX_Incidents_Vehicule (IdentifiantVehicule),
    INDEX IX_Incidents_Type (TypeIncident),
    INDEX IX_Incidents_Statut (StatutTraitement),
    INDEX IX_Incidents_DateIncident (DateIncident)
);

-- =============================================
-- SECTION 9: FAVORIS ET RECHERCHES SAUVEGARDÉES
-- =============================================

-- Table des favoris
CREATE TABLE Favoris (
    IdentifiantFavori INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    IdentifiantVehicule INT NOT NULL,
    DateAjout DATETIME2 DEFAULT SYSDATETIME(),
    NotesPersonnelles NVARCHAR(500),
    CONSTRAINT FK_Favoris_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    CONSTRAINT FK_Favoris_Vehicule
        FOREIGN KEY (IdentifiantVehicule) REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE,
    CONSTRAINT UQ_Favoris_Utilisateur_Vehicule UNIQUE (IdentifiantUtilisateur, IdentifiantVehicule),
    INDEX IX_Favoris_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_Favoris_Vehicule (IdentifiantVehicule),
    INDEX IX_Favoris_DateAjout (DateAjout)
);

-- Table des recherches sauvegardées
CREATE TABLE RecherchesSauvegardees (
    IdentifiantRecherche INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL,
    NomRecherche NVARCHAR(200) NOT NULL,
    CriteresRecherche NVARCHAR(MAX) NOT NULL, -- JSON des critères
    NotificationsActives BIT DEFAULT 1,
    FrequenceNotifications NVARCHAR(20) CHECK (FrequenceNotifications IN ('Immediate', 'Quotidien', 'Hebdomadaire', 'Mensuel')),
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateDerniereUtilisation DATETIME2,
    NombreUtilisations INT DEFAULT 0,
    CONSTRAINT FK_RecherchesSauvegardees_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    INDEX IX_RecherchesSauvegardees_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_RecherchesSauvegardees_DateCreation (DateCreation)
);

-- =============================================
-- SECTION 10: CACHE ET OPTIMISATION PERFORMANCE
-- =============================================

-- Table de cache des recherches
CREATE TABLE CacheRecherches (
    IdentifiantCache INT IDENTITY PRIMARY KEY,
    CleCache NVARCHAR(500) NOT NULL UNIQUE,
    
    Resultats NVARCHAR(MAX) NOT NULL, -- JSON des résultats
    NombreResultats INT NOT NULL,
    
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    DateExpiration DATETIME2 NOT NULL,
    CompteUtilisations INT DEFAULT 0,
    DerniereUtilisation DATETIME2,
    
    ParametresRecherche NVARCHAR(MAX),
    
    INDEX IDX_Cache_Expiration (DateExpiration),
    INDEX IDX_Cache_Utilisations (CompteUtilisations DESC),
    INDEX IDX_Cache_DerniereUtilisation (DerniereUtilisation DESC)
);

-- Table des statistiques du cache
CREATE TABLE CacheStatistiques (
    IdentifiantStatCache INT IDENTITY PRIMARY KEY,
    TypeCache NVARCHAR(50) NOT NULL,
    Periode NVARCHAR(20) CHECK (Periode IN ('HEURE','JOUR','SEMAINE','MOIS')),
    
    RequetesTotal INT DEFAULT 0,
    RequetesCache INT DEFAULT 0,
    RequetesMiss INT DEFAULT 0,
    TauxReussite AS (CAST(RequetesCache AS FLOAT) / NULLIF(RequetesTotal, 0) * 100),
    
    TempsMoyenSansCache DECIMAL(10,4),
    TempsMoyenAvecCache DECIMAL(10,4),
    GainPerformance AS (
        CASE 
            WHEN TempsMoyenAvecCache > 0 
            THEN ((TempsMoyenSansCache - TempsMoyenAvecCache) / TempsMoyenAvecCache * 100)
            ELSE 0 
        END
    ),
    
    DateDebut DATETIME2 NOT NULL,
    DateFin DATETIME2 NOT NULL,
    DateCalcul DATETIME2 DEFAULT SYSDATETIME(),
    
    INDEX IDX_StatCache_Date (DateCalcul),
    INDEX IDX_StatCache_Type (TypeCache)
);

-- Table des agrégations utilisateurs pour performance
CREATE TABLE AggregationsUtilisateurs (
    IdentifiantAggregation INT IDENTITY PRIMARY KEY,
    IdentifiantUtilisateur INT NOT NULL UNIQUE,
    
    -- Statistiques de réservation
    NombreReservationsTotal INT DEFAULT 0,
    NombreReservationsConfirmees INT DEFAULT 0,
    NombreReservationsAnnulees INT DEFAULT 0,
    TauxAnnulation AS (
        CASE 
            WHEN NombreReservationsTotal > 0 
            THEN CAST(NombreReservationsAnnulees AS FLOAT) / NombreReservationsTotal * 100
            ELSE 0 
        END
    ),
    
    DureeTotalLocations INT DEFAULT 0,
    MontantTotalDepense DECIMAL(15,2) DEFAULT 0,
    MontantMoyenReservation AS (
        CASE 
            WHEN NombreReservationsTotal > 0 
            THEN MontantTotalDepense / NombreReservationsTotal
            ELSE 0 
        END
    ),
    
    -- Notes et réputation
    NoteMoyenneDonnee DECIMAL(3,2),
    NoteMoyenneRecue DECIMAL(3,2),
    NombreAvisDonnes INT DEFAULT 0,
    NombreAvisRecus INT DEFAULT 0,
    
    -- Dernières activités
    DerniereReservationDate DATETIME2,
    DerniereConnexionDate DATETIME2,
    DernierPaiementDate DATETIME2,
    
    -- Préférences fréquentes (Machine Learning)
    CategoriePreferee INT,
    VillePreferee NVARCHAR(100),
    MarquePreferee INT,
    BudgetMoyen DECIMAL(10,2),
    DureeMoyenneLocation INT, -- en jours
    
    -- Comportement utilisateur
    TauxReponse DECIMAL(5,2), -- % de messages répondus
    DelaiMoyenReponse INT, -- en minutes
    TauxConfirmation DECIMAL(5,2), -- % de réservations confirmées
    
    DateCalcul DATETIME2 DEFAULT SYSDATETIME(),
    DateMiseAJour DATETIME2,
    
    CONSTRAINT FK_Aggregation_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur) ON DELETE CASCADE,
    
    INDEX IDX_Aggregations_Calcul (DateCalcul),
    INDEX IDX_Aggregations_MiseAJour (DateMiseAJour)
);

-- =============================================
-- SECTION 11: BUSINESS INTELLIGENCE ET ANALYTICS
-- =============================================

-- Table des règles métier configurables
CREATE TABLE ConfigurationBusinessRules (
    IdentifiantRegle INT IDENTITY PRIMARY KEY,
    CodeRegle NVARCHAR(100) UNIQUE NOT NULL,
    TypeRegle NVARCHAR(100) NOT NULL,
    NomRegle NVARCHAR(200) NOT NULL,
    DescriptionRegle NVARCHAR(1000),
    
    Conditions NVARCHAR(MAX) NOT NULL, -- JSON des conditions
    Actions NVARCHAR(MAX) NOT NULL, -- JSON des actions à exécuter
    
    Priorite INT DEFAULT 0,
    Actif BIT DEFAULT 1,
    DateDebut DATETIME2 DEFAULT SYSDATETIME(),
    DateFin DATETIME2,
    
    CreePar INT,
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    ModifiePar INT,
    DateModification DATETIME2,
    
    NombreExecutions INT DEFAULT 0,
    DateDerniereExecution DATETIME2,
    
    CONSTRAINT FK_BusinessRules_Createur
        FOREIGN KEY (CreePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    CONSTRAINT FK_BusinessRules_Modificateur
        FOREIGN KEY (ModifiePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    
    INDEX IDX_BusinessRules_Type (TypeRegle),
    INDEX IDX_BusinessRules_Code (CodeRegle),
    INDEX IDX_BusinessRules_Actif (Actif),
    INDEX IDX_BusinessRules_Priorite (Priorite DESC)
);

-- Table des tests A/B
CREATE TABLE A_B_Tests (
    IdentifiantTest INT IDENTITY PRIMARY KEY,
    CodeTest NVARCHAR(100) UNIQUE NOT NULL,
    NomTest NVARCHAR(100) NOT NULL,
    DescriptionTest NVARCHAR(1000),
    
    ObjectifTest NVARCHAR(500),
    HypotheseTest NVARCHAR(1000),
    MetriquePrincipale NVARCHAR(100), -- Ex: "taux_conversion", "revenue_moyen"
    
    PopulationCible NVARCHAR(MAX), -- JSON des critères
    TailleEchantillon INT,
    PourcentageVarianteA INT DEFAULT 50,
    PourcentageVarianteB INT DEFAULT 50,
    
    VarianteA NVARCHAR(MAX), -- JSON de la configuration variante A (contrôle)
    VarianteB NVARCHAR(MAX), -- JSON de la configuration variante B (test)
    
    DateDebut DATETIME2,
    DateFin DATETIME2,
    DureeMinimaleJours INT DEFAULT 7,
    StatutTest NVARCHAR(20) DEFAULT 'Brouillon' CHECK (StatutTest IN ('Brouillon','EnCours','Termine','Annule')),
    
    -- Résultats
    ParticipantsVarianteA INT DEFAULT 0,
    ParticipantsVarianteB INT DEFAULT 0,
    ConversionsVarianteA INT DEFAULT 0,
    ConversionsVarianteB INT DEFAULT 0,
    TauxConversionA AS (
        CASE 
            WHEN ParticipantsVarianteA > 0 
            THEN CAST(ConversionsVarianteA AS FLOAT) / ParticipantsVarianteA * 100
            ELSE 0 
        END
    ),
    TauxConversionB AS (
        CASE 
            WHEN ParticipantsVarianteB > 0 
            THEN CAST(ConversionsVarianteB AS FLOAT) / ParticipantsVarianteB * 100
            ELSE 0 
        END
    ),
    
    SignificanceStatistique DECIMAL(5,4), -- P-value
    VarianteGagnante NVARCHAR(1) CHECK (VarianteGagnante IN ('A','B',NULL)),
    Resultats NVARCHAR(MAX), -- JSON complet des résultats et analyses
    
    CreePar INT,
    DateCreation DATETIME2 DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_ABTests_Createur
        FOREIGN KEY (CreePar) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    
    INDEX IDX_ABTests_Code (CodeTest),
    INDEX IDX_ABTests_Dates (DateDebut, DateFin),
    INDEX IDX_ABTests_Statut (StatutTest)
);

-- =============================================
-- SECTION 12: AUDIT ET JOURNALISATION
-- =============================================

-- Table du journal d'audit
CREATE TABLE JournalAudit (
    IdentifiantAudit BIGINT IDENTITY PRIMARY KEY,
    TypeAction NVARCHAR(50) NOT NULL,
    TableCible NVARCHAR(100) NOT NULL,
    IdentifiantLigne INT NOT NULL,
    IdentifiantUtilisateur INT,
    ActionEffectuee NVARCHAR(20) CHECK (ActionEffectuee IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    ValeursPrecedentes NVARCHAR(MAX), -- JSON
    NouvellesValeurs NVARCHAR(MAX), -- JSON
    AdresseIP NVARCHAR(45),
    UserAgent NVARCHAR(500),
    DateAction DATETIME2 DEFAULT SYSDATETIME(),
    DetailsSupplementaires NVARCHAR(MAX), -- JSON
    CONSTRAINT FK_JournalAudit_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_JournalAudit_Table (TableCible),
    INDEX IX_JournalAudit_Utilisateur (IdentifiantUtilisateur),
    INDEX IX_JournalAudit_DateAction (DateAction),
    INDEX IX_JournalAudit_TypeAction (TypeAction)
);

-- Table des logs d'erreurs système
CREATE TABLE LogsErreurs (
    IdentifiantLog BIGINT IDENTITY PRIMARY KEY,
    TypeErreur NVARCHAR(50) NOT NULL,
    MessageErreur NVARCHAR(MAX) NOT NULL,
    StackTrace NVARCHAR(MAX),
    Gravite NVARCHAR(20) CHECK (Gravite IN ('Info', 'Warning', 'Error', 'Critical')),
    IdentifiantUtilisateur INT,
    URL NVARCHAR(500),
    MethodeHTTP NVARCHAR(10),
    AdresseIP NVARCHAR(45),
    UserAgent NVARCHAR(500),
    DateErreur DATETIME2 DEFAULT SYSDATETIME(),
    Environnement NVARCHAR(20) CHECK (Environnement IN ('Development', 'Staging', 'Production')),
    Version NVARCHAR(20),
    EstResolu BIT DEFAULT 0,
    DateResolution DATETIME2,
    CONSTRAINT FK_LogsErreurs_Utilisateur
        FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
    INDEX IX_LogsErreurs_DateErreur (DateErreur),
    INDEX IX_LogsErreurs_Gravite (Gravite),
    INDEX IX_LogsErreurs_TypeErreur (TypeErreur),
    INDEX IX_LogsErreurs_EstResolu (EstResolu)
);

-- =============================================
-- SECTION 13: VUES POUR PERFORMANCE ET REPORTING
-- =============================================

-- Vue matérialisée pour les véhicules disponibles
GO
CREATE VIEW V_VehiculesDisponibles AS
SELECT 
    v.IdentifiantVehicule,
    v.TitreAnnonce,
    v.PrixJournalier,
    v.PrixHebdomadaire,
    v.PrixMensuel,
    v.NotesVehicule,
    v.NombreReservations,
    c.NomCategorie,
    m.NomMarque,
    mo.NomModele,
    v.Annee,
    v.TypeCarburant,
    v.TypeTransmission,
    v.NombrePlaces,
    v.LocalisationVille,
    v.LocalisationRegion,
    v.Latitude,
    v.Longitude,
    v.StatutVehicule,
    v.LivraisonPossible,
    v.EstVedette,
    v.EstPromotion,
    v.ReservationInstantanee,
    
    -- Calcul de disponibilité en temps réel
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM Reservations r 
            WHERE r.IdentifiantVehicule = v.IdentifiantVehicule 
            AND r.StatutReservation IN ('Confirmee', 'EnCours')
            AND SYSDATETIME() BETWEEN r.DateDebut AND r.DateFin
        ) THEN 1
        ELSE 0
    END AS DisponibleMaintenant,
    
    -- Photo principale
    (SELECT TOP 1 URLPhoto 
     FROM PhotosVehicules pv 
     WHERE pv.IdentifiantVehicule = v.IdentifiantVehicule 
     AND pv.EstPhotoPrincipale = 1) AS PhotoPrincipale,
     
    -- Propriétaire
    u.Nom + ' ' + u.Prenom AS NomProprietaire,
    u.NotesUtilisateur AS NoteProprietaire,
    u.PhotoProfil AS PhotoProprietaire
    
FROM Vehicules v
JOIN CategoriesVehicules c ON v.IdentifiantCategorie = c.IdentifiantCategorie
JOIN ModelesVehicules mo ON v.IdentifiantModele = mo.IdentifiantModele
LEFT JOIN MarquesVehicules m ON mo.IdentifiantMarque = m.IdentifiantMarque
JOIN Utilisateurs u ON v.IdentifiantProprietaire = u.IdentifiantUtilisateur
WHERE v.StatutVehicule = 'Actif'
AND v.StatutVerification = 'Verifie'
AND u.StatutCompte = 'Actif';
GO

-- Vue pour le tableau de bord des réservations
CREATE VIEW V_DashboardReservations AS
SELECT 
    r.IdentifiantReservation,
    r.NumeroReservation,
    r.DateDebut,
    r.DateFin,
    r.NombreJours,
    r.MontantTotal,
    r.StatutReservation,
    r.StatutPaiement,
    
    -- Véhicule
    v.TitreAnnonce AS NomVehicule,
    v.Immatriculation,
    (SELECT TOP 1 URLPhoto FROM PhotosVehicules WHERE IdentifiantVehicule = v.IdentifiantVehicule AND EstPhotoPrincipale = 1) AS PhotoVehicule,
    
    -- Locataire
    loc.Nom + ' ' + loc.Prenom AS NomLocataire,
    loc.Email AS EmailLocataire,
    loc.NumeroTelephone AS TelephoneLocataire,
    loc.PhotoProfil AS PhotoLocataire,
    loc.NotesUtilisateur AS NoteLocataire,
    
    -- Propriétaire
    prop.Nom + ' ' + prop.Prenom AS NomProprietaire,
    prop.Email AS EmailProprietaire,
    prop.NumeroTelephone AS TelephoneProprietaire,
    
    -- Métadonnées
    r.DateCreationReservation,
    DATEDIFF(DAY, r.DateDebut, SYSDATETIME()) AS JoursAvantDebut,
    DATEDIFF(DAY, SYSDATETIME(), r.DateFin) AS JoursAvantFin
    
FROM Reservations r
JOIN Vehicules v ON r.IdentifiantVehicule = v.IdentifiantVehicule
JOIN Utilisateurs loc ON r.IdentifiantLocataire = loc.IdentifiantUtilisateur
JOIN Utilisateurs prop ON r.IdentifiantProprietaire = prop.IdentifiantUtilisateur;
GO

-- Vue pour les statistiques financières
CREATE VIEW V_StatistiquesFinancieres AS
SELECT 
    u.IdentifiantUtilisateur,
    u.Nom + ' ' + u.Prenom AS NomComplet,
    u.TypeUtilisateur,
    
    -- Revenus
    SUM(CASE WHEN t.TypeTransaction = 'Paiement' AND t.StatutTransaction = 'Reussie' 
        THEN t.Montant ELSE 0 END) AS RevenuTotal,
    SUM(CASE WHEN t.TypeTransaction = 'Commission' AND t.StatutTransaction = 'Reussie' 
        THEN t.Montant ELSE 0 END) AS CommissionsTotal,
    SUM(CASE WHEN t.TypeTransaction = 'Remboursement' AND t.StatutTransaction = 'Reussie' 
        THEN t.Montant ELSE 0 END) AS RemboursementsTotal,
        
    -- Net
    SUM(CASE WHEN t.StatutTransaction = 'Reussie' THEN t.MontantNet ELSE 0 END) AS RevenuNet,
    
    -- Statistiques
    COUNT(DISTINCT CASE WHEN t.TypeTransaction = 'Paiement' THEN t.IdentifiantTransaction END) AS NombreTransactions,
    AVG(CASE WHEN t.TypeTransaction = 'Paiement' THEN t.Montant END) AS MontantMoyenTransaction,
    
    MAX(t.DateTransaction) AS DerniereTransaction
    
FROM Utilisateurs u
LEFT JOIN Transactions t ON u.IdentifiantUtilisateur = t.IdentifiantUtilisateur
GROUP BY u.IdentifiantUtilisateur, u.Nom, u.Prenom, u.TypeUtilisateur;
GO

-- =============================================
-- SECTION 14: PROCÉDURES STOCKÉES UTILITAIRES
-- =============================================

-- Procédure pour calculer la disponibilité d'un véhicule
CREATE PROCEDURE sp_VerifierDisponibiliteVehicule
    @IdentifiantVehicule INT,
    @DateDebut DATETIME2,
    @DateFin DATETIME2,
    @EstDisponible BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Vérifier si le véhicule a des réservations confirmées pendant la période
    IF EXISTS (
        SELECT 1 
        FROM Reservations 
        WHERE IdentifiantVehicule = @IdentifiantVehicule
        AND StatutReservation IN ('Confirmee', 'EnCours')
        AND (
            (@DateDebut BETWEEN DateDebut AND DateFin) OR
            (@DateFin BETWEEN DateDebut AND DateFin) OR
            (DateDebut BETWEEN @DateDebut AND @DateFin)
        )
    )
    BEGIN
        SET @EstDisponible = 0;
    END
    ELSE
    BEGIN
        SET @EstDisponible = 1;
    END
END;
GO

-- Procédure pour calculer le prix dynamique
CREATE PROCEDURE sp_CalculerPrixDynamique
    @IdentifiantVehicule INT,
    @DateDebut DATETIME2,
    @DateFin DATETIME2,
    @PrixCalcule DECIMAL(10,2) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @PrixBase DECIMAL(10,2);
    DECLARE @PrixFinal DECIMAL(10,2);
    
    -- Récupérer le prix de base
    SELECT @PrixBase = PrixJournalier
    FROM Vehicules
    WHERE IdentifiantVehicule = @IdentifiantVehicule;
    
    SET @PrixFinal = @PrixBase;
    
    -- Appliquer les règles de tarification dynamique
    IF EXISTS (SELECT 1 FROM Vehicules WHERE IdentifiantVehicule = @IdentifiantVehicule AND TarificationDynamiqueActive = 1)
    BEGIN
        -- Appliquer les règles actives par ordre de priorité
        DECLARE @ValeurModificateur DECIMAL(10,2);
        DECLARE @TypeModificateur NVARCHAR(20);
        DECLARE @Operation NVARCHAR(10);
        
        DECLARE cursor_regles CURSOR FOR
        SELECT ValeurModificateur, TypeModificateur, Operation
        FROM ReglesTarificationDynamique
        WHERE IdentifiantVehicule = @IdentifiantVehicule
        AND Actif = 1
        AND @DateDebut BETWEEN DateDebut AND ISNULL(DateFin, '9999-12-31')
        ORDER BY Priorite DESC;
        
        OPEN cursor_regles;
        FETCH NEXT FROM cursor_regles INTO @ValeurModificateur, @TypeModificateur, @Operation;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @TypeModificateur = 'POURCENTAGE'
            BEGIN
                IF @Operation = 'AJOUTER'
                    SET @PrixFinal = @PrixFinal * (1 + @ValeurModificateur / 100);
                ELSE IF @Operation = 'SOUSTRAIRE'
                    SET @PrixFinal = @PrixFinal * (1 - @ValeurModificateur / 100);
            END
            ELSE IF @TypeModificateur = 'MONTANT_FIXE'
            BEGIN
                IF @Operation = 'AJOUTER'
                    SET @PrixFinal = @PrixFinal + @ValeurModificateur;
                ELSE IF @Operation = 'SOUSTRAIRE'
                    SET @PrixFinal = @PrixFinal - @ValeurModificateur;
            END
            ELSE IF @TypeModificateur = 'MULTIPLICATEUR'
            BEGIN
                SET @PrixFinal = @PrixFinal * @ValeurModificateur;
            END
            
            FETCH NEXT FROM cursor_regles INTO @ValeurModificateur, @TypeModificateur, @Operation;
        END
        
        CLOSE cursor_regles;
        DEALLOCATE cursor_regles;
    END
    
    SET @PrixCalcule = @PrixFinal;
END;
GO

-- Procédure pour nettoyer le cache expiré
CREATE PROCEDURE sp_NettoyerCacheExpire
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM CacheRecherches
    WHERE DateExpiration < SYSDATETIME();
    
    -- Log du nombre de lignes supprimées
    DECLARE @LignesSupprimees INT = @@ROWCOUNT;
    
    PRINT 'Cache nettoyé: ' + CAST(@LignesSupprimees AS NVARCHAR(10)) + ' entrées supprimées';
END;
GO

-- =============================================
-- SECTION 15: DONNÉES INITIALES
-- =============================================

-- Insertion des niveaux de fidélité
INSERT INTO ProgrammeFidelite (NomProgramme, Niveau, SeuilPoints, PourcentageRemise, CouleurBadge) VALUES
('Bronze', 'BRONZE', 0, 0, '#CD7F32'),
('Argent', 'ARGENT', 1000, 5, '#C0C0C0'),
('Or', 'OR', 5000, 10, '#FFD700'),
('Platine', 'PLATINE', 15000, 15, '#E5E4E2'),
('Diamant', 'DIAMANT', 50000, 20, '#B9F2FF');

-- Insertion de templates de notifications de base
INSERT INTO TemplatesNotifications (TypeNotification, NomTemplate, TitreTemplate, CorpsTemplate, CanauxDisponibles, Categorie) VALUES
('reservation.confirmee', 'Confirmation de réservation', 'Votre réservation est confirmée!', 
'Bonjour {{user_name}}, votre réservation {{booking_number}} pour {{vehicle_name}} est confirmée du {{start_date}} au {{end_date}}.', 
'["email","push","in_app"]', 'Reservation'),

('paiement.reussi', 'Paiement réussi', 'Paiement effectué avec succès', 
'Votre paiement de {{amount}} {{currency}} a été effectué avec succès pour la réservation {{booking_number}}.', 
'["email","sms","push","in_app"]', 'Paiement'),

('reservation.rappel_debut', 'Rappel de réservation', 'Votre location commence demain', 
'Bonjour {{user_name}}, votre location du véhicule {{vehicle_name}} commence demain à {{start_time}}.', 
'["email","push","sms"]', 'Reservation');

PRINT 'Schéma de base de données AUTOLOCO v3 créé avec succès!';
PRINT 'Total de 41 tables créées avec optimisations avancées.';
GO
