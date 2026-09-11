/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wasteVerification/service/defaultWasteReviewWorkspaceService
 * @description Owns scoped review search, exact counts, safe detail and explicit reviewer assignment over canonical submissions. Does not alter confirmed facts, settlements or delivery records.
 * @owner wasteVerification @layer service
 * @override Later modules tune bounded paging/presentation and assignment policy; preserve Profile scope compilation before queries and managed revisions for mutations.
 */
module.exports = {
  /** Returns owning defaults or a later module policy. */
  settings: function () {
    return (CONFIG.get("waste") || {}).reviewWorkspace || {};
  },
  /** Rejects malformed queries through the stable owner error. */
  invalid: function () {
    SERVICE.DefaultWastePersistenceService.fail(
      "ERR_WASTE_REVIEW_QUERY",
      "Review filters or pagination are invalid",
    );
  },
  /** Validates scalar filters and bounded positive paging without accepting arbitrary query operators. */
  filters: function (input = {}) {
    const policy = this.settings(),
      allowed = [
        "viewCode",
        "q",
        "status",
        "page",
        "limit",
        "collectionPointCode",
        "assignedToMe",
        "dateFrom", "dateTo", "familyCode", "categoryCode", "itemTypeCode", "sizeClass", "channel", "area", "dashboard",
      ];
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !allowed.includes(key)) ||
      Object.values(input).some(
        (value) => value !== null && typeof value === "object",
      )
    )
      return this.invalid();
    if (
      [
        "defaultPageSize",
        "maximumPageSize",
        "maximumPage",
        "maximumQueryLength",
      ].some((key) => !Number.isSafeInteger(policy[key]) || policy[key] < 1)
    )
      return this.invalid();
    if (
      ["page", "limit"].some(
        (key) =>
          input[key] !== undefined &&
          ((typeof input[key] !== "number" && typeof input[key] !== "string") ||
            !/^[1-9]\d*$/.test(String(input[key]))),
      )
    )
      return this.invalid();
    const views = policy.views || {};
    const view = input.viewCode === undefined ? undefined :
      typeof input.viewCode === 'string' && Object.prototype.hasOwnProperty.call(views, input.viewCode) ? views[input.viewCode] : null;
    if (view === null || view && !['OVERVIEW', 'SUBMISSIONS', 'REVIEW_QUEUE'].includes(view.mode)) return this.invalid();
    if (view?.familyCode && input.familyCode && input.familyCode !== view.familyCode) return this.invalid();
    if (view?.mode === 'REVIEW_QUEUE' && input.status && !['OPEN', 'SUBMITTED', 'UNDER_REVIEW'].includes(input.status)) return this.invalid();
    const page = input.page === undefined ? 1 : Number(input.page),
      limit =
        input.limit === undefined
          ? policy.defaultPageSize
          : Number(input.limit);
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > policy.maximumPage ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > policy.maximumPageSize
    )
      return this.invalid();
    const status = input.status || (view?.mode === "REVIEW_QUEUE" ? "OPEN" : view ? "ALL" : "OPEN");
    if (!(policy.statuses || []).some((item) => item.code === status))
      return this.invalid();
    const q = input.q === undefined ? "" : input.q;
    if (
      typeof q !== "string" ||
      q.length > policy.maximumQueryLength ||
      (input.collectionPointCode !== undefined &&
        (typeof input.collectionPointCode !== "string" ||
          input.collectionPointCode.length > 180)) ||
      (input.assignedToMe !== undefined &&
        ![true, false, "true", "false"].includes(input.assignedToMe))
    )
      return this.invalid();
    for (const key of ['familyCode', 'categoryCode', 'itemTypeCode', 'sizeClass', 'channel', 'area'])
      if (input[key] !== undefined && (typeof input[key] !== 'string' || input[key].length > 180)) return this.invalid();
    for (const key of ['dateFrom', 'dateTo'])
      if (input[key] && (typeof input[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input[key]) || !Number.isFinite(Date.parse(input[key])) || new Date(input[key]).toISOString().slice(0, 10) !== input[key])) return this.invalid();
    if (input.dateFrom && input.dateTo && input.dateFrom > input.dateTo) return this.invalid();
    if (input.dashboard !== undefined && ![true, false, 'true', 'false'].includes(input.dashboard)) return this.invalid();
    if (input.channel && !['WEB', 'TELEGRAM', 'WHATSAPP', 'CUSTOMER_APP'].includes(input.channel)) return this.invalid();
    if (input.sizeClass && !['SMALL', 'MEDIUM', 'LARGE', 'BULKY', 'HEAVY', 'UNKNOWN'].includes(input.sizeClass)) return this.invalid();
    return {
      viewCode: input.viewCode, dateFrom: input.dateFrom, dateTo: input.dateTo, familyCode: view?.familyCode || input.familyCode, categoryCode: input.categoryCode, itemTypeCode: input.itemTypeCode, sizeClass: input.sizeClass, channel: input.channel, area: input.area,
      dashboard: input.dashboard === true || input.dashboard === 'true',
      page,
      limit,
      status,
      q: q.trim(),
      collectionPointCode: input.collectionPointCode,
      assignedToMe:
        input.assignedToMe === true || input.assignedToMe === "true",
    };
  },
  /** Defines persisted reviewable states without treating a draft as an operator submission. */
  statuses: function (status) {
    return status === "OPEN"
      ? ["SUBMITTED", "UNDER_REVIEW"]
      : status === "ALL"
        ? ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]
        : [status];
  },
  /** Escapes user text before using a bounded case-insensitive literal search. */
  literal: function (value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },
  /** Projects customer/reviewer facts while excluding origin identifiers, private notes and command keys. */
  project: function (record) {
    const metadata = record.metadata || {};
    return {
      code: record.code,
      revision: record.revision,
      submissionStatus: record.submissionStatus,
      submitterRef: record.submitterRef,
      evidenceReview: SERVICE.DefaultWasteItemDescriptorService.evidenceReview(record),
      reviewPending:
        record.submissionStatus === "UNDER_REVIEW" && metadata.reviewDecision
          ? {
              decision: metadata.reviewDecision,
              principalCode: metadata.reviewPrincipal?.code,
            }
          : undefined,
      submittedFacts: record.submittedFacts || {},
      confirmedFacts: record.confirmedFacts,
      verificationRef: record.verificationRef,
      metadata: Object.fromEntries(
        [
          "photo",
          "sample",
          "suggestion",
          "submittedAt",
          "reviewedAt",
          "publicReason",
          "verifiedFacts",
          "verifiedEstimate",
          "reviewedFacts",
          "approvedEstimate",
          "estimate",
          "verifiedBy",
          "approvedBy",
          "preApprovalVerificationRef",
          "reviewAssignment",
          "outcomeDelivery",
        ]
          .filter((key) => metadata[key] !== undefined)
          .map((key) => [key, metadata[key]]),
      ),
    };
  },
  /** Queries facts with reviewed-to-confirmed precedence, so old submitted copies cannot satisfy a conflicting filter. */
  factQuery: function (key, values) {
    const paths = ['metadata.reviewedFacts', 'metadata.verifiedFacts', 'confirmedFacts', 'submittedFacts'].map(prefix => prefix + '.' + key);
    return { $or: paths.map((path, index) => ({ $and: [...paths.slice(0, index).map(previous => ({ $or: [{ [previous]: { $exists: false } }, { [previous]: null }, { [previous]: '' }] })), { [path]: { $in: values } }] })) };
  },
  /** Resolves permitted centre labels and areas from their Location/Profile owners, retaining an explicit enrichment warning. */
  choices: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService;
    const points = await access.collectionPoints(request, 'waste.review.queue.read');
    const records = [], unavailable = new Set();
    for (let index = 0; index < points.length; index += 50) {
      const enriched = await SERVICE.DefaultWasteCollectionCentreService.enrich(points.slice(index, index + 50), SERVICE.DefaultWastePersistenceService.context(request));
      records.push(...enriched.records);
      for (const source of enriched.unavailableSources || []) unavailable.add(source);
    }
    return { centres: records.map(point => ({ code: point.code, name: point.name, city: point.city || null, countryCode: point.countryCode || null })), unavailableSources: [...unavailable] };
  },
  /** Builds exact counts for six bounded time buckets; provider queries include the complete scope and active filters. */
  trend: async function (request, clauses, filters) {
    const end = filters.dateTo ? Date.parse(filters.dateTo) + 86400000 : Date.now();
    const start = filters.dateFrom ? Date.parse(filters.dateFrom) : end - 180 * 86400000;
    const width = Math.max(1, (end - start) / 6);
    return Promise.all(Array.from({ length: 6 }, async (_, index) => {
      const from = new Date(start + width * index).toISOString();
      const to = new Date(index === 5 ? end : start + width * (index + 1)).toISOString();
      const result = await SERVICE.DefaultWastePersistenceService.page('wasteSubmission', request, { $and: [...clauses, { submissionStatus: { $in: this.statuses(filters.status) } }, { 'metadata.submittedAt': { $gte: from, $lt: to } }] }, 1, 1);
      return { from, to, count: result.total };
    }));
  },
  /** Returns complete scoped counts and a stable sorted page. Scope and filters apply before provider counts and limits. */
  search: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService,
      store = SERVICE.DefaultWastePersistenceService;
    const scope = await access.scopeQuery(request, "waste.review.queue.read"),
      filters = this.filters(request.query || request.payload || {});
    const clauses = [scope];
    let choices, catalogue;
    if (filters.dashboard || filters.area) choices = await this.choices(request);
    if (filters.dashboard || filters.familyCode) catalogue = await SERVICE.DefaultWasteItemDescriptorService.catalogue(request);
    if (filters.familyCode) clauses.push(this.factQuery('categoryCode', catalogue.categories.filter(category => category.familyCode === filters.familyCode).map(category => category.code)));
    for (const key of ['categoryCode', 'itemTypeCode', 'sizeClass']) if (filters[key]) clauses.push(this.factQuery(key, [filters[key]]));
    if (filters.channel) clauses.push({ 'metadata.origin.channel': filters.channel });
    if (filters.area) {
      if (choices.unavailableSources.length) SERVICE.DefaultWastePersistenceService.fail('ERR_WASTE_AREA_UNAVAILABLE', 'Area information is unavailable. Try again or filter by collection centre.');
      clauses.push(access.pointQuery(choices.centres.filter(point => point.city && point.city.toLowerCase() === filters.area.toLowerCase()).map(point => point.code)));
    }
    if (filters.dateFrom || filters.dateTo) clauses.push({ 'metadata.submittedAt': { ...(filters.dateFrom ? { $gte: filters.dateFrom + 'T00:00:00.000Z' } : {}), ...(filters.dateTo ? { $lt: new Date(Date.parse(filters.dateTo) + 86400000).toISOString() } : {}) } });
    if (filters.q) {
      const value = { $regex: this.literal(filters.q), $options: "i" };
      clauses.push({
        $or: [
          "code",
          "submitterRef.code",
          "submittedFacts.name",
          "confirmedFacts.name",
          "metadata.verifiedFacts.name",
        ].map((field) => ({ [field]: value })),
      });
    }
    if (filters.collectionPointCode)
      clauses.push(access.pointQuery([filters.collectionPointCode]));
    if (filters.assignedToMe)
      clauses.push({
        "metadata.reviewAssignment.principalCode": request.authData.loginId,
        "metadata.reviewAssignment.type": "EMPLOYEE",
      });
    const queryFor = (status) => ({
      $and: [...clauses, { submissionStatus: { $in: this.statuses(status) } }],
    });
    const result = await store.page(
      "wasteSubmission",
      request,
      queryFor(filters.status),
      filters.page,
      filters.limit,
      { created: -1, code: 1 },
    );
    const counts = Object.fromEntries(
      await Promise.all(
        this.statuses("ALL").map(async (status) => [
          status,
          (await store.page("wasteSubmission", request, queryFor(status), 1, 1))
            .total,
        ]),
      ),
    );
    counts.OPEN = counts.SUBMITTED + counts.UNDER_REVIEW;
    counts.ALL = counts.OPEN + counts.APPROVED + counts.REJECTED;
    return {
      contractVersion: 1,
      ...result,
      items: result.items.map((record) => this.project(record)),
      counts,
      ...(filters.dashboard ? { dashboard: { contractVersion: 1, dateBasis: 'SUBMITTED_AT_UTC', generatedAt: new Date().toISOString(), trend: await this.trend(request, clauses, filters), ...choices, families: catalogue.families.map(({ code, name }) => ({ code, name })), categories: catalogue.categories.map(({ code, name, familyCode }) => ({ code, name, familyCode })), materials: catalogue.materials.map(({code, name, materialKind}) => ({code, name, materialKind})), itemTypes: catalogue.items.map(({code, name, categoryCode, allowedConditionGrades}) => ({code, name, categoryCode, allowedConditionGrades})) } } : {}),
    };
  },
  /** Reads one authorized record before returning its customer-safe review projection. */
  detail: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService,
      store = SERVICE.DefaultWastePersistenceService;
    await access.authorize(request, "waste.review.queue.read");
    const record = await store.one("wasteSubmission", request, request.code);
    if (!record || !this.statuses("ALL").includes(record.submissionStatus))
      store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Submission was not found");
    await access.assertRecord(request, "waste.review.queue.read", record);
    return { ...this.project(record), descriptor: SERVICE.DefaultWasteItemDescriptorService.describe(record, await SERVICE.DefaultWasteItemDescriptorService.catalogue(request)) };
  },
  /** Enforces employee ownership; review mutations require a claim while claim commands may start from the queue. */
  assertAssignment: function (request, record, requireClaim = false) {
    const assignment = record.metadata && record.metadata.reviewAssignment;
    if (
      assignment &&
      assignment.type === "EMPLOYEE" &&
      assignment.principalCode !== request.authData.loginId
    )
      SERVICE.DefaultWastePersistenceService.fail(
        "ERR_WASTE_ASSIGNMENT_CONFLICT",
        "Review is assigned to another employee",
      );
    if (requireClaim && (!assignment || assignment.type !== "EMPLOYEE" || !assignment.principalCode))
      SERVICE.DefaultWastePersistenceService.fail(
        "ERR_WASTE_ASSIGNMENT_REQUIRED",
        "Assign this submission to yourself before editing or recording a review",
      );
  },
  /** Claims or releases the caller's own review assignment using exact revision and explicit confirmation; queue handoff is persisted, not inferred from UI selection. */
  assign: async function (request) {
    const access = SERVICE.DefaultWasteOperationalAccessService,
      store = SERVICE.DefaultWastePersistenceService;
    const permission = access.granted(request, "waste.verification.record")
      ? "waste.verification.record"
      : "waste.review.approve";
    await access.authorize(request, permission);
    const current = await store.one("wasteSubmission", request, request.code);
    if (!current)
      store.fail("ERR_WASTE_RECORD_NOT_FOUND", "Submission was not found");
    await access.assertRecord(request, permission, current);
    if (
      (current.metadata && current.metadata.reviewDecision) ||
      !this.statuses("OPEN").includes(current.submissionStatus) ||
      request.confirmed !== true ||
      !["CLAIM", "RELEASE"].includes((request.payload || {}).action)
    )
      return this.invalid();
    this.assertAssignment(request, current);
    const key = request.idempotencyKey;
    if (typeof key !== "string" || !/^[A-Za-z0-9._:-]{8,180}$/.test(key))
      store.fail(
        "ERR_WASTE_IDEMPOTENCY_REQUIRED",
        "An assignment command reference is required",
      );
    if (current.metadata && current.metadata.assignmentKey === key)
      return this.project(current);
    if (request.payload.action === "RELEASE") this.assertAssignment(request, current, true);
    store.revision(current, request.expectedRevision);
    const assignment = {
      type: request.payload.action === "CLAIM" ? "EMPLOYEE" : "QUEUE",
      queueCode: access.settings().defaultReviewQueue,
      assignedAt: new Date().toISOString(),
      assignedBy: request.authData.loginId,
    };
    if (assignment.type === "EMPLOYEE")
      assignment.principalCode = request.authData.loginId;
    return this.project(
      await store.update("wasteSubmission", request, current, {
        submissionStatus: "UNDER_REVIEW",
        metadata: {
          ...current.metadata,
          reviewAssignment: assignment,
          assignmentKey: key,
        },
      }),
    );
  },
};
