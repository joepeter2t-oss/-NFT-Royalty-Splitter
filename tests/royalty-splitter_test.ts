import { Clarinet, Tx, Chain, Account, types } from "./deps.ts";

Clarinet.test({
  name: "Artists can configure shares and deposit liquidity",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const artist1 = accounts.get("wallet_1")!;
    const artist2 = accounts.get("wallet_2")!;
    const collector = accounts.get("wallet_3")!;

    // configure collaborators
    let block = chain.mineBlock([
      Tx.contractCall(
        "royalty-splitter",
        "set-collaborator-share",
        [types.principal(artist1.address), types.uint(70)],
        deployer.address,
      ),
      Tx.contractCall(
        "royalty-splitter",
        "set-collaborator-share",
        [types.principal(artist2.address), types.uint(30)],
        deployer.address,
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(70);
    block.receipts[1].result.expectOk().expectUint(30);

    // deposit 1000 microSTX of royalties
    const depositAmount = 1000;

    block = chain.mineBlock([
      Tx.contractCall(
        "royalty-splitter",
        "deposit-liquidity",
        [types.uint(depositAmount)],
        collector.address,
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(depositAmount);

    // read-only: check claimable amounts
    let claimable1 = chain.callReadOnlyFn(
      "royalty-splitter",
      "get-claimable",
      [types.principal(artist1.address)],
      deployer.address,
    );
    claimable1.result.expectUint(700);

    let claimable2 = chain.callReadOnlyFn(
      "royalty-splitter",
      "get-claimable",
      [types.principal(artist2.address)],
      deployer.address,
    );
    claimable2.result.expectUint(300);
  },
});

Clarinet.test({
  name: "Artists can claim and claimable resets to zero",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const artist1 = accounts.get("wallet_1")!;
    const artist2 = accounts.get("wallet_2")!;
    const collector = accounts.get("wallet_3")!;

    // configure collaborators and deposit 1000
    let block = chain.mineBlock([
      Tx.contractCall(
        "royalty-splitter",
        "set-collaborator-share",
        [types.principal(artist1.address), types.uint(50)],
        deployer.address,
      ),
      Tx.contractCall(
        "royalty-splitter",
        "set-collaborator-share",
        [types.principal(artist2.address), types.uint(50)],
        deployer.address,
      ),
      Tx.contractCall(
        "royalty-splitter",
        "deposit-liquidity",
        [types.uint(1000)],
        collector.address,
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(50);
    block.receipts[1].result.expectOk().expectUint(50);
    block.receipts[2].result.expectOk().expectUint(1000);

    // artist1 claims
    block = chain.mineBlock([
      Tx.contractCall(
        "royalty-splitter",
        "claim",
        [],
        artist1.address,
      ),
    ]);

    block.receipts[0].result.expectOk().expectUint(500);

    // artist1 has nothing left to claim
    let claimable1 = chain.callReadOnlyFn(
      "royalty-splitter",
      "get-claimable",
      [types.principal(artist1.address)],
      deployer.address,
    );
    claimable1.result.expectUint(0);

    // artist2 can still claim 500
    let claimable2 = chain.callReadOnlyFn(
      "royalty-splitter",
      "get-claimable",
      [types.principal(artist2.address)],
      deployer.address,
    );
    claimable2.result.expectUint(500);
  },
});
