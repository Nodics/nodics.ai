/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");

/**
 * @module eWaste/service/defaultEWasteDraftMediaRetentionService
 * @description Inspects draft/rejected media retention through canonical Waste repositories.
 * @owner eWaste @layer service
 * @override Later modules may narrow eligibility, tune bounded reads and supply reviewed retention
 * durations. Preserve runtime authority, scope, reference protection and the unconditional execution block.
 * @sideEffects None. No Media mutation, candidate persistence, provider access or scheduler creation.
 * @returns Read-only observations, policy blockers and an optional navigation cursor, never deletion authority.
 */
module.exports = {
  /** Returns effective owner defaults; missing policy never acquires implicit retention periods. */
  settings: function () {
    return CONFIG.get("eWaste")?.acceptanceReadiness?.draftMedia?.cleanup || {};
  },
  /** Throws a stable, content-free error through Waste's existing error boundary. */
  fail: function (suffix) {
    const code = "ERR_EWASTE_MEDIA_CLEANUP_" + suffix;
    return SERVICE.DefaultWastePersistenceService.fail(code, SERVICE.DefaultStatusService?.get?.(code)?.message || "Protected eWaste media inspection could not complete");
  },
  /** Validates bounded persisted identities without accepting database operators or storage paths. */
  identifier: function (value) {
    return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|-]{0,254}$/.test(value);
  },
  /** Obtains the inspection clock; callers cannot advance time through HTTP or scheduled-job payloads. */
  now: function () { return new Date(); },
  /** Returns a request-local fingerprint for navigation and change detection, not authorization. */
  digest: function (value) {
    return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  },
  /**
   * Admits only the original router-verified runtime principal and literal audit grant.
   * @param {Object} request Original private nRouter request. No body field selects tenant, enterprise or owner.
   * @returns {Object} Signed authority; rejects before generated reads on mismatch or missing capture protection.
   */
  authorize: function (request) {
    const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
    if (SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true ||
        !SERVICE.DefaultServiceTokenService?.requireRuntimePrincipal ||
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "eWaste") !== auth ||
        auth.principalType !== "service" || auth.isSystem || !this.identifier(auth.serviceId) ||
        !this.identifier(auth.tenant) || !this.identifier(auth.entCode) || request.tenant !== auth.tenant ||
        [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
        [request.enterpriseCode, request.entCode, auth.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== auth.entCode) ||
        !Array.isArray(auth.permissions) || !auth.permissions.includes("waste.audit.read") ||
        !security?.isPermissionGranted("waste.audit.read", security.getGrantedPermissions(request), {})) return this.fail("FORBIDDEN");
    return auth;
  },
  /** Validates pure navigation selectors. No explicit execution request is ever converted to a preview. */
  selectors: function (input, policy) {
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        Object.keys(input).some(key => !["dryRun", "limit", "cursor"].includes(key))) return this.fail("INPUT");
    if (input.dryRun === false) return this.fail("EXECUTION_BLOCKED");
    if (input.dryRun !== undefined && input.dryRun !== true) return this.fail("INPUT");
    const limit = input.limit === undefined ? policy.batchSize : input.limit;
    if (![policy.batchSize, policy.maximumBatchSize, policy.maximumCollectionPoints, policy.maximumEvidencePerSubmission]
      .every(value => Number.isSafeInteger(value) && value > 0 && value <= 500) ||
        policy.batchSize > policy.maximumBatchSize || !Number.isSafeInteger(limit) || limit < 1 || limit > policy.maximumBatchSize ||
        input.cursor !== undefined && (typeof input.cursor !== "string" || !input.cursor.length || input.cursor.length > 2048)) return this.fail("INPUT");
    return { limit, cursor: input.cursor };
  },
  /** Rechecks original authority and effective configuration across every asynchronous generated read. */
  unchanged: function (request, pin) {
    this.authorize(request);
    if (!isDeepStrictEqual(request.authData, pin.auth) || !isDeepStrictEqual(this.settings(), pin.policy) ||
        !isDeepStrictEqual(request.httpRequest?.body || {}, pin.input) || CONFIG.get("eWaste")?.applicationCode !== pin.applicationCode)
      return this.fail("FORBIDDEN");
  },
  /**
   * Reads through the existing Waste generated-service adapter, retaining tenant isolation and skipping cache.
   * @param {Object} request Original admitted request.
   * @param {Object} pin Request-local authority/configuration pin.
   * @param {string} schema Server-owned Waste schema name.
   * @param {Object} query Server-compiled query, never HTTP input.
   * @param {number} limit Bounded page size.
   * @returns {Promise<Object>} Strictly acknowledged ordered rows and remaining count; rejects failed/truncated envelopes.
   */
  read: async function (request, pin, schema, query, limit) {
    this.unchanged(request, pin);
    const store = SERVICE.DefaultWastePersistenceService;
    const envelope = { ...store.context(request), query, options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: limit, pageNumber: 1, sort: { code: 1 } } };
    let response;
    try { response = await store.repository(schema).get(envelope); }
    catch (_) { return this.fail("UNAVAILABLE"); }
    this.unchanged(request, pin);
    if (envelope.tenant !== pin.auth.tenant || response?.code !== "SUC_FIND_00000" || response.error ||
        response.success === false || response.acknowledged === false ||
        response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
        !Array.isArray(response.result) || !Number.isSafeInteger(response.count) || response.count < 0 ||
        response.result.length !== Math.min(limit, response.count) ||
        response.result.some((row, i, rows) => !row || !this.identifier(row.code) ||
          row.tenant !== undefined && row.tenant !== pin.auth.tenant || i > 0 && rows[i - 1].code >= row.code)) return this.fail("UNAVAILABLE");
    return { items: structuredClone(response.result), total: response.count };
  },
  /** Compiles business scope from the signed enterprise's canonical collection points before scanning submissions. */
  scope: async function (request, pin) {
    const points = await this.read(request, pin, "wasteCollectionPoint", {
      "operatorEnterpriseRef.module": "profile", "operatorEnterpriseRef.schema": "enterprise",
      "operatorEnterpriseRef.code": pin.auth.entCode,
    }, pin.policy.maximumCollectionPoints);
    if (points.total > pin.policy.maximumCollectionPoints || points.items.some(point =>
      point.operatorEnterpriseRef?.module !== "profile" || point.operatorEnterpriseRef?.schema !== "enterprise" ||
      point.operatorEnterpriseRef?.code !== pin.auth.entCode)) return this.fail("UNAVAILABLE");
    return points.items.map(point => point.code);
  },
  /** Decodes a navigation-only cursor and binds it to freshly resolved scope, policy and principal. */
  continuation: function (cursor, scopeDigest) {
    if (cursor === undefined) return null;
    let value;
    try {
      value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
      if (Buffer.from(JSON.stringify(value)).toString("base64url") !== cursor) return this.fail("INPUT");
    } catch (_) { return this.fail("INPUT"); }
    if (!value || Object.keys(value).sort().join() !== "afterCode,scopeDigest" ||
        value.scopeDigest !== scopeDigest || !this.identifier(value.afterCode)) return this.fail("INPUT");
    return value.afterCode;
  },
  /** Classifies persisted lifecycle, never treating an old approved/reviewing submission as an abandoned draft. */
  category: function (submission, mediaCode) {
    if (submission.submissionStatus === "APPROVED" || submission.metadata?.reviewDecision === "APPROVED" ||
        submission.metadata?.approvedBy || submission.metadata?.approvedEstimate || submission.metadata?.rewardSettlement ||
        submission.receiptRef)
      return "ACCEPTED_OR_PROMOTED_EVIDENCE";
    if (submission.submissionStatus === "REJECTED") return "REJECTED_SUBMISSION";
    if (["DRAFT", "MEDIA_STAGED", "METADATA_SUGGESTED", "AWAITING_SUBMITTER_CONFIRMATION"].includes(submission.submissionStatus)) {
      if (submission.metadata?.submittedAt || submission.metadata?.reviewDecision) return "WORKFLOW_EVIDENCE";
      return mediaCode === submission.metadata?.photo?.code ? "UNSUBMITTED_DRAFT_OBSERVATION" : "REPLACED_DRAFT_MEDIA";
    }
    return "WORKFLOW_EVIDENCE";
  },
  /**
   * Calculates policy age separately from cleanup eligibility. References and unknown Media proof always block cleanup.
   * @param {Object} submission Fresh scoped Waste submission.
   * @param {Object} evidence Persisted Waste evidence or current-photo observation.
   * @param {Object} policy Effective cleanup policy; null/invalid durations mean undecided.
   * @param {Date} now Owner clock for this inspection.
   * @param {boolean} complete Whether all related Waste evidence was observed.
   * @returns {Object} Allowlisted observation without bytes, paths, owner PII or a mutation command.
   */
  eligibility: function (submission, evidence, policy, now, complete = true) {
    const mediaCode = evidence.mediaRef?.code || submission.metadata?.photo?.code;
    const category = this.category(submission, mediaCode), reasons = [];
    const durationKey = { UNSUBMITTED_DRAFT_OBSERVATION: "abandonedDraftMs", REJECTED_SUBMISSION: "rejectedSubmissionMs", REPLACED_DRAFT_MEDIA: "replacedDraftMediaMs" }[category];
    const duration = policy.retention?.[durationKey];
    // No replaced-at lifecycle exists: capturedAt is not evidence of when a photo was superseded.
    const rawAnchor = category === "UNSUBMITTED_DRAFT_OBSERVATION" ? submission.updated :
      category === "REJECTED_SUBMISSION" ? submission.metadata?.reviewedAt : null;
    const anchor = rawAnchor instanceof Date ? rawAnchor.getTime() : typeof rawAnchor === "string" ? Date.parse(rawAnchor) : NaN;
    const configured = Number.isSafeInteger(duration) && duration > 0;
    const eligibleTime = configured && Number.isFinite(anchor) ? anchor + duration : NaN;
    const ageEligible = Number.isSafeInteger(eligibleTime) && eligibleTime <= now.getTime() && anchor <= now.getTime();
    if (!durationKey) reasons.push("LIFECYCLE_PROTECTED");
    else if (!configured) reasons.push("RETENTION_POLICY_UNDECIDED");
    if (durationKey && (!Number.isFinite(anchor) || anchor > now.getTime())) reasons.push("RETENTION_ANCHOR_UNAVAILABLE");
    else if (configured && !ageEligible) reasons.push("RETENTION_NOT_ELAPSED");
    if (!complete) reasons.push("WASTE_EVIDENCE_INCOMPLETE");
    if (evidence.mediaRef?.code || submission.metadata?.photo?.code === mediaCode) reasons.push("WASTE_MEDIA_REFERENCE_PROTECTED");
    if (evidence.active === false || evidence.status && evidence.status !== "ACTIVE") reasons.push("HISTORICAL_EVIDENCE_PROTECTED");
    reasons.push("PERMANENT_PACK_ORIGIN_UNCONFIRMED_PROTECTED", "MEDIA_PROTECTION_UNCONFIRMED", "OWNER_CLEANUP_CONTRACT_UNQUALIFIED");
    return { submissionCode: submission.code, submissionRevision: submission.revision, mediaCode,
      evidenceCode: evidence.code || null, category, ageEligible, cleanupEligible: false, protected: true,
      originStatus: "UNCONFIRMED_PROTECTED", userCreatedDraftConfirmed: false, futurePolicyCandidate: false,
      eligibleAt: Number.isSafeInteger(eligibleTime) && Math.abs(eligibleTime) <= 8640000000000000 ? new Date(eligibleTime).toISOString() : null,
      reasons };
  },
  /** Observes current and replaced photos, retaining evidence rows even when inactive or no longer in evidenceRefs. */
  inspectSubmission: async function (request, pin, submission, now) {
    const evidence = await this.read(request, pin, "wasteEvidence", {
      $or: [{ "metadata.submissionCode": submission.code }, { code: { $in: (submission.evidenceRefs || []).map(ref => ref.code) } }],
    }, pin.policy.maximumEvidencePerSubmission);
    if (evidence.items.some(row => !isDeepStrictEqual(row.ownerRef, submission.submitterRef) ||
        row.metadata?.submissionCode !== submission.code &&
        !(submission.evidenceRefs || []).some(ref => ref.module === "wasteSubmission" && ref.schema === "wasteEvidence" && ref.code === row.code))) return this.fail("UNAVAILABLE");
    const records = evidence.items.filter(row => row.mediaRef?.module === "media" && row.mediaRef?.schema === "media" && this.identifier(row.mediaRef.code));
    const photo = submission.metadata?.photo?.code;
    if (photo && !this.identifier(photo)) return this.fail("UNAVAILABLE");
    if (photo && !records.some(row => row.mediaRef.code === photo)) records.push({ mediaRef: { code: photo } });
    return records.map(row => this.eligibility(submission, row, pin.policy, now, evidence.total <= pin.policy.maximumEvidencePerSubmission));
  },
  /** Reports inert source readiness. Configuration never qualifies the missing Media cleanup/fencing contract. */
  readiness: function () {
    const policy = this.settings();
    const retentionPolicyConfigured = ["abandonedDraftMs", "rejectedSubmissionMs", "replacedDraftMediaMs"].every(key =>
      Number.isSafeInteger(policy.retention?.[key]) && policy.retention[key] > 0);
    return { ownerInspectionCapabilityAvailable: true, ownerCleanupCapabilityAvailable: false,
      inspectionEnabled: policy.enabled === true, dryRunOnly: true,
      executionEnabled: false, deletionEnabled: false, executionSupported: false,
      configuredExecutionRequested: policy.executionEnabled === true || policy.deletionEnabled === true,
      retentionPolicyConfigured, retentionApprovalStatus: "NOT_ESTABLISHED",
      schedulerActivationStatus: "UNKNOWN_NOT_PROVISIONED_BY_EWASTE",
      permanentDemoDataPolicy: "PRESERVE_OWNER_DATA_PACKS_UNCONDITIONALLY",
      packProvenanceStatus: "UNAVAILABLE_THROUGH_SCOPED_WASTE_CONTRACT",
      blockers: [...(!retentionPolicyConfigured ? ["RETENTION_POLICY_UNDECIDED"] : []),
        "RETENTION_APPROVAL_NOT_ESTABLISHED", "PERMANENT_PACK_PROVENANCE_UNCONFIRMED",
        "SCHEDULER_ACTIVATION_UNCONFIRMED", "OWNER_CLEANUP_CONTRACT_UNQUALIFIED",
        "REPLACEMENT_TIMESTAMP_UNAVAILABLE", "UNLINKED_UPLOAD_DISCOVERY_UNAVAILABLE"] };
  },
  /**
   * Executes one bounded read-only inspection suitable for the existing Cron internal HTTP handler.
   * @param {Object} request Private router request with optional body {dryRun:true, limit, cursor}.
   * @returns {Promise<Object>} Fresh observations and a resumable navigation cursor. Retries repeat reads only.
   * @throws Rejects explicit execution, stale authority, invalid selectors, failed reads or changed scope.
   */
  run: async function (request) {
    const auth = this.authorize(request), policy = structuredClone(this.settings());
    if (Object.keys(request.httpRequest?.query || {}).length || Object.keys(request.query || {}).length) return this.fail("INPUT");
    const input = structuredClone(request.httpRequest?.body || {}), selectors = this.selectors(input, policy);
    const applicationCode = CONFIG.get("eWaste")?.applicationCode;
    if (!this.identifier(applicationCode)) return this.fail("INPUT");
    const pin = { auth: structuredClone(auth), policy, input, applicationCode };
    const readiness = this.readiness();
    if (policy.enabled !== true) return { contractVersion: 1, status: "DISABLED", dryRun: true, readiness, records: [], scanned: 0, nextCursor: null, deleted: 0, saved: 0 };
    const now = this.now();
    if (!(now instanceof Date) || !Number.isFinite(now.getTime())) return this.fail("UNAVAILABLE");
    const points = await this.scope(request, pin);
    const scopeDigest = this.digest({ tenant: auth.tenant, enterprise: auth.entCode, serviceId: auth.serviceId, applicationCode, points, policy });
    const afterCode = this.continuation(selectors.cursor, scopeDigest);
    const query = { $and: [{ "sourceContext.applicationCode": applicationCode },
      SERVICE.DefaultWasteOperationalAccessService.pointQuery(points), ...(afterCode ? [{ code: { $gt: afterCode } }] : [])] };
    const page = await this.read(request, pin, "wasteSubmission", query, selectors.limit);
    const records = [];
    for (const submission of page.items) {
      if (submission.sourceContext?.applicationCode !== applicationCode ||
          !points.includes(SERVICE.DefaultWasteOperationalAccessService.pointCode(submission)) ||
          submission.submitterRef?.module !== "profile" || submission.submitterRef?.schema !== "customer" || !this.identifier(submission.submitterRef?.code) ||
          !Number.isSafeInteger(submission.revision) || submission.revision < 0 || afterCode && submission.code <= afterCode ||
          !Array.isArray(submission.evidenceRefs || []) || (submission.evidenceRefs || []).some(ref =>
            ref.module !== "wasteSubmission" || ref.schema !== "wasteEvidence" || !this.identifier(ref.code))) return this.fail("UNAVAILABLE");
      records.push(...await this.inspectSubmission(request, pin, submission, now));
      const fresh = await this.read(request, pin, "wasteSubmission", { $and: [query, { code: submission.code }] }, 2);
      if (fresh.total !== 1 || !isDeepStrictEqual(fresh.items[0], submission)) return this.fail("UNAVAILABLE");
    }
    // A moved collection point cannot leave an apparently successful report under an obsolete enterprise scope.
    if (!isDeepStrictEqual(points, await this.scope(request, pin))) return this.fail("FORBIDDEN");
    this.unchanged(request, pin);
    return { contractVersion: 1, status: "READ_ONLY_BLOCKED", dryRun: true, inspectedAt: now.toISOString(), readiness,
      coverage: "APPLICATION_SUBMISSIONS_AT_ENTERPRISE_COLLECTION_POINTS", scanned: page.items.length, records, deleted: 0, saved: 0,
      nextCursor: page.total > page.items.length ? Buffer.from(JSON.stringify({ afterCode: page.items.at(-1).code, scopeDigest })).toString("base64url") : null };
  },
};
