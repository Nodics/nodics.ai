/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotWorkbench/test/copilotProcessTaskRuntime @description Exercises human task commands using real Profile, Copilot, Workflow and disposable persistence. @layer test @owner copilotWorkbench @sideEffects Creates synthetic definitions and tasks only in owned disposable storage. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

for (const responseLoss of [false, true])
  test(
    "native task claim, assign, complete and cancel retain approval, permissions and original receipts after restart; response loss=" +
      responseLoss,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        withRegistration: true,
        withProcessActions: true,
        withProcessResponseLoss: responseLoss,
        withOllama: true,
      });
      t.after(() => runtime.close());
      const native = runtime.axisRuntimes.find(
        (item) => item.role === "PROCESS",
      ).origin;
      let token;
      /** Calls one real API with the original employee and no retry. @param {string} path Fixed route. @param {Object} body Optional body. @param {number} expected Status. @param {string} origin Owner. @param {Object} headers Additional headers. @returns {Promise<Object>} Owner payload. */
      async function request(
        path,
        body,
        expected = 200,
        origin = runtime.baseUrl,
        headers = {},
      ) {
        const response = await fetch(origin + "/nodics/" + path, {
          method: body === undefined ? "GET" : "POST",
          redirect: "error",
          signal: AbortSignal.timeout(120000),
          headers: {
            "Content-Type": "application/json",
            "x-enterprise-code": "default",
            ...(token ? { Authorization: "Bearer " + token } : {}),
            ...headers,
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const value = await response.json();
        if (response.status !== expected)
          t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
        assert.equal(response.status, expected, JSON.stringify(value));
        return value.data || value.result || value;
      }
      /** Authenticates a fixture employee via Profile. @param {string} role Role. @returns {Promise<void>} Sets bearer. */
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
          code: "acceptance_process",
          name: "Task command acceptance",
          graph: {
            nodes: [
              { code: "start", type: "START" },
              { code: "review", type: "TASK" },
              { code: "end", type: "END" },
            ],
            transitions: [
              { code: "to-review", source: "start", target: "review" },
              { code: "to-end", source: "review", target: "end" },
            ],
          },
        },
        201,
        native,
      );
      await request(
        "process/v0/definitions/acceptance_process/draft/publish",
        {},
        200,
        native,
      );
      for (const suffix of ["one", "two"])
        await request(
          "process/v0/instances",
          {
            definitionCode: "acceptance_process",
            instanceCode: "acceptance_instance_" + suffix,
            taskCode: "acceptance_task_" + suffix,
            context: {},
          },
          201,
          native,
        );
      const created = await request("copilotApi/v0/conversations", {
        title: "Process task acceptance",
      });
      const conversation =
        "copilotApi/v0/conversations/" + created.conversation.conversationCode;
      const missing = await request(conversation + "/turns", {
        idempotencyKey: "missing-decision",
        message: "complete task acceptance_task_one",
      });
      assert.deepEqual(missing.clarification.missing, ["decision"]);
      const completed = [];
      for (const [kind, taskCode, command, message] of [
        ["claim", "acceptance_task_one", {}, "claim task acceptance_task_one"],
        [
          "assign",
          "acceptance_task_one",
          { assignee: "copilot_acceptance_operator" },
          "assign task acceptance_task_one to copilot_acceptance_operator",
        ],
        [
          "complete",
          "acceptance_task_one",
          {
            decision: { approved: true, reason: "Reviewed synthetic evidence" },
          },
          "Please complete task acceptance_task_one with approved true and reason Reviewed synthetic evidence",
        ],
        [
          "cancel",
          "acceptance_task_two",
          { reason: "Duplicate synthetic task" },
          "cancel task acceptance_task_two because Duplicate synthetic task",
        ],
      ]) {
        const before = await request(
          "process/v0/tasks/" + taskCode,
          undefined,
          200,
          native,
        );
        const input = {
          idempotencyKey: "task-" + kind,
          message:
            message ||
            JSON.stringify({
              operation: "process.task." + kind,
              taskCode,
              ...command,
            }),
        };
        const turn = await request(conversation + "/turns", input);
        assert.equal(
          turn.confirmation?.operationId,
          "process.task." + kind,
          JSON.stringify(turn),
        );
        await request(conversation + "/turns", input);
        assert.deepEqual(
          await request("process/v0/tasks/" + taskCode, undefined, 200, native),
          before,
        );
        const endpoint =
          "copilotApi/v0/confirmations/" + turn.confirmation.confirmationCode;
        const proof = {
          expectedRevision: turn.confirmation.revision,
          argumentsDigest: turn.confirmation.argumentsDigest,
        };
        const approved = await request(endpoint + "/approve", proof);
        assert.ok((await request(endpoint)).confirmation.recovery?.label);
        await request(endpoint + "/execute", proof, 409);
        const executeProof = {
          ...proof,
          expectedRevision: approved.confirmation.revision,
        };
        const result = await request(endpoint + "/execute", executeProof);
        if (responseLoss && kind === "complete") {
          assert.equal(result.state, "OUTCOME_UNKNOWN", JSON.stringify(result));
          assert.equal(
            (
              await request(
                "process/v0/tasks/" + taskCode,
                undefined,
                200,
                native,
              )
            ).status,
            "COMPLETED",
          );
          await runtime.restartReadOnly();
          await login();
          const existing = (await request(endpoint)).confirmation;
          assert.equal(existing.state, "OUTCOME_UNKNOWN");
          const restored = await request(endpoint + "/original-results", {
            expectedRevision: existing.revision,
            argumentsDigest: existing.argumentsDigest,
          });
          assert.equal(restored.confirmation.state, "CONSUMED");
        } else assert.equal(result.state, "CONSUMED", JSON.stringify(result));
        await request(endpoint + "/execute", executeProof, 409);
        const receiptPath =
          "process/v0/tasks/" +
          taskCode +
          "/commands/" +
          kind +
          "/receipt/query";
        const original = {
          idempotencyKey:
            turn.confirmation.confirmationCode + ":processTask:" + taskCode,
          command,
        };
        const receipt = await request(receiptPath, original, 200, native);
        assert.equal(receipt.state, "COMPLETED");
        assert.equal(receipt.resultIdentity, taskCode);
        completed.push({ receiptPath, original, receipt });
      }
      assert.equal(
        (
          await request(
            "process/v0/tasks/acceptance_task_one",
            undefined,
            200,
            native,
          )
        ).status,
        "COMPLETED",
      );
      assert.equal(
        (
          await request(
            "process/v0/instances/acceptance_instance_one",
            undefined,
            200,
            native,
          )
        ).status,
        "COMPLETED",
      );
      assert.equal(
        (
          await request(
            "process/v0/tasks/acceptance_task_two",
            undefined,
            200,
            native,
          )
        ).status,
        "CANCELLED",
      );
      const usage = (await request("copilotApi/v0/usage")).totals;
      assert.equal(usage.calls, 1);
      assert.ok(usage.consumed > 0);
      await login("reader");
      const denied = await request("copilotApi/v0/conversations", {
        title: "Denied task command",
      });
      await request(
        "copilotApi/v0/conversations/" +
          denied.conversation.conversationCode +
          "/turns",
        {
          idempotencyKey: "denied-task",
          message: "claim task acceptance_task_two",
        },
        403,
      );
      await request(
        "process/v0/tasks/acceptance_task_two/claim",
        {},
        403,
        native,
      );
      await request(
        completed[0].receiptPath,
        completed[0].original,
        403,
        native,
      );
      await runtime.restartReadOnly();
      await login();
      for (const item of completed)
        assert.deepEqual(
          await request(item.receiptPath, item.original, 200, native),
          item.receipt,
        );
      assert.match(
        JSON.stringify(await request(conversation + "/history")),
        /process.task.complete/,
      );
    },
  );
