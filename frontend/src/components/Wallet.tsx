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
        className="hidden min-h-11 items-center rounded-xl bg-amber-400 sm:inline-flex px-4 text-sm font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
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
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${wrong ? 'bg-red-100 text-red-900' : 'hidden min-[1280px]:inline bg-emerald-100 text-emerald-900'}`}>{wrong ? t('wrongNetwork') : chainName}</span>
      {wrong && (
        <button disabled={switching} className="min-h-11 rounded-xl bg-red-700 px-3 text-xs font-semibold text-white hover:bg-red-800" onClick={() => switchNetwork().catch(() => toast('error', t('txRejected')))}>{t('switchAmoy')}</button>
      )}
      <button title={t('disconnect')} onClick={() => disconnect()} className="min-h-11 rounded-xl border-2 border-slate-300 px-3 font-mono text-xs hover:bg-slate-100">{shortAddress(address ?? '')}</button>
    </div>
  )
}
