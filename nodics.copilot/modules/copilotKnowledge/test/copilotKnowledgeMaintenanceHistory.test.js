/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Covers scoped maintenance receipt inspection, minimization, denied reads and uncertain persistence without replaying any command. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultCopilotKnowledgeMaintenanceHistoryService");
const runtime = require("../src/service/defaultCopilotKnowledgeRuntimeService");
let config, request, row, queries, output;
beforeEach(() => {
  config = {
    knowledge: structuredClone(
      require("../config/properties").copilot.knowledge,
    ),
    policy: require("../../copilotPolicy/config/properties").copilot.policy,
  };
  config.knowledge.sourceRegistry.definitions = [
    {
      code: "framework-readme",
      repository: "framework",
      project: "nodics",
      module: "copilotKnowledge",
      owner: "copilotKnowledge",
      version: "1",
      template: "employeeReadme",
      enabled: true,
    },
  ];
  request = {
    tenant: "tenant",
    sourceCode: "framework-readme",
    query: {},
    authData: { loginId: "auditor", enterpriseCode: "ACME" },
    securityContext: {
      channel: "EMPLOYEE",
      tenant: "tenant",
      enterprise: "ACME",
      actor: "auditor",
      permissions: [
        "copilot.knowledge.internal.read",
        "copilot.knowledge.maintenance.read",
      ],
    },
  };
  row = {
    code: "ckm-11111111-1111-4111-8111-111111111111",
    operationCode: "retire-22222222-2222-4222-8222-222222222222",
    tenantCode: "tenant",
    enterpriseCode: "ACME",
    sourceCode: "framework-readme",
    principalCode: "operator",
    revision: 5,
    stage: "WRITER_RETIREMENT_AUTHORIZED",
    occurredAt: "2026-10-03T10:00:00.000Z",
    reviewDigest: "private-review",
    internalValue: "private-detail",
  };
  queries = [];
  output = () => ({ code: "SUC_TEST", result: [row] });
  global.CONFIG = { get: () => config };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCopilotKnowledgeRuntimeService: runtime,
    DefaultCopilotKnowledgeSourceRegistryService: require("../src/service/defaultCopilotKnowledgeSourceRegistryService"),
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultCopilotKnowledgeMaintenanceService: {
      get: async (input) => {
        queries.push(input);
        return output();
      },
    },
  };
});
test("reads minimized exact enterprise/source receipts while write gates remain disabled", async () => {
  const result = await owner.list(request);
  assert.equal(result.items[0].stage, "WRITER_RETIREMENT_AUTHORIZED");
  assert.equal(result.items[0].operationCode, row.operationCode);
  assert.equal(result.evidence, "MAINTENANCE_RECEIPTS");
  assert.equal(result.mayHaveMore, false);
  assert.doesNotMatch(
    JSON.stringify(result),
    /private|reviewDigest|success|COMPLETED/,
  );
  assert.deepEqual(queries[0].query, {
    tenantCode: "tenant",
    enterpriseCode: "ACME",
    sourceCode: "framework-readme",
  });
  assert.equal(queries[0].authData, request.authData);
  assert.equal(queries[0].options.skipItemCache, true);
  assert.equal(config.knowledge.generationPublication.enabled, false);
});
test("rejects missing permission, foreign tenant, source and injected filters before storage", async () => {
  for (const patch of [
    { tenant: "foreign" },
    { sourceCode: "foreign" },
    { query: { principalCode: "operator" } },
    { query: { page: 1001 } },
    { query: { page: [1] } },
    {
      securityContext: {
        ...request.securityContext,
        permissions: ["copilot.knowledge.internal.read"],
      },
    },
    { authData: { ...request.authData, enterpriseCode: "OTHER" } },
  ])
    await assert.rejects(owner.list({ ...request, ...patch }));
  assert.equal(queries.length, 0);
});
test("rejects failed, duplicate, oversized and foreign persistence instead of fabricating empty history", async () => {
  for (const response of [
    { code: "ERR_TEST", result: [] },
    { code: "SUC_TEST", errors: ["partial"], result: [row] },
    { code: "SUC_TEST", result: [row, row] },
    { code: "SUC_TEST", result: {} },
    { code: "SUC_TEST", result: Array(26).fill(row) },
    ...[
      { enterpriseCode: "OTHER" },
      { sourceCode: "other" },
      { revision: -1 },
      { occurredAt: "invalid" },
      { stage: "CLEANUP_COMPLETED" },
      { operationCode: "arbitrary" },
    ].map((change) => ({ code: "SUC_TEST", result: [{ ...row, ...change }] })),
  ]) {
    output = () => response;
    await assert.rejects(owner.list(request));
  }
});
test("revocation and identity change during the read discard all returned receipts", async () => {
  output = () => {
    request.securityContext.permissions = [];
    return { code: "SUC_TEST", result: [row] };
  };
  await assert.rejects(owner.list(request));
  request.securityContext.permissions = [
    "copilot.knowledge.internal.read",
    "copilot.knowledge.maintenance.read",
  ];
  output = () => {
    request.authData.enterpriseCode = "OTHER";
    return { code: "SUC_TEST", result: [row] };
  };
  await assert.rejects(owner.list(request));
});
test("uses bounded newest-first pagination and declares a full window without inventing an exact total", async () => {
  request.query.page = "2";
  output = () => ({
    code: "SUC_TEST",
    result: Array.from({ length: 25 }, (_, index) => ({
      ...row,
      code:
        "ckm-" +
        index.toString(16).padStart(8, "0") +
        "-1111-4111-8111-111111111111",
    })),
  });
  const result = await owner.list(request);
  assert.equal(result.mayHaveMore, true);
  assert.equal(result.page, 2);
  assert.equal(result.items.length, 25);
  assert.deepEqual(queries[0].searchOptions, {
    pageSize: 25,
    pageNumber: 2,
    sort: { occurredAt: -1, code: -1 },
  });
});
