/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteSavedRewardRecovery @description Isolated generated-repository recovery qualification; no native data or provider calls. @layer test @owner eWaste */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const xp = require("../src/service/defaultEWasteExperienceService");
const owner = require("../src/service/defaultEWasteRewardAssessmentOperationService");
const waste = "../../../../../../nodics.waste/modules/";
const store = require(waste + "wasteCore/src/service/defaultWastePersistenceService");
const verification = require(waste + "wasteVerification/src/service/defaultWasteVerificationOperationService");
const creation = require(waste + "wasteCore/src/service/defaultWasteAssetCreationService");
const rules = require("../../../../../../nodics.rulesEngine/modules/rulesEvaluation/src/service/defaultRuleEvaluationService");

function fixture(t) {
  const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  });
  const request = { tenant: "tenant-a", code: "submission-1", expectedRevision: 7, confirmed: true,
    authData: { tenant: "tenant-a", principalType: "human", loginId: "employee-a" } };
  const ref = { module: "wasteVerification", schema: "wasteVerification", code: "decision-1" };
  const principal = { module: "profile", schema: "employee", code: "original-reviewer" };
  const customer = { module: "profile", schema: "customer", code: "customer-a" };
  const facts = { itemTypeCode: "DEVICE", categoryCode: "ELECTRONICS", quantity: 1, weight: 2 };
  const command = { expectedRevision: 3, decision: "APPROVED", reason: "Reviewed", verifiedFacts: facts };
  global.SERVICE = { DefaultWasteSubmissionOperationService: { facts: value => value } };
  const submission = { code: request.code, revision: 7, submissionStatus: "APPROVED", verificationRef: ref,
    submitterRef: customer, metadata: { reviewKey: "review-original", reviewCommand: command,
      reviewDigest: verification.commandDigest({ code: request.code, expectedRevision: 3, payload: command }),
      reviewPrincipal: principal, approvedBy: principal, reviewedFacts: facts, reviewedAt: "2026-10-12T12:00:00.000Z",
      reviewDiagnostic: { code: "ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED", stage: "REWARD_ASSESSMENT", retryAllowed: false } } };
  const asset = { code: "asset-1", revision: 1, sourceSubmissionCode: request.code, ownerRef: customer, originalOwnerRef: customer,
    verificationRef: ref, metadata: { settlementStatus: "PENDING", facts } };
  const decision = { code: ref.code, revision: 0, submissionCode: request.code, verificationStatus: "APPROVED",
    verifiedFacts: facts, verifiedBy: principal };
  const outcome = { rewardTypeCode: "POINTS", amount: "6", programCode: "original-program", scale: 0 };
  const evaluation = rules.sourceHashEvidence({ ruleSetCode: "original-policy", ruleSetVersion: 1,
    propertyCatalogueCode: "original-catalogue", propertyCatalogueVersion: "1", bandSetCode: "original-bands",
    bandSetVersion: 1, calculatedScore: 0, finalScore: 0, scoreBandCode: "base", rewardOutcome: outcome,
    outcomes: [], groupResults: [], matchedRules: [], skippedRules: [] });
  const assessment = { code: "submission-1_REWARD_CONFIRMED_original-policy_V1_R5", revision: 0, active: true,
    submissionCode: request.code, assetCode: asset.code, assessmentType: "CONFIRMED", sourceVerificationRef: ref,
    sourceRevision: 5, policyCode: "original-policy", policyVersion: 1, bandSetCode: "original-bands", bandSetVersion: 1,
    propertyCatalogueCode: "original-catalogue", propertyCatalogueVersion: "1", rewardOutcome: outcome,
    rewardTypeCode: "POINTS", rewardAmount: "6", calculatedScore: "0", finalScore: "0", scoreBandCode: "base",
    calculationBreakdown: { groupResults: [], calculatedScore: 0, finalScore: 0, scoreBandCode: "base" },
    matchedRules: [], skippedRules: [], idempotencyKey: "review-original:confirmed-reward",
    calculatedAt: "2026-10-12T12:00:01.000Z",
    sourceHash: crypto.createHash("sha256").update(JSON.stringify(evaluation)).digest("hex"),
    inputSnapshot: { metadata: { submissionCode: request.code, submissionRevision: 5, assessmentType: "CONFIRMED" },
      properties: { "verification.status": { available: true, value: "APPROVED", quality: "OPERATOR_VERIFIED", source: "WASTE_VERIFICATION" },
        ...Object.fromEntries([["asset.itemType", "DEVICE"], ["asset.category", "ELECTRONICS"], ["asset.quantity", 1], ["asset.recordedWeight", 2]]
          .map(([key, value]) => [key, { available: true, value }])) } } };
  const rows = { wasteSubmission: [submission], wasteAsset: [asset], wasteVerification: [decision], wasteRewardAssessment: [assessment], wasteAssetOwnershipEvent: [] };
  const state = { rows, writes: [], reads: [], calls: [], hook: () => {}, denied: false, ledger: new Map() };
  const rejectRules = () => assert.fail("Recovery must not resolve or evaluate current Rules");
  Object.assign(SERVICE, {
    DefaultIdentityGovernanceService: require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService'),
    DefaultWastePersistenceService: store, DefaultWasteVerificationOperationService: verification,
    DefaultWasteAssetCreationService: creation,
    DefaultEWasteRewardAssessmentOperationService: owner,
    DefaultRuleEvaluationService: { ...rules, evaluate: rejectRules },
    DefaultRulePolicyResolutionService: { resolveEffective: rejectRules },
    DefaultWasteOperationalAccessService: {
      authorize: async () => { if (state.denied) throw Error("Denied"); },
      assertRecord: async () => { if (state.denied) throw Error("Denied"); }
    },
    DefaultWasteReviewWorkspaceService: { detail: async () => structuredClone({ code: submission.code,
      revision: submission.revision, submissionStatus: submission.submissionStatus, reviewDiagnostic: submission.metadata.reviewDiagnostic }) }
  });
  global.CONFIG = { get: key => key === 'identityGovernance' ? require('../../../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance : ({ rewardRules: { loyaltyProgramCode: "changed-program", rewardScale: 2 } }) };
  for (const schema of Object.keys(rows)) SERVICE["Default" + schema[0].toUpperCase() + schema.slice(1) + "Service"] = {
    get: async input => {
      assert.equal(input.tenant, "tenant-a");
      assert.equal(input.options.skipItemCache, true);
      state.reads.push({ schema, query: input.query, pageSize: input.searchOptions.pageSize });
      await state.hook(schema, "get");
      return { result: structuredClone(rows[schema].filter(row => Object.entries(input.query).every(([key, value]) => row[key] === value))
        .slice(0, input.searchOptions.pageSize)) };
    },
    save: () => assert.fail("Recovery cannot create assessment or decision records"),
    update: async input => {
      assert.notEqual(schema, "wasteRewardAssessment");
      await state.hook(schema, "update");
      const current = rows[schema].find(row => row.code === input.query.code && row.revision === input.query.revision);
      if (!current) throw Error("CAS conflict");
      state.writes.push(schema);
      Object.assign(current, structuredClone(input.model), { revision: current.revision + 1 });
    }
  };
  const experience = { ...xp, remote: async (_request, _module, _connection, path, _method, body) => {
    state.calls.push({ path, body });
    if (path === "/wallets") return { code: "wallet-original-owner" };
    assert.equal(path, "/reward-earnings");
    if (!state.ledger.has(body.idempotencyKey)) state.ledger.set(body.idempotencyKey, { code: "ledger-1" });
    return { ledgerEntry: state.ledger.get(body.idempotencyKey) };
  } };
  return { request, submission, asset, decision, assessment, state, experience };
}

function withCreationIntent(f) {
  const created = creation.createFromApprovedSubmission({
    submission: { ...f.submission, correlationId: "original-creation", categoryCode: "ELECTRONICS",
      evidenceRefs: [{ module: "media", schema: "mediaAsset", code: "original-photo" }] },
    verification: f.decision, verificationRef: f.asset.verificationRef, assetTypeCode: "DEVICE",
    idempotencyKey: f.submission.code + "_ASSET", principalRef: f.decision.verifiedBy,
    policy: { code: "ORIGINAL_CREATION", rewardSettlementPolicyCode: "ORIGINAL_CREATION_REWARD" }
  });
  Object.assign(f.asset, JSON.parse(JSON.stringify(created.asset)), { revision: 1 });
  f.assessment.assetCode = f.asset.code;
  f.state.rows.wasteAssetOwnershipEvent.push(JSON.parse(JSON.stringify(created.ownershipEvent)));
  return f.state.rows.wasteAssetOwnershipEvent[0];
}

test("production asset-creation intent qualifies read-only, stays intact during restoration, then settles once", async t => {
  const f = fixture(t), event = withCreationIntent(f), originalEvent = structuredClone(event);
  const refs = structuredClone(f.asset.rewardSettlementRefs), before = structuredClone(f.state.rows);
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery.available, true);
  assert.deepEqual(f.state.rows, before);
  assert.deepEqual(f.state.calls, []);
  await f.experience.recoverSavedRewardReference(f.request, f.submission, f.asset);
  assert.deepEqual(f.asset.rewardSettlementRefs, refs, "restoration must not empty intents");
  assert.deepEqual(event, originalEvent);
  assert.deepEqual(f.state.calls, []);
  assert.equal((await f.experience.retrySettlement(f.request)).settlementStatus, "COMPLETED");
  await f.experience.retrySettlement({ ...f.request, expectedRevision: f.submission.revision });
  assert.equal(f.state.ledger.size, 1);
  assert.deepEqual(event, originalEvent);
});

for (const [label, mutate] of [
  ["intent ledger schema", f => f.asset.rewardSettlementRefs[0].schema = "rewardLedgerEntry"],
  ["intent completed state", f => f.asset.rewardSettlementRefs[0].state = "COMPLETED"],
  ["intent uncertain dispatch", f => f.asset.rewardSettlementRefs[0].dispatchStatus = "UNCERTAIN"],
  ["intent receipt", f => f.asset.rewardSettlementRefs[0].ledgerEntryCode = "receipt"],
  ["intent foreign owner", f => f.asset.rewardSettlementRefs[0].ownerRef.code = "other"],
  ["intent foreign source key", f => f.asset.rewardSettlementRefs[0].idempotencyKey = "other"],
  ["intent foreign correlation", f => f.asset.rewardSettlementRefs[0].correlationId = "other"],
  ["duplicate intent", f => f.asset.rewardSettlementRefs.push(structuredClone(f.asset.rewardSettlementRefs[0]))],
  ["malformed references", f => f.asset.rewardSettlementRefs = {}],
  ["error-only metadata without dispatch proof", f => f.asset.metadata.rewardSettlement = { status: "FAILED", error: "pre-dispatch" }],
  ["prior recovery audit", f => f.asset.metadata.confirmedRewardRecovery = {}],
  ["missing creation event", f => f.state.rows.wasteAssetOwnershipEvent.length = 0],
  ["duplicate creation event", (f, event) => f.state.rows.wasteAssetOwnershipEvent.push(structuredClone(event))],
  ["creation foreign tenant", (_f, event) => event.tenant = "other"],
  ["creation foreign submission", (_f, event) => event.triggerRef.code = "other"],
  ["creation foreign owner", (_f, event) => event.toOwnerRef.code = "other"],
  ["creation changed policy", (_f, event) => event.policyCode = "other"],
  ["creation changed revision", (_f, event) => event.revision = 1],
  ["creation receipt", (_f, event) => event.paymentRef = { code: "payment" }],
  ["creation uncertainty", (_f, event) => event.metadata = { dispatchStatus: "UNCERTAIN" }],
  ["creation settlement changed", (_f, event) => event.rewardSettlementRefs[0].state = "COMPLETED"],
  ["creation missing reference", (_f, event) => delete event.rewardSettlementRefs]
]) test(label + " cannot qualify a creation placeholder for recovery", async t => {
  const f = fixture(t), event = withCreationIntent(f); mutate(f, event);
  const before = structuredClone(f.state.rows);
  const detail = await f.experience.reviewDetail(f.request);
  assert.equal(detail.savedRewardRecovery.available, false);
  assert.equal(detail.savedRewardRecovery.diagnostic.code, "ERR_EWASTE_REWARD_RECOVERY_CONFLICT");
  assert.deepEqual(f.state.rows, before);
  assert.equal((await f.experience.retrySettlement(f.request)).settlementStatus, "BLOCKED");
  assert.equal(f.state.writes.includes("wasteAsset"), false);
  assert.deepEqual(f.state.calls, []);
});

test("creation evidence is requalified immediately before reference restoration", async t => {
  const f = fixture(t), event = withCreationIntent(f);
  let reads = 0;
  f.state.hook = async (schema, operation) => {
    if (schema === "wasteAssetOwnershipEvent" && operation === "get" && ++reads === 2)
      event.metadata = { dispatchStatus: "UNCERTAIN" };
  };
  assert.equal((await f.experience.retrySettlement(f.request)).settlementStatus, "BLOCKED");
  assert.equal(reads, 2);
  assert.equal(f.state.writes.includes("wasteAsset"), false);
  assert.deepEqual(f.state.calls, []);
});

for (const diagnostic of [undefined, "ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED", "ERR_EWASTE_REWARD_RECOVERY_CONFLICT",
  "ERR_EWASTE_REWARD_RECOVERY_NOT_FOUND", "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED"])
test("recovery inspection is independent of prior diagnostic " + diagnostic, async t => {
  const f = fixture(t);
  f.submission.metadata.reviewDiagnostic = diagnostic ? { code: diagnostic, retryAllowed: false } : undefined;
  const before = structuredClone(f.state.rows);
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery.available, true);
  assert.deepEqual(f.state.rows, before);
  assert.deepEqual(f.state.calls, []);
});

for (const [label, mutate] of [
  ["existing reference", f => f.asset.metadata.confirmedRewardAssessmentRef = { code: f.assessment.code }],
  ["malformed reference", f => f.asset.metadata.confirmedRewardAssessmentRef = {}],
  ["completed settlement", f => f.asset.metadata.settlementStatus = "COMPLETED"],
  ["rejected submission", f => f.submission.submissionStatus = "REJECTED"]
]) test(label + " does not advertise missing-reference recovery", async t => {
  const f = fixture(t); mutate(f);
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery, undefined);
  assert.equal(f.state.reads.some(row => row.schema === "wasteRewardAssessment"), false);
  assert.deepEqual(f.state.writes, []);
});

test("ordinary retry after transfer credits only the original approval beneficiary", async t => {
  const f = fixture(t);
  f.asset.metadata.confirmedRewardAssessmentRef = { code: f.assessment.code };
  f.asset.ownerRef = { module: "profile", schema: "customer", code: "new-owner" };
  assert.equal((await f.experience.retrySettlement(f.request)).settlementStatus, "COMPLETED");
  assert.equal(f.state.calls[0].body.ownerCode, f.submission.submitterRef.code);
  assert.equal(f.state.calls[1].body.idempotencyKey, f.assessment.code + ":wallet-settlement");
  assert.equal(f.asset.ownerRef.code, "new-owner");
});

for (const [label, mutate] of [
  ["missing original owner", f => delete f.asset.originalOwnerRef],
  ["different original owner", f => f.asset.originalOwnerRef = { ...f.asset.originalOwnerRef, code: "different" }],
  ["unbound asset assessment", f => delete f.assessment.assetCode],
  ["foreign source assessment", f => f.assessment.submissionCode = "different"],
  ["foreign original verification", f => f.assessment.sourceVerificationRef = { ...f.assessment.sourceVerificationRef, code: "different" }],
  ["ambiguous source", f => f.state.rows.wasteSubmission.push(structuredClone(f.submission))],
  ["foreign source tenant", f => f.submission.tenant = "different"],
  ["inactive assessment", f => f.assessment.active = false]
]) test(label + " refuses ordinary settlement before wallet dispatch", async t => {
  const f = fixture(t);
  f.asset.metadata.confirmedRewardAssessmentRef = { code: f.assessment.code };
  mutate(f);
  await assert.rejects(f.experience.settle(f.request, f.asset), { code: "ERR_EWASTE_REWARD_ASSESSMENT_CONFLICT" });
  assert.deepEqual(f.state.calls, []);
  assert.deepEqual(f.state.writes, []);
});

test("ordinary retry refuses historical missing terms despite current configured defaults", async t => {
  const f = fixture(t);
  f.asset.metadata.confirmedRewardAssessmentRef = { code: f.assessment.code };
  delete f.assessment.rewardOutcome.programCode;
  delete f.assessment.rewardOutcome.scale;
  const original = structuredClone(f.assessment);
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.reviewDiagnostic.code, "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED");
  assert.deepEqual(f.assessment, original);
  assert.deepEqual(f.state.calls, []);
  assert.equal(f.state.writes.includes("wasteAsset"), false);
});

test("ordinary settlement never reads current reward configuration and keeps original terms after transfer", async t => {
  const f = fixture(t);
  f.asset.metadata.confirmedRewardAssessmentRef = { code: f.assessment.code };
  f.asset.ownerRef = { module: "profile", schema: "customer", code: "new-owner" };
  f.assessment.metadata = { settlementTerms: { contractVersion: 1, programCode: "original-program", scale: 0 } };
  global.CONFIG = { get: key => {
    if (key === "identityGovernance") return require("../../../../../../nodics.foundation/modules/nAuth/config/properties").identityGovernance;
    assert.fail("Settlement cannot resolve current reward configuration");
  } };
  await f.experience.settle(f.request, f.asset);
  assert.equal(f.state.calls[0].body.ownerCode, "customer-a");
  assert.equal(f.state.calls[1].body.programCode, "original-program");
  assert.equal(f.state.calls[1].body.scale, 0);
});

for (const terms of [null, {}, { contractVersion: 1, programCode: "changed", scale: 0 },
  { contractVersion: 1, programCode: "original-program", scale: 2 }])
test("ordinary settlement refuses conflicting or incomplete captured terms " + JSON.stringify(terms), async t => {
  const f = fixture(t);
  f.asset.metadata.confirmedRewardAssessmentRef = { code: f.assessment.code };
  f.assessment.metadata = { settlementTerms: terms };
  await assert.rejects(f.experience.settle(f.request, f.asset), { code: "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED" });
  assert.deepEqual(f.state.calls, []);
  assert.deepEqual(f.state.writes, []);
});

test("read-only detail qualifies saved evidence before advertising explicit recovery", async t => {
  const f = fixture(t), before = structuredClone(f.state.rows);
  const detail = await f.experience.reviewDetail(f.request);
  assert.equal(detail.savedRewardRecovery.available, true);
  assert.equal(detail.reviewDiagnostic.retryAllowed, false);
  assert.deepEqual(f.state.rows, before);
  assert.deepEqual(f.state.writes, []);
  assert.deepEqual(f.state.calls, []);
  const reads = f.state.reads.filter(row => row.schema === "wasteRewardAssessment");
  assert.deepEqual(reads, [{ schema: "wasteRewardAssessment", pageSize: 2,
    query: { submissionCode: f.submission.code, assetCode: f.asset.code, assessmentType: "CONFIRMED" } }]);
});

test("one genuine saved assessment restores audit and settles original identity once across repeat requests", async t => {
  const f = fixture(t), original = structuredClone(f.assessment);
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.settlementStatus, "COMPLETED");
  assert.equal(f.asset.metadata.confirmedRewardAssessmentRef.code, f.assessment.code);
  assert.equal(f.asset.metadata.confirmedRewardRecovery.sourceHash, f.assessment.sourceHash);
  assert.equal(f.asset.metadata.confirmedRewardRecovery.principalRef.code, "employee-a");
  assert.equal(f.asset.metadata.confirmedRewardRecovery.sourceRevision, 5);
  assert.equal(f.asset.metadata.confirmedRewardRecovery.assetRevision, 1);
  assert.equal(f.submission.metadata.reviewKey, "review-original");
  assert.deepEqual(f.assessment, original);
  const earning = f.state.calls.find(call => call.path === "/reward-earnings").body;
  assert.equal(earning.idempotencyKey, f.assessment.code + ":wallet-settlement");
  assert.equal(earning.programCode, "original-program");
  assert.equal(earning.scale, 0);
  const calls = f.state.calls.length, audit = structuredClone(f.asset.metadata.confirmedRewardRecovery);
  await f.experience.retrySettlement({ ...f.request, expectedRevision: f.submission.revision });
  assert.equal(f.state.calls.length, calls);
  assert.equal(f.state.ledger.size, 1);
  assert.deepEqual(f.asset.metadata.confirmedRewardRecovery, audit);
});

test("no saved assessment yields precise read-only NOT_FOUND then blocked retry without Rules or credit", async t => {
  const f = fixture(t);
  f.state.rows.wasteRewardAssessment.length = 0;
  const detail = await f.experience.reviewDetail(f.request);
  assert.equal(detail.savedRewardRecovery.available, false);
  assert.equal(detail.savedRewardRecovery.diagnostic.code, "ERR_EWASTE_REWARD_RECOVERY_NOT_FOUND");
  assert.deepEqual(f.state.writes, []);
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.settlementStatus, "BLOCKED");
  assert.equal(result.reviewDiagnostic.code, "ERR_EWASTE_REWARD_RECOVERY_NOT_FOUND");
  assert.equal(result.reviewDiagnostic.retryAllowed, false);
  assert.deepEqual(f.state.writes, ["wasteSubmission"]);
  assert.deepEqual(f.state.calls, []);
});

for (const [label, mutate] of [
  ["ambiguous assessments", f => f.state.rows.wasteRewardAssessment.push(structuredClone(f.assessment))],
  ["foreign assessment tenant", f => f.assessment.tenant = "tenant-b"],
  ["foreign tenant alias", f => f.assessment.tenantCode = "tenant-b"],
  ["changed assessment revision", f => f.assessment.revision = 1],
  ["inactive assessment", f => f.assessment.active = false],
  ["wrong verification", f => f.assessment.sourceVerificationRef = { ...f.assessment.sourceVerificationRef, code: "other" }],
  ["wrong verification owner", f => f.assessment.sourceVerificationRef = { ...f.assessment.sourceVerificationRef, module: "other" }],
  ["absent original command", f => delete f.submission.metadata.reviewCommand],
  ["changed original command", f => f.submission.metadata.reviewCommand.reason = "changed"],
  ["changed original review key", f => f.submission.metadata.reviewKey = "different"],
  ["wrong original actor", f => f.submission.metadata.reviewPrincipal = { ...f.submission.metadata.reviewPrincipal, code: "other" }],
  ["changed facts", f => f.decision.verifiedFacts = { ...f.decision.verifiedFacts, quantity: 99 }],
  ["changed normalized facts", f => f.assessment.inputSnapshot.properties["asset.quantity"].value = 99],
  ["unverified normalized input", f => f.assessment.inputSnapshot.properties["verification.status"].value = "VERIFIED"],
  ["wrong input submission", f => f.assessment.inputSnapshot.metadata.submissionCode = "other"],
  ["wrong input stage", f => f.assessment.inputSnapshot.metadata.assessmentType = "ESTIMATED"],
  ["missing input metadata", f => delete f.assessment.inputSnapshot.metadata],
  ["wrong input revision", f => f.assessment.inputSnapshot.metadata.submissionRevision = 3],
  ["future source revision", f => f.assessment.sourceRevision = 99],
  ["pre-approval source revision", f => f.assessment.sourceRevision = 3],
  ["missing evaluation hash", f => delete f.assessment.sourceHash],
  ["altered evaluation hash", f => f.assessment.sourceHash = "a".repeat(64)],
  ["changed fixed reward", f => f.assessment.rewardAmount = "99"],
  ["changed reward type", f => f.assessment.rewardTypeCode = "OTHER"],
  ["changed outcome", f => f.assessment.rewardOutcome = { ...f.assessment.rewardOutcome, amount: "99" }],
  ["changed policy version", f => f.assessment.policyVersion = 2],
  ["changed breakdown", f => f.assessment.calculationBreakdown.finalScore = 99],
  ["missing evaluation groups", f => delete f.assessment.calculationBreakdown.groupResults],
  ["predated assessment", f => f.assessment.calculatedAt = "2026-10-11T12:00:00.000Z"],
  ["missing review timestamp", f => delete f.submission.metadata.reviewedAt],
  ["foreign reward summary", f => f.asset.metadata.confirmedReward = { assessmentCode: "other" }],
  ["prior recovery audit", f => f.asset.metadata.confirmedRewardRecovery = { assessmentRef: { code: "old" } }],
  ["transferred owner", f => f.asset.ownerRef = { ...f.asset.ownerRef, code: "buyer" }],
  ["partial prior settlement", f => f.asset.metadata.rewardSettlement = { assessmentCode: "old" }],
  ["ledger reference already present", f => f.asset.rewardSettlementRefs = [{ code: "ledger" }]],
]) test(label + " blocks missing-reference restoration and leaves immutable evidence intact", async t => {
  const f = fixture(t); mutate(f);
  const original = structuredClone(f.state.rows);
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.settlementStatus, "BLOCKED");
  assert.equal(result.reviewDiagnostic.code, "ERR_EWASTE_REWARD_RECOVERY_CONFLICT");
  assert.equal(f.state.writes.includes("wasteAsset"), false);
  assert.deepEqual(f.state.rows.wasteRewardAssessment, original.wasteRewardAssessment);
  assert.deepEqual(f.state.rows.wasteVerification, original.wasteVerification);
  assert.deepEqual(f.state.calls, []);
});

test("a stale revision or missing confirmation cannot recover", async t => {
  const f = fixture(t);
  await assert.rejects(f.experience.retrySettlement({ ...f.request, expectedRevision: 6 }), { code: "ERR_WASTE_REVISION_CONFLICT" });
  await assert.rejects(f.experience.retrySettlement({ ...f.request, confirmed: false }), { code: "ERR_WASTE_REVIEW_CONFLICT" });
  assert.deepEqual(f.state.writes, []);
});

test("approval permission remains required for inspection and mutation", async t => {
  const f = fixture(t); f.state.denied = true;
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery, undefined);
  await assert.rejects(f.experience.retrySettlement(f.request), /Denied/);
  assert.deepEqual(f.state.writes, []);
  assert.deepEqual(f.state.reads, []);
});

test("missing owner or malformed existing pointer never triggers fallback recovery", async t => {
  const f = fixture(t);
  delete SERVICE.DefaultEWasteRewardAssessmentOperationService;
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery, undefined);
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.settlementStatus, "BLOCKED");
  assert.equal(result.reviewDiagnostic.code, "ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED");
  f.asset.metadata.confirmedRewardAssessmentRef = {};
  const second = await f.experience.retrySettlement({ ...f.request, expectedRevision: f.submission.revision });
  assert.equal(second.reviewDiagnostic.code, "ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED");
  assert.deepEqual(f.asset.metadata.confirmedRewardAssessmentRef, {});
  assert.equal(f.state.writes.includes("wasteAsset"), false);
});

test("asset revision race blocks binding and settlement", async t => {
  const f = fixture(t);
  f.state.hook = (schema, action) => { if (schema === "wasteAsset" && action === "update") f.asset.revision++; };
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.settlementStatus, "BLOCKED");
  assert.equal(f.asset.metadata.confirmedRewardAssessmentRef, undefined);
  assert.deepEqual(f.state.calls, []);
});

test("uncertain settlement after pointer recovery retains audit and retries the identical earning key", async t => {
  const f = fixture(t), remote = f.experience.remote;
  f.experience.remote = async (...args) => {
    const result = await remote(...args);
    if (args[3] === "/reward-earnings") throw Error("PRIVATE uncertain acknowledgement");
    return result;
  };
  const first = await f.experience.retrySettlement(f.request);
  assert.equal(first.settlementStatus, "PENDING");
  assert.equal(f.state.ledger.size, 1);
  const audit = structuredClone(f.asset.metadata.confirmedRewardRecovery);
  f.experience.remote = remote;
  const second = await f.experience.retrySettlement({ ...f.request, expectedRevision: f.submission.revision });
  assert.equal(second.settlementStatus, "COMPLETED");
  assert.equal(f.state.ledger.size, 1);
  assert.deepEqual(f.asset.metadata.confirmedRewardRecovery, audit);
});

test("later-layer saved evaluation override is resolved through the effective service object", async t => {
  const f = fixture(t); let invoked = 0;
  SERVICE.DefaultEWasteRewardAssessmentOperationService = { ...owner, assertSavedEvaluation(assessment) {
    invoked++; return owner.assertSavedEvaluation.call(this, assessment);
  } };
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery.available, true);
  assert.equal(invoked, 1);
});

test("valid saved hash without original positive-reward settlement terms blocks current configuration substitution", t => {
  const f = fixture(t);
  delete f.assessment.rewardOutcome.programCode;
  const { assessment: a } = f;
  a.sourceHash = crypto.createHash("sha256").update(JSON.stringify(rules.sourceHashEvidence({
    ruleSetCode: a.policyCode, ruleSetVersion: a.policyVersion, propertyCatalogueCode: a.propertyCatalogueCode,
    propertyCatalogueVersion: a.propertyCatalogueVersion, bandSetCode: a.bandSetCode, bandSetVersion: a.bandSetVersion,
    ...a.calculationBreakdown, rewardOutcome: a.rewardOutcome, outcomes: [], matchedRules: [], skippedRules: []
  }))).digest("hex");
  assert.throws(() => owner.assertSavedEvaluation(a), { code: "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED" });
  assert.deepEqual(f.state.writes, []);
});

test("prospectively captured terms recover and settle without altering the exact Rules outcome or hash", async t => {
  const f = fixture(t), a = f.assessment;
  delete a.rewardOutcome.programCode;
  delete a.rewardOutcome.scale;
  a.sourceHash = crypto.createHash("sha256").update(JSON.stringify(rules.sourceHashEvidence({
    ruleSetCode: a.policyCode, ruleSetVersion: a.policyVersion, propertyCatalogueCode: a.propertyCatalogueCode,
    propertyCatalogueVersion: a.propertyCatalogueVersion, bandSetCode: a.bandSetCode, bandSetVersion: a.bandSetVersion,
    ...a.calculationBreakdown, rewardOutcome: a.rewardOutcome, outcomes: [], matchedRules: [], skippedRules: []
  }))).digest("hex");
  a.metadata = { settlementTerms: { contractVersion: 1, programCode: "captured-program", scale: 0 } };
  const before = structuredClone(a);
  assert.equal((await f.experience.reviewDetail(f.request)).savedRewardRecovery.available, true);
  assert.equal((await f.experience.retrySettlement(f.request)).settlementStatus, "COMPLETED");
  const earning = f.state.calls.find(call => call.path === "/reward-earnings").body;
  assert.equal(earning.programCode, "captured-program");
  assert.equal(earning.scale, 0);
  assert.deepEqual(a, before);
});

for (const [label, mutate, stage, check] of [
  ["source ownership before assessment lookup", f => f.asset.ownerRef = { ...f.asset.ownerRef, code: "other" }, "SOURCE_ADMISSION", "SOURCE_OWNER"],
  ["prior settlement before assessment lookup", f => f.asset.metadata.rewardSettlement = { private: "PRIVATE" }, "SOURCE_ADMISSION", "SOURCE_SETTLEMENT_EVIDENCE"],
  ["multiple matching assessments", f => f.state.rows.wasteRewardAssessment.push(structuredClone(f.assessment)), "MULTIPLE_ASSESSMENTS", "ASSESSMENT_MULTIPLE"],
  ["missing approval command", f => delete f.submission.metadata.reviewCommand, "APPROVAL_BINDING", "APPROVAL_COMMAND"],
  ["changed approval digest", f => f.submission.metadata.reviewDigest = "PRIVATE", "APPROVAL_BINDING", "APPROVAL_DIGEST"],
  ["assessment original verification", f => f.assessment.sourceVerificationRef = { ...f.assessment.sourceVerificationRef, code: "PRIVATE" }, "ASSESSMENT_BINDING", "ASSESSMENT_VERIFICATION"],
  ["assessment immutable revision", f => f.assessment.revision = 1, "ASSESSMENT_BINDING", "ASSESSMENT_IDENTITY"],
  ["normalized source", f => f.assessment.inputSnapshot.metadata.submissionCode = "PRIVATE", "INPUT_SNAPSHOT", "INPUT_SOURCE"],
  ["original facts", f => f.decision.verifiedFacts = { private: "PRIVATE" }, "ORIGINAL_FACTS", "ORIGINAL_FACTS"],
  ["normalized facts", f => f.assessment.inputSnapshot.properties["asset.quantity"].value = 42, "ORIGINAL_FACTS", "INPUT_FACTS"],
  ["evaluation hash", f => f.assessment.sourceHash = "a".repeat(64), "HASH", "EVALUATION_HASH"],
  ["evaluation shape", f => delete f.assessment.calculationBreakdown, "HASH", "EVALUATION_SHAPE"],
]) test("read-only native detail identifies " + label + " without changing error category or exposing source values", async t => {
  const f = fixture(t); mutate(f);
  const before = structuredClone(f.state.rows);
  const result = (await f.experience.reviewDetail(f.request)).savedRewardRecovery;
  assert.equal(result.available, false);
  assert.equal(result.diagnostic.code, "ERR_EWASTE_REWARD_RECOVERY_CONFLICT");
  assert.equal(result.diagnostic.stage, "REWARD_ASSESSMENT");
  assert.equal(result.diagnostic.qualificationStage, stage);
  assert.equal(result.diagnostic.qualificationCheck, check);
  assert.equal(result.diagnostic.retryAllowed, false);
  assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  assert.deepEqual(f.state.rows, before);
  assert.deepEqual(f.state.writes, []);
  assert.deepEqual(f.state.calls, []);
  if (stage === "SOURCE_ADMISSION") assert.equal(f.state.reads.some(row => row.schema === "wasteRewardAssessment"), false);
});

test("read-only absent assessment and owner outage have distinct fixed qualification checks", async t => {
  const f = fixture(t);
  f.state.rows.wasteRewardAssessment.length = 0;
  const absent = (await f.experience.reviewDetail(f.request)).savedRewardRecovery;
  assert.equal(absent.diagnostic.qualificationCheck, "ASSESSMENT_ABSENT");
  f.state.hook = schema => { if (schema === "wasteRewardAssessment") throw Error("PRIVATE dependency response"); };
  const outage = (await f.experience.reviewDetail(f.request)).savedRewardRecovery;
  assert.equal(outage.diagnostic.qualificationCheck, "ASSESSMENT_READ");
  assert.equal(outage.diagnostic.code, "ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED");
  assert.equal(JSON.stringify(outage).includes("PRIVATE"), false);
  assert.deepEqual(f.state.writes, []);
});

test("qualification projection allowlists fixed checks and never copies arbitrary diagnostic properties", () => {
  const diagnostics = require("../src/utils/reviewDiagnostics");
  for (const check of ["PRIVATE", "__proto__", { value: "APPROVAL_COMMAND" }, undefined]) {
    const result = diagnostics.savedRewardRecovery({ code: "ERR_EWASTE_REWARD_RECOVERY_CONFLICT",
      rewardRecoveryCheck: check, message: "PRIVATE", qualificationStage: "PRIVATE", qualificationCheck: "PRIVATE" });
    assert.equal(result.qualificationCheck, undefined);
    assert.equal(result.qualificationStage, undefined);
    assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  }
  for (const check of Object.keys(diagnostics.recoveryChecks)) {
    const result = diagnostics.savedRewardRecovery({ code: "ERR_EWASTE_REWARD_RECOVERY_CONFLICT", rewardRecoveryCheck: check,
      message: "PRIVATE", source: { token: "PRIVATE" } });
    assert(result.message.length < 600);
    assert.match(result.qualificationStage, /^[A-Z_]+$/);
    assert.equal(JSON.stringify(result).includes("PRIVATE"), false);
  }
});
