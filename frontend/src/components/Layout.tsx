import { Link, NavLink, Outlet } from 'react-router-dom'
import { useI18n, type Key } from '../i18n'
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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-amber-600">{t('appName')}</Link>
          <nav className="order-last flex w-full gap-4 overflow-x-auto text-sm sm:order-none sm:w-auto">
            {links.map(([to, k]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'font-semibold text-amber-700' : 'text-slate-600 hover:text-slate-900')}>{t(k)}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Wallet compact />
            <button type="button" onClick={toggle} aria-label={t('langLabel')} title={t('langLabel')} className="inline-flex min-h-10 items-center gap-2 rounded border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">{lang === 'it' ? flagUK : flagIT}<span>{t('lang')}</span></button>
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-600">
        <p><a className="underline" href="https://www.giuseppebosi.com">{t('footer')}</a></p>
        <p className="mt-2">{t('disclaimer')}</p>
      </footer>
    </div>
  )
}
