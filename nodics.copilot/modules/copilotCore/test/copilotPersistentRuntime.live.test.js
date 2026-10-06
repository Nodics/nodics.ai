/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotPersistentRuntime
 * @description Real Profile HTTP, local Ollama, published knowledge and persistent conversation/accounting acceptance on the disposable framework runtime.
 * @layer test @owner copilotCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "local Ollama conversation, citations and measured usage persist across runtime restart",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withOllama: true,
      withActivity: true,
      withGroups: true,
      withIncremental: true,
    });
    t.after(() => runtime.close());
    let token;
    let enterprise = "default";
    /** Calls one real route without retry and exposes only synthetic fixture responses on assertion failure. */
    async function request(path, body, expectedStatus = 200) {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        method: body === undefined ? "GET" : "POST",
        signal: AbortSignal.timeout(120000),
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-code": enterprise,
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const result = await response.json();
      assert.equal(
        response.status,
        expectedStatus,
        JSON.stringify({ result, diagnostics: runtime.diagnostics }),
      );
      return result.data || result.result || result;
    }
    /** Reauthenticates using Profile after startup without copying claims or security context. */
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
    await login();
    const root = "copilotApi/v0";
    const health = await request(root + "/providers/check", {});
    assert.equal(health.state, "UP");
    const firstRefresh = await request(
      root + "/knowledge/sources/acceptance/refresh",
      {},
    );
    const unchangedRefresh = await request(
      root + "/knowledge/sources/acceptance/refresh",
      {},
    );
    assert.equal(firstRefresh.chunksWritten, 1);
    assert.equal(unchangedRefresh.chunksWritten, 0);
    assert.equal(unchangedRefresh.publication.unchanged, true);
    assert.equal(
      unchangedRefresh.publication.generation,
      firstRefresh.publication.generation,
    );
    t.diagnostic(
      "REAL_UNCHANGED_INCREMENTAL_REFRESH_REUSES_VERIFIED_GENERATION_PASS",
    );
    const migration = root + "/knowledge/migrations/acceptance/";
    const retirement = await request(migration + "preview", {});
    assert.equal(
      (
        await request(migration + "retire", {
          confirmed: true,
          reviewDigest: retirement.reviewDigest,
        })
      ).state,
      "RETIRED",
    );
    const disabledErasure = await request(
      migration + "erasure-preview",
      {},
      503,
    );
    assert.equal(disabledErasure.code, "ERR_CPK_00025");
    await runtime.target.revoke();
    await runtime.restartErasureEnabled();
    await login();
    const erasure = await request(migration + "erasure-preview", {});
    assert.equal(
      (
        await request(migration + "erase", {
          confirmed: true,
          reviewDigest: erasure.reviewDigest,
        })
      ).state,
      "ERASED",
    );
    await runtime.target.replacementEvidence();
    t.diagnostic("STAGED_ERASURE_GATE_AFTER_NATIVE_WRITER_QUALIFICATION_PASS");
    const created = await request(root + "/conversations", {
      title: "Synthetic persistent acceptance",
    });
    assert.ok(created.conversation?.conversationCode, JSON.stringify(created));
    const conversation =
      root + "/conversations/" + created.conversation.conversationCode;
    const command = {
      message:
        "According to acceptance knowledge, what is the acceptance collection colour? Reply in one sentence.",
      idempotencyKey: "persistent-acceptance-turn",
    };
    const turn = await request(conversation + "/turns", command);
    assert.equal(turn.turn?.state, "COMPLETED", JSON.stringify(turn));
    assert.ok(
      turn.citations?.length > 0,
      "Actual published source citation required",
    );
    const events = await request(
      conversation + "/turns/" + turn.turn.turnCode + "/events",
    );
    t.diagnostic("REAL_REPLACEMENT_RETRIEVAL_AFTER_LEGACY_ERASURE_PASS");
    assert.ok(
      events.items?.some(
        (item) =>
          item.eventType === "TEXT_DELTA" &&
          /green/i.test(item.data?.text || ""),
      ),
      JSON.stringify(events),
    );
    const usage = await request(root + "/usage");
    assert.equal(usage.state, "AVAILABLE");
    assert.equal(usage.totals.calls, 1);
    assert.ok(usage.totals.consumed > 0);
    assert.equal(usage.totals.reserved, 0);
    assert.equal(usage.items[0].state, "MEASURED");
    const duplicate = await request(conversation + "/turns", command);
    assert.equal(
      duplicate.turn.turnCode,
      turn.turn.turnCode,
      "Idempotency must preserve the original turn",
    );
    assert.deepEqual(
      (await request(root + "/usage")).totals,
      usage.totals,
      "Replaying a completed turn must not bill twice",
    );
    const activityPath =
      root + "/activity/" + created.conversation.conversationCode;
    await request(root + "/activity", undefined, 403);
    await login("metadata");
    const metadata = await request(root + "/activity");
    assert.ok(
      metadata.items.some(
        (item) =>
          item.conversationCode === created.conversation.conversationCode,
      ),
    );
    assert.ok(!JSON.stringify(metadata).includes(command.message));
    assert.ok(
      !JSON.stringify(metadata).includes("Synthetic persistent acceptance"),
    );
    assert.equal(metadata.inspection, null);
    await request(
      activityPath + "/transcript",
      { purpose: "QUALITY_REVIEW" },
      403,
    );
    await login("reviewer");
    const transcript = await request(activityPath + "/transcript", {
      purpose: "QUALITY_REVIEW",
      page: 1,
    });
    assert.match(transcript.accessReceipt, /^cta-/);
    assert.ok(
      transcript.items.some((item) =>
        item.messages.some((message) => message.content === command.message),
      ),
    );
    assert.ok(
      transcript.items.every((item) =>
        item.messages.every((message) =>
          ["user", "assistant"].includes(message.role),
        ),
      ),
    );
    const repeatedInspection = await request(activityPath + "/transcript", {
      purpose: "QUALITY_REVIEW",
      page: 1,
    });
    assert.notEqual(
      repeatedInspection.accessReceipt,
      transcript.accessReceipt,
      "Every sensitive read must have its own receipt",
    );
    await login("foreign");
    assert.equal((await request(root + "/activity")).items.length, 0);
    await request(
      activityPath + "/transcript",
      { purpose: "QUALITY_REVIEW" },
      403,
    );
    t.diagnostic(
      "REAL_ADMIN_METADATA_TRANSCRIPT_AUDIT_AND_ENTERPRISE_ISOLATION_PASS",
    );
    await login("nosource");
    const deniedConversation = await request(root + "/conversations", {
      title: "Denied knowledge",
    });
    const deniedRoot =
      root +
      "/conversations/" +
      deniedConversation.conversation.conversationCode;
    const deniedTurn = await request(deniedRoot + "/turns", {
      ...command,
      idempotencyKey: "denied-source-turn",
    });
    assert.equal(deniedTurn.insufficientEvidence, true);
    assert.deepEqual(deniedTurn.citations, []);
    assert.equal((await request(root + "/usage")).totals.calls, 0);
    await login();
    const emptySelection = await request(conversation + "/turns", {
      ...command,
      idempotencyKey: "empty-group-turn",
      knowledgeGroupCodes: [],
    });
    assert.equal(emptySelection.insufficientEvidence, true);
    assert.deepEqual(emptySelection.citations, []);
    assert.deepEqual((await request(root + "/usage")).totals, usage.totals);
    t.diagnostic(
      "REAL_DENIED_SOURCE_AND_EMPTY_GROUP_RETRIEVAL_WITHOUT_PROVIDER_CALL_PASS",
    );
    await login("reader");
    await request(conversation + "/history", undefined, 404);
    await request(root + "/usage?scope=ENTERPRISE", undefined, 403);
    const readerConversation = await request(root + "/conversations", {
      title: "Synthetic exhausted allocation",
    });
    const exhausted = await request(
      root +
        "/conversations/" +
        readerConversation.conversation.conversationCode +
        "/turns",
      command,
      429,
    );
    assert.equal(exhausted.code, "ERR_CPP_00003");
    const readerUsage = await request(root + "/usage");
    assert.equal(
      readerUsage.totals.calls,
      0,
      "Exhausted allocation cannot dispatch a model call",
    );
    t.diagnostic(
      JSON.stringify({
        checkpoint: "OLLAMA_CITATIONS_BUDGET_AND_ISOLATION",
        measuredTokens: usage.totals.consumed,
        duplicateCalls: 0,
        deniedReaderCalls: readerUsage.totals.calls,
      }),
    );
    await runtime.restartReadOnly();
    await login();
    const history = await request(conversation + "/history");
    assert.ok(
      JSON.stringify(history).includes(turn.turn.turnCode),
      "Original persisted turn must survive restart",
    );
    const after = await request(root + "/usage");
    assert.deepEqual(
      after.totals,
      usage.totals,
      "Restart must not consume or lose usage",
    );
    assert.deepEqual(
      after.items,
      usage.items,
      "Original provider calls must remain persisted",
    );
    t.diagnostic("PERSISTENT_CONVERSATION_AND_ACCOUNTING_RESTART_PASS");
    await runtime.restartGroupCeiling(true);
    await login();
    const excludedTurn = await request(conversation + "/turns", {
      ...command,
      idempotencyKey: "enterprise-source-excluded",
    });
    assert.equal(excludedTurn.insufficientEvidence, true);
    assert.deepEqual(excludedTurn.citations, []);
    assert.deepEqual((await request(root + "/usage")).totals, usage.totals);
    await runtime.restartGroupCeiling(false);
    t.diagnostic(
      "REAL_ENTERPRISE_SOURCE_CEILING_REVOCATION_PREVENTS_RETRIEVAL_PASS",
    );
    await runtime.restartRecordingOff();
    await login();
    const privateTitle = "Acceptance unrecorded transcript title";
    const privateMessage =
      "Acceptance unrecorded question: what is the acceptance collection colour?";
    const unrecorded = await request(root + "/conversations", {
      title: privateTitle,
    });
    const privateConversation =
      root + "/conversations/" + unrecorded.conversation.conversationCode;
    const privateCommand = {
      message: privateMessage,
      idempotencyKey: "unrecorded-acceptance-turn",
    };
    const privateTurn = await request(
      privateConversation + "/turns",
      privateCommand,
    );
    assert.equal(privateTurn.turn.state, "COMPLETED");
    assert.equal(privateTurn.delivery?.mode, "REQUEST_ONLY");
    assert.ok(
      privateTurn.delivery.events.some(
        (event) =>
          event.eventType === "TEXT_DELTA" &&
          /green/i.test(event.data?.text || ""),
      ),
      "Unrecorded answer must still reach the requesting user",
    );
    /** Checks owner-provided history without exposing the transcript or raw persistence credentials. */
    async function assertUnrecorded() {
      const retained = await request(privateConversation + "/history");
      assert.equal(retained.items[0].messages.length, 0);
      assert.equal(retained.items[0].turn.recording.enabled, false);
      assert.ok(!JSON.stringify(retained).includes(privateTitle));
      assert.ok(!JSON.stringify(retained).includes(privateMessage));
      const replay = await request(
        privateConversation + "/turns/" + privateTurn.turn.turnCode + "/events",
      );
      assert.ok(
        !replay.items.some(
          (event) => event.eventType === "TEXT_DELTA" && event.data?.text,
        ),
      );
    }
    await assertUnrecorded();
    await login("reviewer");
    const unrecordedInspection = await request(
      root +
        "/activity/" +
        unrecorded.conversation.conversationCode +
        "/transcript",
      { purpose: "QUALITY_REVIEW" },
    );
    assert.ok(
      unrecordedInspection.items.every(
        (item) => item.recorded === false && item.messages.length === 0,
      ),
    );
    assert.ok(!JSON.stringify(unrecordedInspection).includes(privateMessage));
    await login();
    const offUsage = await request(root + "/usage");
    assert.equal(offUsage.totals.calls, 2);
    assert.ok(offUsage.totals.consumed > usage.totals.consumed);
    const privateDuplicate = await request(
      privateConversation + "/turns",
      privateCommand,
    );
    assert.equal(privateDuplicate.turn.turnCode, privateTurn.turn.turnCode);
    assert.equal(privateDuplicate.delivery.events.length, 0);
    await runtime.restartReadOnly();
    await login();
    await assertUnrecorded();
    assert.deepEqual((await request(root + "/usage")).totals, offUsage.totals);
    t.diagnostic(
      "RECORDING_OFF_REQUEST_ONLY_DELIVERY_AND_ACCOUNTING_RESTART_PASS",
    );
  },
);
