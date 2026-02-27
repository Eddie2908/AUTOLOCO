# Guide d'Exécution du Seed Supabase

## Option 1 : Via le Terminal SQL de Supabase (Plus facile)

### Étapes :

1. **Connectez-vous à Supabase** :
   - Allez sur https://app.supabase.com
   - Sélectionnez votre projet

2. **Ouvrez l'éditeur SQL** :
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New Query"

3. **Copier-coller le script** :
   - Ouvrez le fichier `/scripts/seed.sql` depuis votre projet
   - Copiez tout le contenu SQL
   - Collez-le dans l'éditeur SQL de Supabase

4. **Exécutez le script** :
   - Cliquez sur le bouton "Run" (en haut à droite)
   - Ou appuyez sur **Ctrl + Entrée** (Windows/Linux) ou **Cmd + Entrée** (Mac)

5. **Vérifiez les résultats** :
   - Les données s'affichent dans le panneau "Results"
   - Vérifiez les messages d'erreur éventuels

---

## Option 2 : Via Node.js (Pour automatisation)

### Prérequis :

```bash
# Assurez-vous que @supabase/supabase-js est installé
pnpm add @supabase/supabase-js
```

### Exécution :

```bash
# Depuis la racine du projet
node scripts/seed.js
```

ou si vous avez ajouté un script dans package.json :

```bash
pnpm run seed
```

---

## Option 3 : Via Prisma (Recommandé pour les projets Prisma)

### Créer un fichier seed Prisma :

1. Créez `prisma/seed.ts` :

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage du seed...');

  // Exemple : créer des données
  // const user = await prisma.user.create({
  //   data: {
  //     email: 'test@example.com',
  //     name: 'Test User',
  //   },
  // });

  console.log('Seed terminé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. Ajoutez dans `package.json` :

```json
{
  "prisma": {
    "seed": "node --require esbuild-register prisma/seed.ts"
  }
}
```

3. Exécutez :

```bash
pnpm prisma db seed
```

---

## Modification des Données

### Pour le script SQL (`seed.sql`) :

Éditez les lignes INSERT :

```sql
INSERT INTO ma_table (colonne1, colonne2, colonne3) VALUES
('valeur1', 'valeur2', 'valeur3'),
('valeur4', 'valeur5', 'valeur6');
```

### Pour le script Node.js (`seed.js`) :

Modifiez la fonction `seedDatabase()` :

```javascript
const { data, error } = await supabase
  .from('ma_table')
  .insert([
    { colonne1: 'valeur1', colonne2: 'valeur2' },
    { colonne1: 'valeur3', colonne2: 'valeur4' },
  ])
  .select();
```

---

## Dépannage

### Erreur : "Relation not found"
- ✅ Vérifiez que la table existe dans votre base de données
- ✅ Vérifiez l'orthographe du nom de la table

### Erreur : "Permission denied"
- ✅ Assurez-vous d'utiliser `SUPABASE_SERVICE_ROLE_KEY` (pas `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- ✅ Vérifiez les politiques RLS sur votre table

### Erreur de clé étrangère
- ✅ Insérez les données dans le bon ordre (tables parent avant tables enfant)
- ✅ Vérifiez que les IDs référencés existent

---

## Commandes Utiles

```bash
# Vérifier l'état de la base de données
pnpm run db:push

# Voir les migrations appliquées
pnpm run db:studio

# Réinitialiser la base (attention : supprime toutes les données)
# pnpm prisma migrate reset
```
