import type { Key } from '../i18n'

/** Turn a raw technical error into the key of a short, plain sentence. */
export function errorKey(e: unknown): Key {
  const m = `${(e as { shortMessage?: string })?.shortMessage ?? ''} ${(e as Error)?.message ?? ''}`.toLowerCase()
  if (/user rejected|user denied|rejected the request|cancel/.test(m)) return 'txRejected'
  if (/insufficient funds|exceeds the balance|insufficient balance/.test(m)) return 'errFunds'
  if (/reserve/.test(m)) return 'reserveLow'
  if (/stale|oracle/.test(m)) return 'errStale'
  if (/http 5|http 4|failed to fetch|network|timeout|fetch|rpc/.test(m)) return 'errNetwork'
  return 'errGeneric'
}
