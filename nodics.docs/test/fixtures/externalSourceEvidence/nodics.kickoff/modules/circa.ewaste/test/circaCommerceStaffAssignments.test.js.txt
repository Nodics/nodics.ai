/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaCommerceStaffAssignments @description Pins predefined additive demo responsibilities, owner import operation and immutable release bytes without assigning live staff. @layer test @owner circa.ewaste */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { frameworkRoot, loadRuntime } = require("../../../test/helpers/configuration");
const manifest = require("../data/manifest.json");
const section = manifest.sections.circaCommerceStaffAssignments;
const header = require("../data/sample-v001/staff-access/headers/circaCommerceStaffAssignmentHeader");
const instructions = Object.values(require("../data/sample-v001/staff-access/records/circaCommerceStaffAssignmentData"));
const employees = Object.values(require("../data/sample-v001/operations/records/circaOperationalEmployeeData"));
const scopes = Object.values(require("../data/sample-v001/outlet-access/records/circaMerchantOutletScopeData"));
const profileRoot = path.join(frameworkRoot, "nodics.platform/modules/profile");
const identityFixture = require(path.join(profileRoot, "test/helpers/identityCatalogueFixture"));
const baseline = require("./enterpriseRoleBaselineFixture");
const roles = baseline.roles;
const hash = value => crypto.createHash("sha256").update(value).digest("hex");

test("explicit v001 assignment owns only additive instructions beside baseline identities and outlets", () => {
  assert.equal(section.kind, "DATA_RELEASE");
  assert.equal(section.dataType, "sample");
  assert.equal(section.version, "0.0.1", "unreleased consolidation must not create a live-adoption successor");
  assert.equal(section.sourceRoot, "sample-v001");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.lifecycle, "REFERENCE");
  assert.deepEqual(section.environmentScope, ["ALL"]);
  assert.equal(section.removalPolicy, "RETAIN");
  assert.equal(section.publicationPolicy, "NONE");
  assert.equal(Object.keys(section.files).length, 2);
  for (const [file, checksum] of Object.entries(section.files)) {
    assert.equal(hash(fs.readFileSync(path.join(__dirname, "../data", file))), checksum);
    assert(file.startsWith("sample-v001/staff-access/"));
    assert(!Object.entries(manifest.sections).some(([code, release]) => code !== "circaCommerceStaffAssignments" && Object.hasOwn(release.files || {}, file)));
  }
  assert.equal(section.prerequisites, undefined); // Init definitions are ordered setup steps, not Sample edges.
  assert.equal(manifest.retainedRoots, undefined);
  assert.equal(manifest.sections.operations.files["sample-v001/operations/records/circaOperationalEmployeeData.js"],
    hash(fs.readFileSync(path.join(__dirname, "../data/sample-v001/operations/records/circaOperationalEmployeeData.js"))));
  assert.equal(manifest.sections.circaMerchantOutletAccess.files["sample-v001/outlet-access/records/circaMerchantOutletScopeData.js"],
    "e996668088ae93b28ff553eaaaadfd3e2f9e1d2ada5db39548a7c6b53f7b5c80");
  for (const owner of ["nodics.commerce/modules/baseCommerce/modules/product", "nodics.foundation/modules/nPublish", "nodics.commerce/modules/baseCommerce/modules/promotion", "nodics.commerce/modules/checkout/modules/order"]) {
    const root = path.join(frameworkRoot, owner, "data");
    for (const [file, checksum] of Object.entries(require(path.join(root, "manifest.json")).sections.accessGroups.files))
      assert.equal(hash(fs.readFileSync(path.join(root, file))), checksum);
  }
  for (const code of ["operations", "circaMerchantOutletAccess"])
    for (const [file, checksum] of Object.entries(manifest.sections[code].files))
      assert.equal(hash(fs.readFileSync(path.join(__dirname, "../data", file))), checksum);
});

test("instructions cannot use generic employee replacement, saveAll, credentials, runtime grants or arbitrary models", () => {
  assert.deepEqual(Object.keys(header), ["profile"]);
  assert.deepEqual(Object.keys(header.profile), ["circaCommerceStaffAssignmentData"]);
  assert.deepEqual(header.profile.circaCommerceStaffAssignmentData, {
    options: { enabled: true, schemaName: "employee", operation: "addReferenceGroupsAll",
      dataFilePrefix: "circaCommerceStaffAssignmentData", tenants: ["default"] },
    query: { code: "$code", loginId: "$loginId" },
  });
  for (const instruction of instructions) {
    assert.deepEqual(Object.keys(instruction).sort(), ["code", "enterpriseCode", "groupCodes", "loginId", "roleCodes"]);
    assert.equal(new Set(instruction.groupCodes).size, instruction.groupCodes.length);
    assert(!instruction.groupCodes.some(code => /admin|runtime|approve/i.test(code)));
    assert(!instruction.roleCodes.some(code => /ADMIN|APPROV/.test(code)));
    const original = employees.filter(row => row.code === instruction.code || row.loginId === instruction.loginId);
    assert.equal(original.length, 1);
    assert.equal(original[0].code, instruction.code);
    assert.equal(original[0].loginId, instruction.loginId);
    assert.equal(original[0].metadata.enterpriseCode, instruction.enterpriseCode);
    assert.deepEqual(instruction.groupCodes, instruction.roleCodes.flatMap(code => roles[code].groupCodes));
  }
  assert.equal(new Set(instructions.map(row => row.code)).size, 10);
  assert.equal(new Set(instructions.map(row => row.loginId)).size, 10);
});

test("actual nImport service resolution refuses an unavailable additive owner operation without falling back to saveAll", async t => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const originalUppercase = Object.getOwnPropertyDescriptor(String.prototype, "toUpperCaseFirstChar");
  if (!originalUppercase) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
    configurable: true, value: function () { return this.charAt(0).toUpperCase() + this.slice(1); },
  });
  t.after(() => {
    if (originalUppercase) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", originalUppercase);
    else delete String.prototype.toUpperCaseFirstChar;
  });
  global.CLASSES = { DataImportError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  global.SERVICE = { DefaultEmployeeService: { saveAll: () => assert.fail("No generic employee replacement fallback") } };
  const importer = require(path.join(frameworkRoot,
    "nodics.foundation/modules/nData/nImport/import/src/service/process/model/defaultModelImportProcessService"));
  const options = header.profile.circaCommerceStaffAssignmentData.options;
  await assert.rejects(importer.ensureLocalSchemaService({ header: { options } }), { code: "ERR_IMP_00003" });
});

test("all exact publisher/issuer/merchant assignments are predefined without granting issuer authority to marketplace or merchants", () => {
  const specialized = new Set(["COMMERCE_SETUP_PUBLISHER", "COMMERCE_AXIS_REFUND_REVIEWER", "COMMERCE_COUPON_ISSUER", "MERCHANT_OPERATOR"]);
  assert.deepEqual(instructions.slice(0, 7).map(row => [row.code, row.enterpriseCode, row.roleCodes.filter(code => specialized.has(code))]), [
    ["circa-online-administrator", "GREENPERKS_ONLINE", ["COMMERCE_SETUP_PUBLISHER", "COMMERCE_AXIS_REFUND_REVIEWER"]],
    ["circa-retail-administrator", "GREENPERKS_RETAIL", ["COMMERCE_SETUP_PUBLISHER", "COMMERCE_COUPON_ISSUER"]],
    ["circa-repair-administrator", "RENEWWORKS_REPAIR_REUSE", ["COMMERCE_SETUP_PUBLISHER", "COMMERCE_COUPON_ISSUER"]],
    ["circa-recycling-administrator", "LOOPCYCLE_RECYCLING", ["COMMERCE_SETUP_PUBLISHER", "COMMERCE_COUPON_ISSUER"]],
    ["circa-retail-operator", "GREENPERKS_RETAIL", ["MERCHANT_OPERATOR"]],
    ["circa-repair-operator", "RENEWWORKS_REPAIR_REUSE", ["MERCHANT_OPERATOR"]],
    ["circa-recycling-operator", "LOOPCYCLE_RECYCLING", ["MERCHANT_OPERATOR"]],
  ]);
  assert.equal(instructions.filter(row => row.groupCodes.includes("commercePublicationStarterUserGroup")).length, 4);
  assert.equal(instructions.filter(row => row.groupCodes.includes("commerceCouponIssuerUserGroup")).length, 3);
  assert.equal(instructions.filter(row => row.groupCodes.includes("commerceMerchantUserGroup")).length, 3);
  assert(!instructions[0].groupCodes.includes("commerceCouponIssuerUserGroup"));
  assert.deepEqual(instructions.filter(row => row.groupCodes.includes("commerceAxisRefundReviewerUserGroup")).map(row => row.code),
    ["circa-online-administrator"]);
});

test("persisted owner role definitions admit every predefined instruction through the real Profile operation", async t => {
  const runtime = loadRuntime("platformServer");
  const previous = Object.fromEntries(["CONFIG", "SERVICE", "CLASSES"].map(key => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: name => runtime[name] };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
  const realOwner = require(path.join(profileRoot, "src/service/employee/defaultEmployeeService"));
  const adopted = instructions.map(row => ({ _id: row.code, code: row.code, loginId: row.loginId,
    active: true, principalType: "human", password: "unchanged-native-password-reference", authVersion: 8,
    metadata: { enterpriseCode: row.enterpriseCode }, userGroups: ["employeeUserGroup", ...row.groupCodes] }));
  const ok = result => ({ code: "SUC_FIXTURE_READ", count: result.length, result });
  const authData = { userGroups: ["original-import-owner"] };
  global.SERVICE = {
    DefaultIdentityCatalogueService: identityFixture.catalogue(roles),
    DefaultUserGroupService: { get: async read => {
      assert.equal(read.authData, authData);
      return ok(read.query.code.$in.map(code => ({ code, active: true })));
    } },
    DefaultEnterpriseService: { get: async read => {
      assert.equal(read.authData, authData);
      return ok([{ _id: read.query.code, code: read.query.code, active: true }]);
    } },
  };
  const owner = { ...realOwner, get: async read => {
    assert.equal(read.authData, authData);
    return ok(adopted.filter(row => read.query.$or.some(part =>
      Object.entries(part).every(([field, value]) => row[field] === value))));
  }, update: () => assert.fail("Already adopted roles must be a no-op") };
  assert.equal(runtime.enterpriseManagement.accessAssignments.roles, undefined);
  assert.deepEqual(roles.COMMERCE_SETUP_PUBLISHER.groupCodes,
    ["commerceSetupPublisherUserGroup", "commercePublicationStarterUserGroup"]);
  assert.deepEqual(await owner.addReferenceGroupsAll({ tenant: "default", authData, models: instructions }),
    { result: instructions.map(row => ({ code: row.code })) });
});

test("predefined merchant roles join the four exact existing direct Store ALLOW assignments only", () => {
  assert.equal(scopes.length, 4);
  assert.deepEqual(scopes.map(row => row.scopeCode), ["greenperks-cafe", "greenperks-bistro", "renewworks-repair", "loopcycle-accessories"]);
  for (const scope of scopes) {
    const merchant = instructions.find(row => row.loginId === scope.principalCode);
    assert(merchant);
    assert.deepEqual(merchant.roleCodes, ["MERCHANT_OPERATOR"]);
    assert.equal(scope.enterpriseCode, merchant.enterpriseCode);
    assert.equal(scope.principalType, "human");
    assert.equal(scope.tenantCode, "default");
    assert.equal(scope.scopeType, "STORE");
    assert.equal(scope.effect, "ALLOW");
    assert.equal(scope.inheritanceMode, "DIRECT");
    assert.equal(scope.capabilityCode, "digitalCore");
    assert.equal(scope.permissionCode, "commerce.coupon.pos.redeem");
  }
});
