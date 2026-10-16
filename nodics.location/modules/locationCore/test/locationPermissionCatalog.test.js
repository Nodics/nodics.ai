/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module locationCore/test/locationPermissionCatalog
 * @description Ensures secured Location actions can be assigned through Profile without broadening default roles.
 * @layer test @owner locationCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers").locationCore.internal;
const permissionRecords = Object.values(require("../data/init-v001/records/identity/locationCorePermissionData"));
const permissionHeader = require("../data/init-v001/headers/identity/locationCorePermissionHeader");
const permissionPack = require("../data/manifest.json").sections.permissionCatalogue;
const profileInit = require("../../../../nodics.platform/modules/profile/data/manifest.json").sections["init-v001"];
const catalogue = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService");
const path = require("node:path");
const metadata = require("../../../../nodics.foundation/modules/nTooling/src/service/context/defaultModuleLlmContextUtilsService");
const governance = require("../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");

test("Location route permissions are assignable while writes remain independent grants", async (t) => {
  const previous = { CONFIG: global.CONFIG, CLASSES: global.CLASSES, SERVICE: global.SERVICE };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  });
  global.CONFIG = { get: key => key === "defaultTenant" ? "authority-fixture" : undefined };
  global.CLASSES = { NodicsError: class extends Error {} };
  let persisted = structuredClone(permissionRecords);
  // Isolated persisted rows; exercise the real async catalogue validator, never a properties fallback.
  global.SERVICE = { DefaultIdentityCatalogueService: {
    ...catalogue,
    async rows(serviceName, query) {
      assert.equal(serviceName, "DefaultPermissionService");
      assert.equal(this.tenant(), "authority-fixture");
      assert.equal(query.active, true);
      return structuredClone(persisted.filter(row => row.active === true && query.code.$in.includes(row.code)));
    },
  } };
  const permissions = Object.values(routes).map((route) => route.permission);
  const expected = ["location.location.read", "location.location.search", "location.location.create", "location.location.update"].sort();
  assert.deepEqual([...permissions].sort(), expected);
  assert.deepEqual(permissionRecords.map(row => row.code).sort(), expected);
  for (const row of permissionRecords) {
    assert.equal(row.ownerModule, "locationCore");
    assert.equal(row.active, true);
    assert.deepEqual(Object.keys(row).sort(), ["active", "code", "name", "ownerModule"]);
  }
  assert.equal(permissionPack.owningDomain, "locationCore");
  assert.equal(permissionPack.selectionPolicy, "EXPLICIT");
  assert.equal(permissionPack.destinationRole, "PLATFORM");
  assert(Object.hasOwn(permissionPack.files, "init-v001/records/identity/locationCorePermissionData.js"));
  assert(Object.hasOwn(permissionPack.files, "init-v001/headers/identity/locationCorePermissionHeader.js"));
  assert.deepEqual(Object.keys(permissionHeader), ["profile"]);
  assert.equal(permissionHeader.profile.locationCorePermission.options.schemaName, "permission");
  assert.equal(permissionHeader.profile.locationCorePermission.options.operation, "ensureReferenceAll");
  assert(profileInit.prerequisites.some(ref => ref.moduleName === "locationCore" &&
    ref.sectionCode === "permissionCatalogue" && ref.partition === "DEFAULT"));
  const models = [{ permissions }], before = structuredClone(models);
  await assert.doesNotReject(() => governance.validatePermissions(models));
  assert.deepEqual(models, before, "Vocabulary validation must not rewrite a group's grants");
  const modules = new Map(metadata.scanModules(path.resolve(__dirname, "../../../..")).map(owner => [owner.name, owner]));
  const groups = profileInit.prerequisites.filter(ref => ref.sectionCode === "accessGroups").flatMap(ref => {
    const owner = modules.get(ref.moduleName);
    assert(owner, "Canonical group owner must be discoverable: " + ref.moduleName);
    const dataRoot = path.join(owner.path, "data");
    const section = require(path.join(dataRoot, "manifest.json")).sections[ref.sectionCode];
    assert.equal(section.owningDomain, ref.moduleName);
    return Object.keys(section.files).filter(file => file.includes("/records/")).flatMap(file =>
      Object.values(require(path.join(dataRoot, file))));
  });
  assert(groups.some(group => group.code === "employeeUserGroup"));
  for (const group of groups) {
    assert.equal(
      (group.permissions || []).some((permission) =>
        ["location.location.create", "location.location.update"].includes(
          permission,
        ),
      ),
      false,
    );
  }
  await assert.rejects(() =>
    governance.validatePermissions([
      { permissions: ["location.location.arbitrary"] },
    ]),
  );
  persisted = persisted.filter(row => row.code !== "location.location.create");
  await assert.rejects(() => governance.validatePermissions(models), "Missing persisted vocabulary has no configuration fallback");
  persisted = structuredClone(permissionRecords);
  persisted.find(row => row.code === "location.location.update").active = false;
  await assert.rejects(() => governance.validatePermissions(models), "Inactive vocabulary cannot authorize a new group definition");
});
