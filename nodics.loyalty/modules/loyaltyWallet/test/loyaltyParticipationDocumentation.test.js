/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/test/loyaltyParticipationDocumentation @description Validates the canonical Staged successor article and participant conversion evidence without importing a documentation or business release. @layer test @owner loyaltyWallet */
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const contract = require("../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService");
test("Wallet successor documentation retains its identity and distinguishes source validation from partner qualification", () => {
  const root = path.resolve(__dirname, ".."), catalogue = contract.validateDataRelease(root);
  const article = catalogue.documents.find(row => row.id === "loyalty.wallets-rewards-ledger");
  assert.equal(article.lifecycleState, "STAGED");
  for (const phrase of ["Participant transfers", "partner-conversions/options", "maximumAccounts", "terminal no-credit fence", "end-to-end acceptance"])
    assert.ok(article.body.includes(phrase), phrase);
  assert.equal(article.source.checksum, contract.sha256(article.body));
});
