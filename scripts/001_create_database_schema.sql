-- =====================================================
-- AUTOLOCO Database Schema - SQL Server
-- Version: 1.0.0
-- Description: Complete database schema for AUTOLOCO vehicle rental platform
-- =====================================================

-- Create Database (run separately if needed)
-- CREATE DATABASE AutoLocaDB;
-- GO
-- USE AutoLocaDB;
-- GO

-- =====================================================
-- TABLE: Utilisateurs (Users)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Utilisateurs')
BEGIN
    CREATE TABLE Utilisateurs (
        IdentifiantUtilisateur INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        MotDePasseHash NVARCHAR(255) NOT NULL,
        TypeUtilisateur NVARCHAR(50) NOT NULL, -- locataire, proprietaire, admin
        Nom NVARCHAR(100) NOT NULL,
        Prenom NVARCHAR(100),
        Telephone NVARCHAR(20),
        Ville NVARCHAR(100),
        Quartier NVARCHAR(100),
        Avatar NVARCHAR(500),
        DateNaissance DATETIME,
        PermisConduire NVARCHAR(50),
        NumeroCNI NVARCHAR(50),
        TypeProfil NVARCHAR(50), -- particulier, professionnel, entreprise
        NumeroRCCM NVARCHAR(100),
        NoteGlobale FLOAT DEFAULT 0,
        Statut NVARCHAR(50) DEFAULT 'en_attente', -- en_attente, verifie, suspendu
        Badge NVARCHAR(50),
        EstActif BIT DEFAULT 1,
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DateModification DATETIME,
        DerniereConnexion DATETIME,
        
        INDEX IX_Utilisateurs_Email (Email),
        INDEX IX_Utilisateurs_TypeUtilisateur (TypeUtilisateur),
        INDEX IX_Utilisateurs_Ville (Ville)
    );
END
GO

-- =====================================================
-- TABLE: Vehicules (Vehicles)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vehicules')
BEGIN
    CREATE TABLE Vehicules (
        IdentifiantVehicule INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantProprietaire INT NOT NULL,
        Marque NVARCHAR(100) NOT NULL,
        Modele NVARCHAR(100) NOT NULL,
        Annee INT,
        TypeVehicule NVARCHAR(50), -- berline, suv, luxe, utilitaire, moto, 4x4
        PrixJournalier INT NOT NULL,
        ImagePrincipale NVARCHAR(500),
        Carburant NVARCHAR(50), -- essence, diesel, electrique, hybride
        Transmission NVARCHAR(50), -- automatique, manuelle
        NombrePlaces INT DEFAULT 5,
        NombrePortes INT DEFAULT 4,
        NoteGlobale FLOAT DEFAULT 0,
        NombreAvis INT DEFAULT 0,
        Adresse NVARCHAR(255),
        Ville NVARCHAR(100),
        Description NVARCHAR(MAX),
        LimiteKilometrique INT DEFAULT 200,
        IncluAssurance BIT DEFAULT 1,
        Caution INT DEFAULT 100000,
        Equipements NVARCHAR(MAX), -- JSON string
        EstVerifie BIT DEFAULT 0,
        EstMiseEnAvant BIT DEFAULT 0,
        EstDisponible BIT DEFAULT 1,
        ReservationInstantanee BIT DEFAULT 0,
        EstActif BIT DEFAULT 1,
        StatutVerification NVARCHAR(50) DEFAULT 'en_attente', -- en_attente, verifie, rejete
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DateModification DATETIME,
        
        CONSTRAINT FK_Vehicules_Proprietaire FOREIGN KEY (IdentifiantProprietaire) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        INDEX IX_Vehicules_Proprietaire (IdentifiantProprietaire),
        INDEX IX_Vehicules_Ville (Ville),
        INDEX IX_Vehicules_TypeVehicule (TypeVehicule),
        INDEX IX_Vehicules_PrixJournalier (PrixJournalier)
    );
END
GO

-- =====================================================
-- TABLE: ImagesVehicules (Vehicle Images)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ImagesVehicules')
BEGIN
    CREATE TABLE ImagesVehicules (
        IdentifiantImage INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantVehicule INT NOT NULL,
        UrlImage NVARCHAR(500) NOT NULL,
        OrdreAffichage INT DEFAULT 0,
        EstPrincipale BIT DEFAULT 0,
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ImagesVehicules_Vehicule FOREIGN KEY (IdentifiantVehicule) 
            REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE,
        INDEX IX_ImagesVehicules_Vehicule (IdentifiantVehicule)
    );
END
GO

-- =====================================================
-- TABLE: Reservations (Bookings)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reservations')
BEGIN
    CREATE TABLE Reservations (
        IdentifiantReservation INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantLocataire INT NOT NULL,
        IdentifiantVehicule INT NOT NULL,
        DateDebut DATETIME NOT NULL,
        DateFin DATETIME NOT NULL,
        NombreJours INT NOT NULL,
        LieuPriseEnCharge NVARCHAR(255),
        LieuRestitution NVARCHAR(255),
        PrixJournalier INT,
        SousTotal INT,
        FraisService INT,
        Assurance INT,
        Total INT NOT NULL,
        Caution INT,
        MethodePaiement NVARCHAR(50), -- mobile_money_mtn, mobile_money_orange, carte_bancaire, especes
        ReferencePaiement NVARCHAR(100),
        Statut NVARCHAR(50) DEFAULT 'en_attente', -- en_attente, confirmee, en_cours, terminee, annulee
        Notes NVARCHAR(MAX),
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DateModification DATETIME,
        DatePaiement DATETIME,
        
        CONSTRAINT FK_Reservations_Locataire FOREIGN KEY (IdentifiantLocataire) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        CONSTRAINT FK_Reservations_Vehicule FOREIGN KEY (IdentifiantVehicule) 
            REFERENCES Vehicules(IdentifiantVehicule),
        INDEX IX_Reservations_Locataire (IdentifiantLocataire),
        INDEX IX_Reservations_Vehicule (IdentifiantVehicule),
        INDEX IX_Reservations_Statut (Statut),
        INDEX IX_Reservations_DateDebut (DateDebut)
    );
END
GO

-- =====================================================
-- TABLE: Paiements (Payments)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Paiements')
BEGIN
    CREATE TABLE Paiements (
        IdentifiantPaiement INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantReservation INT NOT NULL,
        IdentifiantUtilisateur INT NOT NULL,
        Montant INT NOT NULL,
        MethodePaiement NVARCHAR(50) NOT NULL,
        ReferencePaiement NVARCHAR(100),
        ReferenceGateway NVARCHAR(100),
        Statut NVARCHAR(50) DEFAULT 'en_attente', -- en_attente, confirme, echoue, rembourse
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DatePaiement DATETIME,
        
        CONSTRAINT FK_Paiements_Reservation FOREIGN KEY (IdentifiantReservation) 
            REFERENCES Reservations(IdentifiantReservation),
        CONSTRAINT FK_Paiements_Utilisateur FOREIGN KEY (IdentifiantUtilisateur) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        INDEX IX_Paiements_Reservation (IdentifiantReservation),
        INDEX IX_Paiements_Utilisateur (IdentifiantUtilisateur),
        INDEX IX_Paiements_Statut (Statut)
    );
END
GO

-- =====================================================
-- TABLE: Avis (Reviews)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Avis')
BEGIN
    CREATE TABLE Avis (
        IdentifiantAvis INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantReservation INT NOT NULL,
        IdentifiantAuteur INT NOT NULL,
        IdentifiantVehicule INT,
        IdentifiantUtilisateurCible INT,
        Note FLOAT NOT NULL,
        Commentaire NVARCHAR(MAX),
        Reponse NVARCHAR(MAX),
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DateReponse DATETIME,
        
        CONSTRAINT FK_Avis_Reservation FOREIGN KEY (IdentifiantReservation) 
            REFERENCES Reservations(IdentifiantReservation),
        CONSTRAINT FK_Avis_Auteur FOREIGN KEY (IdentifiantAuteur) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        CONSTRAINT FK_Avis_Vehicule FOREIGN KEY (IdentifiantVehicule) 
            REFERENCES Vehicules(IdentifiantVehicule),
        CONSTRAINT FK_Avis_UtilisateurCible FOREIGN KEY (IdentifiantUtilisateurCible) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        INDEX IX_Avis_Reservation (IdentifiantReservation),
        INDEX IX_Avis_Vehicule (IdentifiantVehicule),
        INDEX IX_Avis_Auteur (IdentifiantAuteur)
    );
END
GO

-- =====================================================
-- TABLE: Conversations
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        IdentifiantConversation INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantUtilisateur1 INT NOT NULL,
        IdentifiantUtilisateur2 INT NOT NULL,
        IdentifiantVehicule INT,
        DernierMessage DATETIME,
        AperçuDernierMessage NVARCHAR(100),
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_Conversations_Utilisateur1 FOREIGN KEY (IdentifiantUtilisateur1) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        CONSTRAINT FK_Conversations_Utilisateur2 FOREIGN KEY (IdentifiantUtilisateur2) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        CONSTRAINT FK_Conversations_Vehicule FOREIGN KEY (IdentifiantVehicule) 
            REFERENCES Vehicules(IdentifiantVehicule),
        INDEX IX_Conversations_Utilisateur1 (IdentifiantUtilisateur1),
        INDEX IX_Conversations_Utilisateur2 (IdentifiantUtilisateur2)
    );
END
GO

-- =====================================================
-- TABLE: Messages
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Messages')
BEGIN
    CREATE TABLE Messages (
        IdentifiantMessage INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantConversation INT NOT NULL,
        IdentifiantExpediteur INT NOT NULL,
        IdentifiantDestinataire INT NOT NULL,
        Contenu NVARCHAR(MAX) NOT NULL,
        EstLu BIT DEFAULT 0,
        DateEnvoi DATETIME DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_Messages_Conversation FOREIGN KEY (IdentifiantConversation) 
            REFERENCES Conversations(IdentifiantConversation) ON DELETE CASCADE,
        CONSTRAINT FK_Messages_Expediteur FOREIGN KEY (IdentifiantExpediteur) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        CONSTRAINT FK_Messages_Destinataire FOREIGN KEY (IdentifiantDestinataire) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        INDEX IX_Messages_Conversation (IdentifiantConversation),
        INDEX IX_Messages_Expediteur (IdentifiantExpediteur),
        INDEX IX_Messages_Destinataire (IdentifiantDestinataire)
    );
END
GO

-- =====================================================
-- TABLE: Favoris (Favorites)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Favoris')
BEGIN
    CREATE TABLE Favoris (
        IdentifiantFavori INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantUtilisateur INT NOT NULL,
        IdentifiantVehicule INT NOT NULL,
        DateAjout DATETIME DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_Favoris_Utilisateur FOREIGN KEY (IdentifiantUtilisateur) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        CONSTRAINT FK_Favoris_Vehicule FOREIGN KEY (IdentifiantVehicule) 
            REFERENCES Vehicules(IdentifiantVehicule) ON DELETE CASCADE,
        CONSTRAINT UQ_Favoris_UtilisateurVehicule UNIQUE (IdentifiantUtilisateur, IdentifiantVehicule),
        INDEX IX_Favoris_Utilisateur (IdentifiantUtilisateur)
    );
END
GO

-- =====================================================
-- TABLE: Notifications
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        IdentifiantNotification INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantUtilisateur INT NOT NULL,
        Titre NVARCHAR(200) NOT NULL,
        Contenu NVARCHAR(MAX) NOT NULL,
        TypeNotification NVARCHAR(50) DEFAULT 'info', -- info, success, warning, error
        Categorie NVARCHAR(50), -- booking, payment, message, review, system
        Priorite NVARCHAR(20) DEFAULT 'normal',
        IconeNotification NVARCHAR(200),
        ActionURL NVARCHAR(500),
        DataJSON NVARCHAR(MAX),
        EstLue BIT DEFAULT 0,
        DateLecture DATETIME,
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DateExpiration DATETIME,
        
        CONSTRAINT FK_Notifications_Utilisateur FOREIGN KEY (IdentifiantUtilisateur) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        INDEX IX_Notifications_Utilisateur (IdentifiantUtilisateur),
        INDEX IX_Notifications_EstLue (EstLue)
    );
END
GO

-- =====================================================
-- TABLE: SessionsActives (Active Sessions)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SessionsActives')
BEGIN
    CREATE TABLE SessionsActives (
        IdentifiantSession INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantUtilisateur INT NOT NULL,
        TokenJTI NVARCHAR(100) NOT NULL UNIQUE,
        Appareil NVARCHAR(100),
        Navigateur NVARCHAR(100),
        AdresseIP NVARCHAR(45),
        Ville NVARCHAR(100),
        Pays NVARCHAR(100),
        EstActif BIT DEFAULT 1,
        DateCreation DATETIME DEFAULT GETUTCDATE(),
        DerniereActivite DATETIME DEFAULT GETUTCDATE(),
        DateExpiration DATETIME,
        
        CONSTRAINT FK_Sessions_Utilisateur FOREIGN KEY (IdentifiantUtilisateur) 
            REFERENCES Utilisateurs(IdentifiantUtilisateur),
        INDEX IX_Sessions_Utilisateur (IdentifiantUtilisateur),
        INDEX IX_Sessions_TokenJTI (TokenJTI)
    );
END
GO

-- =====================================================
-- TABLE: TokensBlacklist (Blacklisted Tokens)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TokensBlacklist')
BEGIN
    CREATE TABLE TokensBlacklist (
        IdentifiantBlacklist INT IDENTITY(1,1) PRIMARY KEY,
        TokenJTI NVARCHAR(100) NOT NULL UNIQUE,
        IdentifiantUtilisateur INT,
        TypeToken NVARCHAR(20), -- access, refresh
        Raison NVARCHAR(100),
        AdresseIP NVARCHAR(45),
        DateRevocation DATETIME DEFAULT GETUTCDATE(),
        DateExpiration DATETIME,
        
        INDEX IX_Blacklist_TokenJTI (TokenJTI),
        INDEX IX_Blacklist_Utilisateur (IdentifiantUtilisateur)
    );
END
GO

-- =====================================================
-- TABLE: JournalAudit (Audit Log)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'JournalAudit')
BEGIN
    CREATE TABLE JournalAudit (
        IdentifiantAudit INT IDENTITY(1,1) PRIMARY KEY,
        IdentifiantUtilisateur INT,
        Action NVARCHAR(100) NOT NULL,
        TypeEntite NVARCHAR(50),
        IdentifiantEntite INT,
        AnciennesValeurs NVARCHAR(MAX),
        NouvellesValeurs NVARCHAR(MAX),
        AdresseIP NVARCHAR(45),
        UserAgent NVARCHAR(500),
        DateAction DATETIME DEFAULT GETUTCDATE(),
        
        INDEX IX_Audit_Utilisateur (IdentifiantUtilisateur),
        INDEX IX_Audit_Action (Action),
        INDEX IX_Audit_DateAction (DateAction)
    );
END
GO

PRINT 'AUTOLOCO Database Schema created successfully!';
GO
