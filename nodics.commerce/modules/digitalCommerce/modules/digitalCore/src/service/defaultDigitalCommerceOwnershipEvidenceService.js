/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const admissions = new WeakMap();
/** @module digitalCore/service/defaultDigitalCommerceOwnershipEvidenceService
 * @description Protected exact ownership evidence and domain-reviewed binding admission; owns no sale, refund or wallet state.
 * @layer service @owner digitalCore
 * @override Preserve approved signed deployment, private provenance, fixed owner queries and original caller claims.
 */
const owner = {
  /**
   * Refuses invalid ownership evidence or binding admission without changing state.
   * @returns {never} Always throws ERR_DIGITAL_OWNERSHIP_EVIDENCE.
   */
  fail: function () { throw new CLASSES.NodicsError("ERR_DIGITAL_OWNERSHIP_EVIDENCE"); },
  /**
   * Checks the bounded identifier syntax accepted by ownership commands.
   * @param {*} value Candidate identifier; never coerced or mutated.
   * @returns {boolean} Whether the value matches the allowed 1..192-character syntax.
   */
  identifier: function (value) { return typeof value === "string" && /^[A-Za-z0-9_.:@|\-]{1,192}$/.test(value); },
  /**
   * Hashes the value's JSON serialization for deterministic binding identity.
   * @param {*} value JSON-serializable identity material; not mutated.
   * @returns {string} SHA-256 hexadecimal digest; serialization/hash errors propagate.
   */
  digest: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /** Admits only an explicitly approved scoped runtime, never a generic service group or request-selected owner. */
  authorize: function (request, input) {
    const policy = CONFIG.get("digitalCore")?.ownershipEvidence;
    if (policy?.enabled !== true || CONFIG.get("runtimeRole")?.code !== policy.runtimeRole ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true) this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "digitalCore");
    const permission = input?.kind === "ADMIT_BINDING" ? "commerce.product.publish" : "commerce.digital.own.read";
    if (auth !== request.authData || auth.principalType !== "service" || auth.isSystem ||
        !auth.permissions?.includes(permission) || !this.identifier(auth.tenant) || !this.identifier(auth.entCode) ||
        auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode ||
        [request.tenantCode, auth.tenantCode, request.httpRequest?.headers?.tenant, request.httpRequest?.headers?.["x-tenant-code"]]
          .some(value => value !== undefined && value !== auth.tenant) ||
        !input || input.contractVersion !== 1 || !this.identifier(input.enterpriseCode) ||
        [request.enterpriseCode, request.entCode, request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== auth.entCode)) this.fail();
    const grants = (Array.isArray(policy.callers) ? policy.callers : []).filter(grant =>
      grant.tenant === auth.tenant && grant.principalEnterpriseCode === auth.entCode && grant.enterpriseCode === input.enterpriseCode &&
      grant.serviceId === auth.serviceId && Array.isArray(grant.kinds) && grant.kinds.includes(input.kind) &&
      ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(key =>
        this.identifier(grant[key]) && grant[key] === auth.runtimeScope?.[key]) &&
      grant.instanceCode === auth.runtimeInstanceId && grant.environmentCode === NODICS.getSelectedEnvironmentName());
    if (grants.length !== 1) this.fail();
    const context = { tenant: auth.tenant, enterpriseCode: input.enterpriseCode, input: structuredClone(input) };
    admissions.set(context, { auth: structuredClone(auth), request, policy: structuredClone(policy), input: structuredClone(input) });
    return context;
  },
  /** Rejects copied contexts and mid-operation identity/deployment policy drift before every owner read/write. */
  admitted: function (context) {
    const proof = admissions.get(context);
    if (!proof || !isDeepStrictEqual(proof.request.authData, proof.auth) ||
        [proof.request.enterpriseCode, proof.request.entCode, proof.request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== proof.auth.entCode) ||
        !isDeepStrictEqual(CONFIG.get("digitalCore")?.ownershipEvidence, proof.policy) || !isDeepStrictEqual(context.input, proof.input) ||
        CONFIG.get("runtimeRole")?.code !== proof.policy.runtimeRole ||
        NODICS.getSelectedEnvironmentName() !== proof.auth.runtimeScope.environmentCode ||
        SERVICE.DefaultLoggerService.hasPrivateCaptureProtection(proof.request) !== true ||
        context.tenant !== proof.auth.tenant || context.enterpriseCode !== context.input.enterpriseCode) this.fail();
    return proof;
  },
  /** Fixed generated reads use canonical persistence only after signed private admission; no auth mutation escapes this owner. */
  rows: async function (context, name, query, maximum = 1, requireCount = false) {
    this.admitted(context);
    if (typeof SERVICE[name]?.get !== "function" || typeof SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData !== "function") this.fail();
    const fixed = { ...query, tenant: context.tenant };
    const result = await SERVICE[name].get({ tenant: context.tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), query: fixed,
      options: { recursive: false, skipItemCache: true }, searchOptions: { limit: maximum + 1, pageSize: maximum + 1, pageNumber: 1 } });
    this.admitted(context);
    if (!/^SUC_/.test(result?.code || "") || result.success === false || result.acknowledged === false || result.error ||
        result.errors && (!Array.isArray(result.errors) || result.errors.length) || !Array.isArray(result.result) ||
        result.result.length > maximum || requireCount && result.count !== result.result.length ||
        [result.count, result.total, result.totalCount].some(value =>
          value !== undefined && (!Number.isSafeInteger(value) || value !== result.result.length)) ||
        result.result.some(row => !row || !this.identifier(row.code) || !Object.entries(fixed).every(([key, value]) => row[key] === value))) this.fail();
    return structuredClone(result.result);
  },
  /**
   * Reads exactly one active generated-owner row under private admitted scope.
   * @param {Object} context Original admitted ownership context.
   * @param {string} name Internally selected generated service name.
   * @param {Object} query Fixed owner selectors; no writes are performed.
   * @returns {Promise<Object>} Detached active row; rejects missing, ambiguous or invalid reads.
   */
  one: async function (context, name, query) {
    const rows = await this.rows(context, name, query);
    if (rows.length !== 1 || rows[0].active !== true) this.fail();
    return rows[0];
  },
  /** Only listed fields/selectors enter each command; caller query operators, services and persistence records are prohibited. */
  fields: function (input, names) {
    if (Object.keys(input).sort().join() !== ["contractVersion", "kind", "enterpriseCode", ...names].sort().join() ||
        names.some(key => key !== "locales" && !this.identifier(input[key]))) this.fail();
  },
  /** Uses Product's serving-scope validator and exact generated pointer read; never enters publication activation or Staged versions. */
  pointer: async function (context, scope) {
    const target = SERVICE.DefaultProductPublicationTargetService;
    if (typeof target?.assertOnline !== "function" || typeof target.scopeCode !== "function") this.fail();
    target.assertOnline();
    const code = target.scopeCode(scope, { tenant: context.tenant });
    const pointer = await this.one(context, "DefaultProductPublicationPointerService", { code });
    if (!/^[a-f0-9]{64}$/.test(pointer.version || "") || !Number.isSafeInteger(pointer.revision) || pointer.revision < 1 ||
        pointer.productCode !== scope.productCode || pointer.storeCode !== scope.storeCode) this.fail();
    return { version: pointer.version, revision: pointer.revision, receipt: null, scope: structuredClone(scope) };
  },
  /** Validates one canonical Store and the serving Product pointer, not mutable catalogue labels. */
  listing: async function (context, input) {
    const scope = { tenant: context.tenant, enterpriseCode: context.enterpriseCode };
    const store = await this.one(context, "DefaultStoreService", { code: input.storeCode });
    const ref = store.enterpriseRef;
    if (store.status !== "ACTIVE" || !Number.isSafeInteger(store.revision) || store.revision < 1 ||
        (typeof ref === "string" ? ref : ref?.code) !== context.enterpriseCode ||
        typeof ref === "object" && ([ref.module, ref.moduleName].some(value => value !== undefined && value !== "profile") ||
          [ref.schema, ref.schemaName].some(value => value !== undefined && value !== "enterprise"))) this.fail();
    if (!Array.isArray(input.locales) || !input.locales.length || input.locales.length > 20 ||
        new Set(input.locales).size !== input.locales.length || input.locales.some(locale => !this.identifier(locale))) this.fail();
    const productScope = { tenant: context.tenant, productCode: input.productCode, storeCode: input.storeCode };
    const before = await this.pointer(context, productScope);
    if (!/^[a-f0-9]{64}$/.test(before?.version || "") || !Number.isSafeInteger(before.revision) || before.revision < 1 ||
        !isDeepStrictEqual(before.scope, productScope)) this.fail();
    const products = [], retainedProducts = [];
    for (const locale of input.locales.slice().sort()) {
      const product = await this.one(context, "DefaultProductSearchProjectionService", { ...scope,
        productCode: input.productCode, storeCode: input.storeCode, locale, publicationVersion: before.version });
      const payload = product.payload, attributes = payload?.localizedAttributes;
      if (!["CURRENT", "STALE"].includes(product.status) || !/^[a-f0-9]{64}$/.test(product.sourceHash || "") ||
          payload?.variantCodes?.length !== 1 || payload.variantCodes[0] !== input.variantCode ||
          payload.variantSkuMap?.[input.variantCode] !== input.sku || attributes?.assetCode !== input.assetCode ||
          attributes.productType !== "DIGITAL" || attributes.inventoryStrategy !== "DIGITAL_COMMERCE" ||
          attributes.digitalDeliveryType !== "DIGITAL_OWNERSHIP") this.fail();
      products.push(product);
      retainedProducts.push({ locale, code: product.code, sourceHash: product.sourceHash, publicationVersion: product.publicationVersion });
    }
    const after = await this.pointer(context, productScope);
    this.admitted(context);
    if (before.version !== after?.version || before.revision !== after.revision || !isDeepStrictEqual(after.scope, productScope)) this.fail();
    return { store, publication: before, products, retainedProducts };
  },
  /** Reads genuine retained binding and original locale pins; historical purchases remain inspectable after later publication. */
  binding: async function (context) {
    const p = context.input, scope = { tenant: context.tenant, enterpriseCode: context.enterpriseCode };
    const binding = await this.one(context, "DefaultDigitalProductBindingService", { ...scope, code: p.bindingCode,
      productCode: p.productCode, sku: p.sku, status: "ACTIVE" });
    const ref = binding.providerReference, pins = binding.evidence?.retainedProducts;
    if (!this.identifier(binding.variantCode) || !Number.isSafeInteger(binding.revision) || binding.revision < 0 ||
        binding.providerOwner !== "wasteCore" || binding.digitalDeliveryType !== "DIGITAL_OWNERSHIP" ||
        binding.inventoryStrategy !== "DIGITAL_COMMERCE" || ref?.storeCode !== p.storeCode ||
        !["assetCode", "projectionCode", "transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode"].every(key => this.identifier(ref[key])) ||
        ref.sellerRef?.module !== "profile" || ref.sellerRef.schema !== "customer" || !this.identifier(ref.sellerRef.code) ||
        !Array.isArray(pins) || !pins.length || pins.length > 20 || new Set(pins.map(pin => pin?.locale)).size !== pins.length ||
        pins.some(pin => !this.identifier(pin?.locale) || !this.identifier(pin.code) || !/^[a-f0-9]{64}$/.test(pin.sourceHash || "") ||
          !/^[a-f0-9]{64}$/.test(pin.publicationVersion || ""))) this.fail();
    const pin = pins.find(row => row.locale === p.locale);
    if (!pin || !this.identifier(pin.code) || !/^[a-f0-9]{64}$/.test(pin.sourceHash || "") || !/^[a-f0-9]{64}$/.test(pin.publicationVersion || "")) this.fail();
    const product = await this.one(context, "DefaultProductSearchProjectionService", { ...scope, code: pin.code,
      productCode: p.productCode, storeCode: p.storeCode, locale: p.locale });
    const attributes = product.payload?.localizedAttributes;
    if (!["CURRENT", "STALE"].includes(product.status) || product.sourceHash !== pin.sourceHash || product.publicationVersion !== pin.publicationVersion ||
        product.payload?.variantCodes?.length !== 1 || product.payload.variantCodes[0] !== binding.variantCode ||
        product.payload?.variantSkuMap?.[binding.variantCode] !== p.sku || attributes?.assetCode !== ref.assetCode ||
        attributes.productType !== "DIGITAL" || attributes.inventoryStrategy !== "DIGITAL_COMMERCE" || attributes.digitalDeliveryType !== "DIGITAL_OWNERSHIP") this.fail();
    const store = await this.one(context, "DefaultStoreService", { code: p.storeCode });
    const enterpriseRef = store.enterpriseRef;
    if (store.status !== "ACTIVE" || !Number.isSafeInteger(store.revision) || store.revision < 1 ||
        (typeof enterpriseRef === "string" ? enterpriseRef : enterpriseRef?.code) !== context.enterpriseCode ||
        typeof enterpriseRef === "object" && ([enterpriseRef.module, enterpriseRef.moduleName].some(value => value !== undefined && value !== "profile") ||
          [enterpriseRef.schema, enterpriseRef.schemaName].some(value => value !== undefined && value !== "enterprise"))) this.fail();
    return { binding, product, store };
  },
  /** Returns scoped persisted evidence only; incomplete or pending rows never assert captured payment or approved refund. */
  query: async function (request, input) {
    const context = this.authorize(request, input), p = context.input;
    const common = ["bindingCode", "productCode", "sku", "storeCode", "locale"];
    const purchase = ["ownerId", "orderCode", "entryCode", "checkoutIdempotencyKey", "providerCode"];
    if (p.kind === "LISTING") {
      this.fields(p, ["productCode", "variantCode", "sku", "storeCode", "assetCode", "locales"]);
      return { contractVersion: 1, kind: p.kind, ...await this.listing(context, p) };
    }
    if (!["BINDING", "PURCHASE", "REFUND"].includes(p.kind)) this.fail();
    this.fields(p, [...common, ...(p.kind !== "BINDING" ? purchase : []), ...(p.kind === "REFUND" ? ["entitlementCode", "refundCode"] : [])]);
    const result = { contractVersion: 1, kind: p.kind, ...await this.binding(context) };
    if (p.kind === "BINDING") return result;
    const scope = { tenant: context.tenant, enterpriseCode: context.enterpriseCode, ownerId: p.ownerId };
    const orders = await this.rows(context, "DefaultCommerceOrderService", { ...scope, code: p.orderCode });
    const entries = await this.rows(context, "DefaultCommerceOrderEntryService", { ...scope, orderCode: p.orderCode }, 2);
    if (orders.some(row => row.idempotencyKey !== p.checkoutIdempotencyKey || row.evidence?.storeCode !== p.storeCode) ||
        entries.some(row => row.code !== p.orderCode + ":" + p.entryCode || row.productCode !== p.productCode || row.sku !== p.sku ||
          String(row.quantity) !== "1" || row.idempotencyKey !== p.checkoutIdempotencyKey + ":order-entry:" + p.entryCode ||
          !row.evidence?.digitalReservationCodes?.includes(p.providerCode)) || entries.length > 1) this.fail();
    // Compensation checkpoints intentionally omit enterprise/order columns; their retained intent supplies both exact coordinates.
    const checkpoints = await this.rows(context, "DefaultCheckoutCheckpointService", { ownerId: p.ownerId, code: p.checkoutIdempotencyKey,
      idempotencyKey: p.checkoutIdempotencyKey });
    for (const row of checkpoints) {
      const intent = row.evidence?.paymentCompensationIntent;
      if (row.enterpriseCode !== undefined && row.enterpriseCode !== context.enterpriseCode ||
          row.orderCode !== undefined && row.orderCode !== p.orderCode ||
          row.status === "COMPLETED" && (row.evidence?.orderCode !== p.orderCode || !row.evidence?.digitalReservationCodes?.includes(p.providerCode)) ||
          row.status !== "COMPLETED" && (!["COMPENSATED", "COMPENSATION_REQUIRED"].includes(row.status) ||
            !intent || intent.tenant !== context.tenant || intent.enterpriseCode !== context.enterpriseCode || intent.ownerId !== p.ownerId ||
            intent.orderCode !== p.orderCode || !this.identifier(intent.cartCode) ||
            !row.evidence?.compensation?.some(value => value.type === "DIGITAL_OWNERSHIP_RELEASE" && value.code === p.providerCode))) this.fail();
    }
    if (orders.length !== entries.length || !orders.length && !checkpoints.length) this.fail();
    const cartCode = orders[0]?.cartCode || checkpoints[0]?.evidence?.paymentCompensationIntent?.cartCode;
    if (!this.identifier(cartCode) || checkpoints.some(row =>
      (row.cartCode || row.evidence?.paymentCompensationIntent?.cartCode) !== cartCode)) this.fail();
    const payments = await this.rows(context, "DefaultPaymentTransactionEntryService", { ...scope, orderCode: p.orderCode, cartCode }, 8);
    if (payments.some(row => !["AUTHORIZE", "CAPTURE", "VOID", "REFUND"].includes(row.evidence?.operation))) this.fail();
    Object.assign(result, { orders, entries, payments, checkpoints });
    if (p.kind === "PURCHASE" && checkpoints.some(row => ["COMPENSATED", "COMPENSATION_REQUIRED"].includes(row.status))) {
      const entitlements = await this.rows(context, "DefaultDigitalEntitlementService", { ...scope, orderCode: p.orderCode }, 1, true);
      if (entitlements.some(row => row.providerOwner !== "wasteCore" || row.providerCode !== p.providerCode ||
          row.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || row.productCode !== p.productCode || row.sku !== p.sku ||
          row.orderEntryCode !== p.entryCode || row.evidence?.bindingCode !== p.bindingCode ||
          row.evidence?.assetCode !== result.binding.providerReference.assetCode)) this.fail();
      result.entitlements = entitlements;
    }
    if (p.kind === "REFUND") {
      const entitlement = await this.one(context, "DefaultDigitalEntitlementService", { ...scope, code: p.entitlementCode, orderCode: p.orderCode });
      if (orders.length !== 1 || entries.length !== 1 || entitlement.productCode !== p.productCode || entitlement.sku !== p.sku ||
          entitlement.providerOwner !== "wasteCore" || entitlement.providerCode !== p.providerCode ||
          entitlement.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || entitlement.orderEntryCode !== p.entryCode ||
          entitlement.evidence?.bindingCode !== p.bindingCode || entitlement.evidence?.assetCode !== result.binding.providerReference.assetCode) this.fail();
      const refunds = await this.rows(context, "DefaultOrderLifecycleRequestService", { ...scope, code: p.refundCode, orderCode: p.orderCode, requestType: "REFUND" });
      const refund = refunds[0], caseCode = refund?.evidence?.caseCode;
      const transactionCode = refund?.evidence?.steps?.PAYMENT?.transactionCode;
      if (caseCode !== undefined && !this.identifier(caseCode) || transactionCode !== undefined && !this.identifier(transactionCode)) this.fail();
      const cases = caseCode ? await this.rows(context, "DefaultOrderLifecycleRequestService", { ...scope, code: caseCode, orderCode: p.orderCode, requestType: "DISPUTE" }) : [];
      const transactions = transactionCode ? await this.rows(context, "DefaultPaymentTransactionService", { ...scope, code: transactionCode, orderCode: p.orderCode }) : [];
      Object.assign(result, { entitlement, refunds, cases, transactions });
    }
    this.admitted(context);
    return result;
  },
  /** Admits one deterministic binding only from a freshly re-fetched configured domain plan and current Product pins. */
  admitBinding: async function (request, input) {
    const context = this.authorize(request, input), p = context.input, policy = admissions.get(context).policy;
    if (p.kind !== "ADMIT_BINDING" || Object.keys(p).sort().join() !== ["contractVersion", "kind", "enterpriseCode", "selectors", "reviewedPlanDigest"].sort().join() ||
        !/^[a-f0-9]{64}$/.test(p.reviewedPlanDigest || "") || !p.selectors || typeof p.selectors !== "object" || Array.isArray(p.selectors)) this.fail();
    const selectorNames = ["assetCode", "productCode", "variantCode", "sku", "storeCode", "transferPolicyCode", "rewardSettlementPolicyCode",
      "carbonSettlementPolicyCode", "idempotencyKey", "locales", "expectedAssetRevision"];
    if (!isDeepStrictEqual(Object.keys(p.selectors).sort(), selectorNames.sort()) ||
        selectorNames.some(key => !["locales", "expectedAssetRevision"].includes(key) && !this.identifier(p.selectors[key])) ||
        !Number.isSafeInteger(p.selectors.expectedAssetRevision) || p.selectors.expectedAssetRevision < 0 ||
        !Array.isArray(p.selectors.locales) || !p.selectors.locales.length || p.selectors.locales.length > 20 ||
        p.selectors.locales.some(value => !this.identifier(value)) || new Set(p.selectors.locales).size !== p.selectors.locales.length) this.fail();
    const owner = policy.bindingAdmission;
    const authority = owner?.targetAuthority;
    const exactAuthority = typeof authority === "string" ? this.identifier(authority) :
      authority && typeof authority === "object" && !Array.isArray(authority) &&
      this.identifier(authority.server) && this.identifier(authority.runtimeRole?.code) &&
      authority.runtimeRole.publication === "OPERATIONAL" &&
      Object.keys(authority).every(key => ["server", "runtimeRole", "environment"].includes(key)) &&
      Object.keys(authority.runtimeRole).sort().join() === "code,publication" &&
      (authority.environment === undefined || this.identifier(authority.environment));
    if (owner?.enabled !== true || !exactAuthority || !["moduleName", "connectionName", "apiName"].every(key => typeof owner[key] === "string" && owner[key]) ||
        !owner.apiName.startsWith("/internal/")) this.fail();
    let plan = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: owner.moduleName, connectionName: owner.connectionName,
      targetAuthority: owner.targetAuthority, apiName: owner.apiName, methodName: "POST", tenant: context.tenant,
      request: { tenant: context.tenant }, requestBody: { ...structuredClone(p.selectors), enterpriseCode: context.enterpriseCode },
      timeoutMs: 15000, maxAttempts: 1 });
    for (let depth = 0; depth < 6 && plan; depth++) {
      if (plan.error || plan.success === false || plan.acknowledged === false || /^ERR_/.test(plan.code || "") ||
          plan.errors && (!Array.isArray(plan.errors) || plan.errors.length)) this.fail();
      if (plan.data !== undefined) plan = plan.data;
      else if (plan.result !== undefined) plan = plan.result;
      else break;
    }
    this.admitted(context);
    const ref = plan?.providerReference;
    if (plan?.state !== "READ_ONLY_DOMAIN_LISTING_PLAN" || plan.planDigest !== p.reviewedPlanDigest || plan.expectedAssetRevision !== p.selectors.expectedAssetRevision ||
        plan.providerOwner !== "wasteCore" || plan.digitalDeliveryType !== "DIGITAL_OWNERSHIP" || plan.inventoryStrategy !== "DIGITAL_COMMERCE" ||
        !["productCode", "variantCode", "sku"].every(key => this.identifier(plan[key]) && plan[key] === p.selectors[key]) ||
        !ref || ["assetCode", "storeCode", "transferPolicyCode", "rewardSettlementPolicyCode", "carbonSettlementPolicyCode"].some(key =>
          !this.identifier(ref[key]) || ref[key] !== p.selectors[key]) || !this.identifier(ref.projectionCode) ||
        ref.sellerRef?.module !== "profile" || ref.sellerRef.schema !== "customer" || !this.identifier(ref.sellerRef.code)) this.fail();
    const current = await this.listing(context, { ...plan, ...ref, locales: p.selectors.locales });
    if (!isDeepStrictEqual(current.retainedProducts, plan.evidence?.retainedProducts)) this.fail();
    const code = "digitalBinding:" + this.digest([context.tenant, context.enterpriseCode, plan.productCode, plan.variantCode, plan.sku]);
    const model = { code, tenant: context.tenant, enterpriseCode: context.enterpriseCode, productCode: plan.productCode,
      variantCode: plan.variantCode, sku: plan.sku, status: "ACTIVE", active: true, revision: 0,
      digitalDeliveryType: plan.digitalDeliveryType, inventoryStrategy: plan.inventoryStrategy, providerOwner: plan.providerOwner,
      providerReference: structuredClone(ref), correlationId: code, idempotencyKey: code,
      evidence: { retainedProducts: current.retainedProducts, domainPlanDigest: plan.planDigest } };
    const exact = row => row && Number.isSafeInteger(row.revision) && row.revision >= 0 &&
      Object.keys(model).filter(key => key !== "revision").every(key => isDeepStrictEqual(row[key], model[key]));
    const query = { tenant: context.tenant, enterpriseCode: context.enterpriseCode, productCode: model.productCode, variantCode: model.variantCode, sku: model.sku, status: "ACTIVE" };
    let rows = await this.rows(context, "DefaultDigitalProductBindingService", query);
    if (!rows.length) {
      this.admitted(context);
      if (typeof SERVICE.DefaultDigitalProductBindingService.save !== "function") this.fail();
      try { await SERVICE.DefaultDigitalProductBindingService.save({ tenant: context.tenant,
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), model, options: { insertOnly: true } }); } catch (_) { /* Only exact durable readback can resolve a lost response. */ }
      rows = await this.rows(context, "DefaultDigitalProductBindingService", query);
    }
    if (rows.length !== 1 || !exact(rows[0])) this.fail();
    return { contractVersion: 1, state: "BINDING_ADMITTED", binding: rows[0] };
  },
};
// Only fixed capability commands are public. Callers cannot mint a persistence context or choose generated services/queries.
module.exports = {
  /**
   * Reads fixed ownership evidence without approving refunds or changing sale state.
   * @param {Object} request Original private signed deployment request.
   * @param {Object} input Versioned LISTING, BINDING, PURCHASE or REFUND selectors and enterpriseCode.
   * @returns {Promise<Object>} Scoped owner evidence; rejects unauthorized, invalid or failed reads.
   */
  query: function (request, input) { return owner.query(request, input); },
  /**
   * Rechecks the reviewed domain plan and Product pins, then inserts or verifies one exact binding.
   * @param {Object} request Original private signed deployment request.
   * @param {Object} input Versioned ADMIT_BINDING command with enterpriseCode, selectors and reviewedPlanDigest.
   * @returns {Promise<Object>} BINDING_ADMITTED result; rejects unless exact durable readback succeeds.
   */
  admitBinding: function (request, input) { return owner.admitBinding(request, input); },
};
