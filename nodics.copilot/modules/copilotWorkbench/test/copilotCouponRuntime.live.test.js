/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module copilotWorkbench/test/copilotCouponRuntime
 * @description Qualifies employee coupon fulfillment and original receipt recovery against real Profile, Digital Core and Promotion owners.
 * @layer test
 * @owner copilotWorkbench
 * @sideEffects Redeems only a synthetic delivered coupon in private disposable storage; no payment or external POS is exercised.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

for (const scenario of ["normal", "response-loss", "secure-conversation"]) {
  test(
    "native coupon fulfillment preserves original receipts: " + scenario,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        withRegistration: true,
        withCouponActions: true,
        withOllama: scenario === "secure-conversation",
        withCouponResponseLoss: scenario === "response-loss",
      });
      t.after(() => runtime.close());
      const commerce = runtime.axisRuntimes.find(
        (item) => item.role === "COMMERCE",
      ).origin;
      let token;
      /** Sends one bounded request with the actual signed employee bearer. */
      async function request(
        path,
        body,
        expected = 200,
        origin = runtime.baseUrl,
      ) {
        const response = await fetch(origin + "/nodics/" + path, {
          method: body === undefined ? "GET" : "POST",
          redirect: "error",
          signal: AbortSignal.timeout(120000),
          headers: {
            "Content-Type": "application/json",
            "x-enterprise-code": "default",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const value = await response.json();
        if (response.status !== expected)
          t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
        assert.equal(response.status, expected, JSON.stringify(value));
        return value.data || value.result || value;
      }
      /** Authenticates through Profile, never a fabricated test bearer. */
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
      const input = {
        couponToken: "ACCEPTANCE-COUPON-SECRET",
        merchantReceiptReference: "acceptance-receipt",
      };
      await login("reader");
      await request("copilotApi/v0/coupons/prepare", input, 403);
      await login("foreign");
      assert.equal(
        (await request("profile/v0/identity/scopes/me")).scopes.length,
        0,
      );
      await request("copilotApi/v0/coupons/prepare", input, 400);
      await login();
      assert.ok(
        (await request("profile/v0/identity/scopes/me")).scopes.some(
          (scope) =>
            scope.scopeType === "ENTERPRISE" && scope.scopeCode === "default",
        ),
      );
      let conversation;
      if (scenario === "secure-conversation") {
        assert.equal(
          (await request("copilotApi/v0/providers/check", {})).state,
          "UP",
        );
        const created = await request("copilotApi/v0/conversations", {
          title: "Secure coupon acceptance",
        });
        conversation =
          "copilotApi/v0/conversations/" +
          created.conversation.conversationCode;
        const turn = await request(conversation + "/turns", {
          idempotencyKey: "acceptance-coupon-turn",
          message: 'Coupon code "' + input.couponToken + '" mark redeemed.',
        });
        assert.ok(!JSON.stringify(turn).includes(input.couponToken));
        assert.ok(
          !JSON.stringify(await request(conversation)).includes(
            input.couponToken,
          ),
        );
        assert.equal((await request("copilotApi/v0/usage")).totals.calls, 0);
      }
      const workspace = await request("copilotApi/v0/coupons/workspace");
      assert.equal(workspace.storeRequired, false);
      const prepared = await request("copilotApi/v0/coupons/prepare", input);
      const endpoint = "copilotApi/v0/confirmations/" + prepared.actionCode;
      assert.equal(prepared.confirmation.operationId, "commerce.coupon.redeem");
      assert.ok(!JSON.stringify(prepared).includes(input.couponToken));
      const proof = {
        expectedRevision: prepared.confirmation.revision,
        argumentsDigest: prepared.confirmation.argumentsDigest,
      };
      const approved = await request(endpoint + "/approve", proof);
      const queuePath = "digitalCore/v0/merchant/redemptions";
      assert.deepEqual(
        (await request(queuePath, undefined, 200, commerce)).redemptions,
        [],
      );
      await request(endpoint + "/execute", proof, 409);
      const execution = await request(endpoint + "/execute", {
        ...proof,
        expectedRevision: approved.confirmation.revision,
      });
      if (scenario === "normal" && execution.state !== "CONSUMED")
        t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
      assert.equal(
        execution.state,
        scenario === "response-loss" ? "OUTCOME_UNKNOWN" : "CONSUMED",
        JSON.stringify(execution),
      );
      const queue = await request(queuePath, undefined, 200, commerce);
      assert.equal(queue.redemptions.length, 1);
      assert.equal(queue.redemptions[0].claimStatus, "REDEEMED");
      assert.equal(
        queue.redemptions[0].merchantReceiptReference,
        input.merchantReceiptReference,
      );
      assert.ok(queue.redemptions[0].receiptCode);
      assert.ok(!JSON.stringify(queue).includes(input.couponToken));
      await runtime.restart();
      await runtime.restartAxisRuntime("COMMERCE");
      await login();
      if (conversation) {
        assert.ok(
          !JSON.stringify(await request(conversation)).includes(
            input.couponToken,
          ),
        );
        assert.equal((await request("copilotApi/v0/usage")).totals.calls, 0);
      }
      if (scenario === "response-loss") {
        assert.equal(
          (await request(endpoint)).confirmation.state,
          "OUTCOME_UNKNOWN",
        );
        const restored = await request(endpoint + "/coupon-receipt", {
          ...proof,
          expectedRevision: execution.revision,
        });
        assert.equal(
          restored.receiptState,
          "COMPLETED",
          JSON.stringify(restored),
        );
        assert.equal(restored.confirmation.state, "CONSUMED");
      }
      assert.equal((await request(endpoint)).confirmation.state, "CONSUMED");
      assert.deepEqual(
        await request(queuePath, undefined, 200, commerce),
        queue,
      );
      const diagnostics = runtime.runtimeDiagnostics().diagnostics;
      assert.equal(
        diagnostics.filter((item) => item.code === "COUPON_NATIVE_COMPLETED")
          .length,
        1,
      );
      assert.equal(
        diagnostics.filter((item) => item.code === "COUPON_RESPONSE_LOST")
          .length,
        scenario === "response-loss" ? 1 : 0,
      );
      t.diagnostic("REAL_COUPON_FULFILLMENT_AND_RESTART_PASS " + scenario);
    },
  );
}
