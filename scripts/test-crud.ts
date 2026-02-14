/**
 * Script de test CRUD complet
 * Crée, lit, met à jour et supprime des données de test
 */

import { prisma } from "@/lib/prisma"

async function testCRUD() {
  console.log("🧪 Test CRUD sur la base de données...\n")

  let testUserId: string | null = null
  let testVehicleId: string | null = null

  try {
    // CREATE USER
    console.log("1️⃣ CREATE - Création utilisateur test...")
    const newUser = await prisma.user.create({
      data: {
        nom: "TestUser",
        prenom: "CRUD",
        email: `test-${Date.now()}@autoloco.test`,
        motDePasse: "hashed_password_test",
        typeUtilisateur: "locataire",
        dateNaissance: new Date("1995-05-15"),
        numeroTelephone: "+237699999999",
      },
    })
    testUserId = newUser.id
    console.log(`   ✓ Utilisateur créé: ${newUser.email} (ID: ${newUser.id})`)
    console.log("")

    // READ USER
    console.log("2️⃣ READ - Lecture utilisateur...")
    const foundUser = await prisma.user.findUnique({
      where: { id: testUserId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        typeUtilisateur: true,
      },
    })
    console.log(`   ✓ Utilisateur trouvé:`, foundUser)
    console.log("")

    // UPDATE USER
    console.log("3️⃣ UPDATE - Mise à jour utilisateur...")
    const updatedUser = await prisma.user.update({
      where: { id: testUserId },
      data: {
        numeroTelephone: "+237677777777",
        statutCompte: "Actif",
        emailVerifie: true,
      },
    })
    console.log(`   ✓ Téléphone mis à jour: ${updatedUser.numeroTelephone}`)
    console.log("")

    // CREATE CATEGORY
    console.log("4️⃣ CREATE - Création catégorie véhicule...")
    const category = await prisma.categorieVehicule.create({
      data: {
        nomCategorie: `TestCategory-${Date.now()}`,
        descriptionCategorie: "Catégorie de test",
      },
    })
    console.log(`   ✓ Catégorie créée: ${category.nomCategorie}`)
    console.log("")

    // CREATE MARQUE + MODELE
    console.log("5️⃣ CREATE - Création marque et modèle...")
    const marque = await prisma.marqueVehicule.create({
      data: {
        nomMarque: `TestMarque-${Date.now()}`,
        estPopulaire: false,
        modeles: {
          create: {
            nomModele: "TestModele",
            typeCarburant: "Essence",
            typeTransmission: "Manuelle",
          },
        },
      },
      include: {
        modeles: true,
      },
    })
    console.log(`   ✓ Marque créée: ${marque.nomMarque}`)
    console.log(`   ✓ Modèle créé: ${marque.modeles[0].nomModele}`)
    console.log("")

    // CREATE VEHICLE
    console.log("6️⃣ CREATE - Création véhicule...")
    const vehicle = await prisma.vehicle.create({
      data: {
        proprietaireId: testUserId,
        categorieId: category.id,
        modeleId: marque.modeles[0].id,
        titreAnnonce: "Véhicule de Test CRUD",
        descriptionVehicule: "Description de test pour le véhicule",
        annee: 2023,
        nombrePlaces: 5,
        typeCarburant: "Essence",
        typeTransmission: "Manuelle",
        prixJournalier: 30000,
        localisationVille: "Douala",
        statutVehicule: "Actif",
        statutVerification: "EnAttente",
      },
      include: {
        proprietaire: { select: { nom: true, prenom: true } },
        categorie: { select: { nomCategorie: true } },
        modele: {
          include: { marque: { select: { nomMarque: true } } },
        },
      },
    })
    testVehicleId = vehicle.id
    console.log(`   ✓ Véhicule créé: ${vehicle.titreAnnonce}`)
    console.log(`   ✓ Propriétaire: ${vehicle.proprietaire.prenom} ${vehicle.proprietaire.nom}`)
    console.log(`   ✓ Marque/Modèle: ${vehicle.modele.marque.nomMarque} ${vehicle.modele.nomModele}`)
    console.log("")

    // COMPLEX QUERY
    console.log("7️⃣ QUERY - Requête complexe avec relations...")
    const vehicles = await prisma.vehicle.findMany({
      where: {
        statutVehicule: "Actif",
        prixJournalier: { gte: 20000, lte: 50000 },
      },
      include: {
        proprietaire: {
          select: { nom: true, email: true },
        },
        modele: {
          include: { marque: true },
        },
      },
      take: 5,
      orderBy: {
        dateCreation: "desc",
      },
    })
    console.log(`   ✓ ${vehicles.length} véhicule(s) trouvé(s) avec filtres`)
    console.log("")

    // AGGREGATION
    console.log("8️⃣ AGGREGATION - Statistiques...")
    const stats = await prisma.vehicle.aggregate({
      _count: { id: true },
      _avg: { prixJournalier: true },
      _min: { prixJournalier: true },
      _max: { prixJournalier: true },
    })
    console.log(`   ✓ Total véhicules: ${stats._count.id}`)
    console.log(`   ✓ Prix moyen: ${stats._avg.prixJournalier?.toFixed(0)} FCFA`)
    console.log(`   ✓ Prix min/max: ${stats._min.prixJournalier} - ${stats._max.prixJournalier} FCFA`)
    console.log("")

    // CLEANUP - DELETE
    console.log("9️⃣ DELETE - Nettoyage des données de test...")

    if (testVehicleId) {
      await prisma.vehicle.delete({ where: { id: testVehicleId } })
      console.log(`   ✓ Véhicule supprimé`)
    }

    await prisma.modeleVehicule.deleteMany({
      where: { marqueId: marque.id },
    })
    console.log(`   ✓ Modèle supprimé`)

    await prisma.marqueVehicule.delete({ where: { id: marque.id } })
    console.log(`   ✓ Marque supprimée`)

    await prisma.categorieVehicule.delete({ where: { id: category.id } })
    console.log(`   ✓ Catégorie supprimée`)

    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } })
      console.log(`   ✓ Utilisateur supprimé`)
    }
    console.log("")

    // SUCCESS
    console.log("✅ TOUS LES TESTS CRUD RÉUSSIS!")
    console.log("═".repeat(50))
    console.log("La base de données fonctionne correctement.")
    console.log("Toutes les opérations CRUD sont opérationnelles.")
    console.log("═".repeat(50))
  } catch (error) {
    console.error("\n❌ ERREUR pendant les tests CRUD:")
    console.error(error)

    // Tentative de nettoyage en cas d'erreur
    console.log("\n🧹 Tentative de nettoyage...")
    try {
      if (testVehicleId) {
        await prisma.vehicle.delete({ where: { id: testVehicleId } }).catch(() => {})
      }
      if (testUserId) {
        await prisma.user.delete({ where: { id: testUserId } }).catch(() => {})
      }
      console.log("   ✓ Nettoyage effectué")
    } catch (cleanupError) {
      console.log("   ⚠️  Nettoyage partiel seulement")
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
testCRUD()
