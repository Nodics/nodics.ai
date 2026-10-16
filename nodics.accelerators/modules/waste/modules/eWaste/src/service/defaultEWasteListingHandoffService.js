/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module eWaste/service/defaultEWasteListingHandoffService
 * @description Reads seller-approved retained listing intent for scoped moderators and independently admitted Product owners; never authors, approves or activates another owner's records.
 * @layer service @owner eWaste
 * @override Later layers may narrow listing reads and owner targets, never replace original intent, signed scope, canonical Store evidence or approval authority.
 */
module.exports = {
  /** Returns the inert handoff selection and bounded paging policy. */
  settings: function () {
    return CONFIG.get("eWaste")?.marketplace?.listingHandoff || {};
  },
  /** Throws only fixed registered owner diagnostics. */
  fail: function (suffix) {
    return SERVICE.DefaultWastePersistenceService.fail(
      "ERR_EWASTE_LISTING_" + suffix,
      "Retained listing handoff could not be qualified",
    );
  },
  /** Accepts bounded business identifiers, never queries, URLs or service selectors. */
  identifier: function (value) {
    return (
      typeof value === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,179}$/.test(value)
    );
  },
  /** Uses the existing canonical checksum, including stable object/date normalization. */
  digest: function (value) {
    return SERVICE.DefaultWasteInstalledDataInspectionService.checksum(
      JSON.parse(JSON.stringify(value)),
    );
  },
  /** Checks original signed namespace aliases without treating body fields as authority. */
  scope: function (request) {
    const a = request.authData || {},
      enterpriseCode = a.entCode || a.enterpriseCode;
    if (
      !this.identifier(a.tenant) ||
      request.tenant !== a.tenant ||
      !this.identifier(enterpriseCode) ||
      [request.tenantCode, a.tenantCode].some(
        (value) => value !== undefined && value !== a.tenant,
      ) ||
      [
        a.entCode,
        a.enterpriseCode,
        request.entCode,
        request.enterpriseCode,
        request.httpRequest?.headers?.["x-enterprise-code"],
      ].some((value) => value !== undefined && value !== enterpriseCode)
    )
      this.fail("FORBIDDEN");
    return { tenant: a.tenant, enterpriseCode };
  },
  /** Reuses the effective router permission owner; no group or grant is synthesized. */
  granted: function (request, permission) {
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    return (
      security?.isPermissionGranted(
        permission,
        security.getGrantedPermissions(request),
        {},
      ) === true
    );
  },
  /** Admits the original human moderator or private read-only runtime before any storage/transport read. */
  pin: function (request, privateRead = false) {
    const scope = this.scope(request),
      a = request.authData,
      policy = this.settings();
    if (
      policy.enabled !== true ||
      !this.identifier(CONFIG.get("eWaste")?.applicationCode) ||
      !this.identifier(CONFIG.get("eWaste")?.marketplace?.storeCode)
    )
      this.fail("OWNER_UNAVAILABLE");
    if (privateRead) {
      if (
        SERVICE.DefaultServiceTokenService?.requireRuntimePrincipal?.(
          request,
          "eWaste",
        ) !== a ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !==
          true ||
        a.isSystem ||
        a.principalType !== "service" ||
        !a.permissions?.includes("waste.asset.listing.intent.read") ||
        !this.granted(request, "waste.asset.listing.intent.read")
      )
        this.fail("FORBIDDEN");
    } else if (
      a.principalType !== "human" ||
      a.tokenType !== "access" ||
      a.isSystem ||
      !(a.loginId || a.principalId || a.code) ||
      !this.granted(request, "waste.marketplace.moderate")
    )
      this.fail("FORBIDDEN");
    return {
      scope,
      privateRead,
      auth: structuredClone(a),
      policy: structuredClone(policy),
      config: structuredClone(CONFIG.get("eWaste")),
      input: structuredClone({
        body: request.httpRequest?.body,
        query: request.query,
        code: request.code,
      }),
    };
  },
  /** Retires changed authority, input or owner selection across every asynchronous boundary. */
  check: function (request, pin) {
    this.scope(request);
    if (
      !isDeepStrictEqual(request.authData, pin.auth) ||
      !isDeepStrictEqual(CONFIG.get("eWaste"), pin.config) ||
      !isDeepStrictEqual(
        {
          body: request.httpRequest?.body,
          query: request.query,
          code: request.code,
        },
        pin.input,
      )
    )
      this.fail("FORBIDDEN");
    if (
      pin.privateRead &&
      (SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
        request,
        "eWaste",
      ) !== request.authData ||
        SERVICE.DefaultLoggerService.hasPrivateCaptureProtection(request) !==
          true)
    )
      this.fail("FORBIDDEN");
    if (
      !this.granted(
        request,
        pin.privateRead
          ? "waste.asset.listing.intent.read"
          : "waste.marketplace.moderate",
      )
    )
      this.fail("FORBIDDEN");
  },
  /** Calls fixed existing owner transport using its original internal runtime bearer, never human or business headers. */
  ownerRead: async function (
    request,
    connectionName,
    moduleName,
    apiName,
    input,
    check = () => {},
  ) {
    const config = structuredClone(CONFIG.get("eWaste")),
      target = config?.targetAuthorities?.[connectionName];
    if (!target) this.fail("OWNER_UNAVAILABLE");
    check();
    let value;
    try {
      value = await SERVICE.DefaultModuleService.invokeModule({
        local: false,
        moduleName,
        connectionName,
        targetAuthority: target,
        apiName,
        methodName: "POST",
        tenant: request.tenant,
        request: { tenant: request.tenant },
        requestBody: structuredClone(input),
        timeoutMs: 15000,
        maxAttempts: 1,
      });
    } catch (_) {
      this.fail("OWNER_UNAVAILABLE");
    }
    check();
    if (!isDeepStrictEqual(CONFIG.get("eWaste"), config))
      this.fail("OWNER_UNAVAILABLE");
    for (let depth = 0; depth < 6 && value; depth++) {
      if (
        value.error ||
        value.success === false ||
        value.acknowledged === false ||
        /^ERR_/.test(value.code || "") ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        this.fail("OWNER_UNAVAILABLE");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    if (
      !value ||
      value.contractVersion !== 1 ||
      value.tenant !== request.tenant
    )
      this.fail("OWNER_UNAVAILABLE");
    return structuredClone(value);
  },
  /** Reads canonical Store placement and Product authoring context before source capture or operator admission. */
  storeContext: async function (request, storeCode, check) {
    if (!this.identifier(storeCode)) this.fail("PROOF_REQUIRED");
    const value = await this.ownerRead(
      request,
      "commerceStaged",
      "product",
      "/internal/products/listings/store-context",
      { contractVersion: 1, storeCode },
      check,
    );
    const s = value.store,
      a = value.authoring;
    if (
      s?.code !== storeCode ||
      s.active !== true ||
      s.status !== "ACTIVE" ||
      !this.identifier(s.enterpriseCode) ||
      !Number.isSafeInteger(s.revision) ||
      s.revision < 1 ||
      !this.identifier(a?.catalogVersion) ||
      !Array.isArray(a.locales) ||
      !a.locales.length ||
      a.locales.length > 20 ||
      new Set(a.locales).size !== a.locales.length ||
      a.locales.some(
        (locale) =>
          typeof locale !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(locale),
      )
    )
      this.fail("OWNER_UNAVAILABLE");
    return {
      storeContext: {
        code: s.code,
        enterpriseCode: s.enterpriseCode,
        revision: s.revision,
      },
      authoringContext: {
        catalogVersion: a.catalogVersion,
        locales: [...a.locales].sort(),
      },
    };
  },
  /** Pins supported active Waste policy records at original request capture, without exposing their private records. */
  policyPins: async function (request, policy, check = () => {}) {
    check();
    const policies = await SERVICE.DefaultEWasteDigitalSaleService.policies(
      request,
      policy,
      policy,
    );
    check();
    if (
      policies.transfer.metadata?.digitalOwnership?.refund !==
        "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER" ||
      policies.reward.walletCurrencyCode !== policy.currency
    )
      this.fail("PROOF_REQUIRED");
    return Object.fromEntries(
      Object.entries(policies).map(([key, value]) => [key, this.digest(value)]),
    );
  },
  /** Strict generated reads remain within the canonical Waste persistence boundary and verified tenant partition. */
  rows: async function (request, schema, query, page, limit, check = () => {}) {
    check();
    const store = SERVICE.DefaultWastePersistenceService;
    const envelope = {
      ...store.context(request),
      query: structuredClone(query),
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: limit, pageNumber: page, sort: { code: 1 } },
    };
    let response;
    try {
      response = await store.repository(schema).get(envelope);
    } catch (_) {
      this.fail("OWNER_UNAVAILABLE");
    }
    check();
    if (
      envelope.tenant !== request.tenant ||
      !/^SUC_/.test(response?.code || "") ||
      response.error ||
      response.success === false ||
      response.acknowledged === false ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Number.isSafeInteger(response.count) ||
      response.count < 0 ||
      !Array.isArray(response.result) ||
      response.result.length !==
        Math.min(limit, Math.max(0, response.count - (page - 1) * limit)) ||
      response.result.some(
        (row, i, rows) =>
          !this.identifier(row?.code) ||
          (row.tenant !== undefined && row.tenant !== request.tenant) ||
          (i && rows[i - 1].code >= row.code),
      )
    )
      this.fail("OWNER_UNAVAILABLE");
    return { items: structuredClone(response.result), total: response.count };
  },
  /** Validates retained v2 intent; historical unknown terms are never backfilled from today's configuration. */
  intent: function (asset) {
    const i = asset?.metadata?.listingIntent,
      m = asset?.metadata;
    if (m?.listingReconciliation || !i || i.contractVersion !== 2) this.fail("RECONCILIATION_REQUIRED");
    const key = i.listingKey,
      sourceRef = {
        module: "wasteCore",
        schema: "wasteAsset",
        code: asset.code,
      };
    if (
      !/^[a-f0-9]{64}$/.test(key || "") ||
      i.assetCode !== asset.code ||
      !this.identifier(i.tenant) ||
      i.ownerRef?.module !== "profile" ||
      i.ownerRef.schema !== "customer" ||
      !this.identifier(i.ownerRef.code) ||
      !isDeepStrictEqual(asset.ownerRef, i.ownerRef) ||
      !isDeepStrictEqual(asset.digitalOwnerRef, i.ownerRef) ||
      m.listingCommand !== key ||
      m.listingIdempotencyKey !== i.idempotencyKey ||
      m.listingRewardPrice !== i.rewardPrice ||
      m.listingIntentDigest !== this.digest(i) ||
      !Number.isSafeInteger(i.rewardPrice) ||
      i.rewardPrice < 1 ||
      i.rewardPrice > 100000 ||
      !Number.isSafeInteger(i.requestRevision) ||
      i.requestRevision < 1 ||
      !this.identifier(i.applicationCode) ||
      !this.identifier(i.storeContext?.code) ||
      !this.identifier(i.storeContext?.enterpriseCode) ||
      !Number.isSafeInteger(i.storeContext.revision) ||
      i.storeContext.revision < 1 ||
      i.storeContext.code !== i.policy?.storeCode ||
      i.authoringContext?.catalogVersion !== i.policy.catalogVersion ||
      !Array.isArray(i.authoringContext.locales) ||
      !i.authoringContext.locales.length ||
      i.authoringContext.locales.length > 20 ||
      new Set(i.authoringContext.locales).size !==
        i.authoringContext.locales.length ||
      i.authoringContext.locales.some(
        (locale) =>
          typeof locale !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(locale),
      ) ||
      ![
        "transferPolicyCode",
        "rewardSettlementPolicyCode",
        "carbonSettlementPolicyCode",
      ].every((k) => this.identifier(i.policy[k])) ||
      !isDeepStrictEqual(Object.keys(i.policyPins || {}).sort(), [
        "carbon",
        "reward",
        "transfer",
      ]) ||
      Object.values(i.policyPins || {}).some(
        (value) => !/^[a-f0-9]{64}$/.test(value),
      ) ||
      !isDeepStrictEqual(i.productCommand?.sourceRef, sourceRef) ||
      !isDeepStrictEqual(i.productCommand.ownerRef, i.ownerRef) ||
      Object.keys(i.productCommand).some(
        (k) =>
          ![
            "sourceRef",
            "ownerRef",
            "biddingEnabled",
            "name",
            "description",
            "imageUrl",
            "sample",
            "idempotencyKey",
            "issuer",
          ].includes(k),
      ) ||
      i.productCommand.idempotencyKey !== key ||
      typeof i.productCommand.name !== "string" ||
      !i.productCommand.name.trim() ||
      i.productCommand.name.length > 180 ||
      typeof i.productCommand.description !== "string" ||
      i.productCommand.description.length > 2000 ||
      !isDeepStrictEqual(i.priceRowIntent, {
        code: "WASTE_PRICE_" + key,
        priceBookCode: i.policy.priceBookCode,
        currency: i.policy.currency,
        unitAmount: String(i.rewardPrice),
        minQuantity: "1",
      }) ||
      !this.identifier(i.priceRowIntent.priceBookCode) ||
      !this.identifier(i.priceRowIntent.currency)
    )
      this.fail("PROOF_REQUIRED");
    return structuredClone(i);
  },
  /** Reads the legacy asset through the original source-review scope, never today's Store placement as historical authority. */
  reconciliationAsset: async function (request, pin) {
    if (!this.identifier(request.code) || Object.keys(request.query || {}).length) this.fail("PROOF_REQUIRED");
    const query = await this.inspectorQuery(request, pin);
    const result = await this.rows(request, "wasteAsset", {
      $and: [query, { code: request.code, active: true, assetStatus: "LISTING_REQUESTED" }],
    }, 1, 2, () => this.check(request, pin));
    if (result.total !== 1 || result.items[0].code !== request.code ||
      !query.sourceSubmissionCode.$in.includes(result.items[0].sourceSubmissionCode) ||
      result.items[0].active !== true || result.items[0].assetStatus !== "LISTING_REQUESTED") this.fail("FORBIDDEN");
    return result.items[0];
  },
  /** Projects content-free reconciliation evidence; a held request never advertises relisting or an absence proof. */
  reconciliationView: function (asset) {
    const receipt = asset.metadata?.listingReconciliation;
    if (receipt && (receipt.contractVersion !== 1 || receipt.state !== "RECONCILING" ||
      receipt.requestDisposition !== "WITHDRAWN" || receipt.economicEffects !== "UNKNOWN" ||
      receipt.relistAllowed !== false || receipt.command?.assetCode !== asset.code ||
      !Number.isSafeInteger(receipt.command.expectedRevision) || receipt.command.expectedRevision >= asset.revision ||
      !/^[a-f0-9]{64}$/.test(receipt.command.snapshotDigest || "") ||
      receipt.code !== "WASTE_LISTING_HOLD_" + this.digest(receipt.command))) this.fail("PROOF_REQUIRED");
    return {
      contractVersion: 1, assetCode: asset.code, assetRevision: asset.revision,
      state: receipt ? "RECONCILING" : "RECONCILIATION_REQUIRED",
      requestDisposition: receipt ? "WITHDRAWN" : "UNRESOLVED",
      economicEffects: "UNKNOWN", relistAllowed: false,
      snapshotDigest: this.digest(asset), receiptCode: receipt?.code || null,
      originalRevision: receipt?.command?.expectedRevision ?? asset.revision,
      originalSnapshotDigest: receipt?.command?.snapshotDigest || this.digest(asset),
      requiredOwnerChecks: ["PRODUCT_SOURCE_AND_PUBLICATION", "DIGITAL_BINDINGS_AND_ENTITLEMENTS", "ORDERS_AND_CHECKOUT", "INVENTORY_RESERVATIONS", "CROSS_OWNER_WRITER_FENCE"],
      canWithdraw: this.settings().reconciliation?.enabled === true && !receipt &&
        asset.metadata?.listingIntent?.contractVersion !== 2 && !asset.metadata?.pendingTransferCode &&
        !asset.metadata?.pendingRefundCode && asset.ownerRef?.module === "profile" &&
        asset.ownerRef.schema === "customer" && !!asset.ownerRef.code && isDeepStrictEqual(asset.ownerRef, asset.digitalOwnerRef),
    };
  },
  /** Inspects a legacy request without assuming external effects are absent or issuing publication proof. */
  reconciliation: async function (request) {
    const pin = this.pin(request);
    return this.reconciliationView(await this.reconciliationAsset(request, pin));
  },
  /** Records an explicit scoped staff withdrawal with retained audit and original-key recovery; no external cancellation or automatic relisting. */
  reconcile: async function (request) {
    const pin = this.pin(request), input = request.httpRequest?.body;
    if (pin.policy.reconciliation?.enabled !== true) this.fail("OWNER_UNAVAILABLE");
    if (!input || Array.isArray(input) || Object.keys(input).sort().join() !==
      "confirmed,contractVersion,expectedRevision,idempotencyKey,reason,snapshotDigest" ||
      input.contractVersion !== 1 || input.confirmed !== true ||
      !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0 ||
      !Number.isSafeInteger(input.expectedRevision + 1) || !this.identifier(input.idempotencyKey) ||
      !/^[a-f0-9]{64}$/.test(input.snapshotDigest || "") || typeof input.reason !== "string" ||
      !input.reason.trim() || input.reason.length > 1000 || /[\x00-\x1f\x7f]/.test(input.reason)) this.fail("PROOF_REQUIRED");
    const command = {
      contractVersion: 1, tenant: request.tenant, assetCode: request.code,
      expectedRevision: input.expectedRevision, snapshotDigest: input.snapshotDigest,
      idempotencyKey: input.idempotencyKey, reason: input.reason.trim(),
      actor: { module: "profile", schema: "employee", code: pin.auth.loginId || pin.auth.principalId || pin.auth.code },
      enterpriseCode: pin.scope.enterpriseCode,
    };
    if (!this.identifier(command.actor.code)) this.fail("FORBIDDEN");
    const asset = await this.reconciliationAsset(request, pin);
    const revalidate = async () => {
      this.check(request, pin);
      const current = await this.reconciliationAsset(request, pin);
      if (!isDeepStrictEqual(current, asset)) this.fail("PROOF_REQUIRED");
      return structuredClone(command);
    };
    await SERVICE.DefaultWasteDigitalListingOperationService.holdLegacyRequest(request, command, revalidate);
    this.check(request, pin);
    const saved = await this.reconciliationAsset(request, pin);
    if (!isDeepStrictEqual(saved.metadata?.listingReconciliation?.command, command)) this.fail("PROOF_REQUIRED");
    return this.reconciliationView(saved);
  },
  /** Accepts only the exact six readonly proof selectors, with fresh asset revision distinct from retained request revision. */
  selectors: function (input) {
    const keys = [
      "contractVersion",
      "assetCode",
      "listingKey",
      "expectedRevision",
      "intentDigest",
      "storeCode",
    ];
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      !isDeepStrictEqual(Object.keys(input).sort(), keys.sort()) ||
      input.contractVersion !== 1 ||
      !this.identifier(input.assetCode) ||
      !this.identifier(input.storeCode) ||
      !/^[a-f0-9]{64}$/.test(input.listingKey || "") ||
      !/^[a-f0-9]{64}$/.test(input.intentDigest || "") ||
      !Number.isSafeInteger(input.expectedRevision) ||
      input.expectedRevision < 1
    )
      this.fail("PROOF_REQUIRED");
    return structuredClone(input);
  },
  /** Projects Product-only evidence from qualified intent; Pricing and settlement terms remain with this owner and bound by intentDigest. */
  projectProof: function (asset, i) {
    return {
      contractVersion: 1,
      tenant: i.tenant,
      assetCode: asset.code,
      assetRevision: asset.revision,
      listingKey: i.listingKey,
      requestRevision: i.requestRevision,
      intentDigest: this.digest(i),
      sourceRef: {
        module: "wasteCore",
        schema: "wasteAsset",
        code: asset.code,
      },
      ownerRef: i.ownerRef,
      storeContext: i.storeContext,
      authoringContext: i.authoringContext,
      productCommand: i.productCommand,
    };
  },
  /** Independently authenticates original runtime/business admission and freshly verifies exact saved intent and Store placement. */
  proof: async function (request) {
    const pin = this.pin(request, true),
      p = this.selectors(request.httpRequest?.body),
      check = () => this.check(request, pin);
    if (Object.keys(request.query || {}).length) this.fail("PROOF_REQUIRED");
    const result = await this.rows(
      request,
      "wasteAsset",
      { code: p.assetCode, active: true },
      1,
      2,
      check,
    );
    if (result.total !== 1) this.fail("PROOF_REQUIRED");
    const asset = result.items[0],
      i = this.intent(asset);
    if (
      !["LISTING_REQUESTED", "LISTED"].includes(asset.assetStatus) ||
      asset.metadata?.pendingTransferCode ||
      asset.metadata?.pendingRefundCode ||
      i.tenant !== request.tenant ||
      i.applicationCode !== pin.config.applicationCode ||
      asset.revision !== p.expectedRevision ||
      p.listingKey !== i.listingKey ||
      p.intentDigest !== this.digest(i) ||
      p.storeCode !== i.storeContext.code
    )
      this.fail("PROOF_REQUIRED");
    const sale = SERVICE.DefaultEWasteDigitalSaleService;
    const r = sale.authority(
      {
        tenant: request.tenant,
        authData: request.authData,
        privateRequest: request,
        enterpriseCode: i.storeContext.enterpriseCode,
        payload: p,
      },
      "waste.asset.listing.intent.read",
    );
    check();
    sale.recheckAuthority(r);
    const fresh = await this.storeContext(request, p.storeCode, () => {
      check();
      sale.recheckAuthority(r);
    });
    if (
      !isDeepStrictEqual(fresh, {
        storeContext: i.storeContext,
        authoringContext: i.authoringContext,
      })
    )
      this.fail("PROOF_REQUIRED");
    const after = await this.rows(
      request,
      "wasteAsset",
      { code: p.assetCode, active: true },
      1,
      2,
      check,
    );
    if (after.total !== 1 || !isDeepStrictEqual(after.items[0], asset))
      this.fail("PROOF_REQUIRED");
    return this.projectProof(asset, i);
  },
  /** Compiles the existing review scope only for wrong-enterprise inspectors; it is never widened into Store publication authority. */
  inspectorQuery: async function (request, pin) {
    const access = SERVICE.DefaultWasteOperationalAccessService,
      check = () => this.check(request, pin);
    const query = await access.scopeQuery(request, "waste.review.queue.read");
    check();
    const maximum = pin.policy.maximumInspectorSources;
    if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 10000)
      this.fail("OWNER_UNAVAILABLE");
    const sources = await this.rows(
      request,
      "wasteSubmission",
      {
        $and: [
          query,
          { "sourceContext.applicationCode": pin.config.applicationCode },
        ],
      },
      1,
      maximum,
      check,
    );
    if (sources.total > maximum) this.fail("OWNER_UNAVAILABLE");
    return {
      sourceSubmissionCode: { $in: sources.items.map((row) => row.code) },
    };
  },
  /** Chooses current fixed Store scope, or bounded existing review scope for read-only inspectors. */
  readScope: async function (request, pin) {
    const context = await this.storeContext(
      request,
      pin.config.marketplace?.storeCode,
      () => this.check(request, pin),
    );
    if (pin.scope.enterpriseCode === context.storeContext.enterpriseCode)
      return {
        context,
        query: {
          "metadata.listingIntent.contractVersion": 2,
          "metadata.listingIntent.applicationCode": pin.config.applicationCode,
          "metadata.listingIntent.storeContext.code": context.storeContext.code,
          "metadata.listingIntent.storeContext.enterpriseCode":
            context.storeContext.enterpriseCode,
        },
        inspector: false,
      };
    return {
      context,
      query: await this.inspectorQuery(request, pin),
      inspector: true,
    };
  },
  /** Projects seller-approved presentation only; missing immutable intent remains explicit reconciliation. */
  dto: function (request, asset, scope) {
    let i;
    try {
      i = this.intent(asset);
    } catch (_) {
      /* Historical unknown intent is never repaired by a read. */
    }
    const requiredEnterpriseCode = i?.storeContext.enterpriseCode || null;
    const matches =
      i &&
      i.tenant === request.tenant &&
      i.applicationCode === CONFIG.get("eWaste").applicationCode &&
      isDeepStrictEqual(scope.context, {
        storeContext: i.storeContext,
        authoringContext: i.authoringContext,
      });
    const hasAuthoringAuthority =
      !!matches &&
      !scope.inspector &&
      this.granted(request, "commerce.product.publish");
    const blockerCode = !i
      ? "ERR_EWASTE_LISTING_RECONCILIATION_REQUIRED"
      : !matches
        ? "ERR_EWASTE_LISTING_PROOF_REQUIRED"
        : scope.inspector
          ? "ERR_EWASTE_LISTING_STORE_ENTERPRISE_REQUIRED"
          : !hasAuthoringAuthority
            ? "ERR_EWASTE_LISTING_FORBIDDEN"
            : asset.metadata?.pendingTransferCode ||
                asset.metadata?.pendingRefundCode
              ? "ERR_EWASTE_LISTING_PROOF_REQUIRED"
              : null;
    return {
      contractVersion: 1,
      assetCode: asset.code,
      assetRevision: asset.revision,
      assetStatus: asset.assetStatus,
      state: !i
        ? "RECONCILIATION_REQUIRED"
        : asset.assetStatus === "LISTED"
          ? "LISTED"
          : "OWNER_INSPECTION_REQUIRED",
      listingKey: i?.listingKey || null,
      requestRevision: i?.requestRevision || null,
      intentDigest: i ? this.digest(i) : null,
      rewardPrice:
        i?.rewardPrice ??
        (Number.isSafeInteger(asset.metadata?.listingRewardPrice)
          ? asset.metadata.listingRewardPrice
          : null),
      ownerRef: i?.ownerRef || {
        module: "profile",
        schema: "customer",
        code: asset.ownerRef?.code,
      },
      storeContext: i?.storeContext || null,
      authoringContext: i?.authoringContext || null,
      productCommand: i?.productCommand || null,
      priceRowIntent: i?.priceRowIntent || null,
      policyRefs: i
        ? Object.fromEntries(
            [
              "transferPolicyCode",
              "rewardSettlementPolicyCode",
              "carbonSettlementPolicyCode",
            ].map((k) => [k, i.policy[k]]),
          )
        : null,
      product: null,
      productReference: null,
      publicationReferences: [],
      eligibility: {
        signedEnterpriseCode:
          request.authData.entCode || request.authData.enterpriseCode,
        requiredEnterpriseCode,
        canAuthor: false,
        blockerCode,
      },
      actions: ["READ_DETAILS"],
    };
  },
  /** Projects only fixed module-owned view copy; optional authoring copy never supplies authorization or execution authority. */
  describe: function (request) {
    this.pin(request);
    if (Object.keys(request.query || {}).length) this.fail("PROOF_REQUIRED");
    const view =
      CONFIG.get("waste")?.listingWorkspace?.views?.["ewaste.listingRequests"];
    const labels = [
      "title",
      "refresh",
      "loading",
      "empty",
      "unavailable",
      "details",
      "close",
      "previous",
      "next",
      "page",
      "asset",
      "name",
      "status",
      "rewardPrice",
      "signedEnterprise",
      "requiredEnterprise",
      "store",
      "product",
      "priceRow",
      "publication",
      "unknown",
      "readOnly",
      "wrongEnterprise",
      "ownerUnavailable",
      "reconciliationRequired",
      "commandUnavailable",
      "authorProduct",
      "openPublication",
    ];
    const states = [
      "OWNER_INSPECTION_REQUIRED",
      "OWNER_UNAVAILABLE",
      "AWAITING_AUTHORING",
      "AWAITING_PUBLICATION",
      "AWAITING_BINDING",
      "LISTED",
      "RECONCILIATION_REQUIRED",
    ];
    const authoring = [
      "reviewTitle",
      "confirmLabel",
      "cancelLabel",
      "workingLabel",
      "savedMessage",
      "uncertainMessage",
      "inspectLabel",
    ];
    const project = (keys, source) =>
      Object.fromEntries(
        keys.map((key) => {
          const value = source?.[key];
          if (
            typeof value !== "string" ||
            !value.trim() ||
            value.length > 500 ||
            /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
          )
            this.fail("OWNER_UNAVAILABLE");
          return [key, value];
        }),
      );
    if (view?.ownerModule !== "eWaste" || view.mode !== "LISTING_REQUESTS")
      this.fail("OWNER_UNAVAILABLE");
    return {
      contractVersion: 1,
      workspaceCode: "waste.listing",
      viewCode: "ewaste.listingRequests",
      presentation: {
        labels: project(labels, view.labels),
        states: project(states, view.states),
        ...(view.authoring === undefined
          ? {}
          : { authoring: project(authoring, view.authoring) }),
        ...(view.reconciliation === undefined
          ? {}
          : { reconciliation: project([
              "inspectLabel", "withdrawLabel", "reasonLabel", "confirmLabel",
              "cancelLabel", "holdMessage", "uncertainMessage", "unavailableMessage",
            ], view.reconciliation) }),
      },
    };
  },
  /** Returns a versioned Store-scoped queue with authorization applied before generated paging/counting. */
  queue: async function (request) {
    const pin = this.pin(request),
      q = request.query || {},
      check = () => this.check(request, pin);
    if (Object.keys(q).some((k) => !["page", "limit"].includes(k)))
      this.fail("PROOF_REQUIRED");
    const page = q.page === undefined ? 1 : Number(q.page),
      limit = q.limit === undefined ? pin.policy.pageSize : Number(q.limit);
    if (
      ![page, limit, pin.policy.maximumPageSize].every(Number.isSafeInteger) ||
      page < 1 ||
      page > 10000 ||
      limit < 1 ||
      limit > pin.policy.maximumPageSize ||
      pin.policy.maximumPageSize > 100 ||
      ["page", "limit"].some(
        (k) => q[k] !== undefined && !/^[1-9]\d*$/.test(String(q[k])),
      )
    )
      this.fail("PROOF_REQUIRED");
    const scope = await this.readScope(request, pin);
    check();
    const result = await this.rows(
      request,
      "wasteAsset",
      {
        $and: [
          scope.query,
          {
            active: true,
            assetStatus: { $in: ["LISTING_REQUESTED", "LISTED"] },
            "metadata.listingCommand": { $exists: true },
          },
        ],
      },
      page,
      limit,
      check,
    );
    return {
      contractVersion: 1,
      items: result.items.map((asset) => this.dto(request, asset, scope)),
      total: result.total,
      page,
      limit,
    };
  },
  /** Resolves one same-identity detail and independent Product source evidence; absence is qualified only by that owner. */
  detail: async function (request) {
    const pin = this.pin(request),
      check = () => this.check(request, pin);
    if (
      !this.identifier(request.code) ||
      Object.keys(request.query || {}).length
    )
      this.fail("PROOF_REQUIRED");
    const scope = await this.readScope(request, pin),
      result = await this.rows(
        request,
        "wasteAsset",
        {
          $and: [
            scope.query,
            {
              code: request.code,
              active: true,
              assetStatus: { $in: ["LISTING_REQUESTED", "LISTED"] },
            },
          ],
        },
        1,
        2,
        check,
      );
    if (result.total !== 1) this.fail("FORBIDDEN");
    const asset = result.items[0],
      dto = this.dto(request, asset, scope);
    if (
      !dto.intentDigest ||
      dto.eligibility.blockerCode ||
      asset.assetStatus === "LISTED"
    )
      return dto;
    let evidence;
    try {
      evidence = await this.sourceEvidence(
        request,
        this.proofSelectors(dto),
        check,
      );
    } catch (_) {
      check();
      return {
        ...dto,
        state: "OWNER_UNAVAILABLE",
        eligibility: {
          ...dto.eligibility,
          canAuthor: false,
          blockerCode: "ERR_EWASTE_LISTING_OWNER_UNAVAILABLE",
        },
      };
    }
    const after = await this.rows(
      request,
      "wasteAsset",
      { code: asset.code, active: true },
      1,
      2,
      check,
    );
    if (after.total !== 1 || !isDeepStrictEqual(after.items[0], asset))
      this.fail("PROOF_REQUIRED");
    if (
      evidence.product &&
      (evidence.product.catalogVersion !==
        dto.authoringContext.catalogVersion ||
        !isDeepStrictEqual(
          [...evidence.product.locales].sort(),
          [...dto.authoringContext.locales].sort(),
        ))
    )
      this.fail("PROOF_REQUIRED");
    return {
      ...dto,
      product: evidence.product,
      productReference: evidence.productReference,
      publicationReferences: evidence.publicationReferences,
      state: evidence.product ? "AWAITING_PUBLICATION" : "AWAITING_AUTHORING",
      eligibility: { ...dto.eligibility, canAuthor: !evidence.product },
      actions: evidence.product
        ? ["READ_DETAILS", "OPEN_PUBLICATION_WORKFLOW"]
        : ["READ_DETAILS", "AUTHOR_PRODUCT_SOURCE"],
    };
  },
  /** Extracts only the exact proof selectors from a freshly read request DTO. */
  proofSelectors: function (dto) {
    return {
      contractVersion: 1,
      assetCode: dto.assetCode,
      listingKey: dto.listingKey,
      expectedRevision: dto.assetRevision,
      intentDigest: dto.intentDigest,
      storeCode: dto.storeContext.code,
    };
  },
  /** Independently resolves the original immutable Product graph; caller DTOs never qualify source evidence. */
  sourceEvidence: async function (request, selectors, check) {
    const value = await this.ownerRead(
      request,
      "commerceStaged",
      "product",
      "/internal/products/listings/source-evidence",
      selectors,
      check,
    );
    if (
      ["assetCode", "listingKey", "intentDigest", "storeCode"].some(
        (k) => value[k] !== selectors[k],
      ) ||
      (value.product !== null &&
        (!value.product ||
          ["productCode", "variantCode", "sku", "catalogVersion"].some(
            (k) => !this.identifier(value.product[k]),
          ) ||
          !Number.isSafeInteger(value.product.versionId) ||
          value.product.versionId < 0 ||
          !Array.isArray(value.product.locales) ||
          !value.product.locales.length ||
          value.product.locales.length > 20 ||
          new Set(value.product.locales).size !==
            value.product.locales.length ||
          value.product.locales.some(
            (locale) =>
              typeof locale !== "string" ||
              !/^[A-Za-z0-9_-]{1,32}$/.test(locale),
          )))
    )
      this.fail("OWNER_UNAVAILABLE");
    const product =
      value.product &&
      Object.fromEntries(
        [
          "productCode",
          "variantCode",
          "sku",
          "catalogVersion",
          "locales",
          "versionId",
        ].map((k) => [k, value.product[k]]),
      );
    let productReference = null;
    if (
      value.productReference !== null &&
      value.productReference !== undefined
    ) {
      const p = value.productReference;
      if (
        !product ||
        ["publicationCode", "productCode", "storeCode"].some(
          (k) => !this.identifier(p[k]),
        ) ||
        p.productCode !== product.productCode ||
        p.storeCode !== selectors.storeCode ||
        typeof p.sourceVersion !== "string" ||
        !/^(0|[1-9]\d*)$/.test(p.sourceVersion) ||
        !Number.isSafeInteger(Number(p.sourceVersion)) ||
        p.sourceVersion !== String(product.versionId) ||
        !/^[a-f0-9]{64}$/.test(p.targetVersion || "")
      )
        this.fail("OWNER_UNAVAILABLE");
      productReference = Object.fromEntries(
        [
          "publicationCode",
          "productCode",
          "storeCode",
          "sourceVersion",
          "targetVersion",
        ].map((k) => [k, p[k]]),
      );
    }
    if (
      !Array.isArray(value.publicationReferences) ||
      value.publicationReferences.length > 20
    )
      this.fail("OWNER_UNAVAILABLE");
    const publicationReferences = value.publicationReferences.map((ref) => {
      if (
        !ref ||
        !["product", "pricing"].includes(ref.domain) ||
        !this.identifier(ref.code) ||
        ![
          "DRAFT",
          "SUBMITTED",
          "APPROVED",
          "REJECTED",
          "PUBLISHED",
          "ACTIVE",
          "RETIRED",
          "STAGED",
          "VALIDATING",
          "VALIDATED",
          "PENDING_APPROVAL",
          "APPROVAL_PENDING",
          "ACTIVATING",
          "ONLINE",
          "FAILED",
          "ROLLING_BACK",
          "ROLLED_BACK",
          "WITHDRAWING",
          "WITHDRAWN",
        ].includes(ref.state) ||
        (ref.processCode !== undefined && !this.identifier(ref.processCode))
      )
        this.fail("OWNER_UNAVAILABLE");
      return {
        domain: ref.domain,
        code: ref.code,
        state: ref.state,
        ...(ref.processCode ? { processCode: ref.processCode } : {}),
      };
    });
    if (
      new Set(publicationReferences.map((ref) => ref.domain + ":" + ref.code))
        .size !== publicationReferences.length ||
      (!product && (productReference || publicationReferences.length))
    )
      this.fail("OWNER_UNAVAILABLE");
    return { product, productReference, publicationReferences };
  },
};
