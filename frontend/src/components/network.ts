import { useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { addChainParams, TARGET_CHAIN_ID } from '../config'

interface Eip1193 { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> }
const getProvider = (): Eip1193 | undefined => (window as unknown as { ethereum?: Eip1193 }).ethereum

/** Switch to the target chain; if the wallet does not know it, ask the wallet to add it. */
export function useNetworkActions() {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync, isPending } = useSwitchChain()
  const wrong = isConnected && chainId !== TARGET_CHAIN_ID

  const addNetwork = useCallback(async () => {
    const p = getProvider()
    if (!p) throw new Error('no-wallet')
    await p.request({ method: 'wallet_addEthereumChain', params: [addChainParams()] })
  }, [])

  const switchNetwork = useCallback(async () => {
    try {
      await switchChainAsync({ chainId: TARGET_CHAIN_ID })
    } catch (e) {
      const code = (e as { code?: number; cause?: { code?: number } }).code ?? (e as { cause?: { code?: number } }).cause?.code
      if (code === 4902 || (e as Error).name === 'SwitchChainError') await addNetwork()
      else throw e
    }
  }, [switchChainAsync, addNetwork])

  return { wrong, isPending, switchNetwork, addNetwork, hasWallet: !!getProvider() }
}
