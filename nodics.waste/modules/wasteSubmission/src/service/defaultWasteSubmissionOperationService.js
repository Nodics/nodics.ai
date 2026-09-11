/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const crypto = require("node:crypto");

/** @module wasteSubmission/service/defaultWasteSubmissionOperationService @description Persists customer-scoped drafts and immutable confirmed evidence through Waste-owned lifecycle and generated repositories. @layer service @owner wasteSubmission @override Later modules may refine facts and policy while retaining authorization, confirmation and persistence checks. */
module.exports = {
  /** Resolves the effective domain persistence helper. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Identifies unfinished submissions that can still be prepared. */
  editable: function (record) {
    return ["DRAFT", "MEDIA_STAGED", "METADATA_SUGGESTED", "AWAITING_SUBMITTER_CONFIRMATION"].includes(record.submissionStatus);
  },
  /** Creates a deterministic command identity scoped to the authenticated owner. */
  commandCode: function (owner, key) {
    if (typeof key !== "string" || key.length < 8 || key.length > 200)
      this.store().fail(
        "ERR_WASTE_IDEMPOTENCY_REQUIRED",
        "A valid command reference is required",
      );
    return (
      "WST_" +
      crypto
        .createHash("sha256")
        .update(owner.code + ":" + key)
        .digest("hex")
        .slice(0, 24)
        .toUpperCase()
    );
  },
  /** Copies customer text only. Analysis and business classification cannot be overwritten through customer commands. */
  customerFacts: function (payload = {}) {
    const transport = ['expectedRevision', 'confirmed', 'idempotencyKey'];
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => !['name', 'description', ...transport].includes(key)))
      this.store().fail('ERR_WASTE_CUSTOMER_FIELD_READ_ONLY', 'Only the item name and description can be edited. Other properties are reviewed by the collection team.');
    return this.facts({ name: payload.name, description: payload.description });
  },
  /** Copies authorized domain facts; callers must enforce their customer or employee field policy first. */
  facts: function (payload) {
    const source = payload || {},
      result = {};
    for (const field of [
      "name",
      "description",
      "categoryCode",
      "itemTypeCode",
      "conditionGrade",
      "brand",
      "model",
      "preferredCollectionPointCode",
    ]) {
      if (source[field] !== undefined) {
        if (
          typeof source[field] !== "string" ||
          source[field].length > (field === "description" ? 2000 : 180)
        )
          this.store().fail(
            "ERR_WASTE_INPUT_INVALID",
            "An item detail is invalid",
          );
        result[field] = source[field].trim();
      }
    }
    if (source.sizeClass !== undefined) {
      if (!["SMALL", "MEDIUM", "LARGE", "BULKY", "HEAVY", "UNKNOWN"].includes(source.sizeClass))
        this.store().fail(
          "ERR_WASTE_INPUT_INVALID",
          "Choose a supported handling class",
        );
      result.sizeClass = source.sizeClass;
    }
    if (source.quantity !== undefined) {
      if (
        !Number.isInteger(source.quantity) ||
        source.quantity < 1 ||
        source.quantity > 100
      )
        this.store().fail(
          "ERR_WASTE_INPUT_INVALID",
          "Quantity must be between 1 and 100",
        );
      result.quantity = source.quantity;
    }
    if (source.weight !== undefined) {
      if (
        !["number", "string"].includes(typeof source.weight) ||
        !/^(?:\d+\.?\d*|\.\d+)$/.test(String(source.weight)) ||
        Number(source.weight) <= 0 ||
        Number(source.weight) > 10000
      )
        this.store().fail(
          "ERR_WASTE_INPUT_INVALID",
          "Enter a valid weight in kilograms",
        );
      result.weight = String(source.weight);
      result.weightProvenance = { basis: "CUSTOMER_DECLARED", unit: "KG" };
    }
    for (const key of ['materials', 'weightEstimate', 'dimensionsEstimate', 'environment'])
      if (source[key] !== undefined) result[key] = source[key];
    return result;
  },
  /** Removes properties owned by a previous photo analysis while retaining customer text, location and later-layer fields. */
  clearAnalysisFacts: function (facts = {}) {
    const result = { ...facts };
    for (const key of ['categoryCode', 'itemTypeCode', 'conditionGrade', 'conditionProvenance', 'brand', 'model', 'quantity', 'sizeClass', 'sizeProvenance', 'weight', 'weightProvenance', 'materials', 'weightEstimate', 'dimensionsEstimate', 'environment']) delete result[key];
    return result;
  },
  /** Applies a stored analysis proposal without accepting provider facts from the caller. */
  applyAnalysis: async function (request) {
    const current = await this.read(request);
    this.store().revision(current, request.expectedRevision);
    const suggestion = current.metadata && current.metadata.suggestion;
    if (current.submissionStatus !== 'METADATA_SUGGESTED' || !suggestion || !suggestion.facts)
      this.store().fail('ERR_WASTE_RECOGNITION_INVALID', 'Analyze the current photo before preparing the item');
    return this.store().update('wasteSubmission', request, current, {
      submittedFacts: { ...this.clearAnalysisFacts(current.submittedFacts), ...this.facts(suggestion.facts) },
      metadata: { ...current.metadata, estimate: null, confirmationRevision: null },
    });
  },
  /** Reads a customer-owned draft/submission. */
  read: async function (request) {
    const owner = this.store().customer(request);
    return this.store().owned(
      await this.store().one("wasteSubmission", request, request.code),
      owner,
    );
  },
  /** Removes only an empty owner-authorized legacy draft, with revision and emptiness enforced again by the delete query. */
  discardEmptyDraft: async function (request) {
    const store = this.store(), current = await this.read(request);
    store.revision(current, request.expectedRevision);
    if (current.submissionStatus !== "DRAFT" || current.evidenceRefs?.length || current.metadataSuggestionRefs?.length || current.metadata?.photo || current.metadata?.suggestion || current.submittedFacts?.name || current.submittedFacts?.description)
      store.fail("ERR_WASTE_SUBMISSION_IMMUTABLE", "Only an empty draft without photos or item details can be discarded here");
    for (const schema of ["wasteEvidence", "wasteMetadataSuggestion"]) {
      const query = schema === "wasteEvidence" ? { "metadata.submissionCode": current.code } : { submissionCode: current.code };
      if ((await store.list(schema, request, query, 1)).length) store.fail("ERR_WASTE_SUBMISSION_IMMUTABLE", "This draft has saved evidence and must be retained");
    }
    await store.repository("wasteSubmission").remove({ ...store.context(request),
      query: { code: current.code, revision: current.revision, submissionStatus: "DRAFT", "metadata.photo": null, "metadata.suggestion": null,
        "submittedFacts.name": { $in: [null, ""] }, "submittedFacts.description": { $in: [null, ""] },
        "evidenceRefs.0": { $exists: false }, "metadataSuggestionRefs.0": { $exists: false },
        "submitterRef.module": current.submitterRef.module, "submitterRef.schema": current.submitterRef.schema, "submitterRef.code": current.submitterRef.code },
      options: { recursive: false },
    });
    if (await store.one("wasteSubmission", request, current.code)) store.fail("ERR_WASTE_REVISION_CONFLICT", "The draft changed before it could be discarded");
    return { code: current.code, discarded: true };
  },
  /** Creates a draft with idempotent identity; initial values remain editable. */
  createDraft: async function (request) {
    const owner = this.store().customer(request),
      code = this.commandCode(owner, request.idempotencyKey);
    const existing = await this.store().one("wasteSubmission", request, code);
    if (existing) return this.store().owned(existing, owner);
    return this.store().create("wasteSubmission", request, {
      code: code,
      submitterRef: owner,
      submissionChannel: "CUSTOMER_APP",
      submissionStatus: "DRAFT",
      submittedFacts: this.customerFacts(request.payload),
      evidenceRefs: [],
      revision: 0,
      sourceContext: { applicationCode: request.applicationCode },
      correlationId: request.correlationId,
      idempotencyKey: request.idempotencyKey,
      metadata: { draftCreatedAt: new Date().toISOString() },
    });
  },
  /** Commits a fully analyzed preparation supplied by the trusted orchestration layer; HTTP fields cannot supply analysis. */
  createPrepared: async function (request) {
    const store = this.store(), owner = store.customer(request);
    const code = request.code || this.commandCode(owner, request.idempotencyKey);
    const media = request.mediaDescriptor, analysis = request.preparedAnalysis;
    if (!media?.code || media.ownerReference !== owner.code || !analysis?.proposal?.itemTypeCode || analysis.recognition?.assessment !== "SUPPORTED")
      store.fail("ERR_WASTE_EVIDENCE_REQUIRED", "A photo and successful analysis are required before saving");
    const existing = await store.one("wasteSubmission", request, code);
    if (existing) {
      store.owned(existing, owner);
      if (existing.metadata?.preparationChecksum === request.preparationChecksum && existing.metadata?.preparationKey === request.idempotencyKey) return existing;
      if (!request.code && existing.metadata?.preparationChecksum !== request.preparationChecksum)
        store.fail("ERR_WASTE_INPUT_INVALID", "This preparation reference belongs to a different photo");
      if (!request.code) return existing;
      store.revision(existing, request.expectedRevision);
      if (!this.editable(existing)) store.fail("ERR_WASTE_SUBMISSION_IMMUTABLE", "Submitted evidence cannot be replaced");
    }
    const evidenceRef = { module: "media", schema: "media", code: media.code };
    analysis.recognition.evidenceRef = evidenceRef;
    analysis.evidenceReview.evidenceRef = evidenceRef;
    if (analysis.evidenceReview.manualApprovalRequired && !analysis.evidenceReview.flaggedEvidenceRef?.code) analysis.evidenceReview.flaggedEvidenceRef = evidenceRef;
    const current = { code, revision: existing?.revision || 0, submitterRef: owner, submissionStatus: "METADATA_SUGGESTED",
      submittedFacts: { ...this.facts(analysis.proposal), preferredCollectionPointCode: request.preparationCentreCode },
      metadata: { ...existing?.metadata, draftCreatedAt: existing?.metadata?.draftCreatedAt || new Date().toISOString(), preparationChecksum: request.preparationChecksum, preparationKey: request.idempotencyKey, estimate: null, confirmationRevision: null,
        photo: { code: media.code }, arrival: request.preparationArrival, origin: existing?.metadata?.origin || request.preparationOrigin,
        evidenceReview: analysis.evidenceReview,
        suggestion: { recognition: analysis.recognition, facts: analysis.proposal, confidence: analysis.confidence, provider: analysis.provider, model: analysis.model, advisory: true } } };
    await this.validateFacts(request, current);
    const evidenceCode = code + "_PHOTO_" + crypto.createHash("sha256").update(media.code).digest("hex").slice(0, 12);
    const suggestion = SERVICE.DefaultWasteMetadataAnalysisService.suggestion({ ...request, photo: media }, current, analysis);
    if (!await store.one("wasteEvidence", request, evidenceCode)) await store.create("wasteEvidence", request, {
      code: evidenceCode, ownerRef: owner, evidenceType: "PHOTO", mediaRef: evidenceRef, status: "ACTIVE", publicSafe: false,
      capturedAt: new Date(), revision: 0, metadata: { submissionCode: code, checksum: media.checksum, originalFileName: media.originalFileName, mimeType: media.mimeType, ownerRef: owner },
    });
    if (!await store.one("wasteMetadataSuggestion", request, suggestion.code)) await store.create("wasteMetadataSuggestion", request, suggestion);
    const model = { ...current,
      submissionChannel: "CUSTOMER_APP", sourceContext: { applicationCode: request.applicationCode },
      correlationId: request.correlationId, idempotencyKey: request.idempotencyKey,
      evidenceRefs: [{ module: "wasteSubmission", schema: "wasteEvidence", code: evidenceCode }],
      metadataSuggestionRefs: [{ module: "wasteSubmission", schema: "wasteMetadataSuggestion", code: suggestion.code }],
    };
    return existing ? store.update("wasteSubmission", request, existing, model) : store.create("wasteSubmission", request, model);
  },
  /** Applies a reviewed correction only while the draft is editable. */
  updateDraft: async function (request) {
    const current = await this.read(request);
    this.store().revision(current, request.expectedRevision);
    if (
      ![
        "DRAFT",
        "MEDIA_STAGED",
        "METADATA_SUGGESTED",
        "AWAITING_SUBMITTER_CONFIRMATION",
      ].includes(current.submissionStatus)
    )
      this.store().fail(
        "ERR_WASTE_SUBMISSION_IMMUTABLE",
        "Submitted evidence and facts cannot be changed",
      );
    const facts = Object.assign({}, current.submittedFacts || {}, this.customerFacts(request.payload));
    const policy = (CONFIG.get('wasteSubmission') || {}).metadataSuggestion || {};
    let manualReviewRequired = Boolean(current.metadata?.manualReviewRequired);
    if (!facts.itemTypeCode && facts.name && current.evidenceRefs?.length && policy.manualReviewFallback === true) {
      const fallback = await this.store().one('wasteItemType', request, policy.fallbackItemTypeCode);
      if (!fallback || fallback.status !== 'ACTIVE') this.store().fail('ERR_WASTE_TAXONOMY_INVALID', 'Manual review classification is unavailable');
      Object.assign(facts, { itemTypeCode: fallback.code, categoryCode: fallback.categoryCode, quantity: 1, conditionGrade: 'UNKNOWN', sizeClass: 'UNKNOWN' });
      manualReviewRequired = true;
    }
    return this.store().update("wasteSubmission", request, current, {
      submittedFacts: facts,
      metadata: Object.assign({}, current.metadata, {
        manualReviewRequired,
        estimate: null,
        confirmationRevision: null,
      }),
    });
  },
  /** Validates taxonomy and collection eligibility against current owning records. */
  validateFacts: async function (request, draft) {
    const facts = draft.submittedFacts || {};
    if (
      !facts.name ||
      !facts.itemTypeCode ||
      !facts.categoryCode ||
      !facts.preferredCollectionPointCode ||
      !facts.quantity
    )
      this.store().fail(
        "ERR_WASTE_INPUT_INVALID",
        "Complete item name, category, type, quantity and collection centre",
      );
    const [item, category, centre] = await Promise.all([
      this.store().one("wasteItemType", request, facts.itemTypeCode),
      this.store().one("wasteCategory", request, facts.categoryCode),
      this.store().one(
        "wasteCollectionPoint",
        request,
        facts.preferredCollectionPointCode,
      ),
    ]);
    if (
      !item ||
      !category ||
      item.categoryCode !== category.code ||
      item.status !== "ACTIVE" ||
      category.status !== "ACTIVE"
    )
      this.store().fail(
        "ERR_WASTE_TAXONOMY_INVALID",
        "Select a supported category and matching item",
      );
    const allowedFamilies = ((CONFIG.get('wasteSubmission') || {}).metadataSuggestion || {}).allowedFamilyCodes;
    if (Array.isArray(allowedFamilies) && allowedFamilies.length && !allowedFamilies.includes(category.familyCode))
      this.store().fail('ERR_WASTE_TAXONOMY_INVALID', 'This item is outside the supported waste families for this journey');
    if (
      !centre ||
      centre.operatingStatus !== "ACTIVE" ||
      centre.publicVisibility !== "PUBLIC"
    )
      this.store().fail(
        "ERR_WASTE_COLLECTION_UNAVAILABLE",
        "Choose an available collection centre",
      );
    const accepted = centre.metadata && centre.metadata.acceptedCategoryCodes;
    if (Array.isArray(accepted) && !accepted.includes(category.code))
      this.store().fail(
        "ERR_WASTE_COLLECTION_NOT_ACCEPTED",
        "This centre does not accept the selected item",
      );
    return { facts: facts, item: item, category: category, centre: centre };
  },
  /** Attaches only a Media-validated owner descriptor supplied by the orchestration layer. */
  attachEvidence: async function (request) {
    const current = await this.read(request);
    this.store().revision(current, request.expectedRevision);
    if (
      ![
        "DRAFT",
        "MEDIA_STAGED",
        "METADATA_SUGGESTED",
        "AWAITING_SUBMITTER_CONFIRMATION",
      ].includes(current.submissionStatus)
    )
      this.store().fail(
        "ERR_WASTE_SUBMISSION_IMMUTABLE",
        "Submitted evidence cannot be replaced",
      );
    if (
      !current.submittedFacts ||
      !current.submittedFacts.preferredCollectionPointCode
    )
      this.store().fail(
        "ERR_WASTE_LOCATION_REQUIRED",
        "Choose a collection centre before adding a photo",
      );
    const media = request.mediaDescriptor;
    if (
      !media ||
      !media.code ||
      !/^image\/(jpeg|png|webp)$/.test(media.mimeType || "")
    )
      this.store().fail(
        "ERR_WASTE_EVIDENCE_INVALID",
        "A supported photo is required",
      );
    const evidenceCode =
      current.code +
      "_PHOTO_" +
      crypto.createHash("sha256").update(media.code).digest("hex").slice(0, 12);
    let evidence = await this.store().one(
      "wasteEvidence",
      request,
      evidenceCode,
    );
    if (!evidence)
      evidence = await this.store().create("wasteEvidence", request, {
        code: evidenceCode,
        ownerRef: current.submitterRef,
        evidenceType: "PHOTO",
        mediaRef: { module: "media", schema: "media", code: media.code },
        status: "ACTIVE",
        publicSafe: false,
        capturedAt: new Date(),
        revision: 0,
        metadata: {
          submissionCode: current.code,
          checksum: media.checksum,
          originalFileName: media.originalFileName,
          mimeType: media.mimeType,
          ownerRef: current.submitterRef,
        },
      });
    return this.store().update("wasteSubmission", request, current, {
      submissionStatus: "MEDIA_STAGED",
      submittedFacts: this.clearAnalysisFacts(current.submittedFacts),
      metadataSuggestionRefs: [],
      evidenceRefs: [
        {
          module: "wasteSubmission",
          schema: "wasteEvidence",
          code: evidenceCode,
        },
      ],
      metadata: Object.assign({}, current.metadata, {
        photo: { code: media.code, url: media.accessUrl || media.url },
        suggestion: null,
        estimate: null,
        confirmationRevision: null,
      }),
    });
  },
  /** Calculates advisory impact through the configured provider and persists its provenance. */
  estimate: async function (request) {
    const current = await this.read(request);
    this.store().revision(current, request.expectedRevision);
    if (
      ![
        "MEDIA_STAGED",
        "METADATA_SUGGESTED",
        "AWAITING_SUBMITTER_CONFIRMATION",
      ].includes(current.submissionStatus)
    )
      this.store().fail(
        "ERR_WASTE_EVIDENCE_REQUIRED",
        "Add a photo before requesting an estimate",
      );
    const validated = await this.validateFacts(request, current);
    const profile = await this.store().one(
      "wasteImpactProfile",
      request,
      validated.item.impactProfileCode,
    );
    if (!profile || profile.status !== "ACTIVE")
      this.store().fail(
        "ERR_WASTE_IMPACT_PROFILE_INVALID",
        "An impact profile is not available for this item",
      );
    const assessment =
      await SERVICE.DefaultWasteImpactCalculationService.calculate(
        {
          sourceRef: {
            module: "wasteSubmission",
            schema: "wasteSubmission",
            code: current.code,
          },
          profile: profile,
          facts: validated.facts,
          evidenceRefs: current.evidenceRefs,
          idempotencyKey: request.idempotencyKey,
          correlationId: request.correlationId,
        },
        request,
      );
    return this.store().update("wasteSubmission", request, current, {
      submissionStatus: "AWAITING_SUBMITTER_CONFIRMATION",
      metadata: Object.assign({}, current.metadata, { estimate: assessment }),
    });
  },
  /** Persists an explicitly confirmed draft and returns its authoritative receipt. */
  confirm: async function (request) {
    const current = await this.read(request);
    if (
      current.submissionStatus === "SUBMITTED" &&
      current.metadata &&
      current.metadata.confirmationKey === request.idempotencyKey
    )
      return current;
    this.store().revision(current, request.expectedRevision);
    if (request.confirmed !== true)
      this.store().fail(
        "ERR_WASTE_CONFIRMATION_REQUIRED",
        "Review the details and confirm submission",
      );
    if (
      ![
        "MEDIA_STAGED",
        "METADATA_SUGGESTED",
        "AWAITING_SUBMITTER_CONFIRMATION",
      ].includes(current.submissionStatus) ||
      !current.evidenceRefs ||
      !current.evidenceRefs.length
    )
      this.store().fail(
        "ERR_WASTE_EVIDENCE_REQUIRED",
        "Add a photo before submitting",
      );
    const validated = await this.validateFacts(request, current);
    const next = SERVICE.DefaultWasteSubmissionLifecycleService.confirmFacts(
      current,
      validated.facts,
      request,
    );
    return this.store().update(
      "wasteSubmission",
      request,
      current,
      Object.assign({}, next, {
        categoryCode: validated.facts.categoryCode,
        itemTypeCode: validated.facts.itemTypeCode,
        quantity: validated.facts.quantity,
        weight: validated.facts.weight,
        preferredCollectionPointCode:
          validated.facts.preferredCollectionPointCode,
        metadata: Object.assign({}, current.metadata, {
          confirmationKey: request.idempotencyKey,
          submittedAt: new Date().toISOString(),
          reviewAssignment: {
            type: "QUEUE",
            queueCode: ((CONFIG.get("waste") || {}).operations || {})
              .defaultReviewQueue,
            assignedAt: new Date().toISOString(),
          },
        }),
      }),
    );
  },
};
