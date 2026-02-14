"use client"

import useSWR, { type SWRConfiguration } from "swr"

export interface VehicleFilters {
  type?: string
  city?: string
  fuel?: string
  transmission?: string
  minPrice?: number
  maxPrice?: number
  seats?: number
  verified?: boolean
  featured?: boolean
  search?: string
  sort?: string
  page?: number
  pageSize?: number
}

/**
 * Build the URL search params from the filter object.
 * Only non-empty / non-default values are included so that
 * the SWR dedup key stays stable across renders.
 */
function buildSearchParams(filters: VehicleFilters): string {
  const params = new URLSearchParams()

  if (filters.type && filters.type !== "all") params.set("type", filters.type)
  if (filters.city && filters.city !== "all") params.set("city", filters.city)
  if (filters.fuel && filters.fuel !== "all") params.set("fuel", filters.fuel)
  if (filters.transmission && filters.transmission !== "all") params.set("transmission", filters.transmission)
  if (filters.minPrice && filters.minPrice > 0) params.set("min_price", String(filters.minPrice))
  if (filters.maxPrice && filters.maxPrice < 100000) params.set("max_price", String(filters.maxPrice))
  if (filters.seats && filters.seats > 0) params.set("seats", String(filters.seats))
  if (filters.verified) params.set("verified", "true")
  if (filters.featured) params.set("featured", "true")
  if (filters.search) params.set("search", filters.search)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.page && filters.page > 1) params.set("page", String(filters.page))
  if (filters.pageSize && filters.pageSize !== 20) params.set("page_size", String(filters.pageSize))

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

/**
 * Fetcher that calls the optimised Next.js API route directly
 * (Prisma -> SQL Server, no FastAPI proxy).
 */
async function vehicleFetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || "Erreur lors du chargement des vehicules")
  }
  return res.json()
}

export function useVehicles(filters?: VehicleFilters, options?: SWRConfiguration) {
  const qs = buildSearchParams(filters || {})
  const url = `/api/vehicles${qs}`

  const { data, error, isLoading, mutate } = useSWR(url, vehicleFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    keepPreviousData: true, // Avoid layout shift when paginating
    ...options,
  })

  return {
    vehicles: data?.vehicles || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    totalPages: data?.total_pages || 1,
    isLoading,
    error,
    mutate,
  }
}

export function useVehicle(id: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/vehicles/${id}` : null,
    async () => {
      if (!id) return null
      const response = await vehicleService.getVehicleById(id)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: false,
      ...options,
    },
  )

  return {
    vehicle: (data || null) as any,
    isLoading,
    error,
    mutate,
  }
}

export function useOwnerVehicles(ownerId?: string, options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    ownerId ? `/vehicles/owner/${ownerId}` : "/vehicles/my-vehicles",
    async () => {
      // Use Next.js API route that reads from SQL Server via Prisma
      const res = await fetch("/api/vehicles/my-vehicles")
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.message || errorData?.error || "Erreur lors du chargement")
      }
      return (await res.json()) as { vehicles: any[]; stats: any }
    },
    {
      revalidateOnFocus: true,
      ...options,
    },
  )

  return {
    vehicles: data?.vehicles || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}

export const vehicleTypes = [
  { value: "all", label: "Tous les types" },
  { value: "berline", label: "Berline" },
  { value: "suv", label: "SUV" },
  { value: "4x4", label: "4x4" },
  { value: "luxe", label: "Luxe" },
  { value: "utilitaire", label: "Utilitaire" },
  { value: "moto", label: "Moto" },
]

export const cities = [
  { value: "all", label: "Toutes les villes" },
  { value: "Douala", label: "Douala" },
  { value: "Yaoundé", label: "Yaoundé" },
  { value: "Bafoussam", label: "Bafoussam" },
  { value: "Bamenda", label: "Bamenda" },
  { value: "Garoua", label: "Garoua" },
  { value: "Maroua", label: "Maroua" },
]

export const fuelTypes = [
  { value: "all", label: "Tous" },
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "electrique", label: "Électrique" },
  { value: "hybride", label: "Hybride" },
]

export const transmissions = [
  { value: "all", label: "Toutes" },
  { value: "automatique", label: "Automatique" },
  { value: "manuelle", label: "Manuelle" },
]
