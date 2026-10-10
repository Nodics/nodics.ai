/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module backoffice/test/applicationDataReleaseTimeout @description Verifies trusted bounded import timeouts before transport without changing signed authority or profile identity. @owner backoffice @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultBackofficeApplicationInitializationService");
const defaults = require("../config/properties").backofficeApplicationInitialization;
const observer = require("../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationSetupObservationService");

function fixture(t) {
  const original = { CONFIG: global.CONFIG, CLASSES: global.CLASSES, SERVICE: global.SERVICE };
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  });
  const state = { configuration: { ...defaults }, invocations: [], bindings: 0 };
  global.CONFIG = { get: key => key === "backofficeApplicationInitialization" ? state.configuration : undefined };
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) { super(message); this.code = code; }
  } };
  global.SERVICE = { DefaultModuleService: { invokeModule: async input => {
    state.invocations.push(input);
    return { accepted: true };
  } } };
  const owner = { ...service, applicationTargetBinding(server, runtimeRole) {
    state.bindings++;
    return { connectionName: server, targetAuthority: { server, runtimeRole: { code: runtimeRole } } };
  } };
  const request = { tenant: "default", authData: { principalId: "operator" },
    httpRequest: { headers: { authorization: "Bearer original-operator" } } };
  const group = owner.preparationGroups({ code: "partner" }, request, [{
    code: "partner:issuance", type: "DATA_RELEASE", dataType: "sample", required: true,
    targetServer: "commerce", targetRuntimeRole: "COMMERCE",
  }])[0];
  return { state, owner, request, group };
}

test("data-release dispatch selects current bounded owner policy with unchanged transport authority", async t => {
  const { state, owner, request, group } = fixture(t);
  assert.equal(defaults.dataReleaseTimeoutMs, 120000);
  assert.equal(group.timeoutMs, undefined);
  for (const selected of [undefined, 1000, 120000, 360000, 600000]) {
    state.configuration = selected === undefined ? {} : { dataReleaseTimeoutMs: selected };
    for (const mode of ["preflight", "execute"]) {
      await owner.invokeDataReleaseOperation(mode, group, request);
      const invocation = state.invocations.at(-1);
      assert.equal(invocation.timeoutMs, selected === undefined ? 120000 : selected);
      assert.equal(invocation.apiName, "/sample/" + (mode === "preflight" ? "validate" : "install"));
      assert.equal(invocation.local, false);
      assert.equal(invocation.maxAttempts, 1);
      assert.deepEqual(invocation.header, { Authorization: "Bearer original-operator" });
      assert.deepEqual(invocation.targetAuthority, { server: "commerce", runtimeRole: { code: "COMMERCE" } });
      assert.deepEqual(invocation.requestBody, {
        dataType: "sample", releaseCodes: ["partner:issuance"], expectedReleases: undefined,
      });
      assert.equal(invocation.idempotencyKey, mode === "execute" ? group.idempotencyKey : undefined);
    }
  }
});

test("invalid configured timeouts refuse before target binding and transport", t => {
  const { state, owner, request, group } = fixture(t);
  for (const invalid of [null, false, true, "360000", "", 0, 999, 600001, -1, 1000.5, NaN, Infinity, {}, [], Number.MAX_SAFE_INTEGER + 1]) {
    state.configuration = { dataReleaseTimeoutMs: invalid };
    for (const mode of ["preflight", "execute"]) {
      assert.throws(() => owner.invokeDataReleaseOperation(mode, group, request), error => error.code === "ERR_BOF_00081");
    }
  }
  assert.equal(state.bindings, 0);
  assert.deepEqual(state.invocations, []);
});

test("body and group timeout fields cannot override owner policy or enable retries", async t => {
  const { state, owner, request, group } = fixture(t);
  state.configuration = { dataReleaseTimeoutMs: 360000 };
  request.applicationInitialization = { dataReleaseTimeoutMs: 600000, timeoutMs: 600000 };
  request.httpRequest.body = { dataReleaseTimeoutMs: 600000, timeoutMs: 600000, maxAttempts: 5 };
  await owner.invokeDataReleaseOperation("execute", { ...group, timeoutMs: 600000 }, request);
  assert.equal(state.invocations[0].timeoutMs, 360000);
  assert.equal(state.invocations[0].maxAttempts, 1);
  assert.equal(state.invocations[0].requestBody.timeoutMs, undefined);
  assert.equal(state.invocations[0].requestBody.dataReleaseTimeoutMs, undefined);
});

test("global timeout selection preserves the complete resolved profile digest", t => {
  const { state, owner } = fixture(t);
  const profile = { code: "partner", owner: "partner.app", applicationCode: "partner",
    siteCode: "partnerSite", baselineCode: "partnerBaseline", target: { connectionName: "stagedContent" } };
  const before = owner.resolveProfile(profile);
  state.configuration.dataReleaseTimeoutMs = 360000;
  const after = owner.resolveProfile(profile);
  assert.deepEqual(after, before);
  assert.equal(observer.digest(after), observer.digest(before));
  assert.equal(after.dataReleaseTimeoutMs, undefined);
});
