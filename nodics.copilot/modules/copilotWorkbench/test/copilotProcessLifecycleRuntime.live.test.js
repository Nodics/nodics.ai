/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotWorkbench/test/copilotProcessLifecycleRuntime @description Exercises real Profile, Workflow, Copilot, MongoDB and local Ollama for definition governance, instance start/cancel, native receipts, denial and restart. @layer test @owner copilotWorkbench @sideEffects Owned temporary runtime processes/storage only. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "native definition lifecycle and instance start/cancel through reviewed Copilot commands",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withRegistration: true,
      withProcessLifecycleActions: true,
      withOllama: true,
    });
    t.after(() => runtime.close());
    const native = runtime.axisRuntimes.find(
      (item) => item.role === "PROCESS",
    ).origin;
    let token;
    /** Calls one real API with original employee credentials. @param {string} path Relative API path. @param {Object|undefined} body JSON body. @param {number} expected HTTP status. @param {string} origin Runtime origin. @param {string} method HTTP method. @returns {Promise<Object>} Unwrapped response. */
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
    /** Authenticates a fixture employee. @param {string} role Fixture role. @returns {Promise<void>} */
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
    /** Reviews, approves and executes one command. @param {string} conversation Conversation path. @param {string|Object} message Human message or typed command. @param {string} operation Expected operation. @returns {Promise<Object>} Initial confirmation. */
    async function execute(conversation, message, operation) {
      const turn = await request(conversation + "/turns", {
        idempotencyKey: operation,
        message:
          typeof message === "string" ? message : JSON.stringify(message),
      });
      assert.equal(
        turn.confirmation?.operationId,
        operation,
        JSON.stringify(turn),
      );
      const endpoint =
        "copilotApi/v0/confirmations/" + turn.confirmation.confirmationCode;
      const proof = {
        expectedRevision: turn.confirmation.revision,
        argumentsDigest: turn.confirmation.argumentsDigest,
      };
      const approved = await request(endpoint + "/approve", proof);
      const result = await request(endpoint + "/execute", {
        ...proof,
        expectedRevision: approved.confirmation.revision,
      });
      assert.equal(result.state, "CONSUMED", JSON.stringify(result));
      return turn.confirmation;
    }

    await login();
    assert.equal(
      (await request("copilotApi/v0/providers/check", {})).state,
      "UP",
    );
    const conversation =
      "copilotApi/v0/conversations/" +
      (
        await request("copilotApi/v0/conversations", {
          title: "Process lifecycle acceptance",
        })
      ).conversation.conversationCode;
    const graph = {
      nodes: [
        { code: "start", type: "START" },
        { code: "review", type: "TASK", name: "Review" },
        { code: "end", type: "END" },
      ],
      transitions: [
        { code: "to-review", source: "start", target: "review" },
        { code: "to-end", source: "review", target: "end" },
      ],
    };
    const commands = [
      [
        "process.definition.create",
        {
          operation: "process.definition.create",
          definitionCode: "acceptance_lifecycle",
          name: "Lifecycle acceptance",
          graph,
        },
      ],
      [
        "process.definition.update",
        {
          operation: "process.definition.update",
          definitionCode: "acceptance_lifecycle",
          name: "Lifecycle acceptance v2",
        },
      ],
      [
        "process.definition.validate",
        {
          operation: "process.definition.validate",
          definitionCode: "acceptance_lifecycle",
        },
      ],
      [
        "process.definition.publish",
        "Please publish process definition acceptance_lifecycle",
      ],
      [
        "process.definition.prepare",
        {
          operation: "process.definition.prepare",
          definitionCode: "acceptance_lifecycle",
        },
      ],
      [
        "process.definition.delete",
        {
          operation: "process.definition.delete",
          definitionCode: "acceptance_lifecycle",
        },
      ],
      [
        "process.instance.start",
        {
          operation: "process.instance.start",
          instanceCode: "acceptance_lifecycle_instance",
          definitionCode: "acceptance_lifecycle",
          context: { enterpriseCode: "default" },
        },
      ],
      [
        "process.instance.cancel",
        {
          operation: "process.instance.cancel",
          instanceCode: "acceptance_lifecycle_instance",
          reason: "Acceptance cleanup",
        },
      ],
    ];
    const receipts = [];
    for (const [operation, message] of commands) {
      const confirmation = await execute(conversation, message, operation);
      const declaration = operation.split(".");
      const family = declaration[1];
      const kind = declaration[2];
      const code =
        family === "definition"
          ? "acceptance_lifecycle"
          : "acceptance_lifecycle_instance";
      const command =
        typeof message === "string"
          ? {}
          : Object.fromEntries(
              Object.entries(message).filter(
                ([key]) => key !== "operation" && key !== family + "Code",
              ),
            );
      if (family === "definition" && kind === "create") command.code = code;
      if (family === "instance" && kind === "start")
        command.instanceCode = code;
      const receiptPath =
        "process/v0/" +
        family +
        "s/" +
        code +
        "/commands/" +
        kind +
        "/receipt/query";
      const original = {
        command,
        idempotencyKey:
          confirmation.confirmationCode +
          ":process" +
          family[0].toUpperCase() +
          family.slice(1) +
          ":" +
          code,
      };
      const receipt = await request(receiptPath, original, 200, native);
      assert.equal(receipt.state, "COMPLETED");
      assert.equal(receipt.resultIdentity, code);
      receipts.push({ receiptPath, original, receipt });
    }
    assert.equal(
      (
        await request(
          "process/v0/definitions/acceptance_lifecycle",
          undefined,
          200,
          native,
        )
      ).status,
      "PUBLISHED",
    );
    assert.equal(
      (
        await request(
          "process/v0/instances/acceptance_lifecycle_instance",
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
    await request(
      conversation + "/turns",
      {
        idempotencyKey: "foreign-conversation",
        message: "publish process definition acceptance_lifecycle",
      },
      404,
    );
    const denied =
      "copilotApi/v0/conversations/" +
      (
        await request("copilotApi/v0/conversations", {
          title: "Denied Process lifecycle",
        })
      ).conversation.conversationCode;
    await request(
      denied + "/turns",
      {
        idempotencyKey: "denied",
        message: "publish process definition acceptance_lifecycle",
      },
      403,
    );
    await request(receipts[0].receiptPath, receipts[0].original, 403, native);
    await runtime.restartReadOnly();
    await login();
    for (const item of receipts)
      assert.deepEqual(
        await request(item.receiptPath, item.original, 200, native),
        item.receipt,
      );
  },
);
