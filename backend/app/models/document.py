"""
Modèles SQLAlchemy pour les documents utilisateurs
===================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, BigInteger, String, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class DocumentUtilisateur(Base):
    """Table des documents utilisateurs avec vérification"""
    
    __tablename__ = "DocumentsUtilisateurs"
    
    IdentifiantDocument = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    TypeDocument = Column(String(50), nullable=False, index=True)
    # PermisConduire, CarteIdentite, Passeport, JustificatifDomicile, 
    # RIB, AssuranceVehicule, CarteGrise, Autre
    
    NomFichier = Column(String(255), nullable=False)
    CheminFichier = Column(String(500), nullable=False)
    TailleFichier = Column(BigInteger)  # BIGINT pour fichiers volumineux
    FormatFichier = Column(String(10))
    
    NumeroDocument = Column(String(100))
    DateExpiration = Column(DateTime, index=True)
    
    StatutVerification = Column(String(20), default='EnAttente', index=True)
    # EnAttente, Verifie, Rejete, Expire
    
    DateTeleversement = Column(DateTime, default=datetime.utcnow)
    DateVerification = Column(DateTime)
    
    VerifiePar = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur")
    )
    CommentairesVerification = Column(String(500))
    
    # Hash pour vérification d'intégrité SHA-256
    HashFichier = Column(LargeBinary(64))  # VARBINARY(64)
    
    # Relations
    utilisateur = relationship(
        "Utilisateur",
        back_populates="documents",
        foreign_keys=[IdentifiantUtilisateur]
    )
    
    verificateur = relationship(
        "Utilisateur",
        foreign_keys=[VerifiePar]
    )
    
    def __repr__(self):
        return f"<DocumentUtilisateur(id={self.IdentifiantDocument}, type={self.TypeDocument}, statut={self.StatutVerification})>"
