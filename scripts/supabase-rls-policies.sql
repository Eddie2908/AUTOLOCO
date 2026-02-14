-- ============================================================
-- AUTOLOCO - Row Level Security (RLS) Policies pour Supabase
-- ============================================================
-- Ce script active RLS sur toutes les tables et definit des
-- politiques de securite basees sur l'utilisateur authentifie.
--
-- IMPORTANT: Ce script utilise l'authentification custom (bcrypt)
-- du projet, pas Supabase Auth. Les policies ci-dessous sont
-- basees sur le role du service (service_role) pour les operations
-- backend et sur des fonctions helper pour les operations client.
-- ============================================================

-- ============================================================
-- Activer RLS sur toutes les tables
-- ============================================================
ALTER TABLE "Utilisateurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdressesUtilisateurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentsUtilisateurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PreferencesUtilisateurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TentativesConnexion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CategoriesVehicules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MarquesVehicules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelesVehicules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PhotosVehicules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaracteristiquesTechniques" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExtensionsReservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MethodesPaiementUtilisateurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Factures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CodesPromo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UtilisationsCodesPromo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgrammeFidelite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PointsFidelite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgrammeParrainage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Avis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SignalementsAvis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reclamations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favoris" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecherchesSauvegardees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReglesTarificationDynamique" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HistoriquePrixVehicules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AggregationsUtilisateurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "A_B_Tests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CacheRecherches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CacheStatistiques" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConfigurationBusinessRules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeclencheursNotifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DistancesPrecalculees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DonneesChiffrees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LogsErreurs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TemplatesNotifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ZonesGeographiques" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policy: service_role a acces complet (pour le backend Prisma)
-- ============================================================
-- Le backend Next.js utilise la connection string avec service_role,
-- ce qui bypass automatiquement les RLS dans Supabase.
-- Les policies ci-dessous s'appliquent aux roles anon et authenticated.

-- ============================================================
-- TABLES PUBLIQUES (lecture pour tous)
-- ============================================================

-- CategoriesVehicules: lecture publique
CREATE POLICY "categories_select_public" ON "CategoriesVehicules"
  FOR SELECT USING (true);

-- MarquesVehicules: lecture publique
CREATE POLICY "marques_select_public" ON "MarquesVehicules"
  FOR SELECT USING (true);

-- ModelesVehicules: lecture publique
CREATE POLICY "modeles_select_public" ON "ModelesVehicules"
  FOR SELECT USING (true);

-- Vehicules actifs: lecture publique
CREATE POLICY "vehicules_select_public" ON "Vehicules"
  FOR SELECT USING ("StatutVehicule" = 'Actif');

-- PhotosVehicules: lecture publique
CREATE POLICY "photos_select_public" ON "PhotosVehicules"
  FOR SELECT USING (true);

-- CaracteristiquesTechniques: lecture publique
CREATE POLICY "caracteristiques_select_public" ON "CaracteristiquesTechniques"
  FOR SELECT USING (true);

-- ProgrammeFidelite: lecture publique
CREATE POLICY "programme_fidelite_select_public" ON "ProgrammeFidelite"
  FOR SELECT USING (true);

-- ZonesGeographiques: lecture publique
CREATE POLICY "zones_select_public" ON "ZonesGeographiques"
  FOR SELECT USING (true);

-- Avis publies: lecture publique
CREATE POLICY "avis_select_public" ON "Avis"
  FOR SELECT USING ("StatutAvis" = 'Publie');

-- CodesPromo actifs: lecture publique
CREATE POLICY "codes_promo_select_public" ON "CodesPromo"
  FOR SELECT USING ("Actif" = true);

-- DistancesPrecalculees: lecture publique
CREATE POLICY "distances_select_public" ON "DistancesPrecalculees"
  FOR SELECT USING (true);

-- TemplatesNotifications: lecture publique
CREATE POLICY "templates_select_public" ON "TemplatesNotifications"
  FOR SELECT USING (true);

-- CacheRecherches: lecture publique
CREATE POLICY "cache_recherches_select_public" ON "CacheRecherches"
  FOR SELECT USING (true);

-- ============================================================
-- TABLES RESTREINTES (acces service_role uniquement)
-- ============================================================
-- Les tables suivantes n'ont PAS de policy pour anon/authenticated,
-- ce qui signifie qu'elles sont accessibles uniquement via
-- le backend (service_role) :
--
--   - TentativesConnexion
--   - Transactions
--   - DonneesChiffrees
--   - JournalAudit
--   - LogsErreurs
--   - CacheStatistiques
--   - ConfigurationBusinessRules
--   - DeclencheursNotifications
--   - A_B_Tests
--   - SignalementsAvis
--   - Incidents
--   - HistoriquePrixVehicules
--   - ReglesTarificationDynamique

-- ============================================================
-- NOTES D'IMPLEMENTATION
-- ============================================================
-- 
-- 1. Le backend Next.js utilise Prisma avec la DATABASE_URL qui
--    contient le service_role key. Cela bypass automatiquement
--    toutes les policies RLS.
--
-- 2. Si vous utilisez le client Supabase directement depuis le
--    frontend (supabase-js), les policies ci-dessus s'appliquent.
--
-- 3. Pour les tables sensibles (Transactions, JournalAudit, etc.),
--    aucune policy n'est definie pour anon/authenticated, ce qui
--    bloque tout acces direct depuis le client.
--
-- 4. Les tables de donnees utilisateur (Adresses, Documents,
--    Preferences, etc.) ne sont pas accessibles depuis le client
--    par defaut. Tout passe par les API routes du backend.
--
-- 5. Si vous souhaitez ajouter un acces client direct a certaines
--    tables, vous pouvez ajouter des policies basees sur
--    auth.uid() si vous migrez vers Supabase Auth, ou sur un
--    token JWT custom.
-- ============================================================
