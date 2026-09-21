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
test("settlement consumes persisted confirmed Rules evidence and missing evidence fails closed", async () => {
  const assessment = {
    code: "reward-assessment",
    assetCode: "asset",
    assessmentType: "CONFIRMED",
    rewardTypeCode: "points",
    rewardAmount: "12.00",
    rewardOutcome: {},
    policyCode: "EWASTE_REWARD",
    policyVersion: 2,
    bandSetCode: "EWASTE_BANDS",
    bandSetVersion: 1,
    scoreBandCode: "STANDARD",
    sourceHash: "source-hash",
  };
  global.CONFIG = {
    get: () => ({ rewardRules: { loyaltyProgramCode: "default", rewardScale: 2 } }),
  };
  global.SERVICE = {
    DefaultWastePersistenceService: {
      one: async () => assessment,
      fail: (code) => {
        throw Error(code);
      },
      update: async (_s, _r, asset, patch) => ({ ...asset, ...patch }),
    },
  };
  const calls = [];
  const scoped = Object.assign({}, xp, {
    remote: async (_request, _module, _connection, route, _method, body) => {
      calls.push({ route, body });
      return route === "/wallets"
        ? { code: "wallet" }
        : { ledgerEntry: { code: "ledger-entry" } };
    },
  });
  const result = await scoped.settle(
    {},
    {
      code: "asset",
      ownerRef: { code: "owner" },
      metadata: {
        confirmedRewardAssessmentRef: { code: assessment.code },
        settlementStatus: "PENDING",
      },
    },
  );
  assert.equal(result.metadata.rewardSettlement.assessmentCode, assessment.code);
  assert.equal(calls[1].body.sourceCode, assessment.code);
  await assert.rejects(
    () => scoped.settle({}, { metadata: {} }),
    /ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED/,
  );
});

test("customer resolution preserves its bearer, authenticated login and Profile canonical code", async () => {
  let calls = [];
  global.CONFIG = { get: () => ({}) };
  global.SERVICE = {
    DefaultWastePersistenceService: { fail: (code) => { throw Error(code); } },
    DefaultModuleService: { invokeModule: async input => { calls.push(input); return { data: [{ code: 'canonical-customer', loginId: 'self@example.test' }] }; } },
  };
  const request = { tenant: 'isolated', authorization: 'Bearer customer-token', authData: { principalType: 'customer', loginId: 'self@example.test' }, payload: { loginId: 'other@example.test', code: 'forged' } };
  await xp.resolveCustomer(request);
  assert.equal(request.authData.code, 'canonical-customer');
  assert.equal(calls[0].header.Authorization, 'Bearer customer-token');
  assert.deepEqual(calls[0].requestBody.query, { loginId: 'self@example.test' });
  await assert.rejects(() => xp.resolveCustomer({ ...request, authorization: undefined }), /ERR_WASTE_CUSTOMER_REQUIRED/);
  assert.equal(calls.length, 1);
  await xp.remote(request, 'loyaltyApi', 'loyalty', '/wallet-projections', 'POST', { ownerCode: 'canonical-customer' });
  assert.equal(calls[1].header.Authorization, undefined);
});


test("preparation automatically assesses both singles and bundles with the saved revision", async () => {
 for (const submissionUnit of [undefined,"BUNDLE"]) {
  const draft={code:"D",revision:7,submissionStatus:"METADATA_SUGGESTED",submittedFacts:{submissionUnit}};
  global.SERVICE={DefaultEWasteSubmissionPreparationService:{prepare:async()=>draft}};
  let calls=0;
  const scoped={...xp,estimate:async request=>{calls++;assert.equal(request.code,"D");assert.equal(request.expectedRevision,7);assert.equal(request.tenant,"tenant");return {...draft,revision:8,metadata:{estimate:{}}}}};
  assert.equal((await scoped.prepareSubmission({tenant:"tenant",expectedRevision:0})).revision,8);
  assert.equal(calls,1);
  scoped.estimate=async()=>{throw Error("provider unavailable")};
  await assert.rejects(scoped.prepareSubmission({}),/provider unavailable/);
  draft.submissionStatus="SUBMITTED";
  assert.equal(await scoped.prepareSubmission({}),draft);
 }
});
