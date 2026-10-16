/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteApprovedAssetRecovery @description Exercises approved replay and settlement retry through the shared Waste resolver and generated persistence with isolated repositories. @layer test @owner eWaste */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const experience = require("../src/service/defaultEWasteExperienceService");
const waste = "../../../../../../nodics.waste/modules/";
const verification = require(waste + "wasteVerification/src/service/defaultWasteVerificationOperationService");
const persistence = require(waste + "wasteCore/src/service/defaultWastePersistenceService");
const creation = require(waste + "wasteCore/src/service/defaultWasteAssetCreationService");

function fixture(t, strategy = {}) {
  const previous = { SERVICE: global.SERVICE, UTILS: global.UTILS, CONFIG: global.CONFIG };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  });
  global.UTILS = { normalizeCode: (value) => String(value).toUpperCase() };
  global.CONFIG = { get: key => key === 'identityGovernance' ? require('../../../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance : undefined };
  const request = {
    tenant: "tenant-a", code: "SUB_DEVICE-1064", expectedRevision: 8,
    confirmed: true, idempotencyKey: "original-approval",
    assetCode: "untrusted-candidate", assetCreationPolicyCode: "changed-policy",
    authData: { tenant: "tenant-a", principalType: "human", loginId: "reviewer" },
    payload: { decision: "APPROVED", assetCode: "another-untrusted-candidate" },
  };
  const ref = { module: "wasteVerification", schema: "wasteVerification", code: "original-approval-record" };
  const source = { code: request.code, submissionStatus: "APPROVED", revision: 8,
    verificationRef: ref, metadata: { reviewKey: request.idempotencyKey } };
  const assetCode = creation.assetCode({ submission: source, assetCode: strategy.requestedCode }, strategy);
  const asset = { code: assetCode, sourceSubmissionCode: source.code, revision: 1,
    verificationRef: structuredClone(ref), metadata: { settlementStatus: "PENDING" } };
  const decision = { code: ref.code, submissionCode: source.code, verificationStatus: "APPROVED" };
  const state = { assets: [asset], decisions: [decision], reads: [], writes: 0, settlements: 0, assessments: 0, hook: () => {} };
  global.SERVICE = {
    DefaultIdentityGovernanceService: require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService'),
    DefaultWastePersistenceService: persistence,
    DefaultWasteVerificationOperationService: verification,
    DefaultWasteOperationalAccessService: { authorize: async () => {}, assertRecord: async () => {}, settings: () => ({}) },
    DefaultWasteItemDescriptorService: { evidenceReview: () => ({}) },
    DefaultWasteReviewWorkspaceService: { assertAssignment: () => {} },
    DefaultWasteSubmissionOperationService: { facts: (value) => value },
  };
  source.metadata.reviewDigest = verification.commandDigest(request);
  for (const schema of ["wasteSubmission", "wasteAsset", "wasteVerification"]) {
    SERVICE["Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"] = {
      get: async (input) => {
        assert.equal(input.tenant, "tenant-a");
        assert.equal(input.options.skipItemCache, true);
        state.reads.push({ schema, query: structuredClone(input.query), limit: input.searchOptions.pageSize });
        const values = schema === "wasteSubmission" ? [source] : schema === "wasteAsset" ? state.assets : state.decisions;
        const rows = values.filter(row => Object.entries(input.query).every(([key, value]) => row[key] === value));
        const response = { result: structuredClone(rows.slice(0, input.searchOptions.pageSize)), count: rows.length };
        await state.hook(schema, response);
        return response;
      },
      save: () => { state.writes++; assert.fail("No record creation allowed"); },
      update: () => { state.writes++; assert.fail("No record mutation allowed"); },
    };
  }
  const xp = { ...experience,
    confirmedRewardAssessment: async (_request, saved) => { state.assessments++; assert.equal(saved.code, assetCode); },
    settle: async (_request, saved) => { state.settlements++; return saved; },
    saveReviewDiagnostic: async (_request, saved) => saved,
  };
  return { request, source, asset, decision, state, xp };
}

for (const [label, strategy, expected] of [
  ["normalized hyphenated submission", {}, "WASTE_ASSET_SUB_DEVICE_1064"],
  ["policy prefix", { assetCodeStrategy: "POLICY_PREFIX", assetCodePrefix: "partner-devices" }, "PARTNER_DEVICES_SUB_DEVICE_1064"],
  ["requested identity", { assetCodeStrategy: "REQUESTED", requestedCode: "approved-asset-42" }, "APPROVED_ASSET_42"],
]) {
  test(label + " resolves the saved asset in both entry points without policy reconstruction", async t => {
    const f = fixture(t, strategy);
    assert.equal(f.asset.code, expected);
    const before = structuredClone([f.source, f.asset, f.decision]);
    const retried = await f.xp.retrySettlement(f.request);
    const replayed = await verification.review(f.request);
    assert.equal(retried.asset.code, expected);
    assert.equal(retried.settlementStatus, "COMPLETED");
    assert.equal(replayed.asset.code, expected);
    assert.equal(replayed.replayed, true);
    assert.equal(f.state.settlements, 1);
    assert.equal(f.state.writes, 0);
    assert.deepEqual([f.source, f.asset, f.decision], before);
    assert.deepEqual(f.state.reads.filter(read => read.schema === "wasteAsset"), [0, 1].map(() => ({
      schema: "wasteAsset", query: { sourceSubmissionCode: f.source.code }, limit: 2,
    })));
  });
}

const refusals = [
  ["missing asset", f => { f.state.assets = []; }],
  ["ambiguous assets", f => f.state.assets.push({ ...f.asset, code: "second-asset" })],
  ["wrong source", f => { f.state.hook = (schema, reply) => { if (schema === "wasteAsset") reply.result[0].sourceSubmissionCode = "other"; }; }],
  ["wrong asset verification", f => { f.asset.verificationRef.code = "other"; }],
  ["wrong verification module", f => { f.asset.verificationRef.module = "other"; }],
  ["missing source verification", f => { delete f.source.verificationRef; }],
  ["missing decision", f => { f.state.decisions = []; }],
  ["ambiguous decisions", f => f.state.decisions.push(structuredClone(f.decision))],
  ["wrong decision source", f => { f.decision.submissionCode = "other"; }],
  ["wrong returned decision", f => { f.state.hook = (schema, reply) => { if (schema === "wasteVerification") reply.result[0].code = "other"; }; }],
  ["rejected decision", f => { f.decision.verificationStatus = "REJECTED"; }],
  ["foreign source", f => { f.source.tenant = "other"; }],
  ["foreign asset", f => { f.asset.tenant = "other"; }],
  ["foreign decision", f => { f.decision.tenantCode = "other"; }],
  ["contradictory caller tenant", f => { f.request.tenant = "other"; }],
  ["contradictory tenant alias", f => { f.request.authData.tenantCode = "other"; }],
  ["tenant changes during read", f => { f.state.hook = schema => { if (schema === "wasteAsset") f.request.authData.tenant = "other"; }; }],
  ["source selector changes during read", f => { f.state.hook = schema => { if (schema === "wasteAsset") f.request.code = "other"; }; }],
  ["inactive asset", f => { f.asset.active = false; }],
];
for (const [label, change] of refusals) {
  for (const entry of ["retrySettlement", "review"]) {
    test(entry + " rejects " + label + " before assessment, settlement or writes", async t => {
      const f = fixture(t);
      change(f);
      const before = structuredClone([f.source, f.state.assets, f.state.decisions]);
      await assert.rejects(entry === "review" ? verification.review(f.request) : f.xp.retrySettlement(f.request),
        { code: label === "missing asset" ? "ERR_WASTE_RECORD_NOT_FOUND" : "ERR_WASTE_REVIEW_CONFLICT" });
      assert.equal(f.state.writes, 0);
      assert.equal(f.state.assessments, 0);
      assert.equal(f.state.settlements, 0);
      assert.deepEqual([f.source, f.state.assets, f.state.decisions], before);
    });
  }
}

test("rejected completed review never resolves or returns an approved asset", async t => {
  const f = fixture(t);
  f.source.submissionStatus = f.request.payload.decision = "REJECTED";
  f.request.payload.reason = "Not accepted";
  f.source.metadata.reviewDigest = verification.commandDigest(f.request);
  const result = await verification.review(f.request);
  assert.equal(result.replayed, true);
  assert.equal(result.asset, undefined);
  assert.deepEqual(f.state.reads.map(read => read.schema), ["wasteSubmission"]);
  assert.equal(f.state.writes, 0);
});
