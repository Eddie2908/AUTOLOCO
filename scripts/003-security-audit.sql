-- ============================================
-- Script 003: Configuration Sécurité et Audit
-- AUTOLOCO - Conformité et Traçabilité
-- ============================================

USE autoloco_db;
GO

-- ============================================
-- 1. TABLE D'AUDIT DES CONNEXIONS
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditConnexions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AuditConnexions] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [LoginName] NVARCHAR(128) NOT NULL,
        [HostName] NVARCHAR(128),
        [ApplicationName] NVARCHAR(256),
        [LoginTime] DATETIME2 DEFAULT SYSDATETIME(),
        [IPAddress] NVARCHAR(45),
        [Success] BIT DEFAULT 1
    );
    
    CREATE INDEX IX_AuditConnexions_LoginTime ON [dbo].[AuditConnexions]([LoginTime]);
    CREATE INDEX IX_AuditConnexions_LoginName ON [dbo].[AuditConnexions]([LoginName]);
    
    PRINT 'Table AuditConnexions créée.';
END
GO

-- ============================================
-- 2. TRIGGER D'AUDIT SUR MODIFICATIONS SENSIBLES
-- ============================================

-- Audit des modifications utilisateurs
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditModificationsUtilisateurs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AuditModificationsUtilisateurs] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UtilisateurId] INT NOT NULL,
        [ChampModifie] NVARCHAR(100) NOT NULL,
        [AncienneValeur] NVARCHAR(MAX),
        [NouvelleValeur] NVARCHAR(MAX),
        [ModifiePar] NVARCHAR(128) DEFAULT SYSTEM_USER,
        [DateModification] DATETIME2 DEFAULT SYSDATETIME(),
        [AdresseIP] NVARCHAR(45)
    );
    
    CREATE INDEX IX_AuditModifs_UtilisateurId ON [dbo].[AuditModificationsUtilisateurs]([UtilisateurId]);
    CREATE INDEX IX_AuditModifs_Date ON [dbo].[AuditModificationsUtilisateurs]([DateModification]);
    
    PRINT 'Table AuditModificationsUtilisateurs créée.';
END
GO

-- ============================================
-- 3. VUE POUR MONITORING DES PERFORMANCES
-- ============================================

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_PerformanceQueries')
    DROP VIEW vw_PerformanceQueries;
GO

CREATE VIEW vw_PerformanceQueries AS
SELECT TOP 50
    qs.total_elapsed_time / qs.execution_count AS avg_elapsed_time,
    qs.total_worker_time / qs.execution_count AS avg_cpu_time,
    qs.total_logical_reads / qs.execution_count AS avg_logical_reads,
    qs.execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2)+1) AS query_text,
    qs.last_execution_time
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY avg_elapsed_time DESC;
GO

PRINT 'Vue vw_PerformanceQueries créée.';
GO

-- ============================================
-- 4. POLITIQUE DE RÉTENTION DES DONNÉES
-- ============================================

-- Procédure de nettoyage des anciens audits (plus de 90 jours)
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'sp_CleanupOldAuditData')
    DROP PROCEDURE sp_CleanupOldAuditData;
GO

CREATE PROCEDURE sp_CleanupOldAuditData
    @DaysToKeep INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CutoffDate DATETIME2 = DATEADD(DAY, -@DaysToKeep, SYSDATETIME());
    
    -- Supprimer les anciens audits de connexion
    DELETE FROM [dbo].[AuditConnexions]
    WHERE [LoginTime] < @CutoffDate;
    
    -- Supprimer les anciens audits de modifications
    DELETE FROM [dbo].[AuditModificationsUtilisateurs]
    WHERE [DateModification] < @CutoffDate;
    
    -- Supprimer les anciens logs d'erreurs
    DELETE FROM [dbo].[LogsErreurs]
    WHERE [DateErreur] < @CutoffDate;
    
    PRINT 'Nettoyage des données d''audit terminé.';
END
GO

PRINT 'Procédure sp_CleanupOldAuditData créée.';
PRINT '';
PRINT '=== CONFIGURATION SÉCURITÉ TERMINÉE ===';
GO
