import { useI18n, type Key } from '../i18n'

const steps: [Key, Key][] = [['h1', 'h1d'], ['h2', 'h2d'], ['h3', 'h3d'], ['h4', 'h4d'], ['h5', 'h5d']]

export default function HowItWorks() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('howPageTitle')}</h1>
      <p className="mt-2 text-slate-700">{t('howIntro')}</p>
      <ol className="mt-8 flex flex-col items-stretch">
        {steps.map(([a, b], i) => (
          <li key={a} className="flex flex-col items-center">
            <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-amber-700">{i + 1}</p>
              <p className="text-xl font-bold">{t(a)}</p>
              <p className="text-slate-700">{t(b)}</p>
            </div>
            {i < steps.length - 1 && (
              <svg width="24" height="36" viewBox="0 0 24 36" aria-hidden="true" className="text-amber-500"><path d="M12 2v28M5 23l7 8 7-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </li>
        ))}
      </ol>
      <a href="tutorial/" className="mt-8 inline-block rounded-lg bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-600">{t('tutorial')}</a>
    </div>
  )
}
