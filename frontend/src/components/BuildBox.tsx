import { useI18n } from '../i18n'

const GITHUB = 'https://github.com/JoeBosi/fuel-token-demo'

export function BuildBox() {
  const { t, lang } = useI18n()
  const coding = lang === 'it' ? '/tutorial/it/costruisci.html' : '/tutorial/en/build.html'
  const tutorial = lang === 'it' ? '/tutorial/it/' : '/tutorial/en/'
  const btn = 'inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-5 text-base font-semibold text-slate-900 hover:bg-slate-100'
  return (
    <section className="px-4 py-12 sm:py-16" aria-labelledby="build-title">
      <div className="mx-auto max-w-5xl rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <h2 id="build-title" className="text-2xl font-bold sm:text-3xl">{t('buildTitle')}</h2>
        <p className="mt-2 text-lg text-slate-800">{t('buildBody')}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href={coding} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-400 px-5 text-base font-bold text-slate-900 hover:bg-amber-300">{t('buildCoding')}</a>
          <a href={tutorial} className={btn}>{t('buildTutorial')}</a>
          <a href={GITHUB} target="_blank" rel="noreferrer" className={btn}>{t('buildGithub')}</a>
        </div>
      </div>
    </section>
  )
}
