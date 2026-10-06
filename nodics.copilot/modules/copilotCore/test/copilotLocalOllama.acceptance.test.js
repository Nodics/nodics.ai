/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotLocalOllamaAcceptance @description Opt-in synthetic real-loopback model interpretation through the existing planner and Ollama adapter, without customer records, grants or deployed accounting changes. @layer test @owner copilotCore */
const test = require("node:test");
const assert = require("node:assert/strict");
const planner = require("../src/service/defaultCopilotIntentPlanningService");
const adapter = require("../../copilotProviders/modules/ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService");
const defaults =
  require("../../copilotProviders/modules/ollamaProvider/config/properties")
    .copilot.providers.adapters.ollama;

for (const kind of ["invitation", "price"]) {
  test(
    "local Ollama interprets explicit synthetic " +
      kind +
      " data without executing",
    {
      skip: process.env.NODICS_COPILOT_LOCAL_ACCEPTANCE !== "1",
      timeout: 125000,
    },
    async (t) => {
      const prior = {
        SERVICE: global.SERVICE,
        CONFIG: global.CONFIG,
        CLASSES: global.CLASSES,
      };
      t.after(() => Object.assign(global, prior));
      const configuration = {
        core: {
          intentPlanning: {
            enabled: true,
            clarificationMessage: "Supply explicit values.",
          },
        },
        providers: {},
        workbench: {
          standaloneInvitationsEnabled: kind === "invitation",
          standalonePricesEnabled: kind === "price",
          enterpriseTarget: { enabled: true },
          target: {
            pricingModule: "pricing",
            connectionName: "synthetic-owner",
          },
        },
      };
      const command =
        kind === "invitation"
          ? {
              operation: "profile.enterprise.invite",
              enterpriseCode: "DEMO_AI",
              employees: [
                { email: "operator@example.invalid", roleCode: "VIEWER" },
              ],
            }
          : {
              operation: "commerce.price.create",
              prices: [
                {
                  code: "DEMO_PRICE",
                  priceBookCode: "DEMO_BOOK",
                  productCode: "DEMO_PRODUCT",
                  unitAmount: "12.3400",
                  currency: "AED",
                  minQuantity: "1",
                },
              ],
            };
      const request = {
        tenant: "synthetic",
        authData: {
          loginId: "synthetic",
          enterpriseCode: "DEMO_AI",
          permissions: [
            "copilot.mutation.prepare",
            "profile.enterpriseAccess.assign",
          ],
        },
        message:
          kind === "invitation"
            ? "Invite employee operator@example.invalid with role VIEWER to existing enterprise DEMO_AI. Do not create an enterprise."
            : "Create price row DEMO_PRICE for existing product DEMO_PRODUCT in price book DEMO_BOOK with unit amount 12.3400, currency AED, minimum quantity 1. Keep decimal strings exactly as supplied.",
      };
      const properties = structuredClone(defaults);
      Object.assign(properties.connection, {
        host: "127.0.0.1",
        port: 11434,
        allowRemote: false,
        allowedHosts: ["127.0.0.1"],
        timeoutMs: 120000,
      });
      Object.assign(properties.model, {
        name: process.env.NODICS_COPILOT_LOCAL_MODEL || "gemma3:4b",
        contextWindow: 4096,
        format: "json",
        keepAlive: "1m",
      });
      global.CONFIG = { get: () => configuration };
      global.CLASSES = { NodicsError: class extends Error {} };
      global.SERVICE = {
        DefaultCopilotOrchestrationService: require("../src/service/defaultCopilotOrchestrationService"),
        DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
        DefaultCopilotInvitationActionService: require("../../copilotWorkbench/src/service/defaultCopilotInvitationActionService"),
        DefaultCopilotPriceActionService: require("../../copilotWorkbench/src/service/defaultCopilotPriceActionService"),
        DefaultCopilotProviderService: {
          invoke: async (input, options) => {
            assert.equal(options.accounting.request, request);
            assert.equal(options.accounting.callId, "synthetic-turn:intent");
            return adapter.invoke({
              adapter: properties,
              limits: { maximumRequestBytes: 65536 },
              profile: {
                temperature: 0,
                maximumOutputTokens: 512,
                structuredOutput: true,
              },
              messages: input.messages,
            });
          },
        },
      };
      assert.equal((await adapter.health(properties)).state, "UP");
      const result = await planner.plan(
        request,
        configuration,
        "synthetic-turn",
      );
      assert.deepEqual(result.command, command);
      assert.ok(result.usage.totalTokens > 0);
      t.diagnostic(
        JSON.stringify({
          model: properties.model.name,
          operation: command.operation,
          measuredTokens: result.usage.totalTokens,
          evidence: "LOCAL_ADAPTER_AND_PLANNER_ONLY",
          businessWrites: 0,
          deployedLedgerVerified: false,
        }),
      );
    },
  );
}
