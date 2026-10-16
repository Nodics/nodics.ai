/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/commerceRefundReviewerRole @description Verifies explicit, checksum-pinned least-privilege role installation without changing bootstrap identities or approvals. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const fixtureCatalogue = require("./helpers/identityCatalogueFixture");
const properties = fixtureCatalogue.properties();
const catalogueCodes = fixtureCatalogue.records("Permission").map(row => row.code);
global.SERVICE = { DefaultIdentityCatalogueService: fixtureCatalogue.catalogue(undefined, catalogueCodes) };
const source = require("./helpers/domainAccessFixture")("order");
const records = { commerceRefundReviewer: source.group("commerceRefundReviewerUserGroup") };
const header = source.header;
const manifest = require("../data/manifest.json");
const governance = require("../src/service/group/defaultUserGroupGovernanceService");
const auth = require("../../../../nodics.foundation/modules/nAuth/config/properties");

test("refund reviewer is an enterprise role, not an administrator nomination", async () => {
  const role = properties.enterpriseManagement.accessAssignments.roles.COMMERCE_REFUND_REVIEWER;
  assert.deepEqual(role.groupCodes, ["commerceRefundReviewerUserGroup"]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.administrationClass, undefined);
  assert.equal(role.delegable, true);
  assert.deepEqual(role.assignmentPermissions, []);
  const invitation = Object.values(require("../src/router/routers").profile.loadDefaults)
    .find(item => item.key === "/enterprises/:enterpriseCode/access-assignments" && item.method === "POST");
  assert.equal(invitation.requestBody.content["application/json"].schema.properties.roleCode.enum, undefined);
});
test("permission group contains only the seven reviewed capabilities and ordinary employee ancestry", async () => {
  const group = records.commerceRefundReviewer;
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(group.permissions, ["commerce.dispute.review", "commerce.refund.execute", "commerce.fulfillment.return", "commerce.order.read", "commerce.lifecycle.read", "commerce.fulfillment.read", "profile.scope.read"]);
  assert(group.permissions.every(code => catalogueCodes.includes(code)));
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  await governance.validatePermissions([group]);
  governance.validateGraph([group], [{ code: "userGroup", active: true }, { code: "employeeUserGroup", active: true, parentGroups: ["userGroup"] }]);
});
test("order owns the explicit insert-only reviewer contribution", async () => {
  const release = source.section;
  assert.equal(release.kind, "DATA_RELEASE");
  assert.equal(release.dataType, "init");
  assert.equal(release.sourceRoot, "init-v001");
  assert.equal(release.version, "0.0.2");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.equal(release.destinationRole, "PLATFORM");
  assert.equal(header.profile.orderUserGroup.options.operation, "ensureReferenceAll");
  assert.equal(header.profile.orderUserGroup.options.schemaName, "userGroup");
  assert.equal(Object.keys(release.files).length, 2);
  for (const [file, checksum] of Object.entries(release.files)) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(source.data, file))).digest("hex"), checksum);
    assert(!Object.hasOwn(manifest.sections["init-v001"].files, file));
  }
});
test("available role does not enable onboarding or expand any bootstrap employee", async () => {
  assert.equal(properties.enterpriseManagement.registration.enabled, false);
  assert.equal(properties.enterpriseManagement.registration.inventoryQualified, false);
  assert.equal(properties.enterpriseManagement.registration.assignmentClaimIndexQualified, false);
  const baseline = "init-v001/records/user/defaultEmployeeData.js";
  assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", baseline))).digest("hex"), manifest.sections["init-v001"].files[baseline]);
  assert.deepEqual(Object.keys(header.profile), ["orderUserGroup"]);
});

test("separate Axis reviewer adds only shell, dashboard and bootstrap visibility", async () => {
  const role = properties.enterpriseManagement.accessAssignments.roles.COMMERCE_AXIS_REFUND_REVIEWER;
  const group = source.group("commerceAxisRefundReviewerUserGroup");
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.administrationClass, undefined);
  assert.equal(role.delegable, true);
  assert.deepEqual(role.assignmentPermissions, []);
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(group.permissions, [...records.commerceRefundReviewer.permissions, "axis.view", "axis.dashboard.view", "backoffice.bootstrap.view"]);
  assert(group.permissions.every(code => catalogueCodes.includes(code)));
  assert(!group.permissions.includes("profile.enterpriseAccess.assign"));
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  await governance.validatePermissions([group]);
  governance.validateGraph([group], [{ code: "userGroup", active: true }, { code: "employeeUserGroup", active: true, parentGroups: ["userGroup"] }]);
  const invitation = Object.values(require("../src/router/routers").profile.loadDefaults)
    .find(item => item.key === "/enterprises/:enterpriseCode/access-assignments" && item.method === "POST");
  assert.equal(invitation.requestBody.content["application/json"].schema.properties.roleCode.enum, undefined);
});

test("API and Axis reviewer definitions share one owner, without duplicate Profile packs", async () => {
  const release = source.section;
  const axisHeader = source.header;
  assert.equal(release.kind, "DATA_RELEASE");
  assert.equal(release.dataType, "init");
  assert.equal(release.version, "0.0.2");
  assert.equal(release.sourceRoot, "init-v001");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.equal(release.destinationRole, "PLATFORM");
  assert.equal(axisHeader.profile.orderUserGroup.options.operation, "ensureReferenceAll");
  assert.equal(axisHeader.profile.orderUserGroup.options.schemaName, "userGroup");
  assert.equal(manifest.sections.commerceRefundReviewerRole, undefined);
  assert.equal(manifest.sections.commerceAxisRefundReviewerRole, undefined);
  assert.equal(Object.keys(release.files).length, 2);
  for (const [file, checksum] of Object.entries(release.files)) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(source.data, file))).digest("hex"), checksum);
    assert(!Object.hasOwn(manifest.sections["init-v001"].files, file));
  }
});
