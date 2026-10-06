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
const authDefaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const knowledgeDefaults = require("../config/properties");

test("migration permissions survive configuration layering and Profile group validation without default grants", (t) => {
  const prior = { CONFIG: global.CONFIG, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, prior));
  const configuration = merge.merge(authDefaults, knowledgeDefaults);
  for (const permission of authDefaults.identityGovernance.permissionCatalog)
    assert.ok(
      configuration.identityGovernance.permissionCatalog.includes(permission),
    );
  global.CONFIG = { get: (key) => configuration[key] };
  global.CLASSES = { NodicsError: class extends Error {} };
  const permissions = ["read", "execute", "erase"].map(
    (verb) => "copilot.knowledge.migration." + verb,
  );
  assert.doesNotThrow(() => governance.validatePermissions([{ permissions }]));
  assert.throws(() =>
    governance.validatePermissions([
      { permissions: ["copilot.knowledge.migration.unregistered"] },
    ]),
  );
  for (const group of Object.values(
    configuration.identityGovernance.migration.groupTargets,
  ))
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
