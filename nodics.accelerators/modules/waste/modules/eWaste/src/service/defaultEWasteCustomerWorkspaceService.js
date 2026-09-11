/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module eWaste/service/defaultEWasteCustomerWorkspaceService
 * @description Composes paginated, owner-scoped customer listings and independently addressable item details from Waste records. Read-only: no records, ledgers, media or Commerce listings are created here.
 * @owner eWaste @layer service
 * @override Later modules customize customerWorkspace presentation and bounded paging, or exported projection members. Preserve authenticated ownership, effective facts, unknown values and command-side revalidation.
 */
module.exports = {
  /** Returns effective accelerator presentation and paging policy. */
  settings: function () {
    return (CONFIG.get("eWaste") || {}).customerWorkspace;
  },
  /** Returns the canonical Waste repository adapter. */
  store: function () {
    return SERVICE.DefaultWastePersistenceService;
  },
  /** Rejects unsupported selectors without exposing records. */
  invalid: function () {
    return this.store().fail("ERR_EWASTE_CUSTOMER_QUERY", "Choose valid item filters and pagination");
  },
  /** Selects the server-owned resource binding; callers cannot choose a schema or owner field. */
  resource: function (view = "submissions") {
    if (view === "submissions" || view === "drafts") return { schema: "wasteSubmission", owner: "submitterRef", status: "submissionStatus" };
    if (view === "assets") return { schema: "wasteAsset", owner: "ownerRef", status: "assetStatus" };
    return this.invalid();
  },
  /** Compiles all three canonical owner-reference parts from trusted Profile identity. */
  scope: function (request, view) {
    const owner = this.store().customer(request), field = this.resource(view).owner;
    return { active: { $ne: false }, [field + ".module"]: owner.module, [field + ".schema"]: owner.schema, [field + ".code"]: owner.code };
  },
  /** Groups lifecycle states for customer filters without merging review status with ownership. */
  states: function (code, view) {
    if (code === "ALL") return null;
    if (view === "submissions" && code === "DRAFT") return this.settings().draftStates;
    if (view === "submissions" && code === "PENDING") return ["SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"];
    return [code];
  },
  /** Validates bounded scalar filters; no client Mongo operators, scope or arbitrary sort fields are accepted. */
  filters: function (input = {}) {
    const policy = this.settings();
    if (!policy || ![policy.defaultPageSize, policy.maximumPageSize, policy.maximumPage, policy.maximumQueryLength].every(value => Number.isSafeInteger(value) && value > 0)) return this.invalid();
    const allowed = ["view", "q", "status", "categoryCode", "itemTypeCode", "dateFrom", "dateTo", "page", "limit", "sort"];
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(key => !allowed.includes(key)) || Object.values(input).some(value => typeof value !== "string" && typeof value !== "number")) return this.invalid();
    const view = input.view || "submissions";
    this.resource(view);
    const status = input.status || "ALL", sort = input.sort || "RECENT";
    if (!policy.statuses[view].some(value => value.code === status) || !policy.sorts.some(value => value.code === sort)) return this.invalid();
    for (const key of ["q", "categoryCode", "itemTypeCode", "dateFrom", "dateTo"]) if (input[key] !== undefined && (typeof input[key] !== "string" || input[key].length > policy.maximumQueryLength)) return this.invalid();
    const page = input.page === undefined ? 1 : Number(input.page), limit = input.limit === undefined ? policy.defaultPageSize : Number(input.limit);
    if (["page", "limit"].some(key => input[key] !== undefined && !/^[1-9]\d*$/.test(String(input[key]))) || !Number.isSafeInteger(page) || page < 1 || page > policy.maximumPage || !Number.isSafeInteger(limit) || limit < 1 || limit > policy.maximumPageSize) return this.invalid();
    for (const key of ["dateFrom", "dateTo"]) if (input[key] && (!/^\d{4}-\d{2}-\d{2}$/.test(input[key]) || !Number.isFinite(Date.parse(input[key])) || new Date(input[key]).toISOString().slice(0, 10) !== input[key])) return this.invalid();
    if (input.dateFrom && input.dateTo && input.dateFrom > input.dateTo) return this.invalid();
    return { ...input, view, status, sort, q: (input.q || "").trim(), page, limit };
  },
  /** Matches the same whole-facts precedence as the canonical descriptor, including final reviewed records. */
  factQuery: function (view, key, condition) {
    if (view === "assets") return { ["metadata.facts." + key]: condition };
    const final = { submissionStatus: { $in: ["APPROVED", "REJECTED"] } };
    const paths = ["metadata.reviewedFacts", "metadata.verifiedFacts", "confirmedFacts", "submittedFacts"];
    const choices = paths.map((path, index) => ({ $and: [final, ...paths.slice(0, index).map(previous => ({ [previous]: null })), { [path + "." + key]: condition }] }));
    choices.push({ $and: [{ submissionStatus: { $nin: ["APPROVED", "REJECTED"] } }, { $or: [{ ["confirmedFacts." + key]: condition }, { $and: [{ confirmedFacts: null }, { ["submittedFacts." + key]: condition }] }] }] });
    return { $or: choices };
  },
  /** Compiles literal search and authorized filters before provider counts and pagination. */
  query: function (request, filters) {
    const clauses = [this.scope(request, filters.view)];
    if (filters.view !== "assets") clauses.push({ submissionStatus: { [filters.view === "drafts" ? "$in" : "$nin"]: this.settings().draftStates } });
    for (const key of ["categoryCode", "itemTypeCode"]) if (filters[key]) clauses.push(this.factQuery(filters.view, key, filters[key]));
    if (filters.q) {
      const match = { $regex: filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      clauses.push({ $or: [{ code: match }, ...["name", "description", "brand", "model"].map(key => this.factQuery(filters.view, key, match))] });
    }
    if (filters.dateFrom || filters.dateTo) clauses.push({ "metadata.submittedAt": { ...(filters.dateFrom ? { $gte: filters.dateFrom + "T00:00:00.000Z" } : {}), ...(filters.dateTo ? { $lt: new Date(Date.parse(filters.dateTo) + 86400000).toISOString() } : {}) } });
    return clauses;
  },
  /** Returns a customer-friendly status from the owning vocabulary, preserving unknown future states. */
  status: function (code, view) {
    const policy = this.settings();
    const presentation = policy.statusLabels[code];
    return { code, label: presentation?.label || code.toLowerCase().replaceAll("_", " "), tone: presentation?.tone || "neutral", group: view !== "assets" && policy.draftStates.includes(code) ? "DRAFT" : policy.statuses[view].find(choice => choice.code !== "ALL" && this.states(choice.code, view).includes(code))?.code || code };
  },
  /** Describes available commands; command owners still validate current ownership, revision, confirmation and policy. */
  actions: function (record, view) {
    const labels = this.settings().actions;
    if (view === "submissions") return this.states("DRAFT", view).includes(record.submissionStatus) ? [{ code: "CONTINUE", label: labels.continue }] : [];
    const policy = (CONFIG.get("eWaste") || {}).marketplace || {}, metadata = record.metadata || {}, actions = [];
    if (["OWNED", "SOLD", "GIFTED"].includes(record.assetStatus)) {
      if (policy.autoPublishListings) actions.push({ code: "LIST", label: labels.list });
      if (policy.transferPolicyCode) actions.push({ code: "GIFT", label: labels.gift });
    }
    if (record.assetStatus === "LISTING_REQUESTED" && policy.autoPublishListings && metadata.listingIdempotencyKey && Number.isSafeInteger(metadata.listingRewardPrice)) actions.push({ code: "LIST", label: labels.resumeListing, command: { idempotencyKey: metadata.listingIdempotencyKey, rewardPrice: metadata.listingRewardPrice } });
    if (record.assetStatus === "LISTED" && (metadata.marketProductCode || metadata.commerceProductRef?.code)) actions.push({ code: "OPEN_LISTING", label: labels.openListing, targetCode: metadata.marketProductCode || metadata.commerceProductRef.code });
    return actions;
  },
  /** Produces an allowlisted read model from an already-authorized source. Private review notes, coordinates, actor identities and command internals are excluded. */
  item: function (record, view, catalogue) {
    // Drafts are a collection of submissions, never a separate resource or persistence owner.
    if (view === "drafts") view = "submissions";
    const metadata = record.metadata || {}, descriptor = SERVICE.DefaultWasteItemDescriptorService.describe(record, catalogue), status = this.status(record[this.resource(view).status], view);
    const valuation = metadata.valuation;
    const reward = valuation?.rewards?.find(value => value.rewardTypeCode === valuation.pointsRewardTypeCode);
    return {
      code: record.code, resource: view, revision: record.revision, descriptor, status,
      photo: metadata.photo ? { code: metadata.photo.code || null, url: metadata.photo.url || null } : null,
      submittedAt: metadata.submittedAt || null, reviewedAt: metadata.reviewedAt || null, updatedAt: record.updated || null,
      actions: this.actions(record, view),
      nextStep: this.settings().nextSteps[record[this.resource(view).status]] || this.settings().nextSteps.DEFAULT,
      ownership: view === "assets" ? { isCurrentOwner: true, originalReward: reward?.amount ?? metadata.openingReward ?? null, rewardTypeCode: valuation?.pointsRewardTypeCode || null, illustrativeCarbonUnits: metadata.illustrativeCarbonUnits ?? null, askingPrice: metadata.listingRewardPrice ?? metadata.askingPrice ?? null, settlementStatus: metadata.settlementStatus || null } : null,
    };
  },
  /** Returns a stable page and status counts for the same owner and active non-status filters. Taxonomy options come from the canonical active catalogue. */
  search: async function (request) {
    const filters = this.filters(request.query), resource = this.resource(filters.view), clauses = this.query(request, filters), store = this.store();
    const statusClause = code => { const values = this.states(code, filters.view); return values ? { [resource.status]: { $in: values } } : {}; };
    const [page, counts, catalogue] = await Promise.all([
      store.page(resource.schema, request, { $and: [...clauses, statusClause(filters.status)] }, filters.page, filters.limit, { updated: filters.sort === "OLDEST" ? 1 : -1, code: 1 }),
      Promise.all(this.settings().statuses[filters.view].map(async value => ({ ...value, count: (await store.page(resource.schema, request, { $and: [...clauses, statusClause(value.code)] }, 1, 1)).total }))),
      SERVICE.DefaultWasteItemDescriptorService.catalogue(request),
    ]);
    return { contractVersion: 1, view: filters.view, items: page.items.map(record => this.item(record, filters.view, catalogue)), total: page.total, page: filters.page, pageSize: filters.limit, statuses: counts, sorts: this.settings().sorts, filters: { categories: catalogue.categories.map(value => ({ code: value.code, name: value.name, familyCode: value.familyCode })), itemTypes: catalogue.items.map(value => ({ code: value.code, name: value.name, categoryCode: value.categoryCode })) } };
  },
  /** Reads one item independently of list pages, then enriches only with sources the current customer may see. */
  detail: async function (request) {
    const view = request.query?.view || "submissions";
    if (!["submissions", "assets"].includes(view) || Object.keys(request.query || {}).some(key => !["view", "assessmentPage"].includes(key)) || (request.query?.assessmentPage !== undefined && (view !== "assets" || !Number.isSafeInteger(Number(request.query.assessmentPage)) || Number(request.query.assessmentPage) < 1 || Number(request.query.assessmentPage) > 10000)) || typeof request.code !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$/.test(request.code)) return this.invalid();
    const resource = this.resource(view), scope = this.scope(request, view), store = this.store();
    const record = (await store.list(resource.schema, request, { ...scope, code: request.code }, 1))[0];
    if (!record) return store.fail("ERR_WASTE_RECORD_NOT_FOUND", "The requested record was not found");
    const catalogue = await SERVICE.DefaultWasteItemDescriptorService.catalogue(request), item = this.item(record, view, catalogue);
    let relatedAsset = null, sourceSubmission = null;
    if (view === "submissions" && record.submissionStatus === "APPROVED") {
      const asset = (await store.list("wasteAsset", request, { ...this.scope(request, "assets"), sourceSubmissionCode: record.code }, 1))[0];
      if (asset) relatedAsset = this.item(asset, "assets", catalogue);
    }
    if (view === "assets" && record.sourceSubmissionCode) {
      const submission = (await store.list("wasteSubmission", request, { ...this.scope(request, "submissions"), code: record.sourceSubmissionCode }, 1))[0];
      if (submission) sourceSubmission = { code: submission.code, name: SERVICE.DefaultWasteItemDescriptorService.describe(submission, catalogue).identity.name };
    }
    const history = [];
    if (item.submittedAt) history.push({ code: "SUBMITTED", label: this.settings().history.submitted, at: item.submittedAt });
    if (item.reviewedAt) history.push({ code: "REVIEWED", label: this.settings().history.reviewed, at: item.reviewedAt, description: item.descriptor.review.comment });
    let collectionPoint = null;
    const pointCode = view === "submissions" ? record.metadata?.arrival?.collectionPointCode || record.confirmedFacts?.preferredCollectionPointCode || record.submittedFacts?.preferredCollectionPointCode : null;
    if (pointCode) {
      const point = await store.one("wasteCollectionPoint", request, pointCode);
      if (point) collectionPoint = { code: point.code, name: point.name };
    }
    const impactHistory = view === 'assets' && SERVICE.DefaultWasteImpactAssessmentService
      ? await SERVICE.DefaultWasteImpactAssessmentService.historyForAsset({ ...request, query: { page: request.query?.assessmentPage || 1 } }, record) : null;
    return { contractVersion: 1, item, relatedAsset, sourceSubmission, collectionPoint, history, impactHistory };
  },
};
