import { Link, NavLink, Outlet } from 'react-router-dom'
import { useI18n, type Key } from '../i18n'
import { Wallet } from './Wallet'

const links: [string, Key][] = [['/', 'navHome'], ['/app', 'navApp'], ['/faucet', 'navFaucet'], ['/come-funziona', 'navHow']]

export function Layout() {
  const { t, toggle } = useI18n()
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
            <button onClick={toggle} className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" aria-label="Language">{t('lang')}</button>
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
