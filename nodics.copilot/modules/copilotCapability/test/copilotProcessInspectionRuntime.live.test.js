/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCapability/test/copilotProcessInspectionRuntime
 * @description Qualifies employee-authorized Process metadata through real private Profile/Process/Copilot runtimes and persistent conversations.
 * @layer test @owner copilotCapability
 * @sideEffects Creates only synthetic native workflow definitions, instances and a refused-action incident in owned disposable storage.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "native Process inspection preserves scope, published versions, task and incident state across restart",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withRegistration: true,
      withProcessInspection: true,
      withOllama: true,
    });
    t.after(() => runtime.close());
    const processOrigin = runtime.axisRuntimes.find(
      (item) => item.role === "PROCESS",
    ).origin;
    let token;
    /** Calls a fixed private owner using the real employee bearer and no retries. */
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
    /** Authenticates one real fixture employee through Profile. */
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
    /** Builds a native graph with one human task or a deliberately unapproved callback action. */
    function graph(failure = false) {
      return {
        nodes: [
          { code: "start", type: "START" },
          failure
            ? {
                code: "review",
                type: "ACTION",
                action: {
                  moduleName: "cms",
                  operation: "applyPublicationDecision",
                },
              }
            : { code: "review", type: "TASK", name: "Acceptance review" },
          { code: "end", type: "END" },
        ],
        transitions: [
          { code: "to-review", source: "start", target: "review" },
          { code: "to-end", source: "review", target: "end" },
        ],
      };
    }
    await login();
    for (const [code, failure] of [
      ["acceptance_process", false],
      ["acceptance_failure", true],
    ]) {
      await request(
        "process/v0/definitions",
        { code, name: "Inspection acceptance", graph: graph(failure) },
        201,
        processOrigin,
      );
      await request(
        "process/v0/definitions/" + code + "/draft/publish",
        {},
        200,
        processOrigin,
      );
    }
    await request(
      "process/v0/instances",
      {
        definitionCode: "acceptance_process",
        instanceCode: "acceptance_instance",
        taskCode: "acceptance_task",
        context: { privateInspectionMarker: "NEVER_PROJECT_CONTEXT" },
      },
      201,
      processOrigin,
    );
    await request(
      "process/v0/instances",
      {
        definitionCode: "acceptance_failure",
        instanceCode: "acceptance_failed",
        context: { privateInspectionMarker: "NEVER_PROJECT_CONTEXT" },
      },
      403,
      processOrigin,
    );
    const failed = await request(
      "process/v0/instances/acceptance_failed",
      undefined,
      200,
      processOrigin,
    );
    assert.equal(failed.status, "FAILED");
    assert.ok(failed.incidentCode);
    await runtime.restartProcessIncident(failed.incidentCode);
    await login();
    const before = await request(
      "process/v0/instances/acceptance_instance/detail",
      undefined,
      200,
      processOrigin,
    );
    const activity = await request(
      "process/v0/audit-events?instanceCode=acceptance_instance&limit=25",
      undefined,
      200,
      processOrigin,
    );
    assert.ok(
      activity.length > 1,
      "Native activity must exercise the requested page limit",
    );
    assert.equal(
      (
        await request(
          "process/v0/audit-events?instanceCode=acceptance_instance&limit=1",
          undefined,
          200,
          processOrigin,
        )
      ).length,
      1,
    );
    const incidentBefore = await request(
      "process/v0/incidents/" + failed.incidentCode,
      undefined,
      200,
      processOrigin,
    );
    assert.equal(
      (await request("copilotApi/v0/context")).processInspection.operations
        .length,
      11,
    );
    assert.equal(
      (await request("copilotApi/v0/providers/check", {})).state,
      "UP",
    );
    const created = await request("copilotApi/v0/conversations", {
      title: "Process inspection acceptance",
    });
    const conversation =
      "copilotApi/v0/conversations/" + created.conversation.conversationCode;
    for (const [operation, code] of [
      ["process.definition.list"],
      ["process.definition.inspect", "acceptance_process"],
      ["process.definition.versions", "acceptance_process"],
      ["process.instance.list"],
      ["process.instance.inspect", "acceptance_instance"],
      ["process.instance.detail", "acceptance_instance"],
      ["process.instance.tasks", "acceptance_instance"],
      ["process.instance.activity", "acceptance_instance"],
      ["process.instance.incidents", "acceptance_failed"],
      ["process.task.inspect", "acceptance_task"],
      ["process.incident.inspect", failed.incidentCode],
    ]) {
      const body = {
        idempotencyKey: operation,
        message: JSON.stringify({
          intent: "copilot.process.inspect",
          operation,
          ...(code ? { code } : {}),
        }),
      };
      const result = await request(conversation + "/turns", body);
      assert.equal(result.turn.state, "COMPLETED", JSON.stringify(result));
      assert.equal(
        (await request(conversation + "/turns", body)).turn.turnCode,
        result.turn.turnCode,
      );
    }
    const history = await request(conversation + "/history");
    assert.match(JSON.stringify(history), /acceptance_task/);
    assert.match(JSON.stringify(history), /\\"version\\": 1/);
    assert.doesNotMatch(
      JSON.stringify(history),
      /NEVER_PROJECT_CONTEXT|startFingerprint|decisionContract|reviewContext|compensationAdapter/,
    );
    assert.equal((await request("copilotApi/v0/usage")).totals.calls, 0);
    assert.deepEqual(
      await request(
        "process/v0/instances/acceptance_instance/detail",
        undefined,
        200,
        processOrigin,
      ),
      before,
    );
    assert.deepEqual(
      await request(
        "process/v0/incidents/" + failed.incidentCode,
        undefined,
        200,
        processOrigin,
      ),
      incidentBefore,
    );
    await request(
      conversation + "/turns",
      {
        idempotencyKey: "unadmitted",
        message: JSON.stringify({
          intent: "copilot.process.inspect",
          operation: "process.instance.inspect",
          code: "foreign-instance",
        }),
      },
      403,
    );
    await login("reader");
    assert.deepEqual(
      (await request("copilotApi/v0/context")).processInspection.operations,
      [],
    );
    await request(
      "process/v0/definitions/acceptance_process",
      undefined,
      403,
      processOrigin,
    );
    const denied = await request("copilotApi/v0/conversations", {
      title: "Denied inspection",
    });
    await request(
      "copilotApi/v0/conversations/" +
        denied.conversation.conversationCode +
        "/turns",
      {
        idempotencyKey: "denied",
        message: JSON.stringify({
          intent: "copilot.process.inspect",
          operation: "process.definition.inspect",
          code: "acceptance_process",
        }),
      },
      403,
    );
    await runtime.restartReadOnly();
    await login();
    const restored = await request(conversation + "/history");
    assert.match(JSON.stringify(restored), /acceptance_task/);
    assert.doesNotMatch(JSON.stringify(restored), /NEVER_PROJECT_CONTEXT/);
    assert.deepEqual(
      await request(
        "process/v0/instances/acceptance_instance/detail",
        undefined,
        200,
        processOrigin,
      ),
      before,
    );
  },
);
