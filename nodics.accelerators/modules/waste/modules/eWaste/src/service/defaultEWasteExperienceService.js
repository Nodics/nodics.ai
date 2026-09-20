/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module eWaste/service/defaultEWasteExperienceService @description Composes authenticated customer journeys through Waste, Profile, Media, Loyalty and Commerce authorities. @layer service @owner eWaste @override Project modules supply policy and presentation deltas through CONFIG. */
/** Merchant integration preserves Commerce ownership. */
/** Merchant integration preserves Commerce ownership. */
module.exports = {
  /** Discards only a legacy draft with no saved photo, analysis or item text. */
  discardEmptyDraft: function (request) {
    return SERVICE.DefaultWasteSubmissionOperationService.discardEmptyDraft(request);
  },
  /** Defers durable submission creation until image analysis succeeds. */
  prepareSubmission: async function (request) {
    const draft = await SERVICE.DefaultEWasteSubmissionPreparationService.prepare(request);
    if (!["METADATA_SUGGESTED", "AWAITING_SUBMITTER_CONFIRMATION"].includes(draft.submissionStatus)) return draft;
    return this.estimate({ ...request, code: draft.code, expectedRevision: draft.revision });
  },
  /** Reads a paginated customer collection through the owner-scoped workspace. */
  accountItems: function (request) {
    return SERVICE.DefaultEWasteCustomerWorkspaceService.search(request);
  },
  /** Reads an independently addressable, authorized customer item. */
  accountItem: function (request) {
    return SERVICE.DefaultEWasteCustomerWorkspaceService.detail(request);
  },
  /** Delegates manual purchase review to the Order owner. */
  requestOrderReview: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.requestOrderReview(request);
  },
  /** Delegates manual purchase review to the Order owner. */
  orderReviews: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.orderReviews(request);
  },
  /** Delegates the customer merchant operation to Commerce. */
  claimCoupon: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.claimCoupon(request);
  },
  /** Delegates the customer merchant operation to Commerce. */
  couponMerchants: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.couponMerchants(request);
  },
  /** Returns customer bids from the owning Commerce negotiation service. */
  bids: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.bids(request);
  },
  /** Sends a confirmed published-offer bid to Commerce. */
  placeBid: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.placeBid(request);
  },
  /** Sends the participant's reviewed bid action to Commerce. */
  decideBid: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.decideBid(request);
  },

  /** Returns effective application configuration. */
  settings: function () {
    return CONFIG.get("eWaste") || {};
  },
  /** Returns the Waste persistence boundary. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Unwraps standard transport envelopes without changing record values. */
  unwrap: function (value) {
    for (let n = 0; n < 5 && value && !Array.isArray(value); n++) {
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    return value;
  },
  /** Invokes a named owning API; a trusted explicit bearer preserves caller-owned Profile reads. */
  remote: async function (
    request,
    moduleName,
    connectionName,
    apiName,
    methodName,
    body,
    authorization,
  ) {
    const result = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      targetAuthority: (this.settings().targetAuthorities || {})[
        connectionName
      ],
      moduleName: moduleName,
      connectionName: connectionName,
      apiName: apiName,
      methodName: methodName,
      tenant: request.tenant,
      request: { tenant: request.tenant },
      requestBody: body || {},
      header: {
        ...(authorization ? { Authorization: authorization } : {}),
        "X-Enterprise-Code":
          (request.authData && request.authData.entCode) || request.tenant,
        "Idempotency-Key": request.idempotencyKey,
        "X-Correlation-Id": request.correlationId || request.idempotencyKey,
      },
      timeoutMs: 15000,
      maxAttempts: 1,
    });
    return this.unwrap(result);
  },
  /** Returns public taxonomy, Location-enriched centres and application presentation. */
  experience: async function (request) {
    const context = this.store().context(request);
    const [categories, itemTypes, centres] = await Promise.all([
      this.store().list("wasteCategory", request, { status: "ACTIVE" }, 100),
      this.store().list("wasteItemType", request, { status: "ACTIVE" }, 500),
      SERVICE.DefaultWasteCollectionCentreService.search(
        Object.assign(context, {
          payload: {
            filters: { active: true, operatingStatus: "ACTIVE", publicVisibility: "PUBLIC" },
            pageSize: 100,
          },
        }),
      ),
    ]);
    return {
      categories: categories,
      itemTypes: itemTypes,
      centres: centres.records,
      unavailableSources: centres.unavailableSources,
    };
  },
  /** Resolves the canonical Profile code from the authenticated login, since access tokens may omit business codes. */
  resolveCustomer: async function (request) {
    const auth = request.authData;
    if (!auth || auth.principalType !== "customer" || !auth.loginId)
      return request;
    if (typeof request.authorization !== "string" || !/^Bearer\s+\S+$/i.test(request.authorization))
      this.store().fail("ERR_WASTE_CUSTOMER_REQUIRED", "Customer bearer authorization is required");
    const response = await this.remote(
      request,
      "profile",
      "profile",
      "/customer",
      "POST",
      {
        query: { loginId: auth.loginId },
        options: { recursive: false },
        searchOptions: { pageSize: 1 },
      },
      request.authorization,
    );
    const customer = Array.isArray(response) ? response[0] : response;
    if (!customer || !customer.code || customer.loginId !== auth.loginId)
      this.store().fail(
        "ERR_WASTE_CUSTOMER_REQUIRED",
        "Customer identity is unavailable",
      );
    request.authData = Object.assign({}, auth, { code: customer.code });
    return request;
  },
  /** Returns only the authenticated customer's persisted records. */
  account: async function (request) {
    const owner = this.store().customer(request);
    const [submissions, assets, events] = await Promise.all([
      this.store().list(
        "wasteSubmission",
        request,
        { "submitterRef.code": owner.code },
        100,
      ),
      this.store().list(
        "wasteAsset",
        request,
        { "ownerRef.code": owner.code },
        100,
      ),
      this.store().list(
        "wasteAssetOwnershipEvent",
        request,
        {
          $or: [
            { "fromOwnerRef.code": owner.code },
            { "toOwnerRef.code": owner.code },
          ],
        },
        100,
      ),
    ]);
    return {
      customer: { code: owner.code, loginId: request.authData.loginId },
      submissions: submissions,
      assets: assets,
      events: events,
    };
  },
  /** Finds the authenticated customer's saved application journey without relying on browser storage; filtering precedes bounded pagination. */
  resumeJourney: async function (request) {
    const owner = this.store().customer(request);
    const page = Number(request.query?.page ?? 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000)
      this.store().fail("ERR_WASTE_INPUT_INVALID", "Choose a valid saved-journey page");
    const scope = { active: true, "submitterRef.module": owner.module, "submitterRef.schema": owner.schema, "submitterRef.code": owner.code, "sourceContext.applicationCode": this.settings().applicationCode };
    const drafts = await this.store().page("wasteSubmission", request, Object.assign({}, scope, {
      submissionStatus: { $in: ["DRAFT", "MEDIA_STAGED", "METADATA_SUGGESTED", "AWAITING_SUBMITTER_CONFIRMATION"] }
    }), page, 10, { updated: -1, code: 1 });
    const summary = record => ({ code: record.code, name: record.submittedFacts?.name || "Your recycling item", status: record.submissionStatus, updated: record.updated });
    let latestSubmission = null;
    if (drafts.total === 0) {
      const recent = await this.store().page("wasteSubmission", request, Object.assign({}, scope, {
        submissionStatus: { $in: ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"] }
      }), 1, 1, { updated: -1, code: 1 });
      if (recent.items[0]) latestSubmission = summary(recent.items[0]);
    }
    return { drafts: { items: drafts.items.map(summary), total: drafts.total, page, pageSize: 10 }, latestSubmission };
  },
  /** Returns the owner's real wallet, balances and ledger history. */
  wallet: async function (request) {
    const owner = this.store().customer(request);
    return this.remote(
      request,
      "loyaltyApi",
      "loyalty",
      "/wallet-projections",
      "POST",
      { ownerType: "CUSTOMER", ownerCode: owner.code },
    );
  },
  /** Creates a customer-scoped draft. */
  createDraft: function (request) {
    request.applicationCode = this.settings().applicationCode;
    return SERVICE.DefaultWasteSubmissionOperationService.createDraft(request);
  },
  /** Reads a customer-scoped draft. */
  readDraft: function (request) {
    return SERVICE.DefaultWasteSubmissionOperationService.read(request);
  },
  /** Updates editable facts using the reviewed revision. */
  /** Applies the current persisted recognition proposal; request bodies cannot supply classification. */
  applyAnalysis: function (request) {
    return SERVICE.DefaultWasteSubmissionOperationService.applyAnalysis(request);
  },
  /** Delegates draft edits to Waste-owned authorization, revision and persistence rules. */
  updateDraft: function (request) {
    return SERVICE.DefaultWasteSubmissionOperationService.updateDraft(request);
  },
  /** Verifies the Media owner before linking photo evidence. */
  attachPhoto: async function (request) {
    const owner = this.store().customer(request);
    await SERVICE.DefaultWasteSubmissionOperationService.read(request);
    const code = request.payload.mediaCode;
    if (typeof code !== "string" || code.length > 200)
      this.store().fail(
        "ERR_WASTE_EVIDENCE_INVALID",
        "A photo reference is required",
      );
    const descriptor = await this.remote(
      request,
      "media",
      "wcms",
      "/references/media/validate",
      "POST",
      {
        referenceType: "MEDIA",
        referenceCode: code,
        ownerReference: owner.code,
      },
    );
    if (
      !descriptor ||
      descriptor.ownerType !== "CUSTOMER" ||
      descriptor.ownerReference !== owner.code
    )
      this.store().fail(
        "ERR_WASTE_EVIDENCE_INVALID",
        "The photo does not belong to this customer",
      );
    request.mediaDescriptor = descriptor;
    return SERVICE.DefaultWasteSubmissionOperationService.attachEvidence(
      request,
    );
  },
  /** Reads the original from Media using the customer's own authenticated session, then requests advisory recognition. */
  analyzePhoto: async function (request) {
    const draft =
      await SERVICE.DefaultWasteSubmissionOperationService.read(request);
    const code =
      draft.metadata && draft.metadata.photo && draft.metadata.photo.code;
    if (!code)
      this.store().fail(
        "ERR_WASTE_EVIDENCE_REQUIRED",
        "Add a photo before requesting suggestions",
      );
    const result = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "media",
      connectionName: "wcms",
      apiName: "/customer/photos/" + encodeURIComponent(code),
      methodName: "GET",
      tenant: request.tenant,
      header: { Authorization: request.authorization },
      requestBody: {},
      timeoutMs: 15000,
      maxAttempts: 1,
    });
    request.photo = this.unwrap(result);
    return SERVICE.DefaultWasteMetadataAnalysisService.suggest(request);
  },
  /** Calculates advisory impact for explicit customer review. */
  estimate: function (request) {
    return SERVICE.DefaultWasteSubmissionOperationService.estimate(request);
  },
  /** Confirms submission facts and preserves original evidence. */
  confirm: function (request) {
    return SERVICE.DefaultWasteSubmissionOperationService.confirm(request);
  },
  /** Handles a customer message against the canonical draft. */
  message: function (request) {
    return SERVICE.DefaultEWasteConversationService.message(request);
  },
  /** Delegates a confirmed asset gift. */
  giftAsset: function (request) {
    return SERVICE.DefaultEWasteAssetOperationService.gift(request);
  },
  /** Reveals an owned coupon. */
  revealCoupon: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.reveal(request);
  },
  /** Publishes an asset listing according to the configured publication policy. */
  listAsset: function (request) {
    return SERVICE.DefaultEWasteListingService.list(request);
  },
  /** Reads published available marketplace offers. */
  marketplace: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.list(request);
  },
  /** Delegates a confirmed purchase to Commerce. */
  purchase: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.purchase(request);
  },
  /** Reads customer purchase history. */
  purchases: function (request) {
    return SERVICE.DefaultEWasteMarketplaceService.purchases(request);
  },
  /** Returns evidence only after checking the owning asset, submission, or staff review context. */
  evidencePhoto: async function (request) {
    const store = this.store();
    let record;
    if (request.resourceType === "review") {
      await SERVICE.DefaultWasteVerificationOperationService.authorize(
        request,
        "waste.review.evidence.read",
      );
      record = await store.one("wasteSubmission", request, request.code);
      if (record)
        await SERVICE.DefaultWasteOperationalAccessService.assertRecord(
          request,
          "waste.review.evidence.read",
          record,
        );
    } else if (request.resourceType === "asset") {
      const owner = store.customer(request);
      record = store.owned(
        await store.one("wasteAsset", request, request.code),
        owner,
        "ownerRef",
      );
    } else
      record =
        await SERVICE.DefaultWasteSubmissionOperationService.read(request);
    if (!record) store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Record not found");
    const photo = record.metadata && record.metadata.photo;
    if (!photo || !photo.code) return { url: photo && photo.url };
    if (request.resourceType === "submission")
      return this.remote(request, "media", "wcms", "/customer/photos/" + encodeURIComponent(photo.code), "GET", undefined, request.authorization);
    return this.remote(
      request,
      "media",
      "wcms",
      "/internal/evidence/photos/" + encodeURIComponent(photo.code),
      "GET",
    );
  },
  /** Projects permitted staff actions from backend-owned authorization. */
  operationsContext: function (request) {
    return SERVICE.DefaultWasteOperationalAccessService.describe(request);
  },
  /** Persists independent verification through the owning Waste service. */
  verify: function (request) {
    return SERVICE.DefaultWasteVerificationOperationService.verify(request);
  },
  /** Reads scoped immutable review evidence through the owning Waste service. */
  audit: function (request) {
    return SERVICE.DefaultWasteVerificationOperationService.audit(request);
  },
  /** Resumes the immutable pending decision before repeating settlement with its existing references. */
  reviewRecovery: async function (request) {
    request.assetCreationPolicyCode = this.settings().assetCreationPolicyCode;
    return this.finishReview(request, await SERVICE.DefaultWasteVerificationOperationService.recoverReview(request));
  },
  /** Returns scoped paginated review search/counts through Waste ownership. */
  reviewSearch: function (request) {
    return SERVICE.DefaultWasteReviewWorkspaceService.search(request);
  },
  /** Returns one scope-checked review detail. */
  reviewDetail: function (request) {
    return SERVICE.DefaultWasteReviewWorkspaceService.detail(request);
  },
  /** Reads immutable assessment history through Waste's scoped owner. */
  impactRecover: function (request) { return SERVICE.DefaultWasteImpactAssessmentService.recover(request); },
  /** Reads immutable assessment history through Waste's scoped owner. */
  impactHistory: function (request) { return SERVICE.DefaultWasteImpactAssessmentService.history(request); },
  /** Creates a new candidate assessment without changing the accepted result. */
  impactReassess: function (request) { return SERVICE.DefaultWasteImpactAssessmentService.reassess(request); },
  /** Explicitly accepts a saved candidate without changing any reward settlement. */
  impactSelect: function (request) { return SERVICE.DefaultWasteImpactAssessmentService.select(request); },
  /** Assigns a review through Waste's revisioned owner command. */
  reviewAssignment: function (request) {
    return SERVICE.DefaultWasteReviewWorkspaceService.assign(request);
  },
  /** Returns the staff review queue. */
  reviews: async function (request) {
    const queue =
      await SERVICE.DefaultWasteVerificationOperationService.queue(request);
    const pending = await this.store().list(
      "wasteAsset",
      request,
      { "metadata.settlementStatus": "PENDING" },
      100,
    );
    for (const asset of pending) {
      if (queue.some((item) => item.code === asset.sourceSubmissionCode))
        continue;
      const submission = await this.store().one(
        "wasteSubmission",
        request,
        asset.sourceSubmissionCode,
      );
      if (submission && submission.submissionStatus === "APPROVED")
        queue.push(submission);
    }
    return SERVICE.DefaultWasteOperationalAccessService.visible(
      request,
      "waste.review.queue.read",
      queue,
    );
  },
  /** Settles approval through the configured valuation seam and Loyalty ledger. */
  settle: async function (request, asset) {
    if (asset.metadata && asset.metadata.settlementStatus === "COMPLETED")
      return asset;
    const valuation = SERVICE[this.settings().rewardValuationService];
    if (!valuation || typeof valuation.assess !== "function")
      this.store().fail(
        "ERR_EWASTE_VALUATION_UNAVAILABLE",
        "Reward valuation is not configured",
      );
    const impact = await this.store().one(
      "wasteImpactResult",
      request,
      (asset.metadata?.approvedEstimate?.code || asset.impactRef.code),
    );
    const assessed = await valuation.assess({ asset: asset, impact: impact });
    const wallet = await this.remote(
      request,
      "loyaltyApi",
      "loyalty",
      "/wallets",
      "POST",
      { ownerType: "CUSTOMER", ownerCode: asset.ownerRef.code },
    );
    const refs = [];
    for (const reward of assessed.rewards) {
      if (Number(reward.amount) <= 0) continue;
      const result = await this.remote(
        request,
        "loyaltyApi",
        "loyalty",
        "/reward-earnings",
        "POST",
        {
          walletCode: wallet.code,
          programCode: reward.programCode,
          rewardTypeCode: reward.rewardTypeCode,
          amount: reward.amount,
          scale: reward.scale,
          sourceType: "WASTE_ASSET",
          sourceCode: asset.code,
          reasonCode: "APPROVED_SUBMISSION",
          idempotencyKey: asset.code + ":approval:" + reward.rewardTypeCode,
          metadata: {
            valuationVersion: assessed.version,
            impactRef: { module: "wasteImpact", schema: "wasteImpactResult", code: impact.code },
            illustrative: assessed.illustrative === true,
          },
        },
      );
      const entry = this.unwrap(result.ledgerEntry);
      refs.push({
        module: "loyaltyLedger",
        schema: "rewardLedgerEntry",
        code: Array.isArray(entry) ? entry[0].code : entry.code,
        rewardTypeCode: reward.rewardTypeCode,
      });
    }
    return this.store().update("wasteAsset", request, asset, {
      rewardSettlementRefs: refs.filter(
        (r) => r.rewardTypeCode === assessed.pointsRewardTypeCode,
      ),
      carbonSettlementRefs: refs.filter(
        (r) => r.rewardTypeCode !== assessed.pointsRewardTypeCode,
      ),
      metadata: Object.assign({}, asset.metadata, {
        settlementStatus: "COMPLETED",
        valuation: assessed,
        illustrativeCarbonUnits: assessed.rewards
          .filter((r) => r.rewardTypeCode !== assessed.pointsRewardTypeCode)
          .reduce((sum, r) => sum + Number(r.amount), 0),
      }),
    });
  },
  /** Retries only settlement for an already approved record; never writes or replaces a review decision. */
  retrySettlement: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService;
    await access.authorize(request, "waste.review.approve");
    const submission = await this.store().one(
      "wasteSubmission",
      request,
      request.code,
    );
    if (!submission)
      this.store().fail(
        "ERR_WASTE_RECORD_NOT_FOUND",
        "Submission was not found",
      );
    await access.assertRecord(request, "waste.review.approve", submission);
    this.store().revision(submission, request.expectedRevision);
    if (
      submission.submissionStatus !== "APPROVED" ||
      request.confirmed !== true
    )
      this.store().fail(
        "ERR_WASTE_REVIEW_CONFLICT",
        "Only an approved submission can retry settlement",
      );
    const asset = await this.store().one(
      "wasteAsset",
      request,
      "WASTE_ASSET_" + submission.code,
    );
    if (!asset)
      this.store().fail(
        "ERR_WASTE_RECORD_NOT_FOUND",
        "Approved asset was not found",
      );
    try {
      return {
        submission,
        asset: await this.settle(request, asset),
        settlementStatus: "COMPLETED",
      };
    } catch {
      return {
        submission,
        settlementStatus: "PENDING",
        settlementMessage: "Approval is saved. Reward settlement needs retry.",
      };
    }
  },
  /** Persists staff review then settles approved rewards with stable replay keys. */
  review: async function (request) {
    request.assetCreationPolicyCode = this.settings().assetCreationPolicyCode;
    const result =
      await SERVICE.DefaultWasteVerificationOperationService.review(request);
    return this.finishReview(request, result);
  },
  /** Delegates explicit notification uncertainty resolution. */
  outcomeResolve:function(request){return SERVICE.DefaultEWasteOutcomeCommunicationService.resolve(request);},
  /** Retries only notification for a scope-authorized recorded decision through the Communication adapter. */
  outcomeRetry:function(request){return SERVICE.DefaultEWasteOutcomeCommunicationService.retry(request);},
  /** Completes domain settlement after a persisted decision; later layers can decorate outcome delivery without owning the decision. */
  finishReview: async function (request, result) {
    if (result.asset) {
      try {
        result.asset = await this.settle(request, result.asset);
      } catch (error) {
        result.settlementStatus = "PENDING";
        result.settlementMessage =
          "Approval is saved. Reward settlement needs retry.";
      }
    }
    if(result.submission && SERVICE.DefaultEWasteOutcomeCommunicationService) { try {result.submission=await SERVICE.DefaultEWasteOutcomeCommunicationService.notify(request,result.submission);}catch(error){result.notificationStatus='PENDING';} }
    return result;
  },
};
