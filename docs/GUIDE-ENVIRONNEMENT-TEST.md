# Guide de l'Environnement de Test AUTOLOCO

## Vue d'ensemble

Ce guide explique comment utiliser l'environnement de test pour générer et gérer des utilisateurs fictifs afin de tester toutes les fonctionnalités de l'application.

## Table des matières

1. [Accès rapide](#accès-rapide)
2. [Génération d'utilisateurs](#génération-dutilisateurs)
3. [Connexion rapide](#connexion-rapide)
4. [Profils disponibles](#profils-disponibles)
5. [Scénarios de test](#scénarios-de-test)
6. [Bonnes pratiques](#bonnes-pratiques)

---

## Accès rapide

### URLs importantes

- **Interface de génération** : `/test/users`
- **Connexion rapide** : `/test/quick-login`
- **Documentation** : Ce fichier

### Identifiants pré-configurés

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| **Locataires** |
| Standard | locataire@autoloco.cm | Demo@2024! | 12 réservations, vérifié |
| Premium | premium@autoloco.cm | Demo@2024! | 45 réservations, Gold |
| Nouveau | nouveau@autoloco.cm | Demo@2024! | 0 réservation, non vérifié |
| **Propriétaires** |
| Particulier | proprietaire@autoloco.cm | Demo@2024! | 2 véhicules, 87 locations |
| Professionnel | agence@autoloco.cm | Demo@2024! | 8 véhicules, 456 locations |
| Entreprise | flotte@autoloco.cm | Demo@2024! | 15 véhicules, 1250 locations |
| **Administrateurs** |
| Admin principal | admin@autoloco.cm | Admin@2024! | Accès complet |
| Modérateur | moderateur@autoloco.cm | Modo@2024! | Modération |
| Support | support@autoloco.cm | Support@2024! | Support client |

---

## Génération d'utilisateurs

### Accéder à l'interface

1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:3000/test/users`
3. Vous verrez l'interface de génération

### Générer des utilisateurs

1. **Configurer les quantités** :
   \`\`\`
   - Locataires : 5
   - Propriétaires : 3
   - Administrateurs : 1
   \`\`\`

2. **Cliquer sur "Générer"** :
   - Les utilisateurs sont créés instantanément
   - Chaque utilisateur a des données réalistes
   - Les emails sont uniques

3. **Récupérer les identifiants** :
   - Afficher la liste des utilisateurs générés
   - Copier les identifiants individuellement
   - Exporter tout en CSV

### Caractéristiques des utilisateurs générés

#### Locataires
- Noms et prénoms camerounais
- Emails avec domaine @autoloco.cm ou @email.cm
- Âge : 18 à 65 ans
- Statut : 80% vérifiés, 20% en attente
- Réservations : 0 à 20 (70% ont des réservations)
- 20% sont des clients premium (niveau GOLD)

#### Propriétaires
- 30% d'entreprises, 70% de particuliers
- Entreprises : 3 à 15 véhicules
- Particuliers : 1 à 3 véhicules
- Statut : 85% vérifiés
- Historique de locations généré automatiquement

#### Administrateurs
- Rôles variés : Admin, Modérateur, Support, Superviseur
- Tous vérifiés et actifs
- Accès complet aux fonctionnalités

### Mot de passe par défaut

Tous les utilisateurs générés utilisent le mot de passe :
\`\`\`
Test@2024!
\`\`\`

---

## Connexion rapide

### Utiliser l'interface de connexion rapide

1. Allez sur : `http://localhost:3000/test/quick-login`
2. Choisissez un profil dans la liste
3. Cliquez sur "Se connecter"
4. Vous êtes automatiquement redirigé vers le dashboard approprié

### Avantages

- Connexion en 1 clic
- Pas besoin de mémoriser les mots de passe
- Vue d'ensemble de tous les profils disponibles
- Informations sur chaque profil (réservations, notes, etc.)

---

## Profils disponibles

### 1. Locataire Standard
**Email** : locataire@autoloco.cm  
**Mot de passe** : Demo@2024!

**Caractéristiques** :
- 12 réservations effectuées
- Note : 4.8/5
- Compte vérifié
- Ville : Douala

**Utilisez ce profil pour tester** :
- Recherche et réservation de véhicules
- Consultation de l'historique
- Modification de profil
- Système de notation

### 2. Locataire Premium (Gold)
**Email** : premium@autoloco.cm  
**Mot de passe** : Demo@2024!

**Caractéristiques** :
- 45 réservations effectuées
- Note : 4.9/5
- Niveau : GOLD
- 2500 points de fidélité

**Utilisez ce profil pour tester** :
- Programme de fidélité
- Avantages premium
- Réservations fréquentes
- Statut VIP

### 3. Nouveau Locataire
**Email** : nouveau@autoloco.cm  
**Mot de passe** : Demo@2024!

**Caractéristiques** :
- Aucune réservation
- Compte non vérifié
- Email non vérifié

**Utilisez ce profil pour tester** :
- Onboarding nouveaux utilisateurs
- Processus de vérification
- Première réservation
- Limitations des comptes non vérifiés

### 4. Propriétaire Particulier
**Email** : proprietaire@autoloco.cm  
**Mot de passe** : Demo@2024!

**Caractéristiques** :
- 2 véhicules
- 87 locations effectuées
- Note : 4.9/5
- Temps de réponse : < 1 heure

**Utilisez ce profil pour tester** :
- Ajout de véhicules
- Gestion des réservations reçues
- Calendrier de disponibilité
- Communication avec locataires

### 5. Agence Professionnelle
**Email** : agence@autoloco.cm  
**Mot de passe** : Demo@2024!

**Caractéristiques** :
- 8 véhicules
- 456 locations effectuées
- Badge : Agence Partenaire
- Numéro RCCM

**Utilisez ce profil pour tester** :
- Gestion de flotte
- Statistiques d'agence
- Tarification professionnelle
- Outils de gestion avancés

### 6. Gestionnaire de Flotte
**Email** : flotte@autoloco.cm  
**Mot de passe** : Demo@2024!

**Caractéristiques** :
- 15 véhicules
- 1250 locations effectuées
- Badge : Flotte Premium
- Temps de réponse : < 15 min

**Utilisez ce profil pour tester** :
- Gestion de grande flotte
- Analytics avancées
- Optimisation des revenus
- Support prioritaire

### 7. Administrateur Principal
**Email** : admin@autoloco.cm  
**Mot de passe** : Admin@2024!

**Caractéristiques** :
- Accès complet à toutes les fonctionnalités
- Gestion utilisateurs
- Gestion véhicules
- Statistiques globales

**Utilisez ce profil pour tester** :
- Dashboard administrateur
- Modération du contenu
- Gestion des réclamations
- Rapports et analytics
- Configuration du système

### 8. Modérateur
**Email** : moderateur@autoloco.cm  
**Mot de passe** : Modo@2024!

**Caractéristiques** :
- Modération du contenu
- Gestion des réclamations
- Support utilisateurs

**Utilisez ce profil pour tester** :
- Modération des avis
- Traitement des réclamations
- Support utilisateurs
- Validation des documents

---

## Scénarios de test

### Scénario 1 : Parcours complet locataire

1. **Connexion** : Utilisez le nouveau locataire
2. **Recherche** : Cherchez un véhicule à Douala
3. **Réservation** : Réservez pour 3 jours
4. **Paiement** : Simulez le paiement
5. **Confirmation** : Vérifiez l'email de confirmation
6. **Dashboard** : Consultez la réservation

### Scénario 2 : Gestion véhicule propriétaire

1. **Connexion** : Utilisez le propriétaire particulier
2. **Ajout véhicule** : Ajoutez un nouveau véhicule
3. **Photos** : Uploadez des photos
4. **Tarification** : Configurez les prix
5. **Disponibilité** : Définissez le calendrier
6. **Publication** : Activez l'annonce

### Scénario 3 : Administration et modération

1. **Connexion** : Utilisez l'administrateur
2. **Utilisateurs** : Consultez la liste des utilisateurs
3. **Véhicules** : Modérez les véhicules
4. **Statistiques** : Consultez le dashboard analytics
5. **Réclamations** : Traitez les réclamations
6. **Configuration** : Modifiez les paramètres

### Scénario 4 : Test des contrôles d'accès

1. **Locataire** : Essayez d'accéder au dashboard propriétaire → Doit être bloqué
2. **Propriétaire** : Essayez d'accéder au dashboard admin → Doit être bloqué
3. **Admin** : Accédez à tous les dashboards → Doit fonctionner
4. **Non connecté** : Essayez d'accéder aux dashboards → Redirigé vers login

### Scénario 5 : Test du système de notation

1. **Connexion locataire** : premium@autoloco.cm
2. **Historique** : Consultez les réservations passées
3. **Notation** : Laissez un avis sur un véhicule
4. **Connexion propriétaire** : proprietaire@autoloco.cm
5. **Vérification** : Consultez l'avis reçu
6. **Réponse** : Répondez à l'avis

---

## Bonnes pratiques

### Avant de commencer les tests

1. **Vérifiez la base de données** :
   \`\`\`bash
   npm run db:check
   \`\`\`

2. **Générez des données de test** :
   - Allez sur `/test/users`
   - Générez au moins 5 locataires et 3 propriétaires

3. **Notez les identifiants** :
   - Exportez le CSV pour référence
   - Gardez la page `/test/quick-login` ouverte dans un onglet

### Pendant les tests

1. **Utilisez plusieurs profils** :
   - Testez les interactions entre locataires et propriétaires
   - Vérifiez les notifications croisées

2. **Vérifiez les permissions** :
   - Essayez d'accéder à des ressources non autorisées
   - Confirmez les redirections correctes

3. **Testez les cas limites** :
   - Compte non vérifié
   - Utilisateur suspendu
   - Données manquantes

4. **Vérifiez les logs** :
   \`\`\`bash
   npm run dev
   # Consultez les logs dans la console
   \`\`\`

### Après les tests

1. **Nettoyez les données de test** (optionnel) :
   - Allez sur `/test/users`
   - Cliquez sur "Supprimer tout"
   - Confirmez la suppression

2. **Documentez les bugs** :
   - Notez le profil utilisé
   - Décrivez les étapes de reproduction
   - Capturez des screenshots

3. **Réinitialisez si nécessaire** :
   \`\`\`bash
   npm run db:reset
   npm run db:seed
   \`\`\`

---

## Résolution de problèmes

### Problème : Impossible de générer des utilisateurs

**Solution** :
1. Vérifiez que la base de données est accessible
2. Vérifiez les logs du serveur
3. Essayez de réduire le nombre d'utilisateurs

### Problème : Connexion échoue

**Solution** :
1. Vérifiez que l'utilisateur existe dans la base
2. Vérifiez le mot de passe (sensible à la casse)
3. Videz le cache du navigateur
4. Essayez en navigation privée

### Problème : Accès refusé à un dashboard

**Solution** :
1. Vérifiez le rôle de l'utilisateur
2. Confirmez que vous êtes bien connecté
3. Consultez les logs de sécurité
4. Vérifiez les permissions dans `/lib/security/permissions.ts`

### Problème : Données incohérentes

**Solution** :
1. Réinitialisez la base de données :
   \`\`\`bash
   npm run db:reset
   npm run db:seed
   \`\`\`
2. Régénérez les utilisateurs de test
3. Vérifiez l'intégrité des données

---

## Fonctionnalités avancées

### Script de génération personnalisé

Créez vos propres scripts pour générer des données spécifiques :

\`\`\`typescript
// scripts/custom-test-data.ts
import { generateBatchUsers } from '@/lib/test/user-generator'

async function customGeneration() {
  // 10 locataires premium
  const premiumUsers = await generateBatchUsers({
    locataires: 10,
  })
  
  // Tous sont premium
  // Ajoutez votre logique personnalisée ici
}
\`\`\`

### API pour automatisation

Utilisez les endpoints API pour automatiser :

\`\`\`bash
# Générer 20 locataires
curl -X POST http://localhost:3000/api/test/generate-users \
  -H "Content-Type: application/json" \
  -d '{"locataires": 20, "proprietaires": 5, "admins": 2}'

# Supprimer tous les utilisateurs de test
curl -X DELETE http://localhost:3000/api/test/delete-test-users
\`\`\`

---

## Support et Contribution

### Besoin d'aide ?

- Consultez la documentation complète dans `/docs/`
- Vérifiez les guides de sécurité
- Contactez l'équipe de développement

### Améliorer l'environnement de test

Pour ajouter de nouvelles fonctionnalités :

1. Modifiez `/lib/test/user-generator.ts`
2. Mettez à jour `/app/test/users/page.tsx`
3. Documentez les changements dans ce fichier
4. Testez avec différents profils

---

## Checklist de test complète

### Tests fonctionnels

- [ ] Inscription d'un nouveau locataire
- [ ] Inscription d'un nouveau propriétaire
- [ ] Connexion avec différents profils
- [ ] Recherche de véhicules
- [ ] Création d'une réservation
- [ ] Paiement d'une réservation
- [ ] Annulation de réservation
- [ ] Ajout d'un véhicule (propriétaire)
- [ ] Modification de véhicule
- [ ] Gestion du calendrier
- [ ] Système de notation
- [ ] Messagerie entre utilisateurs
- [ ] Notifications

### Tests de sécurité

- [ ] Contrôle d'accès par rôle
- [ ] Rate limiting
- [ ] Validation des données
- [ ] Protection CSRF
- [ ] Sessions sécurisées
- [ ] Audit logging
- [ ] Accès aux ressources d'autres utilisateurs
- [ ] Élévation de privilèges

### Tests de performance

- [ ] Temps de chargement des pages
- [ ] Recherche avec filtres
- [ ] Upload de photos
- [ ] Génération de rapports
- [ ] Requêtes API
- [ ] Nombre d'utilisateurs simultanés

---

## Conclusion

Cet environnement de test vous permet de valider toutes les fonctionnalités de l'application AUTOLOCO avec des données réalistes et des scénarios variés. Utilisez-le régulièrement pour détecter les bugs et améliorer l'expérience utilisateur.

**Bons tests ! 🚀**
