import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useBalance, useConnect, usePublicClient, useReadContract, useWriteContract } from 'wagmi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDate, formatDateTime } from '../lib/date'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getAbiItem, type Abi, type AbiEvent, type Address } from 'viem'
import { useHistory, usePrice } from '../api'
import { useNetworkActions } from '../components/network'
import { useToast } from '../components/Toasts'
import { addressesFor, fuelTokenAbi } from '../contracts/addresses'
import { explorerTx, targetChain, TARGET_CHAIN_ID } from '../config'
import { btnPrimary, btnSecondary, Notice, Skeleton, TestnetBadge } from '../components/ui'
import { errorKey } from '../lib/errors'
import { useI18n } from '../i18n'
import { formatEur, formatFuel, formatPol, fuelValueEur, parseAmount, TOKEN_DECIMALS } from '../lib/price'

const abi = fuelTokenAbi as unknown as Abi

function Card({ title, children, className = '', id }: { title: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {children}
    </section>
  )
}
const Big = ({ children }: { children: ReactNode }) => <p className="text-3xl font-extrabold tabular-nums">{children}</p>

function PriceCard() {
  const { t, locale } = useI18n()
  const q = usePrice()
  const d = q.data
  return (
    <Card title={t('priceToday')}>
      {q.isLoading && <div className="space-y-3" role="status" aria-label={t('loading')}><div className="grid grid-cols-2 gap-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /></div>}
      {q.isError && <Notice kind="error">{t(errorKey(q.error))} <button className="font-bold underline" onClick={() => q.refetch()}>{t('retry')}</button></Notice>}
      {d && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-slate-600">{t('fuelPerLitre')}</p><Big>{formatEur(d.fuel_eur, locale, 3)}</Big></div>
            <div><p className="text-sm text-slate-600">{t('polPrice')}</p><Big>{formatEur(d.pol_eur, locale, 4)}</Big></div>
          </div>
          <p className="text-sm text-slate-700">{t('date')}: <b>{formatDate(d.date)}</b> · {d.n_stations} {t('stationsN')}</p>
          <p className="text-sm text-slate-700">{t('source')}: {t('sourceValue')}</p>
          <p className="text-sm text-slate-700">
            {t('onchain')}:{' '}
            {d.oracle ? (
              <>
                {t('updatedAt')} {formatDateTime(d.oracle.updatedAt)}{' '}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.oracle.fresh ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>{d.oracle.fresh ? t('fresh') : t('stale')}</span>
              </>
            ) : t('noOracle')}
          </p>
          {d.tx_hash && explorerTx(d.tx_hash) && (
            <a className="inline-block py-1 text-sm font-semibold text-amber-800 underline" href={explorerTx(d.tx_hash)!} target="_blank" rel="noreferrer">{t('oracleTx')}</a>
          )}
        </div>
      )}
    </Card>
  )
}

function ChartCard() {
  const { t, locale } = useI18n()
  const q = useHistory(365)
  const [mode, setMode] = useState<'fuel' | 'token'>('fuel')
  const [showPol, setShowPol] = useState(false)
  const rows = q.data ?? []
  return (
    <Card title={t('chart')} className="md:col-span-2">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        {(['fuel', 'token'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={`min-h-10 rounded-full px-4 ${mode === m ? 'bg-amber-400 font-bold text-slate-900' : 'border-2 border-slate-300 text-slate-800'}`}>
            {m === 'fuel' ? t('chartFuel') : t('chartToken')}
          </button>
        ))}
        <label className="ml-2 flex min-h-10 items-center gap-2"><input className="h-5 w-5" type="checkbox" checked={showPol} onChange={(e) => setShowPol(e.target.checked)} /> {t('chartPol')}</label>
      </div>
      {q.isLoading && <Skeleton className="h-64 w-full" />}
      {q.isError && <Notice kind="error">{t(errorKey(q.error))} <button className="font-bold underline" onClick={() => q.refetch()}>{t('retry')}</button></Notice>}
      {q.data && rows.length === 0 && <p className="text-slate-700">{t('chartEmpty')}</p>}
      {rows.length > 0 && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={30} tickFormatter={(v: string) => formatDate(v)} />
              <YAxis yAxisId="l" tick={{ fontSize: 11 }} domain={[(min: number) => Math.max(0, Math.floor((min - 0.2) * 10) / 10), (max: number) => Math.ceil((max + 0.2) * 10) / 10]} width={48} tickFormatter={(v: number) => v.toFixed(2)} />
              {showPol && <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} domain={['auto', 'auto']} width={48} tickFormatter={(v: number) => v.toFixed(3)} />}
              <Tooltip labelFormatter={(v) => formatDate(String(v))} formatter={(v) => formatEur(Number(v), locale, 3)} />
              <Legend />
              <Line yAxisId="l" type="monotone" dataKey="fuel_eur" name={mode === 'fuel' ? t('chartFuel') : t('chartToken')} stroke="#b45309" strokeWidth={3} dot={rows.length < 40 ? { r: 5 } : false} />
              {showPol && <Line yAxisId="r" type="monotone" dataKey="pol_eur" name={t('chartPol')} stroke="#4f46e5" strokeWidth={2} dot={rows.length < 40} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {rows.length > 0 && rows.length < 7 && <div className="mt-3"><Notice kind="info">{(rows.length === 1 ? t('chartFew') : t('chartFewN')).replace('{n}', String(rows.length))}</Notice></div>}
      {mode === 'token' && <p className="mt-2 text-sm text-slate-700">{t('chartHint')}</p>}
    </Card>
  )
}

function useTokenReads() {
  const { address } = useAccount()
  const addrs = addressesFor(TARGET_CHAIN_ID)
  const token = addrs?.token
  const bal = useReadContract({ address: token, abi, functionName: 'balanceOf', args: address ? [address] : undefined, chainId: TARGET_CHAIN_ID, query: { enabled: !!token && !!address } })
  const reserve = useReadContract({ address: token, abi, functionName: 'reserve', chainId: TARGET_CHAIN_ID, query: { enabled: !!token } })
  const pol = useBalance({ address, chainId: TARGET_CHAIN_ID, query: { enabled: !!address } })
  return { token, address, fuelBalance: bal.data as bigint | undefined, reserve: reserve.data as bigint | undefined, polBalance: pol.data?.value, bal }
}

function WalletCard() {
  const { t, locale } = useI18n()
  const { address, fuelBalance, polBalance, token } = useTokenReads()
  const price = usePrice()
  return (
    <Card title={t('wallet')}>
      {!address ? <p className="text-slate-700">{t('walletLocked')}</p> : !token ? <p className="text-slate-700">{t('notDeployed')}</p> : (
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-sm text-slate-600">{t('balanceFuel')}</p><Big>{fuelBalance === undefined ? <Skeleton className="h-8 w-20" /> : formatFuel(fuelBalance, locale)}</Big></div>
          <div><p className="text-sm text-slate-600">{t('valueEur')}</p><Big>{fuelBalance === undefined || !price.data ? <Skeleton className="h-8 w-24" /> : formatEur(fuelValueEur(fuelBalance, price.data.fuel_eur), locale)}</Big></div>
          <div className="col-span-2"><p className="text-sm text-slate-600">{t('balancePol')}</p><Big>{polBalance === undefined ? <Skeleton className="h-8 w-28" /> : `${formatPol(polBalance, locale)} POL`}</Big></div>
          {fuelBalance === 0n && <p className="col-span-2 text-sm text-slate-700">{t('walletZeroFuel')}</p>}
        </div>
      )}
    </Card>
  )
}

function useTrade() {
  const { t } = useI18n()
  const toast = useToast()
  const qc = useQueryClient()
  const { writeContractAsync, isPending } = useWriteContract()
  const client = usePublicClient({ chainId: TARGET_CHAIN_ID })
  const run = async (functionName: 'buy' | 'sell', token: Address, args: readonly unknown[], value?: bigint) => {
    try {
      const hash = await writeContractAsync({ address: token, abi, functionName, args, value, chainId: TARGET_CHAIN_ID })
      toast('info', t('txPending'), explorerTx(hash))
      const receipt = await client!.waitForTransactionReceipt({ hash })
      if (receipt.status === 'success') toast('success', t('txConfirmed'), explorerTx(hash))
      else toast('error', t('txFailed'), explorerTx(hash))
      await qc.invalidateQueries()
    } catch (e) {
      const m = e as { name?: string; shortMessage?: string }
      toast('error', m.name === 'UserRejectedRequestError' ? t('txRejected') : `${t('txFailed')}. ${t(errorKey(e))}`)
    }
  }
  return { run, isPending }
}

function useGate() {
  const { t } = useI18n()
  const { isConnected } = useAccount()
  const { wrong } = useNetworkActions()
  const token = addressesFor(TARGET_CHAIN_ID)?.token
  const blocked = !isConnected ? t('needWallet') : wrong ? t('needNetwork') : !token ? t('notDeployed') : null
  return { blocked, token }
}

function BuyCard() {
  const { t, locale } = useI18n()
  const { run, isPending } = useTrade()
  const { blocked, token } = useGate()
  const { polBalance } = useTokenReads()
  const [text, setText] = useState('')
  const amount = parseAmount(text, TOKEN_DECIMALS)
  const quote = useReadContract({ address: token, abi, functionName: 'quoteBuy', args: amount ? [amount] : undefined, chainId: TARGET_CHAIN_ID, query: { enabled: !!token && !!amount } })
  const tooMuch = amount !== null && polBalance !== undefined && amount > polBalance
  const err = text && !amount ? t('invalidAmount') : tooMuch ? t('insufficientBalance') : null
  return (
    <Card title={t('buy')} id="buy">
      <label className="block text-sm font-medium text-slate-700">{t('buyInput')}
        <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="0.1" className="mt-1 w-full min-h-12 rounded-xl border-2 border-slate-300 px-3 py-2 text-lg" />
      </label>
      <p className="mt-3 text-sm text-slate-700">{t('buyPreview')}</p>
      <Big>{quote.data !== undefined ? `${formatFuel(quote.data as bigint, locale)} ${t('unit')}` : '-'}</Big>
      {quote.isError && <p className="mt-1 text-sm font-medium text-red-800" role="alert">{t(errorKey(quote.error))}</p>}
      {err && <p className="mt-1 text-sm font-medium text-red-800" role="alert">{err}</p>}
      <button className="mt-4 min-h-12 w-full rounded-xl bg-emerald-700 px-4 py-3 text-base font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!!blocked || !amount || !!err || isPending} title={blocked ?? undefined}
        onClick={() => token && amount && run('buy', token, [], amount)}>{blocked ?? t('buyButton')}</button>
    </Card>
  )
}

function SellCard() {
  const { t, locale } = useI18n()
  const { run, isPending } = useTrade()
  const { blocked, token } = useGate()
  const { fuelBalance, reserve } = useTokenReads()
  const [text, setText] = useState('')
  const amount = parseAmount(text, TOKEN_DECIMALS)
  const quote = useReadContract({ address: token, abi, functionName: 'quoteSell', args: amount ? [amount] : undefined, chainId: TARGET_CHAIN_ID, query: { enabled: !!token && !!amount } })
  const polOut = quote.data as bigint | undefined
  const lowReserve = polOut !== undefined && reserve !== undefined && polOut > reserve
  const tooMuch = amount !== null && fuelBalance !== undefined && amount > fuelBalance
  const err = text && !amount ? t('invalidAmount') : tooMuch ? t('insufficientBalance') : lowReserve ? t('reserveLow') : null
  return (
    <Card title={t('sell')}>
      <label className="block text-sm font-medium text-slate-700">{t('sellInput')}
        <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="1" className="mt-1 w-full min-h-12 rounded-xl border-2 border-slate-300 px-3 py-2 text-lg" />
      </label>
      <p className="mt-3 text-sm text-slate-700">{t('sellPreview')}</p>
      <Big>{polOut !== undefined ? `${formatPol(polOut, locale)} POL` : '-'}</Big>
      <p className="mt-1 text-sm text-slate-700">{t('reserve')}: {reserve !== undefined ? `${formatPol(reserve, locale)} POL` : '-'}</p>
      {quote.isError && <p className="mt-1 text-sm font-medium text-red-800" role="alert">{t(errorKey(quote.error))}</p>}
      {err && <p className="mt-1 text-sm font-medium text-red-800" role="alert">{err}</p>}
      <button className="mt-4 min-h-12 w-full rounded-xl bg-rose-700 px-4 py-3 text-base font-bold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!!blocked || !amount || !!err || isPending} title={blocked ?? undefined}
        onClick={() => token && amount && run('sell', token, [amount])}>{blocked ?? t('sellButton')}</button>
    </Card>
  )
}

interface Op { kind: 'buy' | 'sell'; fuel: bigint; pol: bigint; hash: string; block: bigint; idx: number }
const LOOKBACK = 40_000n
const CHUNK = 9_000n

function HistoryCard() {
  const { t, locale } = useI18n()
  const { address } = useAccount()
  const client = usePublicClient({ chainId: TARGET_CHAIN_ID })
  const token = addressesFor(TARGET_CHAIN_ID)?.token
  const q = useQuery({
    queryKey: ['ops', address, token],
    enabled: !!address && !!token && !!client,
    queryFn: async (): Promise<Op[]> => {
      const latest = await client!.getBlockNumber()
      const fromBlock = latest > LOOKBACK ? latest - LOOKBACK : 0n
      const bought = getAbiItem({ abi, name: 'Bought' }) as AbiEvent
      const sold = getAbiItem({ abi, name: 'Sold' }) as AbiEvent
      // public RPCs cap getLogs at 10000 blocks per call: query in chunks
      const chunks: [bigint, bigint][] = []
      for (let f = fromBlock; f <= latest; f += CHUNK) chunks.push([f, f + CHUNK - 1n > latest ? latest : f + CHUNK - 1n])
      const [b, s] = await Promise.all([bought, sold].map(async (event) => {
        const parts = await Promise.all(chunks.map(([f, t]) => client!.getLogs({ address: token, event, args: event === bought ? { buyer: address } : { seller: address }, fromBlock: f, toBlock: t })))
        return parts.flat()
      }))
      const ops: Op[] = []
      for (const l of b as unknown as { args: { polIn: bigint; fuelOut: bigint }; transactionHash: string; blockNumber: bigint; logIndex: number }[])
        ops.push({ kind: 'buy', fuel: l.args.fuelOut, pol: l.args.polIn, hash: l.transactionHash, block: l.blockNumber, idx: l.logIndex })
      for (const l of s as unknown as { args: { polOut: bigint; fuelIn: bigint }; transactionHash: string; blockNumber: bigint; logIndex: number }[])
        ops.push({ kind: 'sell', fuel: l.args.fuelIn, pol: l.args.polOut, hash: l.transactionHash, block: l.blockNumber, idx: l.logIndex })
      return ops.sort((x, y) => (x.block === y.block ? y.idx - x.idx : x.block > y.block ? -1 : 1)).slice(0, 20)
    },
  })
  return (
    <Card title={t('history')} className="md:col-span-2">
      {!address && <p className="text-slate-700">{t('histLocked')}</p>}
      {address && q.isLoading && <div className="space-y-2" role="status" aria-label={t('loading')}><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>}
      {q.isError && <Notice kind="error">{t(errorKey(q.error))} <button className="font-bold underline" onClick={() => q.refetch()}>{t('retry')}</button></Notice>}
      {q.data && q.data.length === 0 && <p className="text-slate-700">{t('histEmpty')} <span className="text-xs">({t('histNote')})</span></p>}
      {q.data && q.data.length > 0 && (
        <ul className="divide-y divide-slate-100 text-sm">
          {q.data.map((o) => (
            <li key={`${o.hash}-${o.idx}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${o.kind === 'buy' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>{o.kind === 'buy' ? t('histBought') : t('histSold')}</span>
              <span className="tabular-nums">{formatFuel(o.fuel, locale)} {t('unit')} {o.kind === 'buy' ? '←' : '→'} {formatPol(o.pol, locale, 6)} POL</span>
              {explorerTx(o.hash)
                ? <a className="py-1 font-semibold text-amber-800 underline" href={explorerTx(o.hash)!} target="_blank" rel="noreferrer">Polygonscan</a>
                : <span className="font-mono text-xs text-slate-500">{o.hash.slice(0, 10)}...</span>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function NextStep() {
  const { t } = useI18n()
  const toast = useToast()
  const { isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { wrong, switchNetwork, isPending: switching } = useNetworkActions()
  const { polBalance } = useTokenReads()
  const hasEthereum = typeof window !== 'undefined' && !!(window as unknown as { ethereum?: unknown }).ethereum
  let n = 1, title: string, body: string, action: ReactNode
  if (!isConnected && !hasEthereum) {
    title = t('nextNoWallet'); body = t('nextNoWalletBody')
    action = <Link to="/faucet" className={btnSecondary}>{t('s5Faucet')}</Link>
  } else if (!isConnected) {
    title = t('nextConnect'); body = t('nextConnectBody')
    action = (
      <>
        <button className={btnPrimary} disabled={isPending} onClick={() => connectors[0] && connect({ connector: connectors[0] })}>{isPending ? t('connecting') : t('connect')}</button>
        <Link to="/faucet" className={btnSecondary}>{t('s5Faucet')}</Link>
      </>
    )
  } else if (wrong) {
    n = 2; title = t('nextNetwork'); body = t('nextNetworkBody')
    action = <button className={btnPrimary} disabled={switching} onClick={() => switchNetwork().catch((e) => toast('error', t(errorKey(e))))}>{t('switchAmoy')}</button>
  } else if (polBalance === 0n) {
    n = 3; title = t('nextFaucet'); body = t('nextFaucetBody')
    action = <Link to="/faucet" className={btnPrimary}>{t('nextFaucetCta')}</Link>
  } else {
    n = 4; title = t('nextBuy'); body = t('nextBuyBody')
    action = <a href="#buy" className={btnPrimary}>{t('nextBuyCta')}</a>
  }
  return (
    <section className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" aria-label={t('nextTitle')}>
      <p className="text-xs font-bold uppercase tracking-wide text-amber-900">{t('nextTitle')} · {t('stepWord')} {n}/4</p>
      <h2 className="mt-1 text-xl font-bold sm:text-2xl">{title}</h2>
      <p className="mt-1 text-slate-800">{body}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">{action}</div>
    </section>
  )
}

export default function AppPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{t('appName')}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700"><TestnetBadge>{targetChain.name}</TestnetBadge><span>{t('testnetBadge')}</span></p>
        </div>
      </div>
      <NextStep />
      <div className="mb-4"><Notice kind="warn">{t('disclaimer')}</Notice></div>
      <div className="grid gap-4 md:grid-cols-2">
        <PriceCard />
        <WalletCard />
        <ChartCard />
        <BuyCard />
        <SellCard />
        <HistoryCard />
      </div>
    </div>
  )
}
