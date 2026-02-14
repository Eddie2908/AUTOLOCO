# Guide d'Installation Locale - AUTOLOCO

## Vue d'ensemble

Ce guide vous accompagne pas à pas pour installer et exécuter l'application AUTOLOCO sur votre machine locale. L'application est composée de :

- **Frontend** : Next.js 16 (React 18)
- **Backend API** : FastAPI (Python 3.11+)
- **Base de données** : SQL Server
- **ORM** : Prisma

---

## Prérequis

### Logiciels requis

| Logiciel | Version minimale | Téléchargement |
|----------|------------------|----------------|
| Node.js | 18.17+ (LTS recommandé) | [nodejs.org](https://nodejs.org/) |
| Python | 3.11+ | [python.org](https://www.python.org/) |
| SQL Server | 2019+ (Express gratuit) | [Microsoft SQL Server](https://www.microsoft.com/sql-server) |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/) |
| VS Code | Dernière version | [code.visualstudio.com](https://code.visualstudio.com/) |

### Extensions VS Code recommandées

\`\`\`json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-mssql.mssql"
  ]
}
\`\`\`

---

## Étape 1 : Cloner le projet

\`\`\`bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/autoloco.git

# Accéder au dossier
cd autoloco

# Ouvrir dans VS Code
code .
\`\`\`

---

## Étape 2 : Configuration SQL Server

### Option A : SQL Server Express (Recommandé pour débutants)

1. **Télécharger SQL Server Express** depuis le site Microsoft
2. **Installer** avec l'option "Basic"
3. **Noter** le nom de l'instance (généralement `SQLEXPRESS`)

### Option B : Docker (Recommandé pour développeurs)

\`\`\`bash
# Lancer SQL Server dans Docker
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=AutoL0c0!Str0ng2025" \
  -p 1433:1433 \
  --name sqlserver-autoloco \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Vérifier que le conteneur fonctionne
docker ps
\`\`\`

### Créer la base de données

Connectez-vous avec SQL Server Management Studio (SSMS) ou Azure Data Studio :

\`\`\`sql
-- Créer la base de données
CREATE DATABASE autoloco_db;
GO

-- Créer l'utilisateur de l'application
USE autoloco_db;
CREATE LOGIN autoloco_app WITH PASSWORD = 'Ch@ng3M3InPr0duct!0n2025';
CREATE USER autoloco_app FOR LOGIN autoloco_app;

-- Accorder les permissions
ALTER ROLE db_datareader ADD MEMBER autoloco_app;
ALTER ROLE db_datawriter ADD MEMBER autoloco_app;
GO

-- Créer l'utilisateur pour les migrations
CREATE LOGIN autoloco_migration WITH PASSWORD = 'M!gr@t10nS3cur3P@ss2025';
CREATE USER autoloco_migration FOR LOGIN autoloco_migration;
ALTER ROLE db_owner ADD MEMBER autoloco_migration;
GO
\`\`\`

---

## Étape 3 : Configuration de l'environnement

### Créer le fichier .env

\`\`\`bash
# Copier le fichier exemple
cp .env.example .env
\`\`\`

### Modifier le fichier .env

Ouvrez `.env` et configurez selon votre installation :

\`\`\`env
# === BASE DE DONNÉES ===

# Pour SQL Server Express local (Windows)
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS:1433;database=autoloco_db;user=autoloco_app;password=Ch@ng3M3InPr0duct!0n2025;encrypt=true;trustServerCertificate=true"

# OU pour Docker
DATABASE_URL="sqlserver://localhost:1433;database=autoloco_db;user=sa;password=AutoL0c0!Str0ng2025;encrypt=true;trustServerCertificate=true"

# URL pour les migrations
DATABASE_URL_MIGRATION="sqlserver://localhost:1433;database=autoloco_db;user=autoloco_migration;password=M!gr@t10nS3cur3P@ss2025;encrypt=true;trustServerCertificate=true"

# === AUTHENTIFICATION ===
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-changez-en-production-abc123xyz"

# === MODE DÉVELOPPEMENT ===
DEMO_MODE="true"
DEBUG_PRISMA="true"
\`\`\`

---

## Étape 4 : Installation des dépendances Frontend

\`\`\`bash
# Installer les dépendances Node.js
npm install

# OU avec yarn
yarn install

# OU avec pnpm
pnpm install
\`\`\`

### Vérifier l'installation

\`\`\`bash
# Doit afficher la version de Next.js
npx next --version
\`\`\`

---

## Étape 5 : Configuration Prisma et Base de données

### Générer le client Prisma

\`\`\`bash
# Générer le client Prisma
npm run db:generate
\`\`\`

### Appliquer les migrations

\`\`\`bash
# Créer et appliquer les migrations
npm run db:migrate

# OU pousser le schéma directement (développement)
npm run db:push
\`\`\`

### Alimenter la base avec des données de test

\`\`\`bash
# Exécuter le seed
npm run db:seed
\`\`\`

### Vérifier la connexion

\`\`\`bash
# Tester la connexion à la base
npm run db:check

# Ouvrir Prisma Studio (interface visuelle)
npm run db:studio
\`\`\`

---

## Étape 6 : Installation Backend FastAPI (Optionnel)

Si vous souhaitez utiliser l'API FastAPI :

### Créer l'environnement virtuel Python

\`\`\`bash
# Accéder au dossier backend
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
.\venv\Scripts\activate

# Activer l'environnement (macOS/Linux)
source venv/bin/activate
\`\`\`

### Installer les dépendances Python

\`\`\`bash
# Installer les dépendances
pip install -r requirements.txt
\`\`\`

### Configurer le backend

Créez un fichier `backend/.env` :

\`\`\`env
# Base de données
DATABASE_URL="mssql+pyodbc://autoloco_app:Ch@ng3M3InPr0duct!0n2025@localhost:1433/autoloco_db?driver=ODBC+Driver+17+for+SQL+Server"

# JWT
SECRET_KEY="votre-secret-jwt-local"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Mode
DEBUG=true
\`\`\`

### Installer le driver ODBC

**Windows :**
Téléchargez depuis [Microsoft ODBC Driver](https://docs.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server)

**macOS :**
\`\`\`bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew install msodbcsql17
\`\`\`

**Linux (Ubuntu/Debian) :**
\`\`\`bash
curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list > /etc/apt/sources.list.d/mssql-release.list
apt-get update
ACCEPT_EULA=Y apt-get install -y msodbcsql17
\`\`\`

---

## Étape 7 : Lancer l'application

### Démarrer le Frontend Next.js

\`\`\`bash
# Depuis la racine du projet
npm run dev
\`\`\`

L'application sera accessible sur : **http://localhost:3000**

### Démarrer le Backend FastAPI (optionnel)

\`\`\`bash
# Dans un nouveau terminal, depuis le dossier backend
cd backend
source venv/bin/activate  # ou .\venv\Scripts\activate sur Windows

# Lancer le serveur
uvicorn main:app --reload --port 8000
\`\`\`

L'API sera accessible sur : **http://localhost:8000**
Documentation Swagger : **http://localhost:8000/docs**

---

## Étape 8 : Vérification de l'installation

### Checklist de vérification

- [ ] **Frontend** : http://localhost:3000 affiche la page d'accueil
- [ ] **Prisma Studio** : `npm run db:studio` ouvre l'interface
- [ ] **Base de données** : Les tables sont créées
- [ ] **Authentification** : Inscription/connexion fonctionnent
- [ ] **Backend API** (optionnel) : http://localhost:8000/docs affiche Swagger

### Comptes de démonstration

Si vous avez exécuté le seed, utilisez ces comptes :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@autoloco.cm | Admin123! |
| Propriétaire | owner@autoloco.cm | Owner123! |
| Locataire | renter@autoloco.cm | Renter123! |

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Construire pour la production |
| `npm run start` | Démarrer en mode production |
| `npm run db:generate` | Générer le client Prisma |
| `npm run db:migrate` | Créer/appliquer les migrations |
| `npm run db:push` | Synchroniser le schéma (dev) |
| `npm run db:seed` | Alimenter avec données de test |
| `npm run db:studio` | Ouvrir Prisma Studio |
| `npm run db:check` | Tester la connexion DB |
| `npm run db:reset` | Réinitialiser les données démo |

---

## Résolution des problèmes courants

### Erreur : "Cannot connect to SQL Server"

**Cause** : SQL Server n'est pas démarré ou le port est bloqué.

**Solutions** :
1. Vérifier que SQL Server est en cours d'exécution
2. Activer TCP/IP dans SQL Server Configuration Manager
3. Vérifier le pare-feu Windows (port 1433)

\`\`\`bash
# Tester la connexion
telnet localhost 1433
\`\`\`

### Erreur : "Login failed for user"

**Cause** : Identifiants incorrects ou utilisateur non créé.

**Solutions** :
1. Vérifier le mot de passe dans `.env`
2. S'assurer que l'utilisateur existe dans SQL Server
3. Vérifier que l'authentification SQL est activée

### Erreur : "Prisma Client not generated"

**Solution** :
\`\`\`bash
npm run db:generate
\`\`\`

### Erreur : "Module not found" (Python)

**Solution** :
\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### Erreur : "ODBC Driver not found"

**Solution** : Installer Microsoft ODBC Driver 17 for SQL Server (voir Étape 6).

### Port 3000 déjà utilisé

**Solution** :
\`\`\`bash
# Utiliser un autre port
npm run dev -- -p 3001

# OU tuer le processus existant
npx kill-port 3000
\`\`\`

---

## Structure du projet

\`\`\`
autoloco/
├── app/                    # Pages et routes Next.js
│   ├── api/               # Routes API Next.js
│   ├── auth/              # Pages d'authentification
│   ├── booking/           # Processus de réservation
│   ├── dashboard/         # Tableaux de bord
│   └── vehicles/          # Catalogue véhicules
├── backend/               # API FastAPI (Python)
│   ├── app/
│   │   ├── api/          # Endpoints
│   │   ├── core/         # Configuration
│   │   ├── models/       # Modèles SQLAlchemy
│   │   └── schemas/      # Schémas Pydantic
│   └── main.py
├── components/            # Composants React
├── lib/                   # Utilitaires et services
├── prisma/               # Schéma et migrations
│   ├── schema.prisma
│   └── seed.ts
├── public/               # Assets statiques
├── scripts/              # Scripts utilitaires
└── docs/                 # Documentation
\`\`\`

---

## Prochaines étapes

1. **Explorer l'application** : Naviguez sur http://localhost:3000
2. **Tester les fonctionnalités** : Créez un compte, ajoutez un véhicule
3. **Explorer la base** : Utilisez Prisma Studio (`npm run db:studio`)
4. **Lire la documentation** : Consultez le dossier `docs/`
5. **Personnaliser** : Modifiez les variables d'environnement selon vos besoins

---

## Support

En cas de problème :

1. Consultez les logs dans le terminal
2. Vérifiez la documentation dans `docs/`
3. Ouvrez une issue sur le dépôt GitHub

---

*Dernière mise à jour : Décembre 2024*
