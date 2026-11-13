/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaCommerceForwardRelease @description Verifies the unified v001 Commerce selector and canonical owner refusal of legacy operational snapshots before dispatch. @layer test @owner circa.ewaste */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const dataRoot = path.resolve(__dirname, "../data");
const framework = path.resolve(__dirname, "../../../../nodics.ai");
const manifest = require("../data/manifest.json");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const header = require("../data/sample-v001/commerce/headers/circaCommerceCatalogHeader");
const targets = (value) =>
  Object.values(value)
    .flatMap(Object.values)
    .map((entry) => entry.options.schemaName);

test("commerce catalogue is selected as unified v001 first-start data", () => {
  const current = manifest.sections.commerce;
  const productConfig = require("./helpers/deploymentPolicy").runtime("commerceStagedServer").product;
  assert.equal(current.version, "0.0.2");
  assert.equal(current.sourceRoot, "sample-v001");
  assert.equal(current.selectionPolicy, "EXPLICIT");
  assert.equal(current.destinationRole, "COMMERCE_STAGED");
  assert.equal(current.versioningPolicy, "IMMUTABLE");
  for (const [file, checksum] of Object.entries(current.files))
    assert.equal(
      hash(fs.readFileSync(path.join(dataRoot, file))),
      checksum,
      file,
    );
  const schemas = targets(header);
  for (const schema of ["coupon", "couponBatch", "inventoryBalance", "store"])
    assert(!schemas.includes(schema));
  assert(schemas.includes("promotion"));
  assert(schemas.includes("warehouse"));
  assert.equal(manifest.sections["commerce-operational"], undefined);
  assert(Object.values(manifest.sections).some(section => section.installer === "PROMOTION_CAMPAIGN_ISSUANCE"));
  assert.deepEqual(productConfig.localization.requiredLocales, ["en", "ar"]);
  assert(productConfig.localization.supportedLocales.includes("ar"));
});

test("retired snapshot targets remain refused by canonical owners regardless of demo flags", async (t) => {
  const prior = { SERVICE: global.SERVICE, CONFIG: global.CONFIG };
  t.after(() => Object.assign(global, prior));
  const runtime = {
    runtimeRole: { publication: "OPERATIONAL" },
    inventory: { publication: { runtimeRole: "ONLINE" } },
    promotion: {
      publication: { runtimeRole: "ONLINE", delivery: { enabled: true } },
      sellerAuthorization: { enabled: true, qualified: true },
    },
  };
  global.CONFIG = { get: key => runtime[key] };
  global.SERVICE = {
    DefaultModuleService: { isLocalModuleActive: moduleName => moduleName === "inventory" },
    DefaultInventoryOperationService: require(path.join(framework, "nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultInventoryOperationService")),
    DefaultPromotionOperationService: require(path.join(framework, "nodics.commerce/modules/baseCommerce/modules/promotion/src/service/defaultPromotionOperationService")),
  };

  for (const [moduleName, schemaName, refusal] of [
    ["inventory", "inventoryBalance", /stock snapshots require governed Inventory operations/],
    ["promotion", "couponBatch", /coupon snapshots require governed issuance/],
    ["promotion", "coupon", /coupon snapshots require governed issuance/],
  ]) assert.throws(() => SERVICE[moduleName === "inventory" ? "DefaultInventoryOperationService" : "DefaultPromotionOperationService"].validateImportTarget({
    releaseCode: "circa.ewaste:commerce-operational", moduleName, schemaName, operation: "saveAll",
    destinationRole: "COMMERCE", lifecycle: "OPERATIONAL_VERSIONED",
    enabled: true, qualified: true,
  }), refusal);
});
