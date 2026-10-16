/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

const crypto = require("node:crypto");

/** @module wasteVerification/service/defaultWasteEvidenceRejectionService @description Records evidence-only rejection without asserting physical facts or invoking asset, custody, impact or reward owners. @layer service @owner wasteVerification @override Later layers may restrict admission; never weaken normal approval or replace original evidence during recovery. */
module.exports = {
  /** Hashes inert command/evidence data with stable object-key order. */
  digest: function (value) {
    return crypto.createHash("sha256").update(JSON.stringify(value, (_key, item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
        : item)).digest("hex");
  },
  /** Captures original evidence and customer facts, never creates verified facts. */
  evidenceDigest: function (record) {
    return this.digest([record.metadata?.photo, record.evidenceRefs, record.submittedFacts,
      record.confirmedFacts, record.metadata?.evidenceReview]);
  },
  /** Describes state eligibility only; command permission, assignment and absence proofs remain mandatory. */
  eligible: function (record) {
    const metadata = record?.metadata || {};
    return Boolean(record && ["SUBMITTED", "UNDER_REVIEW"].includes(record.submissionStatus) &&
      record.active !== false && !record.verificationRef && !record.assetRef && !record.receiptRef && !record.impactRef &&
      !metadata.reviewDecision && !metadata.reviewBasis && !metadata.reviewKey && !metadata.reviewDigest && !metadata.reviewCommand &&
      !metadata.preApprovalVerificationRef && !metadata.verificationKey && !metadata.verificationPending &&
      !metadata.verifiedBy && !metadata.verifiedAt && !metadata.verifiedFacts && !metadata.verifiedEstimate &&
      !metadata.approvedBy && !metadata.approvedEstimate && !metadata.reviewedFacts && !metadata.manualEvidenceApproval &&
      typeof metadata.photo?.code === "string" && metadata.photo.code.trim());
  },
  /** Advertises only an assigned human's scoped, unverified evidence; unavailable proofs fail closed. */
  available: async function (request, record) {
    const access = SERVICE.DefaultWasteOperationalAccessService;
    const assignment = record?.metadata?.reviewAssignment;
    if (!this.eligible(record) || request.authData?.principalType !== "human" ||
      !request.authData.loginId || assignment?.type !== "EMPLOYEE" ||
      assignment.principalCode !== request.authData.loginId ||
      !access.granted(request, "waste.review.approve")) return false;
    try {
      const visible = await access.visible(request, "waste.review.approve", [record]);
      if (!Array.isArray(visible) || visible.length !== 1 || visible[0]?.code !== record.code) return false;
      const store = SERVICE.DefaultWastePersistenceService;
      const assets = await store.list("wasteAsset", request, { sourceSubmissionCode: record.code }, 1);
      const decisions = await store.list("wasteVerification", request, { submissionCode: record.code }, 1);
      return Array.isArray(assets) && !assets.length && Array.isArray(decisions) && !decisions.length;
    } catch (_error) {
      return false;
    }
  },
  /** Rejects unusable evidence through an original-actor, revision-fenced, recoverable decision audit. */
  reject: async function (request) {
    const store = SERVICE.DefaultWastePersistenceService;
    const access = SERVICE.DefaultWasteOperationalAccessService;
    const conflict = () => store.fail("ERR_WASTE_REVIEW_CONFLICT", "Evidence-only rejection cannot replace verified, approved or conflicting review evidence");
    await access.authorize(request, "waste.review.approve");
    if (request.authData?.principalType !== "human" || !request.authData?.loginId)
      store.fail("ERR_WASTE_MANUAL_APPROVAL_REQUIRED", "An authorized human reviewer is required");
    const tenant = request.authData.tenant;
    const tenantCheck = record => {
      if (typeof tenant !== "string" || !tenant || request.tenant !== tenant || request.authData.tenant !== tenant ||
        [request.tenantCode, request.authData.tenantCode, record?.tenant, record?.tenantCode].some(value => value !== undefined && value !== tenant)) conflict();
    };
    tenantCheck();
    if (typeof request.code !== "string" || !request.code.trim() || request.code.length > 180)
      store.fail("ERR_WASTE_INPUT_INVALID", "A submission code is required");
    const payload = request.payload || {};
    if (typeof payload !== "object" || Array.isArray(payload) ||
      Object.keys(payload).some(key => !["reason", "expectedRevision", "confirmed", "idempotencyKey"].includes(key)))
      store.fail("ERR_WASTE_INPUT_INVALID", "Evidence-only rejection accepts a reason and command identity, not verified facts or replacement evidence");
    if (request.confirmed !== true)
      store.fail("ERR_WASTE_REVIEW_CONFIRMATION_REQUIRED", "Review and explicitly confirm the rejection");
    if (typeof payload.reason !== "string" || !payload.reason.trim() || payload.reason.length > 1000)
      store.fail("ERR_WASTE_REVIEW_REASON_REQUIRED", "A public rejection reason of at most 1000 characters is required");
    if (!Number.isSafeInteger(request.expectedRevision) || request.expectedRevision < 0)
      store.fail("ERR_WASTE_REVISION_CONFLICT", "Reload and review the current evidence");
    const key = request.idempotencyKey;
    if (typeof key !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(key))
      store.fail("ERR_WASTE_IDEMPOTENCY_REQUIRED", "A rejection command reference is required");
    if ((payload.expectedRevision !== undefined && payload.expectedRevision !== request.expectedRevision) ||
      (payload.idempotencyKey !== undefined && payload.idempotencyKey !== key) ||
      (payload.confirmed !== undefined && payload.confirmed !== true))
      store.fail("ERR_WASTE_INPUT_INVALID", "Conflicting command identity");
    let current = await store.one("wasteSubmission", request, request.code);
    if (!current) store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Submission was not found");
    tenantCheck(current);
    if (current.code !== request.code) conflict();
    await access.assertRecord(request, "waste.review.approve", current);
    SERVICE.DefaultWasteReviewWorkspaceService.assertAssignment(request, current, true);
    const reason = payload.reason.trim(), evidenceDigest = this.evidenceDigest(current);
    const digest = this.digest(["EVIDENCE_ONLY", tenant, current.code, request.expectedRevision,
      request.authData.loginId, reason, evidenceDigest]);
    const metadata = current.metadata || {};
    const replay = metadata.reviewBasis === "EVIDENCE_ONLY" && metadata.reviewDecision === "REJECTED" &&
      metadata.reviewKey === key && metadata.reviewDigest === digest &&
      metadata.reviewPrincipal?.code === request.authData.loginId;
    const auditCode = current.code + "_REVIEW";
    if (!replay) {
      if (!this.eligible(current)) conflict();
      store.revision(current, request.expectedRevision);
    } else {
      const open = { ...current, submissionStatus: "UNDER_REVIEW", verificationRef: undefined,
        metadata: { ...metadata, reviewDecision: undefined, reviewBasis: undefined,
          reviewKey: undefined, reviewDigest: undefined, reviewCommand: undefined } };
      if (!["UNDER_REVIEW", "REJECTED"].includes(current.submissionStatus) || !this.eligible(open) ||
        metadata.reviewEvidenceDigest !== evidenceDigest ||
        (current.verificationRef && (current.verificationRef.module !== "wasteVerification" ||
          current.verificationRef.schema !== "wasteVerification" || current.verificationRef.code !== auditCode))) conflict();
    }
    // Bounded owner reads must prove absence even when the submission has no reverse references.
    const assets = await store.list("wasteAsset", request, { sourceSubmissionCode: current.code }, 1);
    tenantCheck(current);
    if (!Array.isArray(assets) || assets.length) conflict();
    const decisions = await store.list("wasteVerification", request, { submissionCode: current.code }, 2);
    tenantCheck(current);
    const matchesAudit = audit => audit && audit.code === auditCode && audit.submissionCode === current.code &&
      audit.active !== false && audit.verificationStatus === "REJECTED" && audit.idempotencyKey === key &&
      audit.metadata?.reviewBasis === "EVIDENCE_ONLY" && audit.metadata.reviewDigest === digest &&
      audit.metadata.evidenceDigest === evidenceDigest && audit.publicReason === reason &&
      audit.verifiedBy?.module === "profile" && audit.verifiedBy?.schema === "employee" &&
      audit.verifiedBy?.code === request.authData.loginId &&
      !Object.keys(audit).some(field => field.startsWith("verified") && !["verifiedBy", "verifiedAt"].includes(field));
    if (!Array.isArray(decisions) || decisions.length > 1 ||
      (decisions.length && (!replay || !matchesAudit(decisions[0])))) conflict();
    decisions.forEach(tenantCheck);
    if (current.submissionStatus === "REJECTED") {
      if (!decisions.length || !current.verificationRef) conflict();
      return { submission: current, decisionBasis: "EVIDENCE_ONLY", replayed: true };
    }
    if (!replay) current = await store.update("wasteSubmission", request, current, {
      submissionStatus: "UNDER_REVIEW",
      metadata: { ...metadata, reviewBasis: "EVIDENCE_ONLY", reviewDecision: "REJECTED", reviewKey: key,
        reviewDigest: digest, reviewEvidenceDigest: evidenceDigest,
        reviewPrincipal: { module: "profile", schema: "employee", code: request.authData.loginId },
        reviewCommand: { reason, expectedRevision: request.expectedRevision },
        evidenceRejectionStartedAt: new Date().toISOString() },
    });
    const audit = await SERVICE.DefaultWasteVerificationOperationService.once("wasteVerification", request, {
      code: auditCode, submissionCode: current.code, verificationStatus: "REJECTED",
      verifiedBy: current.metadata.reviewPrincipal, verifiedAt: current.metadata.evidenceRejectionStartedAt,
      publicReason: reason, idempotencyKey: key, correlationId: request.correlationId, revision: 0,
      metadata: { reviewBasis: "EVIDENCE_ONLY", reviewDigest: digest, evidenceDigest,
        evidenceRef: { module: "media", schema: "media", code: current.metadata.photo.code } },
    });
    tenantCheck(audit);
    if (!matchesAudit(audit)) conflict();
    const completed = await store.update("wasteSubmission", request, current, {
      submissionStatus: "REJECTED",
      verificationRef: { module: "wasteVerification", schema: "wasteVerification", code: audit.code },
      metadata: { ...current.metadata, publicReason: reason, reviewedBy: audit.verifiedBy, reviewedAt: audit.verifiedAt,
        reviewAssignment: { ...current.metadata.reviewAssignment, completedAt: audit.verifiedAt } },
    });
    return { submission: completed, decisionBasis: "EVIDENCE_ONLY" };
  },
};
