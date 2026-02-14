# Guide de Configuration Supabase pour AUTOLOCO

Ce guide vous accompagne dans la configuration complète de Supabase pour le projet AUTOLOCO.

## Table des matières

1. [Prérequis](#prérequis)
2. [Création du projet Supabase](#création-du-projet-supabase)
3. [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
4. [Migration de la base de données](#migration-de-la-base-de-données)
5. [Configuration RLS (Row Level Security)](#configuration-rls)
6. [Vérification de l'installation](#vérification-de-linstallation)
7. [Dépannage](#dépannage)

---

## Prérequis

- Un compte Supabase (gratuit) : https://supabase.com
- Node.js 18+ installé
- Git installé
- Accès au projet AUTOLOCO

---

## Création du projet Supabase

### 1. Créer un nouveau projet

1. Connectez-vous à https://app.supabase.com
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `autoloco` (ou le nom de votre choix)
   - **Database Password** : Générez un mot de passe fort (notez-le précieusement !)
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
   - **Pricing Plan** : Free (ou selon vos besoins)
4. Cliquez sur **"Create new project"**
5. Attendez quelques minutes que le projet soit provisionné

### 2. Récupérer les informations de connexion

Une fois le projet créé :

1. Allez dans **Settings** (icône d'engrenage) > **API**
2. Notez les informations suivantes :

   **Section "Project URL"** :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   ```

   **Section "Project API keys"** :
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ À garder secrète !)

3. Allez dans **Settings** > **Database** > **Connection string**
4. Sélectionnez l'onglet **"URI"**
5. Copiez les deux URLs :
   - **Connection pooling** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`

---

## Configuration des variables d'environnement

### 1. Créer le fichier .env.local

```bash
# À la racine du projet
cp .env.example .env.local
```

### 2. Remplir les variables

Ouvrez `.env.local` et remplacez les valeurs suivantes :

```env
# SUPABASE - Configuration principale
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# BASE DE DONNÉES
DATABASE_URL=postgresql://postgres.xxxxx:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

### 3. Configuration Backend (si applicable)

Si vous utilisez le backend Python :

```bash
cd backend
cp .env.example .env
```

Remplissez avec les mêmes valeurs Supabase.

---

## Migration de la base de données

### Option 1 : Via l'interface Supabase (Recommandée)

1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** (dans la barre latérale)
3. Cliquez sur **"New query"**
4. Copiez le contenu du fichier `scripts/supabase-migration.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **"Run"** (ou Ctrl/Cmd + Enter)
7. Vérifiez qu'il n'y a pas d'erreurs

### Option 2 : Via Prisma (Alternative)

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base de données
npx prisma db push

# Ou créer une migration
npx prisma migrate dev --name init
```

### Vérifier les tables créées

1. Dans Supabase, allez dans **Table Editor**
2. Vous devriez voir toutes les tables :
   - users
   - vehicles
   - rentals
   - payments
   - etc.

---

## Configuration RLS (Row Level Security)

Les politiques RLS protègent vos données en limitant l'accès au niveau des lignes.

### Appliquer les politiques RLS

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez le contenu de `scripts/supabase-rls-policies.sql`
4. Exécutez la requête

### Vérifier les politiques

1. Allez dans **Authentication** > **Policies**
2. Sélectionnez une table (ex: `users`)
3. Vous devriez voir les politiques actives

### Politiques importantes

- **users** : Les utilisateurs peuvent lire/modifier leurs propres données
- **vehicles** : Lecture publique, modification par les propriétaires
- **rentals** : Accès limité aux locations de l'utilisateur
- **payments** : Accès limité aux paiements de l'utilisateur

---

## Vérification de l'installation

### 1. Tester la connexion

Créez un fichier de test `test-supabase.js` :

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    
  if (error) {
    console.error('❌ Erreur de connexion:', error)
  } else {
    console.log('✅ Connexion réussie!', data)
  }
}

testConnection()
```

Exécutez :
```bash
node test-supabase.js
```

### 2. Vérifier Prisma

```bash
# Tester la connexion Prisma
npx prisma db pull

# Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

### 3. Lancer l'application

```bash
npm run dev
```

Visitez http://localhost:3000 et vérifiez que l'application fonctionne.

---

## Dépannage

### Erreur : "Invalid database URL"

**Problème** : Le format de l'URL de connexion est incorrect.

**Solution** :
1. Vérifiez que l'URL commence par `postgresql://`
2. Assurez-vous d'avoir remplacé `[password]` par votre vrai mot de passe
3. Vérifiez qu'il n'y a pas d'espaces dans l'URL

### Erreur : "relation does not exist"

**Problème** : Les tables n'ont pas été créées.

**Solution** :
1. Relancez le script de migration
2. Vérifiez dans Supabase > Table Editor que les tables existent
3. Si nécessaire, utilisez `npx prisma db push --force-reset`

### Erreur : "Row level security policy violation"

**Problème** : Les politiques RLS bloquent l'accès.

**Solution** :
1. Vérifiez que les politiques RLS sont appliquées
2. Assurez-vous que l'utilisateur est authentifié
3. Temporairement, désactivez RLS pour tester : `ALTER TABLE nom_table DISABLE ROW LEVEL SECURITY;`

### Erreur : "Failed to fetch"

**Problème** : Problème de CORS ou URL incorrecte.

**Solution** :
1. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est correct
2. Assurez-vous que l'URL inclut `https://`
3. Vérifiez votre connexion Internet

### Performance lente

**Optimisations** :
1. Utilisez la connexion poolée (`DATABASE_URL`) pour l'application
2. Créez des index sur les colonnes fréquemment recherchées
3. Utilisez `select()` avec des colonnes spécifiques au lieu de `*`

---

## Ressources supplémentaires

- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Prisma** : https://www.prisma.io/docs
- **Supabase Dashboard** : https://app.supabase.com
- **Communauté Discord Supabase** : https://discord.supabase.com

---

## Support

Pour toute question ou problème :
1. Consultez la documentation officielle
2. Vérifiez les logs dans Supabase Dashboard
3. Contactez l'équipe de développement du projet

---

**Dernière mise à jour** : Décembre 2024
