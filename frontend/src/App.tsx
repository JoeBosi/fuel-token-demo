import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import AppPage from './pages/AppPage'
import Faucet from './pages/Faucet'
import HowItWorks from './pages/HowItWorks'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="app" element={<AppPage />} />
        <Route path="faucet" element={<Faucet />} />
        <Route path="come-funziona" element={<HowItWorks />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
