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
  runCommunicationSourceDeliveryAcceptance,
  selectCommunicationSourceDeliveryAcceptance,
} from "../src/service/acceptance/defaultCommunicationSourceDeliveryAcceptanceService.mjs";

const command = (suffix, channel = "IN_APP") => ({
  sourceType: "EXPIRY_REMINDER",
  sourceCode: `source-${suffix}`,
  templateCode: `REMINDER_${suffix.toUpperCase()}`,
  recipientId: `recipient-${suffix}`,
  recipientAddressReference: `profile:${suffix}`,
  purpose: "TRANSACTIONAL",
  channel,
  locale: "en",
  idempotencyKey: `reviewed-${suffix}`,
  variables: { reference: suffix },
});
const selection = {
  contractVersion: 1,
  approvalReference: "reviewed-delivery",
  tenant: "default",
  runtimeEnterpriseCode: "communication-runtime",
  sourceModule: "reviewedSource",
  scenarios: {
    delivery: { command: command("delivery"), expectedStatus: "DELIVERED" },
    retry: {
      command: command("retry", "EMAIL"),
      expectedInitialStatus: "RETRY_PENDING",
      expectedFinalStatus: "DELIVERED",
    },
    suppression: {
      command: command("suppression"),
      expectedStatus: "SUPPRESSED",
    },
  },
};
const session = {
  authorization: "Bearer service-session",
  enterpriseCode: "communication-runtime",
};

function harness(fault = {}) {
  const calls = [];
  const state = new Map();
  const response = (status, attempt, revision, extra = {}) => {
    const result = {
      intentCode: extra.intentCode,
      status,
      attempt,
      revision,
      ...extra,
    };
    state.set(result.intentCode, { status, revision });
    return result;
  };
  return {
    calls,
    options: {
      execute: true,
      phase: fault.phase || "exercise",
      baseUrl: "http://localhost:4340",
      selection,
      session,
      policy: {
        requestTimeoutMs: 1000,
        maximumRetryWaitMs: 1000,
        pollIntervalMs: 10,
      },
      fetch: async (url, input) => {
        const path = new URL(url).pathname;
        const body = JSON.parse(input.body);
        calls.push({ path, body, headers: input.headers });
        if (path.endsWith("/internal/communications")) {
          const key = body.idempotencyKey;
          if (key.endsWith("delivery")) {
            const code = "COMM_" + "a".repeat(64);
            return Response.json({
              data: response("DELIVERED", 1, 2, { intentCode: code }),
            });
          }
          if (key.endsWith("suppression")) {
            const code = "COMM_" + "b".repeat(64);
            return Response.json({
              data: response("SUPPRESSED", 0, 0, { intentCode: code }),
            });
          }
          const code = "COMM_" + "c".repeat(64);
          return Response.json({
            data: response("RETRY_PENDING", 1, 2, {
              intentCode: code,
              nextAttemptAt: new Date(Date.now() - 20).toISOString(),
            }),
          });
        }
        if (path.endsWith("/retry")) {
          const code = path.split("/").at(-2);
          return Response.json({
            data: response(fault.retryStatus || "DELIVERED", 2, 4, {
              intentCode: code,
            }),
          });
        }
        if (path.endsWith("/inspect")) {
          const code = path.split("/").at(-2);
          const current = state.get(code) || fault.persisted?.[code];
          return Response.json({
            data: {
              intentCode: code,
              status: current?.status || "DELIVERED",
              revision: current?.revision ?? 2,
            },
          });
        }
        return Response.json({ error: true }, { status: 404 });
      },
    },
  };
}

test("Communication acceptance proves delivery, replay, suppression, retry and inspection", async () => {
  const h = harness();
  const result = await runCommunicationSourceDeliveryAcceptance(h.options);
  assert.equal(result.state, "PASSED");
  assert.equal(result.phase, "exercise");
  assert.equal(result.restartInspectionRequired, true);
  assert.equal(result.evidence.retry.attempt, 2);
  assert.equal(result.evidence.suppression.status, "SUPPRESSED");
  assert.equal(
    h.calls.filter((call) => call.path.endsWith("/internal/communications"))
      .length,
    4,
  );
  assert.equal(
    h.calls.filter((call) => call.path.endsWith("/retry")).length,
    1,
  );
  assert.equal(
    h.calls.every(
      (call) => call.headers.Authorization === session.authorization,
    ),
    true,
  );
  assert.equal(h.calls[0].body.sourceModule, selection.sourceModule);
});

test("Inspection phase is read-only and reconstructs deterministic persisted intent identities", async () => {
  const crypto = await import("node:crypto");
  const persisted = {};
  for (const [name, scenario] of Object.entries(selection.scenarios)) {
    const code =
      "COMM_" +
      crypto.default
        .createHash("sha256")
        .update(JSON.stringify([selection.tenant, scenario.command.idempotencyKey]))
        .digest("hex");
    persisted[code] = {
      status:
        name === "retry"
          ? scenario.expectedFinalStatus
          : scenario.expectedStatus,
      revision: name === "suppression" ? 0 : 4,
    };
  }
  const h = harness({ phase: "inspect", persisted });
  const result = await runCommunicationSourceDeliveryAcceptance(h.options);
  assert.equal(result.phase, "inspect");
  assert.equal(result.restartInspectionRequired, false);
  assert.equal(h.calls.length, 3);
  assert.equal(h.calls.every((call) => call.path.endsWith("/inspect")), true);
  assert.equal(h.calls.every((call) => Object.keys(call.body).length === 0), true);
});

test("Communication acceptance fails closed on retry drift and malformed profiles", async () => {
  await assert.rejects(
    runCommunicationSourceDeliveryAcceptance(
      harness({ retryStatus: "RETRY_PENDING" }).options,
    ),
    /COMMUNICATION_RETRY_UNCONFIRMED/,
  );
  const duplicate = structuredClone(selection);
  duplicate.scenarios.retry.command.idempotencyKey =
    duplicate.scenarios.delivery.command.idempotencyKey;
  await assert.rejects(
    runCommunicationSourceDeliveryAcceptance({
      ...harness().options,
      selection: duplicate,
    }),
    /DISTINCT_COMMUNICATION_IDENTITIES_REQUIRED/,
  );
});

test("Communication acceptance defaults and registration remain Comms API-owned", async () => {
  await assert.rejects(
    runCommunicationSourceDeliveryAcceptance({}),
    /EXPLICIT_EXECUTION/,
  );
  assert.throws(
    () =>
      selectCommunicationSourceDeliveryAcceptance(
        Object.create({ communicationSourceDelivery: selection }),
      ),
    /UNAVAILABLE/,
  );
  assert.deepEqual(properties.communicationApi.acceptance, {
    requestTimeoutMs: 30000,
    maximumRetryWaitMs: 120000,
    pollIntervalMs: 500,
  });
  assert.equal(
    properties.tooling.commands["acceptance:communication-source-delivery"]
      .script,
    "src/service/acceptance/defaultCommunicationSourceDeliveryAcceptanceService.mjs",
  );
  const script = new URL(
    "../src/service/acceptance/defaultCommunicationSourceDeliveryAcceptanceService.mjs",
    import.meta.url,
  ).pathname;
  const result = spawnSync(process.execPath, [script, "--help"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
});
