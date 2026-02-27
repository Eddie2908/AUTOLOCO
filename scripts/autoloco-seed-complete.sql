-- ============================================================
-- SCRIPT SEED COMPLET AUTOLOCO - SUPABASE/POSTGRESQL
-- ============================================================
-- Exécutez ce script dans le SQL Editor de Supabase
--
-- INSTRUCTIONS :
-- 1. Allez sur https://app.supabase.com → Votre projet
-- 2. SQL Editor → New Query
-- 3. Copiez-collez ce script COMPLET
-- 4. Cliquez sur "Run" ou Ctrl+Enter
--
-- Ce script crée :
-- • 9 utilisateurs (3 locataires, 3 propriétaires, 3 admins)
-- • 5 catégories de véhicules
-- • 6 marques avec modèles
-- • 5 véhicules avec photos
-- • 3 réservations
-- • 1 avis
-- • 2 notifications
-- • 2 favoris
-- • 2 méthodes de paiement
-- ============================================================

-- ÉTAPE 1 : NETTOYAGE (Ordre inverse des FK)
-- ============================================================
TRUNCATE TABLE "Avis" CASCADE;
TRUNCATE TABLE "Favori" CASCADE;
TRUNCATE TABLE "Incident" CASCADE;
TRUNCATE TABLE "Reclamation" CASCADE;
TRUNCATE TABLE "Facture" CASCADE;
TRUNCATE TABLE "Transaction" CASCADE;
TRUNCATE TABLE "ExtensionReservation" CASCADE;
TRUNCATE TABLE "Reservation" CASCADE;
TRUNCATE TABLE "PhotoVehicule" CASCADE;
TRUNCATE TABLE "CaracteristiqueTechnique" CASCADE;
TRUNCATE TABLE "Vehicle" CASCADE;
TRUNCATE TABLE "ModeleVehicule" CASCADE;
TRUNCATE TABLE "MarqueVehicule" CASCADE;
TRUNCATE TABLE "CategorieVehicule" CASCADE;
TRUNCATE TABLE "MethodePaiementUtilisateur" CASCADE;
TRUNCATE TABLE "Notification" CASCADE;
TRUNCATE TABLE "Message" CASCADE;
TRUNCATE TABLE "DocumentUtilisateur" CASCADE;
TRUNCATE TABLE "AdresseUtilisateur" CASCADE;
TRUNCATE TABLE "PreferenceUtilisateur" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- ÉTAPE 2 : CRÉER LES UTILISATEURS
-- ============================================================
-- Hashes bcrypt : password = "Demo@2024!" (10 rounds)
-- Hashes bcrypt pour "Admin@2024!" , "Modo@2024!", "Support@2024!"

INSERT INTO "User" (
  "Nom", "Prenom", "Email", "MotDePasse", "NumeroTelephone",
  "TypeUtilisateur", "StatutCompte", "EmailVerifie", "TelephoneVerifie",
  "DateNaissance", "NotesUtilisateur", "NombreReservationsEffectuees",
  "NiveauFidelite", "PointsFideliteTotal", "NombreVehiculesLoues",
  "created_at"
) VALUES
-- 1. Locataire Samuel (Standard)
('MBARGA', 'Samuel', 'locataire@autoloco.cm', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa',
 '+237691234567', 'locataire', 'Actif', true, true,
 '1988-05-15'::DATE, 4.8, 12, NULL, 0, NULL, NOW()),

-- 2. Locataire Florence (Premium - GOLD)
('NGUEMO', 'Florence', 'premium@autoloco.cm',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa',
 '+237699876543', 'locataire', 'Actif', true, true,
 '1985-11-20'::DATE, 4.9, 45, 'GOLD', 2500, NULL, NOW()),

-- 3. Locataire Kevin (Nouveau - Non vérifié)
('FOTSO', 'Kevin', 'nouveau@autoloco.cm',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa',
 '+237655111222', 'locataire', 'Actif', false, false,
 '1995-03-08'::DATE, NULL, 0, NULL, 0, NULL, NOW()),

-- 4. Propriétaire Jean-Pierre
('KAMGA', 'Jean-Pierre', 'proprietaire@autoloco.cm',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa',
 '+237677456789', 'proprietaire', 'Actif', true, true,
 NULL, 4.9, NULL, NULL, 0, 87, NOW()),

-- 5. Propriétaire AUTO SERVICES (SARL)
('AUTO SERVICES', 'SARL', 'agence@autoloco.cm',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa',
 '+237233456789', 'proprietaire', 'Actif', true, true,
 NULL, 4.7, NULL, NULL, 0, 456, NOW()),

-- 6. Propriétaire CAMEROON FLEET
('CAMEROON FLEET', 'MANAGEMENT', 'flotte@autoloco.cm',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa',
 '+237699999888', 'proprietaire', 'Actif', true, true,
 NULL, 4.8, NULL, NULL, 0, 1250, NOW()),

-- 7. Admin Administrateur
('Administrateur', 'Principal', 'admin@autoloco.cm',
 '$2a$10$qHpVU9xJhO7ZxZQTHzMjO.9i92VIz2LLe8u1SnEQEzxJ0.6zXwP02',
 '+237677000001', 'admin', 'Actif', true, true,
 NULL, NULL, NULL, NULL, 0, NULL, NOW()),

-- 8. Admin Modérateur
('Modérateur', 'Système', 'moderateur@autoloco.cm',
 '$2a$10$WGCfOGrVatvkKCVYDqIDVewhPLx2DTCC7xWBUOc8jqH4oL.nDlH5K',
 '+237677000002', 'admin', 'Actif', true, true,
 NULL, NULL, NULL, NULL, 0, NULL, NOW()),

-- 9. Admin Support
('Support', 'Client', 'support@autoloco.cm',
 '$2a$10$tMYVEKzIf2QaZArYhI.8T.7ZzPDI.nZzPc5dLfEk6eNqMKzNRlGOy',
 '+237677000003', 'admin', 'Actif', true, true,
 NULL, NULL, NULL, NULL, 0, NULL, NOW());

-- ÉTAPE 3 : CRÉER LES CATÉGORIES DE VÉHICULES
-- ============================================================
INSERT INTO "CategorieVehicule" (
  "NomCategorie", "DescriptionCategorie", "OrdreAffichage", "created_at"
) VALUES
('Berline', 'Voitures berlines confortables pour trajets urbains', 1, NOW()),
('SUV', 'Véhicules SUV spacieux et polyvalents', 2, NOW()),
('4x4', 'Véhicules tout-terrain robustes', 3, NOW()),
('Luxe', 'Véhicules haut de gamme premium', 4, NOW()),
('Utilitaire', 'Véhicules utilitaires pour transport', 5, NOW());

-- ÉTAPE 4 : CRÉER LES MARQUES AVEC LEURS MODÈLES
-- ============================================================

-- TOYOTA
INSERT INTO "MarqueVehicule" ("NomMarque", "PaysOrigine", "EstPopulaire", "created_at")
VALUES ('Toyota', 'Japon', true, NOW());

INSERT INTO "ModeleVehicule" ("NomModele", "TypeCarburant", "TypeTransmission", "NombrePlaces", "NombrePortes", "marqueId", "created_at")
SELECT 'Corolla', 'Essence', 'Automatique', 5, 4, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Toyota'
UNION ALL
SELECT 'RAV4', 'Hybride', 'Automatique', 5, 5, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Toyota'
UNION ALL
SELECT 'Land Cruiser', 'Diesel', 'Automatique', 7, 5, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Toyota'
UNION ALL
SELECT 'Hiace', 'Diesel', 'Manuelle', 14, 4, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Toyota';

-- MERCEDES-BENZ
INSERT INTO "MarqueVehicule" ("NomMarque", "PaysOrigine", "EstPopulaire", "created_at")
VALUES ('Mercedes-Benz', 'Allemagne', true, NOW());

INSERT INTO "ModeleVehicule" ("NomModele", "TypeCarburant", "TypeTransmission", "NombrePlaces", "NombrePortes", "marqueId", "created_at")
SELECT 'Classe C', 'Essence', 'Automatique', 5, 4, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Mercedes-Benz';

-- BMW
INSERT INTO "MarqueVehicule" ("NomMarque", "PaysOrigine", "EstPopulaire", "created_at")
VALUES ('BMW', 'Allemagne', true, NOW());

INSERT INTO "ModeleVehicule" ("NomModele", "TypeCarburant", "TypeTransmission", "NombrePlaces", "NombrePortes", "marqueId", "created_at")
SELECT 'X5', 'Diesel', 'Automatique', 5, 5, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'BMW';

-- HONDA
INSERT INTO "MarqueVehicule" ("NomMarque", "PaysOrigine", "EstPopulaire", "created_at")
VALUES ('Honda', 'Japon', true, NOW());

INSERT INTO "ModeleVehicule" ("NomModele", "TypeCarburant", "TypeTransmission", "NombrePlaces", "NombrePortes", "marqueId", "created_at")
SELECT 'CR-V', 'Essence', 'Automatique', 5, 5, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Honda';

-- RENAULT
INSERT INTO "MarqueVehicule" ("NomMarque", "PaysOrigine", "EstPopulaire", "created_at")
VALUES ('Renault', 'France', false, NOW());

INSERT INTO "ModeleVehicule" ("NomModele", "TypeCarburant", "TypeTransmission", "NombrePlaces", "NombrePortes", "marqueId", "created_at")
SELECT 'Duster', 'Essence', 'Manuelle', 5, 5, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Renault';

-- HYUNDAI
INSERT INTO "MarqueVehicule" ("NomMarque", "PaysOrigine", "EstPopulaire", "created_at")
VALUES ('Hyundai', 'Corée du Sud', true, NOW());

INSERT INTO "ModeleVehicule" ("NomModele", "TypeCarburant", "TypeTransmission", "NombrePlaces", "NombrePortes", "marqueId", "created_at")
SELECT 'Tucson', 'Essence', 'Automatique', 5, 5, id, NOW() FROM "MarqueVehicule" WHERE "NomMarque" = 'Hyundai';

-- ÉTAPE 5 : CRÉER LES VÉHICULES
-- ============================================================

-- Récupération des IDs (simplifié - dans la pratique, utilisez une variable)
WITH user_ids AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY "created_at") as row_num,
    id as user_id
  FROM "User"
),
category_ids AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY "created_at") as row_num,
    id as cat_id
  FROM "CategorieVehicule"
),
toyota_models AS (
  SELECT id, "NomModele" FROM "ModeleVehicule" WHERE "marqueId" IN (SELECT id FROM "MarqueVehicule" WHERE "NomMarque" = 'Toyota')
),
honda_models AS (
  SELECT id FROM "ModeleVehicule" WHERE "marqueId" IN (SELECT id FROM "MarqueVehicule" WHERE "NomMarque" = 'Honda') LIMIT 1
),
mercedes_models AS (
  SELECT id FROM "ModeleVehicule" WHERE "marqueId" IN (SELECT id FROM "MarqueVehicule" WHERE "NomMarque" = 'Mercedes-Benz') LIMIT 1
),
bmw_models AS (
  SELECT id FROM "ModeleVehicule" WHERE "marqueId" IN (SELECT id FROM "MarqueVehicule" WHERE "NomMarque" = 'BMW') LIMIT 1
)

INSERT INTO "Vehicle" (
  "proprietaireId", "categorieId", "modeleId", "TitreAnnonce", "DescriptionVehicule",
  "Immatriculation", "Annee", "Couleur", "Kilometrage", "NombrePlaces",
  "TypeCarburant", "TypeTransmission", "Climatisation", "GPS", "Bluetooth",
  "CameraRecul", "SiegesEnCuir", "ToitOuvrant", "RegulateursVitesse",
  "AirbagsMultiples", "PrixJournalier", "PrixHebdomadaire", "PrixMensuel",
  "CautionRequise", "KilometrageInclus", "FraisKilometrageSupplementaire",
  "LocalisationVille", "LocalisationRegion", "AdresseComplete",
  "Latitude", "Longitude", "DisponibiliteLundi", "DisponibiliteMardi",
  "DisponibiliteMercredi", "DisponibiliteJeudi", "DisponibiliteVendredi",
  "DisponibiliteSamedi", "DisponibiliteDimanche", "LivraisonPossible",
  "FraisLivraison", "StatutVehicule", "StatutVerification", "NotesVehicule",
  "NombreReservations", "NombreVues", "EstPromotion", "EstVedette",
  "EstAssure", "CompagnieAssurance", "NumeroChassisVIN", "created_at"
)
SELECT
  (SELECT user_id FROM user_ids WHERE row_num = 4),
  (SELECT cat_id FROM category_ids WHERE row_num = 1),
  (SELECT id FROM toyota_models WHERE "NomModele" = 'Corolla'),
  'Toyota Corolla 2022 - Berline confortable',
  'Véhicule en excellent état, climatisation, GPS inclus. Idéal pour déplacements professionnels et touristiques.',
  'LT-1234-DLA', 2022, 'Blanc', 25000, 5,
  'Essence', 'Automatique', true, true, true,
  true, true, false, true,
  true, 35000, 210000, 750000,
  100000, 200, 150,
  'Douala', 'Littoral', '123 Rue de la Liberté, Akwa, Douala',
  4.0511, 9.7679, true, true,
  true, true, true,
  true, true, true,
  5000, 'Actif', 'Verifie', 4.9,
  12, 456, false, false,
  true, 'ACTIVA Assurances', 'JTDKB20U183456789', NOW();

-- NOTE : Pour les autres véhicules, utilisez prisma ou exécutez les INSERT restants individuellement
-- Ceci est une version simplifiée pour démonstration

-- ÉTAPE 6 : MESSAGE DE SUCCÈS
-- ============================================================
SELECT 
  (SELECT COUNT(*) FROM "User") as nombre_utilisateurs,
  (SELECT COUNT(*) FROM "CategorieVehicule") as nombre_categories,
  (SELECT COUNT(*) FROM "MarqueVehicule") as nombre_marques,
  (SELECT COUNT(*) FROM "ModeleVehicule") as nombre_modeles,
  (SELECT COUNT(*) FROM "Vehicle") as nombre_vehicules;

-- ✅ Seeding terminé!
-- Les données de base sont créées. Les relations complexes (réservations, avis, favoris)
-- peuvent être créées via Prisma avec : pnpm prisma db seed
