/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaDigitalOwnershipPolicyPack @description Tests policy source and original snapshot refusal through canonical owners using isolated read ports, never installed or live evidence. @layer test @owner circa.ewaste */
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const framework = path.resolve(__dirname, "../../../../nodics.ai");
const data = path.resolve(__dirname, "../data");
const root = "sample-v001/operations/asset-policy/";
const owner = require(path.join(framework, "nodics.waste/modules/wasteCore/src/service/defaultWasteDataContributionPolicyService"));
const schema = require(path.join(framework, "nodics.waste/modules/wasteCore/src/schemas/schemas"));
const sale = require(path.join(framework, "nodics.accelerators/modules/waste/modules/eWaste/src/service/defaultEWasteDigitalSaleService"));
const proposal = require("./fixtures/circaDemoPolicyProposal.json");
const selection = require("./fixtures/circaDigitalOwnershipPolicySelections.json");
const manifest = require("../data/manifest.json");
const header = require(path.join(data, root, "headers/circaDigitalOwnershipPolicyHeader"));
const policies = Object.fromEntries(["Transfer", "Reward", "Carbon"].map(type => [type.toLowerCase(),
  require(path.join(data, root, `records/circaDigital${type}PolicyData`)).record0]));

test("separate explicit local v001 policy pack passes Waste contribution and declared schema contracts", () => {
  const section = manifest.sections.circaDigitalOwnershipPolicies;
  assert.equal(owner.validateManifestSection(section), section);
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.sourceRoot, "sample-v001");
  assert.equal(section.version, "0.0.1");
  assert.equal(section.lifecycle, "REFERENCE");
  assert.deepEqual(section.environmentScope, ["ALL"]);
  const entries = owner.validateHeader(header);
  assert.equal(entries.length, 3);
  for (const entry of entries) {
    const record = require(path.join(data, root, "records", entry.options.dataFilePrefix)).record0;
    assert.equal(owner.validateRecord(record, "PROJECT"), record);
    const fields = schema.wasteCore[entry.options.schemaName].definition;
    for (const [key, field] of Object.entries(fields)) {
      if (field.required) assert.notEqual(record[key], undefined, `${entry.options.schemaName}.${key}`);
      if (field.enum && record[key] !== undefined) assert(field.enum.includes(record[key]), key);
    }
    assert.equal(record.active, true);
    assert.equal(record.status, "ACTIVE");
    assert.equal(record.revision, 1);
    for (const key of ["sellerAuthorizations", "ownerRef", "binding", "digitalSale", "approval", "walletCode"])
      assert.equal(record[key], undefined, key);
  }
  assert.equal(Object.keys(section.files).length, 4);
  for (const [file, hash] of Object.entries(section.files))
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(data, file))).digest("hex"), hash);
  assert.equal(selection.operationalAuthority, false);
  assert.deepEqual(selection.assetCodes, proposal.assets.bindings);
  assert.equal(selection.quantityPerAsset, proposal.assets.quantityPerAsset);
  for (const [name, code] of Object.entries(selection.policyCodes)) assert.equal(policies[name].code, code);
  assert.equal(policies.transfer.metadata.digitalOwnership.refund, proposal.assets.refund);
  assert.equal(policies.transfer.metadata.digitalOwnership.reservationSeconds, proposal.assets.reservationSeconds);
  assert.equal(policies.transfer.completionCustodyStatus, undefined);
  assert.equal(policies.transfer.carbonTransferMode, "NONE");
  assert.equal(policies.transfer.requiresOwnerApproval, true);
  assert.equal(policies.carbon.settlementMode, "NONE");
  assert.deepEqual(policies.reward.metadata.digitalOwnership, { version: 1, proceeds: "CAPTURED_TOTAL",
    payee: "CURRENT_SELLER", programCode: "circa", rewardTypeCode: "points", scale: 2 });
  assert.equal(policies.reward.walletCurrencyCode, "POINTS");
  assert.equal(policies.reward.splitRules, undefined);
  assert.equal(selection.historicalSnapshots, "DO_NOT_REWRITE_OR_BACKFILL");
  assert(!JSON.stringify(manifest).includes("circaDigitalOwnershipPolicySelections"));
});

test("canonical original sale command retains approved source policies before any reservation", async () => {
  const assets = Object.values(require("../data/sample-v001/waste/records/circaWasteAssetData"));
  const buyerRef = { module: "profile", schema: "customer", code: "isolated-buyer" };
  for (const assetCode of selection.assetCodes) {
    const asset = assets.find(row => row.code === assetCode);
    assert(asset);
    const r = { tenant: proposal.tenant, enterpriseCode: proposal.marketplaceEnterprise,
      payload: { ownerId: buyerRef.code, orderCode: "isolated-order", entryCode: "isolated-entry", idempotencyKey: "isolated-sale",
        checkoutIdempotencyKey: "isolated-checkout", productCode: `CIRCA_ASSET_${assetCode}`, sku: `CIRCA_ASSET_${assetCode}_SKU`,
        storeCode: proposal.marketplaceStore, locale: "en" } };
    const command = await sale.command.call({ ...sale, buyer: async (_r, code) => code === asset.ownerRef.code ? asset.ownerRef : buyerRef },
      r, { ref: { assetCode, projectionCode: "isolated-projection", sellerRef: asset.ownerRef },
        binding: { code: "isolated-binding" }, policies: structuredClone(policies) });
    assert.deepEqual(command.sellerRef, asset.ownerRef);
    assert.deepEqual(command.policies, policies);
    assert.equal(command.policies.transfer.metadata.digitalOwnership.refund, proposal.assets.refund);
    assert.equal(command.policies.reward.metadata.digitalOwnership.proceeds, "CAPTURED_TOTAL");
    assert.equal(command.policies.carbon.settlementMode, "NONE");
  }
});
