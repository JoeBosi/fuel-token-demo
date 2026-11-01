const base = { width: 120, height: 120, viewBox: '0 0 120 120', fill: 'none', stroke: 'currentColor', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export const PumpIcon = () => (
  <svg {...base}><rect x="22" y="20" width="48" height="80" rx="6" /><rect x="32" y="30" width="28" height="20" rx="3" /><path d="M70 40h14a8 8 0 0 1 8 8v34a6 6 0 0 0 12 0V50l-10-12" /><path d="M16 100h60" /></svg>
)
export const OracleIcon = () => (
  <svg {...base}><circle cx="28" cy="60" r="16" /><path d="M44 60h32" /><path d="M68 50l10 10-10 10" /><rect x="84" y="40" width="26" height="40" rx="4" /><path d="M90 52h14M90 60h14M90 68h8" /></svg>
)
export const DataIcon = () => (
  <svg {...base}><path d="M20 90V60M44 90V40M68 90V54M92 90V28" /><path d="M14 98h92" /><circle cx="92" cy="20" r="6" /></svg>
)
export const TokenIcon = () => (
  <svg {...base}><circle cx="60" cy="60" r="38" /><path d="M46 78V42h22M46 58h18" /><path d="M78 40v10" /></svg>
)
export const TestIcon = () => (
  <svg {...base}><path d="M44 16h32M50 16v34L26 92a8 8 0 0 0 7 12h54a8 8 0 0 0 7-12L70 50V16" /><path d="M38 76h44" /></svg>
)
