/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/test/copilotPriceRuntime
 * @description Qualifies standalone price preparation and native Staged persistence using actual employee authority and private receipts.
 * @layer test @owner copilotWorkbench
 * @sideEffects Creates only synthetic records in owned disposable databases; never publishes a customer price.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

for (const scenario of ["normal", "response-loss", "natural-language"])
  test(
    "real employee standalone price creation uses native Staged authority and survives restart: " +
      scenario,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        withRegistration: true,
        withPriceActions: true,
        withOllama: scenario === "natural-language",
        priceResponseLossCode:
          scenario === "response-loss" ? "acceptance_price" : null,
      });
      t.after(() => runtime.close());
      const native = runtime.axisRuntimes.find(
        (item) => item.role === "COMMERCE_STAGED",
      ).origin;
      let token;
      /** Invokes a fixed acceptance endpoint once, preserving the employee credential. */
      async function request(
        path,
        body,
        expected = 200,
        origin = runtime.baseUrl,
        method = body === undefined ? "GET" : "POST",
      ) {
        const response = await fetch(origin + "/nodics/" + path, {
          method,
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
      /** Signs in through the real Profile owner. */
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
      const row = {
        code: "acceptance_price",
        priceBookCode: "acceptance_book",
        productCode: "acceptance_product",
        unitAmount: "12.50",
        currency: "AED",
        minQuantity: "1",
      };
      const input = {
        operation: "commerce.price.create",
        prices:
          scenario === "response-loss"
            ? [row, { ...row, code: "acceptance_price_two" }]
            : [row],
      };
      await login("reader");
      await request("copilotApi/v0/prices/prepare", input, 403);
      await request("pricing/v0/pricerow/safe-search", {}, 403, native);
      await login();
      const missing = await request("copilotApi/v0/prices/prepare", {
        operation: input.operation,
      });
      assert.equal(missing.plan.state, "CLARIFICATION_REQUIRED");
      await request(
        "copilotApi/v0/prices/prepare",
        { ...input, prices: [{ ...input.prices[0], unitAmount: 12.5 }] },
        400,
      );
      const capabilities = await request(
        "pricing/v0/pricerow/capabilities",
        undefined,
        200,
        native,
      );
      assert.equal(capabilities.authoring.stage, "STAGED");
      assert.ok(capabilities.operations.includes("create"));
      assert.equal(
        (await request("pricing/v0/pricerow/safe-search", {}, 200, native))
          .totalCount,
        0,
      );
      let prepared;
      if (scenario === "natural-language") {
        const created = await request("copilotApi/v0/conversations", {
          title: "Owned price acceptance",
        });
        const path =
          "copilotApi/v0/conversations/" +
          created.conversation.conversationCode +
          "/turns";
        const turnInput = {
          idempotencyKey: "price-language-turn",
          message:
            "Create price row with code acceptance_price, priceBookCode acceptance_book, productCode acceptance_product, unitAmount 12.50, currency AED, minQuantity 1.",
        };
        const turn = await request(path, turnInput);
        assert.equal(
          turn.confirmation?.operationId,
          input.operation,
          JSON.stringify(turn),
        );
        prepared = {
          actionCode: turn.confirmation.confirmationCode,
          confirmation: turn.confirmation,
        };
        const usage = await request("copilotApi/v0/usage");
        assert.equal(usage.totals.calls, 1);
        assert.ok(usage.totals.consumed > 0);
        await request(path, turnInput);
        assert.deepEqual(
          (await request("copilotApi/v0/usage")).totals,
          usage.totals,
        );
      } else prepared = await request("copilotApi/v0/prices/prepare", input);
      assert.equal(
        (await request("pricing/v0/pricerow/safe-search", {}, 200, native))
          .totalCount,
        0,
      );
      const endpoint = "copilotApi/v0/confirmations/" + prepared.actionCode;
      const proof = {
        expectedRevision: prepared.confirmation.revision,
        argumentsDigest: prepared.confirmation.argumentsDigest,
      };
      const approved = await request(endpoint + "/approve", proof);
      assert.equal(
        (await request("pricing/v0/pricerow/safe-search", {}, 200, native))
          .totalCount,
        0,
      );
      await request(endpoint + "/execute", proof, 409);
      let execution = await request(endpoint + "/execute", {
        ...proof,
        expectedRevision: approved.confirmation.revision,
      });
      if (scenario === "response-loss") {
        assert.equal(execution.state, "OUTCOME_UNKNOWN");
        assert.deepEqual(
          execution.rows.map((item) => item.state),
          ["OUTCOME_UNKNOWN", "NOT_STARTED"],
        );
        assert.equal(
          (await request("pricing/v0/pricerow/safe-search", {}, 200, native))
            .totalCount,
          1,
        );
        await runtime.restart();
        await login();
        assert.equal(
          (await request(endpoint)).confirmation.state,
          "OUTCOME_UNKNOWN",
        );
        const restored = await request(endpoint + "/original-results", {
          ...proof,
          expectedRevision: execution.revision,
        });
        assert.equal(restored.confirmation.state, "PENDING");
        assert.deepEqual(
          restored.confirmation.outcomes.map((item) => item.state),
          ["COMPLETED", "NOT_STARTED"],
        );
        assert.equal(
          (await request("pricing/v0/pricerow/safe-search", {}, 200, native))
            .totalCount,
          1,
        );
        const continuation = {
          argumentsDigest: restored.confirmation.argumentsDigest,
          expectedRevision: restored.confirmation.revision,
        };
        const renewed = await request(endpoint + "/approve", continuation);
        execution = await request(endpoint + "/execute", {
          ...continuation,
          expectedRevision: renewed.confirmation.revision,
        });
      }
      if (execution.state !== "CONSUMED")
        t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
      assert.equal(execution.state, "CONSUMED", JSON.stringify(execution));
      assert.equal(execution.rows[0].state, "COMPLETED");
      const rows = await request(
        "pricing/v0/pricerow/safe-search",
        {},
        200,
        native,
      );
      assert.equal(rows.totalCount, input.prices.length);
      assert.equal(rows.records.length, input.prices.length);
      for (const price of input.prices) {
        const saved = rows.records.find((item) => item.code === price.code);
        for (const [key, value] of Object.entries(price))
          assert.equal(saved[key], value);
        assert.equal(saved.enterpriseCode, "default");
        assert.equal(saved.tenant, "default");
      }
      assert.equal(
        runtime
          .runtimeDiagnostics()
          .diagnostics.filter((item) => item.code === "PRICE_NATIVE_COMPLETED")
          .length,
        input.prices.length,
      );
      assert.equal(
        runtime
          .runtimeDiagnostics()
          .diagnostics.filter((item) => item.code === "PRICE_RESPONSE_LOST")
          .length,
        scenario === "response-loss" ? 1 : 0,
      );
      const original = await request(endpoint);
      await runtime.restart();
      await runtime.restartAxisRuntime("COMMERCE_STAGED");
      await login();
      assert.deepEqual(await request(endpoint), original);
      assert.deepEqual(
        await request("pricing/v0/pricerow/safe-search", {}, 200, native),
        rows,
      );
      t.diagnostic(
        "REAL_STAGED_PRICE_PERSISTENCE_AND_RESTART_PASS " + scenario,
      );
    },
  );
