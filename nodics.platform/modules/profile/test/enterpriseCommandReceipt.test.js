/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module profile/test/enterpriseCommandReceipt @description Native aggregate and invitation receipt bindings preserve existing authorization, consent and original dispatch. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/enterprise/defaultEnterpriseCommandReceiptService");
const management = require("../src/service/enterprise/defaultEnterpriseManagementService");
const protocol = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");

/** Provides a private durable journal without replacing Profile's receipt or wrapper implementation. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    NODICS: global.NODICS,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  const state = {
    rows: new Map(),
    calls: 0,
    grants: true,
    administrator: true,
    consent: true,
    checks: 0,
  };
  const envelope = (result) => ({
    code: "SUC_PROFILE",
    result: structuredClone(result),
  });
  const profile = {
    ...management,
    authorize: () => {
      state.checks++;
    },
    isPlatformAdministrator: () => state.administrator,
    authorizeEnterpriseAccess: () => {},
    rolePolicy: (role) => {
      assert.equal(role, "employee");
    },
    createFromModelOriginal: async (request) => {
      state.calls++;
      return { code: request.payload.model.code };
    },
    preAssignAccessOriginal: async (request) => {
      state.calls++;
      return {
        code: "invitation",
        enterpriseCode: owner.enterprise(request),
        email: request.body.email,
        roleCode: request.body.roleCode,
        status: "PENDING",
      };
    },
  };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.CONFIG = { get: () => ({ enabled: true, owners: { profile: true } }) };
  global.NODICS = {
    getModule: () => ({
      rawSchema: {
        profileCommandReceipt: {
          commandReceiptJournal: true,
          model: true,
          router: { enabled: false },
          cache: { enabled: false },
          event: { enabled: false },
          service: { enabled: true },
          backoffice: { enabled: false },
        },
      },
    }),
  };
  global.SERVICE = {
    DefaultEnterpriseManagementService: profile,
    DefaultEnterpriseCommandReceiptService: owner,
    DefaultModelCommandReceiptService: protocol,
    DefaultSchemaUtilityService: {
      getIdempotencyKey: (request) => request.idempotencyKey,
      buildDescriptor: () => ({ operations: ["create"] }),
    },
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: () => [],
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: () => state.grants,
    },
    DefaultEnterpriseAdministrationConsentService: {
      authorizeInvitation: async () => {
        if (!state.consent) throw new Error("consent revoked");
      },
    },
    DefaultProfileCommandReceiptService: {
      get: async (r) =>
        envelope(
          [...state.rows.values()].filter((row) =>
            Object.entries(r.query).every(([k, v]) => row[k] === v),
          ),
        ),
      save: async (r) => {
        assert.equal(r.internalPersistence, "DURABLE_JOURNAL");
        assert.equal(r.options.insertOnly, true);
        if (state.rows.has(r.model.code)) throw new Error("duplicate");
        state.rows.set(r.model.code, structuredClone(r.model));
        return envelope(r.model);
      },
      update: async (r) => {
        const row = state.rows.get(r.query.code);
        const match =
          row && Object.entries(r.query).every(([k, v]) => row[k] === v);
        if (match) Object.assign(row, r.model);
        return envelope({ matchedCount: match ? 1 : 0 });
      },
    },
  };
  const request = {
    tenant: "tenant",
    authData: {
      tenant: "tenant",
      entCode: "owner",
      loginId: "admin",
      principalType: "human",
      tokenType: "access",
    },
    idempotencyKey: "original-key",
    payload: { model: { code: "customer", name: "Customer" } },
  };
  return { state, profile, request };
}

test("enterprise creation uses its original setup and inspection never invokes setup again", async (t) => {
  const f = fixture(t);
  await f.profile.createFromModel(f.request);
  const receipt = await owner.inspectCreation({
    ...f.request,
    body: {
      model: f.request.payload.model,
      idempotencyKey: f.request.idempotencyKey,
    },
  });
  assert.equal(receipt.state, "COMPLETED");
  assert.equal(receipt.resultIdentity, "customer");
  await assert.rejects(f.profile.createFromModel(f.request));
  assert.equal(f.state.calls, 1);
  f.state.administrator = false;
  await assert.rejects(
    owner.inspectCreation({
      ...f.request,
      body: {
        model: f.request.payload.model,
        idempotencyKey: f.request.idempotencyKey,
      },
    }),
  );
});

test("invitation body fallback preserves internal native target and inspection rechecks consent", async (t) => {
  const f = fixture(t);
  f.state.administrator = false;
  f.request.body = {
    enterpriseCode: "customer",
    email: "employee@example.invalid",
    roleCode: "employee",
    idempotencyKey: "invite-key",
  };
  await f.profile.preAssignAccess(f.request);
  const request = {
    ...f.request,
    body: { command: f.request.body, idempotencyKey: "invite-key" },
  };
  assert.equal((await owner.inspectInvitation(request)).state, "COMPLETED");
  assert.equal(f.state.calls, 1);
  f.state.consent = false;
  await assert.rejects(owner.inspectInvitation(request));
  assert.equal(f.state.calls, 1);
});

test("revoked native permission or contradictory success cannot become a completion", async (t) => {
  const f = fixture(t);
  f.state.grants = false;
  await assert.rejects(f.profile.createFromModel(f.request));
  assert.equal(f.state.calls, 0);
  f.state.grants = true;
  f.profile.createFromModelOriginal = async () => ({
    code: "customer",
    acknowledged: false,
  });
  await assert.rejects(f.profile.createFromModel(f.request));
  assert.equal(
    (
      await owner.inspectCreation({
        ...f.request,
        body: {
          model: f.request.payload.model,
          idempotencyKey: f.request.idempotencyKey,
        },
      })
    ).state,
    "OUTCOME_UNKNOWN",
  );
});
