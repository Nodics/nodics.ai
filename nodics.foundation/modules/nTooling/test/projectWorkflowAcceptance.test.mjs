/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from "node:assert/strict";
import test from "node:test";
import { completeAcceptanceWorkflow } from "../src/service/project/defaultProjectAcceptanceService.mjs";

/** @module nTooling/test/projectWorkflowAcceptance @description Checks caller-owned decisions and bounded Process API orchestration. @owner nTooling @layer test */
function fixture(overrides = {}) {
  const calls = [];
  const options = {
    baseUrl: "https://process.example", headers: { Authorization: "Bearer fixture" },
    definitionCode: "partnerReview", correlation: { key: "recordCode", value: "record-1" },
    nodeCode: "decision", decision: { approved: false, reason: "explicit rejection" },
    request: async (base, route, request) => {
      calls.push({ base, route, ...request });
      if (route.includes("/instances?")) return { items: [
        { code: "other", definitionCode: "partnerReview", context: { recordCode: "other" }, status: "WAITING" },
        { code: "instance", definitionCode: "partnerReview", context: { recordCode: "record-1" }, status: "WAITING" },
      ] };
      if (route.includes("/tasks?")) return { items: [
        { code: "wrong", instanceCode: "other", nodeCode: "decision", status: "OPEN" },
        { code: "task", instanceCode: "instance", nodeCode: "decision", status: "OPEN" },
      ] };
      return { instance: { status: "COMPLETED" } };
    },
    ...overrides,
  };
  return { calls, options };
}

test("workflow helper keeps selection, credentials and negative decision unchanged", async () => {
  const { calls, options } = fixture();
  assert.equal((await completeAcceptanceWorkflow(options)).instance.status, "COMPLETED");
  assert.equal(calls.length, 4);
  assert(calls.every(call => call.base === options.baseUrl && call.headers === options.headers));
  assert(calls[2].route.endsWith("/task/claim"));
  assert.deepEqual(JSON.parse(calls[3].body), { decision: options.decision });
  assert.equal(JSON.parse(calls[3].body).decision.emergencyOverride, undefined);
});

test("missing selection and decision reject before any request", async () => {
  for (const override of [{ decision: undefined }, { decision: {} }, { attempts: 101 }, { instanceLimit: 201 }, { correlation: null }]) {
    const { calls, options } = fixture(override);
    await assert.rejects(completeAcceptanceWorkflow(options), /Explicit bounded/);
    assert.equal(calls.length, 0);
  }
});

test("only the caller-bounded polling retries a missing workflow; tasks never broaden scope", async () => {
  let reads = 0, sleeps = 0;
  const { options } = fixture({
    attempts: 3, intervalMs: 2, sleep: async ms => { assert.equal(ms, 2); sleeps++; },
    request: async () => { reads++; return { items: [] }; },
  });
  await assert.rejects(completeAcceptanceWorkflow(options), /workflow instance/);
  assert.equal(reads, 3);
  assert.equal(sleeps, 2);
  const original = fixture().options;
  await assert.rejects(completeAcceptanceWorkflow({
    ...original,
    request: (base, route, request) => route.includes("/tasks?")
      ? { items: [{ code: "task", instanceCode: "other", nodeCode: "decision", status: "OPEN" }] }
      : original.request(base, route, request),
  }), /decision task/);
});

test("claim rejection propagates without completing or bypassing Process", async () => {
  const { options, calls } = fixture();
  const read = options.request;
  options.request = async (...args) => {
    if (args[1].endsWith("/claim")) throw new Error("claim denied");
    return read(...args);
  };
  await assert.rejects(completeAcceptanceWorkflow(options), /claim denied/);
  assert(!calls.some(call => call.route.endsWith("/complete")));
});
