/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/commercePublicationStarterRole @description Pins the forward companion group, actual Process route admission and unchanged installed publisher/Init bytes; no live assignment or qualification. @layer test @owner profile */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const manifest = require("../data/manifest.json");
const properties = require("../config/properties");
const header = require("../data/core-v001/headers/groups/commercePublicationStarterHeader");
const group = require("../data/core-v001/records/groups/commercePublicationStarterGroupData").commercePublicationStarter;
const governance = require("../src/service/group/defaultUserGroupGovernanceService");
const auth = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const processRoutes = require("../../../../nodics.process/modules/workflow/src/router/routers").workflow;
const hash = file => createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex");

test("companion has only actual Process start under ordinary employee ancestry", t => {
  const previous = { CONFIG: global.CONFIG, UTILS: global.UTILS };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  assert.equal(group.code, "commercePublicationStarterUserGroup");
  assert.equal(group.active, true);
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(group.permissions, ["process.instance.start"]);
  governance.validatePermissions([group]);
  governance.validateGraph([group], [{ code: "userGroup", active: true },
    { code: "employeeUserGroup", parentGroups: ["userGroup"], active: true }]);
  assert.deepEqual(properties.enterpriseManagement.accessAssignments.roles.COMMERCE_SETUP_PUBLISHER.groupCodes,
    ["commerceSetupPublisherUserGroup", group.code]);
  assert.equal(Object.hasOwn(properties.enterpriseManagement.accessAssignments.roles, "COMMERCE_PUBLICATION_STARTER"), false);
  assert.deepEqual(properties.enterpriseManagement.accessAssignments.roles.COMMERCE_COUPON_ISSUER.groupCodes,
    ["commerceCouponIssuerUserGroup"]);
});

test("real Process route policies admit original bearer starts, not definition reads, decisions or management", () => {
  const policy = { ...security, getRouteActionAuthorizationConfig: () => ({ enabled: true, strict: true }),
    getGrantedPermissions: () => group.permissions };
  const allowed = [processRoutes.processOperations.startInstance];
  assert.deepEqual(allowed.map(route => [route.method, route.key, route.permission]), [
    ["POST", "/instances", "process.instance.start"],
  ]);
  for (const router of allowed) {
    assert.deepEqual(router.authTokenTypes, ["access"]);
    assert.deepEqual(router.accessGroups, ["userGroup"]);
    assert.equal(policy.hasRoutePermission({ router, authData: {} }), true);
  }
  const all = Object.values(processRoutes).flatMap(Object.values);
  for (const router of all.filter(route => route.permission && !group.permissions.includes(route.permission)))
    assert.equal(policy.hasRoutePermission({ router, authData: {} }), false, router.permission);
  for (const permission of ["process.definition.read", "process.backoffice.view", "process.task.complete", "process.definition.publish",
    "process.instance.cancel", "publish.lifecycle.approve", "publish.lifecycle.activate", "runtime.config.update"])
    assert.equal(policy.hasRoutePermission({ router: { permission }, authData: {} }), false);
});

test("new explicit v001 release selects only the companion files, not installed source, staff or credentials", () => {
  const section = manifest.sections.commercePublicationStarterRole;
  assert.equal(section.kind, "DATA_RELEASE");
  assert.equal(section.dataType, "core");
  assert.equal(section.version, "0.0.1");
  assert.equal(section.sourceRoot, "core-v001");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.lifecycle, "REFERENCE");
  assert.equal(section.publicationPolicy, "NONE");
  assert.equal(section.removalPolicy, "RETAIN");
  assert.deepEqual(header.profile, { commercePublicationStarterGroup: {
    options: { enabled: true, schemaName: "userGroup", operation: "saveAll",
      dataFilePrefix: "commercePublicationStarterGroupData", userGroups: ["adminGroup"] }, query: { code: "$code" },
  } });
  assert.deepEqual(Object.keys(section.files), ["core-v001/headers/groups/commercePublicationStarterHeader.js",
    "core-v001/records/groups/commercePublicationStarterGroupData.js"]);
  for (const [file, checksum] of Object.entries(section.files)) {
    assert.equal(hash(file), checksum);
    for (const [name, other] of Object.entries(manifest.sections))
      if (name !== "commercePublicationStarterRole") assert.equal(Object.hasOwn(other.files || {}, file), false);
  }
  const registration = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService");
  const release = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const owner = { name: "profile", path: path.resolve(__dirname, "..") };
  const item = registration.buildActivationDataPackages("profile", owner)
    .find(candidate => candidate.code === "profile:commercePublicationStarterRole");
  assert(item);
  assert.equal(item.required, false);
  assert.equal(item.trigger, "USER");
  assert.deepEqual(release.currentReleaseFiles(owner, path.join(owner.path, "data"), "core-v001", section.files, true), section.files);
});

test("original publisher and Init bytes stay pinned and v0.0.1 cannot masquerade as mutable development drift", () => {
  const original = manifest.sections.commerceSetupPublisherRole;
  assert.equal(original.version, "0.0.1");
  assert.deepEqual(original.files, {
    "core-v001/headers/groups/commerceSetupPublisherHeader.js": "4ea4c9064daffacd5364d679c1ede994cc7e13634fc9e9f9d9defb3a35fd54e6",
    "core-v001/records/groups/commerceSetupPublisherGroupData.js": "f09ec891ac50076a0e00e59cbb1fe63d6e569074f103d4c23c34484ce376f262",
  });
  for (const [file, checksum] of Object.entries(original.files)) assert.equal(hash(file), checksum);
  for (const [file, checksum] of Object.entries(manifest.sections["init-v001"].files)) assert.equal(hash(file), checksum);
  const release = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  assert.equal(release.isDevelopmentRelease("0.0.0"), true);
  assert.equal(release.isDevelopmentRelease("0.0.1"), false);
  assert.throws(() => release.validateUpgradePolicy({ version: "0.0.1", checksum: "new" },
    { version: "0.0.1", checksum: "installed" }), /without a version change/);
  assert.equal(properties.enterpriseManagement.registration.enabled, false);
  assert.equal(properties.enterpriseManagement.registration.inventoryQualified, false);
});
