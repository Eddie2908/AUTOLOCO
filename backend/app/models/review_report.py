from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class SignalementAvis(Base):
    """
    Modèle pour les signalements d'avis inappropriés
    Table: SignalementsAvis - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "SignalementsAvis"

    IdentifiantSignalement = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdentifiantAvis = Column(Integer, ForeignKey("Avis.IdentifiantAvis"), nullable=False)
    IdentifiantSignaleur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    MotifSignalement = Column(String(50), nullable=False)
    DescriptionSignalement = Column(Text)
    DateSignalement = Column(DateTime, server_default=func.now())
    StatutTraitement = Column(String(20), default='EnAttente')
    DateTraitement = Column(DateTime)
    TraitePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    CommentairesTraitement = Column(String(500))

    # Relations
    avis = relationship("Avis", foreign_keys=[IdentifiantAvis])
    signaleur = relationship("Utilisateur", foreign_keys=[IdentifiantSignaleur])
    traitant = relationship("Utilisateur", foreign_keys=[TraitePar])

    __table_args__ = (
        Index('idx_signalement_avis', 'IdentifiantAvis'),
        Index('idx_signalement_signaleur', 'IdentifiantSignaleur'),
        Index('idx_signalement_statut', 'StatutTraitement'),
    )
