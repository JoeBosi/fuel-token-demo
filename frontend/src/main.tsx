import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { wagmiConfig } from './config'
import { I18nProvider } from './i18n'
import { ToastProvider } from './components/Toasts'
import { basenameFromPath } from './lib/langUrl'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ToastProvider>
            <BrowserRouter basename={basenameFromPath(window.location.pathname)}>
              <App />
            </BrowserRouter>
          </ToastProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
