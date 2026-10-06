/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotWorkbench/test/copilotProcessTriggerRuntime @description Runs real Profile, Workflow, Copilot, MongoDB and local Ollama with disposable synthetic trigger state, original receipt recovery and restart. @layer test @owner copilotWorkbench @sideEffects Owned temporary runtime processes/storage only. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");
for (const responseLoss of [false, true])
  test(
    "native trigger create/update/execute/archive, permission denial and original receipt restart; response loss=" +
      responseLoss,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        withRegistration: true,
        withProcessTriggerActions: true,
        withProcessTriggerResponseLoss: responseLoss,
        withOllama: true,
      });
      t.after(() => runtime.close());
      const native = runtime.axisRuntimes.find(
        (item) => item.role === "PROCESS",
      ).origin;
      let token;
      /** Calls a fixed real API once with original credentials. @param {string} path Owner path. @param {Object} body Optional body. @param {number} expected Status. @param {string} origin Owner origin. @returns {Promise<Object>} Payload. */
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
      /** Authenticates via real Profile. @param {string} role Fixture employee. @returns {Promise<void>} Sets original bearer. */
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
      assert.equal(
        (await request("copilotApi/v0/providers/check", {})).state,
        "UP",
      );
      await request(
        "process/v0/definitions",
        {
          code: "acceptance_trigger_definition",
          name: "Trigger acceptance",
          graph: {
            nodes: [
              { code: "start", type: "START" },
              { code: "end", type: "END" },
            ],
            transitions: [{ code: "to-end", source: "start", target: "end" }],
          },
        },
        201,
        native,
      );
      await request(
        "process/v0/definitions/acceptance_trigger_definition/draft/publish",
        {},
        200,
        native,
      );
      const conversation =
        "copilotApi/v0/conversations/" +
        (
          await request("copilotApi/v0/conversations", {
            title: "Trigger acceptance",
          })
        ).conversation.conversationCode;
      assert.deepEqual(
        (
          await request(conversation + "/turns", {
            idempotencyKey: "missing",
            message: "execute trigger acceptance_trigger",
          })
        ).clarification.missing,
        ["instanceCode", "context"],
      );
      const commands = [
        [
          "create",
          {
            definitionCode: "acceptance_trigger_definition",
            name: "Synthetic trigger",
            triggerType: "MANUAL",
            status: "DRAFT",
            active: false,
          },
        ],
        ["update", { status: "ACTIVE", active: true }],
        [
          "execute",
          { instanceCode: "acceptance_trigger_instance", context: {} },
        ],
        ["archive", {}],
      ];
      const receipts = [];
      for (const [kind, command] of commands) {
        const turn = await request(conversation + "/turns", {
          idempotencyKey: "trigger-" + kind,
          message:
            kind === "update"
              ? "Please update trigger acceptance_trigger with status ACTIVE and active true"
              : JSON.stringify({
                  operation: "process.trigger." + kind,
                  triggerCode: "acceptance_trigger",
                  ...command,
                }),
        });
        assert.equal(
          turn.confirmation?.operationId,
          "process.trigger." + kind,
          JSON.stringify(turn),
        );
        const endpoint =
          "copilotApi/v0/confirmations/" + turn.confirmation.confirmationCode;
        const proof = {
          expectedRevision: turn.confirmation.revision,
          argumentsDigest: turn.confirmation.argumentsDigest,
        };
        const approved = await request(endpoint + "/approve", proof);
        await request(endpoint + "/execute", proof, 409);
        const execution = {
          ...proof,
          expectedRevision: approved.confirmation.revision,
        };
        const result = await request(endpoint + "/execute", execution);
        if (responseLoss && kind === "execute") {
          assert.equal(result.state, "OUTCOME_UNKNOWN", JSON.stringify(result));
          assert.equal(
            (
              await request(
                "process/v0/instances/acceptance_trigger_instance",
                undefined,
                200,
                native,
              )
            ).status,
            "COMPLETED",
          );
          await runtime.restartReadOnly();
          await login();
          const original = (await request(endpoint)).confirmation;
          assert.equal(
            (
              await request(endpoint + "/original-results", {
                expectedRevision: original.revision,
                argumentsDigest: original.argumentsDigest,
              })
            ).confirmation.state,
            "CONSUMED",
          );
        } else assert.equal(result.state, "CONSUMED", JSON.stringify(result));
        await request(endpoint + "/execute", execution, 409);
        const receiptPath =
          "process/v0/triggers/acceptance_trigger/commands/" +
          kind +
          "/receipt/query";
        const original = {
          idempotencyKey:
            turn.confirmation.confirmationCode +
            ":processTrigger:acceptance_trigger",
          command: {
            ...command,
            ...(kind === "create"
              ? { code: "acceptance_trigger", ownerModule: "nodics.process" }
              : {}),
          },
        };
        const receipt = await request(receiptPath, original, 200, native);
        assert.equal(receipt.state, "COMPLETED");
        assert.equal(receipt.resultIdentity, "acceptance_trigger");
        receipts.push({ receiptPath, original, receipt });
      }
      assert.equal(
        (
          await request(
            "process/v0/instances/acceptance_trigger_instance",
            undefined,
            200,
            native,
          )
        ).status,
        "COMPLETED",
      );
      const triggers = await request(
        "process/v0/triggers",
        undefined,
        200,
        native,
      );
      assert.equal(
        triggers.find((row) => row.code === "acceptance_trigger").status,
        "ARCHIVED",
      );
      const usage = (await request("copilotApi/v0/usage")).totals;
      assert.equal(usage.calls, 1);
      assert.ok(usage.consumed > 0);
      await login("reader");
      const denied = (
        await request("copilotApi/v0/conversations", {
          title: "Denied trigger",
        })
      ).conversation.conversationCode;
      await request(
        "copilotApi/v0/conversations/" + denied + "/turns",
        {
          idempotencyKey: "denied",
          message: "archive trigger acceptance_trigger",
        },
        403,
      );
      await request(
        "process/v0/triggers/acceptance_trigger/execute",
        { instanceCode: "forbidden", context: {} },
        403,
        native,
      );
      await request(receipts[0].receiptPath, receipts[0].original, 403, native);
      await runtime.restartReadOnly();
      await login();
      for (const item of receipts)
        assert.deepEqual(
          await request(item.receiptPath, item.original, 200, native),
          item.receipt,
        );
      assert.match(
        JSON.stringify(await request(conversation + "/history")),
        /process.trigger.archive/,
      );
    },
  );
