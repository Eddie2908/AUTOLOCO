"use client"

import useSWR, { type SWRConfiguration } from "swr"
import { paymentService } from "@/lib/api/services/payment.service"

export function usePayments(
  filters?: {
    status?: string
    startDate?: string
    endDate?: string
  },
  options?: SWRConfiguration,
) {
  const queryKey = filters ? `/payments?${JSON.stringify(filters)}` : "/payments"

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    async () => {
      const response = await paymentService.getPaymentHistory(filters)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      ...options,
    },
  )

  return {
    payments: data?.payments || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}

export function useOwnerEarnings(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    "/payments/earnings",
    async () => {
      const response = await paymentService.getPaymentHistory({ type: "earnings" })
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    {
      revalidateOnFocus: true,
      ...options,
    },
  )

  return {
    earnings: data?.payments || [],
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  }
}
