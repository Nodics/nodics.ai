/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module wasteImpact/test/documentationForwardRelease @description Source-only immutable release and unpublished successor regressions. @owner wasteImpact @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const contract = require("../../../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService");
const frozen = require("./fixtures/frozenDocumentationRelease.json");
const root = path.resolve(__dirname, "..");
const selected = require("../data/manifest.json").sections.documentation;
test("the consolidated documentation source retains verified selected hashes", () => {
    assert.equal(Object.keys(frozen.generatedHashes).length, 8);
    for (const [file, hash] of Object.entries(selected.generatedHashes)) {
        assert.equal(contract.sha256(fs.readFileSync(path.join(root, "data", file))), hash, file);
    }
    assert.equal(selected.contentPath, "docs-v001");
    assert.equal(selected.releaseChecksum, contract.releaseChecksum(selected.generatedHashes));
    assert.equal(fs.existsSync(path.join(root, "data/docs-v002")), false);
    assert.doesNotThrow(() => contract.validateDataRelease(root));
});
test("forward carbon handoff retains source evidence and stays unpublished", () => {
    const records = path.join(root, "data", selected.contentPath, "records/documentation");
    const components = Object.values(require(path.join(records, "wasteImpactDocumentationComponentData.js")));
    assert.ok(components.some(row => row.properties.sourceEvidence.includes("src/service/defaultWasteImpactAssessmentService.js")));
    assert.ok(components.some(row => JSON.stringify(row.properties.blocks).includes("Persisted carbon evidence handoff")));
    for (const family of ["Component", "Node", "PageMetadata", "SearchMetadata", "PublicationState", "Route"]) {
        for (const row of Object.values(require(path.join(records, `wasteImpactDocumentation${family}Data.js`)))) {
            const state = row.properties || row;
            // Routes use CMS delivery state; editorial records use lifecycle state.
            assert.equal(family === "Route" ? state.deliveryState : state.lifecycleState,
                family === "Route" ? "DRAFT" : "STAGED", `${family}:${row.code}`);
            for (const field of ["onlineVersion", "reviewer", "approver", "publisher"])
                assert.equal(Object.hasOwn(state, field), false, `${family}:${field}`);
        }
    }
});
test("selected documentation checksums and word counts derive from canonical blocks only", () => {
    const records = path.join(root, "data", selected.contentPath, "records/documentation");
    const components = Object.values(require(path.join(records, "wasteImpactDocumentationComponentData.js")));
    const metadata = Object.values(require(path.join(records, "wasteImpactDocumentationPageMetadataData.js")));
    for (const row of components) {
        const document = row.properties;
        const body = contract.documentationText(document.blocks);
        const hash = contract.sha256(body), count = contract.countWords(body);
        assert.equal(document.source.checksum, hash);
        assert.equal(document.source.wordCount, count);
        const page = metadata.find(item => item.documentId === document.code);
        assert.ok(page, document.code);
        assert.equal(page.sourceChecksum, hash);
        assert.equal(page.sourceWordCount, count);
        assert.equal(page.wordCount, count);
    }
});
