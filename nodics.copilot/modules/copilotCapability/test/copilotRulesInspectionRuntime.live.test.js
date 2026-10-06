/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCapability/test/copilotRulesInspectionRuntime
 * @description Qualifies five Rules inspection reads through real Profile actors, native Rules drafts and Copilot conversation persistence.
 * @layer test @owner copilotCapability
 * @sideEffects Creates only synthetic unpublished drafts in private disposable runtime storage; no shared runtime changes.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "native Rules inspections preserve employee permissions, scoped metadata and no model usage across restart",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withRegistration: true,
      withRulesInspection: true,
      withOllama: true,
    });
    t.after(() => runtime.close());
    const rulesOrigin = runtime.axisRuntimes.find(
      (item) => item.role === "RULES",
    ).origin;
    let token;
    /** Sends original human HTTP requests without alternate test authority. */
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
      const text = await response.text();
      assert.ok(
        response.headers.get("content-type")?.includes("application/json"),
        path + ": HTTP " + response.status + " " + text.slice(0, 300),
      );
      const value = JSON.parse(text);
      if (response.status !== expected)
        t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
      assert.equal(response.status, expected, JSON.stringify(value));
      return value.data || value.result || value;
    }
    /** Uses the real Profile authentication endpoint. */
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
    await request(
      "rules/v0/definitions",
      {
        code: "acceptance_rule",
        name: "Acceptance rule",
        consumerModule: "acceptance",
        policyType: "TEST",
        propertyProviderCode: "acceptance",
        scopeType: "ENTERPRISE",
        scopeCode: "default",
        definition: { groups: [] },
      },
      201,
      rulesOrigin,
    );
    await request(
      "rules/v0/band-sets",
      {
        code: "acceptance_band",
        name: "Acceptance bands",
        consumerModule: "acceptance",
        outcomeType: "TEST",
        bands: [{ code: "one", minScore: 0, outcome: { code: "TEST" } }],
      },
      201,
      rulesOrigin,
    );
    const before = await request(
      "rules/v0/definitions/acceptance_rule",
      undefined,
      200,
      rulesOrigin,
    );
    assert.equal(before.code, "acceptance_rule");
    assert.equal(
      (await request("copilotApi/v0/context")).rulesInspection.operations
        .length,
      8,
    );
    assert.equal(
      (await request("copilotApi/v0/providers/check", {})).state,
      "UP",
    );
    const created = await request("copilotApi/v0/conversations", {
      title: "Rules inspection acceptance",
    });
    const conversation =
      "copilotApi/v0/conversations/" + created.conversation.conversationCode;
    for (const operation of [
      "rules.definition.list",
      "rules.definition.inspect",
      "rules.definition.versions",
      "rules.definition.audit",
      "rules.band.list",
      "rules.band.inspect",
      "rules.band.versions",
      "rules.property.catalogue",
    ]) {
      const body = {
        idempotencyKey: operation,
        message: JSON.stringify({
          intent: "copilot.rules.inspect",
          operation,
          ...(!operation.endsWith(".list")
            ? {
                code:
                  operation === "rules.property.catalogue"
                    ? "acceptance"
                    : operation.startsWith("rules.band")
                      ? "acceptance_band"
                      : "acceptance_rule",
              }
            : {}),
        }),
      };
      const response = await request(conversation + "/turns", body);
      assert.equal(response.turn.state, "COMPLETED", JSON.stringify(response));
      const replay = await request(conversation + "/turns", body);
      assert.equal(replay.turn.turnCode, response.turn.turnCode);
    }
    const history = await request(conversation + "/history");
    assert.match(JSON.stringify(history), /RULE_SET_CREATED/);
    assert.doesNotMatch(
      JSON.stringify(history),
      /"definition"|"metadata"|"createdBy"/,
    );
    assert.equal((await request("copilotApi/v0/usage")).totals.calls, 0);
    const after = await request(
      "rules/v0/definitions/acceptance_rule",
      undefined,
      200,
      rulesOrigin,
    );
    assert.deepEqual(after, before);
    await request(
      conversation + "/turns",
      {
        idempotencyKey: "foreign-rule",
        message: JSON.stringify({
          intent: "copilot.rules.inspect",
          operation: "rules.definition.inspect",
          code: "not-admitted",
        }),
      },
      403,
    );
    await login("reader");
    assert.deepEqual(
      (await request("copilotApi/v0/context")).rulesInspection.operations,
      [],
    );
    await request(
      "rules/v0/definitions/acceptance_rule",
      undefined,
      403,
      rulesOrigin,
    );
    const denied = await request("copilotApi/v0/conversations", {
      title: "Denied inspection",
    });
    await request(
      "copilotApi/v0/conversations/" +
        denied.conversation.conversationCode +
        "/turns",
      {
        idempotencyKey: "reader",
        message: JSON.stringify({
          intent: "copilot.rules.inspect",
          operation: "rules.definition.inspect",
          code: "acceptance_rule",
        }),
      },
      403,
    );
    await runtime.restart();
    await login();
    assert.match(
      JSON.stringify(await request(conversation + "/history")),
      /RULE_SET_CREATED/,
    );
    assert.equal((await request("copilotApi/v0/usage")).totals.calls, 0);
    assert.deepEqual(
      await request(
        "rules/v0/definitions/acceptance_rule",
        undefined,
        200,
        rulesOrigin,
      ),
      before,
    );
  },
);
