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
const governance = require("../../../../nodics.platform/modules/profile/src/service/group/defaultUserGroupGovernanceService");
const catalogue = require("../../../../nodics.platform/modules/profile/src/service/identity/defaultIdentityCatalogueService");
const fixture = require("../../../../nodics.platform/modules/profile/test/helpers/identityCatalogueFixture");

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
test("every secured Copilot route permission is recognized by Profile", async (t) => {
  const previous = { CLASSES: global.CLASSES, SERVICE: global.SERVICE };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
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
  const ownerGrants = [
    "copilot.configuration.admin",
    "copilot.budget.enterprise.manage",
    "copilot.budget.user.manage",
  ];
  const selected = [...permissions(routes), ...ownerGrants];
  assert.ok(selected.length > 20);
  assert.deepEqual(
    selected.filter(
      (grant) => !records.some((row) => row.active === true && row.code === grant),
    ),
    [],
  );
  await assert.doesNotReject(() =>
    governance.validatePermissions([{ permissions: selected }]),
  );
  await assert.rejects(() => governance.validatePermissions([{ permissions: ["copilot.unregistered"] }]));
  await assert.rejects(() => governance.validatePermissions([{ permissions: ["*"] }]));
  records.find((row) => row.code === ownerGrants[0]).active = false;
  await assert.rejects(() => governance.validatePermissions([{ permissions: ownerGrants }]));
  for (const group of fixture.records("UserGroup"))
    assert.equal(
      (group.permissions || []).some((grant) => ownerGrants.includes(grant)),
      false,
    );
});
