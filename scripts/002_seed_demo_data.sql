-- =====================================================
-- AUTOLOCO Demo Data Seed
-- Description: Insert demo data for testing
-- =====================================================

USE AutoLocaDB;
GO

-- =====================================================
-- Demo Users
-- Passwords are hashed using bcrypt (Demo@2024!)
-- =====================================================
SET IDENTITY_INSERT Utilisateurs ON;

-- Admin user
INSERT INTO Utilisateurs (IdentifiantUtilisateur, Email, MotDePasseHash, TypeUtilisateur, Nom, Prenom, Telephone, Ville, Quartier, Statut, EstActif, DateCreation)
VALUES (1, 'admin@autoloco.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.nXfvp6H9P2xJm6', 'admin', 'Admin', 'System', '+237 699 000 000', 'Douala', 'Bonanjo', 'verifie', 1, GETUTCDATE());

-- Demo Locataires (Renters)
INSERT INTO Utilisateurs (IdentifiantUtilisateur, Email, MotDePasseHash, TypeUtilisateur, Nom, Prenom, Telephone, Ville, Quartier, Statut, NoteGlobale, Badge, EstActif, DateCreation)
VALUES 
(2, 'locataire@autoloco.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.nXfvp6H9P2xJm6', 'locataire', 'MBARGA', 'Samuel', '+237 691 234 567', 'Douala', 'Akwa', 'verifie', 4.8, NULL, 1, GETUTCDATE()),
(3, 'premium@autoloco.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.nXfvp6H9P2xJm6', 'locataire', 'NGUEMO', 'Florence', '+237 699 876 543', 'Yaoundé', 'Bastos', 'verifie', 4.9, 'premium', 1, GETUTCDATE());

-- Demo Proprietaires (Owners)
INSERT INTO Utilisateurs (IdentifiantUtilisateur, Email, MotDePasseHash, TypeUtilisateur, Nom, Prenom, Telephone, Ville, Quartier, TypeProfil, Statut, NoteGlobale, Badge, EstActif, DateCreation)
VALUES 
(4, 'proprietaire@autoloco.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.nXfvp6H9P2xJm6', 'proprietaire', 'KAMGA', 'Jean-Pierre', '+237 677 456 789', 'Douala', 'Bonapriso', 'particulier', 'verifie', 4.9, 'super_host', 1, GETUTCDATE()),
(5, 'agence@autoloco.cm', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.nXfvp6H9P2xJm6', 'proprietaire', 'AUTO SERVICES SARL', NULL, '+237 233 456 789', 'Yaoundé', 'Mvan', 'professionnel', 'verifie', 4.7, 'agence_partenaire', 1, GETUTCDATE());

SET IDENTITY_INSERT Utilisateurs OFF;
GO

-- =====================================================
-- Demo Vehicles
-- =====================================================
SET IDENTITY_INSERT Vehicules ON;

INSERT INTO Vehicules (IdentifiantVehicule, IdentifiantProprietaire, Marque, Modele, Annee, TypeVehicule, PrixJournalier, ImagePrincipale, Carburant, Transmission, NombrePlaces, NombrePortes, NoteGlobale, NombreAvis, Ville, Adresse, Description, Caution, EstVerifie, EstMiseEnAvant, EstDisponible, StatutVerification, DateCreation)
VALUES 
(1, 4, 'Toyota', 'Corolla', 2022, 'berline', 35000, '/toyota-corolla-2022-sedan-white.jpg', 'essence', 'automatique', 5, 4, 4.9, 124, 'Douala', 'Akwa, Douala', 'Toyota Corolla en excellent état, idéale pour vos déplacements en ville ou sur longue distance.', 100000, 1, 1, 1, 'verifie', GETUTCDATE()),
(2, 5, 'Honda', 'CR-V', 2021, 'suv', 50000, '/honda-crv-2021-suv-silver.jpg', 'diesel', 'automatique', 7, 5, 4.8, 89, 'Yaoundé', 'Bastos, Yaoundé', 'SUV spacieux et confortable, parfait pour les familles ou les voyages d''affaires.', 150000, 1, 0, 1, 'verifie', GETUTCDATE()),
(3, 5, 'Mercedes', 'Classe C', 2023, 'luxe', 75000, '/mercedes-c-class-luxury-black.jpg', 'essence', 'automatique', 5, 4, 5.0, 56, 'Douala', 'Bonapriso, Douala', 'Mercedes Classe C dernière génération, luxe et confort garantis.', 300000, 1, 1, 1, 'verifie', GETUTCDATE()),
(4, 4, 'Toyota', 'Hiace', 2020, 'utilitaire', 60000, '/toyota-hiace-minibus-white.jpg', 'diesel', 'manuelle', 15, 4, 4.7, 201, 'Bafoussam', 'Centre-ville, Bafoussam', 'Minibus idéal pour le transport de groupe, événements familiaux ou excursions.', 200000, 1, 0, 1, 'verifie', GETUTCDATE()),
(5, 4, 'BMW', 'X5', 2022, '4x4', 85000, '/bmw-x5-suv-black-luxury.jpg', 'diesel', 'automatique', 5, 5, 4.9, 67, 'Douala', 'Bonanjo, Douala', 'BMW X5 haut de gamme, puissance et élégance pour vos déplacements.', 350000, 1, 1, 1, 'verifie', GETUTCDATE()),
(6, 5, 'Renault', 'Duster', 2021, 'suv', 40000, '/renault-duster-suv-white.jpg', 'essence', 'manuelle', 5, 5, 4.6, 145, 'Yaoundé', 'Omnisport, Yaoundé', 'SUV compact et robuste, idéal pour la ville et les routes difficiles.', 100000, 1, 0, 1, 'verifie', GETUTCDATE()),
(7, 4, 'Toyota', 'Land Cruiser', 2020, '4x4', 95000, '/toyota-land-cruiser-4x4-white.jpg', 'diesel', 'automatique', 7, 5, 4.8, 78, 'Garoua', 'Centre, Garoua', 'Land Cruiser robuste, parfait pour les expéditions et les routes difficiles du Grand Nord.', 400000, 1, 1, 1, 'verifie', GETUTCDATE()),
(8, 5, 'Hyundai', 'Tucson', 2023, 'suv', 55000, '/hyundai-tucson-suv-blue.jpg', 'essence', 'automatique', 5, 5, 4.7, 42, 'Yaoundé', 'Ngousso, Yaoundé', 'Hyundai Tucson nouvelle génération, design moderne et technologies embarquées.', 150000, 1, 0, 1, 'verifie', GETUTCDATE());

SET IDENTITY_INSERT Vehicules OFF;
GO

-- =====================================================
-- Demo Bookings
-- =====================================================
SET IDENTITY_INSERT Reservations ON;

INSERT INTO Reservations (IdentifiantReservation, IdentifiantLocataire, IdentifiantVehicule, DateDebut, DateFin, NombreJours, LieuPriseEnCharge, LieuRestitution, PrixJournalier, SousTotal, FraisService, Assurance, Total, Caution, MethodePaiement, ReferencePaiement, Statut, DateCreation)
VALUES 
(1, 2, 1, DATEADD(day, 1, GETUTCDATE()), DATEADD(day, 4, GETUTCDATE()), 3, '123 Rue de la Liberté, Akwa, Douala', '123 Rue de la Liberté, Akwa, Douala', 35000, 105000, 5250, 5250, 115500, 100000, 'mobile_money_mtn', 'MTN-PAY-2024-789456', 'confirmee', GETUTCDATE()),
(2, 3, 3, DATEADD(day, 5, GETUTCDATE()), DATEADD(day, 10, GETUTCDATE()), 5, '45 Boulevard du 20 Mai, Mvan, Yaoundé', '45 Boulevard du 20 Mai, Mvan, Yaoundé', 75000, 375000, 18750, 18750, 412500, 300000, 'carte_bancaire', 'STRIPE-2024-456123', 'en_attente', GETUTCDATE());

SET IDENTITY_INSERT Reservations OFF;
GO

PRINT 'Demo data seeded successfully!';
GO
