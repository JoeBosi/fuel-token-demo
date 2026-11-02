import { useI18n } from '../i18n'

const NODES = ['flow1', 'flow2', 'flow3', 'flow4', 'flow5'] as const

/** Inline SVG flow: pump data -> server -> oracle -> token -> wallet. Vertical so it stays readable at 390 px. */
export function FlowDiagram() {
  const { t } = useI18n()
  const h = 52, gap = 24
  const total = NODES.length * h + (NODES.length - 1) * gap
  return (
    <svg viewBox={`0 0 340 ${total}`} role="img" aria-label={t('flowAria')} className="mx-auto h-auto w-full max-w-sm">
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b45309" /></marker>
      </defs>
      {NODES.map((k, i) => {
        const y = i * (h + gap)
        const last = i === NODES.length - 1
        return (
          <g key={k}>
            <rect x="2" y={y} width="336" height={h} rx="14" fill={last ? '#fbbf24' : '#fef3c7'} stroke="#f59e0b" strokeWidth="2" />
            <text x="170" y={y + 22} textAnchor="middle" fontSize="17" fontWeight="700" fill="#0f172a">{t(k)}</text>
            <text x="170" y={y + 41} textAnchor="middle" fontSize="13" fill="#334155">{t(`${k}s` as 'flow1s')}</text>
            {!last && <line x1="170" y1={y + h + 2} x2="170" y2={y + h + gap - 3} stroke="#b45309" strokeWidth="2.5" markerEnd="url(#flow-arrow)" />}
          </g>
        )
      })}
    </svg>
  )
}
