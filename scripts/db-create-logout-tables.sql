-- =============================================
-- SCRIPT DE CRÉATION DES TABLES LOGOUT
-- AUTOLOCO - Système de Déconnexion Sécurisé
-- =============================================

USE AUTOLOCO;
GO

-- =============================================
-- 1. TABLE TokensBlacklist
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TokensBlacklist')
BEGIN
    CREATE TABLE TokensBlacklist (
        IdentifiantBlacklist INT IDENTITY PRIMARY KEY,
        JTI NVARCHAR(100) NOT NULL UNIQUE,
        TypeToken NVARCHAR(20) CHECK (TypeToken IN ('access', 'refresh')),
        IdentifiantUtilisateur INT NOT NULL,
        DateRevocation DATETIME2 DEFAULT SYSDATETIME(),
        DateExpiration DATETIME2 NOT NULL,
        RaisonRevocation NVARCHAR(100),
        AdresseIP NVARCHAR(45),
        UserAgent NVARCHAR(500),
        
        CONSTRAINT FK_TokensBlacklist_Utilisateur
            FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
        
        INDEX IX_TokensBlacklist_JTI (JTI),
        INDEX IX_TokensBlacklist_Utilisateur (IdentifiantUtilisateur),
        INDEX IX_TokensBlacklist_Expiration (DateExpiration)
    );
    
    PRINT 'Table TokensBlacklist créée avec succès.';
END
ELSE
BEGIN
    PRINT 'Table TokensBlacklist existe déjà.';
END
GO

-- =============================================
-- 2. TABLE SessionsActives
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SessionsActives')
BEGIN
    CREATE TABLE SessionsActives (
        IdentifiantSession INT IDENTITY PRIMARY KEY,
        IdentifiantUtilisateur INT NOT NULL,
        AccessTokenJTI NVARCHAR(100) NOT NULL,
        RefreshTokenJTI NVARCHAR(100) NOT NULL,
        AdresseIP NVARCHAR(45),
        UserAgent NVARCHAR(500),
        Appareil NVARCHAR(100),
        Navigateur NVARCHAR(50),
        Ville NVARCHAR(100),
        Pays NVARCHAR(100),
        DateCreation DATETIME2 DEFAULT SYSDATETIME(),
        DerniereActivite DATETIME2 DEFAULT SYSDATETIME(),
        DateExpiration DATETIME2 NOT NULL,
        EstActif BIT DEFAULT 1,
        
        CONSTRAINT FK_SessionsActives_Utilisateur
            FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur),
        
        INDEX IX_SessionsActives_Utilisateur_Actif (IdentifiantUtilisateur, EstActif),
        INDEX IX_SessionsActives_AccessJTI (AccessTokenJTI),
        INDEX IX_SessionsActives_RefreshJTI (RefreshTokenJTI)
    );
    
    PRINT 'Table SessionsActives créée avec succès.';
END
ELSE
BEGIN
    PRINT 'Table SessionsActives existe déjà.';
END
GO

-- =============================================
-- 3. PROCÉDURE: Nettoyage des tokens expirés
-- =============================================

CREATE OR ALTER PROCEDURE sp_CleanupExpiredTokens
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DeletedCount INT;
    
    -- Supprimer les tokens expirés depuis plus de 7 jours
    DELETE FROM TokensBlacklist
    WHERE DateExpiration < DATEADD(day, -7, SYSDATETIME());
    
    SET @DeletedCount = @@ROWCOUNT;
    
    -- Désactiver les sessions expirées
    UPDATE SessionsActives
    SET EstActif = 0
    WHERE DateExpiration < SYSDATETIME() AND EstActif = 1;
    
    PRINT CONCAT('Nettoyage terminé: ', @DeletedCount, ' tokens supprimés.');
END
GO

PRINT 'Procédure sp_CleanupExpiredTokens créée avec succès.';
GO

-- =============================================
-- 4. JOB SQL Agent: Nettoyage quotidien
-- =============================================

-- À configurer manuellement dans SQL Server Agent
-- ou via un cron job externe:
-- EXEC sp_CleanupExpiredTokens;
