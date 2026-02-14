// Données des véhicules du propriétaire avec statistiques détaillées

import { type Vehicle, vehicles } from "./vehicles"

export interface OwnerVehicle extends Vehicle {
  status: "available" | "rented" | "maintenance" | "pending_approval"
  totalRevenue: number
  totalBookings: number
  occupancyRate: number
  pendingBookings: number
  lastRented: string | null
  createdAt: string
}

// Véhicules du propriétaire connecté (Jean-Pierre KAMGA)
export const ownerVehicles: OwnerVehicle[] = [
  {
    ...vehicles[0], // Toyota Corolla 2022
    status: "rented",
    totalRevenue: 420000,
    totalBookings: 8,
    occupancyRate: 85,
    pendingBookings: 2,
    lastRented: "2024-12-15",
    createdAt: "2024-03-15",
  },
  {
    ...vehicles[4], // BMW X5 2022
    status: "available",
    totalRevenue: 455000,
    totalBookings: 4,
    occupancyRate: 70,
    pendingBookings: 1,
    lastRented: "2024-12-10",
    createdAt: "2024-06-01",
  },
  {
    ...vehicles[2], // Mercedes Classe C 2023
    status: "maintenance",
    totalRevenue: 675000,
    totalBookings: 9,
    occupancyRate: 65,
    pendingBookings: 0,
    lastRented: "2024-12-05",
    createdAt: "2024-01-20",
  },
  {
    ...vehicles[6], // Toyota Land Cruiser 2020
    status: "pending_approval",
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    pendingBookings: 0,
    lastRented: null,
    createdAt: "2024-12-18",
  },
]

export const vehicleStatusLabels = {
  available: "Disponible",
  rented: "En location",
  maintenance: "En maintenance",
  pending_approval: "En attente",
}

export const vehicleStatusColors = {
  available: "bg-green-500/10 text-green-600",
  rented: "bg-blue-500/10 text-blue-600",
  maintenance: "bg-amber-500/10 text-amber-600",
  pending_approval: "bg-gray-500/10 text-gray-600",
}

// Statistiques globales du propriétaire
export const ownerStats = {
  totalVehicles: 4,
  availableVehicles: 1,
  rentedVehicles: 1,
  maintenanceVehicles: 1,
  pendingVehicles: 1,
  totalRevenue: 1550000,
  monthlyRevenue: 875000,
  totalBookings: 21,
  averageRating: 4.9,
  occupancyRate: 73,
}

// Options de filtrage
export const vehicleStatusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "available", label: "Disponible" },
  { value: "rented", label: "En location" },
  { value: "maintenance", label: "En maintenance" },
  { value: "pending_approval", label: "En attente" },
]
