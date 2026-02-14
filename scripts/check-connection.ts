#!/usr/bin/env tsx
/**
 * Vérifie la connexion à la base de données SQL Server
 */

// Reuse the shared Prisma client which is configured in `lib/prisma.ts`
import { prisma } from "../lib/prisma"

async function checkConnection() {
  console.log("🔌 Test de connexion à SQL Server...\n")

  try {
    console.log("📍 URL de connexion:", process.env.DATABASE_URL?.replace(/password=[^;]+/, "password=***"))

    console.log("\n1️⃣  Tentative de connexion...")
    await prisma.$connect()
    console.log("✅ Connexion établie!")

    console.log("\n2️⃣  Exécution d'une requête test...")
    const result = await prisma.$queryRaw`SELECT @@VERSION as version, DB_NAME() as database_name`
    console.log("✅ Requête exécutée avec succès!")
    console.log("\nInformations serveur:")
    console.log(result)

    console.log("\n3️⃣  Vérification des tables...")
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_CATALOG = DB_NAME()
      ORDER BY TABLE_NAME
    `
    console.log(`✅ ${(tables as any[]).length} tables trouvées`)

    if ((tables as any[]).length > 0) {
      console.log("\nListe des tables:")
      ;(tables as any[]).forEach((t: any, i: number) => {
        console.log(`  ${i + 1}. ${t.TABLE_NAME}`)
      })
    } else {
      console.log("\n⚠️  Aucune table trouvée. Exécutez: npm run db:migrate")
    }

    console.log("\n✅ Test de connexion réussi!")
    console.log("\n💡 La base de données est prête à être utilisée.")
  } catch (error: any) {
    console.error("\n❌ Échec du test de connexion\n")
    console.error("Erreur:", error.message)

    console.log("\n🔍 Diagnostics:")
    if (error.code === "ENOTFOUND") {
      console.log("  • Le serveur SQL Server n'est pas accessible")
      console.log("  • Vérifiez que SQL Server est démarré")
      console.log("  • Vérifiez l'adresse dans DATABASE_URL")
    } else if (error.code === "ECONNREFUSED") {
      console.log("  • Le serveur refuse la connexion")
      console.log("  • Vérifiez le port (défaut: 1433)")
      console.log("  • Vérifiez que TCP/IP est activé dans SQL Server Configuration Manager")
    } else if (error.message.includes("Login failed")) {
      console.log("  • Identifiants incorrects")
      console.log("  • Vérifiez user et password dans DATABASE_URL")
    } else if (error.message.includes("Cannot open database")) {
      console.log("  • La base de données n'existe pas")
      console.log("  • Créez-la avec: CREATE DATABASE autoloco_db")
    }

    console.log("\n📝 Format DATABASE_URL attendu:")
    console.log(
      '  sqlserver://HOST:PORT;database=DB_NAME;user=USERNAME;password=PASSWORD;encrypt=true;trustServerCertificate=true"\n',
    )

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkConnection()
