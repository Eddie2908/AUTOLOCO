"""
Modèles SQLAlchemy pour les tentatives de connexion
====================================================
Sécurité anti-brute force - Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from datetime import datetime

from app.core.database import Base


class TentativeConnexion(Base):
    """Table des tentatives de connexion pour protection anti-brute force"""
    
    __tablename__ = "TentativesConnexion"
    
    IdentifiantTentative = Column(Integer, primary_key=True, autoincrement=True)
    
    AdresseEmail = Column(String(150), nullable=False)
    AdresseIP = Column(String(50), nullable=False)
    
    Reussie = Column(Boolean, default=False, index=True)
    CodeErreur = Column(String(50))
    MotifEchec = Column(String(255))
    
    DateTentative = Column(DateTime, default=datetime.utcnow, index=True)
    
    UserAgent = Column(String(500))
    Pays = Column(String(100))
    
    # Index composites pour recherches rapides
    __table_args__ = (
        Index('IDX_Tentatives_Email_Date', 'AdresseEmail', 'DateTentative'),
        Index('IDX_Tentatives_IP_Date', 'AdresseIP', 'DateTentative'),
    )
    
    def __repr__(self):
        return f"<TentativeConnexion(email={self.AdresseEmail}, ip={self.AdresseIP}, reussie={self.Reussie})>"
