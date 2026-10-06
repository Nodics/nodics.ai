/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotProviderFailureRuntime
 * @description Exercises real Profile/Copilot HTTP with missing local models and bounded owned provider failures; verifies persisted uncertain usage without optimistic release or duplicate dispatch.
 * @layer test @owner copilotCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "provider failures preserve bounded health, uncertain accounting and original failed turns",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({ withOllama: true });
    t.after(() => runtime.close());
    let token;
    /** Sends one real request without retries; only synthetic test responses enter assertions. */
    async function request(path, body, expected = 200) {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        method: body === undefined ? "GET" : "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-code": "default",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const result = await response.json();
      assert.equal(
        response.status,
        expected,
        JSON.stringify({ result, diagnostics: runtime.diagnostics }),
      );
      return result.data || result.result || result;
    }
    /** Reauthenticates with real Profile after each authored configuration restart. */
    async function login() {
      token = undefined;
      token = (
        await request("profile/v0/employee/authenticate", {
          loginId: "copilot_acceptance_operator",
          password: runtime.password,
        })
      ).authToken;
      assert.ok(token);
    }
    await login();
    const root = "copilotApi/v0";
    assert.equal((await request(root + "/providers/check", {})).state, "UP");
    await request(root + "/knowledge/sources/acceptance/refresh", {});
    const conversation = (
      await request(root + "/conversations", {
        title: "Synthetic provider fault acceptance",
      })
    ).conversation.conversationCode;
    const turns = root + "/conversations/" + conversation + "/turns";
    let before = await request(root + "/usage");
    for (const mode of [
      "MISSING_MODEL",
      "UNAVAILABLE",
      "TIMEOUT",
      "INVALID_PROFILE",
    ]) {
      await runtime.restartProviderScenario(mode);
      await login();
      const healthStart = Date.now();
      const health = await request(root + "/providers/check", {});
      assert.equal(
        health.state,
        mode === "MISSING_MODEL"
          ? "DEGRADED"
          : mode === "INVALID_PROFILE"
            ? "NOT_CONFIGURED"
            : "DOWN",
      );
      assert.ok(Date.now() - healthStart < 10000, "Health must remain bounded");
      for (const key of ["password", "secretRef", "connection", "stack"])
        assert.equal(Object.hasOwn(health, key), false);
      assert.doesNotMatch(JSON.stringify(health), /127\.0\.0\.1/);
      assert.ok(!JSON.stringify(health).includes(runtime.password));
      const callsBefore = runtime.providerFaultEvidence().requests;
      const command = {
        message: "What is the acceptance collection colour?",
        idempotencyKey: "provider-fault-" + mode.toLowerCase(),
      };
      await request(turns, command, 500);
      const usage = await request(root + "/usage");
      assert.equal(usage.totals.consumed, before.totals.consumed);
      assert.equal(
        usage.totals.calls,
        before.totals.calls + (mode === "INVALID_PROFILE" ? 0 : 1),
      );
      if (mode !== "INVALID_PROFILE") {
        assert.ok(usage.totals.pending > before.totals.pending);
        assert.equal(usage.totals.reserved, usage.totals.pending);
        assert.ok(
          usage.items.every(
            (item) => item.state === "PENDING" && item.consumed === null,
          ),
        );
      }
      if (["UNAVAILABLE", "TIMEOUT"].includes(mode))
        assert.equal(
          runtime.providerFaultEvidence().requests - callsBefore,
          1,
          "No automatic provider retry",
        );
      const retry = await request(turns, command);
      assert.equal(retry.turn.state, "FAILED");
      assert.deepEqual((await request(root + "/usage")).totals, usage.totals);
      before = usage;
      t.diagnostic(
        "REAL_PROVIDER_" + mode + "_HEALTH_ACCOUNTING_AND_NO_REPLAY_PASS",
      );
    }
    await runtime.restartProviderScenario("NORMAL");
    await login();
    assert.equal((await request(root + "/providers/check", {})).state, "UP");
    assert.deepEqual((await request(root + "/usage")).totals, before.totals);
  },
);
