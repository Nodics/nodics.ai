/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module workflow/test/processInspectionPagination
 * @description Protects generated-owner pagination, native query binding and retained human context for Process inspection.
 * @layer test @owner workflow
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const inspection = require("../src/service/operation/defaultProcessOperationsInspectionService");
const definitions = require("../src/service/definition/defaultProcessDefinitionLifecycleService");

test("all Process inspection lists and point reads use generated-service page bounds", async (t) => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: Error };
  const calls = [];
  const owner = {
    get: async (request) => {
      calls.push(request);
      return { result: [{ code: "one" }] };
    },
  };
  global.SERVICE = {
    DefaultProcessInstanceService: owner,
    DefaultProcessTaskService: owner,
    DefaultProcessAuditEventService: owner,
    DefaultProcessIncidentService: owner,
    DefaultProcessRuntimeLifecycleService: {
      projectTaskDecisions: async (_request, rows) => rows,
    },
  };
  const authData = { loginId: "employee" };
  for (const method of [
    "listInstances",
    "listTasks",
    "listIncidents",
    "listAuditEvents",
  ]) {
    for (const [limit, expected] of [
      ["7", 7],
      ["9999", 100],
      ["-1", 50],
      ["no", 50],
    ]) {
      await inspection[method]({
        tenant: "local",
        authData,
        query: {
          limit,
          instanceCode: "instance-one",
          definitionCode: "definition-one",
        },
      });
      const call = calls.at(-1);
      assert.equal(call.searchOptions.pageSize, expected);
      assert.equal(call.searchOptions.pageNumber, 1);
      assert.equal(call.searchOptions.limit, undefined);
      assert.equal(call.tenant, "local");
      assert.equal(call.authData, authData);
      assert.equal(call.query.limit, undefined);
      if (method !== "listInstances")
        assert.equal(call.query.instanceCode, "instance-one");
    }
  }
  for (const [method, key] of [
    ["getInstance", "instanceCode"],
    ["getTask", "taskCode"],
    ["getIncident", "incidentCode"],
  ]) {
    await inspection[method]({ tenant: "local", authData, [key]: "one" });
    assert.deepEqual(calls.at(-1).searchOptions, {
      pageSize: 2,
      pageNumber: 1,
    });
    assert.deepEqual(calls.at(-1).query, { code: "one" });
  }
  const implementation = { ...definitions, versionService: () => owner };
  await implementation.listVersions({
    tenant: "local",
    authData,
    definitionCode: "definition-one",
  });
  assert.deepEqual(calls.at(-1).searchOptions, {
    pageSize: 100,
    pageNumber: 1,
    sort: { version: -1 },
  });
  assert.deepEqual(calls.at(-1).query, { definitionCode: "definition-one" });
});
