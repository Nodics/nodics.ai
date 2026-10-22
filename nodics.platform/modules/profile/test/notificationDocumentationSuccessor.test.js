/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/notificationDocumentationSuccessor @description Verifies canonical notification CMS source, frozen predecessor bytes, stable identities, derived checksums and unapproved successor publication without import. @layer test @owner profile */
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const root = path.resolve(__dirname, "..");
const contract = require("../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService");
const manifest = require("../data/manifest.json").sections.documentation;
const predecessor = require("./fixtures/notificationDocumentationPredecessor.json");
const local = suffix => Object.keys(manifest.generatedHashes).filter(file => file.endsWith(suffix + "Data.js"))
  .flatMap(file => Object.values(require(path.join(root, "data", file))));
test("notification documentation has a legitimate immutable forward release and preserves every predecessor byte", () => {
  assert.equal(manifest.contentPath, "docs-v002"); assert.equal(manifest.version, "0.0.2");
  assert.equal(predecessor.contentPath, "docs-v001");
  for (const [file, hash] of Object.entries(predecessor.generatedHashes))
    assert.equal(contract.sha256(fs.readFileSync(path.join(root, "data", file))), hash, file);
  contract.validateGeneration(predecessor, manifest);
  assert.equal(manifest.sourceAuthority, "data/docs-v002/records/documentation");
  assert.equal(manifest.installationPolicy, "OPTIONAL_AXIS_INITIATED");
});
test("canonical CMS guide describes all actual wrappers and does not confuse source checks with activation", () => {
  const catalogue = contract.validateDataRelease(root, "documentation");
  const article = catalogue.documents.find(d => d.ownerRoot === root && d.id === "profile.notification-recipients");
  assert.ok(article);
  for (const phrase of ["/internal/transfers/notification-recipients", "/internal/coupons/notification-recipients",
    "/internal/auctions/notification-recipients", "/internal/bundles/gifts/notification-recipients",
    "profile-employee:", "permission", "scope", "consent", "Staged", "Common mistakes", "Verification"])
    assert.ok(article.body.includes(phrase), phrase);
  assert.equal(article.source.owner, "profile"); assert.equal(article.lifecycleState, "STAGED");
  for (const file of Object.keys(predecessor.generatedHashes).filter(file => file.endsWith("PageMetadataData.js"))) {
    const oldRows = Object.values(require(path.join(root, "data", file)));
    for (const row of oldRows) {
      const next = local("PageMetadata").find(v => v.code === row.code);
      assert.equal(next.documentId, row.documentId); assert.equal(next.targetRoute, row.targetRoute);
    }
  }
});
test("successor headers, source/search metadata and publication checksums match with no invented approvals", () => {
  const metadata = local("PageMetadata"), components = local("Component"), search = local("SearchMetadata");
  for (const page of metadata) {
    const p = components.find(c => c.code === page.articleComponent).properties;
    const body = (p.blocks[0]?.kind === "heading" && p.blocks[0].level === 1 ? "" : "# " + p.title + "\n\n") + contract.documentationText(p.blocks);
    assert.equal(page.sourceChecksum, contract.sha256(body)); assert.equal(p.source.checksum, page.sourceChecksum);
    assert.equal(page.sourceWordCount, contract.countWords(body)); assert.deepEqual(p.headings, page.headings);
    assert.deepEqual(page.visualRequirements, p.visualRequirements, page.documentId + " visual requirements must match the canonical article");
    assert.equal(search.find(s => s.targetCode === page.code).searchText, p.searchText);
    if (page.technicalSummary.includes("canonical documentation records"))
      assert.ok(page.technicalSummary.includes(page.sourcePath), page.code + " summary must identify the selected source");
  }
  const targets = new Map([...local("Node"), ...metadata, ...search].map(v => [v.code, v]));
  for (const state of local("PublicationState")) {
    assert.equal(state.lifecycleState, "STAGED"); assert.equal(state.stagedVersion, "0.0.2");
    assert.equal(state.checksum, contract.sha256(JSON.stringify(targets.get(state.targetCode))));
    assert.deepEqual(state.auditTrail, []);
    for (const field of ["onlineVersion", "actor", "reviewer", "approver", "publisher"]) assert.equal(state[field], undefined);
  }
  for (const route of local("Route")) assert.equal(route.deliveryState, "STAGED");
  const headers = Object.keys(manifest.generatedHashes).filter(file => file.includes("/headers/"))
    .flatMap(file => Object.values(require(path.join(root, "data", file))).flatMap(Object.values));
  for (const file of Object.keys(manifest.generatedHashes).filter(file => file.includes("/records/") && file.endsWith("Data.js")))
    assert.ok(headers.some(h => h.options?.dataFilePrefix === path.basename(file, ".js")), file);
});
