-- ============================================
-- Script 002: Création des Utilisateurs SQL
-- AUTOLOCO - Séparation des Privilèges
-- ============================================
-- Exécuter après 001-create-database.sql

USE master;
GO

-- ============================================
-- 1. UTILISATEUR APPLICATIF (Runtime)
-- ============================================
-- Utilisé par l'application Next.js en production
-- Droits: SELECT, INSERT, UPDATE, DELETE, EXECUTE

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'autoloco_app')
BEGIN
    CREATE LOGIN autoloco_app 
    WITH PASSWORD = 'Ch@ng3M3InPr0duct!0n2025',
    CHECK_POLICY = ON,
    CHECK_EXPIRATION = OFF;
    
    PRINT 'Login autoloco_app créé.';
END
GO

USE autoloco_db;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'autoloco_app')
BEGIN
    CREATE USER autoloco_app FOR LOGIN autoloco_app;
    
    -- Droits de lecture/écriture sur les données
    ALTER ROLE db_datareader ADD MEMBER autoloco_app;
    ALTER ROLE db_datawriter ADD MEMBER autoloco_app;
    
    -- Droit d'exécuter les procédures stockées
    GRANT EXECUTE TO autoloco_app;
    
    PRINT 'Utilisateur autoloco_app créé avec droits lecture/écriture.';
END
GO

-- ============================================
-- 2. UTILISATEUR MIGRATION (DDL)
-- ============================================
-- Utilisé uniquement pour les migrations Prisma
-- Droits: db_owner (temporaire, à révoquer après migration)

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'autoloco_migration')
BEGIN
    CREATE LOGIN autoloco_migration 
    WITH PASSWORD = 'M!gr@t10nS3cur3P@ss2025',
    CHECK_POLICY = ON,
    CHECK_EXPIRATION = OFF;
    
    PRINT 'Login autoloco_migration créé.';
END
GO

USE autoloco_db;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'autoloco_migration')
BEGIN
    CREATE USER autoloco_migration FOR LOGIN autoloco_migration;
    ALTER ROLE db_owner ADD MEMBER autoloco_migration;
    
    PRINT 'Utilisateur autoloco_migration créé avec droits db_owner.';
END
GO

-- ============================================
-- 3. UTILISATEUR LECTURE SEULE (Analytics)
-- ============================================
-- Pour les rapports et analytics

IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'autoloco_readonly')
BEGIN
    CREATE LOGIN autoloco_readonly 
    WITH PASSWORD = 'R3@d0nly@cc3ss2025',
    CHECK_POLICY = ON,
    CHECK_EXPIRATION = OFF;
    
    PRINT 'Login autoloco_readonly créé.';
END
GO

USE autoloco_db;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'autoloco_readonly')
BEGIN
    CREATE USER autoloco_readonly FOR LOGIN autoloco_readonly;
    ALTER ROLE db_datareader ADD MEMBER autoloco_readonly;
    
    PRINT 'Utilisateur autoloco_readonly créé avec droits lecture seule.';
END
GO

-- ============================================
-- Résumé des utilisateurs créés
-- ============================================
PRINT '';
PRINT '=== RÉSUMÉ DES UTILISATEURS CRÉÉS ===';
PRINT 'autoloco_app      : Lecture/Écriture (APPLICATION)';
PRINT 'autoloco_migration: db_owner (MIGRATIONS)';
PRINT 'autoloco_readonly : Lecture seule (ANALYTICS)';
PRINT '';
PRINT 'IMPORTANT: Changez les mots de passe en production!';
GO
