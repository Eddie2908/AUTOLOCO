"""
Modèle SQLAlchemy pour les paiements et transactions
=====================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Transaction(Base):
    """Table des transactions - Correspond à la table Transactions du schéma SQL"""
    
    __tablename__ = "Transactions"
    
    IdentifiantTransaction = Column(Integer, primary_key=True, autoincrement=True)
    NumeroTransaction = Column(String(100), unique=True, nullable=False)
    IdentifiantReservation = Column(Integer, ForeignKey("Reservations.IdentifiantReservation"))
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    
    # Type et montant
    TypeTransaction = Column(String(50), nullable=False)
    # Paiement, Remboursement, Caution, LibérationCaution, Commission, Penalite, Bonus, Points
    Montant = Column(DECIMAL(10, 2), nullable=False)
    Devise = Column(String(3), default='XOF')
    
    # Méthode de paiement
    MethodePaiement = Column(String(50), nullable=False)
    # CarteBancaire, MobileMoney, Virement, Especes, PayPal, Stripe, Autre
    FournisseurPaiement = Column(String(100))
    ReferenceExterne = Column(String(255))
    
    # Statut
    StatutTransaction = Column(String(30), default='EnAttente')
    # EnAttente, Reussie, Echouee, Annulee, EnCours, Remboursee
    
    # Dates
    DateTransaction = Column(DateTime, default=datetime.utcnow)
    DateTraitement = Column(DateTime)
    
    # Frais
    FraisTransaction = Column(DECIMAL(10, 2), default=0)
    FraisCommission = Column(DECIMAL(10, 2), default=0)
    MontantNet = Column(DECIMAL(10, 2))
    
    # Détails
    Description = Column(String(500))
    DetailsTransaction = Column(Text)  # JSON
    AdresseIPTransaction = Column(String(45))
    DeviceInfo = Column(String(500))
    
    # Erreurs
    CodeErreur = Column(String(50))
    MessageErreur = Column(String(500))
    NombreTentatives = Column(Integer, default=1)
    
    # Remboursement
    EstRembourse = Column(Boolean, default=False)
    DateRemboursement = Column(DateTime)
    IdentifiantTransactionRemboursement = Column(Integer)
    
    # Propriétés pour compatibilité avec l'ancien modèle Paiement
    @property
    def IdentifiantPaiement(self):
        return self.IdentifiantTransaction
    
    @property
    def ReferencePaiement(self):
        return self.NumeroTransaction
    
    @property
    def ReferenceGateway(self):
        return self.ReferenceExterne
    
    @property
    def Statut(self):
        # Mapper les statuts vers l'ancien format
        status_mapping = {
            'EnAttente': 'en_attente',
            'Reussie': 'confirme',
            'Echouee': 'echoue',
            'Annulee': 'echoue',
            'EnCours': 'en_attente',
            'Remboursee': 'rembourse'
        }
        return status_mapping.get(self.StatutTransaction, 'en_attente')
    
    @property
    def DateCreation(self):
        return self.DateTransaction
    
    @property
    def DatePaiement(self):
        return self.DateTraitement


# Alias pour compatibilité avec l'ancien code
Paiement = Transaction


# MethodePaiementUtilisateur et Facture sont définies dans app/models/invoice.py
# CodePromo et UtilisationCodePromo sont définies dans app/models/promo_code.py
# Importer depuis ces modules:
# from app.models.invoice import MethodePaiementUtilisateur, Facture
# from app.models.promo_code import CodePromo, UtilisationCodePromo
