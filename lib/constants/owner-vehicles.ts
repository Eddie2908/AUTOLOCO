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

export const vehicleStatusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "available", label: "Disponible" },
  { value: "rented", label: "En location" },
  { value: "maintenance", label: "En maintenance" },
  { value: "pending_approval", label: "En attente" },
]
