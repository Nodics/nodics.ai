/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaMerchantOutletAccess @description Verifies explicitly selected, outlet-bounded Profile scope adoption without rewriting installed staff. @layer test @owner circa.ewaste */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const manifest = require("../data/manifest.json");
const scopes = Object.values(require("../data/sample-v001/outlet-access/records/circaMerchantOutletScopeData"));
const stores = Object.values(require("../data/sample-v001/store/records/circaStoreData"));
const employees = Object.values(require("../data/sample-v001/operations/records/circaOperationalEmployeeData"));

test("four exact scopes reference existing issuer staff and Store owners", () => {
  assert.equal(scopes.length, 4);
  assert.equal(new Set(scopes.map(row => row.code)).size, 4);
  assert.deepEqual(scopes.map(row => row.scopeCode).sort(), ["greenperks-bistro", "greenperks-cafe", "loopcycle-accessories", "renewworks-repair"]);
  for (const scope of scopes) {
    assert.equal(scope.scopeType, "STORE");
    assert.equal(scope.principalType, "human");
    assert.equal(scope.capabilityCode, "digitalCore");
    assert.equal(scope.permissionCode, "commerce.coupon.pos.redeem");
    assert.equal(scope.effect, "ALLOW");
    assert.equal(scope.inheritanceMode, "DIRECT");
    assert.equal(scope.status, "ACTIVE");
    assert.equal(scope.tenantCode, "default");
    const employee = employees.find(row => row.loginId === scope.principalCode);
    const store = stores.find(row => row.code === scope.scopeCode);
    assert(employee, "Existing immutable login identity required");
    assert(store, "Canonical Store required");
    assert.equal(store.enterpriseCode, scope.enterpriseCode);
    assert(!Object.hasOwn(scope, "password"));
    assert(!Object.hasOwn(scope, "userGroups"));
  }
});

test("scope release is explicit native Local v001 and leaves installed operations bytes intact", () => {
  const section = manifest.sections.circaMerchantOutletAccess;
  assert.equal(section.kind, "DATA_RELEASE");
  assert.equal(section.version, "0.0.1");
  assert.equal(section.sourceRoot, "sample-v001");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.deepEqual(section.environmentScope, ["ALL"]);
  assert.equal(Object.keys(section.files).length, 2);
  for (const [file, checksum] of Object.entries({ ...section.files, ...manifest.sections.operations.files })) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum);
  }
  const header = require("../data/sample-v001/outlet-access/headers/circaOutletAccessHeader");
  assert.deepEqual(Object.keys(header.profile), ["circaMerchantOutletScopeData"]);
  assert.equal(header.profile.circaMerchantOutletScopeData.options.schemaName, "principalScopeAssignment");
});
