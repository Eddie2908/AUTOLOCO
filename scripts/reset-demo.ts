#!/usr/bin/env tsx
/**
 * Réinitialise la base de données avec les données de démonstration
 * ATTENTION: Supprime toutes les données existantes!
 */

import { execSync } from "child_process"
import * as readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log("⚠️  RÉINITIALISATION DE LA BASE DE DONNÉES\n")
console.log("Cette opération va:")
console.log("  1. Supprimer TOUTES les données existantes")
console.log("  2. Recréer les tables")
console.log("  3. Insérer les données de démonstration\n")

rl.question("Êtes-vous sûr de vouloir continuer? (oui/non): ", (answer) => {
  if (answer.toLowerCase() === "oui" || answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
    console.log("\n🗑️  Réinitialisation en cours...\n")

    try {
      execSync("npx prisma migrate reset --force", { stdio: "inherit" })
      console.log("\n✅ Base de données réinitialisée avec succès!")
      console.log("\n💡 Vous pouvez maintenant:")
      console.log("  • Ouvrir Prisma Studio: npm run db:studio")
      console.log("  • Démarrer l'application: npm run dev")
    } catch (error) {
      console.error("\n❌ Erreur lors de la réinitialisation:", error)
      process.exit(1)
    }
  } else {
    console.log("\n❌ Opération annulée")
  }

  rl.close()
  process.exit(0)
})
