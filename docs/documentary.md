# NFT Royalty Splitter – 5-minute documentary

## 0:00–0:30 — The problem
Web3 makes it easy to mint a collaborative NFT drop, but it is still surprisingly hard to share revenue fairly and transparently. Most artists end up trusting a central account to "do the math" and wire money later. That means delays, accounting headaches, and a lot of blind trust.

Our NFT Royalty Splitter contract turns that handshake into code. Any time royalties arrive, the contract knows **who** the collaborators are and **what percent** they should receive. Anyone can verify the split on-chain.

## 0:30–2:00 — The Clarity smart contract
The heart of the project lives in `contracts/royalty-splitter.clar`.

Core ideas:
- Collaborators are stored in a `collaborators` map keyed by principal.
- Each collaborator has a fixed `share` (their percentage of the pool) and `claimed` (how much they have already withdrawn).
- The contract tracks two global metrics: `total-shares` and `total-deposited`.

### Key functions
- `set-collaborator-share(who, share)` — registers or updates an artist's share, updating `total-shares` so percentages always add up logically.
- `deposit-liquidity(amount)` — moves `amount` STX from the caller into the contract and increases `total-deposited`. This is how we model "royalties flowing in" from marketplaces or collectors.
- `get-claimable(who)` (read-only) — computes how much a given artist can withdraw using the formula:
  
  `entitled = total-deposited * share / total-shares`
  
  Then subtracts whatever they have already claimed.
- `claim()` — lets `tx-sender` withdraw their share. It calls `get-claimable`, transfers that amount from the contract to the caller, and updates their `claimed` field.

All meaningful behavior — configuring splits, depositing liquidity, and automated payouts — is encoded on-chain in new Clarity logic, not in an off-chain script.

## 2:00–3:15 — Clarinet tests
In `tests/royalty-splitter_test.ts` we use Clarinet to prove the behavior:

1. **Share configuration and deposits**  
   The first test configures two artists at 70% / 30%, then calls `deposit-liquidity(1000)` from another account. Read-only calls to `get-claimable` show 700 and 300 microSTX respectively.

2. **Claiming and state updates**  
   The second test configures a 50 / 50 split, deposits 1000 microSTX, then has one artist call `claim()`. The test asserts:
   - The first artist successfully claims 500.
   - A second call to `get-claimable` for that artist returns 0.
   - The second artist still has 500 claimable.

These tests give us executable documentation that the royalty math is correct and that claiming cannot over-withdraw from the pool.

## 3:15–4:15 — UI & UX redesign
We built two UI versions in `/ui`.

### v1: Basic wiring (`basic.html` / `basic.js`)
The first version is extremely simple:
- One button to "connect" a wallet (stubbed).
- Inputs for deposit amount and a button to "Claim".
- All actions are alerts that describe what would happen on-chain.

This is enough to validate the flow, but it's not a great user experience.

### v2: Redesigned experience (`index.html` / `app.js`)
The redesigned UI focuses on a smooth 5-minute demo:
- A clean, responsive layout with a header, two main panels, and clear copy.
- Panel 1 lets an admin paste two artist principals, set their percentages, and deposit royalties.
- Panel 2 shows a status area, a field to preview any artist's claimable balance, and a single "Claim my royalties" button.
- All buttons are wired to lightweight handlers that describe the underlying contract calls (`set-collaborator-share`, `deposit-liquidity`, `get-claimable`, and `claim`).

The JS is intentionally framework-free so you can read it in seconds and replace the stubbed parts with real `@stacks/connect` / `openContractCall` integration.

## 4:15–5:00 — How to demo it live
A complete 5-minute walkthrough:
1. **Intro (30s)** — Explain the problem of manual royalty splits for collaborative drops.
2. **Contract (60s)** — Show `royalty-splitter.clar`, point at `set-collaborator-share`, `deposit-liquidity`, and `claim`, and highlight that all math and payouts are enforced on-chain.
3. **Tests (60s)** — Run `clarinet test` and explain how the scenarios cover share configuration, deposits, and safe claiming.
4. **UI + redesign (60–90s)** —
   - Open `ui/basic.html` to show the first, very simple version.
   - Switch to `ui/index.html` to show the polished flow that matches how curators and artists actually think.
5. **Next steps (30s)** — Mention that the only remaining work is swapping the stubbed JS calls for real Stacks RPC / wallet integration.

By the end of this short demo, you will have shown:
- New Clarity contract logic for liquidity-style royalty deposits.
- Clarinet tests that exercise that logic.
- A UI plus a UX-focused redesign that makes those functions usable by non-technical artists.
