#!/usr/bin/env tsx
/**
 * Script de configuration automatique de la base de données
 * Lance toutes les étapes nécessaires pour initialiser la base de données
 */

import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

console.log("🚀 AUTOLOCO - Configuration automatique de la base de données\n")

const execute = (command: string, description: string) => {
  console.log(`\n📌 ${description}...`)
  try {
    execSync(command, { stdio: "inherit" })
    console.log(`✅ ${description} - Terminé`)
    return true
  } catch (error) {
    console.error(`❌ Erreur lors de: ${description}`)
    console.error(error)
    return false
  }
}

async function main() {
  console.log("Vérification de l'environnement...\n")

  // Vérifier .env
  const envPath = join(process.cwd(), ".env")
  if (!existsSync(envPath)) {
    console.log("⚠️  Fichier .env non trouvé!")
    console.log("📝 Copiez .env.example vers .env et configurez vos variables\n")
    console.log("  cp .env.example .env\n")
    process.exit(1)
  }

  const envContent = readFileSync(envPath, "utf-8")
  if (envContent.includes("your-secret-key-here") || envContent.includes("YourStrongPassword123")) {
    console.log("⚠️  Variables d'environnement non configurées!")
    console.log("📝 Veuillez configurer votre fichier .env avec les bonnes valeurs\n")
    process.exit(1)
  }

  console.log("✅ Fichier .env trouvé et configuré\n")

  // Vérifier Prisma schema
  const schemaPath = join(process.cwd(), "prisma", "schema.prisma")
  if (!existsSync(schemaPath)) {
    console.log("❌ Fichier prisma/schema.prisma non trouvé!")
    process.exit(1)
  }
  console.log("✅ Schema Prisma trouvé\n")

  // Étape 1: Générer Prisma Client
  if (!execute("npx prisma generate", "Génération du Prisma Client")) {
    process.exit(1)
  }

  // Étape 2: Créer et appliquer les migrations
  console.log("\n⚠️  La prochaine étape va créer les tables dans la base de données.")
  console.log("   Assurez-vous que SQL Server est démarré et accessible.\n")

  if (!execute("npx prisma migrate dev --name init", "Création et application des migrations")) {
    console.log("\n❌ Échec de la migration. Vérifiez:")
    console.log("  1. SQL Server est démarré")
    console.log("  2. DATABASE_URL est correct dans .env")
    console.log("  3. L'utilisateur a les permissions nécessaires")
    console.log("  4. La base de données existe ou peut être créée\n")
    process.exit(1)
  }

  // Étape 3: Seeding (optionnel)
  console.log("\n❓ Voulez-vous remplir la base avec des données de démonstration?")
  console.log("   (Cette étape va exécuter prisma/seed.ts)\n")

  if (!execute("npm run db:seed", "Insertion des données de démonstration")) {
    console.log("\n⚠️  Le seeding a échoué, mais les tables sont créées.")
    console.log("   Vous pouvez le relancer avec: npm run db:seed\n")
  }

  // Étape 4: Vérification
  console.log("\n")
  execute("npm run db:verify", "Vérification de la base de données")

  console.log("\n")
  console.log("=".repeat(60))
  console.log("🎉 Configuration de la base de données terminée!")
  console.log("=".repeat(60))
  console.log("\n📊 Prochaines étapes:")
  console.log("  1. Ouvrir Prisma Studio: npm run db:studio")
  console.log("  2. Tester les opérations CRUD: npm run db:test")
  console.log("  3. Démarrer l'application: npm run dev")
  console.log("\n💡 Commandes utiles:")
  console.log("  • npm run db:status   - Voir l'état des migrations")
  console.log("  • npm run db:reset    - Réinitialiser la base")
  console.log("  • npm run db:push     - Pousser les changements sans migration")
  console.log("")
}

main().catch((error) => {
  console.error("❌ Erreur fatale:", error)
  process.exit(1)
})
