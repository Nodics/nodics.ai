/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotApi/test/copilotBackofficeRuntime
 * @description Real Profile and BackOffice registration/activation admission for the disposable Copilot runtime. Does not bypass or certify Axis CMS initialization.
 * @layer test @owner copilotApi
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

test(
  "Copilot navigation follows governed activation and real employee permissions",
  {
    skip: process.env.NODICS_COPILOT_REGISTRY_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({ withRegistration: true });
    t.after(() => runtime.close());
    let token;
    /** Calls real owner routes without constructing identity claims or retrying mutations. */
    async function request(path, body, expected = 200) {
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
      assert.equal(
        response.status,
        expected,
        JSON.stringify({ code: value.code, message: value.message }),
      );
      return value.data || value.result || value;
    }
    /** Obtains an actual Profile token for the selected fixture employee. */
    async function login(role) {
      token = undefined;
      token = (
        await request("profile/v0/employee/authenticate", {
          loginId: "copilot_acceptance_" + role,
          password: runtime.password,
        })
      ).authToken;
      assert.ok(token);
    }
    await login("operator");
    const registration =
      "backoffice/v0/runtime/modules/registrations/nodics.copilot";
    const before = await request("backoffice/v0/bootstrap");
    assert.equal(
      before.catalogue.copilotApi,
      undefined,
      "Available is not activated",
    );
    let state = await request(registration + "?project=" + runtime.projectCode);
    assert.equal(state.registrationState, "AVAILABLE");
    for (const action of ["register", "activate"]) {
      state = await request(registration + "/" + action, {
        project: runtime.projectCode,
        expectedRevision: state.catalogueRevision,
        reason: "Disposable Copilot navigation acceptance",
      });
    }
    assert.equal(state.enabled, true);
    const after = await request("backoffice/v0/bootstrap");
    assert.ok(after.catalogue.copilotApi);
    const routes = after.effectiveNavigationComposition.navigation.map(
      (item) => item.route,
    );
    for (const route of [
      "/copilot",
      "/assistant",
      "/copilot/knowledge",
      "/copilot/usage",
    ])
      assert.ok(routes.includes(route), route);
    assert.ok(
      !routes.includes("/copilot/activity"),
      "Activity requires its independent grant",
    );
    await login("reader");
    await request(
      registration + "/activate",
      {
        project: runtime.projectCode,
        expectedRevision: state.catalogueRevision,
        reason: "Denied reader activation",
      },
      403,
    );
    const reader = await request("backoffice/v0/bootstrap");
    assert.ok(
      reader.catalogue.copilotApi,
      "Read capability is independent of activation administration",
    );
    t.diagnostic(
      "REAL_PROFILE_BACKOFFICE_ACTIVATION_AND_PERMISSION_FILTERED_NAVIGATION_PASS",
    );
  },
);
