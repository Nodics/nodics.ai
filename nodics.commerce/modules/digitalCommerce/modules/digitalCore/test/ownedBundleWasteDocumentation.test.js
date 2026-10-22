/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/ownedBundleWasteDocumentation @description Validates direct owner CMS records and independent inert documentation releases without imports or installed readiness claims. @owner digitalCore @layer test */
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const contract = require(path.join(root, "nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService"));
const owners = [
  ["digitalCore", "nodics.commerce/modules/digitalCommerce/modules/digitalCore", "digital.bundle-holdings-gifts"],
  ["wasteCarbon", "nodics.waste/modules/wasteCarbon", "waste.carbon-holdings"],
  ["wasteReward", "nodics.waste/modules/wasteReward", "waste.material-value"],
  ["wasteImpact", "nodics.waste/modules/wasteImpact", "waste.impact-providers"],
];
for (const [owner, directory, id] of owners) test(owner + " direct CMS content, projections and release hashes agree without business activation", () => {
  const base = path.join(root, directory), section = require(path.join(base, "data/manifest.json")).sections.documentation;
  contract.validateReleaseSection(section);
  assert.equal(section.sourceMode, "cms-records");
  const records = path.posix.join("data", section.contentPath, "records/documentation");
  assert.equal(section.sourceAuthority, records);
  assert.equal(section.initialPublicationPolicy, "ADMIN_INITIATED"); assert.equal(section.installationPolicy, "OPTIONAL_AXIS_INITIATED");
  for (const [file, hash] of Object.entries(section.generatedHashes)) assert.equal(contract.sha256(fs.readFileSync(path.join(base, "data", file))), hash, file);
  const read = family => Object.values(require(path.join(base, records, owner + "Documentation" + family + "Data.js")));
  const component = read("Component").find(c => c.properties.code === id), p = component.properties;
  const meta = read("PageMetadata").find(m => m.documentId === id), body = contract.documentationText(p.blocks);
  const headings = p.blocks.filter(b => b.kind === "heading").map(({ kind, ...value }) => value);
  assert.deepEqual(meta.headings, headings); assert.deepEqual(p.headings, headings);
  assert.equal(p.source.owner, owner); assert.equal(p.source.path, records + "/" + owner + "DocumentationComponentData.js");
  assert.equal(meta.sourceChecksum, contract.sha256(body)); assert.equal(p.source.checksum, meta.sourceChecksum);
  assert.equal(meta.sourceWordCount, contract.countWords(body));
  assert.equal(read("SearchMetadata").find(s => s.targetCode === meta.code).searchText, p.searchText);
  for (const file of p.sourceEvidence) assert.ok(fs.existsSync(path.resolve(base, file)), file);
  contract.validateContentQuality({ ...p, id }, "# " + p.title + "\n\n" + body, {});
  if (owner !== "wasteImpact") {
    assert.equal(meta.lifecycleState, "DRAFT"); assert.equal(p.maturityState, "partial");
    assert.equal(read("Route").find(r => r.code === meta.targetRoute).deliveryState, "DRAFT");
    const publication = read("PublicationState").find(s => s.targetCode === meta.code);
    assert.equal(publication.lifecycleState, "DRAFT");
    for (const field of ["reviewer", "approver", "publisher", "onlineVersion"]) assert.equal(publication[field], undefined);
  }
});
