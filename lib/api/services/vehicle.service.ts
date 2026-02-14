import { apiClient, handleApiError } from "../client"
import type { Vehicle, VehicleSearchParams, VehicleSearchResponse } from "../types"

export const vehicleService = {
  // Search vehicles
  async searchVehicles(params: VehicleSearchParams = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })

    const response = await apiClient.get<VehicleSearchResponse>(`/search/vehicles?${queryParams.toString()}`)

    if (response.error) {
      handleApiError(response.error)
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },

  // Get vehicle by ID
  async getVehicleById(id: string) {
    const response = await apiClient.get<Vehicle>(`/vehicles/${id}`)

    if (response.error) {
      handleApiError(response.error)
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },

  // Get vehicles for owner
  async getMyVehicles() {
    const response = await apiClient.get<{ vehicles: Vehicle[]; stats: any }>("/vehicles/my-vehicles")

    if (response.error) {
      handleApiError(response.error)
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },

  // Create vehicle (owner)
  async createVehicle(data: Partial<Vehicle>) {
    const response = await apiClient.post<Vehicle>("/vehicles", data)

    if (response.error) {
      handleApiError(response.error, "Erreur lors de la création du véhicule")
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },

  // Update vehicle
  async updateVehicle(id: string, data: Partial<Vehicle>) {
    const response = await apiClient.put<Vehicle>(`/vehicles/${id}`, data)

    if (response.error) {
      handleApiError(response.error, "Erreur lors de la mise à jour")
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },

  // Delete vehicle
  async deleteVehicle(id: string) {
    const response = await apiClient.delete(`/vehicles/${id}`)

    if (response.error) {
      handleApiError(response.error, "Erreur lors de la suppression")
      return { success: false, error: response.error }
    }

    return { success: true, error: null }
  },

  // Upload vehicle photo
  async uploadPhoto(vehicleId: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await apiClient.uploadFile(`/vehicles/${vehicleId}/photos`, formData)

    if (response.error) {
      handleApiError(response.error, "Erreur lors de l'upload de la photo")
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },

  // Get vehicle availability
  async getAvailability(vehicleId: string, startDate: string, endDate: string) {
    const response = await apiClient.get(
      `/vehicles/${vehicleId}/availability?start_date=${startDate}&end_date=${endDate}`,
    )

    if (response.error) {
      handleApiError(response.error)
      return { data: null, error: response.error }
    }

    return { data: response.data, error: null }
  },
}

export default vehicleService
