import type { ReactNode } from 'react'

export const btnPrimary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-base font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 active:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60'
export const btnSecondary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60'
export const link = 'font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900'

export const Skeleton = ({ className = 'h-6 w-24' }: { className?: string }) => <span className={`skeleton ${className}`} aria-hidden="true" />

export function TestnetBadge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"><span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />{children}</span>
}

export function Notice({ kind, children }: { kind: 'info' | 'warn' | 'error' | 'ok'; children: ReactNode }) {
  const c = { info: 'border-sky-300 bg-sky-50 text-sky-950', warn: 'border-amber-300 bg-amber-50 text-amber-950', error: 'border-red-300 bg-red-50 text-red-950', ok: 'border-emerald-300 bg-emerald-50 text-emerald-950' }[kind]
  return <div role={kind === 'error' ? 'alert' : 'note'} className={`rounded-xl border-2 px-4 py-3 text-sm ${c}`}>{children}</div>
}
