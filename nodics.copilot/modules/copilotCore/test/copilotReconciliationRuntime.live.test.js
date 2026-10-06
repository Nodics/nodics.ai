/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotReconciliationRuntime
 * @description Qualifies real measured-receipt recovery after controlled settlement failure, with scoped API authority and restart persistence.
 * @layer test @owner copilotCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "real receipt reconciles an unsettled Ollama call exactly once",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withOllama: true,
      withReconciliation: true,
    });
    t.after(() => runtime.close());
    let token,
      enterprise = "default";
    /** Sends one real authenticated request without transport retries. */
    async function request(path, body, status = 200) {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        method: body === undefined ? "GET" : "POST",
        signal: AbortSignal.timeout(60000),
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-code": enterprise,
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const result = await response.json();
      assert.equal(response.status, status, JSON.stringify(result));
      return result.data || result.result || result;
    }
    /** Resolves current authority through Profile, never hand-authored claims. */
    async function login(role = "operator") {
      token = undefined;
      enterprise =
        role === "foreign" ? "copilot_acceptance_foreign" : "default";
      token = (
        await request("profile/v0/employee/authenticate", {
          loginId: "copilot_acceptance_" + role,
          password: runtime.password,
        })
      ).authToken;
      assert.ok(token);
    }
    const root = "copilotApi/v0";
    await login();
    await request(root + "/knowledge/sources/acceptance/refresh", {});
    const conversation = (
      await request(root + "/conversations", {
        title: "Measured receipt recovery",
      })
    ).conversation.conversationCode;
    const turn = {
      message: "What is the acceptance collection colour?",
      idempotencyKey: "reconciliation-original-turn",
    };
    await request(
      root + "/conversations/" + conversation + "/turns",
      turn,
      500,
    );
    assert.equal(
      runtime.diagnostics.filter(
        (x) => x.code === "MEASURED_SETTLEMENT_UNAVAILABLE",
      ).length,
      1,
    );
    const before = await request(root + "/usage");
    assert.equal(before.totals.calls, 1);
    assert.equal(before.totals.consumed, 0);
    assert.ok(before.totals.reserved > 0);
    const callId = before.items[0].callId;
    const periodKey = before.period.key;
    const detailPath =
      root + "/usage/call?" + new URLSearchParams({ callId, periodKey });
    let detail = await request(detailPath);
    assert.equal(detail.canReconcile, true);
    assert.ok(detail.evidence.totalTokens > 0);
    const command = {
      callId,
      periodKey,
      evidenceDigest: detail.evidence.digest,
      changeId: "measured-recovery",
      reason: "Recover the original recorded measurement",
    };
    await login("reader");
    await request(root + "/usage/reconciliation/preview", command, 403);
    await login("foreign");
    await request(detailPath, undefined, 403);
    await login();
    await request(
      root + "/usage/reconciliation/preview",
      { ...command, totalTokens: 0 },
      400,
    );
    await request(
      root + "/usage/reconciliation/preview",
      { ...command, evidenceDigest: "0".repeat(64) },
      409,
    );
    const preview = await request(
      root + "/usage/reconciliation/preview",
      command,
    );
    assert.equal(preview.measured, detail.evidence.totalTokens);
    assert.deepEqual((await request(root + "/usage")).totals, before.totals);
    await request(root + "/usage/reconciliation", command, 400);
    detail = await request(root + "/usage/reconciliation", {
      ...command,
      confirmed: true,
    });
    assert.equal(detail.item.state, "MEASURED");
    assert.equal(detail.item.reserved, 0);
    assert.equal(detail.reconciliation.actor, "copilot_acceptance_operator");
    assert.equal(detail.reconciliation.changeId, command.changeId);
    const after = await request(root + "/usage");
    assert.equal(after.totals.calls, 1);
    assert.equal(after.totals.consumed, preview.measured);
    assert.equal(after.totals.reserved, 0);
    await request(root + "/usage/reconciliation", {
      ...command,
      confirmed: true,
    });
    await request(
      root + "/usage/reconciliation",
      { ...command, changeId: "changed-repair", confirmed: true },
      409,
    );
    await runtime.restart();
    await login();
    assert.deepEqual((await request(root + "/usage")).totals, after.totals);
    assert.equal(
      (await request(detailPath)).reconciliation.changeId,
      command.changeId,
    );
    const original = await request(
      root + "/conversations/" + conversation + "/turns",
      turn,
    );
    assert.equal(original.turn.state, "FAILED");
    assert.deepEqual((await request(root + "/usage")).totals, after.totals);
    t.diagnostic(
      "REAL_MEASURED_RECEIPT_RECONCILIATION_NO_MODEL_REPLAY_AND_RESTART_PASS",
    );
  },
);
