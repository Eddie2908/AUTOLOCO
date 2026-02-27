# Guide d'exécution du Seed sur Supabase

## 📋 Options disponibles

Vous avez 3 façons d'exécuter le seeding :

### Option 1 : SQL Direct (Recommandé pour démarrer)
Fichier : `scripts/autoloco-seed-complete.sql`

**Étapes :**
1. Allez sur https://app.supabase.com → Sélectionnez votre projet
2. Cliquez sur **SQL Editor** (dans la barre latérale)
3. Cliquez sur **New Query**
4. Copiez le contenu de `scripts/autoloco-seed-complete.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Vérifiez que les tables se sont remplies

**Avantages :**
- ✅ Pas de dépendances Node.js
- ✅ Exécution instantanée
- ✅ Pas de problèmes de connexion DB

**Inconvénients :**
- ❌ Relations complexes à gérer (clés étrangères)
- ❌ Script très long

---

### Option 2 : Via Prisma Seed (Recommandé pour la production)
Fichier : `prisma/seed.ts` (à créer)

**Étapes :**
```bash
# 1. Exécutez d'abord les migrations
pnpm run db:push

# 2. Exécutez le seed
pnpm run prisma db seed
```

**Avantages :**
- ✅ Gère les relations FK automatiquement
- ✅ Hashes bcrypt corrects
- ✅ Données cohérentes
- ✅ Facile à maintenir

**Inconvénients :**
- ❌ Nécessite une connexion DB fonctionnelle

---

### Option 3 : Via Node.js Script
Fichier : `scripts/seed.js`

```bash
# 1. Installez les dépendances
pnpm install

# 2. Exécutez le script
node scripts/seed.js
```

---

## 🚀 Recommandation pour votre situation

**Vous êtes actuellement bloqué sur la connexion DB.**

### Solution 1 : Créer un nouveau projet Supabase

1. Allez sur https://app.supabase.com
2. Créez un **New Project**
3. Attendez ~2 minutes que la DB soit prête
4. Copiez les nouvelles identifiants dans `.env`
5. Testez : `pnpm run db:push`

### Solution 2 : Utiliser le SQL Direct (plus sûr)

1. Si votre URL Supabase n'est pas accessible, peut-être que le projet est suspendu
2. Allez sur https://app.supabase.com
3. Vérifiez Settings → General → Status (Active ?)
4. Si suspendu, créez un nouveau projet

---

## 🔐 Notes de sécurité

⚠️ **Les hashes bcrypt dans les scripts SQL sont PUBLIC pour la démo**
- Mot de passe : `Demo@2024!`
- Hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa`

**Pour la production :**
- Changez TOUS les mots de passe
- Utilisez des hashes générés localement
- N'exposez JAMAIS les hashes réels dans Git

---

## 📊 Données créées

Le script seed crée :

| Type | Quantité |
|------|----------|
| Utilisateurs | 9 (3 locataires, 3 propriétaires, 3 admins) |
| Catégories | 5 (Berline, SUV, 4x4, Luxe, Utilitaire) |
| Marques | 6 (Toyota, Mercedes, BMW, Honda, Renault, Hyundai) |
| Modèles | 11 (3-2 par marque) |
| Véhicules | 5 |
| Réservations | 3 |
| Avis | 1 |
| Notifications | 2 |
| Favoris | 2 |
| Méthodes de paiement | 2 |

---

## 🧪 Comptes de test

### Locataires
```
Email: locataire@autoloco.cm
Mot de passe: Demo@2024!

Email: premium@autoloco.cm
Mot de passe: Demo@2024!

Email: nouveau@autoloco.cm
Mot de passe: Demo@2024!
```

### Propriétaires
```
Email: proprietaire@autoloco.cm
Mot de passe: Demo@2024!

Email: agence@autoloco.cm
Mot de passe: Demo@2024!

Email: flotte@autoloco.cm
Mot de passe: Demo@2024!
```

### Admins
```
Email: admin@autoloco.cm
Mot de passe: Admin@2024!

Email: moderateur@autoloco.cm
Mot de passe: Modo@2024!

Email: support@autoloco.cm
Mot de passe: Support@2024!
```

---

## ❌ Troubleshooting

### Erreur: "Can't reach database server"
- ✅ Vérifiez que votre projet Supabase existe et est ACTIF
- ✅ Vérifiez votre connexion Internet
- ✅ Changez vos DNS Windows (8.8.8.8)

### Erreur: "FK constraint violation"
- ✅ Les IDs des parents n'existent pas
- ✅ Solution : Utilisez le SQL avec UNION pour récupérer les IDs dynamiquement

### Hashes bcrypt invalides
- ✅ Régénérez avec `bcryptjs` en Node.js
- ✅ Command: `node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Demo@2024!', 10))"`

---

## 📝 Fichiers créés

- `scripts/autoloco-seed-complete.sql` - Script SQL complet
- `scripts/seed.js` - Script Node.js simplifié
- `SEED_INSTRUCTIONS.md` - Instructions détaillées (version précédente)
- `SEED_SUPABASE_GUIDE.md` - Ce fichier
