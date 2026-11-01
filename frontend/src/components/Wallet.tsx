import { useAccount, useChains, useConnect, useDisconnect } from 'wagmi'
import { useI18n } from '../i18n'
import { shortAddress } from '../lib/price'
import { useToast } from './Toasts'
import { useNetworkActions } from './network'

export function Wallet({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const toast = useToast()
  const { address, isConnected, chainId } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chains = useChains()
  const { wrong, switchNetwork, isPending: switching } = useNetworkActions()
  const chainName = chains.find((c) => c.id === chainId)?.name ?? `#${chainId ?? '?'}`

  if (!isConnected) {
    return (
      <button
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        disabled={isPending}
        onClick={() => {
          if (!(window as unknown as { ethereum?: unknown }).ethereum) { toast('error', t('noWallet')); return }
          const c = connectors[0]
          if (c) connect({ connector: c })
        }}
      >{isPending ? t('connecting') : t('connect')}</button>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {!compact && <span className="text-slate-500">{t('network')}:</span>}
      <span className={`rounded px-2 py-0.5 text-xs ${wrong ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{wrong ? t('wrongNetwork') : chainName}</span>
      {wrong && (
        <button disabled={switching} className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700" onClick={() => switchNetwork().catch(() => toast('error', t('txRejected')))}>{t('switchAmoy')}</button>
      )}
      <button title={t('disconnect')} onClick={() => disconnect()} className="rounded border border-slate-300 px-2 py-1 font-mono text-xs hover:bg-slate-100">{shortAddress(address ?? '')}</button>
    </div>
  )
}
