/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module eWaste/test/eWastePreparation @description Proves preparation failure/cancellation precedes persistence, and successful/replayed/replaced photos preserve ownership. @owner eWaste @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const preparation = require("../src/service/defaultEWasteSubmissionPreparationService");
const operation = require("../../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService");
const analyzer = require("../../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteMetadataAnalysisService");
const persistence = require("../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService");
const descriptor = require("../../../../../../nodics.waste/modules/wasteMaterial/src/service/defaultWasteItemDescriptorService");
let records, writes, mediaCalls, inspect, cancelled;
const request = (extra = {}) => ({ tenant: "runtime", authData: { principalType: "customer", loginId: "owner@example.test", code: "owner" },
  idempotencyKey: "preparation-one", payload: { photo: { mimeType: "image/png", contentBase64: Buffer.from("test-photo").toString("base64") }, collectionPointCode: "CENTRE" },
  isCancelled: () => cancelled, ...extra });
const analysis = () => ({ proposal: { name: "My phone", itemTypeCode: "PHONE", categoryCode: "ELECTRONICS", quantity: 1, materials: [] },
  recognition: { assessment: "SUPPORTED" }, evidenceReview: { manualApprovalRequired: true }, provider: "provider", confidence: "0.8" });
beforeEach(() => {
  records = new Map(); writes = []; mediaCalls = 0; cancelled = false; inspect = async () => analysis();
  global.CONFIG = { get: key => key === "eWaste" ? { preparation: { maximumPhotoBytes: 1024 }, applicationCode: "example" } :
    key === "wasteSubmission" ? { metadataSuggestion: { manualReviewFallback: true, fallbackItemTypeCode: "UNKNOWN_ELECTRONIC_ITEM", allowedFamilyCodes: ["ELECTRONICS"] } } :
    key === "wasteMaterial" ? { descriptor: { maximumMaterials: 24, maximumWeightKg: 10000, maximumDimensionCm: 10000 } } : {} };
  global.SERVICE = {
    DefaultWastePersistenceService: { ...persistence,
      one: async (schema, req, code) => records.get(schema + ":" + code) || ({
        wasteItemType: code === "UNKNOWN_ELECTRONIC_ITEM" ? { code: "UNKNOWN_ELECTRONIC_ITEM", categoryCode: "ELECTRONICS", status: "ACTIVE", allowedConditionGrades: ["UNKNOWN"] } : { code: "PHONE", categoryCode: "ELECTRONICS", status: "ACTIVE" },
        wasteCategory: { code: "ELECTRONICS", status: "ACTIVE", familyCode: "ELECTRONICS" },
        wasteCollectionPoint: { code: "CENTRE", operatingStatus: "ACTIVE", publicVisibility: "PUBLIC" },
      })[schema],
      create: async (schema, req, record) => { writes.push(schema); records.set(schema + ":" + record.code, structuredClone(record)); return record; },
      update: async (schema, req, old, patch) => { const record = { ...old, ...patch, revision: old.revision + 1 }; writes.push(schema); records.set(schema + ":" + record.code, structuredClone(record)); return record; },
    },
    DefaultWasteSubmissionOperationService: operation,
    DefaultWasteMetadataAnalysisService: { ...analyzer, inspect: (...args) => inspect(...args) },
    DefaultWasteItemDescriptorService: descriptor,
    DefaultEWasteExperienceService: { unwrap: value => value },
    DefaultModuleService: { invokeModule: async () => { mediaCalls++; return { code: "PHOTO", ownerReference: "owner", mimeType: "image/png" }; } },
  };
});
afterEach(() => { delete global.CONFIG; delete global.SERVICE; });
test("failed analysis and cancelled preparations create no Media, Waste or suggestion records", async () => {
  inspect = async () => { throw Object.assign(Error("Unclear photo"), { code: "ERR_WASTE_RECOGNITION_INVALID" }); };
  await assert.rejects(preparation.prepare(request()), { code: "ERR_WASTE_RECOGNITION_INVALID" });
  inspect = async () => { cancelled = true; return analysis(); };
  await assert.rejects(preparation.prepare(request()));
  assert.equal(mediaCalls, 0); assert.deepEqual(writes, []);
});
test("successful analysis precedes every write and replay returns one prepared record", async () => {
  inspect = async () => { assert.equal(mediaCalls, 0); assert.deepEqual(writes, []); return analysis(); };
  const first = await preparation.prepare(request());
  assert.equal(first.submissionStatus, "METADATA_SUGGESTED");
  assert.equal(first.submittedFacts.name, "My phone");
  assert.equal(first.metadata.suggestion.recognition.evidenceRef.code, "PHOTO");
  assert.equal(first.metadata.evidenceReview.flaggedEvidenceRef.code, "PHOTO");
  assert.deepEqual(writes, ["wasteEvidence", "wasteMetadataSuggestion", "wasteSubmission"]);
  assert.equal((await preparation.prepare(request())).code, first.code);
  assert.equal(mediaCalls, 1); assert.equal(writes.length, 3);
});
test("recognition provider unavailability saves the photo for manual review fallback", async () => {
  inspect = async () => { throw Object.assign(Error("Photo recognition is unavailable"), { code: "ERR_WASTE_RECOGNITION_UNAVAILABLE" }); };
  const prepared = await preparation.prepare(request());
  assert.equal(prepared.submissionStatus, "METADATA_SUGGESTED");
  assert.equal(prepared.submittedFacts.itemTypeCode, "UNKNOWN_ELECTRONIC_ITEM");
  assert.equal(prepared.metadata.manualReviewRequired, true);
  assert.equal(prepared.metadata.suggestion.provider, null);
  assert.equal(prepared.metadata.suggestion.recognition.analysisStatus, "UNAVAILABLE");
  assert.equal(prepared.metadata.suggestion.recognition.evidenceRef.code, "PHOTO");
  assert.equal(prepared.metadata.evidenceReview.manualApprovalRequired, true);
  assert.deepEqual(writes, ["wasteEvidence", "wasteMetadataSuggestion", "wasteSubmission"]);
  assert.equal(mediaCalls, 1);
});
test("invalid input and rejected collection eligibility leave no records", async () => {
  await assert.rejects(preparation.prepare(request({ payload: { photo: { mimeType: "image/png", contentBase64: "invalid" } } })));
  SERVICE.DefaultWasteSubmissionOperationService = { ...operation, validateFacts: async () => { throw Error("Centre does not accept the item"); } };
  await assert.rejects(preparation.prepare(request()));
  assert.equal(mediaCalls, 0); assert.deepEqual(writes, []);
});
test("failed replacement preserves the previously saved photo and facts", async () => {
  const existing = await preparation.prepare(request());
  const before = structuredClone(records.get("wasteSubmission:" + existing.code));
  inspect = async () => { throw Error("Unclear new photo"); };
  await assert.rejects(preparation.prepare(request({ code: existing.code, expectedRevision: existing.revision, idempotencyKey: "replacement-one" })));
  assert.deepEqual(records.get("wasteSubmission:" + existing.code), before);
  assert.equal(mediaCalls, 1);
});
test("foreign owners and finalized submissions cannot replace prepared evidence", async () => {
  const existing = await preparation.prepare(request());
  await assert.rejects(preparation.prepare(request({ code: existing.code, idempotencyKey: "replacement-one", expectedRevision: existing.revision, authData: { principalType: "customer", loginId: "other@example.test", code: "other" } })), { code: "ERR_WASTE_RECORD_NOT_FOUND" });
  records.get("wasteSubmission:" + existing.code).submissionStatus = "SUBMITTED";
  await assert.rejects(preparation.prepare(request({ code: existing.code, idempotencyKey: "replacement-one", expectedRevision: existing.revision })), { code: "ERR_WASTE_SUBMISSION_IMMUTABLE" });
  assert.equal(mediaCalls, 1);
});
