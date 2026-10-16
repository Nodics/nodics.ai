/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";

/** @module profile/test/copilotBootstrapPermissions @description Protects forward-only bootstrap Copilot administration and ordinary-user permission boundaries. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const manifest = require("../data/manifest.json");
const release = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");

test("module-owned bootstrap declares Copilot grants only for the runtime administrator without replaying historical groups", () => {
  const root = path.resolve(__dirname, "../data");
  const active = manifest.sections["init-v001"];
  const groups = require('./helpers/identityCatalogueFixture').records('UserGroup');
  const previous = require("./fixtures/compatibility/bootstrapGroupsBeforeCopilot");
  const administrator = Object.values(groups).find((group) => group.code === "runtimeConfigAdminUserGroup");
  const added = [
    "copilot.knowledge.internal.read", "copilot.knowledge.restricted.read",
    "copilot.knowledge.source.manage", "copilot.configuration.read",
    "copilot.configuration.manage", "copilot.configuration.admin",
    "copilot.provider.check", "copilot.usage.read",
  ];
  for (const grant of added) assert(administrator.permissions.includes(grant));
  const priorAdministrator = Object.values(previous).find(group => group.code === administrator.code);
  for (const grant of added) assert(!priorAdministrator.permissions.includes(grant));
  // Historical nAuth groupTargets at 16c53ef2 granted these reads to adminGroup, not configuration administration.
  const historicalAdminReads = ["copilot.knowledge.internal.read", "copilot.knowledge.restricted.read"];
  for (const group of groups.filter(group => group.code !== administrator.code))
    assert.deepEqual((group.permissions || []).filter(grant => added.includes(grant)).sort(),
      group.code === "adminGroup" ? [...historicalAdminReads].sort() : [], group.code + ' must preserve its exact historical boundary');
  assert.equal(active.version, '0.0.3');
  assert(!Object.keys(active.files).some(file => file.includes('/records/groups/')));
  assert.equal(active.sourceRoot, "init-v001");
  assert.equal(manifest.retainedRoots, undefined);
  release.validateRetainedRoots(root, manifest);
});
