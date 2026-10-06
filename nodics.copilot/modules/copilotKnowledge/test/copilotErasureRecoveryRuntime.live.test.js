/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotErasureRecoveryRuntime
 * @description Loses real provider or durable journal acknowledgements and proves authenticated original-result recovery, no replay and restart persistence.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("./helpers/runtimeAcceptance/runtimeFixture");

for (const scenario of ["PROVIDER", "STARTED", "ERASED", "UUID"])
  test(
    "real erasure fault at " +
      scenario +
      " preserves original evidence without replay",
    {
      skip: process.env.NODICS_COPILOT_RUNTIME_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        erasureEnabled: true,
        withDeleteResponseLoss: true,
        journalResponseLoss: ["STARTED", "ERASED"].includes(scenario)
          ? scenario
          : null,
      });
      t.after(() => runtime.close());
      let token;
      /** Sends one authenticated command without transport retry. */
      async function request(path, body, expected = 200) {
        const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
          method: "POST",
          signal: AbortSignal.timeout(60000),
          headers: {
            "Content-Type": "application/json",
            "x-enterprise-code": "default",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify(body),
        });
        const result = await response.json();
        assert.equal(
          response.status,
          expected,
          JSON.stringify({ result, diagnostics: runtime.diagnostics }),
        );
        return result.data || result.result || result;
      }
      /** Acquires a fresh Profile session in the owned runtime. */
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
      await request("copilotApi/v0/knowledge/sources/acceptance/refresh", {});
      const migration = "copilotApi/v0/knowledge/migrations/acceptance/";
      const reviewed = await request(migration + "preview", {});
      assert.equal(
        (
          await request(migration + "retire", {
            confirmed: true,
            reviewDigest: reviewed.reviewDigest,
          })
        ).state,
        "RETIRED",
      );
      await runtime.target.revoke();
      const review = await request(migration + "erasure-preview", {});
      assert.equal(review.state, "REVIEWED");
      if (scenario === "PROVIDER") runtime.fault.arm();
      if (scenario === "UUID") await runtime.target.recreate();
      const command = { confirmed: true, reviewDigest: review.reviewDigest };
      const failed = await request(migration + "erase", command, 503);
      assert.equal(failed.code, "ERR_CPK_00025");
      assert.deepEqual(runtime.fault.evidence(), {
        deletedRequests: ["STARTED", "UUID"].includes(scenario) ? 0 : 1,
        droppedResponses: scenario === "PROVIDER" ? 1 : 0,
      });
      /** Recovers only durably recorded success; physical absence alone never proves it. */
      async function inspectOriginal() {
        if (scenario === "UUID") {
          const refused = await request(migration + "erasure-inspect", {}, 503);
          assert.equal(refused.code, "ERR_CPK_00025");
          assert.ok(
            !JSON.stringify(refused).includes(
              runtime.target.identity.physicalName,
            ),
          );
          const physical = await runtime.target.inspectIdentity();
          assert.notEqual(physical.uuid, runtime.target.identity.uuid);
          assert.equal(physical.blocked, true);
          return;
        }
        const original = await request(migration + "erasure-inspect", {});
        assert.equal(
          original.state,
          scenario === "ERASED" ? "ERASED" : "OUTCOME_UNKNOWN",
        );
        assert.equal(original.physicalCleanupComplete, scenario === "ERASED");
        assert.equal(
          original.retainedLegacyData,
          scenario === "ERASED" ? false : null,
        );
        assert.doesNotMatch(
          JSON.stringify(original),
          /indexName|writerApiKeyIds|reviewDigest|password/,
        );
      }
      await inspectOriginal();
      await request(migration + "erase", command, 503);
      await runtime.target.replacementEvidence();
      await runtime.restartReadOnly();
      await login();
      await inspectOriginal();
      await request(migration + "erase", command, 503);
      assert.deepEqual(runtime.fault.evidence(), {
        deletedRequests: ["STARTED", "UUID"].includes(scenario) ? 0 : 1,
        droppedResponses: scenario === "PROVIDER" ? 1 : 0,
      });
      if (["STARTED", "ERASED"].includes(scenario))
        assert.equal(
          runtime.diagnostics.filter(
            (entry) =>
              entry.code === "ERASURE_JOURNAL_RESPONSE_LOST" &&
              entry.state === scenario,
          ).length,
          1,
        );
      t.diagnostic(
        scenario === "UUID"
          ? "REAL_UUID_REBIND_REFUSAL_AND_GATE_DISABLED_RESTART_PASS"
          : "REAL_" + scenario + "_ACK_LOSS_AND_GATE_DISABLED_RESTART_NO_RETRY_PASS",
      );
    },
  );
