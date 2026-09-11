/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteRequestContract @description Verifies trusted context survives API relocation and project adapters reuse the same mapper. @layer test @owner eWaste */
const test = require("node:test");
const assert = require("node:assert/strict");
const mapper = require("../src/service/defaultEWasteRequestService");
const xp = require("../src/service/defaultEWasteExperienceService");
test.afterEach(() => {
  delete global.SERVICE;
  delete global.CONFIG;
});
test("body fields cannot replace authenticated owner/context or select a service", async () => {
  const auth = { tenant: "isolated", loginId: "customer@example.test" };
  global.CONFIG = { get: () => "default" };
  global.SERVICE = {
    DefaultWasteItemDescriptorService: { projectResponse: async (data) => data },
    DefaultEWasteExperienceService: {
      resolveCustomer: async (input) => {
        assert.equal(input.authData, auth);
        return input;
      },
      account: async (input) => {
        assert.equal(input.tenant, "isolated");
        assert.equal(input.code, "asset-1");
        assert.equal(input.idempotencyKey, "header-key");
        assert.equal(input.confirmed, false);
        return { owner: input.authData.loginId };
      },
    },
  };
  const result = await mapper.invoke("account", {
    authData: auth,
    httpRequest: {
      params: { code: "asset-1" },
      headers: { "idempotency-key": "header-key" },
      body: {
        tenant: "other",
        authData: { loginId: "victim" },
        serviceName: "unsafe",
        confirmed: "true",
        idempotencyKey: "body-key",
      },
    },
  });
  assert.equal(result.data.owner, "customer@example.test");
});
test("the configured valuation service is used and a missing one fails closed", async () => {
  global.CONFIG = {
    get: () => ({ rewardValuationService: "PartnerValuation" }),
  };
  global.SERVICE = {
    DefaultWastePersistenceService: {
      one: async () => ({ code: "impact" }),
      fail: (code) => {
        throw Error(code);
      },
      update: async (_s, _r, asset, patch) => ({ ...asset, ...patch }),
    },
    PartnerValuation: {
      assess: async () => ({
        version: "partner",
        pointsRewardTypeCode: "points",
        rewards: [],
      }),
    },
  };
  const scoped = Object.assign({}, xp, {
    remote: async () => ({ code: "wallet" }),
  });
  const result = await scoped.settle(
    {},
    {
      code: "asset",
      ownerRef: { code: "owner" },
      impactRef: { code: "impact" },
      metadata: {},
    },
  );
  assert.equal(result.metadata.valuation.version, "partner");
  delete global.SERVICE.PartnerValuation;
  await assert.rejects(
    () => scoped.settle({}, { metadata: {} }),
    /ERR_EWASTE_VALUATION_UNAVAILABLE/,
  );
});
