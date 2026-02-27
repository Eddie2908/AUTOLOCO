-- ============================================================
-- SCRIPT DE SEED SUPABASE
-- ============================================================
-- 
-- INSTRUCTIONS D'UTILISATION :
-- 1. Connectez-vous à https://app.supabase.com
-- 2. Allez à Votre Projet > SQL Editor
-- 3. Cliquez sur "New Query"
-- 4. Copier-coller le contenu de ce fichier
-- 5. Cliquez sur "Run" ou appuyez sur Ctrl+Entrée
--
-- ============================================================

-- Insérer les données d'exemple
-- Ajustez selon votre schéma réel

-- Exemple de données pour la table des utilisateurs (si applicable)
-- INSERT INTO users (id, email, full_name, created_at) VALUES
-- ('user-1', 'user1@example.com', 'John Doe', NOW()),
-- ('user-2', 'user2@example.com', 'Jane Smith', NOW());

-- Exemple pour d'autres tables
-- INSERT INTO your_table_name (column1, column2, column3) VALUES
-- ('value1', 'value2', 'value3'),
-- ('value4', 'value5', 'value6');

-- ============================================================
-- VÉRIFIER LES DONNÉES INSÉRÉES
-- ============================================================
SELECT COUNT(*) as total_records FROM information_schema.tables 
WHERE table_schema = 'public';
