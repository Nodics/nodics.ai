/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotBudgetRuntime
 * @description Verifies scoped current-period allocations, confirmation, concurrent revisions and no-charge budget denial through real Profile HTTP and generated persistence.
 * @layer test @owner copilotCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "real allocations preserve ceilings, authority, exact revisions and persisted audit",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withOllama: true,
      withBudgets: true,
    });
    t.after(() => runtime.close());
    let token,
      enterprise = "default";
    /** Sends a single scoped request; concurrent callers explicitly inspect both HTTP outcomes. */
    async function request(path, body, expected = 200) {
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
      if (expected !== null)
        assert.equal(response.status, expected, JSON.stringify(result));
      return expected === null
        ? { status: response.status, result }
        : result.data || result.result || result;
    }
    /** Uses Profile-issued claims for operator, reader and foreign enterprise cases. */
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
    let snapshot = await request(root + "/budgets");
    assert.deepEqual(snapshot.permissions, { enterprise: true, users: true });
    /** Binds each allocation only to a fresh owner-issued period, policy and revision. */
    const command = (changeId, limit, target = "USER") => ({
      target,
      principalCode: target === "USER" ? "copilot_acceptance_operator" : null,
      limit,
      reason: "Disposable allocation acceptance",
      changeId,
      periodKey: snapshot.period.key,
      policyDigest: snapshot.policyDigest,
      expectedRevision: snapshot.revision,
    });
    const denied = command("reader-denied", 100);
    await login("reader");
    await request(root + "/budgets", undefined, 403);
    await request(root + "/budgets/preview", denied, 403);
    await login("foreign");
    await request(root + "/budgets", undefined, 403);
    await login();
    await request(
      root + "/budgets/preview",
      command("above-ceiling", 10001),
      400,
    );
    await request(
      root + "/budgets/preview",
      {
        ...command("forged-scope", 100),
        enterpriseCode: "copilot_acceptance_foreign",
      },
      400,
    );
    await request(root + "/knowledge/sources/acceptance/refresh", {});
    const conversation = (
      await request(root + "/conversations", { title: "Budget enforcement" })
    ).conversation.conversationCode;
    const successful = await request(
      root + "/conversations/" + conversation + "/turns",
      {
        message: "What is the acceptance collection colour?",
        idempotencyKey: "allocation-measured-turn",
      },
    );
    assert.equal(successful.turn.state, "COMPLETED");
    const before = await request(root + "/usage");
    assert.equal(before.totals.calls, 1);
    assert.ok(before.totals.consumed > 0);
    const lower = command("lower-own-allocation", 0);
    const preview = await request(root + "/budgets/preview", lower);
    assert.equal(preview.impact.after, 0);
    assert.equal(preview.impact.belowCommitted, true);
    assert.equal(preview.impact.committed, before.totals.consumed);
    assert.equal(
      (await request(root + "/budgets")).revision,
      snapshot.revision,
    );
    await request(root + "/budgets/allocations", lower, 400);
    snapshot = await request(root + "/budgets/allocations", {
      ...lower,
      confirmed: true,
    });
    assert.equal(
      snapshot.users.find((x) => x.principalCode === lower.principalCode).limit,
      0,
    );
    assert.equal(snapshot.changes.length, 1);
    assert.equal(
      (
        await request(root + "/budgets/allocations", {
          ...lower,
          confirmed: true,
        })
      ).changes.length,
      1,
    );
    await request(
      root + "/budgets/allocations",
      { ...lower, limit: 10, confirmed: true },
      409,
    );
    await request(
      root + "/conversations/" + conversation + "/turns",
      {
        message: "What is the acceptance collection colour?",
        idempotencyKey: "allocation-zero-turn",
      },
      429,
    );
    assert.deepEqual((await request(root + "/usage")).totals, before.totals);
    const first = command("competing-allocation-one", 5000);
    const second = command("competing-allocation-two", 6000);
    const competing = await Promise.all(
      [first, second].map((value) =>
        request(
          root + "/budgets/allocations",
          { ...value, confirmed: true },
          null,
        ),
      ),
    );
    assert.deepEqual(competing.map((x) => x.status).sort(), [200, 409]);
    snapshot = await request(root + "/budgets");
    assert.equal(snapshot.changes.length, 2);
    const cap = command("enterprise-zero-cap", 0, "ENTERPRISE");
    snapshot = await request(root + "/budgets/allocations", {
      ...cap,
      confirmed: true,
    });
    assert.equal(snapshot.enterprise.limit, 0);
    assert.ok(
      snapshot.users.find((x) => x.principalCode === lower.principalCode)
        .limit > 0,
    );
    await request(
      root + "/conversations/" + conversation + "/turns",
      {
        message: "What is the acceptance collection colour?",
        idempotencyKey: "enterprise-cap-zero-turn",
      },
      429,
    );
    assert.deepEqual((await request(root + "/usage")).totals, before.totals);
    await runtime.restart();
    await login();
    const restarted = await request(root + "/budgets");
    assert.deepEqual(restarted.changes, snapshot.changes);
    assert.equal(restarted.enterprise.limit, 0);
    assert.equal(restarted.enterprise.consumed, before.totals.consumed);
    assert.deepEqual((await request(root + "/usage")).totals, before.totals);
    t.diagnostic(
      "REAL_ALLOCATION_CEILINGS_CONCURRENT_CAS_AUDIT_RESTART_AND_ZERO_DISPATCH_PASS",
    );
  },
);
