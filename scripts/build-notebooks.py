#!/usr/bin/env python3
"""Builds notebooks/*.ipynb (IT and EN) for the FuelToken demo. Run, then execute with nbconvert to store outputs."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORACLE = json.loads((ROOT / "contracts/deployments/amoy.json").read_text())["oracle"]
REPO = "fuel-token-demo"

_n = [0]
def _id():
    _n[0] += 1
    return f"cell{_n[0]:02d}"
def md(s): return {"cell_type": "markdown", "id": _id(), "metadata": {}, "source": s.strip("\n").splitlines(True)}
def code(s): return {"cell_type": "code", "id": _id(), "metadata": {}, "execution_count": None, "outputs": [], "source": s.strip("\n").splitlines(True)}

CODE = [
('install', "!pip install -q web3 requests"),
('imports', '''
import requests
from statistics import median
from web3 import Web3
'''),
('api', '''
# 1) Read petrol prices around Arezzo from the Italian "Osservaprezzi" service.
# A clear User-Agent and Accept header keep public services happy (many answer HTTP 403 without them).
URL = "https://carburanti.mise.gov.it/ospzApi/search/zone"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; educational-demo)",
    "Accept": "application/json",
    "Content-Type": "application/json",
}
body = {"points": [{"lat": 43.4636, "lng": 11.8748}], "radius": 30, "fuelType": "1-x", "priceOrder": "asc"}

resp = requests.post(URL, json=body, headers=HEADERS, timeout=30)
if resp.status_code == 403:
    raise SystemExit("HTTP 403: the service refused the request, check the User-Agent header")
if resp.status_code == 429:
    raise SystemExit("HTTP 429: too many requests, wait a minute and run the cell again")
resp.raise_for_status()
data = resp.json()
print("HTTP", resp.status_code, "- stations received:", len(data["results"]))
'''),
('median', '''
# 2) Keep only self-service unleaded petrol (fuelId 1) and take the median.
prices = [
    float(f["price"])
    for station in data["results"]
    for f in station["fuels"]
    if f["fuelId"] == 1 and f["isSelf"] is True and float(f["price"]) > 0
]
offchain = median(prices)
print(f"Median petrol price: {offchain:.3f} EUR/L over {len(prices)} stations")
'''),
('chain', f'''
# 3) Read the same price from the oracle contract on Polygon Amoy (read only, no wallet, no key).
RPC = "https://polygon-amoy-bor-rpc.publicnode.com"
ORACLE = "{ORACLE}"  # fuel/contracts/deployments/amoy.json
ABI = [
    {{"type": "function", "name": "fuelPrice", "stateMutability": "view", "inputs": [],
     "outputs": [{{"name": "price", "type": "uint256"}}, {{"name": "updatedAt", "type": "uint64"}}]}},
    {{"type": "function", "name": "isFresh", "stateMutability": "view",
     "inputs": [{{"name": "maxAgeSeconds", "type": "uint64"}}], "outputs": [{{"type": "bool"}}]}},
]
w3 = Web3(Web3.HTTPProvider(RPC, request_kwargs={{"timeout": 30}}))
print("Connected, chain id:", w3.eth.chain_id)  # 80002 = Polygon Amoy

oracle = w3.eth.contract(address=Web3.to_checksum_address(ORACLE), abi=ABI)
raw, updated_at = oracle.functions.fuelPrice().call()
onchain = raw / 1_000_000  # the contract stores 6 decimals: 1990000 means 1.99 EUR
print(f"On-chain petrol price: {{onchain}} EUR/L (raw value {{raw}})")
print("Price is fresh (3 days):", oracle.functions.isFresh(3 * 86400).call())
'''),
('compare', '''
# 4) Compare the two numbers. The oracle is updated once a day, so a small gap is normal.
gap = abs(offchain - onchain)
print(f"Off-chain {offchain:.3f} vs on-chain {onchain:.3f} -> gap {gap:.3f} EUR/L")
print("Close enough (under 5 cents):", gap < 0.05)
'''),
]

TXT = {
 "it": {
  "title": "# Token Benzina: leggi il prezzo e confrontalo con la blockchain",
  "intro": "Esercizio del tutorial di Token Benzina. In cinque celle: leggi il prezzo della benzina dal servizio pubblico del Ministero (Osservaprezzi), calcoli la **mediana**, leggi lo stesso prezzo dal contratto **oracolo** sulla rete di prova Polygon Amoy e confronti i due numeri. Non servono chiavi, portafogli o account: premi **Esegui tutto** (menu Runtime). In Colab serve un account Google gratuito per eseguire le celle.",
  "s": ["**Cella 1.** Installa le due librerie (circa un minuto).", "**Cella 2.** Importa gli strumenti.", "**Cella 3.** Chiama il servizio Osservaprezzi con un `User-Agent` chiaro, un timeout e messaggi di errore comprensibili.", "**Cella 4.** Tiene i prezzi self-service della benzina e calcola la mediana.", "**Cella 5.** Legge il prezzo dal contratto oracolo su Amoy (sola lettura). Il contratto salva i prezzi con 6 decimali.", "**Cella 6.** Confronta prezzo del servizio e prezzo sulla catena. L'oracolo si aggiorna una volta al giorno, quindi una piccola differenza è normale."],
  "end": "Fatto. Torna al tutorial: https://rwa-fuel.blockchain.giuseppebosi.com/tutorial/it/ch7.html",
  "badge": "Apri in Colab",
 },
 "en": {
  "title": "# Petrol Token: read the price and compare it with the blockchain",
  "intro": "Exercise from the Petrol Token tutorial. In a few cells you read the petrol price from the public Italian ministry service (Osservaprezzi), compute the **median**, read the same price from the **oracle** contract on the Polygon Amoy test network and compare the two numbers. No keys, wallets or accounts are needed: choose **Run all** (Runtime menu). Colab needs a free Google account to run cells.",
  "s": ["**Cell 1.** Installs the two libraries (about a minute).", "**Cell 2.** Imports the tools.", "**Cell 3.** Calls the Osservaprezzi service with a clear `User-Agent`, a timeout and readable error messages.", "**Cell 4.** Keeps the self-service petrol prices and computes the median.", "**Cell 5.** Reads the price from the oracle contract on Amoy (read only). The contract stores prices with 6 decimals.", "**Cell 6.** Compares the service price with the on-chain price. The oracle is updated once a day, so a small gap is normal."],
  "end": "Done. Back to the tutorial: https://rwa-fuel.blockchain.giuseppebosi.com/tutorial/en/ch7.html",
  "badge": "Open in Colab",
 },
}

for lang, fn in (("it", "fuel_price_oracle_it.ipynb"), ("en", "fuel_price_oracle_en.ipynb")):
    _n[0] = 0
    t = TXT[lang]
    link = f"https://colab.research.google.com/github/JoeBosi/{REPO}/blob/main/notebooks/{fn}"
    cells = [md(f'<a href="{link}" target="_blank" rel="noopener"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="{t["badge"]}"></a>'),
             md(t["title"]), md(t["intro"])]
    for (name, src), text in zip(CODE, t["s"]):
        cells += [md(text), code(src)]
    cells.append(md(t["end"]))
    nb = {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
          "language_info": {"name": "python"}, "colab": {"provenance": []}}, "nbformat": 4, "nbformat_minor": 5}
    (ROOT / "notebooks" / fn).write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n")
    print("wrote", fn)
