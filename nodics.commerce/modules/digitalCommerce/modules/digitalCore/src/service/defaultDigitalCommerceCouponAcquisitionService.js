/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual: same } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalCommerceCouponAcquisitionService
 * @description Coordinates coupon consideration and reads canonical acquisition history across original
 * owners.
 * Inputs: Original participant/unit commands, persisted Promotion allocation, private callback grants and
 * bounded reporting selectors.
 * Outputs: Typed admission, exact consideration/completion/failure proofs and stable complete history pages.
 * Effects: Reads owner evidence; reserve/COMMIT/consume/RELEASE flows call existing Promotion/Waste owners,
 * never duplicate their storage.
 * Failure behavior: Uncertain payment, input or history evidence rejects without releasing holds or
 * inventing a usable coupon.
 * Exported members: fail, sourceProof, settings, typedOwner, identifier, rows, one, authorize,
 * authorizeContinuation, allocation, commandForCoupon, certificates, prepare, reserveInputs,
 * certificatePhase, readCertificateEligibility, paymentEnterprise, consideration, completeInputs,
 * completion, purchasedCompletion, failureCheckpoint, released, releaseInputs, failed, reportContext, all,
 * reportSource, reportingEvents.
 * @owner digitalCore
 * @layer service
 * @override Override exported members through module layering; preserve exact original owner/actor/key,
 * private provenance and irreversible direction.
 * @see ../../llm/contracts/coupon-acquisition-source.md
 */
module.exports = {
  /**
   * Rejects uncertain consideration without returning usable coupon authority.
   * @returns {never} Always throws the bounded acquisition-evidence error.
   * @remarks Effects: No I/O or private evidence disclosure.
   * Failure behavior: Throws Coupon acquisition evidence is unconfirmed.
   * @override Do not replace uncertain evidence with permissive defaults.
   */
  fail: function () { throw new Error("Coupon acquisition evidence is unconfirmed"); },
  /**
   * Reads private persisted phase authority for approved domain callbacks; submitted command fields are
   * comparisons, never authority.
   * @param {Object} request Exact private service callback with tenant, runtime/deployment claims and
   * capture-protected identity.
   * @param {Object} input Exact version1
   * phase/merchant/owner/order/entry/product/promotion/key/certificate/requirements comparison command.
   * @returns {Promise<Object>} Version1 allowed:true proof containing the immutable canonical command.
   * @remarks Effects: Reads persisted allocation/coupon and consideration or failure evidence; double-checks
   * authority/config/records, no certificate mutation.
   * Failure behavior: Rejects missing grant/privacy, submitted-command mismatch, stale
   * reserve/COMMIT/RELEASE state or evidence drift.
   * @override Runtime grants admit reads only; buyer actor/financial authority comes from original persisted
   * evidence, not callback fields.
   */
  sourceProof: async function (request, input) {
    const policy = structuredClone(CONFIG.get("digitalCore")?.couponAcquisition?.sourceProof);
    const role = CONFIG.get("runtimeRole"), logger = SERVICE.DefaultLoggerService;
    if (policy?.enabled !== true || (role?.code || role) !== policy.runtimeRole ||
        logger?.hasPrivateCaptureProtection?.(request) !== true ||
        !input || Object.keys(input).sort().join(",") !== "certificateCodes,contractVersion,enterpriseCode,entryCode,idempotencyKey,operationKey,orderCode,ownerId,ownerRef,phase,productCode,promotionCode,requirements" ||
        input.contractVersion !== 1 || input.idempotencyKey !== input.operationKey ||
        !["reserve", "consume", "release"].includes(input.phase)) this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "digitalCore");
    const principalEnterprise = auth.entCode || auth.enterpriseCode;
    if (auth !== request.authData || auth.principalType !== "service" || auth.isSystem || auth.tenant !== request.tenant ||
        !auth.permissions?.includes("commerce.digital.own.read") ||
        [request.enterpriseCode, request.entCode, auth.entCode, auth.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(v => v !== undefined && v !== principalEnterprise) ||
        [request.tenantCode, auth.tenantCode, request.httpRequest?.headers?.["x-tenant-code"]].some(v => v !== undefined && v !== auth.tenant)) this.fail();
    this.identifier(principalEnterprise); this.identifier(input.operationKey); this.identifier(input.orderCode);
    const before = structuredClone({ auth, input, tenant: request.tenant, enterpriseCode: request.enterpriseCode, entCode: request.entCode,
      headers: request.httpRequest?.headers, tenantCode: request.tenantCode });
    const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
    const row = await persistence.acquisitionByCommand(request, input.operationKey, input.orderCode);
    const identity = row.evidence?.identity;
    const grants = (Array.isArray(policy.callers) ? policy.callers : []).filter(g =>
      g.tenant === auth.tenant && g.principalEnterpriseCode === principalEnterprise && g.enterpriseCode === row.enterpriseCode &&
      g.serviceId === auth.serviceId && Array.isArray(g.phases) && g.phases.includes(input.phase) &&
      ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(k =>
        typeof g[k] === "string" && g[k] && g[k] === auth.runtimeScope?.[k]) &&
      g.instanceCode === auth.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
    if (grants.length !== 1 || !identity || input.enterpriseCode !== row.enterpriseCode) this.fail();
    const coupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon({ tenant: request.tenant, enterpriseCode: row.enterpriseCode }, row.evidence.couponCode);
    const r = { tenant: request.tenant, enterpriseCode: row.enterpriseCode, ownerId: identity.ownerId, ownerRef: this.typedOwner(identity.ownerRef),
      idempotencyKey: input.operationKey, couponCode: coupon.code,
      payload: { orderCode: input.orderCode, cartCode: coupon.cartCode, entryCode: identity.entryCode,
        productCode: identity.productCode, sku: coupon.sku, certificateCodes: identity.certificateCodes } };
    const a = await this.allocation(r);
    if (!same(a.row, row) || coupon.offerAllocationCode !== row.code || !coupon.protectedToken || !coupon.secureIssuanceCode) this.fail();
    const command = { contractVersion: 1, ownerRef: r.ownerRef, ownerId: identity.ownerId, orderCode: input.orderCode,
      entryCode: identity.entryCode, productCode: identity.productCode, promotionCode: identity.promotionCode,
      operationKey: input.operationKey, certificateCodes: this.certificates(identity.certificateCodes),
      requirements: structuredClone(a.offer.requirements), idempotencyKey: input.operationKey };
    const { enterpriseCode: business, phase, ...submitted } = input;
    if (business !== r.enterpriseCode || !same(command, submitted)) this.fail();
    if (input.phase === "reserve") {
      if (row.evidence.status !== "RESERVED" || row.evidence.inputDisposition === "RELEASE" || coupon.status !== "RESERVED" || coupon.reservedFor !== identity.ownerId ||
          !Number.isFinite(Date.parse(coupon.reservedUntil)) || Date.parse(coupon.reservedUntil) <= Date.now()) this.fail();
    } else if (input.phase === "consume") {
      if (!["RESERVED", "COMPLETED"].includes(row.evidence.status) || row.evidence.inputDisposition !== "COMMIT") this.fail();
      await this.consideration(r, a);
    } else await this.failureCheckpoint(r, a);
    const current = await persistence.read("couponAcquisitionReservation", r, row.code);
    const currentCoupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(r, coupon.code);
    if (!same(current, row) || !same(before, { auth: request.authData, input, tenant: request.tenant,
        enterpriseCode: request.enterpriseCode, entCode: request.entCode, headers: request.httpRequest?.headers, tenantCode: request.tenantCode }) ||
        !same(currentCoupon, coupon) || !same(role, CONFIG.get("runtimeRole")) ||
        !same(policy, CONFIG.get("digitalCore")?.couponAcquisition?.sourceProof) ||
        logger.hasPrivateCaptureProtection(request) !== true || SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "digitalCore") !== request.authData ||
        NODICS.getSelectedEnvironmentName() !== auth.runtimeScope.environmentCode) this.fail();
    return { contractVersion: 1, tenant: r.tenant, enterpriseCode: r.enterpriseCode, phase, command, allowed: true };
  },
  /**
   * Requires complete framework-defined limits; caller values cannot select transports.
   * @returns {Object} Effective couponAcquisition limits, returned by reference after validation.
   * @remarks Effects: Reads config only; does not enable source grants or schedules.
   * Failure behavior: Throws for missing/nonpositive/noninteger limits or hard safety ceiling violations.
   * @override Keep definitions/defaults in Digital and honor valid later-layer narrowing without fallback.
   */
  settings: function () {
    const p = CONFIG.get("digitalCore")?.couponAcquisition;
    if (!p || !["maximumCertificates", "sourcePageSize", "maximumSourcePages", "maximumSnapshotAgeSeconds"].every(k =>
      Number.isSafeInteger(p[k]) && p[k] > 0) || p.maximumCertificates > 1000 || p.sourcePageSize > 1000 ||
      p.maximumSourcePages > 10000 || p.maximumSnapshotAgeSeconds > 3600) this.fail();
    return p;
  },
  /**
   * Normalizes the explicit internal adapter between canonical Profile references and Promotion's typed
   * port.
   * @param {Object} ref Exact Profile {module,schema,code} or Promotion {type,code} Customer/Enterprise
   * reference.
   * @returns {Object} New normalized {type:CUSTOMER|ENTERPRISE, code} reference.
   * @remarks Effects: Pure normalization; no identity lookup/provisioning.
   * Failure behavior: Throws for extra keys, unsupported type/schema or invalid identifier.
   * @override Keep Employee actor distinct from purchasing owner; do not infer an owner from loginId.
   */
  typedOwner: function (ref) {
    if (ref?.module === "profile" && ["customer", "enterprise"].includes(ref.schema) && Object.keys(ref).sort().join(",") === "code,module,schema")
      ref = { type: ref.schema.toUpperCase(), code: ref.code };
    if (!ref || Object.keys(ref).sort().join(",") !== "code,type" || !["CUSTOMER", "ENTERPRISE"].includes(ref.type)) this.fail();
    this.identifier(ref.code);
    return { type: ref.type, code: ref.code };
  },
  /**
   * Accepts bounded opaque identifiers, including canonical Cart entry separators.
   * @param {string} value Opaque original key/code using supported alphanumeric and _.:@|- separators.
   * @returns {string} Unchanged bounded identifier.
   * @remarks Effects: Pure validation.
   * Failure behavior: Throws for non-string, invalid characters or length above256.
   * @override Preserve original opaque key bytes; do not truncate or normalize into another identity.
   */
  identifier: function (value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value)) this.fail();
    return value;
  },
  /**
   * Requires explicit complete generated-owner results and independently checks every fixed selector.
   * @param {string} name Fixed generated owner service selected internally.
   * @param {Object} r Trusted owner read context with tenant; other partition/identity selectors are
   * explicit in query.
   * @param {Object} query Exact persisted selectors; tenant is always bound from r.
   * @param {number} [pageSize=2] Maximum requested rows for one complete envelope page.
   * @param {number} [pageNumber=1] One-based page under stable code ordering.
   * @returns {Promise<Object>} Validated successful envelope with result/count and matching fixed selectors.
   * @remarks Effects: Obtains canonical system read auth and performs uncached generated owner read; no
   * writes.
   * Failure behavior: Rejects missing owner/auth, failed/ambiguous envelopes, counts or foreign result rows.
   * @override Keep tenant selectors, complete count evidence and fixed owners; never expose caller-selected
   * repository authority.
   */
  rows: async function (name, r, query, pageSize = 2, pageNumber = 1) {
    const service = SERVICE[name], identity = SERVICE.DefaultIdentityGovernanceService;
    if (!service?.get || !identity?.getSystemAuthData) this.fail();
    const fixed = { ...query, tenant: r.tenant };
    const response = await service.get({ tenant: r.tenant, authData: await identity.getSystemAuthData(), query: fixed,
      options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize, pageNumber, sort: { code: 1 } } });
    if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false || response.acknowledged === false ||
      response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) || !Array.isArray(response.result) ||
      !Number.isSafeInteger(response.count) || response.count < response.result.length || response.result.length > pageSize ||
      [response.total, response.totalCount].some(n => n !== undefined && n !== response.count)) this.fail();
    for (const row of response.result) {
      if (!row || Object.entries(fixed).some(([key, value]) => !same(key.split(".").reduce((o, k) => o?.[k], row), value))) this.fail();
    }
    return response;
  },
  /**
   * Resolves one exact record, never a successful acknowledgement or partial array.
   * @param {string} name Fixed generated owner service.
   * @param {Object} r Trusted owner read context with tenant; other partition/identity selectors are
   * explicit in query.
   * @param {Object} query Exact original record selectors.
   * @returns {Promise<Object>} The sole matching persisted record.
   * @remarks Effects: Delegates bounded two-row read; no effects.
   * Failure behavior: Rejects zero, duplicate or inconsistent total/row evidence.
   * @override Never select first row from ambiguous history.
   */
  one: async function (name, r, query) {
    const result = await this.rows(name, r, query);
    if (result.count !== 1 || result.result.length !== 1) this.fail();
    return result.result[0];
  },
  /**
   * Reuses current Commerce participant authority and persisted Cart ownership before every acquisition
   * phase.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} Admitted {tenant, ownerRef, ownerId, orderCode}.
   * @remarks Effects: Reuses fresh Cart/Profile admission and retained merchant scope; reads exact
   * Cart/entry, plus continuation proof for closed state.
   * Failure behavior: Rejects changed actor/bearer/context, foreign Cart/entry or unqualified closed-Cart
   * continuation.
   * @override Preserve original signed buyer across merchant storage; authorization does not reserve or
   * consume.
   */
  authorize: async function (r) {
    const original = structuredClone({ authData: r.authData, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      participantEnterpriseCode: r.participantEnterpriseCode, authorization: r.authorization,
      ownerId: r.ownerId, ownerRef: r.ownerRef, actorRef: r.actorRef, payload: r.payload, idempotencyKey: r.idempotencyKey });
    const ownerRef = this.typedOwner(r.ownerRef), resolver = FACADE.DefaultCartCustomerFacade;
    if (!resolver?.resolveContext) this.fail();
    const participant = r.authData?.enterpriseCode || r.authData?.entCode;
    const crossMerchant = r.enterpriseCode !== participant;
    if (crossMerchant && r.participantEnterpriseCode !== participant) this.fail();
    const admitted = await resolver.resolveContext(crossMerchant ? { ...r, enterpriseCode: participant } : r, "commerce.checkout.place");
    const context = crossMerchant ? await SERVICE.DefaultCartMerchantScopeService.retained(admitted) : admitted;
    if (context.tenant !== r.tenant || context.enterpriseCode !== r.enterpriseCode || context.ownerId !== r.ownerId ||
      !same(this.typedOwner(context.ownerRef), ownerRef)) this.fail();
    for (const v of [r.tenant, r.enterpriseCode, r.ownerId, r.payload?.orderCode, r.payload?.cartCode, r.idempotencyKey]) this.identifier(v);
    const cart = await this.one("DefaultCartService", r, { code: r.payload.cartCode, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId });
    if (!["ACTIVE", "CALCULATED", "PLACEMENT_PENDING", "PLACED"].includes(cart.status) ||
      !same(this.typedOwner(cart.ownerRef), ownerRef) || crossMerchant && cart.participantEnterpriseCode !== participant) this.fail();
    this.identifier(cart.channelCode);
    let closed = cart.active !== true;
    if (closed && (cart.active !== false || cart.status !== "PLACED")) this.fail();
    if (r.payload.entryCode !== undefined) {
      const entry = await this.one("DefaultCartEntryService", r, { code: this.identifier(r.payload.entryCode),
        cartCode: cart.code, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId });
      if (!(entry.active === true && entry.status === "ACTIVE" || entry.active === false && entry.status === "REMOVED") || entry.productCode !== r.payload.productCode ||
        entry.sku !== r.payload.sku || !same(this.typedOwner(entry.ownerRef), ownerRef)) this.fail();
      closed ||= entry.active === false;
    }
    if (closed) await this.authorizeContinuation(r, context, cart);
    if (!same(original, { authData: r.authData, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      participantEnterpriseCode: r.participantEnterpriseCode, authorization: r.authorization,
      ownerId: r.ownerId, ownerRef: r.ownerRef, actorRef: r.actorRef, payload: r.payload, idempotencyKey: r.idempotencyKey })) this.fail();
    return { tenant: r.tenant, ownerRef, ownerId: r.ownerId, orderCode: r.payload.orderCode };
  },
  /**
   * Admits only an already committed original unit after partial/final Cart closure; never opens new
   * purchase intake.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {Object} context Freshly re-admitted participant/merchant context including actorRef.
   * @param {Object} cart Exact original closed/partially closed Cart and Store merchant binding.
   * @returns {Promise<void>} Resolves only for the retained COMMIT unit with original consideration.
   * @remarks Effects: Reads allocation/Order and checks actor, key, reservation list, certificate list and
   * payment evidence.
   * Failure behavior: Rejects new/replacement commands, RELEASE, wrong actor/merchant/Store or unknown
   * consideration.
   * @override Never reopen Cart or admit new preparation through continuation.
   */
  authorizeContinuation: async function (r, context, cart) {
    const a = await this.allocation(r), suffix = ":digital:" + a.identity.entryCode + ":";
    const at = r.idempotencyKey.lastIndexOf(suffix);
    if (at < 1 || !/^\d+$/.test(r.idempotencyKey.slice(at + suffix.length)) ||
        a.row.evidence.inputDisposition !== "COMMIT" || !["RESERVED", "COMPLETED"].includes(a.row.evidence.status) ||
        !r.actorRef || !same(context.actorRef, r.actorRef)) this.fail();
    const order = await this.one("DefaultCommerceOrderService", r, { code: r.payload.orderCode,
      cartCode: cart.code, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, idempotencyKey: r.idempotencyKey.slice(0, at) });
    if (!same(order.evidence?.actorRef, r.actorRef) || order.evidence?.participantEnterpriseCode !== r.participantEnterpriseCode ||
        order.evidence?.storeCode !== cart.storeCode || !same(order.evidence?.merchantScope, cart.merchantScope) ||
        !Array.isArray(order.evidence?.digitalReservationCodes) || !order.evidence.digitalReservationCodes.includes(a.coupon.code) ||
        a.coupon.cartCode !== cart.code || a.identity.entryCode !== r.payload.entryCode ||
        a.identity.productCode !== r.payload.productCode || !same(a.identity.certificateCodes, this.certificates(r.payload.certificateCodes))) this.fail();
    await this.consideration(r, a);
  },
  /**
   * Loads immutable selected consideration from Promotion's existing persisted allocation, not a browser
   * proof.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} Exact {coupon, row, identity, offer} from persisted Promotion allocation.
   * @remarks Effects: Reads coupon/reservation and validates frozen offer; no new allocation.
   * Failure behavior: Rejects wrong namespace/owner/key/order, missing allocation or
   * non-reserved/non-completed state.
   * @override Browser proofs cannot replace frozen Promotion identity or requirements.
   */
  allocation: async function (r) {
    const coupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(r, this.identifier(r.couponCode || r.payload?.couponCode));
    if (!coupon?.offerAllocationCode || coupon.tenant !== r.tenant || coupon.enterpriseCode !== r.enterpriseCode) this.fail();
    const row = await SERVICE.DefaultCouponAcquisitionPersistenceService.read("couponAcquisitionReservation", r, coupon.offerAllocationCode);
    const e = row?.evidence, i = e?.identity;
    if (!i || e.couponCode !== coupon.code || i.tenant !== r.tenant || i.ownerId !== r.ownerId ||
      i.orderCode !== r.payload?.orderCode || i.idempotencyKey !== r.idempotencyKey || !same(i.ownerRef, this.typedOwner(r.ownerRef)) ||
      coupon.orderCode !== i.orderCode || coupon.idempotencyKey !== i.idempotencyKey ||
      !["RESERVED", "COMPLETED"].includes(e.status)) this.fail();
    const offer = SERVICE.DefaultCouponOfferService.validate(e.campaign?.couponOffer);
    return { coupon, row, identity: i, offer };
  },
  /**
   * Reconstructs only the original persisted unit payload for sale, delivery and compensation.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {Object} unit Original unit with canonical code; current persisted coupon is reread.
   * @returns {Promise<Object|undefined>} Reconstructed and freshly authorized original unit command;
   * undefined for a non-governed coupon.
   * @remarks Effects: Reads immutable allocation/coupon and authorizes; no reservation or consideration
   * effects.
   * Failure behavior: Rejects conflicting purchase identity or current participant denial.
   * @override Retain original allocation key/certificates rather than rebuilding from current selections.
   */
  commandForCoupon: async function (r, unit) {
    const coupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(r, this.identifier(unit.code));
    if (!coupon.offerAllocationCode) return undefined;
    const row = await SERVICE.DefaultCouponAcquisitionPersistenceService.read("couponAcquisitionReservation", r, coupon.offerAllocationCode);
    const i = row?.evidence?.identity;
    if (!i || i.tenant !== r.tenant || i.ownerId !== r.ownerId || coupon.enterpriseCode !== r.enterpriseCode ||
      row.evidence.couponCode !== coupon.code || !same(i.ownerRef, this.typedOwner(r.ownerRef)) ||
      i.orderCode !== r.payload?.orderCode || i.idempotencyKey !== coupon.idempotencyKey) this.fail();
    const command = { ...r, ownerRef: this.typedOwner(r.ownerRef), idempotencyKey: i.idempotencyKey,
      couponCode: coupon.code, payload: { couponCode: coupon.code, orderCode: i.orderCode, cartCode: coupon.cartCode,
        entryCode: i.entryCode, productCode: i.productCode, sku: coupon.sku, certificateCodes: i.certificateCodes.slice() } };
    await this.authorize(command);
    return command;
  },
  /**
   * Validates a bounded unique explicit certificate selection.
   * @param {Array<string>} values Explicit complete unique certificate-code selection, including empty for
   * rewards-only.
   * @returns {Array<string>} New sorted validated certificate code list.
   * @remarks Effects: Pure validation under effective maximumCertificates.
   * Failure behavior: Throws on non-array, duplicates, over-bound selection or invalid identifier.
   * @override Keep exact membership and no inferred certificates.
   */
  certificates: function (values) {
    if (!Array.isArray(values) || values.length > this.settings().maximumCertificates || new Set(values).size !== values.length) this.fail();
    return values.map(v => this.identifier(v)).sort();
  },
  /**
   * Builds one reviewed selection under the existing Checkout unit namespace; Promotion persists its
   * immutable identity.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {Object} unit Calculated entryCode, unitIndex, productCode/SKU, promotionCode and optional
   * couponBatchCode.
   * @returns {Promise<Object>} Freshly authorized unit command with deterministic :digital:<entry>:<index>
   * key.
   * @remarks Effects: Selects explicit payload.couponSelections entry/unit and reads authorization; does not
   * persist coupon/hold.
   * Failure behavior: Rejects invalid selections, missing original scope or denied owner.
   * @override Promotion must persist the coupon before reserveInputs; no technical batch required for
   * governed unlimited supply.
   */
  prepare: async function (r, unit) {
    const selected = r.payload?.couponSelections?.[unit.entryCode]?.[unit.unitIndex] || [];
    const command = { ...r, ownerRef: this.typedOwner(r.ownerRef),
      idempotencyKey: r.idempotencyKey + ":digital:" + unit.entryCode + ":" + unit.unitIndex,
      payload: { orderCode: r.payload.orderCode, cartCode: r.payload.cartCode, entryCode: unit.entryCode,
        productCode: unit.productCode, sku: unit.sku, promotionCode: unit.promotionCode,
        ...(unit.couponBatchCode ? { batchCode: unit.couponBatchCode } : {}), certificateCodes: this.certificates(selected) } };
    await this.authorize(command);
    return command;
  },
  /**
   * Acquires canonical certificate holds after the coupon hold exists; a lost acknowledgement stays in
   * Checkout compensation.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} RESERVED result with orderCode and original certificateCodes.
   * @remarks Effects: Reauthorizes and holds selected domain certificates only after persisted RESERVED
   * allocation.
   * Failure behavior: Rejects invalid phase or mismatched/consumed hold evidence; lost acknowledgement
   * remains uncertain.
   * @override Never claim reservation before original coupon persistence or release on timeout.
   */
  reserveInputs: async function (r) {
    await this.authorize(r);
    const a = await this.allocation(r);
    if (a.row.evidence.status !== "RESERVED") this.fail();
    if (a.offer.requirements.type !== "REWARDS") {
      const rows = await this.certificatePhase({ ...r, promotionCode: a.identity.promotionCode }, "reserve", a.offer.requirements, a.identity.certificateCodes);
      if (rows.some(c => c.consumed !== false || c.reservationCode !== r.idempotencyKey || !same(c.ownerRef, this.typedOwner(r.ownerRef)))) this.fail();
    }
    return { status: "RESERVED", orderCode: r.payload.orderCode, certificateCodes: a.identity.certificateCodes.slice() };
  },
  /**
   * Calls the existing qualified domain transport with an exact coupon-specific command; no credentials or
   * policy implementation cross owners.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {string} phase inspect, reserve, consume or release fixed owner phase.
   * @param {Object} requirements Frozen Promotion acquisition requirements.
   * @param {Array<string>} codes Exact original selected certificate codes.
   * @returns {Promise<Array<Object>>} Canonical certificate facts after exact response/owner/key/order/list
   * checks.
   * @remarks Effects: Reauthorizes before/after qualified Waste transport; mutation phases may
   * hold/consume/release originals.
   * Failure behavior: Rejects unsupported phase, invalid identity, response mismatch or post-call authority
   * revocation.
   * @override Preserve immutable command and no replacement key; successful transport alone is not proof.
   */
  certificatePhase: async function (r, phase, requirements, codes) {
    await this.authorize(r);
    if (!["inspect", "reserve", "consume", "release"].includes(phase)) this.fail();
    const command = { contractVersion: 1, ownerRef: this.typedOwner(r.ownerRef), ownerId: r.ownerId,
      orderCode: r.payload.orderCode, entryCode: r.payload.entryCode, productCode: r.payload.productCode,
      promotionCode: r.promotionCode || r.payload.promotionCode, operationKey: r.idempotencyKey,
      certificateCodes: this.certificates(codes), requirements: structuredClone(requirements), idempotencyKey: r.idempotencyKey };
    for (const key of ["entryCode", "productCode", "promotionCode"]) this.identifier(command[key]);
    const result = await SERVICE.DefaultDigitalCommerceOwnershipService.remote(r, "coupon-" + phase, command);
    if (result?.contractVersion !== 1 || result.tenant !== r.tenant || result.enterpriseCode !== r.enterpriseCode ||
      result.orderCode !== command.orderCode || result.operationKey !== command.operationKey || !same(result.ownerRef, command.ownerRef) ||
      !Array.isArray(result.certificates) || !same(result.certificates.map(c => c.code).sort(), command.certificateCodes)) this.fail();
    await this.authorize(r);
    return result.certificates;
  },
  /**
   * Supplies canonical exact certificate facts to Promotion's immutable eligibility rules.
   * @param {Object} r Fresh participant acquisition command including payload order/cart/entry/product,
   * requirements, certificateCodes, promotionCode and original key.
   * @returns {Promise<Array<Object>>} Allowlisted code/owner/valid/consumed/available/category/milestone
   * facts and optional reservation/brand/model.
   * @remarks Effects: Calls inspect only, using r.requirements and r.certificateCodes; no hold or
   * consumption.
   * Failure behavior: Rejects foreign owner, nonboolean eligibility facts or malformed milestones.
   * @override Promotion owns eligibility rules; Digital supplies canonical facts, not customer-attested
   * proof.
   */
  readCertificateEligibility: async function (r) {
    const rows = await this.certificatePhase(r, "inspect", r.requirements, r.certificateCodes);
    return rows.map(row => {
      if (!same(row.ownerRef, this.typedOwner(r.ownerRef)) || !["valid", "consumed", "available"].every(k => typeof row[k] === "boolean") ||
        !Array.isArray(row.milestoneCodes)) this.fail();
      return { code: row.code, ownerRef: row.ownerRef, valid: row.valid, consumed: row.consumed, available: row.available,
        ...(row.reservationCode ? { reservationCode: row.reservationCode } : {}), categoryCode: row.categoryCode,
        ...(row.brandCode ? { brandCode: row.brandCode } : {}), ...(row.modelCode ? { modelCode: row.modelCode } : {}), milestoneCodes: row.milestoneCodes };
    });
  },
  /**
   * Separates purchaser financial namespace from original merchant Order placement.
   * @param {Object} order Original Order with evidence.ownerRef and optional participantEnterpriseCode.
   * @returns {string} Purchasing Enterprise financial namespace, independently of merchant placement.
   * @remarks Effects: Pure typed-owner and participant binding validation.
   * Failure behavior: Throws for invalid owner/identifier or contradictory participant Enterprise.
   * @override Never treat merchant partition as an Enterprise buyer financial fallback.
   */
  paymentEnterprise: function (order) {
    const owner = this.typedOwner(order.evidence?.ownerRef);
    const enterprise = owner.type === "ENTERPRISE" ? owner.code : order.evidence.participantEnterpriseCode || order.enterpriseCode;
    if (order.evidence.participantEnterpriseCode !== undefined && order.evidence.participantEnterpriseCode !== enterprise) this.fail();
    return this.identifier(enterprise);
  },
  /**
   * Reads immutable original order consideration in the purchasing participant's financial namespace.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {Object} acquisition Exact allocation identity and frozen offer requirements.
   * @returns {Promise<string|undefined>} Original captured reward transaction code, or undefined for proven
   * zero-payment CERTIFICATES.
   * @remarks Effects: Reads Order, retained calculation/price row and complete Payment entries; no
   * capture/refund dispatch.
   * Failure behavior: Rejects foreign or reversed payments, wrong amount/currency/method, incomplete counts
   * or nonzero certificate-only total.
   * @override Require original buyer namespace and exact captured amount before irreversible input
   * consumption.
   */
  consideration: async function (r, acquisition) {
    const order = await this.one("DefaultCommerceOrderService", r, { code: r.payload.orderCode, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId });
    if (order.active !== true || !["PLACED", "COMPLETED", "FULFILLED"].includes(order.status) ||
      order.cartCode !== r.payload.cartCode || !same(this.typedOwner(order.evidence?.ownerRef), this.typedOwner(r.ownerRef))) this.fail();
    const calculation = await this.one("DefaultCartCalculationService", r, { code: this.identifier(order.evidence?.calculationCode),
      cartCode: order.cartCode, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId });
    const entries = calculation.entries?.filter(entry => entry.code === acquisition.identity.entryCode);
    const entry = entries?.[0], price = entry?.priceDecision;
    if (entries?.length !== 1 || entry.productCode !== acquisition.identity.productCode || entry.sku !== r.payload.sku ||
      price?.tenant !== r.tenant || price.productCode !== entry.productCode || price.currency !== order.currency ||
      price.storeCode !== order.evidence.storeCode ||
      (acquisition.offer.requirements.type !== "CERTIFICATES" && price.priceRowCode !== acquisition.offer.requirements.priceRef)) this.fail();
    const paymentEnterprise = this.paymentEnterprise(order);
    const payments = await this.rows("DefaultPaymentTransactionEntryService", r, { orderCode: order.code, ownerId: r.ownerId }, 100);
    if (payments.count !== payments.result.length || payments.result.some(p => p.enterpriseCode !== paymentEnterprise ||
      ["REFUND", "VOID"].includes(p.evidence?.operation) || paymentEnterprise !== r.enterpriseCode &&
      !same(p.evidence?.participant?.ownerRef, order.evidence.ownerRef))) this.fail();
    const captures = payments.result.filter(p => p.evidence?.operation === "CAPTURE");
    if (acquisition.offer.requirements.type === "CERTIFICATES") {
      if (payments.result.length || !SERVICE.DefaultExactAmountService ||
        SERVICE.DefaultExactAmountService.compare(String(order.totalAmount), "0") !== 0) this.fail();
      return undefined;
    }
    const capture = captures[0];
    if (captures.length !== 1 || capture.status !== "CAPTURED" || capture.cartCode !== order.cartCode ||
      capture.currency !== order.currency || (capture.methodCode || capture.evidence?.methodCode) !== "LOYALTY_REWARD" ||
      !SERVICE.DefaultExactAmountService || SERVICE.DefaultExactAmountService.compare(String(capture.totalAmount), String(order.totalAmount)) !== 0 ||
      SERVICE.DefaultExactAmountService.compare(String(capture.totalAmount), "0") <= 0) this.fail();
    return this.identifier(capture.code);
  },
  /**
   * Consumes original held certificates only after canonical required points capture. The domain retains
   * durable partial-consumption recovery.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} Original COMPLETED acquisition proof from completion.
   * @remarks Effects: Verifies consideration, persists COMMIT direction, consumes exact held certificates
   * and rereads completion.
   * Failure behavior: Rejects unconfirmed consideration/fence/consumption; prior consume remains
   * forward-only.
   * @override Persist COMMIT before effects and never compensate uncertain consumed input as a new sale.
   */
  completeInputs: async function (r) {
    await this.authorize(r);
    const a = await this.allocation(r);
    await this.consideration(r, a);
    if (await SERVICE.DefaultCouponOfferAllocationService.fenceInputs(r, a.coupon, "COMMIT") !== "COMMIT") this.fail();
    if (a.offer.requirements.type !== "REWARDS") {
      const rows = await this.certificatePhase({ ...r, promotionCode: a.identity.promotionCode }, "consume", a.offer.requirements, a.identity.certificateCodes);
      if (rows.some(c => c.consumed !== true || c.consumedBy !== r.idempotencyKey || c.consumedOrderCode !== r.payload.orderCode)) this.fail();
    }
    return this.completion(r);
  },
  /**
   * Read-only consideration checkpoint, independent of coupon usability, delivery and final Checkout
   * completion.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} COMPLETED order/owner/certificate proof plus rewardCaptureReference when
   * required.
   * @remarks Effects: Read-only authorization, original consideration and consumed-certificate proof; no
   * entitlement/Checkout completion requirement.
   * Failure behavior: Rejects missing capture, wrong consumedBy/order/owner or current denial.
   * @override Do not require a usable coupon to prove acquisition completion or manufacture Payment for
   * CERTIFICATES.
   */
  completion: async function (r) {
    const authority = await this.authorize(r), a = await this.allocation(r);
    const rewardCaptureReference = await this.consideration(r, a);
    if (a.offer.requirements.type !== "REWARDS") {
      const rows = await this.certificatePhase({ ...r, promotionCode: a.identity.promotionCode }, "inspect", a.offer.requirements, a.identity.certificateCodes);
      if (rows.some(c => c.consumed !== true || c.consumedBy !== r.idempotencyKey || c.consumedOrderCode !== r.payload.orderCode ||
        !same(c.ownerRef, authority.ownerRef))) this.fail();
    }
    await this.authorize(r);
    return { status: "COMPLETED", orderCode: authority.orderCode, ownerRef: authority.ownerRef,
      certificateCodes: a.identity.certificateCodes.slice(), ...(rewardCaptureReference ? { rewardCaptureReference } : {}) };
  },
  /**
   * Reads the atomic original allocation completion for reveal/notification without re-authorizing a new
   * purchase or consuming inputs again.
   * @param {Object} r Trusted original entitlement scope with tenant, merchant enterpriseCode and ownerId;
   * this read does not re-admit a new purchase.
   * @param {Object} item Persisted v2 entitlement with purchasePolicy and exact original unit/order
   * identity.
   * @returns {Promise<Object>} Cloned atomic acquisition completion plus requirementsType.
   * @remarks Effects: Reads original coupon/allocation to validate retained completion; neither starts a
   * purchase nor consumes again.
   * Failure behavior: Rejects policy/owner/unit/order mismatch or missing/forbidden reward capture
   * reference.
   * @override Reveal/notification must use original atomic proof, not current coupon usability alone.
   */
  purchasedCompletion: async function (r, item) {
    const coupon = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(r, item.providerCode);
    const row = await SERVICE.DefaultCouponAcquisitionPersistenceService.read("couponAcquisitionReservation", r, coupon.offerAllocationCode);
    const e = row?.evidence, identity = e?.identity, proof = e?.completion;
    const ownerRef = this.typedOwner(item.purchasePolicy?.originalOwnerRef);
    if (item.purchasePolicy?.version !== 2 || item.tenant !== r.tenant || item.enterpriseCode !== r.enterpriseCode || item.ownerId !== r.ownerId ||
        coupon.tenant !== r.tenant || coupon.enterpriseCode !== r.enterpriseCode || coupon.code !== item.providerCode || coupon.soldTo !== r.ownerId ||
        coupon.orderCode !== item.orderCode || !same(coupon.purchasePolicy, item.purchasePolicy) ||
        row?.code !== coupon.offerAllocationCode || e?.status !== "COMPLETED" || e.couponCode !== coupon.code ||
        identity?.tenant !== r.tenant || identity.ownerId !== r.ownerId || identity.orderCode !== item.orderCode ||
        identity.productCode !== item.productCode || identity.entryCode !== item.orderEntryCode || identity.idempotencyKey !== coupon.idempotencyKey ||
        !same(identity.ownerRef, ownerRef) || proof?.status !== "COMPLETED" || proof.orderCode !== item.orderCode ||
        !same(proof.ownerRef, ownerRef) || !same(proof.certificateCodes, identity.certificateCodes) ||
        !same(e.campaign?.couponOffer, item.purchasePolicy.couponOffer)) this.fail();
    const offer = SERVICE.DefaultCouponOfferService.validate(e.campaign.couponOffer);
    if (offer.requirements.type === "CERTIFICATES" ? proof.rewardCaptureReference !== undefined :
        typeof proof.rewardCaptureReference !== "string" || !proof.rewardCaptureReference) this.fail();
    return { ...structuredClone(proof), requirementsType: offer.requirements.type };
  },
  /**
   * Proves original common-command failure and Payment reconciliation before input release.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {Object} a Exact RESERVED allocation/coupon and immutable original acquisition identity.
   * @returns {Promise<Object>} Original merchant Checkout checkpoint after terminal Payment reconciliation
   * proof.
   * @remarks Effects: Reads merchant checkpoint and purchaser Payment namespace; private callbacks use
   * persisted actor/participant bindings.
   * Failure behavior: Rejects COMMIT, changed owner/actor/key, partial receipts or uncertain original
   * reversal.
   * @override Never redispatch money here; body/runtime callback identity cannot replace retained buyer
   * authority.
   */
  failureCheckpoint: async function (r, a) {
    const suffix = ":digital:" + a.identity.entryCode + ":", at = r.idempotencyKey.lastIndexOf(suffix);
    if (at < 1 || !/^\d+$/.test(r.idempotencyKey.slice(at + suffix.length))) this.fail();
    const key = r.idempotencyKey.slice(0, at);
    const checkpoint = await this.one("DefaultCheckoutCheckpointService", r, {
      code: key, enterpriseCode: r.enterpriseCode, ownerId: r.ownerId, idempotencyKey: key });
    const e = checkpoint.evidence, intent = e?.paymentCompensationIntent;
    if (!["COMPENSATED", "COMPENSATION_REQUIRED"].includes(checkpoint.status) || !Array.isArray(e?.compensation) ||
      a.row.evidence.status !== "RESERVED" || a.row.evidence.inputDisposition === "COMMIT" || a.coupon.status !== "RESERVED") this.fail();
    const ownerRef = this.typedOwner(r.ownerRef);
    const paymentEnterprise = this.identifier(ownerRef.type === "ENTERPRISE" ? ownerRef.code :
      e.participantEnterpriseCode || r.participantEnterpriseCode || r.enterpriseCode);
    const crossMerchant = paymentEnterprise !== r.enterpriseCode;
    if (crossMerchant && (e.participantEnterpriseCode !== paymentEnterprise ||
      r.participantEnterpriseCode !== undefined && r.participantEnterpriseCode !== paymentEnterprise ||
      !same(this.typedOwner(e.ownerRef), ownerRef) || typeof e.actorRef?.loginId !== "string" || !e.actorRef.loginId ||
      r.actorRef !== undefined && !same(e.actorRef, r.actorRef))) this.fail();
    const payments = await this.rows("DefaultPaymentTransactionEntryService", r, { orderCode: r.payload.orderCode,
      enterpriseCode: paymentEnterprise, ownerId: r.ownerId }, 100);
    if (payments.count !== payments.result.length) this.fail();
    if (payments.result.length) {
      if (!intent || intent.orderCode !== r.payload.orderCode || intent.cartCode !== r.payload.cartCode || intent.ownerId !== r.ownerId ||
        intent.enterpriseCode !== r.enterpriseCode || intent.tenant !== r.tenant ||
        crossMerchant && (intent.participantEnterpriseCode !== paymentEnterprise ||
          !same(this.typedOwner(intent.ownerRef), ownerRef) || !same(intent.actorRef, e.actorRef))) this.fail();
      const receipts = e.compensation.filter(c => c.type === "PAYMENT_" + intent.operation);
      const receipt = receipts[0], payment = payments.result.find(p => p.code === receipt?.paymentTransactionCode);
      if (receipts.length !== 1 || receipt.status !== "COMPLETED" || !payment ||
        payment.idempotencyKey !== intent.idempotencyKey || !["VOIDED", "REFUNDED", "REFUND_SUCCEEDED"].includes(payment.status) ||
        payment.evidence?.operation !== intent.operation || receipt.idempotencyKey !== intent.idempotencyKey ||
        crossMerchant && (!same(this.typedOwner(payment.evidence?.participant?.ownerRef), ownerRef) ||
          payment.evidence?.participant?.participantEnterpriseCode !== paymentEnterprise)) this.fail();
    } else if (intent || !Array.isArray(e.completed) || e.completed.includes("AUTHORIZED") || e.completed.includes("PAYMENT_CAPTURED")) this.fail();
    return checkpoint;
  },
  /**
   * Recognizes the original durable RELEASED allocation without repeating domain effects.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @param {Object} unit Original coupon code, offerAllocationCode, unit key and retained order/Cart
   * identity.
   * @returns {Promise<boolean>} False unless original allocation is RELEASED; true only after failure
   * evidence and fresh authorization.
   * @remarks Effects: Reads original allocation receipt; no release call and no reliance on today's reusable
   * finite coupon state.
   * Failure behavior: Rejects contradictory release identity/failure proof or denied original participant.
   * @override A reused finite coupon must not invalidate original release proof or authorize another
   * command.
   */
  released: async function (r, unit) {
    const row = await SERVICE.DefaultCouponAcquisitionPersistenceService.read("couponAcquisitionReservation", r, unit.offerAllocationCode);
    const e = row?.evidence, i = e?.identity;
    if (e?.status !== "RELEASED") return false;
    if (row.code !== unit.offerAllocationCode || row.tenant !== r.tenant || e.couponCode !== unit.code ||
        i?.ownerId !== r.ownerId || !same(i.ownerRef, this.typedOwner(r.ownerRef)) || i.idempotencyKey !== unit.idempotencyKey ||
        i.orderCode !== (unit.orderCode || r.payload?.orderCode) || e.failure?.status !== "FAILED" ||
        e.failure.orderCode !== i.orderCode || e.failure.couponUsable !== false || e.failure.inputsReconciled !== true) this.fail();
    const command = { ...r, idempotencyKey: i.idempotencyKey, payload: { ...r.payload, orderCode: i.orderCode,
      cartCode: unit.cartCode, entryCode: i.entryCode, productCode: i.productCode, sku: unit.sku } };
    await this.authorize(command);
    // A later purchase may reuse a released finite unit; the original release receipt, not today's unit state, proves this command completed.
    return true;
  },
  /**
   * Releases unconsumed domain holds only after common failed-command evidence, never on a timeout alone.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} FAILED purchase proof with inputsReconciled:true after actual release.
   * @remarks Effects: Proves common failure/payment recovery, persists RELEASE fence, releases unconsumed
   * certificates and rereads failed proof.
   * Failure behavior: Rejects COMMIT, unknown reversal or incomplete domain release; holds stay recoverable.
   * @override Release only original unconsumed input after persisted failure, never on transport timeout.
   */
  releaseInputs: async function (r) {
    await this.authorize(r);
    const a = await this.allocation(r);
    await this.failureCheckpoint(r, a);
    if (await SERVICE.DefaultCouponOfferAllocationService.fenceInputs(r, a.coupon, "RELEASE") !== "RELEASE") this.fail();
    if (a.offer.requirements.type !== "REWARDS") {
      const rows = await this.certificatePhase({ ...r, promotionCode: a.identity.promotionCode }, "release", a.offer.requirements, a.identity.certificateCodes);
      if (rows.some(c => c.consumed !== false || c.reservationCode || c.available !== true)) this.fail();
    }
    return this.failed(r);
  },
  /**
   * Proves genuine failure and complete original input recovery before Promotion releases shared allowance.
   * @param {Object} r Original acquisition command: tenant, merchant enterpriseCode, typed owner/ownerId,
   * participant/actor/bearer, unit idempotencyKey and order/cart/entry/product/SKU payload.
   * @returns {Promise<Object>} {status:FAILED, orderCode, couponUsable:false, inputsReconciled:true}.
   * @remarks Effects: Read-only reauthorization/failure-checkpoint/available-unconsumed certificate
   * inspection.
   * Failure behavior: Rejects any unresolved consideration, reservation or consumed/foreign certificate.
   * @override This proof permits allowance release only after owner-confirmed reconciliation.
   */
  failed: async function (r) {
    await this.authorize(r);
    const a = await this.allocation(r);
    await this.failureCheckpoint(r, a);
    if (a.offer.requirements.type !== "REWARDS") {
      const rows = await this.certificatePhase({ ...r, promotionCode: a.identity.promotionCode }, "inspect", a.offer.requirements, a.identity.certificateCodes);
      if (rows.some(c => c.consumed !== false || c.reservationCode || c.available !== true || !same(c.ownerRef, this.typedOwner(r.ownerRef)))) this.fail();
    }
    return { status: "FAILED", orderCode: r.payload.orderCode, couponUsable: false, inputsReconciled: true };
  },
  /**
   * Admits only signed module-scoped reporting workers, never browser identities or supplied event lists.
   * @param {Object} r Signed reporting runtime request with tenant, channelCode, authData and, for paging,
   * pageSize/snapshotId/cursor.
   * @returns {Object} Cloned signed runtime auth snapshot for reporting drift comparison.
   * @remarks Effects: Checks Digital/Promotion runtime modules, analytics permission and channel identifier;
   * no source read.
   * Failure behavior: Throws for human/foreign runtime, missing module/permission or invalid channel.
   * @override Do not grant analytics from body context or caller event lists.
   */
  reportContext: function (r) {
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(r, "digitalCore");
    if (auth.tenant !== r.tenant || auth.principalType !== "service" || !auth.modules?.includes("promotion") ||
      !auth.permissions?.includes("commerce.promotion.analytics")) this.fail();
    this.identifier(r.channelCode);
    return structuredClone(auth);
  },
  /**
   * Reads complete bounded source history with stable ordering and count/identity checks; no silent
   * first-page totals.
   * @param {string} name Fixed generated source owner service.
   * @param {Object} r Trusted owner read context with tenant; other partition/identity selectors are
   * explicit in query.
   * @param {Object} query Exact source selectors bound to tenant.
   * @returns {Promise<Array<Object>>} Complete bounded sorted unique record set.
   * @remarks Effects: Reads all pages under configured sourcePageSize/maximumSourcePages; no mutations.
   * Failure behavior: Rejects changing totals, duplicates/nonmonotonic codes, truncation or page bound
   * overflow.
   * @override Never report a partial first page as complete history.
   */
  all: async function (name, r, query) {
    const p = this.settings(), rows = [], seen = new Set();
    let count;
    for (let page = 1; page <= p.maximumSourcePages; page++) {
      const result = await this.rows(name, r, query, p.sourcePageSize, page);
      count ??= result.count;
      if (count !== result.count) this.fail();
      for (const row of result.result) {
        this.identifier(row.code);
        if (seen.has(row.code) || rows.length && rows.at(-1).code >= row.code) this.fail();
        seen.add(row.code); rows.push(row);
      }
      if (rows.length === count) return rows;
      if (rows.length > count || result.result.length !== p.sourcePageSize) this.fail();
    }
    this.fail();
  },
  /**
   * Builds canonical history from retained purchases, closed Cart channel, committed Checkout and confirmed
   * merchant receipts.
   * @param {Object} r Signed reporting runtime request with tenant, channelCode, authData and, for paging,
   * pageSize/snapshotId/cursor.
   * @param {string} coverageThrough ISO timestamp bounding included confirmed purchase/redemption events.
   * @returns {Promise<Array<Object>>} Sorted canonical events with typed owner, issuer/redeemer and
   * conservative historyKnown.
   * @remarks Effects: Joins retained entitlements to closed Cart channel, completed Checkout and exact
   * delivery/redemption receipts.
   * Failure behavior: Rejects inconsistent purchase/receipt/owner history; later-than-cutoff events are
   * excluded.
   * @override Unknown historical owners disable new-customer claims; no current actor substitution.
   */
  reportSource: async function (r, coverageThrough) {
    const items = await this.all("DefaultDigitalEntitlementService", r, { digitalDeliveryType: "COUPON_CODE", providerOwner: "promotion" });
    const events = [];
    for (const item of items) {
      if (!Number.isFinite(Date.parse(item.purchasedAt))) this.fail();
      if (Date.parse(item.purchasedAt) > Date.parse(coverageThrough)) continue;
      const scope = { ...r, enterpriseCode: item.enterpriseCode, ownerId: item.ownerId, orderCode: item.orderCode };
      const cart = await this.one("DefaultCartService", scope, { code: item.cartCode, enterpriseCode: item.enterpriseCode, ownerId: item.ownerId });
      if (cart.status !== "PLACED" || cart.active !== false) this.fail();
      this.identifier(cart.channelCode);
      if (cart.channelCode !== r.channelCode) continue;
      const checkpoint = await this.one("DefaultCheckoutCheckpointService", scope, { orderCode: item.orderCode, status: "COMPLETED",
        enterpriseCode: item.enterpriseCode, ownerId: item.ownerId });
      if (checkpoint.status !== "COMPLETED" || checkpoint.evidence?.orderCode !== item.orderCode ||
        !checkpoint.evidence?.digitalDeliveryCodes?.includes(item.providerCode)) this.fail();
      const deliveries = await this.all("DefaultDigitalDeliveryService", scope, { entitlementCode: item.code,
        enterpriseCode: item.enterpriseCode, ownerId: item.ownerId, orderCode: item.orderCode, providerCode: item.providerCode, status: "DELIVERED" });
      if (deliveries.filter(d => d.deliveryType === "COUPON_CODE").length !== 1) this.fail();
      const policy = item.purchasePolicy, ownerRef = policy?.version === 2 ? this.typedOwner(policy.originalOwnerRef) : null;
      const promotionCode = policy?.promotionCode || item.evidence?.promotionCode, issuerEnterpriseCode = policy?.issuerEnterpriseRef?.code;
      this.identifier(promotionCode); this.identifier(issuerEnterpriseCode);
      const base = { promotionCode, issuerEnterpriseCode, channel: cart.channelCode, confirmed: true, historyKnown: false, ownerRef };
      events.push({ ...base, sourceId: "purchase:" + item.code, kind: "PURCHASE", confirmedAt: new Date(item.purchasedAt).toISOString() });
      const marker = item.evidence?.merchantRedemption;
      for (const receipt of deliveries.filter(d => d.deliveryType === "MERCHANT_RECEIPT")) {
        if (item.claimStatus !== "REDEEMED" || receipt.code !== marker?.receiptCode || receipt.evidence?.redemptionCode !== marker.code ||
          receipt.evidence?.fulfillmentStatus !== "COMPLETED" || !same(receipt.evidence.enterpriseRef, marker.enterpriseRef) ||
          !same(receipt.evidence.storeRef, marker.storeRef) || Date.parse(receipt.deliveredAt) !== Date.parse(marker.confirmedAt)) this.fail();
        if (Date.parse(receipt.deliveredAt) > Date.parse(coverageThrough)) continue;
        const redeemerEnterpriseCode = receipt.evidence.enterpriseRef?.code, storeCode = receipt.evidence.storeRef?.code;
        this.identifier(redeemerEnterpriseCode); this.identifier(storeCode);
        events.push({ ...base, sourceId: "redemption:" + receipt.code, kind: "REDEMPTION",
          confirmedAt: new Date(receipt.deliveredAt).toISOString(), redeemerEnterpriseCode, storeCode });
      }
    }
    // Any unidentified historical owner prevents a new-customer claim for this channel.
    const known = events.every(e => e.ownerRef !== null);
    return events.map(e => ({ ...e, historyKnown: known })).sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  },
  /**
   * Returns pages of a content-addressed complete history; late writes invalidate the whole refresh instead
   * of fabricating coverage.
   * @param {Object} r Signed reporting runtime request with tenant, channelCode, authData and, for paging,
   * pageSize/snapshotId/cursor.
   * @returns {Promise<Object>} Content-addressed snapshotId/coverageThrough, bounded events, complete flag
   * and nextCursor.
   * @remarks Effects: Reads report source twice and verifies original runtime; does not persist analytics.
   * Failure behavior: Rejects invalid page/cursor/snapshot age, auth drift, changed history or out-of-range
   * cursor.
   * @override Keep snapshot identity bound to tenant/channel/complete history; invalidation must not
   * fabricate coverage.
   */
  reportingEvents: async function (r) {
    const authority = this.reportContext(r), p = this.settings();
    if (!Number.isSafeInteger(r.pageSize) || r.pageSize < 1 || r.pageSize > p.sourcePageSize ||
      r.cursor !== undefined && (typeof r.cursor !== "string" || !/^(0|[1-9][0-9]*)$/.test(r.cursor))) this.fail();
    let coverageThrough = new Date().toISOString();
    if (r.snapshotId !== undefined) {
      if (typeof r.snapshotId !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z\|[a-f0-9]{64}$/.test(r.snapshotId)) this.fail();
      coverageThrough = r.snapshotId.split("|")[0];
      const age = Date.now() - Date.parse(coverageThrough);
      if (!Number.isFinite(age) || age < 0 || age > p.maximumSnapshotAgeSeconds * 1000) this.fail();
    } else if (r.cursor !== undefined) this.fail();
    const first = await this.reportSource(r, coverageThrough), second = await this.reportSource(r, coverageThrough);
    if (!same(first, second) || !same(authority, this.reportContext(r))) this.fail();
    const snapshotId = coverageThrough + "|" + crypto.createHash("sha256").update(JSON.stringify([r.tenant, r.channelCode, first])).digest("hex");
    if (r.snapshotId !== undefined && r.snapshotId !== snapshotId) this.fail();
    const offset = Number(r.cursor || "0");
    if (!Number.isSafeInteger(offset) || offset > first.length) this.fail();
    const events = first.slice(offset, offset + r.pageSize), complete = offset + events.length === first.length;
    return { tenant: r.tenant, snapshotId, coverageThrough, historyComplete: true, events, complete,
      nextCursor: complete ? null : String(offset + events.length) };
  },
};
