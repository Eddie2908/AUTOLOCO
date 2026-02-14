from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ExtensionReservation(Base):
    """
    Modèle pour les extensions de réservations
    Table: ExtensionsReservations
    Compatible avec le schéma BD_autoloco v3 FINAL
    """
    __tablename__ = "ExtensionsReservations"

    IdentifiantExtension = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdentifiantReservation = Column(Integer, ForeignKey("Reservations.IdentifiantReservation", ondelete="CASCADE"), nullable=False)
    NouvelleDateFin = Column(DateTime(timezone=True), nullable=False, comment="Nouvelle date de fin après extension")
    AncienneDateFin = Column(DateTime(timezone=True), nullable=False, comment="Date de fin originale")
    JoursSupplementaires = Column(Integer, nullable=True, comment="Nombre de jours supplémentaires")
    MontantSupplementaire = Column(Numeric(10, 2), nullable=False, comment="Coût additionnel pour l'extension")
    StatutDemande = Column(String(20), nullable=False, default="EnAttente", comment="EnAttente, Acceptee, Refusee")
    DateDemande = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    DateReponse = Column(DateTime(timezone=True), nullable=True)
    RaisonExtension = Column(String(500), nullable=True, comment="Raison de la demande d'extension")
    RaisonRefus = Column(String(500), nullable=True, comment="Raison du refus si applicable")

    # Relations
    reservation = relationship("Reservation", back_populates="extensions")

    __table_args__ = (
        Index('idx_extension_reservation', 'IdentifiantReservation'),
        Index('idx_extension_statut', 'StatutDemande'),
    )
