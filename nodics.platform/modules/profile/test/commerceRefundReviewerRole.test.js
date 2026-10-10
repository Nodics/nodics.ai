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
const properties = require("../config/properties");
const records = require("../data/core-v001/records/groups/commerceRefundReviewerGroupData");
const header = require("../data/core-v001/headers/groups/commerceRefundReviewerHeader");
const manifest = require("../data/manifest.json");
const governance = require("../src/service/group/defaultUserGroupGovernanceService");
const auth = require("../../../../nodics.foundation/modules/nAuth/config/properties");

test("refund reviewer is an enterprise role, not an administrator nomination", () => {
  const role = properties.enterpriseManagement.accessAssignments.roles.COMMERCE_REFUND_REVIEWER;
  assert.deepEqual(role.groupCodes, ["commerceRefundReviewerUserGroup"]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.administrationClass, undefined);
  assert.equal(role.delegable, true);
  assert.deepEqual(role.assignmentPermissions, []);
  const invitation = Object.values(require("../src/router/routers").profile.loadDefaults)
    .find(item => item.key === "/enterprises/:enterpriseCode/access-assignments" && item.method === "POST");
  assert(invitation.requestBody.content["application/json"].schema.properties.roleCode.enum.includes("COMMERCE_REFUND_REVIEWER"));
});
test("permission group contains only the seven reviewed capabilities and ordinary employee ancestry", () => {
  const group = records.commerceRefundReviewer;
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(group.permissions, ["commerce.dispute.review", "commerce.refund.execute", "commerce.fulfillment.return", "commerce.order.read", "commerce.lifecycle.read", "commerce.fulfillment.read", "profile.scope.read"]);
  assert(group.permissions.every(code => auth.identityGovernance.permissionCatalog.includes(code)));
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  governance.validatePermissions([group]);
  governance.validateGraph([group], [{ code: "userGroup", active: true }, { code: "employeeUserGroup", active: true, parentGroups: ["userGroup"] }]);
});
test("role pack is explicit, insert-only and separate from immutable Init and documentation", () => {
  const release = manifest.sections.commerceRefundReviewerRole;
  assert.equal(release.kind, "DATA_RELEASE");
  assert.equal(release.dataType, "core");
  assert.equal(release.sourceRoot, "core-v001");
  assert.equal(release.version, "0.0.1");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.equal(release.destinationRole, "PLATFORM");
  assert.equal(header.profile.commerceRefundReviewerGroup.options.operation, "saveAll");
  assert.equal(header.profile.commerceRefundReviewerGroup.options.schemaName, "userGroup");
  assert.equal(Object.keys(release.files).length, 2);
  for (const [file, checksum] of Object.entries(release.files)) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum);
    assert(!Object.hasOwn(manifest.sections["init-v001"].files, file));
  }
});
test("available role does not enable onboarding or expand any bootstrap employee", () => {
  assert.equal(properties.enterpriseManagement.registration.enabled, false);
  assert.equal(properties.enterpriseManagement.registration.inventoryQualified, false);
  assert.equal(properties.enterpriseManagement.registration.assignmentClaimIndexQualified, false);
  const baseline = "init-v001/records/user/defaultEmployeeData.js";
  assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", baseline))).digest("hex"), manifest.sections["init-v001"].files[baseline]);
  assert.deepEqual(Object.keys(header.profile), ["commerceRefundReviewerGroup"]);
});

test("separate Axis reviewer adds only shell, dashboard and bootstrap visibility", () => {
  const role = properties.enterpriseManagement.accessAssignments.roles.COMMERCE_AXIS_REFUND_REVIEWER;
  const group = require("../data/core-v001/records/groups/commerceAxisRefundReviewerGroupData").commerceAxisRefundReviewer;
  assert.deepEqual(role.groupCodes, [group.code]);
  assert.equal(role.scopeType, "ENTERPRISE");
  assert.equal(role.administrationClass, undefined);
  assert.equal(role.delegable, true);
  assert.deepEqual(role.assignmentPermissions, []);
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(group.permissions, [...records.commerceRefundReviewer.permissions, "axis.view", "axis.dashboard.view", "backoffice.bootstrap.view"]);
  assert(group.permissions.every(code => auth.identityGovernance.permissionCatalog.includes(code)));
  assert(!group.permissions.includes("profile.enterpriseAccess.assign"));
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  governance.validatePermissions([group]);
  governance.validateGraph([group], [{ code: "userGroup", active: true }, { code: "employeeUserGroup", active: true, parentGroups: ["userGroup"] }]);
  const invitation = Object.values(require("../src/router/routers").profile.loadDefaults)
    .find(item => item.key === "/enterprises/:enterpriseCode/access-assignments" && item.method === "POST");
  assert(invitation.requestBody.content["application/json"].schema.properties.roleCode.enum.includes("COMMERCE_AXIS_REFUND_REVIEWER"));
});

test("Axis role is its own explicit insert-only v001 release, not a rewritten API or Init pack", () => {
  const release = manifest.sections.commerceAxisRefundReviewerRole;
  const axisHeader = require("../data/core-v001/headers/groups/commerceAxisRefundReviewerHeader");
  assert.equal(release.kind, "DATA_RELEASE");
  assert.equal(release.dataType, "core");
  assert.equal(release.version, "0.0.1");
  assert.equal(release.sourceRoot, "core-v001");
  assert.equal(release.selectionPolicy, "EXPLICIT");
  assert.equal(release.destinationRole, "PLATFORM");
  assert.equal(axisHeader.profile.commerceAxisRefundReviewerGroup.options.operation, "saveAll");
  assert.equal(axisHeader.profile.commerceAxisRefundReviewerGroup.options.schemaName, "userGroup");
  assert.equal(Object.keys(release.files).length, 2);
  for (const [file, checksum] of Object.entries(release.files)) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex"), checksum);
    assert(!Object.hasOwn(manifest.sections["init-v001"].files, file));
    assert(!Object.hasOwn(manifest.sections.commerceRefundReviewerRole.files, file));
  }
});
