-- ============================================
-- Script 001: Création de la Base de Données
-- AUTOLOCO - Application de Location de Véhicules
-- ============================================
-- Ce script doit être exécuté par un administrateur SQL Server
-- avant d'exécuter les migrations Prisma.

USE master;
GO

-- Vérifier si la base existe déjà
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'autoloco_db')
BEGIN
    -- Créer la base de données avec les paramètres optimaux
    CREATE DATABASE autoloco_db
    COLLATE French_CI_AS;  -- Collation française, insensible à la casse
    
    PRINT 'Base de données autoloco_db créée avec succès.';
END
ELSE
BEGIN
    PRINT 'La base de données autoloco_db existe déjà.';
END
GO

-- Configurer la base de données
USE autoloco_db;
GO

-- Activer READ_COMMITTED_SNAPSHOT pour éviter les deadlocks
ALTER DATABASE autoloco_db SET READ_COMMITTED_SNAPSHOT ON;
GO

-- Configurer le recovery model (FULL pour production, SIMPLE pour dev)
-- ALTER DATABASE autoloco_db SET RECOVERY FULL;
ALTER DATABASE autoloco_db SET RECOVERY SIMPLE;  -- Pour développement
GO

-- Activer la compression de page pour les grandes tables (Enterprise uniquement)
-- ALTER DATABASE autoloco_db SET PAGE_VERIFY CHECKSUM;
GO

PRINT 'Configuration de la base de données terminée.';
GO
