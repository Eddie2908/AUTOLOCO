-- ============================================================
-- AUTOLOCO - Migration SQL Server vers PostgreSQL (Supabase)
-- ============================================================
-- Ce script cree l'ensemble de la structure de la base de donnees
-- en PostgreSQL compatible avec Supabase.
--
-- Conversions principales appliquees :
--   - NVARCHAR(n)       -> VARCHAR(n)
--   - NVARCHAR(MAX)     -> TEXT
--   - VARBINARY(n)      -> BYTEA
--   - BIT               -> BOOLEAN
--   - DATETIME2/DATETIME-> TIMESTAMPTZ
--   - FLOAT              -> DOUBLE PRECISION
--   - geography          -> geography (via PostGIS)  -- optionnel
--   - TIME               -> TIME
--   - BIGINT IDENTITY    -> BIGSERIAL
--   - INT IDENTITY       -> SERIAL
--   - sysdatetime()      -> NOW()
-- ============================================================

-- Activer l'extension PostGIS si besoin pour les colonnes geography
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 1. TABLE: Utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "Utilisateurs" (
  "IdentifiantUtilisateur"       SERIAL PRIMARY KEY,
  "Nom"                          VARCHAR(100) NOT NULL,
  "Prenom"                       VARCHAR(100) NOT NULL,
  "Email"                        VARCHAR(255) NOT NULL,
  "MotDePasse"                   VARCHAR(255) NOT NULL,
  "NumeroTelephone"              VARCHAR(20),
  "DateNaissance"                DATE,
  "PhotoProfil"                  VARCHAR(500),
  "TypeUtilisateur"              VARCHAR(20) NOT NULL,
  "StatutCompte"                 VARCHAR(20) DEFAULT 'Actif',
  "EmailVerifie"                 BOOLEAN DEFAULT FALSE,
  "TelephoneVerifie"             BOOLEAN DEFAULT FALSE,
  "DateInscription"              TIMESTAMPTZ DEFAULT NOW(),
  "DerniereConnexion"            TIMESTAMPTZ,
  "AdresseIP"                    VARCHAR(45),
  "DeviceInfo"                   VARCHAR(500),
  "LanguePreferee"               VARCHAR(10) DEFAULT 'fr',
  "DevisePreferee"               VARCHAR(3) DEFAULT 'XOF',
  "BiographieUtilisateur"        TEXT,
  "SiteWeb"                      VARCHAR(255),
  "ReseauxSociaux"               TEXT,
  "NotesUtilisateur"             DECIMAL(3,2) DEFAULT 0.00,
  "NombreReservationsEffectuees" INTEGER DEFAULT 0,
  "NombreVehiculesLoues"         INTEGER DEFAULT 0,
  "MembreDepuis"                 INTEGER,
  "NiveauFidelite"               VARCHAR(20) DEFAULT 'BRONZE',
  "PointsFideliteTotal"          INTEGER DEFAULT 0
);

ALTER TABLE "Utilisateurs" ADD CONSTRAINT "UQ_Utilisateurs_Email" UNIQUE ("Email");

CREATE INDEX "IX_Utilisateurs_DateInscription"  ON "Utilisateurs" ("DateInscription");
CREATE INDEX "IX_Utilisateurs_Email"            ON "Utilisateurs" ("Email");
CREATE INDEX "IX_Utilisateurs_NiveauFidelite"   ON "Utilisateurs" ("NiveauFidelite");
CREATE INDEX "IX_Utilisateurs_StatutCompte"     ON "Utilisateurs" ("StatutCompte");
CREATE INDEX "IX_Utilisateurs_TypeUtilisateur"  ON "Utilisateurs" ("TypeUtilisateur");

-- ============================================================
-- 2. TABLE: AdressesUtilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "AdressesUtilisateurs" (
  "IdentifiantAdresse"       SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"   INTEGER NOT NULL,
  "TypeAdresse"              VARCHAR(20) NOT NULL,
  "AdresseLigne1"            VARCHAR(255) NOT NULL,
  "AdresseLigne2"            VARCHAR(255),
  "Ville"                    VARCHAR(100) NOT NULL,
  "Region"                   VARCHAR(100),
  "CodePostal"               VARCHAR(20),
  "Pays"                     VARCHAR(100) DEFAULT 'Senegal',
  "Latitude"                 DECIMAL(10,8),
  "Longitude"                DECIMAL(11,8),
  "EstAdressePrincipale"     BOOLEAN DEFAULT FALSE,
  "DateAjout"                TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_AdressesUtilisateurs_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_AdressesUtilisateurs_Type"        ON "AdressesUtilisateurs" ("TypeAdresse");
CREATE INDEX "IX_AdressesUtilisateurs_Utilisateur"  ON "AdressesUtilisateurs" ("IdentifiantUtilisateur");

-- ============================================================
-- 3. TABLE: DocumentsUtilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "DocumentsUtilisateurs" (
  "IdentifiantDocument"        SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"     INTEGER NOT NULL,
  "TypeDocument"               VARCHAR(50) NOT NULL,
  "NomFichier"                 VARCHAR(255) NOT NULL,
  "CheminFichier"              VARCHAR(500) NOT NULL,
  "TailleFichier"              BIGINT,
  "FormatFichier"              VARCHAR(10),
  "NumeroDocument"             VARCHAR(100),
  "DateExpiration"             DATE,
  "StatutVerification"         VARCHAR(20) DEFAULT 'EnAttente',
  "DateTeleversement"          TIMESTAMPTZ DEFAULT NOW(),
  "DateVerification"           TIMESTAMPTZ,
  "VerifiePar"                 INTEGER,
  "CommentairesVerification"   VARCHAR(500),
  "HashFichier"                BYTEA,

  CONSTRAINT "FK_DocumentsUtilisateurs_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION,

  CONSTRAINT "FK_DocumentsUtilisateurs_Verificateur"
    FOREIGN KEY ("VerifiePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_DocumentsUtilisateurs_Expiration"   ON "DocumentsUtilisateurs" ("DateExpiration");
CREATE INDEX "IX_DocumentsUtilisateurs_Statut"       ON "DocumentsUtilisateurs" ("StatutVerification");
CREATE INDEX "IX_DocumentsUtilisateurs_Type"         ON "DocumentsUtilisateurs" ("TypeDocument");
CREATE INDEX "IX_DocumentsUtilisateurs_Utilisateur"  ON "DocumentsUtilisateurs" ("IdentifiantUtilisateur");

-- ============================================================
-- 4. TABLE: PreferencesUtilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "PreferencesUtilisateurs" (
  "IdentifiantPreference"       SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"      INTEGER NOT NULL,
  "NotificationsEmail"          BOOLEAN DEFAULT TRUE,
  "NotificationsSMS"            BOOLEAN DEFAULT TRUE,
  "NotificationsPush"           BOOLEAN DEFAULT TRUE,
  "NotificationsReservations"   BOOLEAN DEFAULT TRUE,
  "NotificationsPromotions"     BOOLEAN DEFAULT FALSE,
  "NotificationsMessages"       BOOLEAN DEFAULT TRUE,
  "NotificationsAvis"           BOOLEAN DEFAULT TRUE,
  "ModeTheme"                   VARCHAR(10) DEFAULT 'Clair',
  "AffichageMonnaie"            VARCHAR(3) DEFAULT 'XOF',
  "FormatDate"                  VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  "FuseauHoraire"               VARCHAR(50) DEFAULT 'Africa/Dakar',
  "VisibiliteProfile"           VARCHAR(20) DEFAULT 'Public',
  "AfficherNumeroTelephone"     BOOLEAN DEFAULT FALSE,
  "AfficherEmail"               BOOLEAN DEFAULT FALSE,
  "AutoriserMessages"           BOOLEAN DEFAULT TRUE,
  "DateMiseAJour"               TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "UQ_PreferencesUtilisateurs_Utilisateur" UNIQUE ("IdentifiantUtilisateur"),

  CONSTRAINT "FK_PreferencesUtilisateurs_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

-- ============================================================
-- 5. TABLE: TentativesConnexion
-- ============================================================
CREATE TABLE IF NOT EXISTS "TentativesConnexion" (
  "IdentifiantTentative"  SERIAL PRIMARY KEY,
  "AdresseEmail"          VARCHAR(150) NOT NULL,
  "AdresseIP"             VARCHAR(50) NOT NULL,
  "Reussie"               BOOLEAN DEFAULT FALSE,
  "CodeErreur"            VARCHAR(50),
  "MotifEchec"            VARCHAR(255),
  "DateTentative"         TIMESTAMPTZ DEFAULT NOW(),
  "UserAgent"             VARCHAR(500),
  "Pays"                  VARCHAR(100)
);

CREATE INDEX "IDX_Tentatives_Email_Date"  ON "TentativesConnexion" ("AdresseEmail", "DateTentative");
CREATE INDEX "IDX_Tentatives_IP_Date"     ON "TentativesConnexion" ("AdresseIP", "DateTentative");
CREATE INDEX "IDX_Tentatives_Reussie"     ON "TentativesConnexion" ("Reussie");

-- ============================================================
-- 6. TABLE: CategoriesVehicules
-- ============================================================
CREATE TABLE IF NOT EXISTS "CategoriesVehicules" (
  "IdentifiantCategorie"    SERIAL PRIMARY KEY,
  "NomCategorie"            VARCHAR(100) NOT NULL,
  "DescriptionCategorie"    VARCHAR(500),
  "IconeCategorie"          VARCHAR(255),
  "OrdreAffichage"          INTEGER DEFAULT 0,
  "EstActif"                BOOLEAN DEFAULT TRUE,
  "DateCreation"            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "CategoriesVehicules" ADD CONSTRAINT "UQ_CategoriesVehicules_Nom" UNIQUE ("NomCategorie");

-- ============================================================
-- 7. TABLE: MarquesVehicules
-- ============================================================
CREATE TABLE IF NOT EXISTS "MarquesVehicules" (
  "IdentifiantMarque"  SERIAL PRIMARY KEY,
  "NomMarque"          VARCHAR(100) NOT NULL,
  "LogoMarque"         VARCHAR(255),
  "PaysOrigine"        VARCHAR(100),
  "SiteWeb"            VARCHAR(255),
  "EstPopulaire"       BOOLEAN DEFAULT FALSE,
  "DateAjout"          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "MarquesVehicules" ADD CONSTRAINT "UQ_MarquesVehicules_Nom" UNIQUE ("NomMarque");
CREATE INDEX "IX_MarquesVehicules_Populaire" ON "MarquesVehicules" ("EstPopulaire");

-- ============================================================
-- 8. TABLE: ModelesVehicules
-- ============================================================
CREATE TABLE IF NOT EXISTS "ModelesVehicules" (
  "IdentifiantModele"    SERIAL PRIMARY KEY,
  "IdentifiantMarque"    INTEGER NOT NULL,
  "NomModele"            VARCHAR(100) NOT NULL,
  "AnneeDebut"           INTEGER,
  "AnneeFin"             INTEGER,
  "TypeCarburant"        VARCHAR(50),
  "TypeTransmission"     VARCHAR(50),
  "NombrePlaces"         INTEGER,
  "NombrePortes"         INTEGER,
  "CapaciteCoffre"       INTEGER,
  "ConsommationMoyenne"  DECIMAL(5,2),
  "ImageModele"          VARCHAR(255),
  "DateAjout"            TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_ModelesVehicules_Marque"
    FOREIGN KEY ("IdentifiantMarque")
    REFERENCES "MarquesVehicules" ("IdentifiantMarque")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_ModelesVehicules_Carburant" ON "ModelesVehicules" ("TypeCarburant");
CREATE INDEX "IX_ModelesVehicules_Marque"    ON "ModelesVehicules" ("IdentifiantMarque");

-- ============================================================
-- 9. TABLE: Vehicules
-- ============================================================
CREATE TABLE IF NOT EXISTS "Vehicules" (
  "IdentifiantVehicule"              SERIAL PRIMARY KEY,
  "IdentifiantProprietaire"          INTEGER NOT NULL,
  "IdentifiantCategorie"             INTEGER NOT NULL,
  "IdentifiantModele"                INTEGER NOT NULL,
  "TitreAnnonce"                     VARCHAR(200) NOT NULL,
  "DescriptionVehicule"              TEXT,
  "Immatriculation"                  VARCHAR(50),
  "Annee"                            INTEGER NOT NULL,
  "Couleur"                          VARCHAR(50),
  "Kilometrage"                      INTEGER DEFAULT 0,
  "NumeroChassisVIN"                 VARCHAR(50),
  "NombrePlaces"                     INTEGER NOT NULL,
  "TypeCarburant"                    VARCHAR(50) NOT NULL,
  "TypeTransmission"                 VARCHAR(50) NOT NULL,
  "Climatisation"                    BOOLEAN DEFAULT FALSE,
  "GPS"                              BOOLEAN DEFAULT FALSE,
  "Bluetooth"                        BOOLEAN DEFAULT FALSE,
  "CameraRecul"                      BOOLEAN DEFAULT FALSE,
  "SiegesEnCuir"                     BOOLEAN DEFAULT FALSE,
  "ToitOuvrant"                      BOOLEAN DEFAULT FALSE,
  "RegulateursVitesse"               BOOLEAN DEFAULT FALSE,
  "AirbagsMultiples"                 BOOLEAN DEFAULT FALSE,
  "EquipementsSupplementaires"       TEXT,
  "PrixJournalier"                   DECIMAL(10,2) NOT NULL,
  "PrixHebdomadaire"                 DECIMAL(10,2),
  "PrixMensuel"                      DECIMAL(10,2),
  "CautionRequise"                   DECIMAL(10,2) DEFAULT 0,
  "KilometrageInclus"                INTEGER DEFAULT 200,
  "FraisKilometrageSupplementaire"   DECIMAL(10,2) DEFAULT 0,
  "LocalisationVille"                VARCHAR(100) NOT NULL,
  "LocalisationRegion"               VARCHAR(100),
  "AdresseComplete"                  VARCHAR(500),
  "Latitude"                         DECIMAL(10,8),
  "Longitude"                        DECIMAL(11,8),
  "DisponibiliteLundi"               BOOLEAN DEFAULT TRUE,
  "DisponibiliteMardi"               BOOLEAN DEFAULT TRUE,
  "DisponibiliteMercredi"            BOOLEAN DEFAULT TRUE,
  "DisponibiliteJeudi"              BOOLEAN DEFAULT TRUE,
  "DisponibiliteVendredi"            BOOLEAN DEFAULT TRUE,
  "DisponibiliteSamedi"              BOOLEAN DEFAULT TRUE,
  "DisponibiliteDimanche"            BOOLEAN DEFAULT TRUE,
  "HeureDebutDisponibilite"          TIME DEFAULT '08:00',
  "HeureFinDisponibilite"            TIME DEFAULT '20:00',
  "LivraisonPossible"               BOOLEAN DEFAULT FALSE,
  "FraisLivraison"                   DECIMAL(10,2) DEFAULT 0,
  "RayonLivraison"                   INTEGER,
  "StatutVehicule"                   VARCHAR(20) DEFAULT 'Actif',
  "StatutVerification"               VARCHAR(20) DEFAULT 'EnAttente',
  "NotesVehicule"                    DECIMAL(3,2) DEFAULT 0.00,
  "NombreReservations"               INTEGER DEFAULT 0,
  "NombreVues"                       INTEGER DEFAULT 0,
  "DateCreation"                     TIMESTAMPTZ DEFAULT NOW(),
  "DateDerniereModification"         TIMESTAMPTZ DEFAULT NOW(),
  "DateDerniereReservation"          TIMESTAMPTZ,
  "EstPromotion"                     BOOLEAN DEFAULT FALSE,
  "EstVedette"                       BOOLEAN DEFAULT FALSE,
  "EstAssure"                        BOOLEAN DEFAULT FALSE,
  "CompagnieAssurance"               VARCHAR(200),
  "NumeroPoliceAssurance"            VARCHAR(100),
  "DateExpirationAssurance"          DATE,
  "DernierEntretien"                 DATE,
  "ProchainEntretien"                DATE,
  "TarificationDynamiqueActive"      BOOLEAN DEFAULT FALSE,
  "TauxOccupationActuel"             DECIMAL(5,2) DEFAULT 0.00,

  CONSTRAINT "UQ_Vehicules_Immatriculation" UNIQUE ("Immatriculation"),
  CONSTRAINT "UQ_Vehicules_VIN"             UNIQUE ("NumeroChassisVIN"),

  CONSTRAINT "FK_Vehicules_Proprietaire"
    FOREIGN KEY ("IdentifiantProprietaire")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Vehicules_Categorie"
    FOREIGN KEY ("IdentifiantCategorie")
    REFERENCES "CategoriesVehicules" ("IdentifiantCategorie")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Vehicules_Modele"
    FOREIGN KEY ("IdentifiantModele")
    REFERENCES "ModelesVehicules" ("IdentifiantModele")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_Vehicules_Categorie"           ON "Vehicules" ("IdentifiantCategorie");
CREATE INDEX "IX_Vehicules_DateCreation"        ON "Vehicules" ("DateCreation");
CREATE INDEX "IX_Vehicules_Location"            ON "Vehicules" ("Latitude", "Longitude");
CREATE INDEX "IX_Vehicules_Modele"              ON "Vehicules" ("IdentifiantModele");
CREATE INDEX "IX_Vehicules_Notes"               ON "Vehicules" ("NotesVehicule");
CREATE INDEX "IX_Vehicules_Prix"                ON "Vehicules" ("PrixJournalier");
CREATE INDEX "IX_Vehicules_Promotion"           ON "Vehicules" ("EstPromotion");
CREATE INDEX "IX_Vehicules_Proprietaire"        ON "Vehicules" ("IdentifiantProprietaire");
CREATE INDEX "IX_Vehicules_Statut"              ON "Vehicules" ("StatutVehicule");
CREATE INDEX "IX_Vehicules_Vedette"             ON "Vehicules" ("EstVedette");
CREATE INDEX "IX_Vehicules_Ville"               ON "Vehicules" ("LocalisationVille");
CREATE INDEX "IX_Vehicules_Search_Composite"    ON "Vehicules" ("StatutVehicule", "EstVedette", "NotesVehicule");
CREATE INDEX "IX_Vehicules_TypeCarburant"       ON "Vehicules" ("TypeCarburant");
CREATE INDEX "IX_Vehicules_TypeTransmission"    ON "Vehicules" ("TypeTransmission");
CREATE INDEX "IX_Vehicules_NombrePlaces"        ON "Vehicules" ("NombrePlaces");
CREATE INDEX "IX_Vehicules_Owner_Statut"        ON "Vehicules" ("IdentifiantProprietaire", "StatutVehicule");

-- ============================================================
-- 10. TABLE: PhotosVehicules
-- ============================================================
CREATE TABLE IF NOT EXISTS "PhotosVehicules" (
  "IdentifiantPhoto"     SERIAL PRIMARY KEY,
  "IdentifiantVehicule"  INTEGER NOT NULL,
  "URLPhoto"             VARCHAR(500) NOT NULL,
  "URLMiniature"         VARCHAR(500),
  "LegendePhoto"         VARCHAR(255),
  "OrdreAffichage"       INTEGER DEFAULT 0,
  "EstPhotoPrincipale"   BOOLEAN DEFAULT FALSE,
  "TailleFichier"        BIGINT,
  "FormatImage"          VARCHAR(10),
  "DateAjout"            TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_PhotosVehicules_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_PhotosVehicules_Principale" ON "PhotosVehicules" ("EstPhotoPrincipale");
CREATE INDEX "IX_PhotosVehicules_Vehicule"   ON "PhotosVehicules" ("IdentifiantVehicule");

-- ============================================================
-- 11. TABLE: CaracteristiquesTechniques
-- ============================================================
CREATE TABLE IF NOT EXISTS "CaracteristiquesTechniques" (
  "IdentifiantCaracteristique" SERIAL PRIMARY KEY,
  "IdentifiantVehicule"        INTEGER NOT NULL,
  "Puissance"                  INTEGER,
  "Couple"                     INTEGER,
  "VitesseMaximale"            INTEGER,
  "Acceleration"               DECIMAL(4,2),
  "CapaciteReservoir"          INTEGER,
  "PoidsVide"                  INTEGER,
  "ChargeUtile"                INTEGER,
  "LongueurVehicule"           INTEGER,
  "LargeurVehicule"            INTEGER,
  "HauteurVehicule"            INTEGER,
  "EmpatementVehicule"         INTEGER,
  "NormeEmission"              VARCHAR(50),
  "TypeRoueMotrice"            VARCHAR(50),
  "DateAjout"                  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_CaracteristiquesTechniques_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

-- ============================================================
-- 12. TABLE: Reservations
-- ============================================================
CREATE TABLE IF NOT EXISTS "Reservations" (
  "IdentifiantReservation"           SERIAL PRIMARY KEY,
  "NumeroReservation"                VARCHAR(50) NOT NULL DEFAULT '',
  "IdentifiantVehicule"              INTEGER NOT NULL,
  "IdentifiantLocataire"             INTEGER NOT NULL,
  "IdentifiantProprietaire"          INTEGER NOT NULL,
  "DateDebut"                        TIMESTAMPTZ NOT NULL,
  "DateFin"                          TIMESTAMPTZ NOT NULL,
  "DateCreationReservation"          TIMESTAMPTZ DEFAULT NOW(),
  "HeureDebut"                       TIME,
  "HeureFin"                         TIME,
  "LieuPriseEnCharge"               VARCHAR(500),
  "LieuRestitution"                 VARCHAR(500),
  "LivraisonDemandee"               BOOLEAN DEFAULT FALSE,
  "AdresseLivraison"                VARCHAR(500),
  "FraisLivraison"                  DECIMAL(10,2) DEFAULT 0,
  "NombreJours"                     INTEGER,
  "PrixJournalier"                  DECIMAL(10,2) NOT NULL,
  "MontantLocation"                 DECIMAL(10,2) NOT NULL,
  "MontantCaution"                  DECIMAL(10,2) DEFAULT 0,
  "FraisService"                    DECIMAL(10,2) DEFAULT 0,
  "FraisAssurance"                  DECIMAL(10,2) DEFAULT 0,
  "FraisSupplementaires"            DECIMAL(10,2) DEFAULT 0,
  "DetailsSupplementaires"          TEXT,
  "Remise"                          DECIMAL(10,2) DEFAULT 0,
  "CodePromo"                       VARCHAR(50),
  "MontantTotal"                    DECIMAL(10,2) NOT NULL,
  "StatutReservation"               VARCHAR(30) DEFAULT 'EnAttente',
  "StatutPaiement"                  VARCHAR(30) DEFAULT 'EnAttente',
  "MethodePaiement"                 VARCHAR(50),
  "KilometrageDepart"               INTEGER,
  "KilometrageRetour"               INTEGER,
  "KilometrageParcouru"             INTEGER,
  "KilometrageInclus"               INTEGER DEFAULT 200,
  "FraisKilometrageSupplementaire"  DECIMAL(10,2) DEFAULT 0,
  "MontantKilometrageSupplementaire" DECIMAL(21,2),
  "NiveauCarburantDepart"           VARCHAR(20),
  "NiveauCarburantRetour"           VARCHAR(20),
  "EtatVehiculeDepart"              TEXT,
  "EtatVehiculeRetour"              TEXT,
  "PhotosDepart"                    TEXT,
  "PhotosRetour"                    TEXT,
  "CommentairesLocataire"           TEXT,
  "CommentairesProprietaire"        TEXT,
  "MotifAnnulation"                 VARCHAR(500),
  "DateAnnulation"                  TIMESTAMPTZ,
  "AnnulePar"                       INTEGER,
  "FraisAnnulation"                 DECIMAL(10,2) DEFAULT 0,
  "EstAssurance"                    BOOLEAN DEFAULT FALSE,
  "TypeAssurance"                   VARCHAR(100),
  "MontantAssurance"                DECIMAL(10,2) DEFAULT 0,
  "ConducteursSupplementaires"      TEXT,
  "NombreConducteurs"               INTEGER DEFAULT 1,
  "NotesSpeciales"                  TEXT,
  "DateConfirmation"                TIMESTAMPTZ,
  "DateDebutEffectif"               TIMESTAMPTZ,
  "DateFinEffective"                TIMESTAMPTZ,
  "RetardRetour"                    INTEGER DEFAULT 0,
  "FraisRetard"                     DECIMAL(10,2) DEFAULT 0,

  CONSTRAINT "UQ_Reservations_Numero" UNIQUE ("NumeroReservation"),

  CONSTRAINT "FK_Reservations_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Reservations_Locataire"
    FOREIGN KEY ("IdentifiantLocataire")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Reservations_Proprietaire"
    FOREIGN KEY ("IdentifiantProprietaire")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Reservations_AnnulePar"
    FOREIGN KEY ("AnnulePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_Reservations_DateCreation"  ON "Reservations" ("DateCreationReservation");
CREATE INDEX "IX_Reservations_Dates"         ON "Reservations" ("DateDebut", "DateFin");
CREATE INDEX "IX_Reservations_Locataire"     ON "Reservations" ("IdentifiantLocataire");
CREATE INDEX "IX_Reservations_Paiement"      ON "Reservations" ("StatutPaiement");
CREATE INDEX "IX_Reservations_Proprietaire"  ON "Reservations" ("IdentifiantProprietaire");
CREATE INDEX "IX_Reservations_Statut"        ON "Reservations" ("StatutReservation");
CREATE INDEX "IX_Reservations_Vehicule"      ON "Reservations" ("IdentifiantVehicule");
CREATE INDEX "IX_Reservations_Owner_Dates"   ON "Reservations" ("IdentifiantProprietaire", "DateDebut", "DateFin");
CREATE INDEX "IX_Reservations_Availability"  ON "Reservations" ("IdentifiantVehicule", "StatutReservation", "DateDebut", "DateFin");

-- ============================================================
-- 13. TABLE: ExtensionsReservations
-- ============================================================
CREATE TABLE IF NOT EXISTS "ExtensionsReservations" (
  "IdentifiantExtension"   SERIAL PRIMARY KEY,
  "IdentifiantReservation"  INTEGER NOT NULL,
  "NouvelleDateFin"         TIMESTAMPTZ NOT NULL,
  "AncienneDateFin"         TIMESTAMPTZ NOT NULL,
  "JoursSupplementaires"    INTEGER,
  "MontantSupplementaire"   DECIMAL(10,2) NOT NULL,
  "StatutDemande"           VARCHAR(20) DEFAULT 'EnAttente',
  "DateDemande"             TIMESTAMPTZ DEFAULT NOW(),
  "DateReponse"             TIMESTAMPTZ,
  "RaisonExtension"         VARCHAR(500),
  "RaisonRefus"             VARCHAR(500),

  CONSTRAINT "FK_ExtensionsReservations_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_ExtensionsReservations_Reservation" ON "ExtensionsReservations" ("IdentifiantReservation");
CREATE INDEX "IX_ExtensionsReservations_Statut"      ON "ExtensionsReservations" ("StatutDemande");

-- ============================================================
-- 14. TABLE: Transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS "Transactions" (
  "IdentifiantTransaction"              SERIAL PRIMARY KEY,
  "NumeroTransaction"                   VARCHAR(100) NOT NULL,
  "IdentifiantReservation"              INTEGER,
  "IdentifiantUtilisateur"              INTEGER NOT NULL,
  "TypeTransaction"                     VARCHAR(50) NOT NULL,
  "Montant"                             DECIMAL(10,2) NOT NULL,
  "Devise"                              VARCHAR(3) DEFAULT 'XOF',
  "MethodePaiement"                     VARCHAR(50) NOT NULL,
  "FournisseurPaiement"                 VARCHAR(100),
  "ReferenceExterne"                    VARCHAR(255),
  "StatutTransaction"                   VARCHAR(30) DEFAULT 'EnAttente',
  "DateTransaction"                     TIMESTAMPTZ DEFAULT NOW(),
  "DateTraitement"                      TIMESTAMPTZ,
  "FraisTransaction"                    DECIMAL(10,2) DEFAULT 0,
  "FraisCommission"                     DECIMAL(10,2) DEFAULT 0,
  "MontantNet"                          DECIMAL(10,2),
  "Description"                         VARCHAR(500),
  "DetailsTransaction"                  TEXT,
  "AdresseIPTransaction"                VARCHAR(45),
  "DeviceInfo"                          VARCHAR(500),
  "CodeErreur"                          VARCHAR(50),
  "MessageErreur"                       VARCHAR(500),
  "NombreTentatives"                    INTEGER DEFAULT 1,
  "EstRembourse"                        BOOLEAN DEFAULT FALSE,
  "DateRemboursement"                   TIMESTAMPTZ,
  "IdentifiantTransactionRemboursement" INTEGER,

  CONSTRAINT "UQ_Transactions_Numero" UNIQUE ("NumeroTransaction"),

  CONSTRAINT "FK_Transactions_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT "FK_Transactions_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_Transactions_Date"         ON "Transactions" ("DateTransaction");
CREATE INDEX "IX_Transactions_Reservation"  ON "Transactions" ("IdentifiantReservation");
CREATE INDEX "IX_Transactions_Statut"       ON "Transactions" ("StatutTransaction");
CREATE INDEX "IX_Transactions_Type"         ON "Transactions" ("TypeTransaction");
CREATE INDEX "IX_Transactions_Utilisateur"  ON "Transactions" ("IdentifiantUtilisateur");
CREATE INDEX "IX_Transactions_Analytics"    ON "Transactions" ("StatutTransaction", "DateTransaction");

-- ============================================================
-- 15. TABLE: MethodesPaiementUtilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "MethodesPaiementUtilisateurs" (
  "IdentifiantMethode"        SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"    INTEGER NOT NULL,
  "TypeMethode"               VARCHAR(50) NOT NULL,
  "EstMethodePrincipale"      BOOLEAN DEFAULT FALSE,
  "Actif"                     BOOLEAN DEFAULT TRUE,
  "Alias"                     VARCHAR(100),
  "DerniersChiffres"          VARCHAR(10),
  "Fournisseur"               VARCHAR(100),
  "DateExpiration"             DATE,
  "DateAjout"                 TIMESTAMPTZ DEFAULT NOW(),
  "DateDerniereUtilisation"   TIMESTAMPTZ,

  CONSTRAINT "FK_MethodesPaiement_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_MethodesPaiement_Principal"    ON "MethodesPaiementUtilisateurs" ("EstMethodePrincipale");
CREATE INDEX "IX_MethodesPaiement_Utilisateur"  ON "MethodesPaiementUtilisateurs" ("IdentifiantUtilisateur");

-- ============================================================
-- 16. TABLE: Factures
-- ============================================================
CREATE TABLE IF NOT EXISTS "Factures" (
  "IdentifiantFacture"      SERIAL PRIMARY KEY,
  "NumeroFacture"           VARCHAR(50) NOT NULL,
  "IdentifiantReservation"  INTEGER NOT NULL,
  "IdentifiantUtilisateur"  INTEGER NOT NULL,
  "DateEmission"            TIMESTAMPTZ DEFAULT NOW(),
  "DateEcheance"            TIMESTAMPTZ,
  "MontantHT"               DECIMAL(10,2) NOT NULL,
  "TauxTVA"                 DECIMAL(5,2) DEFAULT 0,
  "MontantTVA"              DECIMAL(20,8),
  "MontantTTC"              DECIMAL(21,8),
  "StatutFacture"           VARCHAR(20) DEFAULT 'Emise',
  "CheminPDF"               VARCHAR(500),
  "DatePaiement"            TIMESTAMPTZ,
  "NotesFacture"            TEXT,

  CONSTRAINT "UQ_Factures_Numero" UNIQUE ("NumeroFacture"),

  CONSTRAINT "FK_Factures_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Factures_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_Factures_DateEmission" ON "Factures" ("DateEmission");
CREATE INDEX "IX_Factures_Reservation"  ON "Factures" ("IdentifiantReservation");
CREATE INDEX "IX_Factures_Statut"       ON "Factures" ("StatutFacture");
CREATE INDEX "IX_Factures_Utilisateur"  ON "Factures" ("IdentifiantUtilisateur");

-- ============================================================
-- 17. TABLE: CodesPromo
-- ============================================================
CREATE TABLE IF NOT EXISTS "CodesPromo" (
  "IdentifiantPromo"            SERIAL PRIMARY KEY,
  "CodePromo"                   VARCHAR(50) NOT NULL,
  "TypePromo"                   VARCHAR(20),
  "ValeurPromo"                 DECIMAL(10,2) NOT NULL,
  "MontantMinimum"              DECIMAL(10,2),
  "NombreUtilisationsMax"       INTEGER,
  "NombreUtilisationsActuel"    INTEGER DEFAULT 0,
  "UtilisationsParUtilisateur"  INTEGER DEFAULT 1,
  "DateDebut"                   TIMESTAMPTZ NOT NULL,
  "DateFin"                     TIMESTAMPTZ NOT NULL,
  "Actif"                       BOOLEAN DEFAULT TRUE,
  "CategoriesApplicables"       TEXT,
  "VehiculesApplicables"        TEXT,
  "UtilisateursApplicables"     TEXT,
  "Description"                 VARCHAR(500),
  "CreePar"                     INTEGER,
  "DateCreation"                TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "UQ_CodesPromo_Code" UNIQUE ("CodePromo"),

  CONSTRAINT "FK_CodesPromo_Createur"
    FOREIGN KEY ("CreePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_CodesPromo_Actif"  ON "CodesPromo" ("Actif");
CREATE INDEX "IX_CodesPromo_Code"   ON "CodesPromo" ("CodePromo");
CREATE INDEX "IX_CodesPromo_Dates"  ON "CodesPromo" ("DateDebut", "DateFin");

-- ============================================================
-- 18. TABLE: UtilisationsCodesPromo
-- ============================================================
CREATE TABLE IF NOT EXISTS "UtilisationsCodesPromo" (
  "IdentifiantUtilisation"  SERIAL PRIMARY KEY,
  "IdentifiantPromo"        INTEGER NOT NULL,
  "IdentifiantUtilisateur"  INTEGER NOT NULL,
  "IdentifiantReservation"  INTEGER NOT NULL,
  "MontantRemise"           DECIMAL(10,2) NOT NULL,
  "DateUtilisation"         TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_UtilisationsPromo_Promo"
    FOREIGN KEY ("IdentifiantPromo")
    REFERENCES "CodesPromo" ("IdentifiantPromo")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_UtilisationsPromo_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_UtilisationsPromo_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_UtilisationsPromo_Promo"        ON "UtilisationsCodesPromo" ("IdentifiantPromo");
CREATE INDEX "IX_UtilisationsPromo_Reservation"  ON "UtilisationsCodesPromo" ("IdentifiantReservation");
CREATE INDEX "IX_UtilisationsPromo_Utilisateur"  ON "UtilisationsCodesPromo" ("IdentifiantUtilisateur");

-- ============================================================
-- 19. TABLE: ProgrammeFidelite
-- ============================================================
CREATE TABLE IF NOT EXISTS "ProgrammeFidelite" (
  "IdentifiantProgramme"   SERIAL PRIMARY KEY,
  "NomProgramme"           VARCHAR(100) NOT NULL,
  "Niveau"                 VARCHAR(50),
  "SeuilPoints"            INTEGER NOT NULL,
  "PourcentageRemise"      DECIMAL(5,2) DEFAULT 0,
  "PrioriteSuppor"         BOOLEAN DEFAULT FALSE,
  "AnnulationGratuite"     BOOLEAN DEFAULT FALSE,
  "AccesExclusif"          BOOLEAN DEFAULT FALSE,
  "SurclassementGratuit"   BOOLEAN DEFAULT FALSE,
  "Avantages"              TEXT,
  "CouleurBadge"           VARCHAR(20),
  "IconeBadge"             VARCHAR(255),
  "Actif"                  BOOLEAN DEFAULT TRUE,
  "DateCreation"           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX "IDX_ProgrammeFidelite_Niveau" ON "ProgrammeFidelite" ("Niveau");
CREATE INDEX "IDX_ProgrammeFidelite_Seuil"  ON "ProgrammeFidelite" ("SeuilPoints");

-- ============================================================
-- 20. TABLE: PointsFidelite
-- ============================================================
CREATE TABLE IF NOT EXISTS "PointsFidelite" (
  "IdentifiantPoint"         SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"   INTEGER NOT NULL,
  "TypeAcquisition"          VARCHAR(50),
  "PointsAcquis"             INTEGER NOT NULL,
  "PointsUtilises"           INTEGER DEFAULT 0,
  "SoldePoints"              INTEGER,
  "DateAcquisition"          TIMESTAMPTZ DEFAULT NOW(),
  "DateExpiration"           TIMESTAMPTZ,
  "IdentifiantSource"        INTEGER,
  "TypeSource"               VARCHAR(50),
  "Description"              VARCHAR(500),
  "EstExpire"                INTEGER NOT NULL,

  CONSTRAINT "FK_PointsFidelite_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IDX_Points_Date"         ON "PointsFidelite" ("DateAcquisition");
CREATE INDEX "IDX_Points_Expiration"   ON "PointsFidelite" ("DateExpiration");
CREATE INDEX "IDX_Points_Type"         ON "PointsFidelite" ("TypeAcquisition");
CREATE INDEX "IDX_Points_Utilisateur"  ON "PointsFidelite" ("IdentifiantUtilisateur");

-- ============================================================
-- 21. TABLE: ProgrammeParrainage
-- ============================================================
CREATE TABLE IF NOT EXISTS "ProgrammeParrainage" (
  "IdentifiantParrainage"          SERIAL PRIMARY KEY,
  "IdentifiantParrain"             INTEGER NOT NULL,
  "IdentifiantFilleul"             INTEGER,
  "CodeParrainage"                 VARCHAR(50) NOT NULL,
  "EmailFilleul"                   VARCHAR(255),
  "DateInvitation"                 TIMESTAMPTZ DEFAULT NOW(),
  "DateInscription"                TIMESTAMPTZ,
  "PointsParrain"                  INTEGER DEFAULT 0,
  "PointsFilleul"                  INTEGER DEFAULT 0,
  "RemiseParrain"                  DECIMAL(10,2) DEFAULT 0,
  "RemiseFilleul"                  DECIMAL(10,2) DEFAULT 0,
  "CommissionParrain"              DECIMAL(5,2),
  "StatutParrainage"               VARCHAR(20) DEFAULT 'EnAttente',
  "PremierAchatEffectue"           BOOLEAN DEFAULT FALSE,
  "DatePremierAchat"               TIMESTAMPTZ,
  "MontantPremierAchat"            DECIMAL(10,2),
  "RecompensesAttribuees"          BOOLEAN DEFAULT FALSE,
  "DateAttributionRecompenses"     TIMESTAMPTZ,

  CONSTRAINT "UQ_ProgrammeParrainage_Code" UNIQUE ("CodeParrainage"),
  CONSTRAINT "UQ_Parrain_Filleul" UNIQUE ("IdentifiantParrain", "IdentifiantFilleul"),

  CONSTRAINT "FK_Parrainage_Parrain"
    FOREIGN KEY ("IdentifiantParrain")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Parrainage_Filleul"
    FOREIGN KEY ("IdentifiantFilleul")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IDX_Parrainage_Code"     ON "ProgrammeParrainage" ("CodeParrainage");
CREATE INDEX "IDX_Parrainage_Filleul"  ON "ProgrammeParrainage" ("IdentifiantFilleul");
CREATE INDEX "IDX_Parrainage_Parrain"  ON "ProgrammeParrainage" ("IdentifiantParrain");
CREATE INDEX "IDX_Parrainage_Statut"   ON "ProgrammeParrainage" ("StatutParrainage");

-- ============================================================
-- 22. TABLE: Notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS "Notifications" (
  "IdentifiantNotification"  SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"   INTEGER NOT NULL,
  "TypeNotification"         VARCHAR(50) NOT NULL,
  "TitreNotification"        VARCHAR(255) NOT NULL,
  "MessageNotification"      TEXT NOT NULL,
  "LienNotification"         VARCHAR(500),
  "IconeNotification"        VARCHAR(50),
  "PrioriteNotification"     VARCHAR(20) DEFAULT 'Normal',
  "CanalEnvoi"               VARCHAR(20),
  "DateCreation"             TIMESTAMPTZ DEFAULT NOW(),
  "DateEnvoi"                TIMESTAMPTZ,
  "DateLecture"              TIMESTAMPTZ,
  "EstLu"                    BOOLEAN DEFAULT FALSE,
  "EstArchive"               BOOLEAN DEFAULT FALSE,
  "MetaDonnees"              TEXT,

  CONSTRAINT "FK_Notifications_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_Notifications_DateCreation" ON "Notifications" ("DateCreation");
CREATE INDEX "IX_Notifications_EstLu"        ON "Notifications" ("EstLu");
CREATE INDEX "IX_Notifications_Priorite"     ON "Notifications" ("PrioriteNotification");
CREATE INDEX "IX_Notifications_Type"         ON "Notifications" ("TypeNotification");
CREATE INDEX "IX_Notifications_Utilisateur"  ON "Notifications" ("IdentifiantUtilisateur");

-- ============================================================
-- 23. TABLE: Conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS "Conversations" (
  "IdentifiantConversation"    SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur1"    INTEGER NOT NULL,
  "IdentifiantUtilisateur2"    INTEGER NOT NULL,
  "IdentifiantReservation"     INTEGER,
  "IdentifiantVehicule"        INTEGER,
  "SujetConversation"          VARCHAR(255),
  "StatutConversation"         VARCHAR(20) DEFAULT 'Active',
  "DateCreation"               TIMESTAMPTZ DEFAULT NOW(),
  "DateDernierMessage"         TIMESTAMPTZ,
  "NombreMessages"             INTEGER DEFAULT 0,

  CONSTRAINT "FK_Conversations_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT "FK_Conversations_Utilisateur1"
    FOREIGN KEY ("IdentifiantUtilisateur1")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Conversations_Utilisateur2"
    FOREIGN KEY ("IdentifiantUtilisateur2")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Conversations_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_Conversations_Reservation"   ON "Conversations" ("IdentifiantReservation");
CREATE INDEX "IX_Conversations_Statut"        ON "Conversations" ("StatutConversation");
CREATE INDEX "IX_Conversations_Utilisateur1"  ON "Conversations" ("IdentifiantUtilisateur1");
CREATE INDEX "IX_Conversations_Utilisateur2"  ON "Conversations" ("IdentifiantUtilisateur2");

-- ============================================================
-- 24. TABLE: Messages
-- ============================================================
CREATE TABLE IF NOT EXISTS "Messages" (
  "IdentifiantMessage"       SERIAL PRIMARY KEY,
  "IdentifiantConversation"  INTEGER NOT NULL,
  "IdentifiantExpediteur"    INTEGER NOT NULL,
  "IdentifiantDestinataire"  INTEGER NOT NULL,
  "ContenuMessage"           TEXT NOT NULL,
  "TypeMessage"              VARCHAR(20) DEFAULT 'Texte',
  "PiecesJointes"            TEXT,
  "DateEnvoi"                TIMESTAMPTZ DEFAULT NOW(),
  "DateLecture"              TIMESTAMPTZ,
  "EstLu"                    BOOLEAN DEFAULT FALSE,
  "EstArchive"               BOOLEAN DEFAULT FALSE,
  "EstSupprime"              BOOLEAN DEFAULT FALSE,

  CONSTRAINT "FK_Messages_Conversation"
    FOREIGN KEY ("IdentifiantConversation")
    REFERENCES "Conversations" ("IdentifiantConversation")
    ON DELETE CASCADE ON UPDATE NO ACTION,

  CONSTRAINT "FK_Messages_Expediteur"
    FOREIGN KEY ("IdentifiantExpediteur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Messages_Destinataire"
    FOREIGN KEY ("IdentifiantDestinataire")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_Messages_Conversation"  ON "Messages" ("IdentifiantConversation");
CREATE INDEX "IX_Messages_DateEnvoi"     ON "Messages" ("DateEnvoi");
CREATE INDEX "IX_Messages_Destinataire"  ON "Messages" ("IdentifiantDestinataire");
CREATE INDEX "IX_Messages_EstLu"         ON "Messages" ("EstLu");
CREATE INDEX "IX_Messages_Expediteur"    ON "Messages" ("IdentifiantExpediteur");

-- ============================================================
-- 25. TABLE: Avis
-- ============================================================
CREATE TABLE IF NOT EXISTS "Avis" (
  "IdentifiantAvis"          SERIAL PRIMARY KEY,
  "IdentifiantReservation"   INTEGER NOT NULL,
  "IdentifiantAuteur"        INTEGER NOT NULL,
  "IdentifiantCible"         INTEGER NOT NULL,
  "TypeCible"                VARCHAR(20) NOT NULL,
  "NoteGlobale"              DECIMAL(3,2) NOT NULL,
  "NoteProprete"             DECIMAL(3,2),
  "NoteConformite"           DECIMAL(3,2),
  "NoteCommunication"        DECIMAL(3,2),
  "NoteEtatVehicule"         DECIMAL(3,2),
  "NoteRapportQualitePrix"   DECIMAL(3,2),
  "CommentaireAvis"          VARCHAR(2000),
  "PhotosAvis"               TEXT,
  "RecommandeCible"          BOOLEAN DEFAULT TRUE,
  "StatutAvis"               VARCHAR(20) DEFAULT 'Publie',
  "DateCreation"             TIMESTAMPTZ DEFAULT NOW(),
  "DateModification"         TIMESTAMPTZ,
  "NombreSignalements"       INTEGER DEFAULT 0,
  "NombreUtile"              INTEGER DEFAULT 0,
  "NombreInutile"            INTEGER DEFAULT 0,
  "ReponseProprietaire"      TEXT,
  "DateReponse"              TIMESTAMPTZ,

  CONSTRAINT "UQ_Avis_Reservation" UNIQUE ("IdentifiantReservation"),

  CONSTRAINT "FK_Avis_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Avis_Auteur"
    FOREIGN KEY ("IdentifiantAuteur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION
);

CREATE INDEX "IX_Avis_Auteur"       ON "Avis" ("IdentifiantAuteur");
CREATE INDEX "IX_Avis_Cible"        ON "Avis" ("IdentifiantCible", "TypeCible");
CREATE INDEX "IX_Avis_DateCreation" ON "Avis" ("DateCreation");
CREATE INDEX "IX_Avis_Note"         ON "Avis" ("NoteGlobale" DESC);
CREATE INDEX "IX_Avis_Reservation"  ON "Avis" ("IdentifiantReservation");
CREATE INDEX "IX_Avis_Statut"       ON "Avis" ("StatutAvis");

-- ============================================================
-- 26. TABLE: SignalementsAvis
-- ============================================================
CREATE TABLE IF NOT EXISTS "SignalementsAvis" (
  "IdentifiantSignalement"   SERIAL PRIMARY KEY,
  "IdentifiantAvis"          INTEGER NOT NULL,
  "IdentifiantSignaleur"     INTEGER NOT NULL,
  "MotifSignalement"         VARCHAR(50) NOT NULL,
  "DescriptionSignalement"   TEXT,
  "DateSignalement"          TIMESTAMPTZ DEFAULT NOW(),
  "StatutTraitement"         VARCHAR(20) DEFAULT 'EnAttente',
  "DateTraitement"           TIMESTAMPTZ,
  "TraitePar"                INTEGER,
  "CommentairesTraitement"   VARCHAR(500),

  CONSTRAINT "FK_SignalementsAvis_Avis"
    FOREIGN KEY ("IdentifiantAvis")
    REFERENCES "Avis" ("IdentifiantAvis")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_SignalementsAvis_Signaleur"
    FOREIGN KEY ("IdentifiantSignaleur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_SignalementsAvis_Traiteur"
    FOREIGN KEY ("TraitePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_SignalementsAvis_Avis"       ON "SignalementsAvis" ("IdentifiantAvis");
CREATE INDEX "IX_SignalementsAvis_Signaleur"  ON "SignalementsAvis" ("IdentifiantSignaleur");
CREATE INDEX "IX_SignalementsAvis_Statut"     ON "SignalementsAvis" ("StatutTraitement");

-- ============================================================
-- 27. TABLE: Reclamations
-- ============================================================
CREATE TABLE IF NOT EXISTS "Reclamations" (
  "IdentifiantReclamation"   SERIAL PRIMARY KEY,
  "NumeroReclamation"        VARCHAR(50) NOT NULL,
  "IdentifiantReservation"   INTEGER,
  "IdentifiantReclamant"     INTEGER NOT NULL,
  "TypeReclamation"          VARCHAR(50) NOT NULL,
  "CategorieReclamation"     VARCHAR(50),
  "SujetReclamation"         VARCHAR(255) NOT NULL,
  "DescriptionReclamation"   TEXT NOT NULL,
  "PieceJointes"             TEXT,
  "MontantReclame"           DECIMAL(10,2),
  "StatutReclamation"        VARCHAR(30) DEFAULT 'Ouverte',
  "PrioriteReclamation"      VARCHAR(20) DEFAULT 'Normal',
  "DateCreation"             TIMESTAMPTZ DEFAULT NOW(),
  "DateResolution"           TIMESTAMPTZ,
  "DateFermeture"            TIMESTAMPTZ,
  "AssigneA"                 INTEGER,
  "ReponseReclamation"       TEXT,
  "ActionsPrises"            TEXT,
  "MontantRembourse"         DECIMAL(10,2),
  "SatisfactionClient"       DECIMAL(3,2),

  CONSTRAINT "UQ_Reclamations_Numero" UNIQUE ("NumeroReclamation"),

  CONSTRAINT "FK_Reclamations_Reclamant"
    FOREIGN KEY ("IdentifiantReclamant")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Reclamations_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT "FK_Reclamations_Assignation"
    FOREIGN KEY ("AssigneA")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_Reclamations_DateCreation" ON "Reclamations" ("DateCreation");
CREATE INDEX "IX_Reclamations_Priorite"     ON "Reclamations" ("PrioriteReclamation");
CREATE INDEX "IX_Reclamations_Reclamant"    ON "Reclamations" ("IdentifiantReclamant");
CREATE INDEX "IX_Reclamations_Reservation"  ON "Reclamations" ("IdentifiantReservation");
CREATE INDEX "IX_Reclamations_Statut"       ON "Reclamations" ("StatutReclamation");
CREATE INDEX "IX_Reclamations_Type"         ON "Reclamations" ("TypeReclamation");

-- ============================================================
-- 28. TABLE: Incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS "Incidents" (
  "IdentifiantIncident"          SERIAL PRIMARY KEY,
  "NumeroIncident"               VARCHAR(50) NOT NULL,
  "IdentifiantReservation"       INTEGER NOT NULL,
  "IdentifiantVehicule"          INTEGER NOT NULL,
  "TypeIncident"                 VARCHAR(50) NOT NULL,
  "GraviteIncident"              VARCHAR(20) NOT NULL,
  "DescriptionIncident"          TEXT NOT NULL,
  "DateIncident"                 TIMESTAMPTZ NOT NULL,
  "LieuIncident"                 VARCHAR(500),
  "PhotosIncident"               TEXT,
  "RapportPolice"                VARCHAR(500),
  "NumeroConstat"                VARCHAR(100),
  "TierImplique"                 BOOLEAN DEFAULT FALSE,
  "InfoTiers"                    TEXT,
  "AssuranceNotifiee"            BOOLEAN DEFAULT FALSE,
  "DateNotificationAssurance"    TIMESTAMPTZ,
  "NumeroSinistre"               VARCHAR(100),
  "EstimationDommages"           DECIMAL(10,2),
  "CoutReparations"              DECIMAL(10,2),
  "ResponsabiliteLocataire"      BOOLEAN,
  "StatutTraitement"             VARCHAR(30) DEFAULT 'Declare',
  "DateDeclaration"              TIMESTAMPTZ DEFAULT NOW(),
  "DateResolution"               TIMESTAMPTZ,
  "TraitePar"                    INTEGER,
  "NotesTraitement"              TEXT,

  CONSTRAINT "UQ_Incidents_Numero" UNIQUE ("NumeroIncident"),

  CONSTRAINT "FK_Incidents_Reservation"
    FOREIGN KEY ("IdentifiantReservation")
    REFERENCES "Reservations" ("IdentifiantReservation")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Incidents_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON UPDATE NO ACTION,

  CONSTRAINT "FK_Incidents_Traiteur"
    FOREIGN KEY ("TraitePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_Incidents_DateIncident" ON "Incidents" ("DateIncident");
CREATE INDEX "IX_Incidents_Reservation"  ON "Incidents" ("IdentifiantReservation");
CREATE INDEX "IX_Incidents_Statut"       ON "Incidents" ("StatutTraitement");
CREATE INDEX "IX_Incidents_Type"         ON "Incidents" ("TypeIncident");
CREATE INDEX "IX_Incidents_Vehicule"     ON "Incidents" ("IdentifiantVehicule");

-- ============================================================
-- 29. TABLE: Favoris
-- ============================================================
CREATE TABLE IF NOT EXISTS "Favoris" (
  "IdentifiantFavori"        SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"   INTEGER NOT NULL,
  "IdentifiantVehicule"      INTEGER NOT NULL,
  "DateAjout"                TIMESTAMPTZ DEFAULT NOW(),
  "NotesPersonnelles"        VARCHAR(500),

  CONSTRAINT "UQ_Favoris_Utilisateur_Vehicule" UNIQUE ("IdentifiantUtilisateur", "IdentifiantVehicule"),

  CONSTRAINT "FK_Favoris_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION,

  CONSTRAINT "FK_Favoris_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_Favoris_DateAjout"     ON "Favoris" ("DateAjout");
CREATE INDEX "IX_Favoris_Utilisateur"   ON "Favoris" ("IdentifiantUtilisateur");
CREATE INDEX "IX_Favoris_Vehicule"      ON "Favoris" ("IdentifiantVehicule");

-- ============================================================
-- 30. TABLE: RecherchesSauvegardees
-- ============================================================
CREATE TABLE IF NOT EXISTS "RecherchesSauvegardees" (
  "IdentifiantRecherche"      SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"    INTEGER NOT NULL,
  "NomRecherche"              VARCHAR(200) NOT NULL,
  "CriteresRecherche"         TEXT NOT NULL,
  "NotificationsActives"      BOOLEAN DEFAULT TRUE,
  "FrequenceNotifications"    VARCHAR(20),
  "DateCreation"              TIMESTAMPTZ DEFAULT NOW(),
  "DateDerniereUtilisation"   TIMESTAMPTZ,
  "NombreUtilisations"        INTEGER DEFAULT 0,

  CONSTRAINT "FK_RecherchesSauvegardees_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IX_RecherchesSauvegardees_DateCreation"  ON "RecherchesSauvegardees" ("DateCreation");
CREATE INDEX "IX_RecherchesSauvegardees_Utilisateur"   ON "RecherchesSauvegardees" ("IdentifiantUtilisateur");

-- ============================================================
-- 31. TABLE: ReglesTarificationDynamique
-- ============================================================
CREATE TABLE IF NOT EXISTS "ReglesTarificationDynamique" (
  "IdentifiantRegle"      SERIAL PRIMARY KEY,
  "IdentifiantVehicule"   INTEGER NOT NULL,
  "TypeCondition"         VARCHAR(50),
  "ValeurCondition"       VARCHAR(200),
  "TypeModificateur"      VARCHAR(20),
  "ValeurModificateur"    DECIMAL(10,2) NOT NULL,
  "Operation"             VARCHAR(10),
  "PrixMinimum"           DECIMAL(10,2),
  "PrixMaximum"           DECIMAL(10,2),
  "DateDebut"             TIMESTAMPTZ NOT NULL,
  "DateFin"               TIMESTAMPTZ,
  "HeureDebut"            TIME,
  "HeureFin"              TIME,
  "JoursSemaine"          VARCHAR(50),
  "Priorite"              INTEGER DEFAULT 0,
  "Actif"                 BOOLEAN DEFAULT TRUE,
  "Description"           VARCHAR(500),

  CONSTRAINT "FK_RegleTarification_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IDX_ReglesTarification_Actif"      ON "ReglesTarificationDynamique" ("Actif");
CREATE INDEX "IDX_ReglesTarification_Dates"      ON "ReglesTarificationDynamique" ("DateDebut", "DateFin");
CREATE INDEX "IDX_ReglesTarification_Priorite"   ON "ReglesTarificationDynamique" ("Priorite" DESC);
CREATE INDEX "IDX_ReglesTarification_Vehicule"   ON "ReglesTarificationDynamique" ("IdentifiantVehicule");

-- ============================================================
-- 32. TABLE: HistoriquePrixVehicules
-- ============================================================
CREATE TABLE IF NOT EXISTS "HistoriquePrixVehicules" (
  "IdentifiantHistorique"  BIGSERIAL PRIMARY KEY,
  "IdentifiantVehicule"    INTEGER NOT NULL,
  "PrixJournalier"         DECIMAL(10,2) NOT NULL,
  "PrixHebdomadaire"       DECIMAL(10,2),
  "PrixMensuel"            DECIMAL(10,2),
  "FacteursInfluence"      TEXT,
  "TauxOccupation"         DECIMAL(5,2),
  "DemandePrevue"          DECIMAL(5,2),
  "SaisonTouristique"      VARCHAR(50),
  "EvenementsLocaux"       TEXT,
  "DateApplication"        TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_HistoriquePrix_Vehicule"
    FOREIGN KEY ("IdentifiantVehicule")
    REFERENCES "Vehicules" ("IdentifiantVehicule")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IDX_HistoriquePrix_Vehicule_Date" ON "HistoriquePrixVehicules" ("IdentifiantVehicule", "DateApplication");

-- ============================================================
-- 33. TABLE: AggregationsUtilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "AggregationsUtilisateurs" (
  "IdentifiantAggregation"         SERIAL PRIMARY KEY,
  "IdentifiantUtilisateur"         INTEGER NOT NULL,
  "NombreReservationsTotal"        INTEGER DEFAULT 0,
  "NombreReservationsConfirmees"   INTEGER DEFAULT 0,
  "NombreReservationsAnnulees"     INTEGER DEFAULT 0,
  "TauxAnnulation"                 DOUBLE PRECISION,
  "DureeTotalLocations"            INTEGER DEFAULT 0,
  "MontantTotalDepense"            DECIMAL(15,2) DEFAULT 0,
  "MontantMoyenReservation"        DECIMAL(26,13),
  "NoteMoyenneDonnee"              DECIMAL(3,2),
  "NoteMoyenneRecue"               DECIMAL(3,2),
  "NombreAvisDonnes"               INTEGER DEFAULT 0,
  "NombreAvisRecus"                INTEGER DEFAULT 0,
  "DerniereReservationDate"        TIMESTAMPTZ,
  "DerniereConnexionDate"          TIMESTAMPTZ,
  "DernierPaiementDate"            TIMESTAMPTZ,
  "CategoriePreferee"              INTEGER,
  "VillePreferee"                  VARCHAR(100),
  "MarquePreferee"                 INTEGER,
  "BudgetMoyen"                    DECIMAL(10,2),
  "DureeMoyenneLocation"           INTEGER,
  "TauxReponse"                    DECIMAL(5,2),
  "DelaiMoyenReponse"              INTEGER,
  "TauxConfirmation"               DECIMAL(5,2),
  "DateCalcul"                     TIMESTAMPTZ DEFAULT NOW(),
  "DateMiseAJour"                  TIMESTAMPTZ,

  CONSTRAINT "UQ_AggregationsUtilisateurs_Utilisateur" UNIQUE ("IdentifiantUtilisateur"),

  CONSTRAINT "FK_Aggregation_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "IDX_Aggregations_Calcul"     ON "AggregationsUtilisateurs" ("DateCalcul");
CREATE INDEX "IDX_Aggregations_MiseAJour"  ON "AggregationsUtilisateurs" ("DateMiseAJour");

-- ============================================================
-- 34. TABLE: A_B_Tests
-- ============================================================
CREATE TABLE IF NOT EXISTS "A_B_Tests" (
  "IdentifiantTest"          SERIAL PRIMARY KEY,
  "CodeTest"                 VARCHAR(100) NOT NULL,
  "NomTest"                  VARCHAR(100) NOT NULL,
  "DescriptionTest"          TEXT,
  "ObjectifTest"             VARCHAR(500),
  "HypotheseTest"            TEXT,
  "MetriquePrincipale"       VARCHAR(100),
  "PopulationCible"          TEXT,
  "TailleEchantillon"        INTEGER,
  "PourcentageVarianteA"     INTEGER DEFAULT 50,
  "PourcentageVarianteB"     INTEGER DEFAULT 50,
  "VarianteA"                TEXT,
  "VarianteB"                TEXT,
  "DateDebut"                TIMESTAMPTZ,
  "DateFin"                  TIMESTAMPTZ,
  "DureeMinimaleJours"       INTEGER DEFAULT 7,
  "StatutTest"               VARCHAR(20) DEFAULT 'Brouillon',
  "ParticipantsVarianteA"    INTEGER DEFAULT 0,
  "ParticipantsVarianteB"    INTEGER DEFAULT 0,
  "ConversionsVarianteA"     INTEGER DEFAULT 0,
  "ConversionsVarianteB"     INTEGER DEFAULT 0,
  "TauxConversionA"          DOUBLE PRECISION,
  "TauxConversionB"          DOUBLE PRECISION,
  "SignificanceStatistique"  DECIMAL(5,4),
  "VarianteGagnante"         VARCHAR(1),
  "Resultats"                TEXT,
  "CreePar"                  INTEGER,
  "DateCreation"             TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "UQ_ABTests_Code" UNIQUE ("CodeTest"),

  CONSTRAINT "FK_ABTests_Createur"
    FOREIGN KEY ("CreePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IDX_ABTests_Code"    ON "A_B_Tests" ("CodeTest");
CREATE INDEX "IDX_ABTests_Dates"   ON "A_B_Tests" ("DateDebut", "DateFin");
CREATE INDEX "IDX_ABTests_Statut"  ON "A_B_Tests" ("StatutTest");

-- ============================================================
-- 35. TABLE: CacheRecherches
-- ============================================================
CREATE TABLE IF NOT EXISTS "CacheRecherches" (
  "IdentifiantCache"       SERIAL PRIMARY KEY,
  "CleCache"               VARCHAR(500) NOT NULL,
  "Resultats"              TEXT NOT NULL,
  "NombreResultats"        INTEGER NOT NULL,
  "DateCreation"           TIMESTAMPTZ DEFAULT NOW(),
  "DateExpiration"         TIMESTAMPTZ NOT NULL,
  "CompteUtilisations"     INTEGER DEFAULT 0,
  "DerniereUtilisation"    TIMESTAMPTZ,
  "ParametresRecherche"    TEXT,

  CONSTRAINT "UQ_CacheRecherches_Cle" UNIQUE ("CleCache")
);

CREATE INDEX "IDX_Cache_DerniereUtilisation" ON "CacheRecherches" ("DerniereUtilisation" DESC);
CREATE INDEX "IDX_Cache_Expiration"          ON "CacheRecherches" ("DateExpiration");
CREATE INDEX "IDX_Cache_Utilisations"        ON "CacheRecherches" ("CompteUtilisations" DESC);

-- ============================================================
-- 36. TABLE: CacheStatistiques
-- ============================================================
CREATE TABLE IF NOT EXISTS "CacheStatistiques" (
  "IdentifiantStatCache"    SERIAL PRIMARY KEY,
  "TypeCache"               VARCHAR(50) NOT NULL,
  "Periode"                 VARCHAR(20),
  "RequetesTotal"           INTEGER DEFAULT 0,
  "RequetesCache"           INTEGER DEFAULT 0,
  "RequetesMiss"            INTEGER DEFAULT 0,
  "TauxReussite"            DOUBLE PRECISION,
  "TempsMoyenSansCache"     DECIMAL(10,4),
  "TempsMoyenAvecCache"     DECIMAL(10,4),
  "GainPerformance"         DECIMAL(30,15),
  "DateDebut"               TIMESTAMPTZ NOT NULL,
  "DateFin"                 TIMESTAMPTZ NOT NULL,
  "DateCalcul"              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX "IDX_StatCache_Date" ON "CacheStatistiques" ("DateCalcul");
CREATE INDEX "IDX_StatCache_Type" ON "CacheStatistiques" ("TypeCache");

-- ============================================================
-- 37. TABLE: ConfigurationBusinessRules
-- ============================================================
CREATE TABLE IF NOT EXISTS "ConfigurationBusinessRules" (
  "IdentifiantRegle"        SERIAL PRIMARY KEY,
  "CodeRegle"               VARCHAR(100) NOT NULL,
  "TypeRegle"               VARCHAR(100) NOT NULL,
  "NomRegle"                VARCHAR(200) NOT NULL,
  "DescriptionRegle"        TEXT,
  "Conditions"              TEXT NOT NULL,
  "Actions"                 TEXT NOT NULL,
  "Priorite"                INTEGER DEFAULT 0,
  "Actif"                   BOOLEAN DEFAULT TRUE,
  "DateDebut"               TIMESTAMPTZ DEFAULT NOW(),
  "DateFin"                 TIMESTAMPTZ,
  "CreePar"                 INTEGER,
  "DateCreation"            TIMESTAMPTZ DEFAULT NOW(),
  "ModifiePar"              INTEGER,
  "DateModification"        TIMESTAMPTZ,
  "NombreExecutions"        INTEGER DEFAULT 0,
  "DateDerniereExecution"   TIMESTAMPTZ,

  CONSTRAINT "UQ_ConfigurationBusinessRules_Code" UNIQUE ("CodeRegle"),

  CONSTRAINT "FK_BusinessRules_Createur"
    FOREIGN KEY ("CreePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT "FK_BusinessRules_Modificateur"
    FOREIGN KEY ("ModifiePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IDX_BusinessRules_Actif"     ON "ConfigurationBusinessRules" ("Actif");
CREATE INDEX "IDX_BusinessRules_Code"      ON "ConfigurationBusinessRules" ("CodeRegle");
CREATE INDEX "IDX_BusinessRules_Priorite"  ON "ConfigurationBusinessRules" ("Priorite" DESC);
CREATE INDEX "IDX_BusinessRules_Type"      ON "ConfigurationBusinessRules" ("TypeRegle");

-- ============================================================
-- 38. TABLE: DeclencheursNotifications
-- ============================================================
CREATE TABLE IF NOT EXISTS "TemplatesNotifications" (
  "IdentifiantTemplate"    SERIAL PRIMARY KEY,
  "TypeNotification"       VARCHAR(100) NOT NULL,
  "NomTemplate"            VARCHAR(200) NOT NULL,
  "TitreTemplate"          VARCHAR(255) NOT NULL,
  "CorpsTemplate"          TEXT NOT NULL,
  "CorpsHTML"              TEXT,
  "CorpsSMS"               VARCHAR(500),
  "VariablesDisponibles"   TEXT,
  "CanauxDisponibles"      TEXT,
  "Categorie"              VARCHAR(50),
  "Langue"                 VARCHAR(10) DEFAULT 'fr',
  "DateCreation"           TIMESTAMPTZ DEFAULT NOW(),
  "DateModification"       TIMESTAMPTZ,
  "Actif"                  BOOLEAN DEFAULT TRUE,

  CONSTRAINT "UQ_TemplatesNotifications_Type" UNIQUE ("TypeNotification")
);

CREATE INDEX "IDX_Templates_Actif"      ON "TemplatesNotifications" ("Actif");
CREATE INDEX "IDX_Templates_Categorie"  ON "TemplatesNotifications" ("Categorie");
CREATE INDEX "IDX_Templates_Type"       ON "TemplatesNotifications" ("TypeNotification");

CREATE TABLE IF NOT EXISTS "DeclencheursNotifications" (
  "IdentifiantDeclencheur"  SERIAL PRIMARY KEY,
  "TypeDeclencheur"         VARCHAR(100) NOT NULL,
  "NomDeclencheur"          VARCHAR(200) NOT NULL,
  "IdentifiantTemplate"     INTEGER NOT NULL,
  "DelaiMinutes"            INTEGER DEFAULT 0,
  "Conditions"              TEXT,
  "Actif"                   BOOLEAN DEFAULT TRUE,
  "Priorite"                INTEGER DEFAULT 5,
  "DateCreation"            TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "FK_Declencheur_Template"
    FOREIGN KEY ("IdentifiantTemplate")
    REFERENCES "TemplatesNotifications" ("IdentifiantTemplate")
    ON UPDATE NO ACTION
);

CREATE INDEX "IDX_Declencheurs_Actif"     ON "DeclencheursNotifications" ("Actif");
CREATE INDEX "IDX_Declencheurs_Priorite"  ON "DeclencheursNotifications" ("Priorite" DESC);
CREATE INDEX "IDX_Declencheurs_Type"      ON "DeclencheursNotifications" ("TypeDeclencheur");

-- ============================================================
-- 39. TABLE: DistancesPrecalculees
-- ============================================================
CREATE TABLE IF NOT EXISTS "DistancesPrecalculees" (
  "IdentifiantOrigine"      INTEGER NOT NULL,
  "IdentifiantDestination"  INTEGER NOT NULL,
  "DistanceMetres"          INTEGER NOT NULL,
  "DureeMinutes"            INTEGER NOT NULL,
  "DateCalcul"              TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY ("IdentifiantOrigine", "IdentifiantDestination")
);

CREATE INDEX "IDX_Distances_Destination" ON "DistancesPrecalculees" ("IdentifiantDestination");
CREATE INDEX "IDX_Distances_Origine"     ON "DistancesPrecalculees" ("IdentifiantOrigine");

-- ============================================================
-- 40. TABLE: DonneesChiffrees
-- ============================================================
CREATE TABLE IF NOT EXISTS "DonneesChiffrees" (
  "IdentifiantChiffrement"  SERIAL PRIMARY KEY,
  "TableOrigine"            VARCHAR(100) NOT NULL,
  "ColonneOrigine"          VARCHAR(100) NOT NULL,
  "IdentifiantLigne"        INTEGER NOT NULL,
  "DonneesChiffrees"        BYTEA NOT NULL,
  "Algorithme"              VARCHAR(50) DEFAULT 'AES_256',
  "VecteurInitialisation"   BYTEA,
  "DateChiffrement"         TIMESTAMPTZ DEFAULT NOW(),
  "ChiffrePar"              INTEGER,

  CONSTRAINT "FK_DonneesChiffrees_Utilisateur"
    FOREIGN KEY ("ChiffrePar")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IDX_Chiffrement_Origine" ON "DonneesChiffrees" ("TableOrigine", "ColonneOrigine", "IdentifiantLigne");

-- ============================================================
-- 41. TABLE: JournalAudit
-- ============================================================
CREATE TABLE IF NOT EXISTS "JournalAudit" (
  "IdentifiantAudit"         BIGSERIAL PRIMARY KEY,
  "TypeAction"               VARCHAR(50) NOT NULL,
  "TableCible"               VARCHAR(100) NOT NULL,
  "IdentifiantLigne"         INTEGER NOT NULL,
  "IdentifiantUtilisateur"   INTEGER,
  "ActionEffectuee"          VARCHAR(20),
  "ValeursPrecedentes"       TEXT,
  "NouvellesValeurs"         TEXT,
  "AdresseIP"                VARCHAR(45),
  "UserAgent"                VARCHAR(500),
  "DateAction"               TIMESTAMPTZ DEFAULT NOW(),
  "DetailsSupplementaires"   TEXT,

  CONSTRAINT "FK_JournalAudit_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_JournalAudit_DateAction"    ON "JournalAudit" ("DateAction");
CREATE INDEX "IX_JournalAudit_Table"         ON "JournalAudit" ("TableCible");
CREATE INDEX "IX_JournalAudit_TypeAction"    ON "JournalAudit" ("TypeAction");
CREATE INDEX "IX_JournalAudit_Utilisateur"   ON "JournalAudit" ("IdentifiantUtilisateur");

-- ============================================================
-- 42. TABLE: LogsErreurs
-- ============================================================
CREATE TABLE IF NOT EXISTS "LogsErreurs" (
  "IdentifiantLog"           BIGSERIAL PRIMARY KEY,
  "TypeErreur"               VARCHAR(50) NOT NULL,
  "MessageErreur"            TEXT NOT NULL,
  "StackTrace"               TEXT,
  "Gravite"                  VARCHAR(20),
  "IdentifiantUtilisateur"   INTEGER,
  "URL"                      VARCHAR(500),
  "MethodeHTTP"              VARCHAR(10),
  "AdresseIP"                VARCHAR(45),
  "UserAgent"                VARCHAR(500),
  "DateErreur"               TIMESTAMPTZ DEFAULT NOW(),
  "Environnement"            VARCHAR(20),
  "Version"                  VARCHAR(20),
  "EstResolu"                BOOLEAN DEFAULT FALSE,
  "DateResolution"           TIMESTAMPTZ,

  CONSTRAINT "FK_LogsErreurs_Utilisateur"
    FOREIGN KEY ("IdentifiantUtilisateur")
    REFERENCES "Utilisateurs" ("IdentifiantUtilisateur")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IX_LogsErreurs_DateErreur"  ON "LogsErreurs" ("DateErreur");
CREATE INDEX "IX_LogsErreurs_EstResolu"   ON "LogsErreurs" ("EstResolu");
CREATE INDEX "IX_LogsErreurs_Gravite"     ON "LogsErreurs" ("Gravite");
CREATE INDEX "IX_LogsErreurs_TypeErreur"  ON "LogsErreurs" ("TypeErreur");

-- ============================================================
-- 43. TABLE: ZonesGeographiques
-- ============================================================
CREATE TABLE IF NOT EXISTS "ZonesGeographiques" (
  "IdentifiantZone"      SERIAL PRIMARY KEY,
  "NomZone"              VARCHAR(100) NOT NULL,
  "TypeZone"             VARCHAR(50),
  "ParentZone"           INTEGER,
  "GeoJSON"              TEXT,
  "CentroidLatitude"     DECIMAL(10,8),
  "CentroidLongitude"    DECIMAL(11,8),
  "RayonMetres"          INTEGER,
  "NombreVehicules"      INTEGER DEFAULT 0,
  "PrixMoyen"            DECIMAL(10,2),
  "Popularite"           INTEGER DEFAULT 0,
  "DateCreation"         TIMESTAMPTZ DEFAULT NOW(),
  "DateMiseAJour"        TIMESTAMPTZ,

  CONSTRAINT "FK_Zones_Parent"
    FOREIGN KEY ("ParentZone")
    REFERENCES "ZonesGeographiques" ("IdentifiantZone")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "IDX_Zones_Geospatial"  ON "ZonesGeographiques" ("CentroidLatitude", "CentroidLongitude");
CREATE INDEX "IDX_Zones_Popularite"  ON "ZonesGeographiques" ("Popularite" DESC);
CREATE INDEX "IDX_Zones_Type"        ON "ZonesGeographiques" ("TypeZone");

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
-- Notes de compatibilite Supabase/PostgreSQL :
--
-- 1. Les colonnes "geography" de SQL Server ont ete remplacees par
--    des paires Latitude/Longitude en DECIMAL. Si vous avez besoin
--    de requetes geospatiales avancees, activez PostGIS :
--      CREATE EXTENSION IF NOT EXISTS postgis;
--    et ajoutez des colonnes de type geography/geometry.
--
-- 2. Les types NVARCHAR(MAX) sont convertis en TEXT (illimite en PG).
--
-- 3. Les types VARBINARY sont convertis en BYTEA.
--
-- 4. sysdatetime() est remplace par NOW() (TIMESTAMPTZ).
--
-- 5. Les types FLOAT de SQL Server sont convertis en DOUBLE PRECISION.
--
-- 6. Les types BIT sont convertis en BOOLEAN.
--
-- 7. IDENTITY(1,1) est remplace par SERIAL / BIGSERIAL.
--
-- 8. Les index DESC sont supportes nativement par PostgreSQL.
--
-- 9. Le fuseau horaire par defaut est UTC dans Supabase.
--    Utilisez TIMESTAMPTZ pour les horodatages avec fuseau.
-- ============================================================
