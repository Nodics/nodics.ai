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
const identityFixture = require("./helpers/identityCatalogueFixture");
const properties = identityFixture.properties();
const source = require("./helpers/domainAccessFixture")("publish");
const header = source.header;
const group = source.group("commercePublicationStarterUserGroup");
const governance = require("../src/service/group/defaultUserGroupGovernanceService");
const auth = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const processRoutes = require("../../../../nodics.process/modules/workflow/src/router/routers").workflow;
const hash = file => createHash("sha256").update(fs.readFileSync(path.join(__dirname, "../data", file))).digest("hex");

test("companion has only actual Process start under ordinary employee ancestry", async t => {
  const previous = { CONFIG: global.CONFIG, UTILS: global.UTILS, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: key => key === "identityGovernance" ? auth.identityGovernance : undefined };
  global.UTILS = { isObject: value => value !== null && typeof value === "object" };
  global.SERVICE = { DefaultIdentityCatalogueService: identityFixture.catalogue(undefined, identityFixture.records("Permission").map(row => row.code)) };
  assert.equal(group.code, "commercePublicationStarterUserGroup");
  assert.equal(group.active, true);
  assert.deepEqual(group.parentGroups, ["employeeUserGroup"]);
  assert.deepEqual(group.permissions, ["process.instance.start"]);
  await governance.validatePermissions([group]);
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

test("publish owns the explicit companion contribution, not Profile or an application", () => {
  const section = source.section;
  assert.equal(section.kind, "DATA_RELEASE");
  assert.equal(section.dataType, "init");
  assert.equal(section.version, "0.0.2");
  assert.equal(section.sourceRoot, "init-v001");
  assert.equal(section.destinationRole, "PLATFORM");
  assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.lifecycle, "REFERENCE");
  assert.equal(section.publicationPolicy, "NONE");
  assert.equal(section.removalPolicy, "RETAIN");
  assert.deepEqual(header.profile, { publishUserGroup: {
    options: { enabled: true, schemaName: "userGroup", operation: "ensureReferenceAll",
      dataFilePrefix: "publishUserGroupData", userGroups: ["adminGroup"] }, query: { code: "$code" },
  } });
  assert.deepEqual(Object.keys(section.files), ["init-v001/headers/identity/publishUserGroupHeader.js",
    "init-v001/records/identity/publishUserGroupData.js"]);
  for (const [file, checksum] of Object.entries(section.files)) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(source.data, file))).digest("hex"), checksum);
    for (const [name, other] of Object.entries(source.manifest.sections))
      if (name !== "accessGroups") assert.equal(Object.hasOwn(other.files || {}, file), false);
  }
  const registration = require("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService");
  const release = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const owner = { name: "publish", path: source.root };
  const item = registration.buildActivationDataPackages("publish", owner)
    .find(candidate => candidate.code === "publish:accessGroups");
  assert(item);
  assert.equal(item.required, false);
  assert.equal(item.trigger, "USER");
  assert.deepEqual(release.currentReleaseFiles(owner, source.data, "init-v001", section.files, true), section.files);
});

test("canonical publisher stays pinned and existing release receipts are not silently replayed", () => {
  const publisher = require("./helpers/domainAccessFixture")("product");
  const original = publisher.section;
  assert.equal(original.version, "0.0.2");
  assert.equal(manifest.sections.commerceSetupPublisherRole, undefined);
  assert.equal(manifest.sections.commercePublicationStarterRole, undefined);
  for (const [file, checksum] of Object.entries(original.files))
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(publisher.data, file))).digest("hex"), checksum);
  for (const [file, checksum] of Object.entries(manifest.sections["init-v001"].files)) assert.equal(hash(file), checksum);
  const release = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  assert.equal(release.isDevelopmentRelease("0.0.0"), true);
  assert.equal(release.isDevelopmentRelease("0.0.1"), false);
  assert.throws(() => release.validateUpgradePolicy({ version: "0.0.1", checksum: "new" },
    { version: "0.0.1", checksum: "installed" }), /without a version change/);
  assert.equal(properties.enterpriseManagement.registration.enabled, false);
  assert.equal(properties.enterpriseManagement.registration.inventoryQualified, false);
});
