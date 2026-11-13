/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaBoundedHumanRoles @description Verifies approved exact human roles and real additive Profile adoption without native calls. @layer test @owner circa.ewaste */
const test = require("node:test"), assert = require("node:assert/strict"), path = require("node:path");
const fs = require("node:fs"), crypto = require("node:crypto");
const { frameworkRoot, loadRuntime } = require("../../../test/helpers/configuration");
const handoff = require("./evidence/circa-bounded-human-role-source-handoff-2026-10-09.json");
const data = path.resolve(__dirname, "../data");
const credit = require(frameworkRoot + "/nodics.loyalty/modules/loyaltyWallet/data/init-v001/records/identity/loyaltyWalletSpecialAccessGroupData").record0;
const creditRows = Object.values(require("../data/sample-v001/credit-staff/records/circaLocalDemoCreditStaffData"));
const opening = require(frameworkRoot + "/nodics.commerce/modules/baseCommerce/modules/inventory/data/init-v001/records/identity/inventorySpecialAccessGroupData").record0;
const openingRows = Object.values(require("../data/sample-v001/opening-staff/records/circaLocalOpeningStaffData"));
const exception = require(frameworkRoot + "/nodics.commerce/modules/checkout/modules/order/data/init-v001/records/identity/orderSpecialAccessGroupData").record0;
const exceptionRows = Object.values(require("../data/sample-v001/refund-exception-staff/records/circaLocalUnusedRefundExceptionStaffData"));
const employees = Object.values(require("../data/sample-v001/operations/records/circaOperationalEmployeeData"));

test("Local unused-coupon review grants one permission to only the original administrator through separate sealed packs", () => {
  assert.deepEqual(exception.permissions, ["commerce.refund.exception.adjudicate"]);
  assert.deepEqual(exception.parentGroups, ["employeeUserGroup"]);
  assert.equal(exception.active, true);
  assert.deepEqual(exceptionRows, [{ code: "circa-online-administrator", loginId: "online.administrator@circa.local",
    enterpriseCode: "GREENPERKS_ONLINE", roleCodes: ["COMMERCE_REFUND_EXCEPTION_REVIEW"], groupCodes: [exception.code] }]);
  const manifest = require("../data/manifest.json");
  for (const name of ["circaLocalUnusedRefundExceptionStaffAssignment"]) {
    const section = manifest.sections[name];
    assert.equal(section.dataType, "sample"); assert.equal(section.version, "0.0.2");
    assert.equal(section.destinationRole, "PLATFORM"); assert.equal(section.selectionPolicy, "EXPLICIT");
    assert.deepEqual(section.environmentScope, ["ALL"]);
    assert.equal(Object.keys(section.files).length, 2);
    for (const [file, checksum] of Object.entries(section.files))
      assert.equal(crypto.createHash("sha256").update(fs.readFileSync(path.join(data, file))).digest("hex"), checksum);
  }
  const header = require("../data/sample-v001/refund-exception-staff/headers/circaLocalUnusedRefundExceptionStaffHeader");
  assert.equal(header.profile.circaLocalUnusedRefundExceptionStaffData.options.operation, "addReferenceGroupsAll");
  const original = employees.find(row => row.code === exceptionRows[0].code);
  assert.equal(original.loginId, exceptionRows[0].loginId);
  assert.equal(original.metadata.enterpriseCode, exceptionRows[0].enterpriseCode);
  const catalogue = Object.values(require(frameworkRoot + "/nodics.commerce/modules/checkout/modules/order/data/init-v001/records/identity/orderPermissionData"));
  for (const permission of exception.permissions) assert(catalogue.some(row => row.code === permission));
});

test("Loyalty and Import groups separately supply the four approved permissions to one original human", () => {
  assert.deepEqual(credit.permissions, ["loyalty.sampleCredit.apply"]);
  assert.deepEqual(require(frameworkRoot + "/nodics.foundation/modules/nData/nImport/import/data/init-v001/records/identity/importSpecialAccessGroupData").record0.permissions, ["import.sample.run", "import.release.view", "import.release.validate"]);
  assert.deepEqual(credit.parentGroups, ["employeeUserGroup"]);
  assert.equal(credit.active, true);
  assert.deepEqual(creditRows, [{ code: "circa-online-administrator", loginId: "online.administrator@circa.local",
    enterpriseCode: "GREENPERKS_ONLINE", roleCodes: ["LOYALTY_SAMPLE_CREDIT", "IMPORT_SAMPLE_OPERATOR"], groupCodes: [credit.code, "importSampleOperatorUserGroup"] }]);
  const source = employees.find(row => row.code === creditRows[0].code);
  assert.equal(source.loginId, creditRows[0].loginId);
  assert.equal(source.metadata.enterpriseCode, creditRows[0].enterpriseCode);
});

test("forward contribution handoff seals exact files, PLATFORM Local selection and additive-only employee dispatch", () => {
  // The retained handoff describes the old source, not current owner definitions.
  assert.equal(handoff.sectionsToAdd.circaLocalDemoCreditRole.version, "0.0.1");
  const header = require("../data/sample-v001/credit-staff/headers/circaLocalDemoCreditStaffHeader");
  assert.deepEqual(header.profile.circaLocalDemoCreditStaffData, {
    options: { enabled: true, schemaName: "employee", operation: "addReferenceGroupsAll",
      dataFilePrefix: "circaLocalDemoCreditStaffData", tenants: ["default"] },
    query: { code: "$code", loginId: "$loginId" },
  });
});

test("real nImport descriptor inspection accepts the new independent contribution sources", t => {
  const previous = global.CONFIG;
  t.after(() => { global.CONFIG = previous; });
  const runtime = loadRuntime("platformServer");
  global.CONFIG = { get: key => runtime[key] };
  const releases = require(path.join(frameworkRoot,
    "nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService"));
  for (const [code, section] of Object.entries(require("../data/manifest.json").sections).filter(([code]) => ["circaLocalDemoCreditStaffAssignment", "circaLocalOpeningStaffAssignments", "circaLocalUnusedRefundExceptionStaffAssignment"].includes(code))) {
    const release = releases.inspectManifest({ name: "circa.ewaste", index: "3100.90" }, "sample",
      path.join(data, "manifest.json"), section, code, true);
    assert.equal(release.releaseCode, "circa.ewaste:" + code);
    assert.match(release.checksum, /^[a-f0-9]{64}$/);
    assert.deepEqual(release.declaredFiles, Object.keys(section.files).sort());
  }
});

test("opening group and source instructions admit only the three original issuer administrators", () => {
  assert.deepEqual(opening.permissions, ["commerce.inventory.operate"]);
  assert.deepEqual(opening.parentGroups, ["employeeUserGroup"]);
  assert.equal(opening.active, true);
  assert.deepEqual(openingRows.map(row => [row.code, row.enterpriseCode]), [
    ["circa-retail-administrator", "GREENPERKS_RETAIL"],
    ["circa-repair-administrator", "RENEWWORKS_REPAIR_REUSE"],
    ["circa-recycling-administrator", "LOOPCYCLE_RECYCLING"],
  ]);
  for (const row of openingRows) {
    assert.deepEqual(row.roleCodes, ["COMMERCE_INVENTORY_OPENING"]);
    assert.deepEqual(row.groupCodes, [opening.code]);
    assert.deepEqual(Object.keys(row).sort(), ["code", "enterpriseCode", "groupCodes", "loginId", "roleCodes"]);
    const original = employees.find(record => record.code === row.code);
    assert.equal(row.loginId, original.loginId);
    assert.equal(row.enterpriseCode, original.metadata.enterpriseCode);
  }
  const header = require("../data/sample-v001/opening-staff/headers/circaLocalOpeningStaffHeader");
  assert.equal(header.profile.circaLocalOpeningStaffData.options.operation, "addReferenceGroupsAll");
});

for (const instruction of [...creditRows, ...openingRows, ...exceptionRows])
test(`real Profile additive adoption preserves state, CAS and no-op replay for ${instruction.code}`, async t => {
  const runtime = loadRuntime("platformServer");
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: key => runtime[key] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const groupCodes = instruction.groupCodes;
  const original = { _id: "original-employee", code: instruction.code, loginId: instruction.loginId,
    active: true, principalType: "human", password: "retained-password-reference", authVersion: 8,
    userGroups: ["employeeUserGroup", "existing-reviewed-group"], metadata: { enterpriseCode: instruction.enterpriseCode, note: "retained" },
    displayName: "Existing human", scopes: ["retained-scope"] };
  let current = structuredClone(original), writes = 0;
  const authData = { userGroups: ["original-import-owner"] };
  const ok = result => ({ code: "SUC_FIXTURE_READ", count: result.length, result });
  global.SERVICE = {
    DefaultIdentityCatalogueService: { roles: async () => Object.fromEntries([
      ...Object.values(require(frameworkRoot + "/nodics.loyalty/modules/loyaltyWallet/data/init-v001/records/identity/loyaltyWalletSpecialAccessRoleData")),
      ...Object.values(require(frameworkRoot + "/nodics.foundation/modules/nData/nImport/import/data/init-v001/records/identity/importSpecialAccessRoleData")),
      ...Object.values(require(frameworkRoot + "/nodics.commerce/modules/baseCommerce/modules/inventory/data/init-v001/records/identity/inventorySpecialAccessRoleData")),
      ...Object.values(require(frameworkRoot + "/nodics.commerce/modules/checkout/modules/order/data/init-v001/records/identity/orderSpecialAccessRoleData")),
    ].map(row => [row.code, row])) },
    DefaultUserGroupService: { get: async read => {
      assert.equal(read.authData, authData); return ok(groupCodes.map(code => ({ code, active: true })));
    } },
    DefaultEnterpriseService: { get: async read => {
      assert.equal(read.authData, authData); return ok([{ _id: "enterprise", code: instruction.enterpriseCode, active: true }]);
    } },
  };
  const real = require(path.join(frameworkRoot, "nodics.platform/modules/profile/src/service/employee/defaultEmployeeService"));
  const owner = { ...real, get: async read => {
    assert.equal(read.authData, authData); return ok([structuredClone(current)]);
  }, update: async request => {
    assert.equal(request.authData, authData);
    assert.deepEqual(request.model, { userGroups: [...original.userGroups, ...groupCodes] });
    assert.deepEqual(request.query.userGroups, original.userGroups);
    assert.equal(request.query.authVersion, 8);
    assert.equal(request.query.password, original.password);
    assert.equal(request.query["metadata.enterpriseCode"], instruction.enterpriseCode);
    current = { ...current, userGroups: request.model.userGroups, authVersion: 9 }; writes++;
    return { code: "SUC_FIXTURE_UPDATE", result: { acknowledged: true, matchedCount: 1 } };
  } };
  assert.deepEqual(await owner.addReferenceGroupsAll({ tenant: "default", authData, models: [instruction] }), { result: [{ code: instruction.code }] });
  assert.deepEqual(current, { ...original, userGroups: [...original.userGroups, ...groupCodes], authVersion: 9 });
  await owner.addReferenceGroupsAll({ tenant: "default", authData, models: [instruction] });
  assert.equal(writes, 1);
  await assert.rejects(owner.addReferenceGroupsAll({ tenant: "default", authData,
    models: [{ ...instruction, groupCodes: ["adminGroup"] }] }), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  current.metadata.enterpriseCode = "FOREIGN";
  await assert.rejects(owner.addReferenceGroupsAll({ tenant: "default", authData, models: [instruction] }), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  assert.equal(writes, 1);
});
