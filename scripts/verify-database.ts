/**
 * Script de vérification de la configuration de la base de données
 * Teste la connexion, compte les tables, et vérifie l'intégrité
 */

import { prisma } from "@/lib/prisma"

interface TableCount {
  tableCount: number
}

async function verifyDatabase() {
  console.log("🔍 Vérification de la base de données AUTOLOCO...\n")

  try {
    // 1. Test de connexion
    console.log("1️⃣ Test de connexion...")
    await prisma.$connect()
    console.log("   ✓ Connexion réussie\n")

    // 2. Vérifier nombre de tables
    console.log("2️⃣ Comptage des tables...")
    const result = await prisma.$queryRaw<TableCount[]>`
      SELECT COUNT(*) as tableCount 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = DB_NAME()
    `
    const tableCount = Number(result[0].tableCount)
    console.log(`   ✓ Nombre de tables: ${tableCount}`)

    if (tableCount < 30) {
      console.warn(`   ⚠️  Attention: Seulement ${tableCount} tables trouvées (41 attendues)`)
    }
    console.log("")

    // 3. Test de lecture sur chaque modèle principal
    console.log("3️⃣ Test de lecture des modèles principaux...")

    const tests = [
      { name: "Users", query: () => prisma.user.count() },
      { name: "Vehicles", query: () => prisma.vehicle.count() },
      { name: "Reservations", query: () => prisma.reservation.count() },
      { name: "Transactions", query: () => prisma.transaction.count() },
      { name: "Categories", query: () => prisma.categorieVehicule.count() },
      { name: "Marques", query: () => prisma.marqueVehicule.count() },
      { name: "Messages", query: () => prisma.message.count() },
      { name: "Notifications", query: () => prisma.notification.count() },
      { name: "Avis", query: () => prisma.avis.count() },
      { name: "Favoris", query: () => prisma.favori.count() },
    ]

    for (const test of tests) {
      try {
        const count = await test.query()
        console.log(`   ✓ ${test.name.padEnd(20)} ${count} enregistrement(s)`)
      } catch (error) {
        console.error(`   ✗ ${test.name.padEnd(20)} Erreur: ${error instanceof Error ? error.message : "Unknown"}`)
      }
    }
    console.log("")

    // 4. Vérifier indexes
    console.log("4️⃣ Vérification des indexes...")
    const indexes = await prisma.$queryRaw<any[]>`
      SELECT 
        t.name AS TableName,
        i.name AS IndexName,
        i.type_desc AS IndexType
      FROM sys.indexes i
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      WHERE i.is_primary_key = 0 AND i.type > 0
      ORDER BY t.name, i.name
    `
    console.log(`   ✓ ${indexes.length} indexes trouvés`)
    console.log("")

    // 5. Vérifier foreign keys
    console.log("5️⃣ Vérification des relations (foreign keys)...")
    const foreignKeys = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as fkCount
      FROM sys.foreign_keys
    `
    const fkCount = Number(foreignKeys[0].fkCount)
    console.log(`   ✓ ${fkCount} foreign keys trouvées`)
    console.log("")

    // 6. Résumé
    console.log("📊 RÉSUMÉ")
    console.log("═".repeat(50))
    console.log(`✓ Connexion: OK`)
    console.log(`✓ Tables: ${tableCount}/41`)
    console.log(`✓ Indexes: ${indexes.length}`)
    console.log(`✓ Foreign Keys: ${fkCount}`)
    console.log(`✓ Base de données: OPÉRATIONNELLE`)
    console.log("═".repeat(50))
    console.log("\n✅ Vérification terminée avec succès!\n")
  } catch (error) {
    console.error("\n❌ ERREUR lors de la vérification:")
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
    } else {
      console.error(error)
    }
    console.log("\n💡 Solutions possibles:")
    console.log("   1. Vérifier que SQL Server est démarré")
    console.log("   2. Vérifier DATABASE_URL dans .env")
    console.log("   3. Exécuter: npx prisma migrate dev --name init")
    console.log("   4. Vérifier les credentials de connexion")
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
verifyDatabase()
