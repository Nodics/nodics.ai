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
 * @module copilotWorkbench/test/copilotSchemaActionRuntime
 * @description Qualifies selected and explicitly allowlisted generated create, update, and delete against real Profile, Copilot, Product, MongoDB, and private native receipts.
 * @layer test
 * @owner copilotWorkbench
 * @sideEffects Uses only one synthetic schema and record in disposable acceptance databases.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "selected generated record create, update, delete, denial, receipt and restart",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withRegistration: true,
      withGovernedSchemaActions: true,
    });
    t.after(() => runtime.close());
    const native = runtime.axisRuntimes.find(
      (item) => item.role === "COMMERCE_STAGED",
    ).origin;
    let token;
    /** Calls a real secured owner route with the current employee credential. */
    async function request(
      path,
      { method = "POST", body, origin = runtime.baseUrl } = {},
      expected = 200,
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
    /** Authenticates through Profile rather than constructing execution context. */
    async function login(role = "operator") {
      token = undefined;
      token = (
        await request("profile/v0/employee/authenticate", {
          body: {
            loginId: "copilot_acceptance_" + role,
            password: runtime.password,
          },
        })
      ).authToken;
      assert.ok(token);
    }
    /** Prepares and executes one typed conversation command after explicit approval. */
    async function execute(command, key) {
      const created = await request("copilotApi/v0/conversations", {
        body: { title: "Governed schema action " + key },
      });
      const turn = await request(
        "copilotApi/v0/conversations/" +
          created.conversation.conversationCode +
          "/turns",
        {
          body: {
            idempotencyKey: "schema-action-turn-" + key,
            message: JSON.stringify(command),
          },
        },
      );
      assert.equal(turn.confirmation?.operationId, command.operation);
      const endpoint =
        "copilotApi/v0/confirmations/" + turn.confirmation.confirmationCode;
      const proof = {
        expectedRevision: turn.confirmation.revision,
        argumentsDigest: turn.confirmation.argumentsDigest,
      };
      const approved = await request(endpoint + "/approve", { body: proof });
      const result = await request(endpoint + "/execute", {
        body: {
          ...proof,
          expectedRevision: approved.confirmation.revision,
        },
      });
      if (result.state !== "CONSUMED")
        t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
      assert.equal(result.state, "CONSUMED", JSON.stringify(result));
      assert.deepEqual(
        result.rows.map((row) => row.state),
        ["COMPLETED"],
      );
      await request(
        endpoint + "/execute",
        {
          body: {
            ...proof,
            expectedRevision: approved.confirmation.revision,
          },
        },
        409,
      );
      return {
        actionCode: turn.confirmation.confirmationCode,
        endpoint,
        result,
      };
    }
    /** Reads current synthetic records through the canonical safe-search owner. */
    async function records() {
      return (
        await request("product/v0/schemaactionrecord/safe-search", {
          origin: native,
          body: {},
        })
      ).records;
    }
    const code = "acceptance_schema_record";
    const model = { code, name: "Original", revision: 1, active: true };
    await login("reader");
    const deniedConversation = await request("copilotApi/v0/conversations", {
      body: { title: "Denied schema action" },
    });
    await request(
      "copilotApi/v0/conversations/" +
        deniedConversation.conversation.conversationCode +
        "/turns",
      {
        body: {
          idempotencyKey: "schema-action-denied",
          message: JSON.stringify({
            operation: "data.record.create",
            sourceCode: "acceptance-product-data",
            schemaName: "schemaActionRecord",
            model,
          }),
        },
      },
      403,
    );
    await login();
    assert.deepEqual(await records(), []);
    const capability = await request(
      "product/v0/schemaactionrecord/capabilities",
      { method: "GET", origin: native },
    );
    assert.equal(capability.moduleName, "product");
    assert.equal(capability.schemaName, "schemaActionRecord");
    assert.equal(capability.mutationMode, "GENERATED_CRUD");
    assert.equal(capability.authoring.authoringAllowed, true);
    assert.deepEqual(
      ["create", "update", "delete"].map(
        (operation) => capability.apiOperations[operation].active,
      ),
      [true, true, true],
    );
    const created = await execute(
      {
        operation: "data.record.create",
        sourceCode: "acceptance-product-data",
        schemaName: "schemaActionRecord",
        model,
      },
      "create",
    );
    assert.equal((await records())[0].name, "Original");
    const createKey = created.actionCode + ":governedSchemaAction:" + code;
    const createReceipt = await request(
      "product/v0/schemaactionrecord/commands/inspect",
      {
        origin: native,
        body: {
          operation: "create",
          input: model,
          idempotencyKey: createKey,
        },
      },
    );
    assert.equal(createReceipt.state, "COMPLETED");
    assert.equal(createReceipt.resultIdentity, code);
    const identity = { code, revision: 1 };
    const changes = { name: "Updated" };
    const updated = await execute(
      {
        operation: "data.record.update",
        sourceCode: "acceptance-product-data",
        schemaName: "schemaActionRecord",
        identity,
        changes,
      },
      "update",
    );
    assert.equal((await records())[0].name, "Updated");
    const updateReceipt = await request(
      "product/v0/schemaactionrecord/commands/inspect",
      {
        origin: native,
        body: {
          operation: "update",
          input: { query: identity, model: changes },
          idempotencyKey: updated.actionCode + ":governedSchemaAction:" + code,
        },
      },
    );
    assert.equal(updateReceipt.state, "COMPLETED");
    assert.match(updateReceipt.resultIdentity, /^update:[a-f0-9]{64}$/);
    const impact = await request(
      "product/v0/schemaactionrecord/delete-impact",
      { origin: native, body: { identity } },
    );
    assert.equal(impact.targetCount, 1);
    assert.equal(impact.blocked, false);
    const removed = await execute(
      {
        operation: "data.record.delete",
        sourceCode: "acceptance-product-data",
        schemaName: "schemaActionRecord",
        identity,
      },
      "delete",
    );
    assert.deepEqual(await records(), []);
    const deleteReceiptBody = {
      operation: "delete",
      input: { query: identity },
      idempotencyKey: removed.actionCode + ":governedSchemaAction:" + code,
    };
    const deleteReceipt = await request(
      "product/v0/schemaactionrecord/commands/inspect",
      { origin: native, body: deleteReceiptBody },
    );
    assert.equal(deleteReceipt.state, "COMPLETED");
    assert.match(deleteReceipt.resultIdentity, /^delete:[a-f0-9]{64}$/);
    await runtime.restart();
    await runtime.restartAxisRuntime("COMMERCE_STAGED");
    await login();
    assert.deepEqual(await records(), []);
    assert.deepEqual(
      await request("product/v0/schemaactionrecord/commands/inspect", {
        origin: native,
        body: deleteReceiptBody,
      }),
      deleteReceipt,
    );
    t.diagnostic(
      "REAL_SELECTED_SCHEMA_CREATE_UPDATE_DELETE_RECEIPT_RESTART_PASS",
    );
  },
);
