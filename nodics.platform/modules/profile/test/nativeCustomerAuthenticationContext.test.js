/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/nativeCustomerAuthenticationContext @description Deferred native-customer fresh-state and group integration fixtures; installed issuance and refresh acceptance remain NOT RUN. @layer test @owner profile */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const implementation = require("../src/service/authentication/defaultAuthenticationProviderService");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const calls = [];
  const context = {
    anchor: {
      identity: { tenantCode: "original" },
      person: { _id: "account", loginId: "buyer" },
    },
    person: {
      userGroups: ["customer"],
      userGroupCodes: ["stale"],
      userGroupPermissions: ["stale"],
    },
    sessionContext: {
      owner: "profile.customerEligibility",
      code: "buyer",
      version: 2,
    },
  };
  global.SERVICE = {
    DefaultCustomerRegistrationService: {
      prepareCustomerEligibilityContext: async () => context,
    },
    DefaultUserStateService: {
      findUserState: async (input) => {
        calls.push(input);
        return { locked: false };
      },
    },
    DefaultEnterpriseMembershipService: {
      groups: async (tenant, groups) => {
        calls.push({ tenant, groups });
        return [{ code: "fresh", permissions: ["customer.read"] }];
      },
    },
  };
  return {
    context,
    calls,
    owner: {
      ...implementation,
      resolveSessionUserGroups: (person) => person.userGroups,
    },
  };
}

test("native context uses original current lockout and fresh groups, never cached permissions", async () => {
  const { owner, calls } = fixture();
  const result = await owner.prepareNativeCustomerContext({
    person: {},
    enterprise: {},
  });
  assert.deepEqual(calls[0], {
    tenant: "original",
    loginId: "buyer",
    _id: "account",
  });
  assert.deepEqual(result.person.userGroups, [
    { code: "fresh", permissions: ["customer.read"] },
  ]);
  assert.equal(result.person.userGroupCodes, undefined);
  assert.equal(result.person.userGroupPermissions, undefined);
  assert.equal(result.sessionContext.owner, "profile.customerEligibility");
});

test("missing or locked original state refuses native context preparation", async () => {
  for (const state of [null, { locked: true }]) {
    const { owner } = fixture();
    SERVICE.DefaultUserStateService.findUserState = async () => state;
    await assert.rejects(
      owner.prepareNativeCustomerContext({ person: {}, enterprise: {} }),
      { code: "ERR_AUTH_00001" },
    );
  }
});

test("eligibility owner failure propagates without substituting enterprise membership", async () => {
  const { owner, calls } = fixture();
  SERVICE.DefaultCustomerRegistrationService.prepareCustomerEligibilityContext =
    async () => {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    };
  await assert.rejects(
    owner.prepareNativeCustomerContext({ person: {}, enterprise: {} }),
    { code: "ERR_AUTH_00001" },
  );
  assert.equal(calls.length, 0);
});
