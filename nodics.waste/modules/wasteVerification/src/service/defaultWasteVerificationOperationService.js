/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module wasteVerification/service/defaultWasteVerificationOperationService @description Persists staff review evidence, provider impact and approved assets with resumable deterministic records. @layer service @owner wasteVerification @override Later layers may add reviewer policy and settlement orchestration; ledger writes remain outside Waste. */
module.exports = {
  /** Returns the shared generated-repository adapter. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Records only an evidence disposition; never invokes physical verification or asset creation. */
  rejectEvidence: function (request) {
    return SERVICE.DefaultWasteEvidenceRejectionService.reject(request);
  },
  /** Resolves one saved approved asset and its exact verification in the original tenant; never reconstructs identity from current creation policy. Callers must first authorize the submission. */
  approvedAsset: async function (request, submission) {
    const store = this.store(), tenant = request.authData?.tenant;
    const source = structuredClone(submission), ref = source?.verificationRef;
    const conflict = () => store.fail("ERR_WASTE_REVIEW_CONFLICT", "The saved approved asset evidence could not be qualified");
    const checkTenant = (record) => {
      if (typeof tenant !== "string" || !tenant || request.tenant !== tenant ||
        request.authData?.tenant !== tenant || request.code !== source?.code ||
        [request.tenantCode, request.authData?.tenantCode, record?.tenant, record?.tenantCode]
          .some(value => value !== undefined && value !== tenant)) conflict();
    };
    checkTenant(source);
    if (!source || typeof source.code !== "string" || !source.code || source.code !== request.code ||
      source.submissionStatus !== "APPROVED" || source.active === false ||
      ref?.module !== "wasteVerification" || ref.schema !== "wasteVerification" ||
      typeof ref.code !== "string" || !ref.code) conflict();
    const assets = await store.list("wasteAsset", request, { sourceSubmissionCode: source.code }, 2);
    checkTenant(source);
    if (!Array.isArray(assets)) conflict();
    if (!assets.length) store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Approved asset was not found");
    if (assets.length !== 1) conflict();
    const asset = assets[0];
    checkTenant(asset);
    if (!asset || typeof asset.code !== "string" || !asset.code || asset.active === false ||
      asset.sourceSubmissionCode !== source.code ||
      asset.verificationRef?.module !== ref.module || asset.verificationRef?.schema !== ref.schema ||
      asset.verificationRef?.code !== ref.code) conflict();
    const decisions = await store.list("wasteVerification", request, { code: ref.code }, 2);
    checkTenant(source);
    if (!Array.isArray(decisions) || decisions.length !== 1) conflict();
    const decision = decisions[0];
    checkTenant(decision);
    if (!decision || decision.code !== ref.code || decision.active === false ||
      decision.submissionCode !== source.code || decision.verificationStatus !== "APPROVED") conflict();
    return asset;
  },
  /** Enforces the shared staff action permission before domain operations. */
  authorize: function (request, permission = "waste.review.queue.read") {
    return SERVICE.DefaultWasteOperationalAccessService.authorize(
      request,
      permission,
    );
  },
  /** Blocks non-human processing of held or unassessed evidence and requires an explicit human acknowledgement for flagged approval. */
  assertEvidenceReview: function (request, record, decision) {
    const evidence = SERVICE.DefaultWasteItemDescriptorService.evidenceReview(record);
    if (evidence.manualApprovalRequired && (request.authData?.principalType !== 'human' || !request.authData?.loginId))
      this.store().fail('ERR_WASTE_MANUAL_APPROVAL_REQUIRED', 'This image evidence requires approval by an authorized human reviewer');
    if (decision === 'APPROVED' && evidence.acknowledgementRequired && request.payload?.evidenceReviewed !== true)
      this.store().fail('ERR_WASTE_EVIDENCE_ACKNOWLEDGEMENT_REQUIRED', 'Inspect the flagged evidence and acknowledge verification of the physical item before approval');
    return evidence;
  },
  /** Reads only submissions visible to the employee's current Profile scopes. */
  queue: async function (request) {
    await this.authorize(request);
    const records = await this.store().list(
      "wasteSubmission",
      request,
      { submissionStatus: { $in: ["SUBMITTED", "UNDER_REVIEW"] } },
      500,
    );
    return (
      await SERVICE.DefaultWasteOperationalAccessService.visible(
        request,
        "waste.review.queue.read",
        records,
      )
    ).slice(0, 100);
  },
  /** Records independently verified facts without creating an asset or earning rewards. */
  verify: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService;
    await access.authorize(request, "waste.verification.record");
    const store = this.store();
    let current = await store.one("wasteSubmission", request, request.code);
    if (!current)
      store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Submission was not found");
    await access.assertRecord(request, "waste.verification.record", current);
    this.assertEvidenceReview(request, current);
    SERVICE.DefaultWasteReviewWorkspaceService.assertAssignment(request, current);
    if (request.confirmed !== true)
      store.fail(
        "ERR_WASTE_REVIEW_CONFIRMATION_REQUIRED",
        "Review and confirm the verified facts",
      );
    const pending = current.metadata?.verificationPending;
    if (request.payload?.resumeVerification === true) {
      if (!pending || Object.keys(request.payload).some(key =>
        !["resumeVerification", "expectedRevision", "confirmed", "idempotencyKey"].includes(key)))
        store.fail("ERR_WASTE_REVIEW_CONFLICT", "Only the recorded verification may be resumed");
      store.revision(current, request.expectedRevision);
      return this.completeVerification(request, current);
    }
    const key = request.idempotencyKey;
    if (typeof key !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(key))
      store.fail(
        "ERR_WASTE_IDEMPOTENCY_REQUIRED",
        "A verification command reference is required",
      );
    const verificationDigest = this.commandDigest(request);
    if (pending) {
      if (pending.idempotencyKey !== key || pending.digest !== verificationDigest)
        store.fail("ERR_WASTE_REVIEW_CONFLICT", "Resume the recorded verification before changing facts");
      return this.completeVerification(request, current);
    }
    if (current.metadata && current.metadata.verificationKey === key) {
      if (
        current.metadata.verificationDigest &&
        current.metadata.verificationDigest !== verificationDigest
      )
        store.fail(
          "ERR_WASTE_REVIEW_CONFLICT",
          "This verification reference was used for different facts",
        );
      return { submission: current };
    }
    SERVICE.DefaultWasteReviewWorkspaceService.assertAssignment(request, current, true);
    store.revision(current, request.expectedRevision);
    if (
      !["SUBMITTED", "UNDER_REVIEW"].includes(current.submissionStatus) ||
      (current.metadata && current.metadata.reviewDecision)
    )
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "This submission is not open for verification",
      );
    const facts = Object.assign(
      {},
      current.confirmedFacts || current.submittedFacts,
      SERVICE.DefaultWasteSubmissionOperationService.facts(
        (request.payload && request.payload.verifiedFacts) || {},
      ),
    );
    if (facts.preferredCollectionPointCode !== access.pointCode(current))
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "Verification cannot change the assigned collection centre",
      );
    await this.validateCorrections(request, current, facts);
    if (request.payload?.verifiedFacts?.weight !== undefined)
      facts.weightProvenance = {
        basis: "OPERATOR_MEASURED",
        unit: "KG",
        operator: request.authData.loginId,
      };
    const verifiedEstimate = await this.assessVerifiedFacts(
      request,
      current,
      facts,
      key,
    );
    // Claim the submission before publishing a verification audit. Calculation above is read-only.
    current = await store.update("wasteSubmission", request, current, {
      submissionStatus: "UNDER_REVIEW",
      metadata: { ...current.metadata, verificationPending: {
        auditCode: current.code + "_VERIFIED_" + current.revision,
        idempotencyKey: key, digest: verificationDigest, expectedRevision: request.expectedRevision,
        facts, estimate: verifiedEstimate, principalCode: request.authData.loginId,
        recordedAt: new Date().toISOString(),
      } },
    });
    return this.completeVerification(request, current);
  },
  /** Completes only the assigned original verifier's frozen checkpoint; audit retry never recalculates or changes facts. */
  completeVerification: async function (request, current) {
    const store = this.store(), pending = current.metadata?.verificationPending;
    const access = SERVICE.DefaultWasteOperationalAccessService;
    await access.authorize(request, "waste.verification.record");
    await access.assertRecord(request, "waste.verification.record", current);
    SERVICE.DefaultWasteReviewWorkspaceService.assertAssignment(request, current, true);
    if (request.confirmed !== true || !pending || current.submissionStatus !== "UNDER_REVIEW" || current.metadata.reviewDecision ||
      pending.principalCode !== request.authData.loginId ||
      pending.auditCode !== current.code + "_VERIFIED_" + pending.expectedRevision)
      store.fail("ERR_WASTE_REVIEW_CONFLICT", "The original verifier must resume the recorded verification");
    const verification = await this.once("wasteVerification", request, {
      code: pending.auditCode,
      submissionCode: current.code,
      verifiedBy: {
        module: "profile",
        schema: "employee",
        code: pending.principalCode,
      },
      verificationStatus: "VERIFIED",
      verifiedFacts: pending.facts,
      verifiedAt: pending.recordedAt,
      revision: 0,
      idempotencyKey: pending.idempotencyKey,
      correlationId: request.correlationId,
    });
    if (verification.idempotencyKey !== pending.idempotencyKey ||
      verification.submissionCode !== current.code || verification.verificationStatus !== "VERIFIED" ||
      verification.verifiedBy?.code !== pending.principalCode ||
      JSON.stringify(verification.verifiedFacts) !== JSON.stringify(pending.facts))
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "A different verification already exists for this revision",
      );
    current = await store.update("wasteSubmission", request, current, {
      submissionStatus: "UNDER_REVIEW",
      metadata: Object.assign({}, current.metadata, {
        verificationPending: null,
        verificationKey: pending.idempotencyKey,
        verificationDigest: pending.digest,
        verifiedBy: verification.verifiedBy,
        verifiedFacts: verification.verifiedFacts,
        verifiedEstimate: pending.estimate,
        verifiedAt: verification.verifiedAt,
        reviewAssignment: {
          type: "QUEUE",
          queueCode: access.settings().defaultReviewQueue,
          assignedAt: new Date().toISOString(),
          completedBy: request.authData.loginId,
        },
        preApprovalVerificationRef: {
          module: "wasteVerification",
          schema: "wasteVerification",
          code: verification.code,
        },
      }),
    });
    return { submission: current };
  },
  /** Returns read-only review evidence for scoped audit; no mutation permission is implied. */
  audit: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService;
    await access.authorize(request, "waste.audit.read");
    const records = await this.store().list(
      "wasteSubmission",
      request,
      { submissionStatus: { $in: ["UNDER_REVIEW", "APPROVED", "REJECTED"] } },
      500,
    );
    const visible = await access.visible(request, "waste.audit.read", records);
    return visible.slice(0, 100).map((record) => ({
      code: record.code,
      status: record.submissionStatus,
      revision: record.revision,
      collectionPointCode: access.pointCode(record),
      verificationRef: record.verificationRef,
      verifiedBy: record.metadata && record.metadata.verifiedBy,
      verifiedAt: record.metadata && record.metadata.verifiedAt,
      approvedBy: record.metadata && record.metadata.approvedBy,
      reviewedAt: record.metadata && record.metadata.reviewedAt,
      publicReason: record.metadata && record.metadata.publicReason,
      reviewBasis: record.metadata && record.metadata.reviewBasis,
      reviewedBy: record.metadata && record.metadata.reviewedBy,
      correlationId: record.correlationId,
    }));
  },
  /** Refreshes advisory impact from current verified inputs; an outage never preserves a stale estimate. */
  assessVerifiedFacts: async function (request, current, facts, key) {
    try {
      const item = await this.store().one(
        "wasteItemType",
        request,
        facts.itemTypeCode,
      );
      const profile =
        item &&
        (await this.store().one(
          "wasteImpactProfile",
          request,
          item.impactProfileCode,
        ));
      if (!profile || profile.status !== "ACTIVE")
        return {
          calculationStatus: "PENDING",
          reason: "An active impact profile is required",
        };
      return await SERVICE.DefaultWasteImpactCalculationService.calculate(
        {
          sourceRef: {
            module: "wasteSubmission",
            schema: "wasteSubmission",
            code: current.code,
          },
          profile,
          facts,
          evidenceRefs: current.evidenceRefs,
          idempotencyKey: key + ":verified-assessment",
        },
        request,
      );
    } catch (error) {
      return {
        calculationStatus: "PENDING",
        reason:
          "Impact refresh is unavailable; approval must recalculate through the configured provider",
      };
    }
  },
  /** Computes a stable command fingerprint without admitting identity or lifecycle fields from the body. */
  commandDigest: function (request) {
    const payload = request.payload || {};
    const facts = SERVICE.DefaultWasteSubmissionOperationService.facts(
      payload.verifiedFacts || {},
    );
    return require("node:crypto")
      .createHash("sha256")
      .update(
        JSON.stringify([
          request.code,
          request.expectedRevision,
          payload.decision || "VERIFIED",
          String(payload.reason || "").trim(),
          Object.entries(facts).sort(([a], [b]) => a.localeCompare(b)),
          ...(payload.evidenceReviewed === true ? ['EVIDENCE_REVIEWED'] : []),
        ]),
      )
      .digest("hex");
  },
  /** Revalidates changed taxonomy pairs against the owning records; names/descriptions and numeric values retain the shared fact validator. */
  validateCorrections: async function (request, current, facts) {
    const corrections = request.payload && request.payload.verifiedFacts || {};
    const materials = await this.store().list('wasteMaterialType', request, { status: 'ACTIVE' }, 500);
    Object.assign(facts, SERVICE.DefaultWasteItemDescriptorService.normalize(corrections, materials, true));
    if (corrections.sizeClass !== undefined) facts.sizeProvenance = { basis: 'OPERATOR_VERIFIED' };
    if (corrections.conditionGrade !== undefined) facts.conditionProvenance = { basis: 'OPERATOR_VERIFIED' };
    const original =
      (current.metadata && current.metadata.verifiedFacts) ||
      current.confirmedFacts ||
      current.submittedFacts ||
      {};
    if (
      facts.itemTypeCode !== original.itemTypeCode ||
      facts.categoryCode !== original.categoryCode
    ) {
      const item = await this.store().one(
        "wasteItemType",
        request,
        facts.itemTypeCode,
      );
      const category = await this.store().one(
        "wasteCategory",
        request,
        facts.categoryCode,
      );
      if (
        !item ||
        !category ||
        item.status !== "ACTIVE" ||
        category.status !== "ACTIVE" ||
        item.categoryCode !== category.code
      )
        this.store().fail(
          "ERR_WASTE_TAXONOMY_INVALID",
          "Choose a supported item and matching category",
        );
    }
  },
  /** Saves immutable evidence once; repeat recovery returns the same record. */
  once: async function (schema, request, model) {
    return (
      (await this.store().one(schema, request, model.code)) ||
      (await this.store().create(schema, request, model))
    );
  },
  /** Resumes a persisted decision command after explicit current-revision approval; recorded facts, decision, key and original actor cannot be replaced. */
  recoverReview: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService,
      store = this.store();
    await access.authorize(request, "waste.review.approve");
    const current = await store.one("wasteSubmission", request, request.code);
    if (!current)
      store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Submission was not found");
    await access.assertRecord(request, "waste.review.approve", current);
    store.revision(current, request.expectedRevision);
    const metadata = current.metadata || {};
    if (
      request.confirmed !== true ||
      current.submissionStatus !== "UNDER_REVIEW" ||
      !metadata.reviewCommand ||
      !metadata.reviewKey
    )
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "There is no recorded decision to resume",
      );
    const operation = metadata.reviewBasis === "EVIDENCE_ONLY" ? "rejectEvidence" : "review";
    return this[operation](
      Object.assign({}, request, {
        recoveringReview: true,
        payload: metadata.reviewCommand,
        expectedRevision: metadata.reviewCommand.expectedRevision,
        idempotencyKey: metadata.reviewKey,
      }),
    );
  },
  /** Reviews a confirmed submission and resumes incomplete approval without duplicate assets. */
  review: async function (request) {
    await this.authorize(request, "waste.review.approve");
    const store = this.store(),
      decision = request.payload && request.payload.decision;
    if (
      !["APPROVED", "REJECTED"].includes(decision) ||
      request.confirmed !== true
    )
      store.fail(
        "ERR_WASTE_REVIEW_CONFIRMATION_REQUIRED",
        "Review and explicitly confirm the decision",
      );
    let current = await store.one("wasteSubmission", request, request.code);
    if (!current)
      store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Submission was not found");
    const access = SERVICE.DefaultWasteOperationalAccessService;
    await access.assertRecord(request, "waste.review.approve", current);
    if (current.metadata?.verificationPending)
      store.fail("ERR_WASTE_REVIEW_CONFLICT", "Complete the recorded verification before a final decision");
    if (current.metadata?.reviewBasis === "EVIDENCE_ONLY")
      store.fail("ERR_WASTE_REVIEW_CONFLICT", "Resume evidence-only rejection through its original operation");
    const evidenceReview = this.assertEvidenceReview(request, current, decision);
    if (request.recoveringReview !== true)
      SERVICE.DefaultWasteReviewWorkspaceService.assertAssignment(
        request,
        current,
        ["SUBMITTED", "UNDER_REVIEW"].includes(current.submissionStatus),
      );
    const policy = access.settings();
    const verified =
      current.metadata && current.metadata.preApprovalVerificationRef;
    if (
      policy.requireVerification &&
      !verified &&
      current.submissionStatus !== decision
    )
      store.fail(
        "ERR_WASTE_VERIFICATION_REQUIRED",
        "A verifier must confirm this submission before a final decision",
      );
    if (
      policy.requireDifferentApprover &&
      current.metadata &&
      current.metadata.verifiedBy &&
      current.metadata.verifiedBy.code === request.authData.loginId
    )
      store.fail(
        "ERR_WASTE_SEPARATE_APPROVER_REQUIRED",
        "A different employee must make the final decision",
      );
    if (
      decision === "REJECTED" &&
      (!request.payload.reason || !String(request.payload.reason).trim())
    )
      store.fail(
        "ERR_WASTE_REVIEW_REASON_REQUIRED",
        "A rejection reason is required",
      );
    if (
      policy.requireVerification &&
      Object.keys(request.payload.verifiedFacts || {}).some(
        (key) =>
          JSON.stringify(request.payload.verifiedFacts[key]) !==
          JSON.stringify((current.metadata.verifiedFacts || {})[key]),
      )
    )
      store.fail(
        "ERR_WASTE_VERIFIED_FACTS_IMMUTABLE",
        "Final approval must use the independently verified facts",
      );
    if (
      request.payload.reason !== undefined &&
      (typeof request.payload.reason !== "string" ||
        request.payload.reason.length > 1000)
    )
      store.fail(
        "ERR_WASTE_INPUT_INVALID",
        "Review feedback must be at most 1000 characters",
      );
    const verificationCode = current.code + "_REVIEW";
    const digest = this.commandDigest(request);
    const key = request.idempotencyKey;
    if (typeof key !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(key))
      store.fail(
        "ERR_WASTE_IDEMPOTENCY_REQUIRED",
        "A review command reference is required",
      );
    const metadata = current.metadata || {};
    const replay =
      metadata.reviewKey === key && metadata.reviewDigest === digest;
    if (current.submissionStatus === decision) {
      if (!replay)
        store.fail(
          "ERR_WASTE_REVIEW_CONFLICT",
          "This decision is already recorded. Reload its outcome.",
        );
      return {
        replayed: true,
        submission: current,
        asset: decision === "APPROVED" ? await this.approvedAsset(request, current) : undefined,
      };
    }
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(current.submissionStatus))
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "This submission is not awaiting review",
      );
    if (metadata.reviewDecision && !replay)
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "A different review command is already in progress",
      );
    if (!replay) {
      await this.validateCorrections(
        request,
        current,
        Object.assign(
          {},
          metadata.verifiedFacts || current.confirmedFacts || {},
          SERVICE.DefaultWasteSubmissionOperationService.facts(
            request.payload.verifiedFacts || {},
          ),
        ),
      );
      store.revision(current, request.expectedRevision);
      current = await store.update("wasteSubmission", request, current, {
        submissionStatus: "UNDER_REVIEW",
        metadata: {
          ...metadata,
          ...(decision === 'APPROVED' && evidenceReview.acknowledgementRequired ? { manualEvidenceApproval: {
            principalRef: { module: 'profile', schema: 'employee', code: request.authData.loginId },
            reviewedAt: new Date().toISOString(), evidenceRef: { module: 'media', schema: 'media', code: metadata.photo?.code },
            flaggedEvidenceRef: metadata.evidenceReview?.flaggedEvidenceRef, reasonCodes: evidenceReview.reasonCodes, idempotencyKey: key,
          } } : {}),
          reviewDecision: decision,
          reviewKey: key,
          reviewDigest: digest,
          reviewCommand: {
            expectedRevision: request.expectedRevision,
            decision,
            ...(request.payload.evidenceReviewed === true ? { evidenceReviewed: true } : {}),
            reason: String(request.payload.reason || "").trim(),
            verifiedFacts: SERVICE.DefaultWasteSubmissionOperationService.facts(
              request.payload.verifiedFacts || {},
            ),
          },
          reviewPrincipal: {
            module: "profile",
            schema: "employee",
            code: request.authData.loginId,
          },
        },
      });
    }
    const correction = SERVICE.DefaultWasteSubmissionOperationService.facts(
      request.payload.verifiedFacts || {},
    );
    const facts = Object.assign(
      {},
      (current.metadata && current.metadata.verifiedFacts) ||
        current.confirmedFacts ||
        {},
      correction,
    );
    if (
      decision === "REJECTED" &&
      (!request.payload.reason || !String(request.payload.reason).trim())
    )
      store.fail(
        "ERR_WASTE_REVIEW_REASON_REQUIRED",
        "A rejection reason is required",
      );
    await this.validateCorrections(request, current, facts);
    const verification = await this.once("wasteVerification", request, {
      code: verificationCode,
      submissionCode: current.code,
      verifiedBy: current.metadata.reviewPrincipal,
      metadata: { manualEvidenceApproval: current.metadata.manualEvidenceApproval || null },
      verificationStatus: decision,
      verifiedFacts: facts,
      verifiedCategoryCode: facts.categoryCode,
      verifiedItemTypeCode: facts.itemTypeCode,
      verifiedQuantity: facts.quantity,
      verifiedWeight: facts.weight,
      publicReason: String(request.payload.reason || "").trim(),
      verifiedAt: new Date(),
      revision: 0,
      correlationId: request.correlationId,
      idempotencyKey: verificationCode,
    });
    if (verification.verificationStatus !== decision)
      store.fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "A different decision already owns this review",
      );
    const verificationRef = {
      module: "wasteVerification",
      schema: "wasteVerification",
      code: verification.code,
    };
    let asset, impact;
    if (decision === "APPROVED") {
      const item = await store.one(
        "wasteItemType",
        request,
        facts.itemTypeCode,
      );
      const profile =
        item &&
        (await store.one(
          "wasteImpactProfile",
          request,
          item.impactProfileCode,
        ));
      if (!profile || profile.status !== "ACTIVE")
        store.fail(
          "ERR_WASTE_IMPACT_PROFILE_INVALID",
          "An active impact profile is required",
        );
      const impactCode = current.code + "_IMPACT";
      impact = await store.one("wasteImpactResult", request, impactCode);
      if (!impact) {
        const calculated =
          await SERVICE.DefaultWasteImpactCalculationService.calculate(
            {
              sourceRef: {
                module: "wasteSubmission",
                schema: "wasteSubmission",
                code: current.code,
              },
              profile: profile,
              facts: facts,
              evidenceRefs: current.evidenceRefs,
              idempotencyKey: impactCode,
            },
            request,
          );
        impact = await this.once(
          "wasteImpactResult",
          request,
          Object.assign({}, calculated, { code: impactCode }),
        );
      }
      const policy = await store.one(
        "wasteAssetCreationPolicy",
        request,
        request.assetCreationPolicyCode,
      );
      if (!policy || policy.status !== "ACTIVE")
        store.fail(
          "ERR_WASTE_ASSET_POLICY_REQUIRED",
          "An active asset policy is required",
        );
      const created =
        SERVICE.DefaultWasteAssetCreationService.createFromApprovedSubmission({
          submission: Object.assign({}, current, {
            submissionStatus: "APPROVED",
          }),
          verification: verification,
          policy: policy,
          assetTypeCode: facts.itemTypeCode,
          verificationRef: verificationRef,
          impactRef: {
            module: "wasteImpact",
            schema: "wasteImpactResult",
            code: impact.code,
          },
          idempotencyKey: current.code + "_ASSET",
          principalRef: verification.verifiedBy,
        });
      asset = await this.once(
        "wasteAsset",
        request,
        Object.assign({}, created.asset, {
          metadata: {
            facts: facts,
            approvedEstimate: impact,
            publicReason: verification.publicReason,
            reviewedAt: new Date().toISOString(),
            suggestion: current.metadata && current.metadata.suggestion,
            photo: current.metadata && current.metadata.photo,
            evidenceReview: current.metadata && current.metadata.evidenceReview,
            manualEvidenceApproval: current.metadata && current.metadata.manualEvidenceApproval,
            settlementStatus: "PENDING",
          },
          sourceContext: Object.assign(
            {},
            created.asset.sourceContext,
            current.sourceContext,
          ),
        }),
      );
      await this.once(
        "wasteAssetOwnershipEvent",
        request,
        created.ownershipEvent,
      );
    }
    const completed = await store.update("wasteSubmission", request, current, {
      submissionStatus: decision,
      verificationRef: verificationRef,
      impactRef: impact
        ? {
            module: "wasteImpact",
            schema: "wasteImpactResult",
            code: impact.code,
          }
        : undefined,
      metadata: Object.assign({}, current.metadata, {
        reviewedAt: new Date().toISOString(),
        reviewedFacts: facts,
        approvedEstimate: impact || current.metadata.verifiedEstimate || null,
        approvedBy: verification.verifiedBy,
        recoveredBy: request.recoveringReview
          ? {
              module: "profile",
              schema: "employee",
              code: request.authData.loginId,
            }
          : undefined,
        publicReason: verification.publicReason,
        reviewAssignment: {
          ...(current.metadata.reviewAssignment || {}),
          completedAt: new Date().toISOString(),
        },
      }),
    });
    return { submission: completed, asset: asset, impact: impact };
  },
};
