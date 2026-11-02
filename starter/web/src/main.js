import { createPublicClient, createWalletClient, custom, http, parseEther, formatUnits } from "viem";
import { hardhat, polygonAmoy } from "viem/chains";
import deployment from "./deployment.json"; // written by scripts/deploy.js

const chain = deployment.chainId === 80002 ? polygonAmoy : hardhat;

const abi = [
  { type: "function", name: "fuelPrice", stateMutability: "view", inputs: [], outputs: [{ name: "price", type: "uint256" }, { name: "updatedAt", type: "uint64" }] },
  { type: "function", name: "isFresh", stateMutability: "view", inputs: [{ name: "maxAgeSeconds", type: "uint64" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "buy", stateMutability: "payable", inputs: [], outputs: [] },
];

const $ = (id) => document.getElementById(id);
const publicClient = createPublicClient({ chain, transport: http() });
let walletClient;
let account;

async function readPrice() {
  const [price, updatedAt] = await publicClient.readContract({
    address: deployment.oracle, abi, functionName: "fuelPrice",
  });
  const fresh = await publicClient.readContract({
    address: deployment.oracle, abi, functionName: "isFresh", args: [3n * 86400n],
  });
  $("price").textContent = formatUnits(price, 6) + " EUR per litre";
  $("fresh").textContent = fresh
    ? "Fresh. Updated " + new Date(Number(updatedAt) * 1000).toLocaleString()
    : "The price is old: buying is paused.";
}

async function readBalance() {
  if (!account) return;
  const b = await publicClient.readContract({
    address: deployment.token, abi, functionName: "balanceOf", args: [account],
  });
  $("balance").textContent = formatUnits(b, 18) + " FUEL";
}

$("connect").onclick = async () => {
  if (!window.ethereum) { $("status").textContent = "MetaMask not found."; return; }
  walletClient = createWalletClient({ chain, transport: custom(window.ethereum) });
  [account] = await walletClient.requestAddresses();
  try { await walletClient.switchChain({ id: chain.id }); }
  catch { await walletClient.addChain({ chain }); }
  $("account").textContent = "Connected: " + account;
  $("buy").disabled = false;
  await readBalance();
};

$("buy").onclick = async () => {
  $("status").textContent = "Waiting for MetaMask...";
  try {
    const hash = await walletClient.writeContract({
      address: deployment.token, abi, functionName: "buy",
      value: parseEther("0.1"), account,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    $("status").textContent = "Done: " + hash;
    await readBalance();
  } catch (e) {
    $("status").textContent = "Cancelled or failed: " + (e.shortMessage || e.message);
  }
};

readPrice().catch((e) => { $("price").textContent = "cannot read: " + e.message; });
