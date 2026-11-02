import { useAccount, useBalance, useReadContract } from 'wagmi'
import { usePrice } from '../api'
import { addressesFor, fuelTokenAbi } from '../contracts/addresses'
import { TARGET_CHAIN_ID } from '../config'
import { useI18n } from '../i18n'
import { formatEur, formatFuel, formatPol, fuelValueEur } from '../lib/price'
import type { Abi } from 'viem'

const REFRESH_MS = 8000

/** POL and token (litres) balance of the connected account, refreshed on its own and after every transaction. */
export function Balance({ variant = 'inline' }: { variant?: 'inline' | 'row' }) {
  const { t, locale } = useI18n()
  const { address, isConnected, chainId } = useAccount()
  const price = usePrice()
  const token = addressesFor(TARGET_CHAIN_ID)?.token
  const enabled = isConnected && !!address && chainId === TARGET_CHAIN_ID
  const pol = useBalance({ address, chainId: TARGET_CHAIN_ID, query: { enabled, refetchInterval: REFRESH_MS } })
  const litres = useReadContract({ address: token, abi: fuelTokenAbi as unknown as Abi, functionName: 'balanceOf', args: address ? [address] : undefined, chainId: TARGET_CHAIN_ID, query: { enabled: enabled && !!token, refetchInterval: REFRESH_MS } })
  if (!isConnected || !address || chainId !== TARGET_CHAIN_ID) return null
  const bal = litres.data as bigint | undefined
  const eur = bal !== undefined && price.data ? formatEur(fuelValueEur(bal, price.data.fuel_eur), locale, 2) : null
  const text = (
    <p className="text-sm font-semibold tabular-nums text-slate-900" aria-label={t('balanceAria')} aria-live="polite">
      <span>{pol.data ? formatPol(pol.data.value, locale, 2) : '...'} POL</span>
      <span aria-hidden="true" className="mx-1.5 text-slate-400">·</span>
      <span>{bal !== undefined ? formatFuel(bal, locale) : '...'} L</span>
      {eur && <span className="ml-1.5 font-normal text-slate-700">(≈ {eur})</span>}
    </p>
  )
  return variant === 'row'
    ? <div className="border-t border-slate-100 bg-amber-50/70 px-4 py-1.5 text-center sm:hidden">{text}</div>
    : <div className="hidden sm:block">{text}</div>
}
