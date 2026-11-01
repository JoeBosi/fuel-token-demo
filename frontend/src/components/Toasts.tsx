import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type ToastKind = 'info' | 'success' | 'error'
interface Toast { id: number; kind: ToastKind; text: string; href?: string | null }
type Push = (kind: ToastKind, text: string, href?: string | null) => void

const ToastContext = createContext<Push>(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback<Push>((kind, text, href) => {
    const id = Date.now() + Math.random()
    setItems((l) => [...l, { id, kind, text, href }])
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), 8000)
  }, [])
  const colors: Record<ToastKind, string> = {
    info: 'border-sky-300 bg-sky-50 text-sky-900',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    error: 'border-red-300 bg-red-50 text-red-900',
  }
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-3 left-3 right-3 z-50 flex flex-col gap-2 sm:left-auto sm:w-96" role="status" aria-live="polite">
        {items.map((x) => (
          <div key={x.id} className={`rounded-lg border px-4 py-3 text-sm shadow ${colors[x.kind]}`}>
            {x.text}
            {x.href && <> <a className="underline" href={x.href} target="_blank" rel="noreferrer">Polygonscan</a></>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
