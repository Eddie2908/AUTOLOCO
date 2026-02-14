BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Owner_Dates] ON [dbo].[Reservations]([IdentifiantProprietaire], [DateDebut], [DateFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Reservations_Availability] ON [dbo].[Reservations]([IdentifiantVehicule], [StatutReservation], [DateDebut], [DateFin]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Transactions_Analytics] ON [dbo].[Transactions]([StatutTransaction], [DateTransaction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Search_Composite] ON [dbo].[Vehicules]([StatutVehicule], [EstVedette], [NotesVehicule]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_TypeCarburant] ON [dbo].[Vehicules]([TypeCarburant]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_TypeTransmission] ON [dbo].[Vehicules]([TypeTransmission]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_NombrePlaces] ON [dbo].[Vehicules]([NombrePlaces]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_Vehicules_Owner_Statut] ON [dbo].[Vehicules]([IdentifiantProprietaire], [StatutVehicule]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
