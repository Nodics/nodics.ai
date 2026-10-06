/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotApi/test/copilotPermissionCatalog
 * @description Requires every declared Copilot route grant to be assignable through Profile's canonical permission catalogue.
 * @layer test @owner copilotApi
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const routes = require("../src/router/routers");
const defaults = require("../../../../nodics.foundation/modules/nAuth/config/properties");
const governance = require("../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");

/** Collects only route permission declarations, not operation names or arbitrary configuration strings. */
function permissions(value, selected = new Set()) {
  if (!value || typeof value !== "object") return selected;
  for (const [key, item] of Object.entries(value)) {
    if (key === "permission" && typeof item === "string") selected.add(item);
    else if (key === "permissions" && Array.isArray(item))
      item.forEach((grant) => selected.add(grant));
    else permissions(item, selected);
  }
  return selected;
}
test("every secured Copilot route permission is recognized by Profile", (t) => {
  const previous = { CONFIG: global.CONFIG, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = { get: (key) => defaults[key] };
  global.CLASSES = { NodicsError: class extends Error {} };
  const ownerGrants = [
    "copilot.configuration.admin",
    "copilot.budget.enterprise.manage",
    "copilot.budget.user.manage",
  ];
  const selected = [...permissions(routes), ...ownerGrants];
  assert.ok(selected.length > 20);
  assert.deepEqual(
    selected.filter(
      (grant) => !defaults.identityGovernance.permissionCatalog.includes(grant),
    ),
    [],
  );
  assert.doesNotThrow(() =>
    governance.validatePermissions([{ permissions: selected }]),
  );
  for (const group of Object.values(
    defaults.identityGovernance.migration.groupTargets,
  ))
    assert.equal(
      (group.permissions || []).some((grant) => ownerGrants.includes(grant)),
      false,
    );
});
