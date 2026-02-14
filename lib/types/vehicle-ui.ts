export type VehicleUI = {
  id: string
  name: string
  brand?: string
  model?: string
  year?: number
  type?: string
  price?: number
  image?: string
  images?: string[]
  fuel?: string
  transmission?: string
  seats?: number
  doors?: number
  rating?: number
  reviews?: number
  location?: string
  city?: string
  verified?: boolean
  featured?: boolean
  instantBooking?: boolean
  available?: boolean
  owner?: {
    name?: string
    avatar?: string
    rating?: number
    responseTime?: string
    memberSince?: string
    verified?: boolean
  }
  features?: string[]
  description?: string
  mileageLimit?: number
  insurance?: boolean
  deposit?: number
}
