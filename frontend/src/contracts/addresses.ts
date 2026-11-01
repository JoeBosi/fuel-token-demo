import type { Address } from 'viem'
import deployments from './deployments.json'
import FuelTokenAbi from './FuelToken.json'
import FuelPriceOracleAbi from './FuelPriceOracle.json'

export const fuelTokenAbi = FuelTokenAbi as unknown as typeof FuelTokenAbi
export const oracleAbi = FuelPriceOracleAbi as unknown as typeof FuelPriceOracleAbi

export interface DeployedAddresses { oracle: Address | ''; token: Address | '' }

// deployments.json is filled by the deploy step (31337 from hardhat.json, 80002 after the Amoy deploy).
export const addresses = deployments as unknown as Record<string, DeployedAddresses>

export function addressesFor(chainId: number): { oracle: Address; token: Address } | null {
  const a = addresses[String(chainId)]
  if (!a || !a.oracle || !a.token) return null
  return { oracle: a.oracle as Address, token: a.token as Address }
}
