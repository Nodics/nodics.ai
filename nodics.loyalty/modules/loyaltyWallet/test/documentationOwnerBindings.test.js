/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module loyaltyWallet/test/documentationOwnerBindings @description Keeps source guidance bound to effective owner transport and the selected documentation release. @owner loyaltyWallet @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
test("auction funding example uses the actual owner Checkout transport target", () => {
    const text = fs.readFileSync(path.join(root, "llm/contracts/auction-funds.md"), "utf8");
    const example = text.match(/checkoutEvidence:\s*\{\s*moduleName:\s*"([^"]+)"/);
    assert.ok(example, "The capability example must identify the Checkout owner");
    const policy = require("../config/properties").loyalty.auctions;
    assert.equal(example[1], policy.checkoutEvidence.moduleName);
});
test("technical summaries refer to their own selected source path, not a frozen predecessor", () => {
    const selected = require("../data/manifest.json").sections.documentation;
    const file = path.join(root, "data", selected.contentPath, "records/documentation/loyaltyWalletDocumentationPageMetadataData.js");
    for (const row of Object.values(require(file))) {
        assert.ok(row.sourcePath.startsWith(`data/${selected.contentPath}/`));
        assert.ok(row.technicalSummary.includes(row.sourcePath));
    }
});
test("selected Staged publication records retain predecessor authors without future approvals", () => {
    const selected = require("../data/manifest.json").sections.documentation;
    const name = "records/documentation/loyaltyWalletDocumentationPublicationStateData.js";
    const previous = new Map(Object.values(require(path.join(root, "data/docs-v001", name)))
        .map(row => [row.code, row]));
    const states = Object.values(require(path.join(root, "data", selected.contentPath, name)));
    assert.equal(states.length, previous.size);
    for (const row of states) {
        assert.equal(row.lifecycleState, "STAGED");
        assert.equal(row.stagedVersion, selected.version);
        assert.ok(typeof row.author === "string" && row.author.length > 0);
        assert.equal(row.author, previous.get(row.code)?.author);
        for (const field of ["reviewer", "approver", "publisher", "onlineVersion"])
            assert.equal(row[field], undefined, field);
        assert.deepEqual(row.auditTrail, []);
    }
});
