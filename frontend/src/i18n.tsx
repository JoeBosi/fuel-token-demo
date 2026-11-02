import { createContext, useCallback, useEffect, useContext, useMemo, useState, type ReactNode } from 'react'

const it = {
  appName: 'FuelToken',
  navHome: 'Home', navApp: 'App', navFaucet: 'Faucet', navHow: 'Come funziona',
  connect: 'Collega MetaMask', disconnect: 'Scollega', connecting: 'Collego...', noWallet: 'MetaMask non trovato: installalo per continuare.',
  wrongNetwork: 'Rete sbagliata', switchAmoy: 'Passa a Polygon Amoy', addAmoy: 'Aggiungi rete Amoy a MetaMask',
  network: 'Rete', connected: 'Collegato',
  // story
  s1Title: 'Quanto costa un litro di benzina oggi?',
  s1Body: 'Lo sai perché lo leggi al distributore.',
  s1Live: 'Prezzo di oggi intorno ad Arezzo', s1Stations: 'distributori', s1Loading: 'Carico il prezzo...', s1Error: 'Prezzo non disponibile al momento.',
  s2Title: 'Chi porta il numero alla blockchain?',
  s2Body: 'Un programma sulla blockchain non può leggere internet da solo: serve qualcuno che gli porti il numero. Si chiama oracolo.',
  s3Title: 'Da dove arriva il prezzo',
  s3Body: 'Ogni mattina leggiamo i prezzi dei distributori intorno ad Arezzo dai dati aperti del Ministero e scriviamo il prezzo sulla catena, con data e firma.',
  s4Title: 'FuelToken',
  s4Body: 'Una moneta digitale che vale un litro di benzina. Se la benzina sale, il tuo token vale di più in euro. Puoi comprarne con POL e rivenderli.',
  s5Title: 'Provalo: rete di prova, soldi finti, zero rischi',
  s5Button: 'Apri la dimostrazione', s5Faucet: 'Come ottengo POL di prova',
  conceptTag: 'Concept', conceptBanner: 'Concept a titolo didattico. Rete di prova (Polygon Amoy), soldi finti.',
  disclaimer: 'Dimostrazione didattica su Polygon Amoy. Nessun valore reale, nessuna benzina da ritirare.',
  // app
  priceToday: 'Prezzo di oggi', fuelPerLitre: 'Benzina (self), per litro', polPrice: 'POL in euro', date: 'Data', source: 'Fonte',
  sourceValue: 'Osservaprezzi Carburanti (MIMIT), mediana dei distributori intorno ad Arezzo (circa 10 km)',
  onchain: 'Sulla catena', updatedAt: 'Aggiornato il', fresh: 'fresco', stale: 'scaduto', noOracle: 'Oracolo non letto', oracleTx: 'Vedi la transazione su Polygonscan',
  stationsN: 'distributori',
  chart: 'Andamento', chartFuel: 'Benzina €/L', chartToken: 'Valore del token in euro', chartPol: 'POL €',
  chartHint: '1 FUEL = 1 litro, quindi il valore di un token in euro è uguale al prezzo della benzina.',
  chartEmpty: 'Ancora nessun dato nello storico.',
  wallet: 'Il mio portafoglio', balanceFuel: 'Saldo FUEL', valueEur: 'Valore in euro', balancePol: 'Saldo POL',
  walletLocked: 'Collega MetaMask per vedere il tuo saldo.',
  buy: 'Compra', buyInput: 'POL da spendere', buyPreview: 'Riceverai circa', buyButton: 'Compra FUEL',
  sell: 'Vendi', sellInput: 'FUEL da vendere', sellPreview: 'Riceverai circa', sellButton: 'Vendi FUEL',
  reserve: 'Riserva del contratto', reserveLow: 'La riserva non basta per questa vendita: prova con meno FUEL.',
  needWallet: 'Collega il wallet', needNetwork: 'Cambia rete',
  invalidAmount: 'Inserisci un numero maggiore di zero.', insufficientBalance: 'Saldo insufficiente.',
  notDeployed: 'Contratti non ancora pubblicati su questa rete.',
  history: 'Ultime operazioni', histEmpty: 'Nessuna operazione trovata.', histBought: 'Acquisto', histSold: 'Vendita', histLocked: 'Collega il wallet per vedere le tue operazioni.',
  histNote: 'Ultimi blocchi della rete.',
  txPending: 'Transazione inviata, attendo la conferma...', txConfirmed: 'Transazione confermata', txFailed: 'Transazione fallita', txRejected: 'Operazione annullata nel wallet.',
  loading: 'Carico...', error: 'Errore', retry: 'Riprova',
  // faucet
  faucetTitle: 'Dove trovare POL di prova',
  faucetIntro: 'Un faucet regala POL di prova, senza alcun valore, per pagare le operazioni sulla rete Amoy.',
  howTitle: 'Come si fa',
  step1: 'Installa MetaMask (estensione del browser o app).', step2: 'Aggiungi la rete Polygon Amoy con un clic qui sotto.',
  step3: 'Copia il tuo indirizzo da MetaMask.', step4: 'Incollalo in uno dei faucet e richiedi POL.',
  fAmount: 'Quantità', fCooldown: 'Attesa', fReq: 'Requisiti', fOpen: 'Apri', fStatus: 'Stato', fVerified: 'Verificato',
  statusLive: 'attivo', statusDown: 'non attivo', statusUnknown: 'da verificare',
  // how
  howPageTitle: 'Come funziona',
  howIntro: 'Cinque passi, dal dato aperto alla pagina che stai guardando.',
  h1: 'Dati aperti', h1d: 'Il Ministero pubblica i prezzi di ogni distributore.',
  h2: 'Backend', h2d: 'Ogni mattina un programma calcola il prezzo tipico intorno ad Arezzo.',
  h3: 'Oracolo', h3d: 'Il prezzo viene scritto sulla blockchain, con data e firma.',
  h4: 'Token FUEL', h4d: 'Il contratto usa quel prezzo per vendere e ricomprare i token.',
  h5: 'Questa pagina', h5d: 'Legge prezzo e saldo e ti fa provare, con soldi finti.',
  tutorial: 'Vai al tutorial completo',
  footer: 'Prof. Giuseppe Bosi, Scienze e Tecnologie Informatiche',
  // ux
  testnetBadge: 'Rete di prova, soldi finti', stepsTitle: 'Dietro le quinte, in 3 passi', homeHeroNote: 'Nessun rischio: usi POL di prova, senza alcun valore.',
  perLitre: 'al litro', skipToContent: 'Vai al contenuto',
  nextTitle: 'Il tuo prossimo passo',
  nextConnect: 'Collega MetaMask per iniziare', nextConnectBody: 'Serve un portafoglio (wallet) per comprare e vendere. Se non lo hai ancora, la pagina Faucet spiega come ottenerlo, gratis.',
  nextNoWallet: 'MetaMask non è installato', nextNoWalletBody: 'Installa MetaMask (estensione del browser o app) e ricarica la pagina. Poi torna qui.',
  nextNetwork: 'Passa alla rete di prova', nextNetworkBody: 'Il wallet è su un\'altra rete. Un clic e ti porto su Polygon Amoy, la rete di prova.',
  nextFaucet: 'Ti servono POL di prova', nextFaucetBody: 'Il tuo saldo POL è zero. Prendine un po\' gratis da un faucet (costa nulla e non ha valore), poi torna qui.', nextFaucetCta: 'Dove trovo POL di prova',
  nextBuy: 'Tutto pronto: prova a comprare', nextBuyBody: 'Scrivi quanti POL spendere nella scheda Compra e conferma nel wallet.', nextBuyCta: 'Vai a Compra',
  walletZeroFuel: 'Non hai ancora FUEL. Compra il primo qui sotto.',
  chartFew: 'Il grafico è appena nato: oggi ha {n} punto. Ogni mattina ne aggiungiamo uno nuovo, quindi la linea cresce giorno dopo giorno.',
  chartFewN: 'Il grafico è appena nato: ha {n} punti. Ogni mattina ne aggiungiamo uno nuovo, quindi la linea cresce giorno dopo giorno.',
  chartPoints: 'Punti nello storico', loadingPrice: 'Carico il prezzo di oggi',
  errFunds: 'Non hai abbastanza POL per questa operazione (serve anche un po\' per le commissioni).',
  errStale: 'Il prezzo sulla catena è scaduto: riprova tra poco, l\'aggiornamento arriva ogni mattina.',
  errNetwork: 'Problema di collegamento con la rete o con il server. Controlla la connessione e riprova.',
  errGeneric: 'Qualcosa non ha funzionato. Riprova; se succede ancora, scrivi a chi gestisce la demo.',
  faucetCta: 'Il primo passo', faucetOpenSite: 'Apri il faucet', faucetEmpty: 'Nessun faucet disponibile al momento.',
  howCta: 'Pronto a provare?', howCtaBody: 'Dopo aver letto, prova tu stesso con soldi finti.', howCtaApp: 'Apri la dimostrazione',
  stepWord: 'Passo', goApp: 'Apri la dimostrazione',
  lang: 'EN', langLabel: 'Passa all\'inglese',
}

const en: typeof it = {
  appName: 'FuelToken',
  navHome: 'Home', navApp: 'App', navFaucet: 'Faucet', navHow: 'How it works',
  connect: 'Connect MetaMask', disconnect: 'Disconnect', connecting: 'Connecting...', noWallet: 'MetaMask not found: install it to continue.',
  wrongNetwork: 'Wrong network', switchAmoy: 'Switch to Polygon Amoy', addAmoy: 'Add Amoy network to MetaMask',
  network: 'Network', connected: 'Connected',
  s1Title: 'How much is a litre of petrol today?',
  s1Body: 'You know, because you read it at the pump.',
  s1Live: 'Today\'s price around Arezzo', s1Stations: 'stations', s1Loading: 'Loading the price...', s1Error: 'Price not available right now.',
  s2Title: 'Who brings the number to the blockchain?',
  s2Body: 'A program on the blockchain cannot read the internet by itself: someone has to bring it the number. That someone is called an oracle.',
  s3Title: 'Where the price comes from',
  s3Body: 'Every morning we read the prices of the stations around Arezzo from the Ministry\'s open data and write the price on the chain, with date and signature.',
  s4Title: 'FuelToken',
  s4Body: 'A digital coin worth one litre of petrol. If petrol goes up, your token is worth more in euro. You can buy some with POL and sell them back.',
  s5Title: 'Try it: test network, play money, zero risk',
  s5Button: 'Open the demo', s5Faucet: 'How to get test POL',
  conceptTag: 'Concept', conceptBanner: 'Educational concept. Test network (Polygon Amoy), play money.',
  disclaimer: 'Educational demo on Polygon Amoy. No real value, no petrol to collect.',
  priceToday: 'Today\'s price', fuelPerLitre: 'Petrol (self-service), per litre', polPrice: 'POL in euro', date: 'Date', source: 'Source',
  sourceValue: 'Osservaprezzi Carburanti (MIMIT), median of the stations around Arezzo (about 10 km)',
  onchain: 'On chain', updatedAt: 'Updated on', fresh: 'fresh', stale: 'stale', noOracle: 'Oracle not read', oracleTx: 'See the transaction on Polygonscan',
  stationsN: 'stations',
  chart: 'Trend', chartFuel: 'Petrol €/L', chartToken: 'Token value in euro', chartPol: 'POL €',
  chartHint: '1 FUEL = 1 litre, so the value of one token in euro equals the petrol price.',
  chartEmpty: 'No history yet.',
  wallet: 'My wallet', balanceFuel: 'FUEL balance', valueEur: 'Value in euro', balancePol: 'POL balance',
  walletLocked: 'Connect MetaMask to see your balance.',
  buy: 'Buy', buyInput: 'POL to spend', buyPreview: 'You will receive about', buyButton: 'Buy FUEL',
  sell: 'Sell', sellInput: 'FUEL to sell', sellPreview: 'You will receive about', sellButton: 'Sell FUEL',
  reserve: 'Contract reserve', reserveLow: 'The reserve is not enough for this sale: try with less FUEL.',
  needWallet: 'Connect the wallet', needNetwork: 'Switch network',
  invalidAmount: 'Enter a number greater than zero.', insufficientBalance: 'Insufficient balance.',
  notDeployed: 'Contracts not deployed on this network yet.',
  history: 'Recent activity', histEmpty: 'No operations found.', histBought: 'Buy', histSold: 'Sell', histLocked: 'Connect the wallet to see your operations.',
  histNote: 'Latest blocks of the network.',
  txPending: 'Transaction sent, waiting for confirmation...', txConfirmed: 'Transaction confirmed', txFailed: 'Transaction failed', txRejected: 'Operation cancelled in the wallet.',
  loading: 'Loading...', error: 'Error', retry: 'Retry',
  faucetTitle: 'Where to get test POL',
  faucetIntro: 'A faucet gives away test POL, with no value, to pay for operations on the Amoy network.',
  howTitle: 'How to',
  step1: 'Install MetaMask (browser extension or app).', step2: 'Add the Polygon Amoy network with one click below.',
  step3: 'Copy your address from MetaMask.', step4: 'Paste it into one of the faucets and request POL.',
  fAmount: 'Amount', fCooldown: 'Cooldown', fReq: 'Requirements', fOpen: 'Open', fStatus: 'Status', fVerified: 'Verified',
  statusLive: 'live', statusDown: 'down', statusUnknown: 'to check',
  howPageTitle: 'How it works',
  howIntro: 'Five steps, from open data to the page you are looking at.',
  h1: 'Open data', h1d: 'The Ministry publishes the price of every station.',
  h2: 'Backend', h2d: 'Every morning a program computes the typical price around Arezzo.',
  h3: 'Oracle', h3d: 'The price is written on the blockchain, with date and signature.',
  h4: 'FUEL token', h4d: 'The contract uses that price to sell and buy back tokens.',
  h5: 'This page', h5d: 'Reads price and balance and lets you try it with play money.',
  tutorial: 'Go to the full tutorial',
  footer: 'Prof. Giuseppe Bosi, Computer Science and Technology',
  testnetBadge: 'Test network, play money', stepsTitle: 'Behind the scenes, in 3 steps', homeHeroNote: 'No risk: you use test POL, which has no value.',
  perLitre: 'per litre', skipToContent: 'Skip to content',
  nextTitle: 'Your next step',
  nextConnect: 'Connect MetaMask to start', nextConnectBody: 'You need a wallet to buy and sell. If you do not have one yet, the Faucet page explains how to get it, for free.',
  nextNoWallet: 'MetaMask is not installed', nextNoWalletBody: 'Install MetaMask (browser extension or app) and reload the page. Then come back here.',
  nextNetwork: 'Switch to the test network', nextNetworkBody: 'Your wallet is on another network. One click and I take you to Polygon Amoy, the test network.',
  nextFaucet: 'You need test POL', nextFaucetBody: 'Your POL balance is zero. Get some for free from a faucet (it costs nothing and has no value), then come back.', nextFaucetCta: 'Where to get test POL',
  nextBuy: 'All set: try buying', nextBuyBody: 'Type how much POL to spend in the Buy card and confirm in your wallet.', nextBuyCta: 'Go to Buy',
  walletZeroFuel: 'You have no FUEL yet. Buy your first one below.',
  chartFew: 'The chart has just been born: today it has {n} point. Every morning we add a new one, so the line grows day after day.',
  chartFewN: 'The chart has just been born: it has {n} points. Every morning we add a new one, so the line grows day after day.',
  chartPoints: 'Points in the history', loadingPrice: 'Loading today\'s price',
  errFunds: 'You do not have enough POL for this operation (a little is also needed for fees).',
  errStale: 'The on-chain price is out of date: try again soon, the update arrives every morning.',
  errNetwork: 'Connection problem with the network or the server. Check your connection and try again.',
  errGeneric: 'Something went wrong. Try again; if it keeps happening, contact whoever runs the demo.',
  faucetCta: 'The first step', faucetOpenSite: 'Open the faucet', faucetEmpty: 'No faucet available right now.',
  howCta: 'Ready to try?', howCtaBody: 'After reading, try it yourself with play money.', howCtaApp: 'Open the demo',
  stepWord: 'Step', goApp: 'Open the demo',
  lang: 'IT', langLabel: 'Switch to Italian',
}

export type Lang = 'it' | 'en'
export type Key = keyof typeof it
export const dictionary = { it, en }

const STORE = 'fuel-lang'
function initial(): Lang {
  try {
    const v = localStorage.getItem(STORE)
    if (v === 'it' || v === 'en') return v
  } catch { /* storage unavailable */ }
  return 'it'
}

interface Ctx { lang: Lang; locale: string; t: (k: Key) => string; toggle: () => void }
const I18nContext = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial)
  const toggle = useCallback(() => {
    setLang((l) => {
      const n: Lang = l === 'it' ? 'en' : 'it'
      try { localStorage.setItem(STORE, n) } catch { /* ignore */ }
      return n
    })
  }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const value = useMemo<Ctx>(() => ({
    lang, toggle, locale: lang === 'it' ? 'it-IT' : 'en-GB', t: (k) => dictionary[lang][k],
  }), [lang, toggle])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): Ctx {
  const c = useContext(I18nContext)
  if (!c) throw new Error('useI18n outside provider')
  return c
}
