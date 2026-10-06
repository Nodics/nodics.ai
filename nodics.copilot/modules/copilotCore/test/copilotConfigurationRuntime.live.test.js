/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotCore/test/copilotConfigurationRuntime
 * @description Qualifies reviewed provider configuration through nSystem/nDynamo and actual durable restart, without a Copilot configuration store.
 * @layer test @owner copilotCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "governed provider change requires approval and survives runtime restart",
  {
    skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withOllama: true,
      withGovernance: true,
    });
    t.after(() => runtime.close());
    let token;
    /** Calls existing owner routes with a real Profile token and no automatic retries. */
    async function request(path, body, status = 200) {
      const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
        method: body === undefined ? "GET" : "POST",
        signal: AbortSignal.timeout(60000),
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-code": "default",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const value = await response.json();
      assert.equal(response.status, status, JSON.stringify(value));
      return value;
    }
    /** Authenticates the control-plane actor or restricted employee through Profile. */
    async function login(role = "operator") {
      token = undefined;
      const result = await request("profile/v0/employee/authenticate", {
        loginId: "copilot_acceptance_" + role,
        password: runtime.password,
      });
      token = (result.data || result.result).authToken;
      assert.ok(token);
    }
    const route = "system/v0/config/runtime/request";
    const proposal = {
      configurationType: "propertyConfiguration",
      configurationCode: "tenantProperties",
      reason: "Disposable governed model selection",
      configuration: {
        copilot: {
          providers: {
            adapters: {
              ollama: {
                model: { name: "copilot-acceptance-missing-governed" },
              },
            },
          },
        },
      },
    };
    await login("reader");
    await request(route, proposal, 403);
    await login();
    const created = await request(route, proposal);
    const model = created.data || created.result;
    assert.equal(model.status, "REQUESTED");
    const command = {
      activationRequestCode: model.code,
      reason: "Reviewed disposable model selection",
    };
    await request(route + "/activate", command, 503);
    await request(route + "/approve", command);
    await request(route + "/activate", command);
    const providerRoute = "copilotApi/v0/providers/check";
    const health = await request(providerRoute, {});
    assert.equal((health.data || health.result).state, "DEGRADED");
    await runtime.restart();
    await login();
    const restarted = await request(providerRoute, {});
    assert.equal((restarted.data || restarted.result).state, "DEGRADED");
    const original = await request(
      route + "?activationRequestCode=" + encodeURIComponent(model.code),
    );
    assert.match(JSON.stringify(original), /ACTIVATED/);
    const adminRoute = "copilotApi/v0/administration";
    const adminEnvelope = await request(adminRoute);
    const admin = adminEnvelope.data || adminEnvelope.result;
    assert.ok(admin.sections.some((x) => x.code === "provider" && x.editable));
    await login("reader");
    await request(adminRoute, undefined, 403);
    await login("manager");
    const managerEnvelope = await request(adminRoute);
    const manager = managerEnvelope.data || managerEnvelope.result;
    assert.equal(
      manager.sections.some(
        (x) =>
          ["provider", "provider-access", "ceilings"].includes(x.code) &&
          x.editable,
      ),
      false,
    );
    const allocations = manager.sections.find((x) => x.code === "allocations");
    assert.equal(allocations.editable, true);
    const values = Object.fromEntries(
      allocations.fields.map((x) => [x.id, x.value]),
    );
    const allocationCommand = {
      section: "allocations",
      revision: manager.revision,
      reason: "Narrow the enterprise recurring allowance",
      values: { ...values, enterprise: 90000 },
    };
    await request(
      adminRoute + "/preview",
      { ...allocationCommand, values: { ...values, enterprise: 100001 } },
      400,
    );
    await request(
      adminRoute + "/preview",
      {
        ...allocationCommand,
        section: "provider-access",
        values: { adapters: ["ollama"], profiles: ["conversation"] },
      },
      403,
    );
    const reviewEnvelope = await request(
      adminRoute + "/preview",
      allocationCommand,
    );
    const review = reviewEnvelope.data || reviewEnvelope.result;
    assert.equal(review.approvalRequired, true);
    const submittedEnvelope = await request(adminRoute + "/requests", {
      ...allocationCommand,
      previewDigest: review.previewDigest,
    });
    const submitted = submittedEnvelope.data || submittedEnvelope.result;
    assert.equal(submitted.status, "REQUESTED");
    const activation = {
      activationRequestCode: submitted.code,
      reason: "Approve scoped narrowing",
    };
    await request(route + "/approve", activation, 403);
    await login();
    await request(route + "/approve", activation);
    await request(route + "/activate", activation);
    await runtime.restart();
    await login("manager");
    const finalEnvelope = await request(adminRoute);
    const final = finalEnvelope.data || finalEnvelope.result;
    assert.equal(
      final.sections
        .find((x) => x.code === "allocations")
        .fields.find((x) => x.id === "enterprise").value,
      90000,
    );
    assert.notEqual(final.revision, manager.revision);
    await request(adminRoute + "/preview", allocationCommand, 409);
    t.diagnostic("REAL_GOVERNED_PROVIDER_APPROVAL_DURABLE_RESTART_PASS");
  },
);
