import { Link } from 'react-router-dom'
import { btnPrimary, btnSecondary } from '../components/ui'
import { useI18n, type Key } from '../i18n'

const steps: [Key, Key][] = [['h1', 'h1d'], ['h2', 'h2d'], ['h3', 'h3d'], ['h4', 'h4d'], ['h5', 'h5d']]

export default function HowItWorks() {
  const { t, lang } = useI18n()
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t('howPageTitle')}</h1>
      <p className="mt-2 text-lg text-slate-700">{t('howIntro')}</p>
      <ol className="mt-8 flex flex-col items-stretch">
        {steps.map(([a, b], i) => (
          <li key={a} className="flex flex-col items-center">
            <div className="flex w-full gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-950">{i + 1}</span>
              <div>
                <p className="text-xl font-bold">{t(a)}</p>
                <p className="mt-1 text-slate-700">{t(b)}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <svg width="24" height="32" viewBox="0 0 24 36" aria-hidden="true" className="text-amber-600"><path d="M12 2v28M5 23l7 8 7-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-lg font-bold">{t('howCta')}</p>
        <p className="mt-1 text-slate-700">{t('howCtaBody')}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link to="/app" className={btnPrimary}>{t('howCtaApp')} <span aria-hidden="true">→</span></Link>
          <a href={`${import.meta.env.BASE_URL}tutorial/${lang}/`} className={btnSecondary}>{t('tutorial')}</a>
        </div>
      </div>
    </div>
  )
}
