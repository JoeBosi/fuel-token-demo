// Date display helpers. ISO strings are split, never parsed with Date, so no timezone shift.
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso ?? '')
}

// Unix seconds -> "dd/mm/yyyy HH:mm" (24 h), same in both languages. timeZone optional (default: browser).
export function formatDateTime(unixSeconds: number, timeZone?: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(unixSeconds * 1000)).map((x) => [x.type, x.value]),
  )
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}
