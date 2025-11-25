// Lightweight, framework-free UI glue code.
// This intentionally keeps on-chain integration minimal so it runs without a bundler.
// Replace the stubbed sections with @stacks/connect + openContractCall for a full dApp.

const statusEl = document.getElementById("status");
const connectedEl = document.getElementById("connected-address");

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function setConnectedAddress(address) {
  if (!connectedEl) return;
  if (!address) {
    connectedEl.style.display = "none";
    connectedEl.textContent = "";
  } else {
    connectedEl.style.display = "inline-flex";
    connectedEl.textContent = address;
  }
}

// In a real app you would wire this to @stacks/connect.
// For now we just simulate a connection for demo purposes.
const connectBtn = document.getElementById("connect");
connectBtn?.addEventListener("click", async () => {
  setStatus("Connecting wallet (demo stub)...");

  // TODO for production: use @stacks/connect openAuthPopup here.
  // This placeholder lets you narrate the flow in under 5 minutes.
  setTimeout(() => {
    const fakeAddress = "ST_FAKE_DEMO_ADDRESS_1234";
    setConnectedAddress(fakeAddress);
    setStatus("Wallet connected (stub). Replace with real Stacks Connect.");
  }, 600);
});

// Configure collaborators (calls set-collaborator-share twice in a real dApp)
const collaboratorsForm = document.getElementById("collaborators-form");
collaboratorsForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const a1 = document.getElementById("artist-1-principal");
  const s1 = document.getElementById("artist-1-share");
  const a2 = document.getElementById("artist-2-principal");
  const s2 = document.getElementById("artist-2-share");

  const artist1 = a1 && "value" in a1 ? a1.value : "";
  const share1 = s1 && "value" in s1 ? s1.value : "";
  const artist2 = a2 && "value" in a2 ? a2.value : "";
  const share2 = s2 && "value" in s2 ? s2.value : "";

  setStatus(
    `Would call set-collaborator-share for ${artist1} (${share1}%) and ${artist2} (${share2}%).`,
  );
});

// Deposit royalties
const depositForm = document.getElementById("deposit-form");
depositForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const amountInput = document.getElementById("deposit-amount");
  const amountStr = amountInput && "value" in amountInput ? amountInput.value : "0";
  const amount = Number(amountStr || "0");

  if (!amount || amount <= 0) {
    setStatus("Enter a positive microSTX amount to deposit.");
    return;
  }

  setStatus(
    `Would call deposit-liquidity(${amount}) on the royalty-splitter contract using openContractCall.`,
  );
});

// Preview claimable for an arbitrary artist principal
const previewBtn = document.getElementById("preview-claimable");
const previewOutput = document.getElementById("preview-output");

previewBtn?.addEventListener("click", () => {
  const input = document.getElementById("artist-preview-principal");
  const principal = input && "value" in input ? input.value : "";

  if (!principal) {
    setStatus("Paste an artist principal to preview claimable balance.");
    return;
  }

  // In a full app, you would call the read-only function get-claimable here
  // via the Stacks RPC endpoint. We log a descriptive message instead.
  const demoAmount = 700; // illustrative only
  if (previewOutput) {
    previewOutput.textContent = `Demo: artist ${principal} would be able to claim approximately ${demoAmount} microSTX based on current pool.`;
  }
  setStatus(
    `Would call read-only function get-claimable(${principal}) on the contract and render the result here.`,
  );
});

// Claim royalties for the connected artist
const claimButton = document.getElementById("claim-button");
claimButton?.addEventListener("click", () => {
  setStatus(
    "Would call claim() on the royalty-splitter contract for the currently connected artist.",
  );
});
