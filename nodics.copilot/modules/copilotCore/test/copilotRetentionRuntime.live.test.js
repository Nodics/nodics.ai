/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotRetentionRuntime
 * @description Qualifies bounded deletion of explicitly aged synthetic content through real scoped APIs, transactions and durable policy fences.
 * @layer test @owner copilotCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "real retention preserves its tombstone and advances one confirmed bounded page",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withGovernance: true,
      withRetention: true,
    });
    t.after(() => runtime.close());
    let token;
    /** Uses the authenticated owning API, with no storage or command retries. */
    async function request(path, body, status = 200) {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        method: body === undefined ? "GET" : "POST",
        signal: AbortSignal.timeout(60000),
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
        status,
        JSON.stringify({ result, diagnostics: runtime.diagnostics }),
      );
      return result.data || result.result || result;
    }
    /** Resolves the original operator and independent denied employee. */
    async function login(role = "operator") {
      token = undefined;
      token = (
        await request("profile/v0/employee/authenticate", {
          loginId: "copilot_acceptance_" + role,
          password: runtime.password,
        })
      ).authToken;
      assert.ok(token);
    }
    await login();
    const configRoute = "system/v0/config/runtime/request";
    /** Commits each hold change through normal reviewed runtime governance. */
    async function policy(holdAll) {
      const proposed = await request(configRoute, {
        configurationType: "propertyConfiguration",
        configurationCode: "tenantProperties",
        reason: "Commit disposable retention policy",
        configuration: {
          copilot: {
            conversation: {
              retentionDays: 2,
              lifecycle: {
                enterprisePolicies: [
                  {
                    tenantCode: "default",
                    enterpriseCode: "default",
                    retentionDays: 2,
                    holdAll,
                    conversationCodes: [],
                  },
                ],
              },
            },
          },
        },
      });
      const activation = {
        activationRequestCode: proposed.code,
        reason: "Approve disposable retention policy",
      };
      await request(configRoute + "/approve", activation);
      await request(configRoute + "/activate", activation);
    }
    await policy(false);
    const root = "copilotApi/v0";
    const route = root + "/activity/acceptance-expired-conversation/retention";
    await login("reader");
    await request(
      route + "/preview",
      { reason: "Expired synthetic content" },
      403,
    );
    await login();
    const review = await request(route + "/preview", {
      reason: "Expired synthetic content",
    });
    assert.equal(review.maximumBatch, 1);
    let original = await request(route + "/begin", {
      reason: "Expired synthetic content",
      reviewDigest: review.reviewDigest,
      confirmed: true,
    });
    assert.equal(original.state, "PREPARED");
    assert.deepEqual(original.removed, { messages: 0, events: 0, turns: 0 });
    await runtime.restart();
    await login();
    assert.deepEqual(await request(route + "/inspect", {}), original);
    for (let step = 0; step < 7 && original.state !== "PURGED"; step++) {
      const command = {
        operationCode: original.operationCode,
        expectedRevision: original.revision,
      };
      const next = await request(route + "/advance", command);
      const delta = Object.keys(next.removed).reduce(
        (sum, key) => sum + next.removed[key] - original.removed[key],
        0,
      );
      assert.ok(delta >= 0 && delta <= 1);
      assert.ok(next.revision > original.revision);
      original = next;
      t.diagnostic(
        "RETENTION_PROGRESS " +
          JSON.stringify({
            state: original.state,
            revision: original.revision,
            removed: original.removed,
          }),
      );
      if (step === 0) {
        original = await request(route + "/stop", {
          operationCode: original.operationCode,
          expectedRevision: original.revision,
        });
        assert.equal(original.state, "STOPPED");
        assert.equal(original.removed.messages, 1);
        await runtime.restart();
        await login();
        assert.deepEqual(await request(route + "/inspect", {}), original);
        const resumeCommand = {
          operationCode: original.operationCode,
          expectedRevision: original.revision,
          reason: "Resume remaining synthetic content",
        };
        await policy(true);
        await request(route + "/resume-preview", resumeCommand, 409);
        await policy(false);
        const resumeReview = await request(
          route + "/resume-preview",
          resumeCommand,
        );
        original = await request(route + "/resume", {
          ...resumeCommand,
          reviewDigest: resumeReview.reviewDigest,
          confirmed: true,
        });
        assert.equal(original.state, "RESUMING");
        assert.equal(original.removed.messages, 1);
      }
    }
    assert.equal(original.state, "PURGED");
    assert.deepEqual(original.removed, { messages: 1, events: 1, turns: 1 });
    await runtime.restart();
    await login();
    assert.deepEqual(await request(route + "/inspect", {}), original);
    await policy(true);
    assert.deepEqual(await runtime.inspectRetentionFixture(), {
      parentCount: 1,
      state: "PURGED",
      titleCleared: true,
      messages: 0,
      events: 0,
      turns: 0,
      heldAudit: 1,
      expiredAudit: 1,
      uncertainAction: 1,
      expiredAction: 1,
    });
    const created = await request(root + "/conversations", {
      title: "Non-destructive closure",
    });
    const closeRoute =
      root +
      "/activity/" +
      created.conversation.conversationCode +
      "/retention";
    const closeReview = await request(closeRoute + "/close-preview", {
      reason: "Close synthetic conversation",
    });
    const closed = await request(closeRoute + "/close", {
      reason: "Close synthetic conversation",
      reviewDigest: closeReview.reviewDigest,
      confirmed: true,
    });
    assert.equal(closed.state, "CLOSURE_RECORDED");
    assert.deepEqual(await request(closeRoute + "/close-inspect", {}), closed);
    await request(
      closeRoute + "/preview",
      { reason: "Not expired and held" },
      409,
    );
    const auditRoute = root + "/activity/audit-retention";
    await login("reader");
    await request(
      auditRoute + "/preview",
      { kind: "TRANSCRIPT_ACCESS", reason: "Independent audit retention" },
      403,
    );
    await login();
    for (const kind of ["TRANSCRIPT_ACCESS", "ACTION"]) {
      const reason = "Independent synthetic " + kind + " retention";
      const auditReview = await request(auditRoute + "/preview", {
        kind,
        reason,
      });
      assert.equal(
        auditReview.count,
        1,
        "Content purge must preserve independent audit",
      );
      const command = {
        kind,
        reason,
        operationCode: auditReview.operationCode,
        cutoff: auditReview.cutoff,
        reviewDigest: auditReview.reviewDigest,
        confirmed: true,
      };
      const completed = await request(auditRoute + "/execute", command);
      assert.equal(completed.state, "COMPLETED");
      assert.equal(completed.removed, 1);
      await request(auditRoute + "/execute", command, 409);
      await runtime.restart();
      await login();
      assert.deepEqual(
        await request(auditRoute + "/inspect", {
          operationCode: completed.operationCode,
        }),
        completed,
      );
      assert.equal(
        (await request(auditRoute + "/preview", { kind, reason })).count,
        0,
        "Held receipts and uncertain actions must remain excluded",
      );
    }
    assert.deepEqual(await runtime.inspectRetentionFixture(), {
      parentCount: 1,
      state: "PURGED",
      titleCleared: true,
      messages: 0,
      events: 0,
      turns: 0,
      heldAudit: 1,
      expiredAudit: 0,
      uncertainAction: 1,
      expiredAction: 0,
    });
    t.diagnostic("REAL_RETENTION_BOUNDED_TRANSACTION_TOMBSTONE_RESTART_PASS");
  },
);
