from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Conversation(Base):
    """
    Modèle pour les conversations entre utilisateurs
    Table: Conversations
    """
    __tablename__ = "Conversations"

    IdentifiantConversation = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdentifiantUtilisateur1 = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"), nullable=False)
    IdentifiantUtilisateur2 = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"), nullable=False)
    IdentifiantReservation = Column(Integer, ForeignKey("Reservations.IdentifiantReservation", ondelete="SET NULL"), nullable=True)
    IdentifiantVehicule = Column(Integer, ForeignKey("Vehicules.IdentifiantVehicule", ondelete="SET NULL"), nullable=True)
    SujetConversation = Column(String(255), nullable=True, comment="Sujet de la conversation")
    StatutConversation = Column(String(20), nullable=False, default="Active", comment="Active, Archivee, Fermee")
    DateCreation = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    DateDernierMessage = Column(DateTime(timezone=True), nullable=True)
    NombreMessages = Column(Integer, nullable=False, default=0)


    # Relations
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    reservation = relationship("Reservation", foreign_keys=[IdentifiantReservation])

    __table_args__ = (
        Index('idx_conversation_reservation', 'IdentifiantReservation'),
        Index('idx_conversation_utilisateur1', 'IdentifiantUtilisateur1'),
        Index('idx_conversation_utilisateur2', 'IdentifiantUtilisateur2'),
        Index('idx_conversation_statut', 'StatutConversation'),
        Index('idx_conversation_date', 'DateDernierMessage'),
    )
