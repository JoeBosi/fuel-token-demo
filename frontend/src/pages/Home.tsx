import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePrice } from '../api'
import { DataIcon, OracleIcon, PumpIcon, TestIcon, TokenIcon } from '../components/Illustrations'
import { useI18n, type Key } from '../i18n'
import { formatEur } from '../lib/price'

function Section({ n, icon, title, body, tone, children }: { n: number; icon: ReactNode; title: string; body: string; tone: string; children?: ReactNode }) {
  return (
    <section className={`${tone} px-4 py-14 sm:py-20`}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:text-left">
        <div className="shrink-0 text-amber-600 md:order-last">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-700">{n} / 5</p>
          <h2 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-3 text-lg text-slate-700">{body}</p>
          {children}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { t, locale } = useI18n()
  const price = usePrice()
  const k = (x: string) => x as Key
  return (
    <div>
      <Section n={1} tone="bg-white" icon={<PumpIcon />} title={t(k('s1Title'))} body={t(k('s1Body'))}>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-slate-600">{t('s1Live')}</p>
          {price.isLoading && <p className="mt-1 text-slate-600">{t('s1Loading')}</p>}
          {price.isError && <p className="mt-1 text-red-700">{t('s1Error')}</p>}
          {price.data && (
            <>
              <p className="text-5xl font-extrabold tabular-nums text-slate-900">{formatEur(price.data.fuel_eur, locale, 3)}<span className="text-2xl font-semibold"> /L</span></p>
              <p className="mt-1 text-sm text-slate-600">{price.data.date} · {price.data.n_stations} {t('s1Stations')}</p>
            </>
          )}
        </div>
      </Section>
      <Section n={2} tone="bg-slate-50" icon={<OracleIcon />} title={t('s2Title')} body={t('s2Body')} />
      <Section n={3} tone="bg-white" icon={<DataIcon />} title={t('s3Title')} body={t('s3Body')} />
      <Section n={4} tone="bg-slate-50" icon={<TokenIcon />} title={t('s4Title')} body={t('s4Body')} />
      <Section n={5} tone="bg-white" icon={<TestIcon />} title={t('s5Title')} body="">
        <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
          <Link to="/app" className="rounded-lg bg-amber-500 px-6 py-3 text-lg font-semibold text-white hover:bg-amber-600">{t('s5Button')}</Link>
          <Link to="/faucet" className="rounded-lg border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-100">{t('s5Faucet')}</Link>
        </div>
        <p className="mt-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 text-left font-medium text-amber-900" role="note">{t('disclaimer')}</p>
      </Section>
    </div>
  )
}
