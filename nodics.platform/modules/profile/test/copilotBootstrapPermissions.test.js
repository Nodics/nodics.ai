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

test("forward bootstrap adopts current Copilot grants only for the existing runtime administrator", () => {
  const root = path.resolve(__dirname, "../data");
  const active = manifest.sections["init-v001"];
  const groups = require(path.join(root, active.sourceRoot, "records/groups/defaultBootstrapUserGroupsData"));
  const previous = require("../data/init-v008/records/groups/defaultBootstrapUserGroupsData");
  const administrator = Object.values(groups).find((group) => group.code === "runtimeConfigAdminUserGroup");
  const added = [
    "copilot.knowledge.internal.read", "copilot.knowledge.restricted.read",
    "copilot.knowledge.source.manage", "copilot.configuration.read",
    "copilot.configuration.manage", "copilot.configuration.admin",
    "copilot.provider.check", "copilot.usage.read",
  ];
  for (const grant of added) assert(administrator.permissions.includes(grant));
  for (const [key, group] of Object.entries(groups)) {
    if (group.code !== administrator.code) assert.deepEqual(group, previous[key]);
    else assert.deepEqual(group.permissions, [...previous[key].permissions, ...added]);
  }
  assert.equal(manifest.retainedRoots["init-v008"].sections["init-v001"].version, "0.0.2");
  release.validateRetainedRoots(root, manifest);
  for (const [file, hash] of Object.entries(manifest.retainedRoots["init-v008"].sections["init-v001"].files)) {
    if (!file.endsWith("defaultBootstrapUserGroupsData.js"))
      assert.equal(active.files[file.replace("init-v008/", active.sourceRoot + "/")], hash);
  }
});
