from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class DonneesChiffrees(Base):
    """
    Modèle pour stocker des données sensibles chiffrées
    Table: DonneesChiffrees - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "DonneesChiffrees"

    IdentifiantChiffrement = Column(Integer, primary_key=True, index=True, autoincrement=True)
    TableOrigine = Column(String(100), nullable=False)
    ColonneOrigine = Column(String(100), nullable=False)
    IdentifiantLigne = Column(Integer, nullable=False)
    DonneesChiffrees = Column(LargeBinary, nullable=False)
    Algorithme = Column(String(50), default='AES_256')
    VecteurInitialisation = Column(LargeBinary(16))
    DateChiffrement = Column(DateTime, server_default=func.now())
    ChiffrePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))

    # Relations
    utilisateur = relationship("Utilisateur", foreign_keys=[ChiffrePar])

    __table_args__ = (
        Index('idx_chiffrement_origine', 'TableOrigine', 'ColonneOrigine', 'IdentifiantLigne'),
    )
