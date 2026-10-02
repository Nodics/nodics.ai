/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/customerParticipationLifecycleContract @description Injected withdrawal/CAS/invalidation fixtures, not consent/browser acceptance. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/customer/defaultCustomerRegistrationService");
test("withdrawal preserves identity/history, advances consent revision and invalidates its independent binding", async () => {
  const identity = {
      tenantCode: "source",
      recordKind: "EMPLOYEE",
      recordId: "original",
    },
    stamps = [];
  let mutationRequest;
  const person = {
    _id: "projection",
    code: "CUSTOMER_PARTICIPATION_hash",
    active: true,
    authenticationIdentity: identity,
    customerParticipation: {
      phase: "COMPLETE",
      enterpriseCode: "business",
      revision: 4,
      termsDigest: "old",
      history: [{ version: "v0" }],
    },
  };
  global.CONFIG = {
    get: () => ({ enabled: true, qualified: true, lifecycleQualified: true }),
  };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: {
      base: () => ({
        input: (value, keys) => {
          if (Object.keys(value).some((key) => !keys.includes(key)))
            throw Error("selector");
          return value;
        },
        assertWrite: () => true,
      }),
      digest: (value) =>
        Array.isArray(value) ? "hash" : JSON.stringify(value),
      actor: async () => ({ identity }),
      read: async () => person,
      fail: (key) => {
        throw Error(key);
      },
    },
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async () => ({
        tenantCode: "target",
        enterprise: { code: "business" },
      }),
    },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({}) },
    DefaultCustomerService: {
      update: async (command) => {
        mutationRequest = command;
        assert.equal(source.ownsParticipationWrite(command), true);
        assert.equal(command.query["customerParticipation.revision"], 4);
        person.customerParticipation = command.model.$set.customerParticipation;
        return { result: { acknowledged: true, matchedCount: 1 } };
      },
    },
    DefaultPrincipalSecurityStampService: {
      register: async (...args) => stamps.push(args),
    },
  };
  const request = {
    tenant: "target",
    authData: {
      principalType: "human",
      authenticationMethod: "PASSWORD",
      entCode: "business",
    },
    body: { revision: 4, confirmed: true },
    query: {},
  };
  const result = await source.changeParticipation(request, "WITHDRAW");
  assert.equal(source.ownsParticipationWrite(mutationRequest), false);
  assert.equal(result.phase, "WITHDRAWN");
  assert.equal(result.revision, 5);
  assert.deepEqual(person.customerParticipation.history, [{ version: "v0" }]);
  assert.deepEqual(person.authenticationIdentity, identity);
  assert.deepEqual(stamps, [
    ["target", "participation:CUSTOMER:projection", 5],
  ]);
  await assert.rejects(
    source.changeParticipation(request, "WITHDRAW"),
    /CONFLICT/,
  );
});

test("workspace current terms and switching require fresh owner proof; deferred consent drift and unqualified browser flow stay closed", async () => {
  const identity = {
    tenantCode: "source",
    recordKind: "EMPLOYEE",
    recordId: "original",
  };
  const policy = {
    browserContextQualified: true,
    terms: { version: "v1", digest: "approved-digest", documentCode: "terms" },
    presentation: { continueLabel: "Continue" },
  };
  const person = {
    _id: "projection",
    principalType: "customer",
    active: true,
    authenticationIdentity: identity,
    customerParticipation: {
      phase: "COMPLETE",
      revision: 4,
      enterpriseCode: "business",
      termsVersion: "v1",
      termsDigest: "approved-digest",
      termsDocumentCode: "terms",
      acceptedAt: "2026-01-01T00:00:00.000Z",
      eligibilityDecisionId: "fixture_only",
    },
  };
  let drift = false,
    calls = 0;
  global.SERVICE = {
    DefaultEnterpriseMembershipService: {
      base: () => ({
        input: (value, keys) => {
          assert.deepEqual(Object.keys(value), keys);
          return value;
        },
      }),
      actor: async () => ({ identity }),
      digest: (value) => JSON.stringify(value),
      read: async () => structuredClone(person),
      fail: (code) => {
        throw Error(code);
      },
    },
    DefaultEnterpriseManagementService: {
      retrieveEnterpriseForAccess: async () => ({
        enterprise: { code: "business" },
        tenantCode: "target",
      }),
    },
  };
  const owner = {
    ...source,
    participationPolicy: () => policy,
    validateParticipationTerms: () => true,
    prepareParticipationSession: async (request) => {
      calls++;
      assert.deepEqual(request.body, { revision: 4 });
      await Promise.resolve();
      if (drift)
        person.customerParticipation = {
          ...person.customerParticipation,
          phase: "WITHDRAWN",
          revision: 5,
        };
      return {
        tenantCode: "target",
        context: { anchor: { identity }, sessionContext: { version: 4 } },
      };
    },
  };
  const request = {
    tenant: "target",
    body: {},
    query: {},
    authData: {
      principalType: "human",
      authenticationMethod: "PASSWORD",
      entCode: "business",
    },
  };
  let result = await owner.participationWorkspace(request);
  assert.equal(result.participation.currentTerms, true);
  assert.equal(result.participation.canSwitch, true);
  assert.equal(Object.hasOwn(result, "securityBindings"), false);
  policy.browserContextQualified = false;
  result = await owner.participationWorkspace(request);
  assert.equal(result.participation.canSwitch, false);
  assert.equal(calls, 1);
  policy.browserContextQualified = true;
  drift = true;
  result = await owner.participationWorkspace(request);
  assert.equal(result.participation.currentTerms, false);
  assert.equal(result.participation.canSwitch, false);
  assert.equal(result.participation.revision, 5);
  assert.equal(person.customerParticipation.phase, "WITHDRAWN");
});

test("failed consent writes release exact private admission and caller flags do not acquire it", async () => {
  const command = { model: { customerParticipation: { revision: 1 } } };
  global.SERVICE = {
    DefaultCustomerService: {
      update: async (request) => {
        assert.equal(source.ownsParticipationWrite(request), true);
        assert.equal(source.ownsParticipationWrite({ ...request }), false);
        throw Error("write failed");
      },
    },
  };
  await assert.rejects(
    source.participationWrite("update", command),
    /write failed/,
  );
  assert.equal(source.ownsParticipationWrite(command), false);
  assert.equal(
    source.ownsParticipationWrite({ body: { private: true } }),
    false,
  );
});
