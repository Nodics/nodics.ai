/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/profileVerifiedContactWorkspaceContract @description Deferred Customer Contact metadata fixtures for private capture, live canonical/projection admission, bounded presentation and no-write safe transport. @layer test @owner profile */
"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const source = require("../src/service/contact/defaultProfileVerifiedContactWorkspaceService");
const contactSource = require("../src/service/contact/defaultProfileVerifiedContactService");
const controller = require("../src/controller/customer/defaultProfileVerifiedContactWorkspaceController");
const facade = require("../src/facade/customer/defaultProfileVerifiedContactWorkspaceFacade");

/** Builds a source-only fixture using the real Contact policy/purpose validator and exact private request admission. @returns {Object} Isolated owner, policy and actor fixtures. */
function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const owner = { ...source },
    contact = { ...contactSource },
    admitted = new WeakSet();
  const policy = {
    enabled: true,
    qualified: true,
    contactCasQualified: true,
    crudProtectionQualified: true,
    readPrivacyQualified: true,
    verificationTransportQualified: true,
    permission: "profile.customer.contact.manage",
    maximumContacts: 100,
    maximumVerifiedAgeSeconds: 3600,
    clockSkewSeconds: 0,
    purposes: {
      PURCHASED: {
        category: "TRANSACTIONAL",
        version: 1,
        requiresConsent: true,
        channels: ["EMAIL", "SMS"],
      },
    },
    purposeLabels: { PURCHASED: "Purchase updates" },
    presentation: Object.fromEntries(
      owner.presentationKeys().map((key) => [key, "Configured " + key]),
    ),
  };
  global.CONFIG = {
    get: (key) => (key === "profileVerifiedContacts" ? policy : undefined),
  };
  let identity = {
    tenantCode: "tenant",
    recordKind: "CUSTOMER",
    recordId: "canonical-customer",
  };
  const row = {
    _id: "actual-projection-id",
    loginId: "customer@example.test",
    active: true,
    principalType: "customer",
    contacts: ["private-contact"],
    address: "private-address",
    proof: "private-proof",
  };
  const reads = [],
    permissions = [],
    calls = { actors: 0, forbidden: 0 };
  const forbidden = () => {
    calls.forbidden++;
    throw new Error(
      "Metadata must not dispatch Contact persistence or delivery",
    );
  };
  for (const method of ["begin", "verify", "consent", "suppress", "deliver"])
    contact[method] = forbidden;
  const m = {
    actor: async () => {
      calls.actors++;
      return { identity: { ...identity } };
    },
    inventory: async (service, tenant, query) => {
      reads.push({ service, tenant, query });
      return [row];
    },
    resolve: async () => ({ identity: { ...identity } }),
    recordId: (value) => value,
    digest: (value) => JSON.stringify(value),
    permission: (request, permission) => permissions.push(permission),
  };
  global.SERVICE = {
    DefaultLoggerService: {
      assertSensitiveRequest: (request) => {
        if (!admitted.has(request))
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
      },
    },
    DefaultProfileVerifiedContactService: contact,
    DefaultEnterpriseMembershipService: m,
    DefaultProfileVerifiedContactWorkspaceService: owner,
    DefaultContactService: new Proxy({}, { get: () => forbidden }),
    DefaultCommunicationService: new Proxy({}, { get: () => forbidden }),
  };
  global.FACADE = { DefaultProfileVerifiedContactWorkspaceFacade: facade };
  const request = {
    tenant: "tenant",
    authData: {
      tenant: "tenant",
      loginId: row.loginId,
      principalType: "customer",
      tokenType: "access",
    },
    body: {},
    query: {},
    params: {},
  };
  admitted.add(request);
  return {
    owner,
    contact,
    policy,
    request,
    row,
    m,
    reads,
    permissions,
    calls,
    admit: (value) => admitted.add(value),
    setIdentity: (value) => {
      identity = value;
    },
  };
}

test("workspace derives self Customer projection ID and publishes only detached configured metadata", async () => {
  const f = fixture(),
    value = await f.owner.workspace(f.request);
  assert.deepEqual(Object.keys(value).sort(), [
    "channels",
    "contractVersion",
    "kind",
    "ownerId",
    "presentation",
    "purposes",
  ]);
  assert.equal(value.contractVersion, 1);
  assert.equal(value.kind, "PROFILE_VERIFIED_CONTACT_WORKSPACE");
  assert.equal(value.ownerId, "actual-projection-id");
  assert.deepEqual(value.channels, ["EMAIL", "SMS"]);
  assert.deepEqual(value.purposes, [
    {
      code: "PURCHASED",
      version: 1,
      channels: ["EMAIL", "SMS"],
      label: "Purchase updates",
    },
  ]);
  assert.equal(JSON.stringify(value).includes("canonical-customer"), false);
  assert.equal(JSON.stringify(value).includes("private-contact"), false);
  assert.equal(JSON.stringify(value).includes("private-address"), false);
  assert.equal(JSON.stringify(value).includes("private-proof"), false);
  assert.deepEqual(
    f.reads,
    Array.from({ length: 2 }, () => ({
      service: "DefaultCustomerService",
      tenant: "tenant",
      query: { loginId: f.row.loginId },
    })),
  );
  value.presentation.title = "Consumer mutation";
  value.purposes[0].channels.pop();
  assert.equal(f.policy.presentation.title, "Configured title");
  assert.deepEqual(f.policy.purposes.PURCHASED.channels, ["EMAIL", "SMS"]);
  assert.equal(f.calls.forbidden, 0);
});

test("every configured task string rejects missing, non-string, oversized and accessor values before private reads", async () => {
  for (const key of source.presentationKeys()) {
    for (const defect of [
      "missing",
      "null",
      "object",
      "blank",
      "oversize",
      "hidden",
      "accessor",
    ]) {
      const f = fixture();
      let evaluated = false;
      if (defect === "missing") delete f.policy.presentation[key];
      if (defect === "null") f.policy.presentation[key] = null;
      if (defect === "object") f.policy.presentation[key] = {};
      if (defect === "blank") f.policy.presentation[key] = " ";
      if (defect === "oversize")
        f.policy.presentation[key] = "x".repeat(key === "title" ? 161 : 501);
      if (defect === "hidden")
        Object.defineProperty(f.policy.presentation, key, {
          enumerable: false,
        });
      if (defect === "accessor")
        Object.defineProperty(f.policy.presentation, key, {
          enumerable: true,
          get: () => {
            evaluated = true;
            return "Unsafe";
          },
        });
      await assert.rejects(f.owner.workspace(f.request), {
        code: "ERR_AUTH_00003",
      });
      assert.equal(evaluated, false);
      assert.equal(f.reads.length, 0);
      assert.equal(f.calls.forbidden, 0);
    }
  }
  for (const defect of [
    "symbol",
    "accessor",
    "hidden",
    "oversize",
    "nonstring",
  ]) {
    const f = fixture();
    let evaluated = false;
    if (defect === "symbol")
      f.policy.purposeLabels[Symbol("private")] = "Extra";
    if (defect === "accessor")
      Object.defineProperty(f.policy.purposeLabels, "PURCHASED", {
        enumerable: true,
        get: () => {
          evaluated = true;
          return "Unsafe";
        },
      });
    if (defect === "hidden")
      Object.defineProperty(f.policy.purposeLabels, "PURCHASED", {
        enumerable: false,
      });
    if (defect === "oversize")
      f.policy.purposeLabels.PURCHASED = "x".repeat(501);
    if (defect === "nonstring") f.policy.purposeLabels.PURCHASED = 1;
    await assert.rejects(f.owner.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(evaluated, false);
    assert.equal(f.reads.length, 0);
  }
});

test("fresh policy and permission drift refuse publication without side effects", async () => {
  for (const defect of [
    "presentation",
    "purposeLabel",
    "version",
    "permission",
    "qualification",
  ]) {
    const f = fixture(),
      originalActor = f.m.actor;
    f.m.actor = async () => {
      const actor = await originalActor();
      if (f.calls.actors === 2) {
        if (defect === "presentation") f.policy.presentation.title = "Changed";
        if (defect === "purposeLabel")
          f.policy.purposeLabels.PURCHASED = "Changed";
        if (defect === "version") f.policy.purposes.PURCHASED.version = 2;
        if (defect === "permission")
          f.policy.permission = "different.permission";
        if (defect === "qualification") f.policy.qualified = false;
      }
      return actor;
    };
    await assert.rejects(f.owner.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(f.calls.forbidden, 0);
  }
});

test("public projection rejects nested private extensions and invalid purpose/channel ceilings", async () => {
  for (const defect of [
    "proof",
    "identity",
    "version",
    "duplicatePurpose",
    "duplicateChannel",
    "unknownChannel",
    "unusedChannel",
    "label",
    "accessor",
  ]) {
    const f = fixture(),
      value = await f.owner.workspace(f.request);
    let evaluated = false;
    if (defect === "proof") value.purposes[0].proof = "Private";
    if (defect === "identity") value.identity = "Private";
    if (defect === "version") value.purposes[0].version = 2147483648;
    if (defect === "duplicatePurpose")
      value.purposes.push({ ...value.purposes[0] });
    if (defect === "duplicateChannel")
      value.purposes[0].channels = ["EMAIL", "EMAIL"];
    if (defect === "unknownChannel") value.channels = ["PUSH"];
    if (defect === "unusedChannel") value.purposes[0].channels = ["EMAIL"];
    if (defect === "label") value.purposes[0].label = "x".repeat(501);
    if (defect === "accessor")
      Object.defineProperty(value.purposes[0], "label", {
        enumerable: true,
        get: () => {
          evaluated = true;
          return "Private";
        },
      });
    assert.throws(() => f.owner.publicWorkspace(value), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(evaluated, false);
  }
});

test("HTTP selectors are refused before standalone facade dispatch with no-store intact", async () => {
  for (const field of ["body", "query", "params"]) {
    const f = fixture(),
      headers = [];
    let dispatched = false;
    f.request.httpRequest = { [field]: { ownerId: "other" } };
    f.request.httpResponse = { setHeader: (...args) => headers.push(args) };
    FACADE.DefaultProfileVerifiedContactWorkspaceFacade = {
      workspace: async () => {
        dispatched = true;
        return {};
      },
    };
    await assert.rejects(controller.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(dispatched, false);
    assert.deepEqual(headers[0], ["Cache-Control", "no-store"]);
    assert.equal(f.reads.length, 0);
  }
});

test("Employee-backed Customer uses the Customer projection ID and requires current participation context", async () => {
  const f = fixture();
  f.setIdentity({
    tenantCode: "staff",
    recordKind: "EMPLOYEE",
    recordId: "employee-anchor",
  });
  f.row.authenticationIdentity = {
    recordKind: "EMPLOYEE",
    recordId: "employee-anchor",
  };
  await assert.rejects(f.owner.workspace(f.request), {
    code: "ERR_AUTH_00003",
  });
  f.request.authData.sessionContext = {
    owner: "profile.customerParticipation",
  };
  assert.equal(
    (await f.owner.workspace(f.request)).ownerId,
    "actual-projection-id",
  );
  f.m.actor = async () => {
    throw new CLASSES.NodicsError("STALE_PARTICIPATION");
  };
  await assert.rejects(f.owner.workspace(f.request), {
    code: "STALE_PARTICIPATION",
  });
});

test("metadata refuses selectors and forged capture without inventory or writes", async () => {
  for (const extra of [
    { body: { ownerId: "other" } },
    { query: { loginId: "other" } },
    { params: { identity: "other" } },
    { body: [] },
    { body: null },
  ]) {
    const f = fixture(),
      request = { ...f.request, ...extra };
    f.admit(request);
    await assert.rejects(f.owner.workspace(request), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(f.reads.length, 0);
  }
  const f = fixture();
  await assert.rejects(f.owner.workspace({ ...f.request, sensitive: true }), {
    code: "ERR_AUTH_00003",
  });
  assert.equal(f.reads.length, 0);
});

test("metadata refuses non-Customer/system/tenant-mismatched actors and unqualified Contact policy", async () => {
  for (const auth of [
    { principalType: "human" },
    { tokenType: "service" },
    { isSystem: true },
    { tenant: "other" },
    { loginId: {} },
  ]) {
    const f = fixture();
    Object.assign(f.request.authData, auth);
    await assert.rejects(f.owner.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(f.reads.length, 0);
  }
  for (const key of [
    "enabled",
    "qualified",
    "contactCasQualified",
    "crudProtectionQualified",
    "readPrivacyQualified",
    "verificationTransportQualified",
  ]) {
    const f = fixture();
    f.policy[key] = false;
    await assert.rejects(f.owner.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
    assert.equal(f.reads.length, 0);
  }
});

test("fresh inventory rejects ambiguity/inactive or wrong Customer projections and identity drift", async () => {
  for (const defect of [
    "empty",
    "duplicate",
    "inactive",
    "principal",
    "login",
    "identity",
    "replacement",
    "actorLoss",
  ]) {
    const f = fixture();
    if (defect === "empty") f.m.inventory = async () => [];
    if (defect === "duplicate") f.m.inventory = async () => [f.row, f.row];
    if (defect === "inactive") f.row.active = false;
    if (defect === "principal") f.row.principalType = "human";
    if (defect === "login") f.row.loginId = "other@example.test";
    if (defect === "identity")
      f.m.resolve = async () => ({
        identity: { recordKind: "CUSTOMER", recordId: "other" },
      });
    if (defect === "replacement") {
      let read = 0;
      f.m.inventory = async () => [
        { ...f.row, _id: ++read === 1 ? f.row._id : "replacement" },
      ];
    }
    if (defect === "actorLoss")
      f.m.actor = async () => {
        if (++f.calls.actors > 1)
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
        return {
          identity: {
            tenantCode: "tenant",
            recordKind: "CUSTOMER",
            recordId: "canonical-customer",
          },
        };
      };
    await assert.rejects(f.owner.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
  }
});

test("task labels and purpose copy are exact bounded configuration, never Contact descriptor extensions", async () => {
  for (const defect of [
    "missing",
    "blank",
    "oversize",
    "unknown",
    "purposeMissing",
    "purposeUnknown",
    "purposeBlank",
    "descriptorLabel",
  ]) {
    const f = fixture();
    if (defect === "missing") delete f.policy.presentation.title;
    if (defect === "blank") f.policy.presentation.ownerLabel = " ";
    if (defect === "oversize") f.policy.presentation.title = "x".repeat(161);
    if (defect === "unknown") f.policy.presentation.html = "Markup";
    if (defect === "purposeMissing") delete f.policy.purposeLabels.PURCHASED;
    if (defect === "purposeUnknown") f.policy.purposeLabels.EXTRA = "Unknown";
    if (defect === "purposeBlank") f.policy.purposeLabels.PURCHASED = "";
    if (defect === "descriptorLabel")
      f.policy.purposes.PURCHASED.label = "Not part of approved descriptor";
    await assert.rejects(f.owner.workspace(f.request), {
      code: "ERR_AUTH_00003",
    });
  }
  const f = fixture();
  f.policy.presentation.title = "t".repeat(160);
  f.policy.presentation.ownerLabel = "o".repeat(500);
  assert.equal(
    (await f.owner.workspace(f.request)).presentation.ownerLabel.length,
    500,
  );
});

test("controller requires private capture, publishes no-store, supports callback and redacts errors/output extensions", async () => {
  const f = fixture(),
    headers = [];
  f.request.httpResponse = { setHeader: (...args) => headers.push(args) };
  const result = await controller.workspace(f.request);
  assert.equal(result.code, "SUC_PRFL_00000");
  assert.deepEqual(headers[0], ["Cache-Control", "no-store"]);
  await new Promise((resolve, reject) =>
    controller.workspace(f.request, (error, value) => {
      if (error) return reject(error);
      assert.equal(value.data.ownerId, "actual-projection-id");
      resolve();
    }),
  );
  FACADE.DefaultProfileVerifiedContactWorkspaceFacade = {
    workspace: async () => {
      throw new Error("private-address provider failure");
    },
  };
  await assert.rejects(
    controller.workspace(f.request),
    (error) =>
      error.code === "ERR_AUTH_00003" &&
      !error.message.includes("private-address"),
  );
  const value = result.data;
  FACADE.DefaultProfileVerifiedContactWorkspaceFacade.workspace = async () => ({
    ...value,
    contacts: ["private-contact"],
  });
  await assert.rejects(controller.workspace(f.request), {
    code: "ERR_AUTH_00003",
  });
  await assert.rejects(
    controller.workspace({ ...f.request, sensitive: true }),
    { code: "ERR_AUTH_00003" },
  );
});
