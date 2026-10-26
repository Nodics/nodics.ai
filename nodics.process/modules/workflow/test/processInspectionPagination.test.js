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
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES, CONFIG: global.CONFIG };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: Error };
  global.CONFIG = { get: () => require('../config/properties').process };
  const calls = [];
  const owner = {
    get: async (request) => {
      calls.push(request);
      return { code: 'SUC_TEST', count: 1, result: [{ code: "one" }] };
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

test('task pages preserve generated-owner scope, filters and exact count beyond 25 records', async (t) => {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES, CONFIG: global.CONFIG };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: Error };
  global.CONFIG = { get: () => require('../config/properties').process };
  const calls = [];
  const rows = Array.from({ length: 61 }, (_, index) => ({ code: `task-${String(index).padStart(3, '0')}` }));
  const authData = { loginId: 'reviewer', entCode: 'enterprise-one' };
  global.SERVICE = {
    DefaultProcessTaskService: { get: async (request) => {
      calls.push(request);
      const { pageNumber, pageSize } = request.searchOptions;
      return { code: 'SUC_TEST', count: rows.length, result: rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) };
    } },
    DefaultProcessRuntimeLifecycleService: { projectTaskDecisions: async (request, tasks) => {
      assert.equal(request.authData, authData);
      return tasks.map((task) => ({ ...task, reviewerEligibility: { eligible: false } }));
    } },
  };
  const seen = [];
  for (const page of [1, 2, 3, 4]) {
    const response = await inspection.listTasks({ tenant: 'tenant-one', authData, query: {
      page: String(page), queue: 'actionable', status: 'OPEN', assignee: 'reviewer', instanceCode: 'instance-one', unsafe: { $ne: null },
    } });
    seen.push(...response.data.map((row) => row.code));
    assert.deepEqual(response.pagination, { page, pageSize: 25, total: 61, hasNext: page < 3, hasPrevious: page > 1 });
    assert.ok(response.data.every((row) => row.reviewerEligibility.eligible === false));
    const call = calls.at(-1);
    assert.equal(call.tenant, 'tenant-one');
    assert.equal(call.authData, authData);
    assert.deepEqual(call.query, { $and: [{ instanceCode: 'instance-one', status: 'OPEN', assignee: 'reviewer' }, { status: { $in: ['OPEN', 'CLAIMED', 'ESCALATED'] } }] });
    assert.deepEqual(call.searchOptions, { pageSize: 25, pageNumber: page, sort: { dueAt: 1, code: 1 } });
  }
  assert.equal(new Set(seen).size, 61);
  assert.equal(seen.length, 61);
  for (const query of [{ page: '0' }, { page: '-1' }, { page: '1.5' }, { page: ['2'] }, { page: '1e2' }, { page: '9007199254740991' }, { limit: '101' }, { limit: 'no' }, { queue: 'anything' }]) {
    await assert.rejects(() => inspection.listTasks({ tenant: 'tenant-one', authData, query }));
  }
  assert.equal(calls.length, 4);
  global.CONFIG = { get: () => ({ taskQueue: { defaultPageSize: 7, maximumPageSize: 20 } }) };
  const customized = await inspection.listTasks({ tenant: 'tenant-one', authData, query: { page: '2' } });
  assert.equal(customized.pagination.pageSize, 7);
  assert.equal(customized.data[0].code, 'task-007');
  for (const taskQueue of [undefined, { defaultPageSize: 0, maximumPageSize: 100 }, { defaultPageSize: 25, maximumPageSize: 20 }, { defaultPageSize: 25, maximumPageSize: 101 }]) {
    global.CONFIG = { get: () => ({ taskQueue }) };
    await assert.rejects(() => inspection.listTasks({ tenant: 'tenant-one', authData, query: {} }));
  }
  global.CONFIG = { get: () => require('../config/properties').process };
  global.SERVICE.DefaultProcessTaskService.get = async () => ({ code: 'SUC_TEST', count: 0, result: [] });
  assert.deepEqual((await inspection.listTasks({ tenant: 'tenant-one', authData, query: {} })).pagination,
    { page: 1, pageSize: 25, total: 0, hasNext: false, hasPrevious: false });
  global.SERVICE.DefaultProcessTaskService.get = async () => ({ code: 'SUC_TEST', result: [] });
  await assert.rejects(() => inspection.listTasks({ tenant: 'tenant-one', authData, query: {} }));
  global.SERVICE.DefaultProcessTaskService.get = async () => { throw new Error('Denied'); };
  await assert.rejects(() => inspection.listTasks({ tenant: 'tenant-one', authData, query: {} }), /Denied/);
});
