console.log("Basic NFT Royalty Splitter UI loaded");

const connectBtn = document.getElementById("connect-basic");
const depositBtn = document.getElementById("deposit-button-basic");
const claimBtn = document.getElementById("claim-button-basic");

connectBtn?.addEventListener("click", () => {
  alert(
    "This is the basic stub UI. Open index.html for the redesigned UX and integration hints.",
  );
});

depositBtn?.addEventListener("click", () => {
  const input = document.getElementById("deposit-amount-basic");
  const amount = input && "value" in input ? input.value : "0";
  alert(`Pretend depositing ${amount} microSTX into the on-chain royalty pool.`);
});

claimBtn?.addEventListener("click", () => {
  alert("Pretend calling claim() on the royalty-splitter contract.");
});
