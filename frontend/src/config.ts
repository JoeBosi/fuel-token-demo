import { createConfig, fallback, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const amoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  // rpc-amoy.polygon.technology no longer resolves (checked 01/11/2026): use public nodes instead
  rpcUrls: { default: { http: ['https://polygon-amoy-bor-rpc.publicnode.com', 'https://polygon-amoy.drpc.org'] } },
  blockExplorers: { default: { name: 'Polygonscan', url: 'https://amoy.polygonscan.com' } },
  testnet: true,
})

export const localhost = defineChain({
  id: 31337,
  name: 'Hardhat Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
  testnet: true,
})

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) || 'http://127.0.0.1:3801'
const envChain = Number(import.meta.env.VITE_CHAIN_ID)
export const TARGET_CHAIN_ID: 80002 | 31337 = envChain === 31337 ? 31337 : 80002
export const targetChain = TARGET_CHAIN_ID === 31337 ? localhost : amoy

export const wagmiConfig = createConfig({
  chains: [amoy, localhost],
  connectors: [injected()],
  transports: { [amoy.id]: fallback(amoy.rpcUrls.default.http.map((u) => http(u))), [localhost.id]: http() },
})

/** Params for wallet_addEthereumChain (used when the wallet does not know the network). */
export function addChainParams(chain = targetChain) {
  const explorer = chain.blockExplorers?.default.url
  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [...chain.rpcUrls.default.http],
    ...(explorer ? { blockExplorerUrls: [explorer] } : {}),
  }
}

export const explorerTx = (hash: string) => (targetChain.blockExplorers ? `${targetChain.blockExplorers.default.url}/tx/${hash}` : null)
