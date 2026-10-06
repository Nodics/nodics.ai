/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module workflow/test/processLifecycleCommandReceipt @description Verifies definition and instance commands bind exact native permissions, inputs and original results to private receipts without replay. @layer test @owner workflow */
const test = require("node:test");
const assert = require("node:assert/strict");
const definitionOwner = require("../src/service/definition/defaultProcessDefinitionCommandReceiptService");
const instanceOwner = require("../src/service/operation/defaultProcessInstanceCommandReceiptService");

class NodicsError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const definitionResults = {
  create: {
    code: "SUC_PROCESS_00001",
    data: {
      code: "flow",
      status: "DRAFT",
      currentVersion: 0,
      draftRevision: 1,
    },
  },
  update: {
    code: "SUC_PROCESS_00002",
    data: { code: "flow", draftRevision: 2 },
  },
  prepare: {
    code: "SUC_PROCESS_00006",
    data: { code: "flow", status: "DRAFT" },
  },
  validate: { code: "SUC_PROCESS_00003", data: { valid: true } },
  publish: {
    code: "SUC_PROCESS_00004",
    data: { code: "flow", version: 1, checksum: "a".repeat(64) },
  },
  delete: {
    code: "SUC_PROCESS_00005",
    data: { code: "flow", status: "ARCHIVED" },
  },
};
const instanceResults = {
  start: {
    code: "SUC_PROCESS_00007",
    data: {
      instance: { code: "flow-1", status: "WAITING", startCompleted: true },
    },
  },
  cancel: {
    code: "SUC_PROCESS_00009",
    data: { code: "flow-1", status: "CANCELLED" },
  },
  retry: {
    code: "SUC_PROCESS_00012",
    data: { instance: { code: "flow-1" }, incident: { status: "RESOLVED" } },
  },
  compensate: {
    code: "SUC_PROCESS_00013",
    data: { instanceCode: "flow-1", compensationStatus: "COMPLETED" },
  },
};

function fixture() {
  const calls = [];
  const inspections = [];
  const fail = () => {
    throw new NodicsError("ERR_DBS_00004");
  };
  global.CLASSES = { NodicsError };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: {
      isPermissionGranted: (permission, grants) => grants.includes(permission),
      getGrantedPermissions: (request) => request.grants || [],
      getRouteActionAuthorizationConfig: () => ({}),
    },
    DefaultModelCommandReceiptService: {
      fail,
      result: (response) => {
        if (
          !response ||
          response.result === undefined ||
          response.error ||
          response.success === false
        )
          fail();
        return response.result;
      },
      execute: async (request, command, execute) => {
        command.authorize();
        calls.push({
          operation: command.operation,
          input: command.input,
          key: command.key,
        });
        const response = await execute();
        command.resultIdentity(response);
        return response;
      },
      inspect: async (_request, command) => {
        command.authorize();
        inspections.push(command.operation);
        return {
          state: "COMPLETED",
          resultIdentity:
            command.input.definitionCode || command.input.instanceCode,
        };
      },
    },
    DefaultProcessDefinitionLifecycleService: {
      modelOf: (request) => request.processDefinition || {},
      assertCode: (value) => {
        if (
          typeof value !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
        )
          fail();
        return value;
      },
    },
    DefaultProcessRuntimeLifecycleService: {
      bodyOf: (request) => request.runtimeOperation || {},
      assertCode: (value) => {
        if (
          typeof value !== "string" ||
          !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
        )
          fail();
        return value;
      },
    },
  };
  for (const [kind, result] of Object.entries(definitionResults)) {
    const method = definitionOwner.operation(kind).method;
    SERVICE.DefaultProcessDefinitionLifecycleService[method] = async () =>
      result;
  }
  for (const [kind, result] of Object.entries(instanceResults)) {
    const method = instanceOwner.operation(kind).method;
    SERVICE.DefaultProcessRuntimeLifecycleService[method] = async () => result;
  }
  return { calls, inspections };
}

for (const [kind, result] of Object.entries(definitionResults)) {
  test("definition " + kind + " records one exact native result", async () => {
    const f = fixture();
    const permission = definitionOwner.operation(kind).permission;
    const request = {
      definitionCode: "flow",
      processDefinition:
        kind === "create" ? { code: "flow", name: "Flow", graph: {} } : {},
      idempotencyKey: "definition-key",
      grants: [permission],
    };
    assert.equal(await definitionOwner.execute(request, kind), result);
    assert.deepEqual(
      f.calls.map((call) => call.operation),
      ["definition." + kind],
    );
    assert.equal(f.calls[0].input.definitionCode, "flow");
  });
}

for (const [kind, result] of Object.entries(instanceResults)) {
  test("instance " + kind + " records one exact native result", async () => {
    const f = fixture();
    const permission = instanceOwner.operation(kind).permission;
    const body =
      kind === "start"
        ? { instanceCode: "flow-1", definitionCode: "flow", context: {} }
        : {};
    const request = {
      instanceCode: "flow-1",
      runtimeOperation: body,
      idempotencyKey: "instance-key",
      grants: [permission],
    };
    assert.equal(await instanceOwner.execute(request, kind), result);
    assert.deepEqual(
      f.calls.map((call) => call.operation),
      ["instance." + kind],
    );
    assert.equal(f.calls[0].input.instanceCode, "flow-1");
  });
}

test("denied keyed commands never invoke owner lifecycle", async () => {
  const f = fixture();
  await assert.rejects(
    definitionOwner.execute(
      {
        definitionCode: "flow",
        processDefinition: {},
        idempotencyKey: "key",
        grants: [],
      },
      "publish",
    ),
    /ERR_DBS_00004/,
  );
  await assert.rejects(
    instanceOwner.execute(
      {
        instanceCode: "flow-1",
        runtimeOperation: {},
        idempotencyKey: "key",
        grants: [],
      },
      "cancel",
    ),
    /ERR_DBS_00004/,
  );
  assert.deepEqual(f.calls, []);
});

test("inspection authorizes original input and never invokes lifecycle", async () => {
  const f = fixture();
  const request = {
    definitionCode: "flow",
    command: "publish",
    processDefinition: { command: {}, idempotencyKey: "key" },
    grants: ["process.definition.publish"],
  };
  const result = await definitionOwner.inspect(request);
  assert.equal(result.data.resultIdentity, "flow");
  assert.deepEqual(f.inspections, ["definition.publish"]);
  assert.deepEqual(f.calls, []);
});
