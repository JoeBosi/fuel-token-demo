# QA browser (01/11/2026)

Playwright + Chrome di sistema, 390 / 320 / 1280 px, contro Amoy reale. Il wallet e' un provider EIP-1193 iniettato
(ethers Wallet di test, `window.ethereum` + annuncio EIP-6963). **MetaMask vero NON e' stato provato.**

## Provato (OK)
- Home 390 px: 5 sezioni, prezzo live, bottone verso /app, toggle IT/EN traduce tutto.
- /app senza wallet: prezzo, grafico con 1 punto (asse Y 1.70-2.20), compra/vendi disabilitati con etichetta "Collega il wallet", nessun errore in console.
- /app con wallet: connessione, indirizzo, rete, anteprima = quoteBuy, acquisto 0.05 POL, saldo, storico con link Polygonscan, vendita, importo 0 / non numerico / oltre il saldo -> messaggio, bottone disabilitato.
- /faucet: 5 schede dall'API con badge; "Aggiungi rete Amoy" invia wallet_addEthereumChain 0x13882, POL. Senza wallet: avviso.
- /come-funziona: render e link al tutorial.
- Rete sbagliata (0x1): avviso "Passa a Polygon Amoy", compra/vendi bloccati, dopo lo switch tutto funziona.
- 320 px: nessuno scroll orizzontale su /, /app, /faucet, /come-funziona.

## Bug corretti
- `config.ts`: l'RPC ufficiale `rpc-amoy.polygon.technology` non risolve piu' (DNS): letture, quote, riserva fallivano. Ora publicnode + drpc con fallback (usati anche da wallet_addEthereumChain).
- `AppPage.tsx`: "Ultime operazioni" dava errore (getLogs su 40000 blocchi, i nodi pubblici ammettono 10000): ora a blocchi da 9000.
- `HowItWorks.tsx`: link tutorial ora `BASE_URL + tutorial/<lingua>/` (/tutorial/it/ o /tutorial/en/).
- `Faucet.tsx`: stato "unknown" mostrato grezzo, ora "da verificare".

## NON provato
- MetaMask reale, mobile reale, Safari/Firefox.
- Errore "riserva insufficiente" in UI (servirebbe un saldo FUEL maggiore della riserva; con un solo conto non si raggiunge).
- Rifiuto della firma da parte dell'utente.

## Osservazioni minori (non cambiate)
- Con importi minimi il saldo mostra 3 decimali (0,001 FUEL = 0,00 EUR).
- Con rete sbagliata ci sono 3 bottoni "Passa a Polygon Amoy" (header, titolo, banner).

## Giro 2 (01/11/2026): bandierina lingua e date
- Header: bottone con bandierina SVG inline + codice della lingua di arrivo (UK/EN sulle pagine IT, Italia/IT sulle EN), aria-label/title nella lingua corrente, altezza 40 px a 390 px; `<html lang>` aggiornato, localStorage invariato.
- Date: `src/lib/date.ts` (`formatDate`, `formatDateTime`), test in `date.test.ts` (verdi anche con TZ=America/Los_Angeles e Pacific/Auckland). Prezzo Home/App, asse e tooltip del grafico, updatedAt on chain ("01/11/2026 22:54"): sempre dd/mm/yyyy. Chiavi del grafico restano ISO.
- Browser 390 px (it-IT, en-US; home, /app): nessuno scroll orizzontale, link tutorial /tutorial/en/ o /it/ per lingua, footer EN in inglese.
- Nota: "Ultime operazioni" non mostra date (nessun campo data nella lista), quindi nulla da formattare; non verificato con wallet.

## Real MetaMask test (02/11/2026, MetaMask 13.52, Polygon Amoy)
Connect, switch from Ethereum to Amoy (add network), buy 0.1 POL and a sell all worked (screenshots in `qa-metamask/`). One sell attempt reverted on-chain on the first try and could not be reproduced. Fixed: POL formatting with the language separator, "< 0,001 FUEL" for tiny previews. Known: clicking "Connect" while a request is pending shows no message. Not tested: real phone, Safari, Firefox, MetaMask mobile.
