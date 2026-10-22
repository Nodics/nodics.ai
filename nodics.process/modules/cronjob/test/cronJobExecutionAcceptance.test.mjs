/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import properties from "../config/properties.js";
import {
  runCronJobExecutionAcceptance,
  selectCronJobExecutionAcceptance,
} from "../src/service/acceptance/defaultCronJobExecutionAcceptanceService.mjs";

const selection = {
  contractVersion: 1,
  approvalReference: "reviewed-cron-execution",
  tenant: "default",
  runtimeEnterpriseCode: "automation-runtime",
  jobCode: "reviewedReminderSweep",
  expectedExpression: "0 */5 * * * *",
};
const session = {
  authorization: "Bearer operator-session",
  enterpriseCode: "automation-runtime",
};

function harness(fault = {}) {
  const calls = [];
  let reads = 0;
  const before = {
    code: selection.jobCode,
    active: false,
    trigger: { expression: selection.expectedExpression },
    status: "NEW",
  };
  return {
    calls,
    options: {
      execute: true,
      baseUrl: "http://localhost:4330",
      selection,
      session,
      policy: {
        requestTimeoutMs: 1000,
        executionTimeoutMs: 1000,
        pollIntervalMs: 10,
      },
      fetch: async (url, input) => {
        const path = new URL(url).pathname;
        const body = input.body ? JSON.parse(input.body) : undefined;
        calls.push({ path, method: input.method, body, headers: input.headers });
        if (path.endsWith(`/cronjob/code/${selection.jobCode}`)) {
          reads += 1;
          const row =
            reads === 1
              ? before
              : {
                  ...before,
                  active: true,
                  status: fault.execution ? "ERROR" : "SUCCESS",
                  startTime: new Date(Date.now() + 5).toISOString(),
                  endTime: new Date(Date.now() + 10).toISOString(),
                };
          return Response.json({ result: [row] });
        }
        if (path.endsWith("/schedules/lifecycle/inspect"))
          return Response.json({
            data: {
              code: selection.jobCode,
              state: fault.lifecycle || "SAVED_INACTIVE",
              revision: 0,
            },
          });
        if (path.endsWith("/schedules/lifecycle/preview"))
          return Response.json({
            data: {
              code: selection.jobCode,
              state: "SAVED_INACTIVE",
              intent: "ACTIVATE",
              revision: 0,
              reviewDigest: "a".repeat(64),
            },
          });
        if (path.endsWith("/schedules/lifecycle/execute"))
          return Response.json({
            data: {
              code: selection.jobCode,
              state: "ACTIVE",
              intent: "ACTIVATE",
              revision: 1,
              reviewDigest: "a".repeat(64),
            },
          });
        if (path.endsWith(`/job/run/${selection.jobCode}`))
          return Response.json({ data: { code: "SUC_JOB_00000" } });
        return Response.json({ error: true }, { status: 404 });
      },
    },
  };
}

test("Cron acceptance activates one reviewed schedule and proves one fresh execution", async () => {
  const h = harness();
  const result = await runCronJobExecutionAcceptance(h.options);
  assert.equal(result.state, "PASSED");
  assert.equal(result.activation.state, "ACTIVE");
  assert.equal(result.execution.status, "SUCCESS");
  assert.deepEqual(
    h.calls.map((call) => call.path),
    [
      `/nodics/cronjob/v0/cronjob/code/${selection.jobCode}`,
      "/nodics/cronjob/v0/schedules/lifecycle/inspect",
      "/nodics/cronjob/v0/schedules/lifecycle/preview",
      "/nodics/cronjob/v0/schedules/lifecycle/execute",
      `/nodics/cronjob/v0/job/run/${selection.jobCode}`,
      `/nodics/cronjob/v0/cronjob/code/${selection.jobCode}`,
    ],
  );
  assert.equal(h.calls[2].body.intent, "ACTIVATE");
  assert.equal(h.calls[3].body.confirmed, true);
});

test("Cron acceptance refuses a non-inactive selection and an unproven execution", async () => {
  await assert.rejects(
    runCronJobExecutionAcceptance(harness({ lifecycle: "ACTIVE" }).options),
    /SAVED_INACTIVE_CRON_JOB_REQUIRED/,
  );
  await assert.rejects(
    runCronJobExecutionAcceptance(harness({ execution: true }).options),
    /CRON_EXECUTION_EVIDENCE_TIMEOUT/,
  );
});

test("Cron acceptance defaults and registration remain Cron-owned", async () => {
  await assert.rejects(runCronJobExecutionAcceptance({}), /EXPLICIT_EXECUTION/);
  assert.throws(
    () =>
      selectCronJobExecutionAcceptance(
        Object.create({ cronJobExecution: selection }),
      ),
    /UNAVAILABLE/,
  );
  assert.deepEqual(properties.cronjob.acceptance, {
    requestTimeoutMs: 30000,
    executionTimeoutMs: 120000,
    pollIntervalMs: 500,
  });
  assert.equal(
    properties.tooling.commands["acceptance:cronjob-execution"].script,
    "src/service/acceptance/defaultCronJobExecutionAcceptanceService.mjs",
  );
  const script = new URL(
    "../src/service/acceptance/defaultCronJobExecutionAcceptanceService.mjs",
    import.meta.url,
  ).pathname;
  const result = spawnSync(process.execPath, [script, "--help"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
});
