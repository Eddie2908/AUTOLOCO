-- Script de création des tables de notifications
-- Version: 1.0
-- Date: 2024
-- Description: Tables pour le système de notifications multi-canal

USE AutolocoAppDB;
GO

-- Table des notifications in-app
CREATE TABLE Notifications (
    IDNotification INT PRIMARY KEY IDENTITY(1,1),
    IDUtilisateur INT NOT NULL,
    Titre NVARCHAR(200) NOT NULL,
    Contenu NVARCHAR(MAX) NOT NULL,
    TypeNotification NVARCHAR(50) DEFAULT 'info',
    Categorie NVARCHAR(50),
    Priorite NVARCHAR(20) DEFAULT 'normal',
    IconeNotification NVARCHAR(200),
    ActionURL NVARCHAR(500),
    DataJSON NVARCHAR(MAX),
    EstLue BIT DEFAULT 0,
    DateLecture DATETIME2,
    DateCreation DATETIME2 DEFAULT GETUTCDATE() NOT NULL,
    DateExpiration DATETIME2,
    
    CONSTRAINT FK_Notifications_Utilisateur FOREIGN KEY (IDUtilisateur) 
        REFERENCES Utilisateurs(IDUtilisateur) ON DELETE CASCADE,
    
    INDEX IX_Notifications_Utilisateur (IDUtilisateur),
    INDEX IX_Notifications_EstLue (EstLue),
    INDEX IX_Notifications_DateCreation (DateCreation DESC),
    INDEX IX_Notifications_Categorie (Categorie)
);
GO

-- Table des templates de notifications
CREATE TABLE NotificationTemplates (
    IDTemplate INT PRIMARY KEY IDENTITY(1,1),
    CodeTemplate NVARCHAR(100) UNIQUE NOT NULL,
    NomTemplate NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    TypeNotification NVARCHAR(50) DEFAULT 'info',
    CategorieNotification NVARCHAR(50) NOT NULL,
    TitreNotification NVARCHAR(200) NOT NULL,
    ContenuNotification NVARCHAR(MAX),
    ContenuSMS NVARCHAR(160),
    ContenuPush NVARCHAR(200),
    SujetEmail NVARCHAR(200),
    IconeNotification NVARCHAR(200),
    ActionURL NVARCHAR(500),
    EstActif BIT DEFAULT 1,
    DateCreation DATETIME2 DEFAULT GETUTCDATE(),
    DateModification DATETIME2,
    
    INDEX IX_NotificationTemplates_CodeTemplate (CodeTemplate),
    INDEX IX_NotificationTemplates_Categorie (CategorieNotification)
);
GO

-- Table des préférences de notifications
CREATE TABLE NotificationPreferences (
    IDPreference INT PRIMARY KEY IDENTITY(1,1),
    IDUtilisateur INT NOT NULL,
    CategorieNotification NVARCHAR(50) NOT NULL,
    NotificationEmail BIT DEFAULT 1,
    NotificationSMS BIT DEFAULT 0,
    NotificationPush BIT DEFAULT 1,
    NotificationInApp BIT DEFAULT 1,
    FrequenceResume NVARCHAR(20) DEFAULT 'immediate',
    DateCreation DATETIME2 DEFAULT GETUTCDATE(),
    DateModification DATETIME2,
    
    CONSTRAINT FK_NotificationPreferences_Utilisateur FOREIGN KEY (IDUtilisateur)
        REFERENCES Utilisateurs(IDUtilisateur) ON DELETE CASCADE,
    
    CONSTRAINT UQ_NotificationPreferences_User_Category 
        UNIQUE (IDUtilisateur, CategorieNotification),
    
    INDEX IX_NotificationPreferences_Utilisateur (IDUtilisateur)
);
GO

-- Table des tokens d'appareils pour push notifications
CREATE TABLE DeviceTokens (
    IDDevice INT PRIMARY KEY IDENTITY(1,1),
    IDUtilisateur INT NOT NULL,
    Token NVARCHAR(500) UNIQUE NOT NULL,
    TypeDevice NVARCHAR(20),
    ModeleDevice NVARCHAR(100),
    VersionApp NVARCHAR(20),
    EstActif BIT DEFAULT 1,
    DerniereUtilisation DATETIME2,
    DateCreation DATETIME2 DEFAULT GETUTCDATE(),
    DateExpiration DATETIME2,
    
    CONSTRAINT FK_DeviceTokens_Utilisateur FOREIGN KEY (IDUtilisateur)
        REFERENCES Utilisateurs(IDUtilisateur) ON DELETE CASCADE,
    
    INDEX IX_DeviceTokens_Utilisateur (IDUtilisateur),
    INDEX IX_DeviceTokens_Token (Token)
);
GO

-- Insertion des templates de notifications par défaut
INSERT INTO NotificationTemplates (
    CodeTemplate, NomTemplate, CategorieNotification, TitreNotification,
    ContenuNotification, ContenuSMS, SujetEmail
) VALUES
('email_verification', 'Vérification email', 'account', 'Vérifiez votre email',
 'Cliquez sur le lien pour vérifier votre compte', 
 'Code de vérification: {token}',
 'Vérifiez votre compte AUTOLOCO'),

('booking_confirmed_renter', 'Confirmation réservation locataire', 'reservation',
 'Réservation confirmée',
 'Votre réservation {booking_number} est confirmée',
 'Réservation {booking_number} confirmée',
 'Votre réservation est confirmée'),

('booking_confirmed_owner', 'Confirmation réservation propriétaire', 'reservation',
 'Nouvelle réservation',
 'Vous avez une nouvelle réservation {booking_number}',
 'Nouvelle réservation {booking_number}',
 'Nouvelle réservation pour votre véhicule'),

('payment_receipt', 'Reçu de paiement', 'payment',
 'Paiement reçu',
 'Paiement de {amount} reçu avec succès',
 'Paiement {amount} reçu',
 'Reçu de paiement AUTOLOCO'),

('vehicle_approved', 'Véhicule approuvé', 'vehicle',
 'Véhicule approuvé',
 'Votre véhicule a été approuvé et est maintenant visible',
 'Véhicule approuvé',
 'Votre véhicule est approuvé'),

('account_suspended', 'Compte suspendu', 'security',
 'Compte suspendu',
 'Votre compte a été suspendu. Contactez le support.',
 'Compte suspendu',
 'Votre compte AUTOLOCO a été suspendu');
GO

PRINT 'Tables de notifications créées avec succès';
