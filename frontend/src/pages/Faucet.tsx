import { useFaucets } from '../api'
import { useNetworkActions } from '../components/network'
import { useToast } from '../components/Toasts'
import { btnPrimary, Notice, Skeleton } from '../components/ui'
import { useI18n } from '../i18n'
import { errorKey } from '../lib/errors'

export default function Faucet() {
  const { t } = useI18n()
  const toast = useToast()
  const q = useFaucets()
  const { addNetwork } = useNetworkActions()
  const badge = (s: string) =>
    s === 'live' ? ['bg-emerald-100 text-emerald-900', t('statusLive')]
      : s === 'down' || s === 'dead' ? ['bg-red-100 text-red-900', t('statusDown')]
        : ['bg-slate-200 text-slate-800', !s || s === 'unknown' ? t('statusUnknown') : s]
  const steps = [t('step1'), t('step2'), t('step3'), t('step4')]
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t('faucetTitle')}</h1>
      <p className="mt-2 text-lg text-slate-700">{t('faucetIntro')}</p>

      <h2 className="mt-8 text-xl font-bold">{t('howTitle')}</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-950">{i + 1}</span>
            <span className="pt-0.5">{s}</span>
          </li>
        ))}
      </ol>
      <button className={`${btnPrimary} mt-4 w-full sm:w-auto`}
        onClick={() => addNetwork().catch((e: Error) => toast('error', e.message === 'no-wallet' ? t('noWallet') : t(errorKey(e))))}>{t('addAmoy')}</button>

      <div className="mt-8 space-y-4">
        {q.isLoading && [0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" role="status" aria-label={t('loading')}><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
        ))}
        {q.isError && <Notice kind="error">{t(errorKey(q.error))} <button className="font-bold underline" onClick={() => q.refetch()}>{t('retry')}</button></Notice>}
        {q.data && q.data.length === 0 && <p className="text-slate-700">{t('faucetEmpty')}</p>}
        {q.data?.map((f) => {
          const [cls, label] = badge(f.status)
          return (
            <article key={f.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-bold">{f.name}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                <div><dt className="font-semibold text-slate-600">{t('fAmount')}</dt><dd>{f.amount}</dd></div>
                <div><dt className="font-semibold text-slate-600">{t('fCooldown')}</dt><dd>{f.cooldown}</dd></div>
                <div><dt className="font-semibold text-slate-600">{t('fReq')}</dt><dd>{f.requirements}</dd></div>
              </dl>
              {f.notes && <p className="mt-3 text-sm text-slate-700">{f.notes}</p>}
              <a className={`${btnPrimary} mt-4 w-full sm:w-auto`} href={f.url} target="_blank" rel="noreferrer">{t('fOpen')} <span aria-hidden="true">↗</span></a>
            </article>
          )
        })}
      </div>
    </div>
  )
}
