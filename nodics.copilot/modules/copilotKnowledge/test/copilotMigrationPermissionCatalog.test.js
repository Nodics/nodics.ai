/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotMigrationPermissionCatalog
 * @description Ensures migration grants are assignable through Profile without granting them to default roles or enabling mutations.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const merge = require("../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
const governance = require("../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");
const catalogue = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService");
const fixture = require("../../../../nodics.platform/modules/profile/test/helpers/identityCatalogueFixture");
const authDefaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const knowledgeDefaults = require("../config/properties");

test("owner migration permissions pass fresh Profile validation without default grants or enabling mutations", async (t) => {
  const prior = { CONFIG: global.CONFIG, CLASSES: global.CLASSES, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, prior));
  const configuration = merge.merge(authDefaults, knowledgeDefaults);
  const records = structuredClone(fixture.records("Permission"));
  global.SERVICE = {
    DefaultIdentityCatalogueService: {
      ...catalogue,
      async rows(serviceName, query) {
        assert.equal(serviceName, "DefaultPermissionService");
        assert.equal(query.active, true);
        return records.filter((row) => row.active === true && query.code.$in.includes(row.code));
      },
    },
  };
  global.CONFIG = { get: (key) => configuration[key] };
  global.CLASSES = { NodicsError: class extends Error {} };
  const permissions = ["read", "execute", "erase"].map(
    (verb) => "copilot.knowledge.migration." + verb,
  );
  for (const permission of permissions)
    assert.equal(records.find((row) => row.code === permission)?.ownerModule, "copilotKnowledge");
  await assert.doesNotReject(() => governance.validatePermissions([{ permissions }]));
  await assert.rejects(() =>
    governance.validatePermissions([
      { permissions: ["copilot.knowledge.migration.unregistered"] },
    ]),
  );
  await assert.rejects(() => governance.validatePermissions([{ permissions: ["*"] }]));
  records.find((row) => row.code === permissions[0]).active = false;
  await assert.rejects(() => governance.validatePermissions([{ permissions }]));
  for (const group of fixture.records("UserGroup"))
    assert.equal(
      (group.permissions || []).some((permission) =>
        permissions.includes(permission),
      ),
      false,
    );
  assert.equal(configuration.copilot.knowledge.legacyMigration.enabled, false);
  assert.equal(
    configuration.copilot.knowledge.legacyMigration.erasureEnabled,
    false,
  );
});
