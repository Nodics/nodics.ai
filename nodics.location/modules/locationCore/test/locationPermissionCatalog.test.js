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
const defaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const governance = require("../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");

test("Location route permissions are assignable while writes remain independent grants", (t) => {
  const previous = { CONFIG: global.CONFIG, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: (key) => defaults[key] };
  global.CLASSES = { NodicsError: class extends Error {} };
  const permissions = Object.values(routes).map((route) => route.permission);
  assert.equal(permissions.length, 4);
  assert.ok(
    permissions.every((permission) =>
      defaults.identityGovernance.permissionCatalog.includes(permission),
    ),
  );
  assert.doesNotThrow(() => governance.validatePermissions([{ permissions }]));
  for (const group of Object.values(
    defaults.identityGovernance.migration.groupTargets,
  )) {
    assert.equal(
      (group.permissions || []).some((permission) =>
        ["location.location.create", "location.location.update"].includes(
          permission,
        ),
      ),
      false,
    );
  }
  assert.throws(() =>
    governance.validatePermissions([
      { permissions: ["location.location.arbitrary"] },
    ]),
  );
});
