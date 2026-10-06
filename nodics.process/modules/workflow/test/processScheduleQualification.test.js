/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module workflow/test/processScheduleQualification @description Published trigger qualification without execution. @layer test @owner workflow */
"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/operation/defaultProcessRuntimeLifecycleService");
test("qualifies only exact published original trigger/version and rejects contradictory evidence", async () => {
  global.CLASSES = { NodicsError: class extends Error {} };
  const trigger = {
    code: "refreshDocs",
    definitionCode: "refresh",
    active: true,
    status: "ACTIVE",
    version: 1,
  };
  const definition = { code: "refresh", active: true, status: "PUBLISHED" };
  const version = {
    definitionCode: "refresh",
    version: 1,
    status: "PUBLISHED",
    graph: { nodes: [{ code: "start", type: "START" }], transitions: [] },
  };
  let change = {},
    selected = "trigger";
  const reads = [];
  const service = (kind, row) => ({
    get: async (request) => {
      reads.push(request);
      return {
        code: "SUC_PROCESS_00000",
        result: [{ ...row, ...(selected === kind ? change : {}) }],
      };
    },
  });
  const scoped = {
    ...owner,
    triggerService: () => service("trigger", trigger),
    definitionService: () => service("definition", definition),
    versionService: () => service("version", version),
  };
  const request = { tenant: "tenant", authData: { loginId: "operator" } };
  assert.equal(
    (await scoped.inspectScheduleTrigger(request, trigger.code)).version,
    1,
  );
  assert.ok(
    reads.every(
      (r) =>
        r.tenant === "tenant" &&
        r.options.skipItemCache === true &&
        r.searchOptions.pageSize === 2,
    ),
  );
  for (const [kind, patch] of [
    ["trigger", { active: false }],
    ["trigger", { version: "1" }],
    ["trigger", { errors: ["failed"] }],
    ["trigger", { code: "foreign" }],
    ["definition", { active: false }],
    ["definition", { status: "DRAFT" }],
    ["version", { version: 2 }],
    ["version", { graph: {} }],
    ["version", { status: "DRAFT" }],
  ]) {
    selected = kind;
    change = patch;
    await assert.rejects(scoped.inspectScheduleTrigger(request, trigger.code));
  }
});
