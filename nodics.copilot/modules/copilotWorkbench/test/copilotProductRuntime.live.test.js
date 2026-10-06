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
 * @module copilotWorkbench/test/copilotProductRuntime
 * @description Qualifies reviewed Product and Pricing authoring across native owners with real employee authority.
 * @layer test
 * @owner copilotWorkbench
 * @sideEffects Creates only synthetic drafts in owned disposable databases. Does not publish or activate catalogue content.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

for (const scenario of ["normal", "response-loss", "natural-language"]) {
  test(
    "real employee product plus price authoring survives native owner restart: " +
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
          scenario === "response-loss" ? "acceptance_product-001-PRICE" : null,
      });
      t.after(() => runtime.close());
      const native = runtime.axisRuntimes.find(
        (item) => item.role === "COMMERCE_STAGED",
      ).origin;
      let token;
      /** Calls one fixed owner endpoint with the actual employee credential. */
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
      /** Authenticates through native Profile, never a fabricated execution context. */
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
      /** Reads current draft counts through each independently permissioned native owner. */
      async function counts() {
        return [
          (await request("product/v0/product/safe-search", {}, 200, native))
            .totalCount,
          (await request("pricing/v0/pricerow/safe-search", {}, 200, native))
            .totalCount,
        ];
      }
      const input = {
        count: scenario === "response-loss" ? 2 : 1,
        name: "Acceptance product",
        codePrefix: "acceptance_product",
        catalogVersion: "acceptance_catalogue",
        priceBookCode: "acceptance_book",
        currency: "AED",
        price: "12.50",
        active: false,
      };
      await login("reader");
      await request("copilotApi/v0/products/prepare", input, 403);
      await request("product/v0/product/safe-search", {}, 403, native);
      await login();
      const missing = await request("copilotApi/v0/products/prepare", {
        count: 1,
      });
      assert.equal(missing.plan.state, "CLARIFICATION_REQUIRED");
      const invalid = await request("copilotApi/v0/products/prepare", {
        ...input,
        currency: "invalid",
      });
      assert.notEqual(invalid.plan.state, "VALIDATED");
      const capabilities = await request(
        "product/v0/product/capabilities",
        undefined,
        200,
        native,
      );
      assert.equal(capabilities.authoring.stage, "STAGED");
      assert.ok(capabilities.operations.includes("create"));
      assert.deepEqual(await counts(), [0, 0]);
      let prepared;
      if (scenario === "natural-language") {
        const created = await request("copilotApi/v0/conversations", {
          title: "Owned product acceptance",
        });
        const path =
          "copilotApi/v0/conversations/" +
          created.conversation.conversationCode +
          "/turns";
        const turnInput = {
          idempotencyKey: "product-language-turn",
          message:
            "Create 1 product, name Acceptance product, codePrefix acceptance_product, catalogVersion acceptance_catalogue, priceBookCode acceptance_book, currency AED, price 12.50. Keep active false (DRAFT).",
        };
        const turn = await request(path, turnInput);
        assert.equal(
          turn.confirmation?.operationId,
          "commerce.product.create",
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
      } else prepared = await request("copilotApi/v0/products/prepare", input);
      assert.deepEqual(await counts(), [0, 0]);
      const endpoint = "copilotApi/v0/confirmations/" + prepared.actionCode;
      const proof = {
        expectedRevision: prepared.confirmation.revision,
        argumentsDigest: prepared.confirmation.argumentsDigest,
      };
      const approved = await request(endpoint + "/approve", proof);
      assert.deepEqual(await counts(), [0, 0]);
      await request(endpoint + "/execute", proof, 409);
      let execution = await request(endpoint + "/execute", {
        ...proof,
        expectedRevision: approved.confirmation.revision,
      });
      if (scenario === "response-loss") {
        assert.equal(
          execution.state,
          "OUTCOME_UNKNOWN",
          JSON.stringify(execution),
        );
        assert.equal(
          execution.rows.filter((item) => item.state === "OUTCOME_UNKNOWN")
            .length,
          1,
        );
        assert.equal((await counts())[1], 1);
        await runtime.restart();
        await login();
        assert.equal(
          (await request(endpoint)).confirmation.state,
          "OUTCOME_UNKNOWN",
        );
        const beforeInspection = await counts();
        const restored = await request(endpoint + "/original-results", {
          ...proof,
          expectedRevision: execution.revision,
        });
        assert.equal(
          restored.confirmation.state,
          "PENDING",
          JSON.stringify(restored),
        );
        assert.ok(
          restored.confirmation.outcomes.some(
            (item) => item.state === "NOT_STARTED",
          ),
        );
        assert.ok(
          restored.confirmation.outcomes.every((item) =>
            ["COMPLETED", "NOT_STARTED"].includes(item.state),
          ),
        );
        assert.deepEqual(await counts(), beforeInspection);
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
      assert.equal(execution.rows.length, input.count * 2);
      assert.ok(execution.rows.every((item) => item.state === "COMPLETED"));
      const products = await request(
        "product/v0/product/safe-search",
        {},
        200,
        native,
      );
      const prices = await request(
        "pricing/v0/pricerow/safe-search",
        {},
        200,
        native,
      );
      assert.deepEqual(
        [products.totalCount, prices.totalCount],
        [input.count, input.count],
      );
      for (let index = 1; index <= input.count; index++) {
        const code = input.codePrefix + "-" + String(index).padStart(3, "0");
        const product = products.records.find((item) => item.code === code);
        assert.ok(product);
        assert.equal(product.name, input.name);
        assert.equal(product.status, "DRAFT");
        assert.equal(product.catalogVersion, input.catalogVersion);
        assert.equal(product.enterpriseCode, "default");
        assert.equal(product.tenant, "default");
        const price = prices.records.find((item) => item.productCode === code);
        assert.equal(price.code, code + "-PRICE");
        assert.equal(price.unitAmount, "12.50");
        assert.equal(price.priceBookCode, input.priceBookCode);
        assert.equal(price.currency, "AED");
      }
      const diagnostics = runtime.runtimeDiagnostics().diagnostics;
      assert.equal(
        diagnostics.filter((item) => item.code === "PRODUCT_NATIVE_COMPLETED")
          .length,
        input.count,
      );
      assert.equal(
        diagnostics.filter((item) => item.code === "PRICE_NATIVE_COMPLETED")
          .length,
        input.count,
      );
      assert.equal(
        diagnostics.filter((item) => item.code === "PRICE_RESPONSE_LOST")
          .length,
        scenario === "response-loss" ? 1 : 0,
      );
      const original = await request(endpoint);
      await runtime.restart();
      await runtime.restartAxisRuntime("COMMERCE_STAGED");
      await login();
      assert.deepEqual(await request(endpoint), original);
      assert.deepEqual(
        await request("product/v0/product/safe-search", {}, 200, native),
        products,
      );
      assert.deepEqual(
        await request("pricing/v0/pricerow/safe-search", {}, 200, native),
        prices,
      );
      t.diagnostic(
        "REAL_STAGED_PRODUCT_PRICE_PERSISTENCE_AND_RESTART_PASS " + scenario,
      );
    },
  );
}
