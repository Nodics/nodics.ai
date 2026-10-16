/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/test/eWasteRewardSettlementContract @description Verifies approval settles only immutable confirmed Rules evidence through Loyalty-owned wallet operations. @layer test @owner eWaste */
const assert = require("node:assert/strict");
const service = require("../src/service/defaultEWasteExperienceService");
const rewardOwner = require("../src/service/defaultEWasteRewardAssessmentOperationService");
const request = { tenant: "default", authData: { tenant: "default" } };
const verificationRef = { module: "wasteVerification", schema: "wasteVerification", code: "decision-1" };

const assessment = {
  code: "SUB-1_REWARD_CONFIRMED_POLICY_V1_R4",
  assetCode: "WASTE_ASSET_SUB-1",
  submissionCode: "SUB-1",
  sourceVerificationRef: verificationRef,
  assessmentType: "CONFIRMED",
  rewardTypeCode: "SUSTAINABILITY_REWARD",
  rewardAmount: "200.00",
  rewardOutcome: { programCode: "sustainability", scale: 2 },
  policyCode: "EWASTE_DOMAIN",
  policyVersion: 1,
  bandSetCode: "EWASTE_BANDS",
  bandSetVersion: 1,
  scoreBandCode: "HIGH",
  sourceHash: "assessment-source-hash",
  correlationId: "corr-1",
};
const asset = {
  code: "WASTE_ASSET_SUB-1",
  revision: 2,
  ownerRef: { module: "profile", schema: "customer", code: "customer-1" },
  originalOwnerRef: { module: "profile", schema: "customer", code: "customer-1" },
  sourceSubmissionCode: "SUB-1",
  verificationRef,
  metadata: {
    confirmedRewardAssessmentRef: {
      module: "wasteReward",
      schema: "wasteRewardAssessment",
      code: assessment.code,
    },
    settlementStatus: "PENDING",
  },
};
let saved;
const requests = [];
const store = {
  list: async (schema, _request, query, limit) => {
    assert.equal(schema, "wasteSubmission");
    assert.deepEqual(query, { code: "SUB-1" });
    assert.equal(limit, 2);
    return [{ code: "SUB-1", submissionStatus: "APPROVED", submitterRef: asset.originalOwnerRef, verificationRef }];
  },
  one: async (schema, request, code) => {
    assert.equal(schema, "wasteRewardAssessment");
    assert.equal(code, assessment.code);
    return assessment;
  },
  update: async (schema, request, current, patch) => {
    assert.equal(schema, "wasteAsset");
    saved = { ...current, ...patch, revision: current.revision + 1 };
    return saved;
  },
  fail: (code, message) => {
    const error = new Error(message);
    error.code = code;
    throw error;
  },
};
const originalStore = service.store;
const originalRemote = service.remote;
global.CONFIG = {
  get: () => ({
    rewardRules: { loyaltyProgramCode: "default", rewardScale: 2 },
  }),
};
service.store = () => store;
global.SERVICE = { DefaultWastePersistenceService: store, DefaultEWasteRewardAssessmentOperationService: rewardOwner };
service.remote = async (request, moduleName, connectionName, apiName, methodName, body) => {
  requests.push({ moduleName, connectionName, apiName, methodName, body });
  if (apiName === "/wallets") return { code: "wallet-1" };
  if (apiName === "/reward-earnings")
    return { ledgerEntry: { code: "rewardLedgerEntry-1" } };
  throw new Error("unexpected remote operation");
};

(async () => {
  const result = await service.settle(
    { ...request, correlationId: "corr-runtime" },
    asset,
  );
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0], {
    moduleName: "loyaltyApi",
    connectionName: "loyalty",
    apiName: "/wallets",
    methodName: "POST",
    body: { ownerType: "CUSTOMER", ownerCode: "customer-1" },
  });
  assert.deepEqual(requests[1].body, {
    walletCode: "wallet-1",
    programCode: "sustainability",
    rewardTypeCode: "SUSTAINABILITY_REWARD",
    amount: "200.00",
    scale: 2,
    sourceType: "WASTE_REWARD_ASSESSMENT",
    sourceCode: assessment.code,
    targetType: "WASTE_ASSET",
    targetCode: asset.code,
    reasonCode: "APPROVED_SUBMISSION",
    idempotencyKey: assessment.code + ":wallet-settlement",
    correlationId: "corr-runtime",
    metadata: {
      assessmentCode: assessment.code,
      policyCode: "EWASTE_DOMAIN",
      policyVersion: 1,
      bandSetCode: "EWASTE_BANDS",
      bandSetVersion: 1,
      scoreBandCode: "HIGH",
      sourceHash: "assessment-source-hash",
    },
  });
  assert.equal(result.metadata.settlementStatus, "COMPLETED");
  assert.equal(result.metadata.rewardSettlement.assessmentCode, assessment.code);
  assert.equal(result.rewardSettlementRefs[0].code, "rewardLedgerEntry-1");
  const replay = await service.settle(
    { ...request, correlationId: "corr-runtime" },
    result,
  );
  assert.equal(replay, result);
  assert.equal(requests.length, 2, "completed replay must not post another earning");

  await assert.rejects(
    service.settle(
      { tenant: "default" },
      { ...asset, metadata: {}, revision: 2 },
    ),
    /persisted confirmed reward assessment is required/,
  );
  const originalOne = store.one;
  store.one = async () => ({ ...assessment, assetCode: "another-asset" });
  await assert.rejects(service.settle({ tenant: "default" }, asset), /different asset/);
  store.one = originalOne;

  const zeroAssessment = { ...assessment, code: "ASSESSMENT_ZERO", rewardAmount: "0" };
  store.one = async () => zeroAssessment;
  const callsBeforeZero = requests.length;
  const zeroResult = await service.settle(
    { tenant: "default" },
    {
      ...asset,
      metadata: {
        confirmedRewardAssessmentRef: {
          module: "wasteReward",
          schema: "wasteRewardAssessment",
          code: zeroAssessment.code,
        },
        settlementStatus: "PENDING",
      },
    },
  );
  assert.equal(requests.length, callsBeforeZero, "zero outcomes must not open or post to a wallet");
  assert.equal(zeroResult.metadata.settlementStatus, "COMPLETED");
  assert.deepEqual(zeroResult.rewardSettlementRefs, []);
  store.one = originalOne;
  assert(saved, "settlement must persist the Loyalty ledger reference on the asset");
  console.log("eWaste confirmed Rules assessment to Loyalty settlement contract validated");
})()
  .finally(() => {
    service.store = originalStore;
    service.remote = originalRemote;
    delete global.CONFIG;
    delete global.SERVICE;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
