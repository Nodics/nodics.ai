/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotErasureRuntime
 * @description Opt-in real Profile HTTP, Copilot publication and erasure acceptance on disposable secured providers. Browser acceptance is separate.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const fixture = require("./helpers/runtimeAcceptance/runtimeFixture");

test(
  "authenticated Copilot publishes replacements, retires and erases once with durable restart inspection",
  {
    skip: process.env.NODICS_COPILOT_RUNTIME_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({ erasureEnabled: true });
    t.after(async () => {
      await runtime.close();
      const evidence = runtime.evidence();
      assert.equal(evidence.cleanup.finalized, true);
      assert.ok(
        evidence.cleanup.resources.every((item) => item.state === "CLOSED"),
      );
      assert.equal(fs.existsSync(evidence.compositionRoot), false);
      assert.equal(fs.existsSync(evidence.provider.root), false);
      const output = process.env.NODICS_COPILOT_EVIDENCE_FILE;
      if (output) {
        assert.ok(path.isAbsolute(output) && output.endsWith(".json"));
        fs.writeFileSync(
          output,
          JSON.stringify(
            {
              observedAt: new Date().toISOString(),
              evidenceClass: "OWNED_RUNTIME_RESOURCE_LEDGER",
              ...evidence,
            },
            null,
            2,
          ) + "\n",
          { mode: 0o600 },
        );
      }
    });
    /** Calls a real registered HTTP endpoint; tokens and credentials are never logged. */
    async function request(path, body, token, enterprise = "default") {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        signal: AbortSignal.timeout(60000),
        method: body === undefined ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-code": enterprise,
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const result = await response.json();
      return { status: response.status, result };
    }
    /** Signs in through Profile rather than constructing an employee security context. */
    async function login(role) {
      const enterprise =
        role === "foreign" ? "copilot_acceptance_foreign" : "default";
      const response = await request(
        "profile/v0/employee/authenticate",
        {
          loginId: "copilot_acceptance_" + role,
          password: runtime.password,
        },
        undefined,
        enterprise,
      );
      assert.equal(response.status, 200, JSON.stringify(response.result));
      assert.ok(
        response.result.result?.authToken,
        "Profile must issue the session",
      );
      return response.result.result.authToken;
    }
    let token = await login("operator");
    const reader = await login("reader");
    const foreign = await login("foreign");
    const noerase = await login("noerase");
    const nosource = await login("nosource");
    const migration = "copilotApi/v0/knowledge/migrations/acceptance/";
    for (const [name, actor, enterprise] of [
      ["foreign enterprise", foreign, "copilot_acceptance_foreign"],
      ["missing source grant", nosource, "default"],
      ["missing erasure grant", noerase, "default"],
    ]) {
      const refusal = await request(
        migration + "erasure-preview",
        {},
        actor,
        enterprise,
      );
      assert.notEqual(refusal.status, 200, name + " cannot review erasure");
      assert.doesNotMatch(
        JSON.stringify(refusal.result),
        /erasure-[a-f0-9-]+-legacy|writerApiKeyIds|reviewDigest/,
      );
    }
    assert.equal(
      (await request("copilotApi/v0/knowledge/sources", undefined, nosource))
        .status,
      403,
    );
    const denied = await request(migration + "erasure-preview", {}, reader);
    assert.notEqual(
      denied.status,
      200,
      "read-only actor cannot review removal",
    );
    const beforePublication = await request(migration + "preview", {}, token);
    assert.notEqual(
      beforePublication.status,
      200,
      "unpublished replacements cannot qualify retirement",
    );
    const refresh = await request(
      "copilotApi/v0/knowledge/sources/acceptance/refresh",
      {},
      token,
    );
    assert.equal(
      refresh.status,
      200,
      JSON.stringify({
        result: refresh.result,
        diagnostics: runtime.diagnostics,
      }),
    );
    t.diagnostic("REAL_PROFILE_AND_SOURCE_REFRESH_PASS");
    let review = await request(migration + "preview", {}, token);
    assert.equal(review.status, 200, JSON.stringify(review.result));
    assert.match(
      review.result.data?.reviewDigest || "",
      /^[a-f0-9]{64}$/,
      JSON.stringify(review.result),
    );
    const cancelled = await request(migration + "inspect", {}, token);
    assert.equal(
      cancelled.result.data.state,
      "NOT_STARTED",
      "review alone must not retire",
    );
    const stale = await request(
      migration + "retire",
      { confirmed: true, reviewDigest: "0".repeat(64) },
      token,
    );
    assert.notEqual(stale.status, 200, "unbound review cannot retire");
    const readerMutation = await request(
      migration + "retire",
      { confirmed: true, reviewDigest: review.result.data.reviewDigest },
      reader,
    );
    assert.notEqual(
      readerMutation.status,
      200,
      "read-only actor cannot mutate with another actor's review",
    );
    await runtime.restartSourceAccess(true);
    token = await login("operator");
    const revokedReview = await request(
      migration + "retire",
      {
        confirmed: true,
        reviewDigest: review.result.data.reviewDigest,
      },
      token,
    );
    assert.notEqual(
      revokedReview.status,
      200,
      "Real source policy revocation must invalidate prior review authority",
    );
    await runtime.restartSourceAccess(false);
    token = await login("operator");
    const afterRevocation = await request(migration + "inspect", {}, token);
    assert.equal(
      afterRevocation.result.data.state,
      "NOT_STARTED",
      "Policy drift must not create a retirement claim",
    );
    review = await request(migration + "preview", {}, token);
    assert.equal(review.status, 200, JSON.stringify(review.result));
    t.diagnostic("REAL_SOURCE_POLICY_REVOCATION_REFUSES_STALE_REVIEW_PASS");
    const retired = await request(
      migration + "retire",
      { confirmed: true, reviewDigest: review.result.data.reviewDigest },
      token,
    );
    assert.equal(retired.status, 200, JSON.stringify(retired.result));
    assert.equal(retired.result.data.state, "RETIRED");
    assert.equal(retired.result.data.retainedLegacyData, true);
    const activeWriter = await request(
      migration + "erasure-preview",
      {},
      token,
    );
    assert.notEqual(activeWriter.status, 200, "active writer blocks erasure");
    await runtime.target.revoke();
    const removal = await request(migration + "erasure-preview", {}, token);
    assert.equal(removal.status, 200, JSON.stringify(removal.result));
    const beforeRemoval = await request(
      migration + "erasure-inspect",
      {},
      token,
    );
    assert.equal(
      beforeRemoval.result.data.state,
      "NOT_STARTED",
      "review alone must not erase",
    );
    const unconfirmed = await request(
      migration + "erase",
      { confirmed: false, reviewDigest: removal.result.data.reviewDigest },
      token,
    );
    assert.notEqual(
      unconfirmed.status,
      200,
      "explicit confirmation is mandatory",
    );
    const erased = await request(
      migration + "erase",
      { confirmed: true, reviewDigest: removal.result.data.reviewDigest },
      token,
    );
    assert.equal(erased.status, 200, JSON.stringify(erased.result));
    assert.equal(erased.result.data.state, "ERASED");
    assert.equal(erased.result.data.physicalCleanupComplete, true);
    const foreignAfter = await request(
      migration + "erasure-inspect",
      {},
      await login("foreign"),
      "copilot_acceptance_foreign",
    );
    assert.notEqual(
      foreignAfter.status,
      200,
      "Foreign enterprise cannot inspect a completed receipt",
    );
    assert.doesNotMatch(
      JSON.stringify(foreignAfter.result),
      /ERASED|physicalCleanupComplete|reviewDigest/,
    );
    const duplicate = await request(
      migration + "erase",
      { confirmed: true, reviewDigest: removal.result.data.reviewDigest },
      token,
    );
    assert.notEqual(
      duplicate.status,
      200,
      "a completed command cannot be replayed even while gates are enabled",
    );
    await runtime.target.replacementEvidence();
    await runtime.restartReadOnly();
    token = await login("operator");
    const original = await request(migration + "erasure-inspect", {}, token);
    assert.equal(original.status, 200, JSON.stringify(original.result));
    assert.equal(original.result.data.state, "ERASED");
    const replay = await request(
      migration + "erase",
      { confirmed: true, reviewDigest: removal.result.data.reviewDigest },
      token,
    );
    assert.notEqual(replay.status, 200);
    t.diagnostic("AUTHENTICATED_ERASURE_AND_RUNTIME_RESTART_PASS");
  },
);
