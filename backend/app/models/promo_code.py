"""
Modèles SQLAlchemy pour les codes promo
========================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, DECIMAL, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class CodePromo(Base):
    """Table des promotions et codes promo"""
    
    __tablename__ = "CodesPromo"
    
    IdentifiantPromo = Column(Integer, primary_key=True, autoincrement=True)
    CodePromo = Column(String(50), unique=True, nullable=False, index=True)
    
    TypePromo = Column(String(20))
    # Pourcentage, Montant, NuitsGratuites
    ValeurPromo = Column(DECIMAL(10, 2), nullable=False)
    
    MontantMinimum = Column(DECIMAL(10, 2))
    
    NombreUtilisationsMax = Column(Integer)
    NombreUtilisationsActuel = Column(Integer, default=0)
    UtilisationsParUtilisateur = Column(Integer, default=1)
    
    DateDebut = Column(DateTime, nullable=False)
    DateFin = Column(DateTime, nullable=False)
    Actif = Column(Boolean, default=True, index=True)
    
    CategoriesApplicables = Column(Text)  # JSON array d'IdentifiantCategorie
    VehiculesApplicables = Column(Text)  # JSON array d'IdentifiantVehicule
    UtilisateursApplicables = Column(Text)  # JSON array d'IdentifiantUtilisateur
    
    Description = Column(String(500))
    
    CreePar = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur")
    )
    DateCreation = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    createur = relationship(
        "Utilisateur",
        foreign_keys=[CreePar]
    )
    
    utilisations = relationship(
        "UtilisationCodePromo",
        back_populates="code_promo",
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index('IDX_CodesPromo_Dates', 'DateDebut', 'DateFin'),
    )
    
    def __repr__(self):
        return f"<CodePromo(code={self.CodePromo}, type={self.TypePromo}, valeur={self.ValeurPromo})>"


class UtilisationCodePromo(Base):
    """Table des utilisations de codes promo"""
    
    __tablename__ = "UtilisationsCodesPromo"
    
    IdentifiantUtilisation = Column(Integer, primary_key=True, autoincrement=True)
    
    IdentifiantPromo = Column(
        Integer,
        ForeignKey("CodesPromo.IdentifiantPromo"),
        nullable=False,
        index=True
    )
    IdentifiantUtilisateur = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur"),
        nullable=False,
        index=True
    )
    IdentifiantReservation = Column(
        Integer,
        ForeignKey("Reservations.IdentifiantReservation"),
        nullable=False,
        index=True
    )
    
    MontantRemise = Column(DECIMAL(10, 2), nullable=False)
    DateUtilisation = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    code_promo = relationship(
        "CodePromo",
        back_populates="utilisations"
    )
    
    utilisateur = relationship(
        "Utilisateur",
        foreign_keys=[IdentifiantUtilisateur]
    )
    
    reservation = relationship(
        "Reservation",
        foreign_keys=[IdentifiantReservation]
    )
    
    def __repr__(self):
        return f"<UtilisationCodePromo(id={self.IdentifiantUtilisation}, promo={self.IdentifiantPromo}, user={self.IdentifiantUtilisateur})>"
