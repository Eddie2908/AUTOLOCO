-- =============================================================
-- Performance Indexes Migration - AUTOLOCO
-- =============================================================
-- Adds composite and covering indexes for the most frequent queries.
-- Each CREATE is guarded by IF NOT EXISTS to be safely re-runnable.
-- =============================================================

-- 1. Vehicules: composite index for the main list query
--    Covers: WHERE StatutVehicule != 'Desactive' ORDER BY EstVedette DESC, NotesVehicule DESC
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicules_Search_Composite' AND object_id = OBJECT_ID('Vehicules'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Vehicules_Search_Composite
    ON Vehicules (StatutVehicule, EstVedette DESC, NotesVehicule DESC)
    INCLUDE (TitreAnnonce, PrixJournalier, LocalisationVille, TypeCarburant, TypeTransmission, NombrePlaces, Annee);
END;

-- 2. Vehicules: individual filter indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicules_TypeCarburant' AND object_id = OBJECT_ID('Vehicules'))
    CREATE NONCLUSTERED INDEX IX_Vehicules_TypeCarburant ON Vehicules (TypeCarburant);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicules_TypeTransmission' AND object_id = OBJECT_ID('Vehicules'))
    CREATE NONCLUSTERED INDEX IX_Vehicules_TypeTransmission ON Vehicules (TypeTransmission);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicules_NombrePlaces' AND object_id = OBJECT_ID('Vehicules'))
    CREATE NONCLUSTERED INDEX IX_Vehicules_NombrePlaces ON Vehicules (NombrePlaces);

-- 3. Vehicules: owner + status composite for owner dashboard
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Vehicules_Owner_Statut' AND object_id = OBJECT_ID('Vehicules'))
    CREATE NONCLUSTERED INDEX IX_Vehicules_Owner_Statut ON Vehicules (IdentifiantProprietaire, StatutVehicule);

-- 4. Reservations: owner dashboard queries (owner + date range)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservations_Owner_Dates' AND object_id = OBJECT_ID('Reservations'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reservations_Owner_Dates
    ON Reservations (IdentifiantProprietaire, DateDebut, DateFin)
    INCLUDE (MontantTotal, StatutReservation, IdentifiantVehicule);
END;

-- 5. Reservations: availability check (used when creating bookings)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Reservations_Availability' AND object_id = OBJECT_ID('Reservations'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Reservations_Availability
    ON Reservations (IdentifiantVehicule, StatutReservation, DateDebut, DateFin);
END;

-- 6. Transactions: analytics composite (status + date for revenue queries)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Transactions_Analytics' AND object_id = OBJECT_ID('Transactions'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Transactions_Analytics
    ON Transactions (StatutTransaction, DateTransaction DESC)
    INCLUDE (Montant, TypeTransaction, MethodePaiement, FraisCommission, MontantNet);
END;
