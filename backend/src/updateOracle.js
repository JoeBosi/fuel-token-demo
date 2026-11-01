import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { config } from './config.js';

export const ORACLE_ABI = [
  'function setPrices(uint256 fuelEurPerLitre, uint256 polEur, uint64 sourceDate)',
  'function fuelPrice() view returns (uint256 price, uint64 updatedAt)',
  'function polPrice() view returns (uint256 price, uint64 updatedAt)',
  'function isFresh(uint64 maxAgeSeconds) view returns (bool)',
];

export const scale = (x) => BigInt(Math.round(x * 1e6));
export const dateToUnix = (d) => Math.floor(Date.parse(`${d}T00:00:00Z`) / 1000);

export async function updateOracle({ date, fuel_eur, pol_eur }, cfg = config) {
  if (!cfg.oracleAddress || !cfg.updaterKey || !cfg.rpcUrl) {
    console.log('[oracle] ORACLE_ADDRESS / UPDATER_PRIVATE_KEY / RPC_URL missing: on-chain update skipped');
    return null;
  }
  const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
  const wallet = new Wallet(cfg.updaterKey, provider);
  const oracle = new Contract(cfg.oracleAddress, ORACLE_ABI, wallet);
  const tx = await oracle.setPrices(scale(fuel_eur), scale(pol_eur), dateToUnix(date));
  console.log(`[oracle] setPrices sent: ${tx.hash}`);
  await tx.wait();
  return tx.hash;
}

/** Read the oracle state; returns null if not configured or unreachable. */
export async function readOracle(cfg = config) {
  if (!cfg.oracleAddress || !cfg.rpcUrl) return null;
  try {
    const provider = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId, { staticNetwork: true });
    const o = new Contract(cfg.oracleAddress, ORACLE_ABI, provider);
    const [[fuel, updatedAt], [pol], fresh] = await Promise.all([
      o.fuelPrice(), o.polPrice(), o.isFresh(3n * 86400n),
    ]);
    return { fuel: Number(fuel) / 1e6, pol: Number(pol) / 1e6, updatedAt: Number(updatedAt), fresh };
  } catch (e) {
    console.warn('[oracle] read failed:', e.message);
    return null;
  }
}
