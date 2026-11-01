import { useFaucets } from '../api'
import { useNetworkActions } from '../components/network'
import { useToast } from '../components/Toasts'
import { useI18n } from '../i18n'

export default function Faucet() {
  const { t } = useI18n()
  const toast = useToast()
  const q = useFaucets()
  const { addNetwork } = useNetworkActions()
  const badge = (s: string) =>
    s === 'live' ? ['bg-emerald-100 text-emerald-800', t('statusLive')]
      : s === 'down' || s === 'dead' ? ['bg-red-100 text-red-800', t('statusDown')]
        : ['bg-slate-200 text-slate-700', !s || s === 'unknown' ? t('statusUnknown') : s]
  const steps = [t('step1'), t('step2'), t('step3'), t('step4')]
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('faucetTitle')}</h1>
      <p className="mt-2 text-slate-700">{t('faucetIntro')}</p>
      <h2 className="mt-8 text-xl font-bold">{t('howTitle')}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
      <button className="mt-4 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
        onClick={() => addNetwork().catch((e: Error) => toast('error', e.message === 'no-wallet' ? t('noWallet') : t('txRejected')))}>{t('addAmoy')}</button>
      <div className="mt-8 space-y-4">
        {q.isLoading && <p>{t('loading')}</p>}
        {q.isError && <p className="text-red-700">{t('error')}: {(q.error as Error).message} <button className="underline" onClick={() => q.refetch()}>{t('retry')}</button></p>}
        {q.data?.map((f) => {
          const [cls, label] = badge(f.status)
          return (
            <article key={f.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold">{f.name}</h3>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="font-semibold text-slate-500">{t('fAmount')}</dt><dd>{f.amount}</dd></div>
                <div><dt className="font-semibold text-slate-500">{t('fCooldown')}</dt><dd>{f.cooldown}</dd></div>
                <div><dt className="font-semibold text-slate-500">{t('fReq')}</dt><dd>{f.requirements}</dd></div>
              </dl>
              {f.notes && <p className="mt-2 text-sm text-slate-600">{f.notes}</p>}
              <a className="mt-3 inline-block font-semibold text-amber-700 underline" href={f.url} target="_blank" rel="noreferrer">{t('fOpen')}</a>
            </article>
          )
        })}
      </div>
    </div>
  )
}
