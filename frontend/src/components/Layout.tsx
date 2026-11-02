import { Link, NavLink, Outlet } from 'react-router-dom'
import { useI18n, type Key } from '../i18n'
import { Balance } from './Balance'
import { Wallet } from './Wallet'

const flagUK = (
  <svg width="22" height="15" viewBox="0 0 60 40" aria-hidden="true" className="rounded-sm border border-slate-300">
    <rect width="60" height="40" fill="#012169" /><path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" /><path d="M0 0l60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3" />
    <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" /><path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="8" />
  </svg>
)
const flagIT = (
  <svg width="22" height="15" viewBox="0 0 3 2" aria-hidden="true" className="rounded-sm border border-slate-300">
    <rect width="1" height="2" fill="#009246" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#ce2b37" />
  </svg>
)

const links: [string, Key][] = [['/', 'navHome'], ['/app', 'navApp'], ['/faucet', 'navFaucet'], ['/come-funziona', 'navHow']]

export function Layout() {
  const { t, toggle, lang } = useI18n()
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">{t('skipToContent')}</a>
      <div className="sticky top-0 z-40"><div className="bg-slate-900 px-3 py-1 text-center text-xs sm:text-sm sm:px-4 sm:py-2 font-semibold leading-snug text-white" role="note"><span className="mr-2 rounded bg-amber-400 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-900">{t('conceptTag')}</span><span className="sm:hidden">{t('conceptShort')}</span><span className="hidden sm:inline">{t('conceptBanner')}</span></div>
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#fbbf24" /><path d="M11 24V9h10M11 16h7" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            {t('appName')}
          </Link>
          <nav className="order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto" aria-label="Menu">
            {links.map(([to, k]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => `inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold ${isActive ? 'bg-amber-100 text-amber-950' : 'text-slate-700 hover:bg-slate-100'}`}>{t(k)}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Balance />
            <Wallet compact />
            <button type="button" onClick={toggle} aria-label={t('langLabel')} title={t('langLabel')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">{lang === 'it' ? flagUK : flagIT}<span>{t('lang')}</span></button>
          </div>
        </div>
        <Balance variant="row" />
      </header></div>
      <main id="main" className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-600">
        <p><a className="underline" href="https://www.giuseppebosi.com">{t('footer')}</a></p>
        <p className="mt-2">{t('disclaimer')}</p>
        <p className="mt-2 text-xs text-slate-600">{t('chainName')}</p>
      </footer>
    </div>
  )
}
