BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Utilisateurs] (
    [IdentifiantUtilisateur] INT NOT NULL IDENTITY(1,1),
    [Nom] NVARCHAR(100) NOT NULL,
    [Prenom] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL,
    [MotDePasse] NVARCHAR(255) NOT NULL,
    [NumeroTelephone] NVARCHAR(20),
    [DateNaissance] DATE,
    [PhotoProfil] NVARCHAR(500),
    [TypeUtilisateur] NVARCHAR(20) NOT NULL,
    [StatutCompte] NVARCHAR(20) CONSTRAINT [DF__Utilisate__Statu__60C757A0] DEFAULT 'Actif',
    [EmailVerifie] BIT CONSTRAINT [DF__Utilisate__Email__62AFA012] DEFAULT 0,
    [TelephoneVerifie] BIT CONSTRAINT [DF__Utilisate__Telep__63A3C44B] DEFAULT 0,
    [DateInscription] DATETIME2 CONSTRAINT [DF__Utilisate__DateI__6497E884] DEFAULT sysdatetime(),
    [DerniereConnexion] DATETIME2,
    [AdresseIP] NVARCHAR(45),
    [DeviceInfo] NVARCHAR(500),
    [LanguePreferee] NVARCHAR(10) CONSTRAINT [DF__Utilisate__Langu__658C0CBD] DEFAULT 'fr',
    [DevisePreferee] NVARCHAR(3) CONSTRAINT [DF__Utilisate__Devis__668030F6] DEFAULT 'XOF',
    [BiographieUtilisateur] NVARCHAR(1000),
    [SiteWeb] NVARCHAR(255),
    [ReseauxSociaux] NVARCHAR(max),
    [NotesUtilisateur] DECIMAL(3,2) CONSTRAINT [DF__Utilisate__Notes__6774552F] DEFAULT 0.00,
    [NombreReservationsEffectuees] INT CONSTRAINT [DF__Utilisate__Nombr__68687968] DEFAULT 0,
    [NombreVehiculesLoues] INT CONSTRAINT [DF__Utilisate__Nombr__695C9DA1] DEFAULT 0,
    [MembreDepuis] INT,
    [NiveauFidelite] NVARCHAR(20) CONSTRAINT [DF__Utilisate__Nivea__6A50C1DA] DEFAULT 'BRONZE',
    [PointsFideliteTotal] INT CONSTRAINT [DF__Utilisate__Point__6C390A4C] DEFAULT 0,
    CONSTRAINT [PK__Utilisat__09949E0ACD734A76] PRIMARY KEY CLUSTERED ([IdentifiantUtilisateur]),
    CONSTRAINT [UQ__Utilisat__A9D1053461132646] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[AdressesUtilisateurs] (
    [IdentifiantAdresse] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [TypeAdresse] NVARCHAR(20) NOT NULL,
    [AdresseLigne1] NVARCHAR(255) NOT NULL,
    [AdresseLigne2] NVARCHAR(255),
    [Ville] NVARCHAR(100) NOT NULL,
    [Region] NVARCHAR(100),
    [CodePostal] NVARCHAR(20),
    [Pays] NVARCHAR(100) NOT NULL CONSTRAINT [DF__AdressesUt__Pays__70099B30] DEFAULT 'Sénégal',
    [Coordonnees] geography,
    [Latitude] DECIMAL(10,8),
    [Longitude] DECIMAL(11,8),
    [EstAdressePrincipale] BIT CONSTRAINT [DF__AdressesU__EstAd__70FDBF69] DEFAULT 0,
    [DateAjout] DATETIME2 CONSTRAINT [DF__AdressesU__DateA__71F1E3A2] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Adresses__F8B1C87D0553ED44] PRIMARY KEY CLUSTERED ([IdentifiantAdresse])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentsUtilisateurs] (
    [IdentifiantDocument] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [TypeDocument] NVARCHAR(50) NOT NULL,
    [NomFichier] NVARCHAR(255) NOT NULL,
    [CheminFichier] NVARCHAR(500) NOT NULL,
    [TailleFichier] BIGINT,
    [FormatFichier] NVARCHAR(10),
    [NumeroDocument] NVARCHAR(100),
    [DateExpiration] DATE,
    [StatutVerification] NVARCHAR(20) CONSTRAINT [DF__Documents__Statu__77AABCF8] DEFAULT 'EnAttente',
    [DateTeleversement] DATETIME2 CONSTRAINT [DF__Documents__DateT__7993056A] DEFAULT sysdatetime(),
    [DateVerification] DATETIME2,
    [VerifiePar] INT,
    [CommentairesVerification] NVARCHAR(500),
    [HashFichier] VARBINARY(64),
    CONSTRAINT [PK__Document__38CFE10DE9A823E4] PRIMARY KEY CLUSTERED ([IdentifiantDocument])
);

-- CreateTable
CREATE TABLE [dbo].[PreferencesUtilisateurs] (
    [IdentifiantPreference] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [NotificationsEmail] BIT CONSTRAINT [DF__Preferenc__Notif__7F4BDEC0] DEFAULT 1,
    [NotificationsSMS] BIT CONSTRAINT [DF__Preferenc__Notif__004002F9] DEFAULT 1,
    [NotificationsPush] BIT CONSTRAINT [DF__Preferenc__Notif__01342732] DEFAULT 1,
    [NotificationsReservations] BIT CONSTRAINT [DF__Preferenc__Notif__02284B6B] DEFAULT 1,
    [NotificationsPromotions] BIT CONSTRAINT [DF__Preferenc__Notif__031C6FA4] DEFAULT 0,
    [NotificationsMessages] BIT CONSTRAINT [DF__Preferenc__Notif__041093DD] DEFAULT 1,
    [NotificationsAvis] BIT CONSTRAINT [DF__Preferenc__Notif__0504B816] DEFAULT 1,
    [ModeTheme] NVARCHAR(10) CONSTRAINT [DF__Preferenc__ModeT__05F8DC4F] DEFAULT 'Clair',
    [AffichageMonnaie] NVARCHAR(3) CONSTRAINT [DF__Preferenc__Affic__07E124C1] DEFAULT 'XOF',
    [FormatDate] NVARCHAR(20) CONSTRAINT [DF__Preferenc__Forma__08D548FA] DEFAULT 'DD/MM/YYYY',
    [FuseauHoraire] NVARCHAR(50) CONSTRAINT [DF__Preferenc__Fusea__09C96D33] DEFAULT 'Africa/Dakar',
    [VisibiliteProfile] NVARCHAR(20) CONSTRAINT [DF__Preferenc__Visib__0ABD916C] DEFAULT 'Public',
    [AfficherNumeroTelephone] BIT CONSTRAINT [DF__Preferenc__Affic__0CA5D9DE] DEFAULT 0,
    [AfficherEmail] BIT CONSTRAINT [DF__Preferenc__Affic__0D99FE17] DEFAULT 0,
    [AutoriserMessages] BIT CONSTRAINT [DF__Preferenc__Autor__0E8E2250] DEFAULT 1,
    [DateMiseAJour] DATETIME2 CONSTRAINT [DF__Preferenc__DateM__0F824689] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Preferen__32DC3CF312BFC28D] PRIMARY KEY CLUSTERED ([IdentifiantPreference]),
    CONSTRAINT [UQ__Preferen__09949E0B443D7399] UNIQUE NONCLUSTERED ([IdentifiantUtilisateur])
);

-- CreateTable
CREATE TABLE [dbo].[TentativesConnexion] (
    [IdentifiantTentative] INT NOT NULL IDENTITY(1,1),
    [AdresseEmail] NVARCHAR(150) NOT NULL,
    [AdresseIP] NVARCHAR(50) NOT NULL,
    [Reussie] BIT CONSTRAINT [DF__Tentative__Reuss__1352D76D] DEFAULT 0,
    [CodeErreur] NVARCHAR(50),
    [MotifEchec] NVARCHAR(255),
    [DateTentative] DATETIME2 CONSTRAINT [DF__Tentative__DateT__1446FBA6] DEFAULT sysdatetime(),
    [UserAgent] NVARCHAR(500),
    [Pays] NVARCHAR(100),
    CONSTRAINT [PK__Tentativ__2A4B69DE3E8297C5] PRIMARY KEY CLUSTERED ([IdentifiantTentative])
);

-- CreateTable
CREATE TABLE [dbo].[CategoriesVehicules] (
    [IdentifiantCategorie] INT NOT NULL IDENTITY(1,1),
    [NomCategorie] NVARCHAR(100) NOT NULL,
    [DescriptionCategorie] NVARCHAR(500),
    [IconeCategorie] NVARCHAR(255),
    [OrdreAffichage] INT CONSTRAINT [DF__Categorie__Ordre__1CDC41A7] DEFAULT 0,
    [EstActif] BIT CONSTRAINT [DF__Categorie__EstAc__1DD065E0] DEFAULT 1,
    [DateCreation] DATETIME2 CONSTRAINT [DF__Categorie__DateC__1EC48A19] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Categori__AF28A876F87C4D44] PRIMARY KEY CLUSTERED ([IdentifiantCategorie]),
    CONSTRAINT [UQ__Categori__9A363C718DD65B2C] UNIQUE NONCLUSTERED ([NomCategorie])
);

-- CreateTable
CREATE TABLE [dbo].[MarquesVehicules] (
    [IdentifiantMarque] INT NOT NULL IDENTITY(1,1),
    [NomMarque] NVARCHAR(100) NOT NULL,
    [LogoMarque] NVARCHAR(255),
    [PaysOrigine] NVARCHAR(100),
    [SiteWeb] NVARCHAR(255),
    [EstPopulaire] BIT CONSTRAINT [DF__MarquesVe__EstPo__22951AFD] DEFAULT 0,
    [DateAjout] DATETIME2 CONSTRAINT [DF__MarquesVe__DateA__23893F36] DEFAULT sysdatetime(),
    CONSTRAINT [PK__MarquesV__DE7A25BE2B14DAB4] PRIMARY KEY CLUSTERED ([IdentifiantMarque]),
    CONSTRAINT [UQ__MarquesV__B430BC379A4C5934] UNIQUE NONCLUSTERED ([NomMarque])
);

-- CreateTable
CREATE TABLE [dbo].[ModelesVehicules] (
    [IdentifiantModele] INT NOT NULL IDENTITY(1,1),
    [IdentifiantMarque] INT NOT NULL,
    [NomModele] NVARCHAR(100) NOT NULL,
    [AnneeDebut] INT,
    [AnneeFin] INT,
    [TypeCarburant] NVARCHAR(50),
    [TypeTransmission] NVARCHAR(50),
    [NombrePlaces] INT,
    [NombrePortes] INT,
    [CapaciteCoffre] INT,
    [ConsommationMoyenne] DECIMAL(5,2),
    [ImageModele] NVARCHAR(255),
    [DateAjout] DATETIME2 CONSTRAINT [DF__ModelesVe__DateA__284DF453] DEFAULT sysdatetime(),
    CONSTRAINT [PK__ModelesV__6F390477CD7555DA] PRIMARY KEY CLUSTERED ([IdentifiantModele])
);

-- CreateTable
CREATE TABLE [dbo].[Vehicules] (
    [IdentifiantVehicule] INT NOT NULL IDENTITY(1,1),
    [IdentifiantProprietaire] INT NOT NULL,
    [IdentifiantCategorie] INT NOT NULL,
    [IdentifiantModele] INT NOT NULL,
    [TitreAnnonce] NVARCHAR(200) NOT NULL,
    [DescriptionVehicule] NVARCHAR(max),
    [Immatriculation] NVARCHAR(50),
    [Annee] INT NOT NULL,
    [Couleur] NVARCHAR(50),
    [Kilometrage] INT CONSTRAINT [DF__Vehicules__Kilom__2EFAF1E2] DEFAULT 0,
    [NumeroChassisVIN] NVARCHAR(50),
    [NombrePlaces] INT NOT NULL,
    [TypeCarburant] NVARCHAR(50) NOT NULL,
    [TypeTransmission] NVARCHAR(50) NOT NULL,
    [Climatisation] BIT CONSTRAINT [DF__Vehicules__Clima__2FEF161B] DEFAULT 0,
    [GPS] BIT CONSTRAINT [DF__Vehicules__GPS__30E33A54] DEFAULT 0,
    [Bluetooth] BIT CONSTRAINT [DF__Vehicules__Bluet__31D75E8D] DEFAULT 0,
    [CameraRecul] BIT CONSTRAINT [DF__Vehicules__Camer__32CB82C6] DEFAULT 0,
    [SiegesEnCuir] BIT CONSTRAINT [DF__Vehicules__Siege__33BFA6FF] DEFAULT 0,
    [ToitOuvrant] BIT CONSTRAINT [DF__Vehicules__ToitO__34B3CB38] DEFAULT 0,
    [RegulateursVitesse] BIT CONSTRAINT [DF__Vehicules__Regul__35A7EF71] DEFAULT 0,
    [AirbagsMultiples] BIT CONSTRAINT [DF__Vehicules__Airba__369C13AA] DEFAULT 0,
    [EquipementsSupplementaires] NVARCHAR(max),
    [PrixJournalier] DECIMAL(10,2) NOT NULL,
    [PrixHebdomadaire] DECIMAL(10,2),
    [PrixMensuel] DECIMAL(10,2),
    [CautionRequise] DECIMAL(10,2) CONSTRAINT [DF__Vehicules__Cauti__38845C1C] DEFAULT 0,
    [KilometrageInclus] INT CONSTRAINT [DF__Vehicules__Kilom__39788055] DEFAULT 200,
    [FraisKilometrageSupplementaire] DECIMAL(10,2) CONSTRAINT [DF__Vehicules__Frais__3A6CA48E] DEFAULT 0,
    [LocalisationVille] NVARCHAR(100) NOT NULL,
    [LocalisationRegion] NVARCHAR(100),
    [AdresseComplete] NVARCHAR(500),
    [Coordonnees] geography,
    [Latitude] DECIMAL(10,8),
    [Longitude] DECIMAL(11,8),
    [DisponibiliteLundi] BIT CONSTRAINT [DF__Vehicules__Dispo__3B60C8C7] DEFAULT 1,
    [DisponibiliteMardi] BIT CONSTRAINT [DF__Vehicules__Dispo__3C54ED00] DEFAULT 1,
    [DisponibiliteMercredi] BIT CONSTRAINT [DF__Vehicules__Dispo__3D491139] DEFAULT 1,
    [DisponibiliteJeudi] BIT CONSTRAINT [DF__Vehicules__Dispo__3E3D3572] DEFAULT 1,
    [DisponibiliteVendredi] BIT CONSTRAINT [DF__Vehicules__Dispo__3F3159AB] DEFAULT 1,
    [DisponibiliteSamedi] BIT CONSTRAINT [DF__Vehicules__Dispo__40257DE4] DEFAULT 1,
    [DisponibiliteDimanche] BIT CONSTRAINT [DF__Vehicules__Dispo__4119A21D] DEFAULT 1,
    [HeureDebutDisponibilite] TIME CONSTRAINT [DF__Vehicules__Heure__420DC656] DEFAULT '08:00',
    [HeureFinDisponibilite] TIME CONSTRAINT [DF__Vehicules__Heure__4301EA8F] DEFAULT '20:00',
    [LivraisonPossible] BIT CONSTRAINT [DF__Vehicules__Livra__43F60EC8] DEFAULT 0,
    [FraisLivraison] DECIMAL(10,2) CONSTRAINT [DF__Vehicules__Frais__44EA3301] DEFAULT ('0.00'),
    [RayonLivraison] INT,
    [StatutVehicule] NVARCHAR(20) CONSTRAINT [DF__Vehicules__Statu__45DE573A] DEFAULT 'Actif',
    [StatutVerification] NVARCHAR(20) CONSTRAINT [DF__Vehicules__Statu__47C69FAC] DEFAULT 'EnAttente',
    [NotesVehicule] DECIMAL(3,2) CONSTRAINT [DF__Vehicules__Notes__49AEE81E] DEFAULT 0.00,
    [NombreReservations] INT CONSTRAINT [DF__Vehicules__Nombr__4AA30C57] DEFAULT 0,
    [NombreVues] INT CONSTRAINT [DF__Vehicules__Nombr__4B973090] DEFAULT 0,
    [DateCreation] DATETIME2 CONSTRAINT [DF__Vehicules__DateC__4C8B54C9] DEFAULT sysdatetime(),
    [DateDerniereModification] DATETIME2 CONSTRAINT [DF__Vehicules__DateD__4D7F7902] DEFAULT sysdatetime(),
    [DateDerniereReservation] DATETIME2,
    [EstPromotion] BIT CONSTRAINT [DF__Vehicules__EstPr__4E739D3B] DEFAULT 0,
    [EstVedette] BIT CONSTRAINT [DF__Vehicules__EstVe__4F67C174] DEFAULT 0,
    [EstAssure] BIT CONSTRAINT [DF__Vehicules__EstAs__505BE5AD] DEFAULT 0,
    [CompagnieAssurance] NVARCHAR(200),
    [NumeroPoliceAssurance] NVARCHAR(100),
    [DateExpirationAssurance] DATE,
    [DernierEntretien] DATE,
    [ProchainEntretien] DATE,
    [TarificationDynamiqueActive] BIT CONSTRAINT [DF__Vehicules__Tarif__515009E6] DEFAULT 0,
    [TauxOccupationActuel] DECIMAL(5,2) CONSTRAINT [DF__Vehicules__TauxO__52442E1F] DEFAULT 0.00,
    CONSTRAINT [PK__Vehicule__C32242C5F9A65B99] PRIMARY KEY CLUSTERED ([IdentifiantVehicule]),
    CONSTRAINT [UQ__Vehicule__E15BDED2B14D9475] UNIQUE NONCLUSTERED ([Immatriculation]),
    CONSTRAINT [UQ__Vehicule__4C400D34F6F56EA2] UNIQUE NONCLUSTERED ([NumeroChassisVIN])
);

-- CreateTable
CREATE TABLE [dbo].[PhotosVehicules] (
    [IdentifiantPhoto] INT NOT NULL IDENTITY(1,1),
    [IdentifiantVehicule] INT NOT NULL,
    [URLPhoto] NVARCHAR(500) NOT NULL,
    [URLMiniature] NVARCHAR(500),
    [LegendePhoto] NVARCHAR(255),
    [OrdreAffichage] INT CONSTRAINT [DF__PhotosVeh__Ordre__58F12BAE] DEFAULT 0,
    [EstPhotoPrincipale] BIT CONSTRAINT [DF__PhotosVeh__EstPh__59E54FE7] DEFAULT 0,
    [TailleFichier] BIGINT,
    [FormatImage] NVARCHAR(10),
    [DateAjout] DATETIME2 CONSTRAINT [DF__PhotosVeh__DateA__5AD97420] DEFAULT sysdatetime(),
    CONSTRAINT [PK__PhotosVe__91C43C1A32928D07] PRIMARY KEY CLUSTERED ([IdentifiantPhoto])
);

-- CreateTable
CREATE TABLE [dbo].[CaracteristiquesTechniques] (
    [IdentifiantCaracteristique] INT NOT NULL IDENTITY(1,1),
    [IdentifiantVehicule] INT NOT NULL,
    [Puissance] INT,
    [Couple] INT,
    [VitesseMaximale] INT,
    [Acceleration] DECIMAL(4,2),
    [CapaciteReservoir] INT,
    [PoidsVide] INT,
    [ChargeUtile] INT,
    [LongueurVehicule] INT,
    [LargeurVehicule] INT,
    [HauteurVehicule] INT,
    [EmpatementVehicule] INT,
    [NormeEmission] NVARCHAR(50),
    [TypeRoueMotrice] NVARCHAR(50),
    [DateAjout] DATETIME2 CONSTRAINT [DF__Caracteri__DateA__5EAA0504] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Caracter__1F0584E35D747070] PRIMARY KEY CLUSTERED ([IdentifiantCaracteristique])
);

-- CreateTable
CREATE TABLE [dbo].[Reservations] (
    [IdentifiantReservation] INT NOT NULL IDENTITY(1,1),
    [NumeroReservation] NVARCHAR(50) NOT NULL CONSTRAINT [DF__Reservati__Numer__795DFB40] DEFAULT '',
    [IdentifiantVehicule] INT NOT NULL,
    [IdentifiantLocataire] INT NOT NULL,
    [IdentifiantProprietaire] INT NOT NULL,
    [DateDebut] DATETIME2 NOT NULL,
    [DateFin] DATETIME2 NOT NULL,
    [DateCreationReservation] DATETIME2 CONSTRAINT [DF__Reservati__DateC__7A521F79] DEFAULT sysdatetime(),
    [HeureDebut] TIME,
    [HeureFin] TIME,
    [LieuPriseEnCharge] NVARCHAR(500),
    [LieuRestitution] NVARCHAR(500),
    [LivraisonDemandee] BIT CONSTRAINT [DF__Reservati__Livra__7B4643B2] DEFAULT 0,
    [AdresseLivraison] NVARCHAR(500),
    [FraisLivraison] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__7C3A67EB] DEFAULT 0,
    [NombreJours] INT,
    [PrixJournalier] DECIMAL(10,2) NOT NULL,
    [MontantLocation] DECIMAL(10,2) NOT NULL,
    [MontantCaution] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Monta__7D2E8C24] DEFAULT 0,
    [FraisService] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__7E22B05D] DEFAULT 0,
    [FraisAssurance] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__7F16D496] DEFAULT 0,
    [FraisSupplementaires] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__000AF8CF] DEFAULT 0,
    [DetailsSupplementaires] NVARCHAR(max),
    [Remise] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Remis__00FF1D08] DEFAULT 0,
    [CodePromo] NVARCHAR(50),
    [MontantTotal] DECIMAL(10,2) NOT NULL,
    [StatutReservation] NVARCHAR(30) CONSTRAINT [DF__Reservati__Statu__01F34141] DEFAULT 'EnAttente',
    [StatutPaiement] NVARCHAR(30) CONSTRAINT [DF__Reservati__Statu__03DB89B3] DEFAULT 'EnAttente',
    [MethodePaiement] NVARCHAR(50),
    [KilometrageDepart] INT,
    [KilometrageRetour] INT,
    [KilometrageParcouru] INT,
    [KilometrageInclus] INT CONSTRAINT [DF__Reservati__Kilom__05C3D225] DEFAULT 200,
    [FraisKilometrageSupplementaire] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__06B7F65E] DEFAULT 0,
    [MontantKilometrageSupplementaire] DECIMAL(21,2),
    [NiveauCarburantDepart] NVARCHAR(20),
    [NiveauCarburantRetour] NVARCHAR(20),
    [EtatVehiculeDepart] NVARCHAR(max),
    [EtatVehiculeRetour] NVARCHAR(max),
    [PhotosDepart] NVARCHAR(max),
    [PhotosRetour] NVARCHAR(max),
    [CommentairesLocataire] NVARCHAR(1000),
    [CommentairesProprietaire] NVARCHAR(1000),
    [MotifAnnulation] NVARCHAR(500),
    [DateAnnulation] DATETIME2,
    [AnnulePar] INT,
    [FraisAnnulation] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__09946309] DEFAULT 0,
    [EstAssurance] BIT CONSTRAINT [DF__Reservati__EstAs__0A888742] DEFAULT 0,
    [TypeAssurance] NVARCHAR(100),
    [MontantAssurance] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Monta__0B7CAB7B] DEFAULT 0,
    [ConducteursSupplementaires] NVARCHAR(max),
    [NombreConducteurs] INT CONSTRAINT [DF__Reservati__Nombr__0C70CFB4] DEFAULT 1,
    [NotesSpeciales] NVARCHAR(1000),
    [DateConfirmation] DATETIME2,
    [DateDebutEffectif] DATETIME2,
    [DateFinEffective] DATETIME2,
    [RetardRetour] INT CONSTRAINT [DF__Reservati__Retar__0D64F3ED] DEFAULT 0,
    [FraisRetard] DECIMAL(10,2) CONSTRAINT [DF__Reservati__Frais__0E591826] DEFAULT 0,
    CONSTRAINT [PK__Reservat__8DDAB069B0613B2C] PRIMARY KEY CLUSTERED ([IdentifiantReservation]),
    CONSTRAINT [UQ__Reservat__751CE0890327C114] UNIQUE NONCLUSTERED ([NumeroReservation])
);

-- CreateTable
CREATE TABLE [dbo].[ExtensionsReservations] (
    [IdentifiantExtension] INT NOT NULL IDENTITY(1,1),
    [IdentifiantReservation] INT NOT NULL,
    [NouvelleDateFin] DATETIME2 NOT NULL,
    [AncienneDateFin] DATETIME2 NOT NULL,
    [JoursSupplementaires] INT,
    [MontantSupplementaire] DECIMAL(10,2) NOT NULL,
    [StatutDemande] NVARCHAR(20) CONSTRAINT [DF__Extension__Statu__16EE5E27] DEFAULT 'EnAttente',
    [DateDemande] DATETIME2 CONSTRAINT [DF__Extension__DateD__18D6A699] DEFAULT sysdatetime(),
    [DateReponse] DATETIME2,
    [RaisonExtension] NVARCHAR(500),
    [RaisonRefus] NVARCHAR(500),
    CONSTRAINT [PK__Extensio__D5224C0C0F5B49C4] PRIMARY KEY CLUSTERED ([IdentifiantExtension])
);

-- CreateTable
CREATE TABLE [dbo].[Transactions] (
    [IdentifiantTransaction] INT NOT NULL IDENTITY(1,1),
    [NumeroTransaction] NVARCHAR(100) NOT NULL,
    [IdentifiantReservation] INT,
    [IdentifiantUtilisateur] INT NOT NULL,
    [TypeTransaction] NVARCHAR(50) NOT NULL,
    [Montant] DECIMAL(10,2) NOT NULL,
    [Devise] NVARCHAR(3) CONSTRAINT [DF__Transacti__Devis__1E8F7FEF] DEFAULT 'XOF',
    [MethodePaiement] NVARCHAR(50) NOT NULL,
    [FournisseurPaiement] NVARCHAR(100),
    [ReferenceExterne] NVARCHAR(255),
    [StatutTransaction] NVARCHAR(30) CONSTRAINT [DF__Transacti__Statu__2077C861] DEFAULT 'EnAttente',
    [DateTransaction] DATETIME2 CONSTRAINT [DF__Transacti__DateT__226010D3] DEFAULT sysdatetime(),
    [DateTraitement] DATETIME2,
    [FraisTransaction] DECIMAL(10,2) CONSTRAINT [DF__Transacti__Frais__2354350C] DEFAULT 0,
    [FraisCommission] DECIMAL(10,2) CONSTRAINT [DF__Transacti__Frais__24485945] DEFAULT 0,
    [MontantNet] DECIMAL(10,2),
    [Description] NVARCHAR(500),
    [DetailsTransaction] NVARCHAR(max),
    [AdresseIPTransaction] NVARCHAR(45),
    [DeviceInfo] NVARCHAR(500),
    [CodeErreur] NVARCHAR(50),
    [MessageErreur] NVARCHAR(500),
    [NombreTentatives] INT CONSTRAINT [DF__Transacti__Nombr__253C7D7E] DEFAULT 1,
    [EstRembourse] BIT CONSTRAINT [DF__Transacti__EstRe__2630A1B7] DEFAULT 0,
    [DateRemboursement] DATETIME2,
    [IdentifiantTransactionRemboursement] INT,
    CONSTRAINT [PK__Transact__2286EC89C39264A8] PRIMARY KEY CLUSTERED ([IdentifiantTransaction]),
    CONSTRAINT [UQ__Transact__89BA11D1A61635DF] UNIQUE NONCLUSTERED ([NumeroTransaction])
);

-- CreateTable
CREATE TABLE [dbo].[MethodesPaiementUtilisateurs] (
    [IdentifiantMethode] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [TypeMethode] NVARCHAR(50) NOT NULL,
    [EstMethodePrincipale] BIT CONSTRAINT [DF__MethodesP__EstMe__2BE97B0D] DEFAULT 0,
    [Actif] BIT CONSTRAINT [DF__MethodesP__Actif__2CDD9F46] DEFAULT 1,
    [Alias] NVARCHAR(100),
    [DerniersChiffres] NVARCHAR(10),
    [Fournisseur] NVARCHAR(100),
    [DateExpiration] DATE,
    [DateAjout] DATETIME2 CONSTRAINT [DF__MethodesP__DateA__2DD1C37F] DEFAULT sysdatetime(),
    [DateDerniereUtilisation] DATETIME2,
    CONSTRAINT [PK__Methodes__37E36899AA4F89D4] PRIMARY KEY CLUSTERED ([IdentifiantMethode])
);

-- CreateTable
CREATE TABLE [dbo].[Factures] (
    [IdentifiantFacture] INT NOT NULL IDENTITY(1,1),
    [NumeroFacture] NVARCHAR(50) NOT NULL,
    [IdentifiantReservation] INT NOT NULL,
    [IdentifiantUtilisateur] INT NOT NULL,
    [DateEmission] DATETIME2 CONSTRAINT [DF__Factures__DateEm__3296789C] DEFAULT sysdatetime(),
    [DateEcheance] DATETIME2,
    [MontantHT] DECIMAL(10,2) NOT NULL,
    [TauxTVA] DECIMAL(5,2) CONSTRAINT [DF__Factures__TauxTV__338A9CD5] DEFAULT 0,
    [MontantTVA] DECIMAL(20,8),
    [MontantTTC] DECIMAL(21,8),
    [StatutFacture] NVARCHAR(20) CONSTRAINT [DF__Factures__Statut__347EC10E] DEFAULT 'Emise',
    [CheminPDF] NVARCHAR(500),
    [DatePaiement] DATETIME2,
    [NotesFacture] NVARCHAR(1000),
    CONSTRAINT [PK__Factures__E45C7A1993955F19] PRIMARY KEY CLUSTERED ([IdentifiantFacture]),
    CONSTRAINT [UQ__Factures__CF12F9A27531D53B] UNIQUE NONCLUSTERED ([NumeroFacture])
);

-- CreateTable
CREATE TABLE [dbo].[CodesPromo] (
    [IdentifiantPromo] INT NOT NULL IDENTITY(1,1),
    [CodePromo] NVARCHAR(50) NOT NULL,
    [TypePromo] NVARCHAR(20),
    [ValeurPromo] DECIMAL(10,2) NOT NULL,
    [MontantMinimum] DECIMAL(10,2),
    [NombreUtilisationsMax] INT,
    [NombreUtilisationsActuel] INT CONSTRAINT [DF__CodesProm__Nombr__3C1FE2D6] DEFAULT 0,
    [UtilisationsParUtilisateur] INT CONSTRAINT [DF__CodesProm__Utili__3D14070F] DEFAULT 1,
    [DateDebut] DATETIME2 NOT NULL,
    [DateFin] DATETIME2 NOT NULL,
    [Actif] BIT CONSTRAINT [DF__CodesProm__Actif__3E082B48] DEFAULT 1,
    [CategoriesApplicables] NVARCHAR(max),
    [VehiculesApplicables] NVARCHAR(max),
    [UtilisateursApplicables] NVARCHAR(max),
    [Description] NVARCHAR(500),
    [CreePar] INT,
    [DateCreation] DATETIME2 CONSTRAINT [DF__CodesProm__DateC__3EFC4F81] DEFAULT sysdatetime(),
    CONSTRAINT [PK__CodesPro__6B492C9E87A963A2] PRIMARY KEY CLUSTERED ([IdentifiantPromo]),
    CONSTRAINT [UQ__CodesPro__2D4B0570E0BD24D9] UNIQUE NONCLUSTERED ([CodePromo])
);

-- CreateTable
CREATE TABLE [dbo].[UtilisationsCodesPromo] (
    [IdentifiantUtilisation] INT NOT NULL IDENTITY(1,1),
    [IdentifiantPromo] INT NOT NULL,
    [IdentifiantUtilisateur] INT NOT NULL,
    [IdentifiantReservation] INT NOT NULL,
    [MontantRemise] DECIMAL(10,2) NOT NULL,
    [DateUtilisation] DATETIME2 CONSTRAINT [DF__Utilisati__DateU__42CCE065] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Utilisat__0A998068FD754973] PRIMARY KEY CLUSTERED ([IdentifiantUtilisation])
);

-- CreateTable
CREATE TABLE [dbo].[ProgrammeFidelite] (
    [IdentifiantProgramme] INT NOT NULL IDENTITY(1,1),
    [NomProgramme] NVARCHAR(100) NOT NULL,
    [Niveau] NVARCHAR(50),
    [SeuilPoints] INT NOT NULL,
    [PourcentageRemise] DECIMAL(5,2) CONSTRAINT [DF__Programme__Pourc__4979DDF4] DEFAULT 0,
    [PrioriteSuppor] BIT CONSTRAINT [DF__Programme__Prior__4A6E022D] DEFAULT 0,
    [AnnulationGratuite] BIT CONSTRAINT [DF__Programme__Annul__4B622666] DEFAULT 0,
    [AccesExclusif] BIT CONSTRAINT [DF__Programme__Acces__4C564A9F] DEFAULT 0,
    [SurclassementGratuit] BIT CONSTRAINT [DF__Programme__Surcl__4D4A6ED8] DEFAULT 0,
    [Avantages] NVARCHAR(max),
    [CouleurBadge] NVARCHAR(20),
    [IconeBadge] NVARCHAR(255),
    [Actif] BIT CONSTRAINT [DF__Programme__Actif__4E3E9311] DEFAULT 1,
    [DateCreation] DATETIME2 CONSTRAINT [DF__Programme__DateC__4F32B74A] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Programm__DDF908CF984993AD] PRIMARY KEY CLUSTERED ([IdentifiantProgramme])
);

-- CreateTable
CREATE TABLE [dbo].[PointsFidelite] (
    [IdentifiantPoint] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [TypeAcquisition] NVARCHAR(50),
    [PointsAcquis] INT NOT NULL,
    [PointsUtilises] INT CONSTRAINT [DF__PointsFid__Point__5303482E] DEFAULT 0,
    [SoldePoints] INT,
    [DateAcquisition] DATETIME2 CONSTRAINT [DF__PointsFid__DateA__53F76C67] DEFAULT sysdatetime(),
    [DateExpiration] DATETIME2,
    [IdentifiantSource] INT,
    [TypeSource] NVARCHAR(50),
    [Description] NVARCHAR(500),
    [EstExpire] INT NOT NULL,
    CONSTRAINT [PK__PointsFi__211FE770D7F29A7C] PRIMARY KEY CLUSTERED ([IdentifiantPoint])
);

-- CreateTable
CREATE TABLE [dbo].[ProgrammeParrainage] (
    [IdentifiantParrainage] INT NOT NULL IDENTITY(1,1),
    [IdentifiantParrain] INT NOT NULL,
    [IdentifiantFilleul] INT,
    [CodeParrainage] NVARCHAR(50) NOT NULL,
    [EmailFilleul] NVARCHAR(255),
    [DateInvitation] DATETIME2 CONSTRAINT [DF__Programme__DateI__59B045BD] DEFAULT sysdatetime(),
    [DateInscription] DATETIME2,
    [PointsParrain] INT CONSTRAINT [DF__Programme__Point__5AA469F6] DEFAULT 0,
    [PointsFilleul] INT CONSTRAINT [DF__Programme__Point__5B988E2F] DEFAULT 0,
    [RemiseParrain] DECIMAL(10,2) CONSTRAINT [DF__Programme__Remis__5C8CB268] DEFAULT 0,
    [RemiseFilleul] DECIMAL(10,2) CONSTRAINT [DF__Programme__Remis__5D80D6A1] DEFAULT 0,
    [CommissionParrain] DECIMAL(5,2),
    [StatutParrainage] NVARCHAR(20) CONSTRAINT [DF__Programme__Statu__5E74FADA] DEFAULT 'EnAttente',
    [PremierAchatEffectue] BIT CONSTRAINT [DF__Programme__Premi__605D434C] DEFAULT 0,
    [DatePremierAchat] DATETIME2,
    [MontantPremierAchat] DECIMAL(10,2),
    [RecompensesAttribuees] BIT CONSTRAINT [DF__Programme__Recom__61516785] DEFAULT 0,
    [DateAttributionRecompenses] DATETIME2,
    CONSTRAINT [PK__Programm__0FE700422AD1954B] PRIMARY KEY CLUSTERED ([IdentifiantParrainage]),
    CONSTRAINT [UQ__Programm__8CCA82E09620C346] UNIQUE NONCLUSTERED ([CodeParrainage]),
    CONSTRAINT [UQ_Parrain_Filleul] UNIQUE NONCLUSTERED ([IdentifiantParrain],[IdentifiantFilleul])
);

-- CreateTable
CREATE TABLE [dbo].[Notifications] (
    [IdentifiantNotification] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [TypeNotification] NVARCHAR(50) NOT NULL,
    [TitreNotification] NVARCHAR(255) NOT NULL,
    [MessageNotification] NVARCHAR(max) NOT NULL,
    [LienNotification] NVARCHAR(500),
    [IconeNotification] NVARCHAR(50),
    [PrioriteNotification] NVARCHAR(20) CONSTRAINT [DF__Notificat__Prior__0682EC34] DEFAULT 'Normal',
    [CanalEnvoi] NVARCHAR(20),
    [DateCreation] DATETIME2 CONSTRAINT [DF__Notificat__DateC__095F58DF] DEFAULT sysdatetime(),
    [DateEnvoi] DATETIME2,
    [DateLecture] DATETIME2,
    [EstLu] BIT CONSTRAINT [DF__Notificat__EstLu__0A537D18] DEFAULT 0,
    [EstArchive] BIT CONSTRAINT [DF__Notificat__EstAr__0B47A151] DEFAULT 0,
    [MetaDonnees] NVARCHAR(max),
    CONSTRAINT [PK__Notifica__AC8A785D0C7B523E] PRIMARY KEY CLUSTERED ([IdentifiantNotification])
);

-- CreateTable
CREATE TABLE [dbo].[Messages] (
    [IdentifiantMessage] INT NOT NULL IDENTITY(1,1),
    [IdentifiantConversation] INT NOT NULL,
    [IdentifiantExpediteur] INT NOT NULL,
    [IdentifiantDestinataire] INT NOT NULL,
    [ContenuMessage] NVARCHAR(max) NOT NULL,
    [TypeMessage] NVARCHAR(20) CONSTRAINT [DF__Messages__TypeMe__6F9F86DC] DEFAULT 'Texte',
    [PiecesJointes] NVARCHAR(max),
    [DateEnvoi] DATETIME2 CONSTRAINT [DF__Messages__DateEn__7187CF4E] DEFAULT sysdatetime(),
    [DateLecture] DATETIME2,
    [EstLu] BIT CONSTRAINT [DF__Messages__EstLu__727BF387] DEFAULT 0,
    [EstArchive] BIT CONSTRAINT [DF__Messages__EstArc__737017C0] DEFAULT 0,
    [EstSupprime] BIT CONSTRAINT [DF__Messages__EstSup__74643BF9] DEFAULT 0,
    CONSTRAINT [PK__Messages__FEA4AA2BE955111E] PRIMARY KEY CLUSTERED ([IdentifiantMessage])
);

-- CreateTable
CREATE TABLE [dbo].[Avis] (
    [IdentifiantAvis] INT NOT NULL IDENTITY(1,1),
    [IdentifiantReservation] INT NOT NULL,
    [IdentifiantAuteur] INT NOT NULL,
    [IdentifiantCible] INT NOT NULL,
    [TypeCible] NVARCHAR(20) NOT NULL,
    [NoteGlobale] DECIMAL(3,2) NOT NULL,
    [NoteProprete] DECIMAL(3,2),
    [NoteConformite] DECIMAL(3,2),
    [NoteCommunication] DECIMAL(3,2),
    [NoteEtatVehicule] DECIMAL(3,2),
    [NoteRapportQualitePrix] DECIMAL(3,2),
    [CommentaireAvis] NVARCHAR(2000),
    [PhotosAvis] NVARCHAR(max),
    [RecommandeCible] BIT CONSTRAINT [DF__Avis__Recommande__16B953FD] DEFAULT 1,
    [StatutAvis] NVARCHAR(20) CONSTRAINT [DF__Avis__StatutAvis__17AD7836] DEFAULT 'Publie',
    [DateCreation] DATETIME2 CONSTRAINT [DF__Avis__DateCreati__1995C0A8] DEFAULT sysdatetime(),
    [DateModification] DATETIME2,
    [NombreSignalements] INT CONSTRAINT [DF__Avis__NombreSign__1A89E4E1] DEFAULT 0,
    [NombreUtile] INT CONSTRAINT [DF__Avis__NombreUtil__1B7E091A] DEFAULT 0,
    [NombreInutile] INT CONSTRAINT [DF__Avis__NombreInut__1C722D53] DEFAULT 0,
    [ReponseProprietaire] NVARCHAR(1000),
    [DateReponse] DATETIME2,
    CONSTRAINT [PK__Avis__4E2C5E7B3D046101] PRIMARY KEY CLUSTERED ([IdentifiantAvis]),
    CONSTRAINT [UQ__Avis__8DDAB0684700AD70] UNIQUE NONCLUSTERED ([IdentifiantReservation])
);

-- CreateTable
CREATE TABLE [dbo].[Reclamations] (
    [IdentifiantReclamation] INT NOT NULL IDENTITY(1,1),
    [NumeroReclamation] NVARCHAR(50) NOT NULL,
    [IdentifiantReservation] INT,
    [IdentifiantReclamant] INT NOT NULL,
    [TypeReclamation] NVARCHAR(50) NOT NULL,
    [CategorieReclamation] NVARCHAR(50),
    [SujetReclamation] NVARCHAR(255) NOT NULL,
    [DescriptionReclamation] NVARCHAR(max) NOT NULL,
    [PieceJointes] NVARCHAR(max),
    [MontantReclame] DECIMAL(10,2),
    [StatutReclamation] NVARCHAR(30) CONSTRAINT [DF__Reclamati__Statu__2CA8951C] DEFAULT 'Ouverte',
    [PrioriteReclamation] NVARCHAR(20) CONSTRAINT [DF__Reclamati__Prior__2E90DD8E] DEFAULT 'Normal',
    [DateCreation] DATETIME2 CONSTRAINT [DF__Reclamati__DateC__30792600] DEFAULT sysdatetime(),
    [DateResolution] DATETIME2,
    [DateFermeture] DATETIME2,
    [AssigneA] INT,
    [ReponseReclamation] NVARCHAR(max),
    [ActionsPrises] NVARCHAR(max),
    [MontantRembourse] DECIMAL(10,2),
    [SatisfactionClient] DECIMAL(3,2),
    CONSTRAINT [PK__Reclamat__A28B1A4859C81F0A] PRIMARY KEY CLUSTERED ([IdentifiantReclamation]),
    CONSTRAINT [UQ__Reclamat__94B8C086110B675F] UNIQUE NONCLUSTERED ([NumeroReclamation])
);

-- CreateTable
CREATE TABLE [dbo].[Incidents] (
    [IdentifiantIncident] INT NOT NULL IDENTITY(1,1),
    [NumeroIncident] NVARCHAR(50) NOT NULL,
    [IdentifiantReservation] INT NOT NULL,
    [IdentifiantVehicule] INT NOT NULL,
    [TypeIncident] NVARCHAR(50) NOT NULL,
    [GraviteIncident] NVARCHAR(20) NOT NULL,
    [DescriptionIncident] NVARCHAR(max) NOT NULL,
    [DateIncident] DATETIME2 NOT NULL,
    [LieuIncident] NVARCHAR(500),
    [CoordonneesIncident] geography,
    [PhotosIncident] NVARCHAR(max),
    [RapportPolice] NVARCHAR(500),
    [NumeroConstat] NVARCHAR(100),
    [TierImplique] BIT CONSTRAINT [DF__Incidents__TierI__390E6C01] DEFAULT 0,
    [InfoTiers] NVARCHAR(max),
    [AssuranceNotifiee] BIT CONSTRAINT [DF__Incidents__Assur__3A02903A] DEFAULT 0,
    [DateNotificationAssurance] DATETIME2,
    [NumeroSinistre] NVARCHAR(100),
    [EstimationDommages] DECIMAL(10,2),
    [CoutReparations] DECIMAL(10,2),
    [ResponsabiliteLocataire] BIT,
    [StatutTraitement] NVARCHAR(30) CONSTRAINT [DF__Incidents__Statu__3AF6B473] DEFAULT 'Declare',
    [DateDeclaration] DATETIME2 CONSTRAINT [DF__Incidents__DateD__3CDEFCE5] DEFAULT sysdatetime(),
    [DateResolution] DATETIME2,
    [TraitePar] INT,
    [NotesTraitement] NVARCHAR(max),
    CONSTRAINT [PK__Incident__F77D6A429699F399] PRIMARY KEY CLUSTERED ([IdentifiantIncident]),
    CONSTRAINT [UQ__Incident__5C5A3E2D72111F34] UNIQUE NONCLUSTERED ([NumeroIncident])
);

-- CreateTable
CREATE TABLE [dbo].[Favoris] (
    [IdentifiantFavori] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [IdentifiantVehicule] INT NOT NULL,
    [DateAjout] DATETIME2 CONSTRAINT [DF__Favoris__DateAjo__438BFA74] DEFAULT sysdatetime(),
    [NotesPersonnelles] NVARCHAR(500),
    CONSTRAINT [PK__Favoris__57A07D10F7DB1CCD] PRIMARY KEY CLUSTERED ([IdentifiantFavori]),
    CONSTRAINT [UQ_Favoris_Utilisateur_Vehicule] UNIQUE NONCLUSTERED ([IdentifiantUtilisateur],[IdentifiantVehicule])
);

-- CreateTable
CREATE TABLE [dbo].[RecherchesSauvegardees] (
    [IdentifiantRecherche] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [NomRecherche] NVARCHAR(200) NOT NULL,
    [CriteresRecherche] NVARCHAR(max) NOT NULL,
    [NotificationsActives] BIT CONSTRAINT [DF__Recherche__Notif__4850AF91] DEFAULT 1,
    [FrequenceNotifications] NVARCHAR(20),
    [DateCreation] DATETIME2 CONSTRAINT [DF__Recherche__DateC__4A38F803] DEFAULT sysdatetime(),
    [DateDerniereUtilisation] DATETIME2,
    [NombreUtilisations] INT CONSTRAINT [DF__Recherche__Nombr__4B2D1C3C] DEFAULT 0,
    CONSTRAINT [PK__Recherch__6BDCAB727D0F820E] PRIMARY KEY CLUSTERED ([IdentifiantRecherche])
);

-- CreateTable
CREATE TABLE [dbo].[ReglesTarificationDynamique] (
    [IdentifiantRegle] INT NOT NULL IDENTITY(1,1),
    [IdentifiantVehicule] INT NOT NULL,
    [TypeCondition] NVARCHAR(50),
    [ValeurCondition] NVARCHAR(200),
    [TypeModificateur] NVARCHAR(20),
    [ValeurModificateur] DECIMAL(10,2) NOT NULL,
    [Operation] NVARCHAR(10),
    [PrixMinimum] DECIMAL(10,2),
    [PrixMaximum] DECIMAL(10,2),
    [DateDebut] DATETIME2 NOT NULL,
    [DateFin] DATETIME2,
    [HeureDebut] TIME,
    [HeureFin] TIME,
    [JoursSemaine] NVARCHAR(50),
    [Priorite] INT CONSTRAINT [DF__ReglesTar__Prior__6FD49106] DEFAULT 0,
    [Actif] BIT CONSTRAINT [DF__ReglesTar__Actif__70C8B53F] DEFAULT 1,
    [Description] NVARCHAR(500),
    CONSTRAINT [PK__ReglesTa__AE50E0081F8BA72C] PRIMARY KEY CLUSTERED ([IdentifiantRegle])
);

-- CreateTable
CREATE TABLE [dbo].[HistoriquePrixVehicules] (
    [IdentifiantHistorique] BIGINT NOT NULL IDENTITY(1,1),
    [IdentifiantVehicule] INT NOT NULL,
    [PrixJournalier] DECIMAL(10,2) NOT NULL,
    [PrixHebdomadaire] DECIMAL(10,2),
    [PrixMensuel] DECIMAL(10,2),
    [FacteursInfluence] NVARCHAR(max),
    [TauxOccupation] DECIMAL(5,2),
    [DemandePrevue] DECIMAL(5,2),
    [SaisonTouristique] NVARCHAR(50),
    [EvenementsLocaux] NVARCHAR(max),
    [DateApplication] DATETIME2 CONSTRAINT [DF__Historiqu__DateA__74994623] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Historiq__2A5B31889BEA1CC9] PRIMARY KEY CLUSTERED ([IdentifiantHistorique])
);

-- CreateTable
CREATE TABLE [dbo].[AggregationsUtilisateurs] (
    [IdentifiantAggregation] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur] INT NOT NULL,
    [NombreReservationsTotal] INT CONSTRAINT [DF__Aggregati__Nombr__5B638405] DEFAULT 0,
    [NombreReservationsConfirmees] INT CONSTRAINT [DF__Aggregati__Nombr__5C57A83E] DEFAULT 0,
    [NombreReservationsAnnulees] INT CONSTRAINT [DF__Aggregati__Nombr__5D4BCC77] DEFAULT 0,
    [TauxAnnulation] FLOAT(53),
    [DureeTotalLocations] INT CONSTRAINT [DF__Aggregati__Duree__5E3FF0B0] DEFAULT 0,
    [MontantTotalDepense] DECIMAL(15,2) CONSTRAINT [DF__Aggregati__Monta__5F3414E9] DEFAULT 0,
    [MontantMoyenReservation] DECIMAL(26,13),
    [NoteMoyenneDonnee] DECIMAL(3,2),
    [NoteMoyenneRecue] DECIMAL(3,2),
    [NombreAvisDonnes] INT CONSTRAINT [DF__Aggregati__Nombr__60283922] DEFAULT 0,
    [NombreAvisRecus] INT CONSTRAINT [DF__Aggregati__Nombr__611C5D5B] DEFAULT 0,
    [DerniereReservationDate] DATETIME2,
    [DerniereConnexionDate] DATETIME2,
    [DernierPaiementDate] DATETIME2,
    [CategoriePreferee] INT,
    [VillePreferee] NVARCHAR(100),
    [MarquePreferee] INT,
    [BudgetMoyen] DECIMAL(10,2),
    [DureeMoyenneLocation] INT,
    [TauxReponse] DECIMAL(5,2),
    [DelaiMoyenReponse] INT,
    [TauxConfirmation] DECIMAL(5,2),
    [DateCalcul] DATETIME2 CONSTRAINT [DF__Aggregati__DateC__62108194] DEFAULT sysdatetime(),
    [DateMiseAJour] DATETIME2,
    CONSTRAINT [PK__Aggregat__8262E3F0685E7473] PRIMARY KEY CLUSTERED ([IdentifiantAggregation]),
    CONSTRAINT [UQ__Aggregat__09949E0B17C17441] UNIQUE NONCLUSTERED ([IdentifiantUtilisateur])
);

-- CreateTable
CREATE TABLE [dbo].[A_B_Tests] (
    [IdentifiantTest] INT NOT NULL IDENTITY(1,1),
    [CodeTest] NVARCHAR(100) NOT NULL,
    [NomTest] NVARCHAR(100) NOT NULL,
    [DescriptionTest] NVARCHAR(1000),
    [ObjectifTest] NVARCHAR(500),
    [HypotheseTest] NVARCHAR(1000),
    [MetriquePrincipale] NVARCHAR(100),
    [PopulationCible] NVARCHAR(max),
    [TailleEchantillon] INT,
    [PourcentageVarianteA] INT CONSTRAINT [DF__A_B_Tests__Pourc__705EA0EB] DEFAULT 50,
    [PourcentageVarianteB] INT CONSTRAINT [DF__A_B_Tests__Pourc__7152C524] DEFAULT 50,
    [VarianteA] NVARCHAR(max),
    [VarianteB] NVARCHAR(max),
    [DateDebut] DATETIME2,
    [DateFin] DATETIME2,
    [DureeMinimaleJours] INT CONSTRAINT [DF__A_B_Tests__Duree__7246E95D] DEFAULT 7,
    [StatutTest] NVARCHAR(20) CONSTRAINT [DF__A_B_Tests__Statu__733B0D96] DEFAULT 'Brouillon',
    [ParticipantsVarianteA] INT CONSTRAINT [DF__A_B_Tests__Parti__75235608] DEFAULT 0,
    [ParticipantsVarianteB] INT CONSTRAINT [DF__A_B_Tests__Parti__76177A41] DEFAULT 0,
    [ConversionsVarianteA] INT CONSTRAINT [DF__A_B_Tests__Conve__770B9E7A] DEFAULT 0,
    [ConversionsVarianteB] INT CONSTRAINT [DF__A_B_Tests__Conve__77FFC2B3] DEFAULT 0,
    [TauxConversionA] FLOAT(53),
    [TauxConversionB] FLOAT(53),
    [SignificanceStatistique] DECIMAL(5,4),
    [VarianteGagnante] NVARCHAR(1),
    [Resultats] NVARCHAR(max),
    [CreePar] INT,
    [DateCreation] DATETIME2 CONSTRAINT [DF__A_B_Tests__DateC__79E80B25] DEFAULT sysdatetime(),
    CONSTRAINT [PK__A_B_Test__0FB40E7EDBFA1A9F] PRIMARY KEY CLUSTERED ([IdentifiantTest]),
    CONSTRAINT [UQ__A_B_Test__F578AEFE072605E8] UNIQUE NONCLUSTERED ([CodeTest])
);

-- CreateTable
CREATE TABLE [dbo].[CacheRecherches] (
    [IdentifiantCache] INT NOT NULL IDENTITY(1,1),
    [CleCache] NVARCHAR(500) NOT NULL,
    [Resultats] NVARCHAR(max) NOT NULL,
    [NombreResultats] INT NOT NULL,
    [DateCreation] DATETIME2 CONSTRAINT [DF__CacheRech__DateC__4FF1D159] DEFAULT sysdatetime(),
    [DateExpiration] DATETIME2 NOT NULL,
    [CompteUtilisations] INT CONSTRAINT [DF__CacheRech__Compt__50E5F592] DEFAULT 0,
    [DerniereUtilisation] DATETIME2,
    [ParametresRecherche] NVARCHAR(max),
    CONSTRAINT [PK__CacheRec__FC7433A492B60250] PRIMARY KEY CLUSTERED ([IdentifiantCache]),
    CONSTRAINT [UQ__CacheRec__60E4F98236974F7A] UNIQUE NONCLUSTERED ([CleCache])
);

-- CreateTable
CREATE TABLE [dbo].[CacheStatistiques] (
    [IdentifiantStatCache] INT NOT NULL IDENTITY(1,1),
    [TypeCache] NVARCHAR(50) NOT NULL,
    [Periode] NVARCHAR(20),
    [RequetesTotal] INT CONSTRAINT [DF__CacheStat__Reque__54B68676] DEFAULT 0,
    [RequetesCache] INT CONSTRAINT [DF__CacheStat__Reque__55AAAAAF] DEFAULT 0,
    [RequetesMiss] INT CONSTRAINT [DF__CacheStat__Reque__569ECEE8] DEFAULT 0,
    [TauxReussite] FLOAT(53),
    [TempsMoyenSansCache] DECIMAL(10,4),
    [TempsMoyenAvecCache] DECIMAL(10,4),
    [GainPerformance] DECIMAL(30,15),
    [DateDebut] DATETIME2 NOT NULL,
    [DateFin] DATETIME2 NOT NULL,
    [DateCalcul] DATETIME2 CONSTRAINT [DF__CacheStat__DateC__5792F321] DEFAULT sysdatetime(),
    CONSTRAINT [PK__CacheSta__9BEE569CCB2E4E01] PRIMARY KEY CLUSTERED ([IdentifiantStatCache])
);

-- CreateTable
CREATE TABLE [dbo].[ConfigurationBusinessRules] (
    [IdentifiantRegle] INT NOT NULL IDENTITY(1,1),
    [CodeRegle] NVARCHAR(100) NOT NULL,
    [TypeRegle] NVARCHAR(100) NOT NULL,
    [NomRegle] NVARCHAR(200) NOT NULL,
    [DescriptionRegle] NVARCHAR(1000),
    [Conditions] NVARCHAR(max) NOT NULL,
    [Actions] NVARCHAR(max) NOT NULL,
    [Priorite] INT CONSTRAINT [DF__Configura__Prior__66D536B1] DEFAULT 0,
    [Actif] BIT CONSTRAINT [DF__Configura__Actif__67C95AEA] DEFAULT 1,
    [DateDebut] DATETIME2 CONSTRAINT [DF__Configura__DateD__68BD7F23] DEFAULT sysdatetime(),
    [DateFin] DATETIME2,
    [CreePar] INT,
    [DateCreation] DATETIME2 CONSTRAINT [DF__Configura__DateC__69B1A35C] DEFAULT sysdatetime(),
    [ModifiePar] INT,
    [DateModification] DATETIME2,
    [NombreExecutions] INT CONSTRAINT [DF__Configura__Nombr__6AA5C795] DEFAULT 0,
    [DateDerniereExecution] DATETIME2,
    CONSTRAINT [PK__Configur__AE50E00853227631] PRIMARY KEY CLUSTERED ([IdentifiantRegle]),
    CONSTRAINT [UQ__Configur__64A35F47168F0703] UNIQUE NONCLUSTERED ([CodeRegle])
);

-- CreateTable
CREATE TABLE [dbo].[Conversations] (
    [IdentifiantConversation] INT NOT NULL IDENTITY(1,1),
    [IdentifiantUtilisateur1] INT NOT NULL,
    [IdentifiantUtilisateur2] INT NOT NULL,
    [IdentifiantReservation] INT,
    [IdentifiantVehicule] INT,
    [SujetConversation] NVARCHAR(255),
    [StatutConversation] NVARCHAR(20) CONSTRAINT [DF__Conversat__Statu__66161CA2] DEFAULT 'Active',
    [DateCreation] DATETIME2 CONSTRAINT [DF__Conversat__DateC__67FE6514] DEFAULT sysdatetime(),
    [DateDernierMessage] DATETIME2,
    [NombreMessages] INT CONSTRAINT [DF__Conversat__Nombr__68F2894D] DEFAULT 0,
    CONSTRAINT [PK__Conversa__73B722014065E752] PRIMARY KEY CLUSTERED ([IdentifiantConversation])
);

-- CreateTable
CREATE TABLE [dbo].[DeclencheursNotifications] (
    [IdentifiantDeclencheur] INT NOT NULL IDENTITY(1,1),
    [TypeDeclencheur] NVARCHAR(100) NOT NULL,
    [NomDeclencheur] NVARCHAR(200) NOT NULL,
    [IdentifiantTemplate] INT NOT NULL,
    [DelaiMinutes] INT CONSTRAINT [DF__Declenche__Delai__7FD5EEA5] DEFAULT 0,
    [Conditions] NVARCHAR(max),
    [Actif] BIT CONSTRAINT [DF__Declenche__Actif__00CA12DE] DEFAULT 1,
    [Priorite] INT CONSTRAINT [DF__Declenche__Prior__01BE3717] DEFAULT 5,
    [DateCreation] DATETIME2 CONSTRAINT [DF__Declenche__DateC__02B25B50] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Declench__543B04B797FE28D0] PRIMARY KEY CLUSTERED ([IdentifiantDeclencheur])
);

-- CreateTable
CREATE TABLE [dbo].[DistancesPrecalculees] (
    [IdentifiantOrigine] INT NOT NULL,
    [IdentifiantDestination] INT NOT NULL,
    [DistanceMetres] INT NOT NULL,
    [DureeMinutes] INT NOT NULL,
    [DateCalcul] DATETIME2 CONSTRAINT [DF__Distances__DateC__6A1BB7B0] DEFAULT sysdatetime(),
    CONSTRAINT [PK__Distance__7F0C426011383B21] PRIMARY KEY CLUSTERED ([IdentifiantOrigine],[IdentifiantDestination])
);

-- CreateTable
CREATE TABLE [dbo].[DonneesChiffrees] (
    [IdentifiantChiffrement] INT NOT NULL IDENTITY(1,1),
    [TableOrigine] NVARCHAR(100) NOT NULL,
    [ColonneOrigine] NVARCHAR(100) NOT NULL,
    [IdentifiantLigne] INT NOT NULL,
    [DonneesChiffrees] VARBINARY(max) NOT NULL,
    [Algorithme] NVARCHAR(50) CONSTRAINT [DF__DonneesCh__Algor__17236851] DEFAULT 'AES_256',
    [VecteurInitialisation] VARBINARY(16),
    [DateChiffrement] DATETIME2 CONSTRAINT [DF__DonneesCh__DateC__18178C8A] DEFAULT sysdatetime(),
    [ChiffrePar] INT,
    CONSTRAINT [PK__DonneesC__F5F8FCED5C31F5F3] PRIMARY KEY CLUSTERED ([IdentifiantChiffrement])
);

-- CreateTable
CREATE TABLE [dbo].[JournalAudit] (
    [IdentifiantAudit] BIGINT NOT NULL IDENTITY(1,1),
    [TypeAction] NVARCHAR(50) NOT NULL,
    [TableCible] NVARCHAR(100) NOT NULL,
    [IdentifiantLigne] INT NOT NULL,
    [IdentifiantUtilisateur] INT,
    [ActionEffectuee] NVARCHAR(20),
    [ValeursPrecedentes] NVARCHAR(max),
    [NouvellesValeurs] NVARCHAR(max),
    [AdresseIP] NVARCHAR(45),
    [UserAgent] NVARCHAR(500),
    [DateAction] DATETIME2 CONSTRAINT [DF__JournalAu__DateA__7EACC042] DEFAULT sysdatetime(),
    [DetailsSupplementaires] NVARCHAR(max),
    CONSTRAINT [PK__JournalA__4A82A6EA979E9453] PRIMARY KEY CLUSTERED ([IdentifiantAudit])
);

-- CreateTable
CREATE TABLE [dbo].[LogsErreurs] (
    [IdentifiantLog] BIGINT NOT NULL IDENTITY(1,1),
    [TypeErreur] NVARCHAR(50) NOT NULL,
    [MessageErreur] NVARCHAR(max) NOT NULL,
    [StackTrace] NVARCHAR(max),
    [Gravite] NVARCHAR(20),
    [IdentifiantUtilisateur] INT,
    [URL] NVARCHAR(500),
    [MethodeHTTP] NVARCHAR(10),
    [AdresseIP] NVARCHAR(45),
    [UserAgent] NVARCHAR(500),
    [DateErreur] DATETIME2 CONSTRAINT [DF__LogsErreu__DateE__0371755F] DEFAULT sysdatetime(),
    [Environnement] NVARCHAR(20),
    [Version] NVARCHAR(20),
    [EstResolu] BIT CONSTRAINT [DF__LogsErreu__EstRe__0559BDD1] DEFAULT 0,
    [DateResolution] DATETIME2,
    CONSTRAINT [PK__LogsErre__03BA78F7CF789FFF] PRIMARY KEY CLUSTERED ([IdentifiantLog])
);

-- CreateTable
CREATE TABLE [dbo].[SignalementsAvis] (
    [IdentifiantSignalement] INT NOT NULL IDENTITY(1,1),
    [IdentifiantAvis] INT NOT NULL,
    [IdentifiantSignaleur] INT NOT NULL,
    [MotifSignalement] NVARCHAR(50) NOT NULL,
    [DescriptionSignalement] NVARCHAR(1000),
    [DateSignalement] DATETIME2 CONSTRAINT [DF__Signaleme__DateS__222B06A9] DEFAULT sysdatetime(),
    [StatutTraitement] NVARCHAR(20) CONSTRAINT [DF__Signaleme__Statu__231F2AE2] DEFAULT 'EnAttente',
    [DateTraitement] DATETIME2,
    [TraitePar] INT,
    [CommentairesTraitement] NVARCHAR(500),
    CONSTRAINT [PK__Signalem__61FF49E6D88C2E1B] PRIMARY KEY CLUSTERED ([IdentifiantSignalement])
);

-- CreateTable
CREATE TABLE [dbo].[TemplatesNotifications] (
    [IdentifiantTemplate] INT NOT NULL IDENTITY(1,1),
    [TypeNotification] NVARCHAR(100) NOT NULL,
    [NomTemplate] NVARCHAR(200) NOT NULL,
    [TitreTemplate] NVARCHAR(255) NOT NULL,
    [CorpsTemplate] NVARCHAR(max) NOT NULL,
    [CorpsHTML] NVARCHAR(max),
    [CorpsSMS] NVARCHAR(500),
    [VariablesDisponibles] NVARCHAR(max),
    [CanauxDisponibles] NVARCHAR(max),
    [Categorie] NVARCHAR(50),
    [Langue] NVARCHAR(10) CONSTRAINT [DF__Templates__Langu__7B113988] DEFAULT 'fr',
    [DateCreation] DATETIME2 CONSTRAINT [DF__Templates__DateC__7C055DC1] DEFAULT sysdatetime(),
    [DateModification] DATETIME2,
    [Actif] BIT CONSTRAINT [DF__Templates__Actif__7CF981FA] DEFAULT 1,
    CONSTRAINT [PK__Template__423E75D0150A9BA3] PRIMARY KEY CLUSTERED ([IdentifiantTemplate]),
    CONSTRAINT [UQ__Template__808E03D3FDEE5BAF] UNIQUE NONCLUSTERED ([TypeNotification])
);

-- CreateTable
CREATE TABLE [dbo].[ZonesGeographiques] (
    [IdentifiantZone] INT NOT NULL IDENTITY(1,1),
    [NomZone] NVARCHAR(100) NOT NULL,
    [TypeZone] NVARCHAR(50),
    [ParentZone] INT,
    [GeoJSON] NVARCHAR(max),
    [Coordonnees] geography,
    [CentroidLatitude] DECIMAL(10,8),
    [CentroidLongitude] DECIMAL(11,8),
    [RayonMetres] INT,
    [NombreVehicules] INT CONSTRAINT [DF__ZonesGeog__Nombr__636EBA21] DEFAULT 0,
    [PrixMoyen] DECIMAL(10,2),
    [Popularite] INT CONSTRAINT [DF__ZonesGeog__Popul__6462DE5A] DEFAULT 0,
    [DateCreation] DATETIME2 CONSTRAINT [DF__ZonesGeog__DateC__65570293] DEFAULT sysdatetime(),
    [DateMiseAJour] DATETIME2,
    CONSTRAINT [PK__ZonesGeo__E3E661F171881F54] PRIMARY KEY CLUSTERED ([IdentifiantZone])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Utilisateurs_DateInscription] ON [dbo].[Utilisateurs]([DateInscription]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Utilisateurs_Email] ON [dbo].[Utilisateurs]([Email]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Utilisateurs_NiveauFidelite] ON [dbo].[Utilisateurs]([NiveauFidelite]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Utilisateurs_StatutCompte] ON [dbo].[Utilisateurs]([StatutCompte]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Utilisateurs_TypeUtilisateur] ON [dbo].[Utilisateurs]([TypeUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_AdressesUtilisateurs_Type] ON [dbo].[AdressesUtilisateurs]([TypeAdresse]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_AdressesUtilisateurs_Utilisateur] ON [dbo].[AdressesUtilisateurs]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_DocumentsUtilisateurs_Expiration] ON [dbo].[DocumentsUtilisateurs]([DateExpiration]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_DocumentsUtilisateurs_Statut] ON [dbo].[DocumentsUtilisateurs]([StatutVerification]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_DocumentsUtilisateurs_Type] ON [dbo].[DocumentsUtilisateurs]([TypeDocument]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_DocumentsUtilisateurs_Utilisateur] ON [dbo].[DocumentsUtilisateurs]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Tentatives_Email_Date] ON [dbo].[TentativesConnexion]([AdresseEmail], [DateTentative]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Tentatives_IP_Date] ON [dbo].[TentativesConnexion]([AdresseIP], [DateTentative]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Tentatives_Reussie] ON [dbo].[TentativesConnexion]([Reussie]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_MarquesVehicules_Populaire] ON [dbo].[MarquesVehicules]([EstPopulaire]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ModelesVehicules_Carburant] ON [dbo].[ModelesVehicules]([TypeCarburant]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ModelesVehicules_Marque] ON [dbo].[ModelesVehicules]([IdentifiantMarque]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Categorie] ON [dbo].[Vehicules]([IdentifiantCategorie]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_DateCreation] ON [dbo].[Vehicules]([DateCreation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Location] ON [dbo].[Vehicules]([Latitude], [Longitude]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Modele] ON [dbo].[Vehicules]([IdentifiantModele]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Notes] ON [dbo].[Vehicules]([NotesVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Prix] ON [dbo].[Vehicules]([PrixJournalier]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Promotion] ON [dbo].[Vehicules]([EstPromotion]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Proprietaire] ON [dbo].[Vehicules]([IdentifiantProprietaire]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Statut] ON [dbo].[Vehicules]([StatutVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Vedette] ON [dbo].[Vehicules]([EstVedette]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Ville] ON [dbo].[Vehicules]([LocalisationVille]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_PhotosVehicules_Principale] ON [dbo].[PhotosVehicules]([EstPhotoPrincipale]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_PhotosVehicules_Vehicule] ON [dbo].[PhotosVehicules]([IdentifiantVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_DateCreation] ON [dbo].[Reservations]([DateCreationReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Dates] ON [dbo].[Reservations]([DateDebut], [DateFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Locataire] ON [dbo].[Reservations]([IdentifiantLocataire]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Paiement] ON [dbo].[Reservations]([StatutPaiement]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Proprietaire] ON [dbo].[Reservations]([IdentifiantProprietaire]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Statut] ON [dbo].[Reservations]([StatutReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Vehicule] ON [dbo].[Reservations]([IdentifiantVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ExtensionsReservations_Reservation] ON [dbo].[ExtensionsReservations]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ExtensionsReservations_Statut] ON [dbo].[ExtensionsReservations]([StatutDemande]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Transactions_Date] ON [dbo].[Transactions]([DateTransaction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Transactions_Reservation] ON [dbo].[Transactions]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Transactions_Statut] ON [dbo].[Transactions]([StatutTransaction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Transactions_Type] ON [dbo].[Transactions]([TypeTransaction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Transactions_Utilisateur] ON [dbo].[Transactions]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_MethodesPaiement_Principal] ON [dbo].[MethodesPaiementUtilisateurs]([EstMethodePrincipale]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_MethodesPaiement_Utilisateur] ON [dbo].[MethodesPaiementUtilisateurs]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Factures_DateEmission] ON [dbo].[Factures]([DateEmission]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Factures_Reservation] ON [dbo].[Factures]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Factures_Statut] ON [dbo].[Factures]([StatutFacture]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Factures_Utilisateur] ON [dbo].[Factures]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CodesPromo_Actif] ON [dbo].[CodesPromo]([Actif]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CodesPromo_Code] ON [dbo].[CodesPromo]([CodePromo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CodesPromo_Dates] ON [dbo].[CodesPromo]([DateDebut], [DateFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_UtilisationsPromo_Promo] ON [dbo].[UtilisationsCodesPromo]([IdentifiantPromo]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_UtilisationsPromo_Reservation] ON [dbo].[UtilisationsCodesPromo]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_UtilisationsPromo_Utilisateur] ON [dbo].[UtilisationsCodesPromo]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ProgrammeFidelite_Niveau] ON [dbo].[ProgrammeFidelite]([Niveau]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ProgrammeFidelite_Seuil] ON [dbo].[ProgrammeFidelite]([SeuilPoints]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Points_Date] ON [dbo].[PointsFidelite]([DateAcquisition]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Points_Expiration] ON [dbo].[PointsFidelite]([DateExpiration]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Points_Type] ON [dbo].[PointsFidelite]([TypeAcquisition]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Points_Utilisateur] ON [dbo].[PointsFidelite]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Parrainage_Code] ON [dbo].[ProgrammeParrainage]([CodeParrainage]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Parrainage_Filleul] ON [dbo].[ProgrammeParrainage]([IdentifiantFilleul]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Parrainage_Parrain] ON [dbo].[ProgrammeParrainage]([IdentifiantParrain]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Parrainage_Statut] ON [dbo].[ProgrammeParrainage]([StatutParrainage]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Notifications_DateCreation] ON [dbo].[Notifications]([DateCreation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Notifications_EstLu] ON [dbo].[Notifications]([EstLu]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Notifications_Priorite] ON [dbo].[Notifications]([PrioriteNotification]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Notifications_Type] ON [dbo].[Notifications]([TypeNotification]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Notifications_Utilisateur] ON [dbo].[Notifications]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Messages_Conversation] ON [dbo].[Messages]([IdentifiantConversation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Messages_DateEnvoi] ON [dbo].[Messages]([DateEnvoi]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Messages_Destinataire] ON [dbo].[Messages]([IdentifiantDestinataire]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Messages_EstLu] ON [dbo].[Messages]([EstLu]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Messages_Expediteur] ON [dbo].[Messages]([IdentifiantExpediteur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Avis_Auteur] ON [dbo].[Avis]([IdentifiantAuteur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Avis_Cible] ON [dbo].[Avis]([IdentifiantCible], [TypeCible]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Avis_DateCreation] ON [dbo].[Avis]([DateCreation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Avis_Note] ON [dbo].[Avis]([NoteGlobale] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Avis_Reservation] ON [dbo].[Avis]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Avis_Statut] ON [dbo].[Avis]([StatutAvis]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reclamations_DateCreation] ON [dbo].[Reclamations]([DateCreation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reclamations_Priorite] ON [dbo].[Reclamations]([PrioriteReclamation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reclamations_Reclamant] ON [dbo].[Reclamations]([IdentifiantReclamant]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reclamations_Reservation] ON [dbo].[Reclamations]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reclamations_Statut] ON [dbo].[Reclamations]([StatutReclamation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reclamations_Type] ON [dbo].[Reclamations]([TypeReclamation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Incidents_DateIncident] ON [dbo].[Incidents]([DateIncident]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Incidents_Reservation] ON [dbo].[Incidents]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Incidents_Statut] ON [dbo].[Incidents]([StatutTraitement]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Incidents_Type] ON [dbo].[Incidents]([TypeIncident]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Incidents_Vehicule] ON [dbo].[Incidents]([IdentifiantVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Favoris_DateAjout] ON [dbo].[Favoris]([DateAjout]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Favoris_Utilisateur] ON [dbo].[Favoris]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Favoris_Vehicule] ON [dbo].[Favoris]([IdentifiantVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_RecherchesSauvegardees_DateCreation] ON [dbo].[RecherchesSauvegardees]([DateCreation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_RecherchesSauvegardees_Utilisateur] ON [dbo].[RecherchesSauvegardees]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ReglesTarification_Actif] ON [dbo].[ReglesTarificationDynamique]([Actif]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ReglesTarification_Dates] ON [dbo].[ReglesTarificationDynamique]([DateDebut], [DateFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ReglesTarification_Priorite] ON [dbo].[ReglesTarificationDynamique]([Priorite] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ReglesTarification_Vehicule] ON [dbo].[ReglesTarificationDynamique]([IdentifiantVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_HistoriquePrix_Vehicule_Date] ON [dbo].[HistoriquePrixVehicules]([IdentifiantVehicule], [DateApplication]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Aggregations_Calcul] ON [dbo].[AggregationsUtilisateurs]([DateCalcul]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Aggregations_MiseAJour] ON [dbo].[AggregationsUtilisateurs]([DateMiseAJour]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ABTests_Code] ON [dbo].[A_B_Tests]([CodeTest]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ABTests_Dates] ON [dbo].[A_B_Tests]([DateDebut], [DateFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_ABTests_Statut] ON [dbo].[A_B_Tests]([StatutTest]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Cache_DerniereUtilisation] ON [dbo].[CacheRecherches]([DerniereUtilisation] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Cache_Expiration] ON [dbo].[CacheRecherches]([DateExpiration]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Cache_Utilisations] ON [dbo].[CacheRecherches]([CompteUtilisations] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_StatCache_Date] ON [dbo].[CacheStatistiques]([DateCalcul]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_StatCache_Type] ON [dbo].[CacheStatistiques]([TypeCache]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_BusinessRules_Actif] ON [dbo].[ConfigurationBusinessRules]([Actif]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_BusinessRules_Code] ON [dbo].[ConfigurationBusinessRules]([CodeRegle]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_BusinessRules_Priorite] ON [dbo].[ConfigurationBusinessRules]([Priorite] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_BusinessRules_Type] ON [dbo].[ConfigurationBusinessRules]([TypeRegle]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Conversations_Reservation] ON [dbo].[Conversations]([IdentifiantReservation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Conversations_Statut] ON [dbo].[Conversations]([StatutConversation]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Conversations_Utilisateur1] ON [dbo].[Conversations]([IdentifiantUtilisateur1]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Conversations_Utilisateur2] ON [dbo].[Conversations]([IdentifiantUtilisateur2]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Declencheurs_Actif] ON [dbo].[DeclencheursNotifications]([Actif]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Declencheurs_Priorite] ON [dbo].[DeclencheursNotifications]([Priorite] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Declencheurs_Type] ON [dbo].[DeclencheursNotifications]([TypeDeclencheur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Distances_Destination] ON [dbo].[DistancesPrecalculees]([IdentifiantDestination]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Distances_Origine] ON [dbo].[DistancesPrecalculees]([IdentifiantOrigine]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Chiffrement_Origine] ON [dbo].[DonneesChiffrees]([TableOrigine], [ColonneOrigine], [IdentifiantLigne]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_JournalAudit_DateAction] ON [dbo].[JournalAudit]([DateAction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_JournalAudit_Table] ON [dbo].[JournalAudit]([TableCible]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_JournalAudit_TypeAction] ON [dbo].[JournalAudit]([TypeAction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_JournalAudit_Utilisateur] ON [dbo].[JournalAudit]([IdentifiantUtilisateur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_LogsErreurs_DateErreur] ON [dbo].[LogsErreurs]([DateErreur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_LogsErreurs_EstResolu] ON [dbo].[LogsErreurs]([EstResolu]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_LogsErreurs_Gravite] ON [dbo].[LogsErreurs]([Gravite]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_LogsErreurs_TypeErreur] ON [dbo].[LogsErreurs]([TypeErreur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SignalementsAvis_Avis] ON [dbo].[SignalementsAvis]([IdentifiantAvis]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SignalementsAvis_Signaleur] ON [dbo].[SignalementsAvis]([IdentifiantSignaleur]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SignalementsAvis_Statut] ON [dbo].[SignalementsAvis]([StatutTraitement]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Templates_Actif] ON [dbo].[TemplatesNotifications]([Actif]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Templates_Categorie] ON [dbo].[TemplatesNotifications]([Categorie]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Templates_Type] ON [dbo].[TemplatesNotifications]([TypeNotification]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Zones_Geospatial] ON [dbo].[ZonesGeographiques]([CentroidLatitude], [CentroidLongitude]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Zones_Popularite] ON [dbo].[ZonesGeographiques]([Popularite] DESC);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IDX_Zones_Type] ON [dbo].[ZonesGeographiques]([TypeZone]);

-- AddForeignKey
ALTER TABLE [dbo].[AdressesUtilisateurs] ADD CONSTRAINT [FK_AdressesUtilisateurs_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentsUtilisateurs] ADD CONSTRAINT [FK_DocumentsUtilisateurs_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentsUtilisateurs] ADD CONSTRAINT [FK_DocumentsUtilisateurs_Verificateur] FOREIGN KEY ([VerifiePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PreferencesUtilisateurs] ADD CONSTRAINT [FK_PreferencesUtilisateurs_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ModelesVehicules] ADD CONSTRAINT [FK_ModelesVehicules_Marque] FOREIGN KEY ([IdentifiantMarque]) REFERENCES [dbo].[MarquesVehicules]([IdentifiantMarque]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Vehicules] ADD CONSTRAINT [FK_Vehicules_Categorie] FOREIGN KEY ([IdentifiantCategorie]) REFERENCES [dbo].[CategoriesVehicules]([IdentifiantCategorie]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Vehicules] ADD CONSTRAINT [FK_Vehicules_Modele] FOREIGN KEY ([IdentifiantModele]) REFERENCES [dbo].[ModelesVehicules]([IdentifiantModele]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Vehicules] ADD CONSTRAINT [FK_Vehicules_Proprietaire] FOREIGN KEY ([IdentifiantProprietaire]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PhotosVehicules] ADD CONSTRAINT [FK_PhotosVehicules_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CaracteristiquesTechniques] ADD CONSTRAINT [FK_CaracteristiquesTechniques_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reservations] ADD CONSTRAINT [FK_Reservations_AnnulePar] FOREIGN KEY ([AnnulePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reservations] ADD CONSTRAINT [FK_Reservations_Locataire] FOREIGN KEY ([IdentifiantLocataire]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reservations] ADD CONSTRAINT [FK_Reservations_Proprietaire] FOREIGN KEY ([IdentifiantProprietaire]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reservations] ADD CONSTRAINT [FK_Reservations_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ExtensionsReservations] ADD CONSTRAINT [FK_ExtensionsReservations_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transactions] ADD CONSTRAINT [FK_Transactions_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transactions] ADD CONSTRAINT [FK_Transactions_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MethodesPaiementUtilisateurs] ADD CONSTRAINT [FK_MethodesPaiement_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Factures] ADD CONSTRAINT [FK_Factures_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Factures] ADD CONSTRAINT [FK_Factures_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CodesPromo] ADD CONSTRAINT [FK_CodesPromo_Createur] FOREIGN KEY ([CreePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UtilisationsCodesPromo] ADD CONSTRAINT [FK_UtilisationsPromo_Promo] FOREIGN KEY ([IdentifiantPromo]) REFERENCES [dbo].[CodesPromo]([IdentifiantPromo]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UtilisationsCodesPromo] ADD CONSTRAINT [FK_UtilisationsPromo_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[UtilisationsCodesPromo] ADD CONSTRAINT [FK_UtilisationsPromo_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PointsFidelite] ADD CONSTRAINT [FK_PointsFidelite_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProgrammeParrainage] ADD CONSTRAINT [FK_Parrainage_Filleul] FOREIGN KEY ([IdentifiantFilleul]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProgrammeParrainage] ADD CONSTRAINT [FK_Parrainage_Parrain] FOREIGN KEY ([IdentifiantParrain]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [FK_Notifications_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [FK_Messages_Conversation] FOREIGN KEY ([IdentifiantConversation]) REFERENCES [dbo].[Conversations]([IdentifiantConversation]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [FK_Messages_Destinataire] FOREIGN KEY ([IdentifiantDestinataire]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [FK_Messages_Expediteur] FOREIGN KEY ([IdentifiantExpediteur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Avis] ADD CONSTRAINT [FK_Avis_Auteur] FOREIGN KEY ([IdentifiantAuteur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Avis] ADD CONSTRAINT [FK_Avis_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reclamations] ADD CONSTRAINT [FK_Reclamations_Assignation] FOREIGN KEY ([AssigneA]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reclamations] ADD CONSTRAINT [FK_Reclamations_Reclamant] FOREIGN KEY ([IdentifiantReclamant]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reclamations] ADD CONSTRAINT [FK_Reclamations_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Incidents] ADD CONSTRAINT [FK_Incidents_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Incidents] ADD CONSTRAINT [FK_Incidents_Traiteur] FOREIGN KEY ([TraitePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Incidents] ADD CONSTRAINT [FK_Incidents_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Favoris] ADD CONSTRAINT [FK_Favoris_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Favoris] ADD CONSTRAINT [FK_Favoris_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecherchesSauvegardees] ADD CONSTRAINT [FK_RecherchesSauvegardees_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ReglesTarificationDynamique] ADD CONSTRAINT [FK_RegleTarification_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HistoriquePrixVehicules] ADD CONSTRAINT [FK_HistoriquePrix_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AggregationsUtilisateurs] ADD CONSTRAINT [FK_Aggregation_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[A_B_Tests] ADD CONSTRAINT [FK_ABTests_Createur] FOREIGN KEY ([CreePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ConfigurationBusinessRules] ADD CONSTRAINT [FK_BusinessRules_Createur] FOREIGN KEY ([CreePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ConfigurationBusinessRules] ADD CONSTRAINT [FK_BusinessRules_Modificateur] FOREIGN KEY ([ModifiePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [FK_Conversations_Reservation] FOREIGN KEY ([IdentifiantReservation]) REFERENCES [dbo].[Reservations]([IdentifiantReservation]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [FK_Conversations_Utilisateur1] FOREIGN KEY ([IdentifiantUtilisateur1]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [FK_Conversations_Utilisateur2] FOREIGN KEY ([IdentifiantUtilisateur2]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [FK_Conversations_Vehicule] FOREIGN KEY ([IdentifiantVehicule]) REFERENCES [dbo].[Vehicules]([IdentifiantVehicule]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DeclencheursNotifications] ADD CONSTRAINT [FK_Declencheur_Template] FOREIGN KEY ([IdentifiantTemplate]) REFERENCES [dbo].[TemplatesNotifications]([IdentifiantTemplate]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DonneesChiffrees] ADD CONSTRAINT [FK_DonneesChiffrees_Utilisateur] FOREIGN KEY ([ChiffrePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[JournalAudit] ADD CONSTRAINT [FK_JournalAudit_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LogsErreurs] ADD CONSTRAINT [FK_LogsErreurs_Utilisateur] FOREIGN KEY ([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SignalementsAvis] ADD CONSTRAINT [FK_SignalementsAvis_Avis] FOREIGN KEY ([IdentifiantAvis]) REFERENCES [dbo].[Avis]([IdentifiantAvis]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SignalementsAvis] ADD CONSTRAINT [FK_SignalementsAvis_Signaleur] FOREIGN KEY ([IdentifiantSignaleur]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[SignalementsAvis] ADD CONSTRAINT [FK_SignalementsAvis_Traiteur] FOREIGN KEY ([TraitePar]) REFERENCES [dbo].[Utilisateurs]([IdentifiantUtilisateur]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ZonesGeographiques] ADD CONSTRAINT [FK_Zones_Parent] FOREIGN KEY ([ParentZone]) REFERENCES [dbo].[ZonesGeographiques]([IdentifiantZone]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
