-- Création de la table SessionActive pour AUTOLOCO
-- Compatible avec le modèle SQLAlchemy

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SessionActive]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SessionActive] (
        [IdentifiantSession] INT IDENTITY(1,1) PRIMARY KEY,
        [IdentifiantUtilisateur] INT NOT NULL,
        [AccessTokenJTI] NVARCHAR(100) NOT NULL,
        [RefreshTokenJTI] NVARCHAR(100) NOT NULL,
        [AdresseIP] NVARCHAR(45) NULL,
        [UserAgent] NVARCHAR(500) NULL,
        [Appareil] NVARCHAR(100) NULL,
        [Navigateur] NVARCHAR(50) NULL,
        [Ville] NVARCHAR(100) NULL,
        [Pays] NVARCHAR(100) NULL,
        [DateCreation] DATETIME DEFAULT GETDATE(),
        [DerniereActivite] DATETIME DEFAULT GETDATE(),
        [DateExpiration] DATETIME NOT NULL,
        [EstActif] BIT DEFAULT 1
    );

    -- Index pour améliorer les performances
    CREATE INDEX [IX_SessionActive_IdentifiantUtilisateur] ON [dbo].[SessionActive] ([IdentifiantUtilisateur]);
    CREATE INDEX [IX_SessionActive_AccessTokenJTI] ON [dbo].[SessionActive] ([AccessTokenJTI]);
    CREATE INDEX [IX_SessionActive_RefreshTokenJTI] ON [dbo].[SessionActive] ([RefreshTokenJTI]);
    CREATE INDEX [IX_SessionActive_EstActif] ON [dbo].[SessionActive] ([EstActif]);

    -- Clé étrangère vers la table Utilisateurs
    ALTER TABLE [dbo].[SessionActive] WITH CHECK ADD CONSTRAINT [FK_SessionActive_Utilisateur] FOREIGN KEY([IdentifiantUtilisateur]) REFERENCES [dbo].[Utilisateurs] ([IdentifiantUtilisateur]) ON DELETE CASCADE;

    PRINT 'Table SessionActive créée avec succès';
END
ELSE
BEGIN
    PRINT 'La table SessionActive existe déjà';
END
GO
