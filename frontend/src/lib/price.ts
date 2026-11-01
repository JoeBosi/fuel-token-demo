import { formatUnits, parseUnits } from 'viem'

/** Prices from the oracle use 6 decimals, FUEL and POL use 18. */
export const PRICE_DECIMALS = 6
export const TOKEN_DECIMALS = 18

export function formatEur(value: number, locale = 'it-IT', digits = 2): string {
  if (!Number.isFinite(value)) return '-'
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(value)
}

/** Format a FUEL amount (wei bigint or plain number) with exactly 3 decimals, truncated (never rounded up). */
export function formatFuel(value: bigint | number, locale = 'it-IT'): string {
  const n = typeof value === 'bigint' ? Number(formatUnitsFixed(value, TOKEN_DECIMALS, 3)) : Math.trunc(value * 1000) / 1000
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n)
}

/** Truncate a bigint amount to `digits` decimals and return it as a decimal string. */
export function formatUnitsFixed(value: bigint, decimals: number, digits: number): string {
  const s = formatUnits(value, decimals)
  const [i, f = ''] = s.split('.')
  return digits > 0 ? `${i}.${f.padEnd(digits, '0').slice(0, digits)}` : i
}

/** Parse user text ("1,5" or "1.5") into base units; returns null if invalid or not positive. */
export function parseAmount(text: string, decimals: number): bigint | null {
  const clean = text.trim().replace(',', '.')
  if (!/^\d*\.?\d+$|^\d+\.$/.test(clean)) return null
  try {
    const v = parseUnits(clean, decimals)
    return v > 0n ? v : null
  } catch {
    return null
  }
}

/** Convert a 6-decimal on-chain price to a plain number. */
export const priceToNumber = (p: bigint): number => Number(p) / 10 ** PRICE_DECIMALS
/** Convert a plain EUR price to the 6-decimal integer. */
export const numberToPrice = (n: number): bigint => BigInt(Math.round(n * 10 ** PRICE_DECIMALS))

/** Value in EUR of a FUEL balance (wei) at a EUR/litre price. */
export function fuelValueEur(balanceWei: bigint, fuelEur: number): number {
  return Number(formatUnits(balanceWei, TOKEN_DECIMALS)) * fuelEur
}

export const shortAddress = (a: string): string => `${a.slice(0, 6)}...${a.slice(-4)}`
