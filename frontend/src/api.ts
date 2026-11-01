import { useQuery } from '@tanstack/react-query'
import { API_URL } from './config'

export interface PriceInfo {
  date: string; fuel_eur: number; pol_eur: number; n_stations: number; tx_hash: string | null
  source?: string
  oracle: { fuel: number; pol: number; updatedAt: number; fresh: boolean } | null
}
export interface HistoryRow { date: string; fuel_eur: number; pol_eur: number; n_stations?: number }
export interface Faucet {
  name: string; url: string; amount: string; cooldown: string; requirements: string; status: string; notes: string
}

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(`${API_URL}${path}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return (await r.json()) as T
}

export const usePrice = () => useQuery({ queryKey: ['price'], queryFn: () => getJson<PriceInfo>('/api/price'), refetchInterval: 60_000 })
export const useHistory = (days = 365) => useQuery({ queryKey: ['history', days], queryFn: () => getJson<HistoryRow[]>(`/api/history?days=${days}`) })
export const useFaucets = () => useQuery({ queryKey: ['faucets'], queryFn: () => getJson<Faucet[]>('/api/faucets') })
