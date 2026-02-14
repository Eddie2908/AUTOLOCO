import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seeding de la base de données AUTOLOCO...\n")

  console.log("🗑️  Nettoyage des données existantes...")
  // Nettoyage dans l'ordre inverse des relations
  await prisma.avis.deleteMany()
  await prisma.favori.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.reclamation.deleteMany()
  await prisma.facture.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.extensionReservation.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.photoVehicule.deleteMany()
  await prisma.caracteristiqueTechnique.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.modeleVehicule.deleteMany()
  await prisma.marqueVehicule.deleteMany()
  await prisma.categorieVehicule.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.documentUtilisateur.deleteMany()
  await prisma.adresseUtilisateur.deleteMany()
  await prisma.preferenceUtilisateur.deleteMany()
  await prisma.user.deleteMany()
  console.log("✅ Nettoyage terminé\n")

  console.log("👤 Création des utilisateurs...")

  // Locataires
  const locataire1 = await prisma.user.create({
    data: {
      Nom: "MBARGA",
      Prenom: "Samuel",
      Email: "locataire@autoloco.cm",
      MotDePasse: await hash("Demo@2024!", 10),
      NumeroTelephone: "+237691234567",
      TypeUtilisateur: "locataire",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
      DateNaissance: new Date("1988-05-15"),
      NotesUtilisateur: 4.8,
      NombreReservationsEffectuees: 12,
    },
  })

  const locataire2 = await prisma.user.create({
    data: {
      Nom: "NGUEMO",
      Prenom: "Florence",
      Email: "premium@autoloco.cm",
      MotDePasse: await hash("Demo@2024!", 10),
      NumeroTelephone: "+237699876543",
      TypeUtilisateur: "locataire",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
      DateNaissance: new Date("1985-11-20"),
      NotesUtilisateur: 4.9,
      NombreReservationsEffectuees: 45,
      NiveauFidelite: "GOLD",
      PointsFideliteTotal: 2500,
    },
  })

  const locataire3 = await prisma.user.create({
    data: {
      Nom: "FOTSO",
      Prenom: "Kevin",
      Email: "nouveau@autoloco.cm",
      MotDePasse: await hash("Demo@2024!", 10),
      NumeroTelephone: "+237655111222",
      TypeUtilisateur: "locataire",
      StatutCompte: "Actif",
      EmailVerifie: false,
      TelephoneVerifie: false,
      DateNaissance: new Date("1995-03-08"),
      NombreReservationsEffectuees: 0,
    },
  })

  const proprietaire1 = await prisma.user.create({
    data: {
      Nom: "KAMGA",
      Prenom: "Jean-Pierre",
      Email: "proprietaire@autoloco.cm",
      MotDePasse: await hash("Demo@2024!", 10),
      NumeroTelephone: "+237677456789",
      TypeUtilisateur: "proprietaire",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
      NotesUtilisateur: 4.9,
      NombreVehiculesLoues: 87,
    },
  })

  const proprietaire2 = await prisma.user.create({
    data: {
      Nom: "AUTO SERVICES",
      Prenom: "SARL",
      Email: "agence@autoloco.cm",
      MotDePasse: await hash("Demo@2024!", 10),
      NumeroTelephone: "+237233456789",
      TypeUtilisateur: "proprietaire",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
      NotesUtilisateur: 4.7,
      NombreVehiculesLoues: 456,
    },
  })

  const proprietaire3 = await prisma.user.create({
    data: {
      Nom: "CAMEROON FLEET",
      Prenom: "MANAGEMENT",
      Email: "flotte@autoloco.cm",
      MotDePasse: await hash("Demo@2024!", 10),
      NumeroTelephone: "+237699999888",
      TypeUtilisateur: "proprietaire",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
      NotesUtilisateur: 4.8,
      NombreVehiculesLoues: 1250,
    },
  })

  const admin1 = await prisma.user.create({
    data: {
      Nom: "Administrateur",
      Prenom: "Principal",
      Email: "admin@autoloco.cm",
      MotDePasse: await hash("Admin@2024!", 10),
      NumeroTelephone: "+237677000001",
      TypeUtilisateur: "admin",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
    },
  })

  const admin2 = await prisma.user.create({
    data: {
      Nom: "Modérateur",
      Prenom: "Système",
      Email: "moderateur@autoloco.cm",
      MotDePasse: await hash("Modo@2024!", 10),
      NumeroTelephone: "+237677000002",
      TypeUtilisateur: "admin",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
    },
  })

  const admin3 = await prisma.user.create({
    data: {
      Nom: "Support",
      Prenom: "Client",
      Email: "support@autoloco.cm",
      MotDePasse: await hash("Support@2024!", 10),
      NumeroTelephone: "+237677000003",
      TypeUtilisateur: "admin",
      StatutCompte: "Actif",
      EmailVerifie: true,
      TelephoneVerifie: true,
    },
  })

  console.log("\n✅ Utilisateurs créés avec succès\n")

  console.log("🚗 Création des catégories de véhicules...")
  const categories = await Promise.all([
    prisma.categorieVehicule.create({
      data: {
        NomCategorie: "Berline",
        DescriptionCategorie: "Voitures berlines confortables pour trajets urbains",
        OrdreAffichage: 1,
      },
    }),
    prisma.categorieVehicule.create({
      data: {
        NomCategorie: "SUV",
        DescriptionCategorie: "Véhicules SUV spacieux et polyvalents",
        OrdreAffichage: 2,
      },
    }),
    prisma.categorieVehicule.create({
      data: {
        NomCategorie: "4x4",
        DescriptionCategorie: "Véhicules tout-terrain robustes",
        OrdreAffichage: 3,
      },
    }),
    prisma.categorieVehicule.create({
      data: {
        NomCategorie: "Luxe",
        DescriptionCategorie: "Véhicules haut de gamme premium",
        OrdreAffichage: 4,
      },
    }),
    prisma.categorieVehicule.create({
      data: {
        NomCategorie: "Utilitaire",
        DescriptionCategorie: "Véhicules utilitaires pour transport",
        OrdreAffichage: 5,
      },
    }),
  ])
  console.log(`✅ ${categories.length} catégories créées\n`)

  console.log("🏭 Création des marques et modèles...")

  const toyota = await prisma.marqueVehicule.create({
    data: {
      NomMarque: "Toyota",
      PaysOrigine: "Japon",
      EstPopulaire: true,
      modeles: {
        create: [
          {
            NomModele: "Corolla",
            TypeCarburant: "Essence",
            TypeTransmission: "Automatique",
            NombrePlaces: 5,
            NombrePortes: 4,
          },
          {
            NomModele: "RAV4",
            TypeCarburant: "Hybride",
            TypeTransmission: "Automatique",
            NombrePlaces: 5,
            NombrePortes: 5,
          },
          {
            NomModele: "Land Cruiser",
            TypeCarburant: "Diesel",
            TypeTransmission: "Automatique",
            NombrePlaces: 7,
            NombrePortes: 5,
          },
          {
            NomModele: "Hiace",
            TypeCarburant: "Diesel",
            TypeTransmission: "Manuelle",
            NombrePlaces: 14,
            NombrePortes: 4,
          },
        ],
      },
    },
    include: { modeles: true },
  })
  console.log(`  ✓ Marque ${toyota.NomMarque} avec ${toyota.modeles.length} modèles`)

  const mercedes = await prisma.marqueVehicule.create({
    data: {
      NomMarque: "Mercedes-Benz",
      PaysOrigine: "Allemagne",
      EstPopulaire: true,
      modeles: {
        create: [
          {
            NomModele: "Classe C",
            TypeCarburant: "Essence",
            TypeTransmission: "Automatique",
            NombrePlaces: 5,
            NombrePortes: 4,
          },
        ],
      },
    },
    include: { modeles: true },
  })
  console.log(`  ✓ Marque ${mercedes.NomMarque} avec ${mercedes.modeles.length} modèles`)

  const bmw = await prisma.marqueVehicule.create({
    data: {
      NomMarque: "BMW",
      PaysOrigine: "Allemagne",
      EstPopulaire: true,
      modeles: {
        create: [
          {
            NomModele: "X5",
            TypeCarburant: "Diesel",
            TypeTransmission: "Automatique",
            NombrePlaces: 5,
            NombrePortes: 5,
          },
        ],
      },
    },
    include: { modeles: true },
  })
  console.log(`  ✓ Marque ${bmw.NomMarque} avec ${bmw.modeles.length} modèles`)

  const honda = await prisma.marqueVehicule.create({
    data: {
      NomMarque: "Honda",
      PaysOrigine: "Japon",
      EstPopulaire: true,
      modeles: {
        create: [
          {
            NomModele: "CR-V",
            TypeCarburant: "Essence",
            TypeTransmission: "Automatique",
            NombrePlaces: 5,
            NombrePortes: 5,
          },
        ],
      },
    },
    include: { modeles: true },
  })
  console.log(`  ✓ Marque ${honda.NomMarque} avec ${honda.modeles.length} modèles`)

  const renault = await prisma.marqueVehicule.create({
    data: {
      NomMarque: "Renault",
      PaysOrigine: "France",
      EstPopulaire: false,
      modeles: {
        create: [
          {
            NomModele: "Duster",
            TypeCarburant: "Essence",
            TypeTransmission: "Manuelle",
            NombrePlaces: 5,
            NombrePortes: 5,
          },
        ],
      },
    },
    include: { modeles: true },
  })
  console.log(`  ✓ Marque ${renault.NomMarque} avec ${renault.modeles.length} modèles`)

  const hyundai = await prisma.marqueVehicule.create({
    data: {
      NomMarque: "Hyundai",
      PaysOrigine: "Corée du Sud",
      EstPopulaire: true,
      modeles: {
        create: [
          {
            NomModele: "Tucson",
            TypeCarburant: "Essence",
            TypeTransmission: "Automatique",
            NombrePlaces: 5,
            NombrePortes: 5,
          },
        ],
      },
    },
    include: { modeles: true },
  })
  console.log(`  ✓ Marque ${hyundai.NomMarque} avec ${hyundai.modeles.length} modèles\n`)

  console.log("🚙 Création des véhicules...")

  const vehicule1 = await prisma.vehicle.create({
    data: {
      proprietaireId: proprietaire1.id,
      categorieId: categories[0].id,
      modeleId: toyota.modeles[0].id,
      TitreAnnonce: "Toyota Corolla 2022 - Berline confortable",
      DescriptionVehicule:
        "Véhicule en excellent état, climatisation, GPS inclus. Idéal pour déplacements professionnels et touristiques.",
      Immatriculation: "LT-1234-DLA",
      Annee: 2022,
      Couleur: "Blanc",
      Kilometrage: 25000,
      NombrePlaces: 5,
      TypeCarburant: "Essence",
      TypeTransmission: "Automatique",
      Climatisation: true,
      GPS: true,
      Bluetooth: true,
      CameraRecul: true,
      SiegesEnCuir: true,
      ToitOuvrant: false,
      RegulateursVitesse: true,
      AirbagsMultiples: true,
      PrixJournalier: 35000,
      PrixHebdomadaire: 210000,
      PrixMensuel: 750000,
      CautionRequise: 100000,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 150,
      LocalisationVille: "Douala",
      LocalisationRegion: "Littoral",
      AdresseComplete: "123 Rue de la Liberté, Akwa, Douala",
      Latitude: 4.0511,
      Longitude: 9.7679,
      DisponibiliteLundi: true,
      DisponibiliteMardi: true,
      DisponibiliteMercredi: true,
      DisponibiliteJeudi: true,
      DisponibiliteVendredi: true,
      DisponibiliteSamedi: true,
      DisponibiliteDimanche: true,
      LivraisonPossible: true,
      FraisLivraison: 5000,
      StatutVehicule: "Actif",
      StatutVerification: "Verifie",
      NotesVehicule: 4.9,
      NombreReservations: 12,
      NombreVues: 456,
      EstPromotion: false,
      EstVedette: false,
      EstAssure: true,
      CompagnieAssurance: "ACTIVA Assurances",
      NumeroChassisVIN: "JTDKB20U183456789", // AJOUTÉ - unique
      photos: {
        create: [
          {
            URLPhoto: "/toyota-corolla-white-2022.jpg",
            LegendePhoto: "Vue avant",
            OrdreAffichage: 1,
            EstPhotoPrincipale: true,
          },
          {
            URLPhoto: "/toyota-corolla-interior.png",
            LegendePhoto: "Intérieur",
            OrdreAffichage: 2,
            EstPhotoPrincipale: false,
          },
        ],
      },
    },
  })
  console.log("  ✓ Véhicule créé:", vehicule1.TitreAnnonce)

  const vehicule2 = await prisma.vehicle.create({
    data: {
      proprietaireId: proprietaire2.id,
      categorieId: categories[1].id,
      modeleId: honda.modeles[0].id,
      TitreAnnonce: "Honda CR-V 2021 - SUV spacieux",
      DescriptionVehicule: "SUV familial moderne, spacieux et confortable. Parfait pour les familles.",
      Immatriculation: "YA-5678-YAO",
      Annee: 2021,
      Couleur: "Gris",
      Kilometrage: 35000,
      NombrePlaces: 5,
      TypeCarburant: "Essence",
      TypeTransmission: "Automatique",
      Climatisation: true,
      GPS: true,
      Bluetooth: true,
      CameraRecul: true,
      SiegesEnCuir: true,
      ToitOuvrant: true,
      RegulateursVitesse: true,
      AirbagsMultiples: true,
      PrixJournalier: 50000,
      PrixHebdomadaire: 300000,
      PrixMensuel: 1200000,
      CautionRequise: 150000,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 150,
      LocalisationVille: "Yaoundé",
      LocalisationRegion: "Centre",
      AdresseComplete: "456 Avenue Kennedy, Yaoundé",
      Latitude: 3.8480,
      Longitude: 11.5021,
      DisponibiliteLundi: true,
      DisponibiliteMardi: true,
      DisponibiliteMercredi: true,
      DisponibiliteJeudi: true,
      DisponibiliteVendredi: true,
      DisponibiliteSamedi: true,
      DisponibiliteDimanche: false,
      LivraisonPossible: true,
      FraisLivraison: 3000,
      StatutVehicule: "Actif",
      StatutVerification: "Verifie",
      NotesVehicule: 4.8,
      NombreReservations: 8,
      NombreVues: 321,
      EstPromotion: false,
      EstVedette: true,
      EstAssure: true,
      CompagnieAssurance: "AXA Assurances",
      NumeroChassisVIN: "5J6RW1H81MA012345", // AJOUTÉ - unique
      photos: {
        create: [
          {
            URLPhoto: "/honda-crv-grey-2021.jpg",
            LegendePhoto: "Vue principale",
            OrdreAffichage: 1,
            EstPhotoPrincipale: true,
          },
        ],
      },
    },
  })
  console.log("  ✓ Véhicule créé:", vehicule2.TitreAnnonce)

  const vehicule3 = await prisma.vehicle.create({
    data: {
      proprietaireId: proprietaire2.id,
      categorieId: categories[3].id,
      modeleId: mercedes.modeles[0].id,
      TitreAnnonce: "Mercedes Classe C 2023 - Luxe et élégance",
      DescriptionVehicule: "Berline de luxe Mercedes, confort premium, idéale pour événements spéciaux.",
      Immatriculation: "LT-9999-DLA",
      Annee: 2023,
      Couleur: "Noir",
      Kilometrage: 8000,
      NombrePlaces: 5,
      TypeCarburant: "Essence",
      TypeTransmission: "Automatique",
      Climatisation: true,
      GPS: true,
      Bluetooth: true,
      CameraRecul: true,
      SiegesEnCuir: true,
      ToitOuvrant: true,
      RegulateursVitesse: true,
      AirbagsMultiples: true,
      PrixJournalier: 75000,
      PrixHebdomadaire: 450000,
      PrixMensuel: 1800000,
      CautionRequise: 300000,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 200,
      LocalisationVille: "Douala",
      LocalisationRegion: "Littoral",
      AdresseComplete: "789 Boulevard de la Liberté, Bonanjo, Douala",
      Latitude: 4.0475,
      Longitude: 9.6983,
      DisponibiliteLundi: true,
      DisponibiliteMardi: true,
      DisponibiliteMercredi: true,
      DisponibiliteJeudi: true,
      DisponibiliteVendredi: true,
      DisponibiliteSamedi: false,
      DisponibiliteDimanche: false,
      LivraisonPossible: true,
      FraisLivraison: 10000,
      StatutVehicule: "Actif",
      StatutVerification: "Verifie",
      NotesVehicule: 5.0,
      NombreReservations: 3,
      NombreVues: 189,
      EstPromotion: false,
      EstVedette: true,
      EstAssure: true,
      CompagnieAssurance: "Allianz Assurances",
      NumeroChassisVIN: "WDDWF8DB3NA567890", // AJOUTÉ - unique
      photos: {
        create: [
          {
            URLPhoto: "/mercedes-c-class-black-2023.jpg",
            LegendePhoto: "Vue extérieure",
            OrdreAffichage: 1,
            EstPhotoPrincipale: true,
          },
        ],
      },
    },
  })
  console.log("  ✓ Véhicule créé:", vehicule3.TitreAnnonce)

  const vehicule4 = await prisma.vehicle.create({
    data: {
      proprietaireId: proprietaire3.id,
      categorieId: categories[2].id,
      modeleId: toyota.modeles[2].id,
      TitreAnnonce: "Toyota Land Cruiser 2020 - Tout-terrain puissant",
      DescriptionVehicule: "Véhicule 4x4 robuste, parfait pour aventures et terrains difficiles.",
      Immatriculation: "GA-7777-GAR",
      Annee: 2020,
      Couleur: "Blanc",
      Kilometrage: 65000,
      NombrePlaces: 7,
      TypeCarburant: "Diesel",
      TypeTransmission: "Automatique",
      Climatisation: true,
      GPS: true,
      Bluetooth: true,
      CameraRecul: false,
      SiegesEnCuir: true,
      ToitOuvrant: false,
      RegulateursVitesse: true,
      AirbagsMultiples: true,
      PrixJournalier: 95000,
      PrixHebdomadaire: 570000,
      PrixMensuel: 2280000,
      CautionRequise: 400000,
      KilometrageInclus: 300,
      FraisKilometrageSupplementaire: 180,
      LocalisationVille: "Garoua",
      LocalisationRegion: "Nord",
      AdresseComplete: "Route de l'Aéroport, Garoua",
      Latitude: 9.3357,
      Longitude: 13.3901,
      DisponibiliteLundi: true,
      DisponibiliteMardi: true,
      DisponibiliteMercredi: true,
      DisponibiliteJeudi: true,
      DisponibiliteVendredi: true,
      DisponibiliteSamedi: true,
      DisponibiliteDimanche: true,
      LivraisonPossible: false,
      FraisLivraison: 0,
      StatutVehicule: "Actif",
      StatutVerification: "Verifie",
      NotesVehicule: 4.8,
      NombreReservations: 15,
      NombreVues: 543,
      EstPromotion: true,
      EstVedette: false,
      EstAssure: true,
      CompagnieAssurance: "NSIA Assurances",
      NumeroChassisVIN: "JTMHU09J504123456", // AJOUTÉ - unique
      photos: {
        create: [
          {
            URLPhoto: "/toyota-land-cruiser-2020.jpg",
            LegendePhoto: "Vue principale",
            OrdreAffichage: 1,
            EstPhotoPrincipale: true,
          },
        ],
      },
    },
  })
  console.log("  ✓ Véhicule créé:", vehicule4.TitreAnnonce)

  const vehicule5 = await prisma.vehicle.create({
    data: {
      proprietaireId: proprietaire1.id,
      categorieId: categories[2].id,
      modeleId: bmw.modeles[0].id,
      TitreAnnonce: "BMW X5 2022 - SUV Premium",
      DescriptionVehicule: "SUV de luxe BMW, performance et confort exceptionnels.",
      Immatriculation: "LT-8888-DLA",
      Annee: 2022,
      Couleur: "Bleu",
      Kilometrage: 18000,
      NombrePlaces: 5,
      TypeCarburant: "Diesel",
      TypeTransmission: "Automatique",
      Climatisation: true,
      GPS: true,
      Bluetooth: true,
      CameraRecul: true,
      SiegesEnCuir: true,
      ToitOuvrant: true,
      RegulateursVitesse: true,
      AirbagsMultiples: true,
      PrixJournalier: 85000,
      PrixHebdomadaire: 510000,
      PrixMensuel: 2040000,
      CautionRequise: 350000,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 170,
      LocalisationVille: "Douala",
      LocalisationRegion: "Littoral",
      AdresseComplete: "Immeuble Sun Tower, Akwa, Douala",
      Latitude: 4.0600,
      Longitude: 9.7100,
      DisponibiliteLundi: true,
      DisponibiliteMardi: true,
      DisponibiliteMercredi: true,
      DisponibiliteJeudi: true,
      DisponibiliteVendredi: true,
      DisponibiliteSamedi: true,
      DisponibiliteDimanche: false,
      LivraisonPossible: true,
      FraisLivraison: 7000,
      StatutVehicule: "Actif",
      StatutVerification: "Verifie",
      NotesVehicule: 4.9,
      NombreReservations: 7,
      NombreVues: 267,
      EstPromotion: false,
      EstVedette: true,
      EstAssure: true,
      CompagnieAssurance: "AXA Assurances",
      NumeroChassisVIN: "WBX7S1C04N7F89012", // AJOUTÉ - unique
      photos: {
        create: [
          {
            URLPhoto: "/bmw-x5-blue-2022.jpg",
            LegendePhoto: "Vue extérieure",
            OrdreAffichage: 1,
            EstPhotoPrincipale: true,
          },
        ],
      },
    },
  })
  console.log("  ✓ Véhicule créé:", vehicule5.TitreAnnonce)

  console.log(`\n✅ ${5} véhicules créés\n`)

  console.log("📅 Création des réservations...")

  const reservation1 = await prisma.reservation.create({
    data: {
      NumeroReservation: `RES-${new Date().getFullYear()}-001`,
      vehiculeId: vehicule1.id,
      locataireId: locataire1.id,
      proprietaireId: proprietaire1.id,
      DateDebut: new Date("2024-12-15"),
      DateFin: new Date("2024-12-18"),
      HeureDebut: new Date("2024-12-15T08:00:00"),
      HeureFin: new Date("2024-12-18T17:00:00"),
      PrixJournalier: 35000,
      MontantLocation: 105000,
      FraisService: 5250,
      FraisAssurance: 5250,
      FraisLivraison: 0,
      MontantTotal: 115500,
      MontantCaution: 100000,
      StatutReservation: "Confirmee",
      StatutPaiement: "Paye",
      MethodePaiement: "mobile_money_mtn",
      LieuPriseEnCharge: "123 Rue de la Liberté, Akwa, Douala",
      LieuRestitution: "123 Rue de la Liberté, Akwa, Douala",
      NombreJours: 3,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 150,
      EstAssurance: true,
      TypeAssurance: "Assurance Basique",
      MontantAssurance: 5250,
      NombreConducteurs: 1,
      DateConfirmation: new Date("2024-12-10"),
    },
  })
  console.log("  ✓ Réservation créée:", reservation1.NumeroReservation)

  const reservation2 = await prisma.reservation.create({
    data: {
      NumeroReservation: `RES-${new Date().getFullYear()}-002`,
      vehiculeId: vehicule3.id,
      locataireId: locataire2.id,
      proprietaireId: proprietaire2.id,
      DateDebut: new Date("2024-12-20"),
      DateFin: new Date("2024-12-25"),
      HeureDebut: new Date("2024-12-20T10:00:00"),
      HeureFin: new Date("2024-12-25T18:00:00"),
      PrixJournalier: 75000,
      MontantLocation: 375000,
      FraisService: 18750,
      FraisAssurance: 18750,
      FraisLivraison: 10000,
      LivraisonDemandee: true,
      AdresseLivraison: "Hôtel Hilton, Douala",
      MontantTotal: 422500,
      MontantCaution: 300000,
      StatutReservation: "EnCours",
      StatutPaiement: "Paye",
      MethodePaiement: "carte_bancaire",
      NombreJours: 5,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 200,
      EstAssurance: true,
      TypeAssurance: "Assurance Premium",
      MontantAssurance: 18750,
      NombreConducteurs: 2,
      ConducteursSupplementaires: "Marie NGUEMO",
      DateConfirmation: new Date("2024-12-15"),
    },
  })
  console.log("  ✓ Réservation créée:", reservation2.NumeroReservation)

  const reservation3 = await prisma.reservation.create({
    data: {
      NumeroReservation: `RES-${new Date().getFullYear()}-003`,
      vehiculeId: vehicule2.id,
      locataireId: locataire3.id,
      proprietaireId: proprietaire2.id,
      DateDebut: new Date("2025-01-10"),
      DateFin: new Date("2025-01-12"),
      HeureDebut: new Date("2025-01-10T09:00:00"),
      HeureFin: new Date("2025-01-12T16:00:00"),
      PrixJournalier: 50000,
      MontantLocation: 100000,
      FraisService: 5000,
      FraisAssurance: 5000,
      FraisLivraison: 3000,
      LivraisonDemandee: true,
      AdresseLivraison: "Université de Yaoundé I",
      MontantTotal: 113000,
      MontantCaution: 150000,
      StatutReservation: "EnAttente",
      StatutPaiement: "EnAttente",
      NombreJours: 2,
      KilometrageInclus: 200,
      FraisKilometrageSupplementaire: 150,
      EstAssurance: false,
      NombreConducteurs: 1,
    },
  })
  console.log("  ✓ Réservation créée:", reservation3.NumeroReservation)

  console.log(`\n✅ ${3} réservations créées\n`)

  console.log("⭐ Création des avis...")

  const avis1 = await prisma.avis.create({
    data: {
      reservationId: reservation1.id,
      auteurId: locataire1.id,
      cibleId: proprietaire1.id,
      TypeCible: "proprietaire",
      NoteGlobale: 5.0,
      NoteProprete: 5.0,
      NoteConformite: 5.0,
      NoteCommunication: 5.0,
      NoteEtatVehicule: 5.0,
      NoteRapportQualitePrix: 5.0,
      CommentaireAvis:
        "Excellent propriétaire ! Véhicule impeccable, M. Kamga était très réactif et le véhicule correspondait parfaitement aux photos. Je recommande vivement.",
      PhotosAvis: "/avis/photo1.jpg,/avis/photo2.jpg",
      RecommandeCible: true,
      StatutAvis: "Publie",
    },
  })
  console.log("  ✓ Avis créé pour réservation:", reservation1.NumeroReservation)

  console.log(`\n✅ ${1} avis créé\n`)

  console.log("🔔 Création des notifications...")

  await prisma.notification.create({
    data: {
      utilisateurId: locataire1.id,
      TypeNotification: "reservation_confirmee",
      TitreNotification: "Réservation confirmée",
      MessageNotification: `Votre réservation ${reservation1.NumeroReservation} a été confirmée !`,
      LienNotification: "/reservations/" + reservation1.id,
      PrioriteNotification: "Haute",
      CanalEnvoi: "email",
      DateEnvoi: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      utilisateurId: proprietaire1.id,
      TypeNotification: "nouvelle_reservation",
      TitreNotification: "Nouvelle réservation",
      MessageNotification: "Vous avez reçu une nouvelle réservation pour votre Toyota Corolla",
      LienNotification: "/reservations/" + reservation1.id,
      PrioriteNotification: "Haute",
      CanalEnvoi: "push",
      DateEnvoi: new Date(),
      EstLu: true,
      DateLecture: new Date(),
    },
  })

  console.log("✅ Notifications créées\n")

  console.log("⭐ Création des favoris...")

  await prisma.favori.create({
    data: {
      utilisateurId: locataire2.id,
      vehiculeId: vehicule3.id,
      NotesPersonnelles: "Parfait pour les événements importants",
    },
  })

  await prisma.favori.create({
    data: {
      utilisateurId: locataire1.id,
      vehiculeId: vehicule5.id,
      NotesPersonnelles: "À louer pour le prochain voyage",
    },
  })

  console.log("✅ Favoris créés\n")

  console.log("💳 Création des méthodes de paiement...")

  await prisma.methodePaiementUtilisateur.create({
    data: {
      utilisateurId: locataire1.id,
      TypeMethode: "mobile_money_mtn",
      EstMethodePrincipale: true,
      Alias: "MTN Money - 691234567",
      DerniersChiffres: "5678",
      Fournisseur: "MTN",
      DateExpiration: new Date("2026-12-31"),
    },
  })

  await prisma.methodePaiementUtilisateur.create({
    data: {
      utilisateurId: locataire2.id,
      TypeMethode: "carte_bancaire",
      EstMethodePrincipale: true,
      Alias: "Visa Gold",
      DerniersChiffres: "4321",
      Fournisseur: "Visa",
      DateExpiration: new Date("2025-08-31"),
    },
  })

  console.log("✅ Méthodes de paiement créées\n")

  console.log("✅ Seeding terminé avec succès!")
  console.log("\n📊 Résumé:")
  console.log(`  • 9 utilisateurs (3 locataires, 3 propriétaires, 3 admins)`)
  console.log(`  • 5 catégories de véhicules`)
  console.log(`  • 6 marques avec modèles`)
  console.log(`  • 5 véhicules disponibles`)
  console.log(`  • 3 réservations`)
  console.log(`  • 1 avis`)
  console.log(`  • 2 notifications`)
  console.log(`  • 2 favoris`)
  console.log(`  • 2 méthodes de paiement`)
  console.log("\n🎉 Base de données prête pour la démonstration!\n")
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
