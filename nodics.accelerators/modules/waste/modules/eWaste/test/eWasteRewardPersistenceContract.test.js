/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteRewardPersistenceContract @description Verifies generated-save response normalization and prospective original settlement snapshots without changing Rules evidence. @layer test @owner eWaste */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultEWasteRewardAssessmentOperationService");
const store = require("../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService");
const save = require("../../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const bulk = require("../../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelsSaveInitializerService");

function fixture(t) {
  const previous = { SERVICE: global.SERVICE, CONFIG: global.CONFIG };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  });
  global.SERVICE = { DefaultWastePersistenceService: store };
  const settings = { loyaltyProgramCode: "original-program", rewardScale: 2 };
  global.CONFIG = { get: () => ({ rewardRules: settings }) };
  const model = { code: "saved-assessment", assessmentType: "CONFIRMED", submissionCode: "source", assetCode: "asset",
    sourceHash: "original-hash", rewardOutcome: { rewardTypeCode: "POINTS", amount: "6" },
    metadata: { settlementTerms: { contractVersion: 1, programCode: "original-program", scale: 2 } } };
  return { model, settings };
}

test("actual single-save response and canonical bulk result envelope both normalize exactly one assessment", async t => {
  const { model } = fixture(t);
  const response = {};
  await new Promise((resolve, reject) => save.saveModel.call({ ...save,
    LOG: { debug() {}, error() {} }, persistModel: async () => structuredClone(model)
  }, { model }, response, { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
  assert.deepEqual(response.success, { code: "SUC_SAVE_00000", result: model });
  assert.deepEqual(owner.savedAssessment(response.success, model), model);
  let envelope;
  bulk.handleSucessEnd.call(bulk, {}, { success: [model] }, { resolve: value => { envelope = value; } });
  assert.equal(Array.isArray(envelope.result), true);
  assert.deepEqual(owner.savedAssessment(envelope, model), model);
});

for (const [label, response] of [
  ["empty acknowledgement", () => ({ code: "SUC_SAVE_00000" })],
  ["empty result", () => ({ result: [] })],
  ["ambiguous result", m => ({ result: [m, m] })],
  ["wrong code", m => ({ result: { ...m, code: "other" } })],
  ["wrong source hash", m => ({ result: { ...m, sourceHash: "other" } })],
  ["wrong stage", m => ({ result: { ...m, assessmentType: "ESTIMATED" } })],
  ["wrong submission", m => ({ result: { ...m, submissionCode: "other" } })],
  ["wrong asset", m => ({ result: { ...m, assetCode: "other" } })],
  ["stripped snapshot", m => ({ result: { ...m, metadata: {} } })],
  ["partial failure", m => ({ success: false, result: [m] })],
  ["error status", m => ({ code: "ERR_SAVE_00000", result: m })],
  ["error collection", m => ({ result: m, errors: [{ code: "ERR_SAVE_00000" }] })],
]) test(label + " cannot masquerade as a saved assessment", t => {
  const { model } = fixture(t);
  assert.throws(() => owner.savedAssessment(response(model), model), { code: "ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED" });
});

test("effective original terms are detached without changing the Rules outcome", t => {
  const { settings } = fixture(t), outcome = { rewardTypeCode: "POINTS", amount: "6" };
  const original = structuredClone(outcome), terms = owner.settlementTerms(outcome);
  assert.deepEqual(terms, { contractVersion: 1, programCode: "original-program", scale: 2 });
  settings.loyaltyProgramCode = "later-program"; settings.rewardScale = 4;
  assert.deepEqual(owner.recordedSettlementTerms({ rewardOutcome: outcome, metadata: { settlementTerms: terms } }), terms);
  assert.deepEqual(outcome, original);
  assert.deepEqual(owner.settlementTerms({ ...outcome, programCode: "policy-program", scale: 0 }),
    { contractVersion: 1, programCode: "policy-program", scale: 0 });
});

test("historical unknown terms and malformed or conflicting new snapshots do not use current defaults", t => {
  const { model } = fixture(t);
  assert.throws(() => owner.recordedSettlementTerms({ rewardOutcome: model.rewardOutcome }), { code: "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED" });
  for (const terms of [null, {}, { contractVersion: 2, programCode: "p", scale: 2 },
    { contractVersion: 1, programCode: "p", scale: -1 }, { contractVersion: 1, programCode: "p", scale: "2" }]) {
    assert.throws(() => owner.recordedSettlementTerms({ ...model, metadata: { settlementTerms: terms } }),
      { code: "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED" });
  }
  assert.throws(() => owner.recordedSettlementTerms({ ...model,
    rewardOutcome: { ...model.rewardOutcome, programCode: "different", scale: 2 } }),
    { code: "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED" });
});

test("new creation rejects an invalid effective scale rather than saving unpinned evidence", t => {
  const { settings } = fixture(t);
  settings.rewardScale = undefined;
  assert.throws(() => owner.settlementTerms({ amount: "6" }), { code: "ERR_EWASTE_REWARD_RECOVERY_TERMS_REQUIRED" });
});
