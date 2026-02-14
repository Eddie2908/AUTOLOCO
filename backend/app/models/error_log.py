from sqlalchemy import Column, BigInteger, Integer, String, Text, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class LogErreur(Base):
    """
    Modèle pour les logs d'erreurs système
    Table: LogsErreurs - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "LogsErreurs"

    IdentifiantLog = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    TypeErreur = Column(String(50), nullable=False)
    MessageErreur = Column(Text, nullable=False)
    StackTrace = Column(Text)
    Gravite = Column(String(20))
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    URL = Column(String(500))
    MethodeHTTP = Column(String(10))
    AdresseIP = Column(String(45))
    UserAgent = Column(String(500))
    DateErreur = Column(DateTime, server_default=func.now())
    Environnement = Column(String(20))
    Version = Column(String(20))
    EstResolu = Column(Boolean, default=False)
    DateResolution = Column(DateTime)

    # Relations
    utilisateur = relationship("Utilisateur", foreign_keys=[IdentifiantUtilisateur])

    __table_args__ = (
        Index('idx_log_erreur_type', 'TypeErreur'),
        Index('idx_log_erreur_gravite', 'Gravite'),
        Index('idx_log_erreur_date', 'DateErreur'),
        Index('idx_log_erreur_resolue', 'EstResolu'),
    )
