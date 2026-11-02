import type { ReactNode } from 'react'
import { formatDate } from '../lib/date'
import { Link } from 'react-router-dom'
import { usePrice } from '../api'
import { DataIcon, OracleIcon, PumpIcon, TestIcon, TokenIcon } from '../components/Illustrations'
import { btnPrimary, btnSecondary, Notice, Skeleton, TestnetBadge } from '../components/ui'
import { useI18n } from '../i18n'
import { formatEur } from '../lib/price'
import { FlowDiagram } from '../components/FlowDiagram'

function StepCard({ n, icon, title, body }: { n: number; icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-base font-bold text-amber-950">{n}</span>
        <span className="text-amber-700 [&>svg]:h-14 [&>svg]:w-14">{icon}</span>
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-700">{body}</p>
    </li>
  )
}

export default function Home() {
  const { t, locale } = useI18n()
  const price = usePrice()
  return (
    <div>
      <section className="bg-gradient-to-b from-amber-50 to-white px-4 pb-12 pt-8 sm:pb-16 sm:pt-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-center">
          <div className="flex-1">
            <TestnetBadge>{t('testnetBadge')}</TestnetBadge>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">{t('s1Title')}</h1>
            <p className="mt-3 text-lg text-slate-700">{t('s1Body')}</p>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm" aria-live="polite">
              <p className="text-sm font-medium text-slate-700">{t('s1Live')}</p>
              {price.isLoading && <div className="mt-2 space-y-2" role="status" aria-label={t('loadingPrice')}><Skeleton className="h-12 w-48" /><Skeleton className="h-4 w-56" /></div>}
              {price.isError && <div className="mt-2"><Notice kind="error">{t('s1Error')} <button className="font-bold underline" onClick={() => price.refetch()}>{t('retry')}</button></Notice></div>}
              {price.data && (
                <>
                  <p className="mt-1 text-5xl font-extrabold tabular-nums">{formatEur(price.data.fuel_eur, locale, 3)}<span className="text-xl font-semibold text-slate-600"> /L</span></p>
                  <p className="mt-1 text-base font-medium text-slate-800">{t('priceCap').replace('{n}', String(price.data.n_stations))}</p>
                  <p className="mt-1 text-sm text-slate-700">{formatDate(price.data.date)}</p>
                </>
              )}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">{t('missionTitle')}</h2>
              <p className="mt-2 text-lg text-slate-700">{t('missionBody')}</p>
              <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-base font-medium text-amber-950">{t('missionHonest')}</p>
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-800">{t('flowTitle')}</p>
              <div className="mt-3"><FlowDiagram /></div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/app" className={`${btnPrimary} text-lg`}>{t('s5Button')} <span aria-hidden="true">→</span></Link>
              <Link to="/faucet" className={btnSecondary}>{t('s5Faucet')}</Link>
            </div>
            <p className="mt-3 text-sm text-slate-700">{t('homeHeroNote')}</p>
          </div>
          <div className="hidden shrink-0 text-amber-600 md:block [&>svg]:h-44 [&>svg]:w-44"><PumpIcon /></div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('stepsTitle')}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <StepCard n={1} icon={<OracleIcon />} title={t('s2Title')} body={t('s2Body')} />
            <StepCard n={2} icon={<DataIcon />} title={t('s3Title')} body={t('s3Body')} />
            <StepCard n={3} icon={<TokenIcon />} title={t('s4Title')} body={t('s4Body')} />
          </ol>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <span className="text-amber-700 [&>svg]:h-20 [&>svg]:w-20"><TestIcon /></span>
          <h2 className="text-2xl font-bold sm:text-3xl">{t('s5Title')}</h2>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link to="/app" className={`${btnPrimary} text-lg`}>{t('s5Button')} <span aria-hidden="true">→</span></Link>
            <Link to="/faucet" className={btnSecondary}>{t('s5Faucet')}</Link>
          </div>
          <div className="w-full text-left"><Notice kind="warn"><b>{t('disclaimer')}</b></Notice></div>
        </div>
      </section>
    </div>
  )
}
