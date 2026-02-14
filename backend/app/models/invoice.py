"""
Modèles SQLAlchemy pour les factures
=====================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, Text, Index, Boolean
from sqlalchemy.orm import relationship, column_property
from sqlalchemy.sql import case
from datetime import datetime

from app.core.database import Base


class Facture(Base):
    """Table des factures"""
    
    __tablename__ = "Factures"
    
    IdentifiantFacture = Column(Integer, primary_key=True, autoincrement=True)
    NumeroFacture = Column(String(50), unique=True, nullable=False)
    
    IdentifiantReservation = Column(
        Integer,
        ForeignKey("Reservations.IdentifiantReservation"),
        nullable=False,
        index=True
    )
    IdentifiantUtilisateur = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur"),
        nullable=False,
        index=True
    )
    
    DateEmission = Column(DateTime, default=datetime.utcnow, index=True)
    DateEcheance = Column(DateTime)
    
    MontantHT = Column(DECIMAL(10, 2), nullable=False)
    TauxTVA = Column(DECIMAL(5, 2), default=0)
    
    # Colonnes calculées (PERSISTED en SQL)
    # MontantTVA = MontantHT * TauxTVA / 100
    # MontantTTC = MontantHT * (1 + TauxTVA / 100)
    
    StatutFacture = Column(String(20), default='Emise', index=True)
    # Emise, Payee, Annulee, Remboursee
    
    CheminPDF = Column(String(500))
    DatePaiement = Column(DateTime)
    NotesFacture = Column(String(1000))
    
    # Relations
    reservation = relationship(
        "Reservation",
        foreign_keys=[IdentifiantReservation]
    )
    
    utilisateur = relationship(
        "Utilisateur",
        foreign_keys=[IdentifiantUtilisateur]
    )
    
    # Propriétés calculées pour compatibilité
    @property
    def MontantTVA(self):
        if self.MontantHT and self.TauxTVA:
            return float(self.MontantHT) * float(self.TauxTVA) / 100
        return 0
    
    @property
    def MontantTTC(self):
        if self.MontantHT and self.TauxTVA:
            return float(self.MontantHT) * (1 + float(self.TauxTVA) / 100)
        return float(self.MontantHT) if self.MontantHT else 0
    
    def __repr__(self):
        return f"<Facture(numero={self.NumeroFacture}, statut={self.StatutFacture}, montant_ttc={self.MontantTTC})>"


class MethodePaiementUtilisateur(Base):
    """Table des méthodes de paiement utilisateurs"""
    
    __tablename__ = "MethodesPaiementUtilisateurs"
    
    IdentifiantMethode = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    TypeMethode = Column(String(50), nullable=False)
    # CarteBancaire, MobileMoney, CompteBancaire, PayPal
    
    EstMethodePrincipale = Column(Boolean, default=False, index=True)
    Actif = Column(Boolean, default=True)
    
    Alias = Column(String(100))
    DerniersChiffres = Column(String(10))
    Fournisseur = Column(String(100))
    DateExpiration = Column(DateTime)
    
    DateAjout = Column(DateTime, default=datetime.utcnow)
    DateDerniereUtilisation = Column(DateTime)
    
    # Relation vers utilisateur
    utilisateur = relationship(
        "Utilisateur",
        back_populates="methodes_paiement"
    )
    
    def __repr__(self):
        return f"<MethodePaiementUtilisateur(id={self.IdentifiantMethode}, type={self.TypeMethode}, derniers_chiffres={self.DerniersChiffres})>"
