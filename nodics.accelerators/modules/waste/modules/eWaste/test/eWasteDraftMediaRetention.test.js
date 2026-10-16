/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteDraftMediaRetention @description Exercises private scoped inspection with real Waste adapter, nAuth runtime admission and nRouter permissions; generated repositories are inert. @owner eWaste @layer test */
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const lodash = require("lodash");
const root = "../../../../../../";
const owner = require("../src/service/defaultEWasteDraftMediaRetentionService");
const controller = require("../src/controller/defaultEWasteDraftMediaRetentionController");
const store = require(root + "nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService");
const access = require(root + "nodics.waste/modules/wasteCore/src/service/defaultWasteOperationalAccessService");
const runtime = require(root + "nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService");
const security = require(root + "nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const defaults = require("../config/properties");

let config, request, tables, calls, hook, service;
const customer = { module: "profile", schema: "customer", code: "customer-a" };

function submission(code, status = "MEDIA_STAGED", app = "partner-a", point = "centre-a") {
  return { code, active: true, revision: 2, submissionStatus: status, submitterRef: customer,
    sourceContext: { applicationCode: app }, updated: new Date("2026-01-01T00:00:00Z"),
    submittedFacts: { preferredCollectionPointCode: point },
    evidenceRefs: [{ module: "wasteSubmission", schema: "wasteEvidence", code: "evidence-" + code }],
    metadata: { photo: { code: "photo-" + code }, reviewedAt: "2026-01-02T00:00:00.000Z" } };
}

function evidence(code, mediaCode, submissionCode) {
  return { code, active: true, revision: 0, status: "ACTIVE", ownerRef: customer,
    mediaRef: { module: "media", schema: "media", code: mediaCode }, metadata: { submissionCode } };
}

function matches(row, query) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "$and") return value.every(part => matches(row, part));
    if (key === "$or") return value.some(part => matches(row, part));
    const actual = lodash.get(row, key);
    if (value && typeof value === "object") return Object.entries(value).every(([operator, operand]) => {
      if (operator === "$in") return operand.includes(actual);
      if (operator === "$gt") return actual > operand;
      if (operator === "$exists") return operand === (actual !== undefined);
      throw new Error("Unsupported fixture query operator " + operator);
    });
    return value === null ? actual === null || actual === undefined : actual === value;
  });
}

beforeEach(() => {
  config = structuredClone(defaults.eWaste);
  config.applicationCode = "partner-a";
  request = { tenant: "tenant-a", httpRequest: { body: {}, query: {}, headers: {} },
    authData: { tenant: "tenant-a", entCode: "enterprise-a", principalType: "service", tokenType: "service",
      serviceId: "scheduled-inspection", runtimeInstanceId: "process-instance", modules: ["eWaste"], permissions: ["waste.audit.read"],
      runtimeScope: { instanceCode: "process-instance", projectCode: "partner", environmentCode: "test", serverCode: "process", assignmentCode: "inspection" } } };
  tables = { wasteCollectionPoint: [
    { code: "centre-a", operatorEnterpriseRef: { module: "profile", schema: "enterprise", code: "enterprise-a" } },
    { code: "centre-b", operatorEnterpriseRef: { module: "profile", schema: "enterprise", code: "enterprise-b" } },
  ], wasteSubmission: [submission("a"), submission("b", "REJECTED"), submission("c", "APPROVED"),
    submission("other-app", "MEDIA_STAGED", "partner-b"), submission("other-enterprise", "MEDIA_STAGED", "partner-a", "centre-b")],
    wasteEvidence: [evidence("evidence-a", "photo-a", "a"), evidence("evidence-b", "photo-b", "b"), evidence("evidence-c", "photo-c", "c")] };
  calls = []; hook = null;
  service = { ...owner, now: () => new Date("2026-10-12T00:00:00Z") };
  global.CONFIG = { get: key => key === 'identityGovernance' ? require('../../../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance : key === "eWaste" ? config : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  const mutation = () => assert.fail("Inspection attempted a mutation or external operation");
  global.SERVICE = { DefaultWastePersistenceService: store, DefaultWasteOperationalAccessService: access,
    DefaultIdentityGovernanceService: require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService'),
    DefaultEWasteDraftMediaRetentionService: service, DefaultServiceTokenService: runtime,
    DefaultSecuredRequestPipelineService: security, DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultModuleService: { invokeModule: mutation }, DefaultMediaCleanupLifecycleService: { scanCandidates: mutation, markPassive: mutation, runRetentionCleanup: mutation },
    DefaultMediaLifecycleCoordinationService: { bind: mutation, deleteExpired: mutation }, DefaultMediaStorageProviderRegistryService: { remove: mutation } };
  for (const schema of Object.keys(tables)) {
    const name = "Default" + schema[0].toUpperCase() + schema.slice(1) + "Service";
    SERVICE[name] = { get: async envelope => {
      calls.push({ schema, envelope: structuredClone(envelope) });
      assert.equal(envelope.tenant, "tenant-a");
      assert.deepEqual(envelope.authData, SERVICE.DefaultIdentityGovernanceService.getSystemAuthData());
      assert.equal(envelope.options.skipItemCache, true);
      assert.equal(envelope.options.recursive, false);
      const rows = tables[schema].filter(row => matches(row, envelope.query)).sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
      const result = { code: "SUC_FIND_00000", result: structuredClone(rows.slice(0, envelope.searchOptions.pageSize)), count: rows.length };
      return hook ? await hook(schema, envelope, result) : result;
    }, save: mutation, update: mutation, remove: mutation, delete: mutation };
  }
});

test("shipped defaults have no retention durations, no scan and no mutation; explicit execution always rejects", async () => {
  const result = await service.run(request);
  assert.equal(result.status, "DISABLED"); assert.equal(calls.length, 0);
  assert.deepEqual(config.acceptanceReadiness.draftMedia.cleanup.retention, { abandonedDraftMs: null, rejectedSubmissionMs: null, replacedDraftMediaMs: null });
  for (const flags of [false, true]) {
    Object.assign(config.acceptanceReadiness.draftMedia.cleanup, { enabled: flags, executionEnabled: flags, deletionEnabled: flags });
    request.httpRequest.body = { dryRun: false };
    await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_EXECUTION_BLOCKED" });
  }
  assert.equal(calls.length, 0);
  assert.equal(service.readiness().executionSupported, false);
  assert.equal(service.readiness().deletionEnabled, false);
});

test("private runtime authority and canonical audit permission reject bypasses before any reads", async () => {
  const original = structuredClone(request);
  const changes = [r => r.authData.tokenType = "access", r => r.authData.principalType = "customer",
    r => r.authData.isSystem = true, r => r.authData.modules = ["cronjob"], r => r.authData.permissions = ["*"],
    r => r.authData.permissions = [], r => r.tenant = "tenant-b", r => r.tenantCode = "tenant-b",
    r => r.authData.tenantCode = "tenant-b", r => r.authData.enterpriseCode = "enterprise-b",
    r => r.enterpriseCode = "enterprise-b", r => r.httpRequest.headers["x-enterprise-code"] = "enterprise-b",
    r => r.authData.runtimeScope.instanceCode = "wrong-instance", r => delete r.authData.serviceId];
  for (const change of changes) {
    const attempt = structuredClone(original); change(attempt);
    await assert.rejects(service.run(attempt));
  }
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_FORBIDDEN" });
  assert.equal(calls.length, 0);
});

test("selectors cannot supply authorities, clocks, durations, schemas, operators or unbounded paging", async () => {
  const invalid = [{ tenant: "tenant-b" }, { enterpriseCode: "enterprise-b" }, { now: "2099-01-01" },
    { retentionDays: 1 }, { schema: "media" }, { limit: { $gt: 0 } }, { dryRun: "false" },
    { limit: 0 }, { limit: -1 }, { limit: 101 }, { limit: 1.5 }, { limit: "1" }, { cursor: "" }];
  for (const body of invalid) {
    request.httpRequest.body = body;
    await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_INPUT" });
  }
  assert.equal(calls.length, 0);
});

test("scan distinguishes abandoned candidates, rejection and acceptance within signed tenant/enterprise/application scope", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  const result = await service.run(request);
  assert.equal(result.scanned, 3); assert.equal(result.nextCursor, null);
  assert.deepEqual(result.records.map(row => row.category), ["UNSUBMITTED_DRAFT_OBSERVATION", "REJECTED_SUBMISSION", "ACCEPTED_OR_PROMOTED_EVIDENCE"]);
  assert(result.records.every(row => row.protected && !row.cleanupEligible && !row.ageEligible));
  assert(result.records.every(row => row.originStatus === "UNCONFIRMED_PROTECTED" && !row.userCreatedDraftConfirmed && !row.futurePolicyCandidate));
  assert(result.records[0].reasons.includes("RETENTION_POLICY_UNDECIDED"));
  assert(result.records[2].reasons.includes("LIFECYCLE_PROTECTED"));
  assert.equal(result.deleted, 0); assert.equal(result.saved, 0);
  const output = JSON.stringify(result);
  for (const text of ["customer-a", "serviceAccountUserGroup", "fullPath", "storageKey", "originalFileName", "submitterRef"])
    assert(!output.includes(text), text);
});

test("permanent demo preservation and unconfirmed provenance never become user-created cleanup authority", async () => {
  const policy = config.acceptanceReadiness.draftMedia.cleanup;
  Object.assign(policy, { enabled: true, executionEnabled: true, deletionEnabled: true });
  policy.retention = { abandonedDraftMs: 1000, rejectedSubmissionMs: 1000, replacedDraftMediaMs: 1000 };
  // Neither a sample label nor caller-authored provenance is an authoritative owner pack receipt.
  tables.wasteSubmission[0].metadata.sample = true;
  tables.wasteEvidence[0].metadata.manifestCode = "caller-supplied-pack";
  const result = await service.run(request);
  assert(result.records[0].ageEligible);
  assert(result.records.every(row => row.protected && !row.cleanupEligible && !row.futurePolicyCandidate && !row.userCreatedDraftConfirmed));
  assert(result.records.every(row => row.reasons.includes("PERMANENT_PACK_ORIGIN_UNCONFIRMED_PROTECTED")));
  assert.equal(result.readiness.ownerInspectionCapabilityAvailable, true);
  assert.equal(result.readiness.ownerCleanupCapabilityAvailable, false);
  assert.equal(result.readiness.retentionApprovalStatus, "NOT_ESTABLISHED");
  assert.equal(result.readiness.schedulerActivationStatus, "UNKNOWN_NOT_PROVISIONED_BY_EWASTE");
  assert.equal(result.readiness.permanentDemoDataPolicy, "PRESERVE_OWNER_DATA_PACKS_UNCONDITIONALLY");
  assert.equal(result.readiness.deletionEnabled, false);
  assert.equal(result.saved, 0); assert.equal(result.deleted, 0);
});

test("retention boundary is inclusive, reviewed defaults are overridable and referenced evidence remains protected", () => {
  const record = submission("a"), photo = tables.wasteEvidence[0];
  const duration = 1000, at = new Date(record.updated.getTime() + duration);
  const policy = { retention: { abandonedDraftMs: duration } };
  assert.equal(service.eligibility(record, photo, policy, new Date(at.getTime() - 1)).ageEligible, false);
  const eligible = service.eligibility(record, photo, policy, at);
  assert.equal(eligible.ageEligible, true); assert.equal(eligible.cleanupEligible, false);
  assert(eligible.reasons.includes("WASTE_MEDIA_REFERENCE_PROTECTED"));
  for (const invalid of [null, undefined, 0, -1, "1000", NaN, Infinity, 1.5])
    assert.equal(service.eligibility(record, photo, { retention: { abandonedDraftMs: invalid } }, at).ageEligible, false);
  record.updated = new Date(at.getTime() + duration);
  assert(service.eligibility(record, photo, policy, at).reasons.includes("RETENTION_ANCHOR_UNAVAILABLE"));
});

test("replaced, inactive and historical media stay protected; capture time is never substituted for replacement time", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  const old = evidence("old-evidence", "old-photo", "a");
  old.active = false; old.status = "ARCHIVED"; old.capturedAt = "2000-01-01T00:00:00Z";
  tables.wasteEvidence.push(old);
  config.acceptanceReadiness.draftMedia.cleanup.retention.replacedDraftMediaMs = 1000;
  const result = await service.run(request), historical = result.records.find(row => row.mediaCode === "old-photo");
  assert.equal(historical.category, "REPLACED_DRAFT_MEDIA"); assert.equal(historical.ageEligible, false);
  assert(historical.reasons.includes("RETENTION_ANCHOR_UNAVAILABLE"));
  assert(historical.reasons.includes("HISTORICAL_EVIDENCE_PROTECTED"));
  assert.equal(historical.cleanupEligible, false);
});

test("submitted, review, changes-requested, cancelled and archived records never become abandoned by age", () => {
  for (const state of ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "CANCELLED", "ARCHIVED", "UNKNOWN"])
    assert.equal(service.eligibility(submission("a", state), tables.wasteEvidence[0], { retention: { abandonedDraftMs: 1 } }, new Date()).category, "WORKFLOW_EVIDENCE");
  for (const metadata of [{ submittedAt: "2000-01-01" }, { reviewDecision: "REJECTED" }]) {
    const row = submission("a"); Object.assign(row.metadata, metadata);
    assert.equal(service.category(row, "photo-a"), "WORKFLOW_EVIDENCE");
  }
  const promoted = submission("a", "REJECTED"); promoted.metadata.approvedEstimate = { original: true };
  assert.equal(service.category(promoted, "photo-a"), "ACCEPTED_OR_PROMOTED_EVIDENCE");
});

test("keyset continuation and retries reread current state, protect newly approved evidence and bind cursor to scope", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  request.httpRequest.body = { limit: 1 };
  const first = await service.run(request);
  const replay = await service.run(request);
  assert.deepEqual(replay, first);
  assert(first.nextCursor);
  request.httpRequest.body = { limit: 1, cursor: first.nextCursor };
  tables.wasteSubmission[1].submissionStatus = "APPROVED";
  tables.wasteSubmission[1].revision++;
  const second = await service.run(request);
  assert.equal(second.records[0].submissionCode, "b");
  assert.equal(second.records[0].category, "ACCEPTED_OR_PROMOTED_EVIDENCE");
  config.applicationCode = "partner-b";
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_INPUT" });
});

test("failed, malformed, extra, out-of-tenant and truncated generated responses never become empty successful scans", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  const invalid = [r => ({ ...r, code: "ERR_FIND_FAILED" }), r => ({ ...r, success: false }),
    r => ({ ...r, error: "private provider error" }), r => ({ ...r, errors: ["private"] }),
    r => ({ ...r, count: undefined }), r => ({ ...r, count: -1 }), r => ({ ...r, result: [] }),
    r => ({ ...r, result: [...r.result, ...r.result] }),
    r => ({ ...r, result: r.result.map(row => ({ ...row, tenant: "tenant-b" })) })];
  for (const alter of invalid) {
    hook = (_schema, _envelope, response) => alter(response);
    await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
  }
  hook = () => { throw new Error("secret provider address"); };
  await assert.rejects(service.run(request), error => error.code === "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" && !error.message.includes("secret"));
});

test("missing owner dependencies and changed authority/configuration during awaited reads fail closed", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  hook = (_schema, _envelope, response) => { request.authData.entCode = "enterprise-b"; return response; };
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_FORBIDDEN" });
  request.authData.entCode = "enterprise-a";
  hook = (_schema, _envelope, response) => { config.acceptanceReadiness.draftMedia.cleanup.batchSize++; return response; };
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_FORBIDDEN" });
  hook = null;
  delete SERVICE.DefaultWasteEvidenceService;
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
});

test("partial evidence is explicit and referenced current-photo metadata is protected even when no evidence row is present", async () => {
  const policy = config.acceptanceReadiness.draftMedia.cleanup;
  policy.enabled = true; policy.maximumEvidencePerSubmission = 1;
  tables.wasteEvidence.push(evidence("older-evidence", "older-photo", "a"));
  tables.wasteEvidence = tables.wasteEvidence.filter(row => row.code !== "evidence-b");
  const result = await service.run(request);
  assert(result.records.filter(row => row.submissionCode === "a").every(row => row.reasons.includes("WASTE_EVIDENCE_INCOMPLETE")));
  const missing = result.records.find(row => row.submissionCode === "b");
  assert.equal(missing.evidenceCode, null); assert.equal(missing.cleanupEligible, false);
  assert(missing.reasons.includes("WASTE_MEDIA_REFERENCE_PROTECTED"));
});

test("submission changes during inspection and collection-point reassignment invalidate the report", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  hook = (schema, _envelope, response) => {
    if (schema === "wasteEvidence") tables.wasteSubmission[0].revision++;
    return response;
  };
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
  hook = (schema, _envelope, response) => {
    if (schema === "wasteEvidence") tables.wasteCollectionPoint[0].operatorEnterpriseRef.code = "enterprise-b";
    return response;
  };
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_FORBIDDEN" });
});

test("scope precedes queries and rejects oversized point inventories, forged rows and wrong-owner evidence", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  config.acceptanceReadiness.draftMedia.cleanup.maximumCollectionPoints = 1;
  tables.wasteCollectionPoint.push({ ...tables.wasteCollectionPoint[0], code: "centre-extra" });
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
  assert(calls.every(call => call.schema === "wasteCollectionPoint"));
  tables.wasteCollectionPoint.pop();
  hook = (schema, _envelope, response) => schema === "wasteSubmission" ?
    { code: "SUC_FIND_00000", result: [tables.wasteSubmission[3]], count: 1 } : response;
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
  hook = null;
  tables.wasteEvidence[0].ownerRef = { ...customer, code: "other-customer" };
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
});

test("a later layer can narrow classification and override policy without replacing the inspection algorithm", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  config.acceptanceReadiness.draftMedia.cleanup.retention.abandonedDraftMs = 1000;
  const layered = { ...service, category: () => "WORKFLOW_EVIDENCE" };
  const result = await layered.run(request);
  assert(result.records.every(row => row.category === "WORKFLOW_EVIDENCE" && !row.cleanupEligible));
  config.applicationCode = "partner-b";
  const other = await service.run(request);
  assert.equal(other.scanned, 1); assert(other.records.every(row => row.submissionCode === "other-app"));
});

test("private route and controller preserve original runtime context and no-store without dispatching cleanup", async () => {
  const route = require("../src/router/routers").eWaste.draftMediaRetention.inspectDraftMediaRetention;
  assert.equal(route.key, "/internal/draft-media/retention/inspect");
  assert.deepEqual(route.authTokenTypes, ["service"]); assert.equal(route.permission, "waste.audit.read");
  assert.equal(route.apiExposure, "wasteInternal"); assert.equal(route.secured, true);
  assert.equal(route.requestPrivacy.sensitive, true); assert.equal(route.cache.enabled, false);
  let header;
  request.httpResponse = { setHeader: (...args) => { header = args; } };
  const result = await controller.inspect(request);
  assert.equal(result.data.status, "DISABLED"); assert.deepEqual(header, ["Cache-Control", "no-store"]);
  assert.equal(calls.length, 0);
});

test("existing Cron internal request construction targets inspection and preserves read-only selectors across replay", async () => {
  const cron = require(root + "nodics.process/modules/cronjob/src/service/trigger/defaultCronJobTriggerHandlerService");
  const original = { code: "owner-inspection", tenant: "tenant-a", jobDetail: { internal: {
    module: "eWaste", method: "POST", uri: "/internal/draft-media/retention/inspect", body: { dryRun: true, limit: 1 }, timeoutMs: 10000,
  } } };
  const before = structuredClone(original);
  global.NODICS = { getInternalAuthToken: tenant => { assert.equal(tenant, "tenant-a"); return "inert-runtime-token"; } };
  SERVICE.DefaultModuleService.buildRequest = value => value;
  const descriptor = cron.prepareInternalURL(original);
  assert.equal(descriptor.moduleName, "eWaste"); assert.equal(descriptor.methodName, "POST");
  assert.equal(descriptor.apiName, "/internal/draft-media/retention/inspect");
  assert.equal(descriptor.header.Authorization, "Bearer inert-runtime-token");
  assert.equal(descriptor.timeoutMs, 10000);
  assert.deepEqual(original, before);
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  request.httpRequest.body = descriptor.requestBody;
  const first = await controller.inspect(request);
  const retry = await controller.inspect(request);
  assert.deepEqual(retry, first);
  assert.equal(first.data.deleted, 0); assert.equal(first.data.saved, 0);
  delete global.NODICS;
});

test("an uncertain inspection response is retried with the same selectors after restart without side effects", async () => {
  config.acceptanceReadiness.draftMedia.cleanup.enabled = true;
  request.httpRequest.body = { limit: 1 };
  let failed = false;
  hook = (schema, _envelope, response) => {
    if (schema === "wasteEvidence" && !failed) { failed = true; throw new Error("inert read timeout"); }
    return response;
  };
  await assert.rejects(service.run(request), { code: "ERR_EWASTE_MEDIA_CLEANUP_UNAVAILABLE" });
  const restarted = { ...owner, now: service.now };
  const result = await restarted.run(request);
  assert.equal(result.records[0].submissionCode, "a"); assert(result.nextCursor);
  assert.equal(result.deleted, 0); assert.equal(result.saved, 0);
});
