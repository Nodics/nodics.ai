/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

const crypto = require("node:crypto");
const budgetWrites = new WeakMap();
const merchantValidationFailures = new WeakMap();

/** @module promotion/src/service/defaultPromotionOperationService @description Provides bounded promotion eligibility, preview, redemption, reversal, lifecycle, coupon, budget, and analytics operations across caller contexts. @layer service @owner promotion */
module.exports = {
  /** Returns only the original merchant-rights failure's fixed owner stage, never error details or authority. */
  merchantValidationFailureStage: function (error) {
    return error && typeof error === "object" ? merchantValidationFailures.get(error) : undefined;
  },
  /** Executes an owner-built budget CAS while retaining only its in-flight generated request identity. @param {Object} command Exact owner persistence request. @param {Function} persist Canonical generated update operation. @returns {Promise<Object>} Owner acknowledgement. @override Later layers may narrow execution; preserve identity cleanup on success and failure. */
  persistBudgetCommand: async function (command, persist) {
    budgetWrites.set(command, { tenant: command.tenant, authData: structuredClone(command.authData),
      query: structuredClone(command.query), model: structuredClone(command.model), transactionContext: command.transactionContext });
    try {
      return await persist(command);
    } finally {
      budgetWrites.delete(command);
    }
  },
  /** Identifies only in-flight owner consumption requests; callers cannot manufacture this identity. */
  isBudgetConsumptionWrite: function (request) {
    const expected = budgetWrites.get(request);
    if (!expected) return false;
    const same = require("node:util").isDeepStrictEqual;
    if (request.models !== undefined || request.tenant !== expected.tenant || request.transactionContext !== expected.transactionContext ||
        !same(request.authData, expected.authData) || !same(request.query, expected.query) ||
        Object.keys(expected.model).some(key => key !== "updated" && !same(request.model?.[key], expected.model[key])) ||
        Object.keys(request.model || {}).some(key => !Object.hasOwn(expected.model, key) && key !== "updated"))
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    return true;
  },
  /** Updates only an existing non-admitted legacy counter; never grants private admission or falls back to save/upsert. @param {Object} command Scoped generated update. @returns {Promise<Object>} Exact fresh successor after positive single-row acknowledgement. */
  persistLegacyBudget: async function (command) {
    const service = SERVICE.DefaultPromotionService;
    if (!service?.update || !service.get)
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    command.query = { ...command.query, budgetAdmission: { $exists: false } };
    const response = await service.update(command);
    this.assertLifecycleEnvelope(response);
    const result = this.unwrap(response);
    if (response.acknowledged === false || !result || result.acknowledged !== true ||
        result.matchedCount !== 1 || result.modifiedCount !== 1)
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    const readback = await service.get({
      tenant: command.tenant, authData: command.authData,
      query: { ...command.query }, options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2 },
    });
    this.assertLifecycleEnvelope(readback);
    const rows = readback.result;
    if (!Array.isArray(rows) || rows.length !== 1 || readback.acknowledged === false ||
        readback.count !== undefined && readback.count !== 1 || rows[0].budgetAdmission ||
        ['code', 'tenant', 'enterpriseCode'].some(key => command.query[key] !== undefined && rows[0][key] !== command.query[key]) ||
        rows[0].revision !== command.model.revision ||
        !require('node:util').isDeepStrictEqual(rows[0].budget, command.model.budget))
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    return rows[0];
  },
  /** Identifies policy authoring without changing disabled legacy behavior. */
  isStagedPolicyRuntime: function () {
    return (
      typeof CONFIG !== "undefined" &&
      (CONFIG.get("promotion") || {}).publication?.runtimeRole === "STAGED"
    );
  },
  /** Operational mutations never run against the policy-authoring store. */
  requireOperationalRuntime: function () {
    if (this.isStagedPolicyRuntime())
      throw new Error(
        "Promotion operational mutation is forbidden on Staged policy runtime",
      );
    return true;
  },
  /**
   * Rejects operational release targets before nImport claims any installation.
   * This read-only admission does not authorize rows, publication or issuance;
   * generated schema interceptors remain the mutation authority.
   * @param {Object} request Trusted release-header target metadata, never a row.
   * @returns {boolean} True when the runtime permits this target class.
   * @override Later layers may extend admission without weakening runtime guards.
   */
  validateImportTarget: function (request) {
    if (
      [
        "coupon",
        "couponBatch",
        "promotionBudgetLedger",
        "promotionRedemption",
        "discountDecision",
      ].includes(request.schemaName)
    ) {
      this.requireOperationalRuntime();
      if (request.lifecycle === "OPERATIONAL_VERSIONED") {
        const policy = CONFIG.get("promotion") || {};
        if (policy.sellerAuthorization?.enabled !== true ||
            policy.sellerAuthorization.qualified !== true ||
            policy.publication?.delivery?.enabled !== true)
          throw new Error("Operational coupon release requires published policy and qualified issuer authorization");
        // Raw token/batch snapshots are not equivalent to an issuer-approved issuance.
        throw new Error("Operational coupon snapshots require governed issuance; direct release import is not approved");
      }
    }
    return true;
  },
  /** Guards schema and draft writes, including dotted and operator updates. */
  validatePolicyAuthoring: function (request) {
    if (!this.isStagedPolicyRuntime()) return true;
    const visit = (value, prefix = "") => {
      if (!value || typeof value !== "object") return;
      for (const [key, item] of Object.entries(value)) {
        if (
          key.startsWith("$") &&
          !["$set", "$setOnInsert", "$unset"].includes(key)
        ) {
          throw new Error(
            "Staged promotion authoring requires explicit policy field updates",
          );
        }
        const field = key.startsWith("$")
          ? prefix
          : prefix
            ? prefix + "." + key
            : key;
        if (
          field === "analytics" ||
          field.startsWith("analytics.") ||
          (field.startsWith("budget.") && field !== "budget.limit")
        ) {
          throw new Error(
            "Staged promotion authoring excludes operational consumption",
          );
        }
        if (
          field === "budget" &&
          (item === null || typeof item !== "object" || Array.isArray(item))
        ) {
          throw new Error(
            "Staged promotion budget must contain policy limit only",
          );
        }
        visit(item, field);
      }
    };
    for (const model of [].concat(
      request.models || request.model || request.payload || [],
    ))
      visit(model);
    return true;
  },
  /** Unwraps a standard result envelope while preserving raw provider values. */
  unwrap: function (response) {
    return response && Object.prototype.hasOwnProperty.call(response, "result")
      ? response.result
      : response;
  },
  /**
   * Builds service-account authorization context for Promotion-owned internal reads and mutations.
   * Customer and BackOffice route permissions guard entry into this operation service; generated schema
   * services remain protected from caller-scoped tokens that should not directly read/write Promotion rows.
   * @param {Object} request Operation request.
   * @returns {Object} Service authorization data.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  serviceAuthData: function (request) {
    return Object.assign({}, request.authData || {}, {
      tenant: request.tenant,
      enterpriseCode: request.enterpriseCode,
      principalId: "promotionOperationService",
      code: "promotionOperationService",
      loginId: "promotionOperationService",
      principalType: "service",
      userGroups: ["serviceAccountUserGroup"],
      groups: ["serviceAccountUserGroup"],
    });
  },
  /**
   * Converts operation timestamps into the BSON date shape expected by generated Mongo schema validators.
   * @param {*} value Candidate timestamp.
   * @returns {Date} Date instance.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  schemaDate: function (value) {
    if (value instanceof Date) return value;
    return value ? new Date(value) : new Date();
  },
  /**
   * Returns the enterprise code from a scalar or Profile enterprise reference.
   * @param {*} value Candidate enterprise value.
   * @returns {string|undefined} Enterprise code.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  enterpriseCodeFrom: function (value) {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    if (typeof value === "object" && !Array.isArray(value))
      return value.code || value.ref || value.id;
    return undefined;
  },
  /**
   * Builds a Profile enterprise reference for Promotion business association fields.
   * @param {string} code Enterprise code.
   * @param {string} roleCode Association role code.
   * @returns {Object|undefined} Profile enterprise reference.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  enterpriseRef: function (code, roleCode) {
    if (!code) return undefined;
    return { moduleName: "profile", schemaName: "enterprise", code: code };
  },
  /**
   * Adds explicit enterprise references while preserving the legacy scalar code for current generated queries.
   * @param {Object} model Persistence model.
   * @param {Object} request Operation request.
   * @returns {Object} Model with enterprise association references.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  withEnterpriseAssociations: function (model, request) {
    const enterpriseCode =
      this.enterpriseCodeFrom(model.enterpriseRef) ||
      this.enterpriseCodeFrom(model.vendorEnterpriseRef) ||
      this.enterpriseCodeFrom(model.issuerEnterpriseRef) ||
      model.enterpriseCode ||
      (request && request.enterpriseCode);
    const issuerCode =
      this.enterpriseCodeFrom(model.issuerEnterpriseRef) ||
      model.issuerEnterpriseCode ||
      enterpriseCode;
    const vendorCode =
      this.enterpriseCodeFrom(model.vendorEnterpriseRef) ||
      model.vendorEnterpriseCode ||
      enterpriseCode;
    let associations = {};
    if (enterpriseCode) associations.enterpriseCode = enterpriseCode;
    if (enterpriseCode)
      associations.enterpriseRef =
        model.enterpriseRef ||
        this.enterpriseRef(enterpriseCode, "BUSINESS_PARTNER");
    if (issuerCode)
      associations.issuerEnterpriseRef =
        model.issuerEnterpriseRef || this.enterpriseRef(issuerCode, "ISSUER");
    if (vendorCode)
      associations.vendorEnterpriseRef =
        model.vendorEnterpriseRef ||
        this.enterpriseRef(vendorCode, "MARKETPLACE_VENDOR");
    return Object.assign({}, model, associations);
  },
  /**
   * Applies generated-schema base fields for Promotion-owned persistence records.
   * @param {Object} model Persistence model.
   * @param {Object} request Operation request.
   * @returns {Object} Model with base fields.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  withSchemaBase: function (model, request) {
    const now = this.schemaDate(request && request.now);
    const created = model.created ? this.schemaDate(model.created) : now;
    return Object.assign({}, this.withEnterpriseAssociations(model, request), {
      active: model.active !== undefined ? model.active : true,
      created,
      updated: now,
    });
  },
  /**
   * Executes `hashToken` as a loader-visible operation owned by this module.
   * @param {*} tenant Value defined by the owning module contract.
   * @param {*} couponCode Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  hashToken: function (tenant, couponCode) {
    return crypto
      .createHash("sha256")
      .update(
        [
          tenant,
          String(couponCode || "")
            .trim()
            .toUpperCase(),
        ].join("|"),
      )
      .digest("hex");
  },
  /**
   * Executes `exact` as a loader-visible operation owned by this module.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  exact: function () {
    return (
      SERVICE.DefaultExactAmountService || {
        normalize: (value) => Number(value || 0).toFixed(2),
      }
    );
  },
  /**
   * Executes `enterpriseQuery` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} query Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  enterpriseQuery: function (request, query) {
    const scoped = Object.assign({}, query);
    if (request.enterpriseCode) scoped.enterpriseCode = request.enterpriseCode;
    return scoped;
  },
  /**
   * Executes `generatedCouponCodes` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  generatedCouponCodes: function (request) {
    const payload = request.payload || {};
    if (Array.isArray(payload.couponCodes) && payload.couponCodes.length)
      return payload.couponCodes;
    const quantity = Number(payload.quantity || payload.count || 0);
    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > Number(payload.maximumGenerationQuantity || 10000)
    )
      throw new Error("Coupon generation quantity is invalid");
    const prefix =
      String(payload.prefix || payload.promotionCode || "COUPON")
        .replace(/[^A-Za-z0-9]/gu, "")
        .toUpperCase()
        .slice(0, 12) || "COUPON";
    const width = Number(payload.sequenceWidth || 5);
    const seed = String(
      payload.seed ||
        request.idempotencyKey ||
        request.requestId ||
        payload.batchCode ||
        Date.now(),
    );
    const tokens = [];
    for (let index = 1; index <= quantity; index += 1) {
      const sequence = String(index).padStart(width, "0");
      const check = crypto
        .createHash("sha1")
        .update(
          [request.tenant, request.enterpriseCode, prefix, seed, sequence].join(
            "|",
          ),
        )
        .digest("hex")
        .slice(0, 6)
        .toUpperCase();
      tokens.push([prefix, sequence, check].join("-"));
    }
    return tokens;
  },
  /**
   * Executes `promotions` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  promotions: async function (request) {
    const delivery =
      typeof CONFIG === "undefined"
        ? {}
        : ((CONFIG.get("promotion") || {}).publication || {}).delivery || {};
    if (
      delivery.enabled === true &&
      SERVICE.DefaultPromotionPublicationService.deliveryEnabled(request)
    ) {
      const publication = SERVICE.DefaultPromotionPublicationService;
      const auth = request.authData || {};
      const enterpriseCode = auth.enterpriseCode || auth.entCode;
      if (
        !auth.tenant ||
        request.tenant !== auth.tenant ||
        !enterpriseCode ||
        [
          auth.enterpriseCode,
          auth.entCode,
          request.enterpriseCode,
          request.entCode,
        ].some((value) => value !== undefined && value !== enterpriseCode)
      ) {
        throw new Error("Authenticated Promotion policy scope mismatch");
      }
      const context = { ...request, enterpriseCode };
      context.authData = this.serviceAuthData(context);
      const sellerReader = this.sellerPolicyReader(request);
      const policies = [],
        seen = new Set();
      for (const rootCode of publication.deliveryRoots(request)) {
        const delegated = sellerReader ? await sellerReader.readRoot(request, rootCode) : undefined;
        for (const policy of delegated === undefined
          ? await publication.readActivatedWithConsumption(context, rootCode)
          : delegated) {
          if (seen.has(policy.code))
            throw new Error("Activated promotion membership conflict");
          seen.add(policy.code);
          policies.push(policy);
        }
      }
      return policies;
    }
    const response = await SERVICE.DefaultPromotionService.get({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        status: "ACTIVE",
      }),
      pageSize: 100,
    });
    const result = this.unwrap(response);
    // First-use rows own consumption only; they cannot become mutable policy fallback.
    return (Array.isArray(result) ? result : result ? [result] : []).filter(
      (promotion) => !promotion.budgetAdmission,
    );
  },
  /** Selects the receipt-bound reader only for independently enabled activated seller distribution. Missing selected ownership refuses rather than falling back to mutable or foreign policy. @param {Object} request Original authenticated Store context. @returns {Object|undefined} Canonical read owner. @override Preserve original signed scope and qualification checks inside the owner. */
  sellerPolicyReader: function (request) {
    if (typeof CONFIG === "undefined" || CONFIG.get("promotion")?.sellerAuthorization?.enabled !== true ||
        SERVICE.DefaultPromotionPublicationService?.deliveryEnabled(request) !== true)
      return undefined;
    const owner = SERVICE.DefaultPromotionSellerPolicyService;
    if (!["readRoot", "readCoupon", "readProduct"].every(name => typeof owner?.[name] === "function"))
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Activated seller policy owner is unavailable");
    return owner;
  },
  /**
   * Executes `context` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  context: function (request) {
    const payload = request.payload || {};
    return {
      customerId: request.ownerId,
      customerGroup: payload.customerGroup,
      subtotal: payload.subtotal || payload.cartSubtotal || "0.00",
      productCodes: payload.productCodes || [],
      currency: payload.currency,
      couponCode: payload.couponCode,
      cartCode: payload.cartCode,
    };
  },
  /** Builds canonical token lookup, with only explicitly enabled legacy digest formats for previously issued coupons. */
  tokenHashSelector: function (tenant, token) {
    const canonical = this.hashToken(tenant, token);
    const policies =
      ((typeof CONFIG !== "undefined" && CONFIG.get("promotion")) || {})
        .legacyTokenHashPolicies || [];
    if (!policies.length) return canonical;
    if (policies.some((policy) => policy !== "TENANT_COLON_UPPERCASE_SHA256"))
      throw new Error("Unsupported legacy coupon hash policy");
    return {
      $in: [
        canonical,
        crypto
          .createHash("sha256")
          .update(
            [
              tenant,
              String(token || "")
                .trim()
                .toUpperCase(),
            ].join(":"),
          )
          .digest("hex"),
      ],
    };
  },
  /**
   * Executes `getOne` as a loader-visible operation owned by this module.
   * @param {*} service Value defined by the owning module contract.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  getOne: async function (service, request) {
    if (!service || !service.get) return undefined;
    const result = this.unwrap(await service.get(request));
    return Array.isArray(result) ? result[0] : result;
  },
  /**
   * Executes `updateOrSave` as a loader-visible operation owned by this module.
   * @param {*} service Value defined by the owning module contract.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  updateOrSave: async function (service, request) {
    if (!service) return undefined;
    if (service.update && request.query)
      return this.unwrap(await service.update(request));
    if (service.save) return this.unwrap(await service.save(request));
    return undefined;
  },
  /**
   * Executes `persistedModel` as a loader-visible operation owned by this module.
   * @param {*} persisted Value returned by generated CRUD.
   * @param {*} fallback Model built by the operation.
   * @returns {*} Concrete model evidence for downstream checkout and promotion flows.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  persistedModel: function (persisted, fallback) {
    const candidate = Array.isArray(persisted) ? persisted[0] : persisted;
    return candidate && candidate.code ? candidate : fallback;
  },
  /** Reads exactly one current coupon through its generated owner without cache. @param {Object} request Runtime context. @param {string} code Coupon identity. @returns {Promise<Object>} Authoritative coupon. */
  readLifecycleCoupon: async function (request, code) {
    const service = SERVICE.DefaultCouponService;
    if (!service?.get)
      throw new Error("Coupon persistence owner is unavailable");
    const response = await service.get({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2 },
    });
    this.assertLifecycleEnvelope(response);
    const value = response.result;
    const rows = Array.isArray(value) ? value : value?.code ? [value] : [];
    if (rows.length !== 1 || rows[0].code !== code)
      throw new Error("Coupon lifecycle evidence is missing or ambiguous");
    return rows[0];
  },
  /** Rejects failed generated-owner envelopes before accepting lifecycle evidence. @param {Object} response Generated response. @returns {void} Successful envelope or rejection. */
  assertLifecycleEnvelope: function (response) {
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length))
    )
      throw new Error("Coupon lifecycle persistence was not confirmed");
  },
  /** Commits a coupon CAS without rewriting immutable encrypted issuance and verifies the saved lifecycle patch. @param {Object} request Context. @param {Object} previous Current coupon. @param {Object} model Intended successor. @returns {Promise<Object>} Saved evidence. */
  commitLifecycleCoupon: async function (request, previous, model) {
    const service = SERVICE.DefaultCouponService;
    if (
      !service?.update ||
      !Number.isSafeInteger(previous.revision) ||
      previous.revision < 0
    )
      throw new Error("Revisioned coupon persistence owner is required");
    const protectedFields = ['protectedToken', 'secureIssuance', 'secureIssuanceCode'];
    for (const key of protectedFields) {
      if (Object.hasOwn(model, key) && !require('node:util').isDeepStrictEqual(model[key], previous[key]))
        throw new CLASSES.NodicsError('ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED');
    }
    const verifyProtected = protectedFields.filter(key => Object.hasOwn(model, key) && model[key] !== undefined);
    const secure = SERVICE.DefaultCouponSecureIssuanceService;
    if (verifyProtected.length && (typeof secure?.read !== 'function' || typeof secure.privateOperation !== 'function'))
      throw new CLASSES.NodicsError('ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED');
    // Lifecycle CAS changes state only; the secure owner retains issuance bytes in place.
    const patch = Object.fromEntries(Object.entries(model).filter(([key]) => !protectedFields.includes(key)));
    const cleared = Object.keys(patch).filter(key => patch[key] === undefined);
    const mutation = cleared.length ? {
      $set: Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)),
      $unset: Object.fromEntries(cleared.map(key => [key, ""])),
    } : patch;
    const command = {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        code: previous.code,
        revision: previous.revision,
        status: previous.status,
      }),
      model: mutation,
    };
    const response = SERVICE.DefaultCouponSellerAuthorizationService
      ? await SERVICE.DefaultCouponSellerAuthorizationService.writeCoupon(
          command,
        )
      : await service.update(command);
    this.assertLifecycleEnvelope(response);
    if (
      response.result?.acknowledged !== true ||
      response.result?.matchedCount !== 1
    )
      throw new Error(
        "Coupon lifecycle write lost its revision; inspect before retrying",
      );
    const saved = await this.readLifecycleCoupon(request, previous.code);
    if (
      Object.keys(patch).some(
        (key) => JSON.stringify(saved[key]) !== JSON.stringify(patch[key]),
      )
    )
      throw new Error(
        "Coupon lifecycle readback changed; inspect before retrying",
      );
    if (verifyProtected.length) {
      const rows = await secure.privateOperation(request, () => secure.read('DefaultCouponService', request,
        this.enterpriseQuery(request, { tenant: request.tenant, code: previous.code }), 1));
      const retained = rows[0];
      if (rows.length !== 1 || retained.revision !== saved.revision ||
          verifyProtected.some(key => !require('node:util').isDeepStrictEqual(retained[key], model[key])))
        throw new CLASSES.NodicsError('ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED');
    }
    return saved;
  },
  /** Reads the exact active owner campaign for a coupon purchase using the existing activated or legacy selection, never caller policy. @param {Object} request Trusted Store and partition context. @param {Object} coupon Owner unit with promotion identity. @returns {Promise<Object>} Active campaign and its activated selection flag; no mutation or purchase-time capture. @override Preserve exact selection, bounded uncached reads and no mutable fallback for activated policy. */
  couponPurchaseCampaign: async function (request, coupon) {
    const sellerReader = this.sellerPolicyReader(request);
    const delegated = sellerReader ? await sellerReader.readCoupon(request, coupon) : undefined;
    if (delegated !== undefined) return delegated;
    const service = SERVICE.DefaultPromotionService;
    if (!service?.get) throw new Error("Coupon campaign owner is required");
    const governedSeller = Boolean(
      coupon.sellerAuthorizationProof ||
      CONFIG.get("promotion")?.sellerAuthorization?.enabled === true,
    );
    const publication = SERVICE.DefaultPromotionPublicationService;
    const activated = publication?.deliveryEnabled(request) === true;
    const response = activated ? undefined : await service.get({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: governedSeller
        ? {
            tenant: request.tenant,
            code: coupon.promotionCode,
          }
        : this.enterpriseQuery(request, {
            tenant: request.tenant,
            code: coupon.promotionCode,
          }),
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2 },
    });
    if (!activated) this.assertLifecycleEnvelope(response);
    const value = activated
      ? (await this.promotions(request)).filter(policy => policy.code === coupon.promotionCode)
      : response.result,
      rows = Array.isArray(value) ? value : value?.code ? [value] : [];
    const campaign = rows.length === 1 ? rows[0] : undefined;
    if (
      !campaign ||
      (!activated && campaign.budgetAdmission) ||
      campaign.code !== coupon.promotionCode ||
      campaign.status !== "ACTIVE" ||
      campaign.active === false
    )
      throw new Error("The coupon campaign is not available for purchase");
    return { campaign, activated };
  },
  /** Captures bounded rights from selected owner policy with fresh operational consent rechecks, never caller policy or published grants. @param {Object} request Context. @param {Object} coupon Reserved unit. @param {Date} purchasedAt Original successful sale time. @returns {Promise<Object>} Retained rights patch or legacy empty patch. */
  capturePurchasedRights: async function (request, coupon, purchasedAt) {
    const governedSeller = Boolean(
      coupon.sellerAuthorizationProof ||
      CONFIG.get("promotion")?.sellerAuthorization?.enabled === true,
    );
    let sellerProof;
    if (governedSeller) {
      if (!SERVICE.DefaultCouponSellerAuthorizationService?.authorizeSale)
        throw new Error("Coupon seller authorization owner is unavailable");
      sellerProof = await SERVICE.DefaultCouponSellerAuthorizationService.authorizeSale(
        request,
        coupon,
      );
      if (!sellerProof) throw new Error("Coupon seller consent proof is unavailable");
    }
    const { campaign, activated } = await this.couponPurchaseCampaign(request, coupon);
    this.assertSupportedCouponBenefit(campaign);
    if (governedSeller) {
      const seller = SERVICE.DefaultCouponSellerAuthorizationService;
      if (activated) {
        if (seller.enterprise(campaign.issuerEnterpriseRef) !== seller.enterprise(coupon.issuerEnterpriseRef) ||
            seller.enterprise(campaign.vendorEnterpriseRef) !== seller.enterprise(coupon.vendorEnterpriseRef))
          throw new Error("Published coupon issuer or seller does not match its reserved unit");
        // Consents are live operational authority, never fields of immutable published policy.
        const currentProof = await seller.authorizeSale(request, coupon);
        if (!require("node:util").isDeepStrictEqual(currentProof, sellerProof))
          throw new Error("Original seller consent has changed");
      } else {
        seller.proof(request, { ...coupon, sellerAuthorizationProof: sellerProof }, campaign);
      }
    }
    const purchasedTime = purchasedAt?.getTime();
    if (
      !Number.isFinite(purchasedTime) ||
      (campaign.validFrom &&
        (!Number.isFinite(Date.parse(campaign.validFrom)) ||
          Date.parse(campaign.validFrom) > purchasedTime)) ||
      (campaign.validTo &&
        (!Number.isFinite(Date.parse(campaign.validTo)) ||
          Date.parse(campaign.validTo) <= purchasedTime))
    )
      throw new Error("Coupon campaign is outside its sale window");
    const policy = campaign.purchasedCouponPolicy;
    if (!policy) {
      const window = {};
      for (const key of ['validFrom', 'validTo']) {
        const values = [coupon[key], campaign[key]].filter(value => value !== undefined);
        if (!values.length) continue;
        const times = values.map(value => Date.parse(value));
        if (times.some(value => !Number.isFinite(value))) throw new Error('Coupon validity is invalid');
        const time = key === 'validFrom' ? Math.max(...times) : Math.min(...times);
        if ((key === 'validFrom' && time > purchasedTime) || (key === 'validTo' && time <= purchasedTime))
          throw new Error('Coupon is outside its sale window');
        window[key] = new Date(time);
      }
      return window;
    }
    const qualification = CONFIG.get("promotion").purchasedRights;
    if (qualification?.enabled !== true || qualification.qualified !== true)
      throw new Error("Purchased coupon rights are not qualified");
    const days = policy.validityDays,
      maximum = qualification.maximumValidityDays;
    if (
      !Number.isSafeInteger(maximum) ||
      maximum < 1 ||
      maximum > 36500 ||
      !Number.isSafeInteger(days) ||
      days < 1 ||
      days > maximum ||
      !Number.isSafeInteger(campaign.revision) ||
      campaign.revision < 0 ||
      !Number.isFinite(purchasedAt.getTime())
    )
      throw new Error("Purchased coupon policy is invalid");
    if (
      Object.keys(policy).some(
        (key) => !["validityDays", "terms", "refundPolicy"].includes(key),
      ) ||
      !Array.isArray(policy.terms) ||
      policy.terms.length > 30 ||
      policy.terms.some(
        (line) =>
          typeof line !== "string" || !line.trim() || line.length > 1000,
      )
    )
      throw new Error("Purchased coupon terms are invalid");
    if (
      policy.refundPolicy &&
      (Object.keys(policy.refundPolicy).some(
        (key) => !["windowHours", "requestTypes"].includes(key),
      ) ||
        !Number.isSafeInteger(policy.refundPolicy.windowHours) ||
        policy.refundPolicy.windowHours < 1 ||
        policy.refundPolicy.windowHours > days * 24 ||
        !Array.isArray(policy.refundPolicy.requestTypes) ||
        !policy.refundPolicy.requestTypes.length ||
        new Set(policy.refundPolicy.requestTypes).size !==
          policy.refundPolicy.requestTypes.length ||
        policy.refundPolicy.requestTypes.some(
          (type) => !["REFUND", "CANCELLATION"].includes(type),
        ))
    )
      throw new Error("Purchased refund policy is invalid");
    const snapshot = {
      version: 1,
      promotionCode: campaign.code,
      promotionRevision: campaign.revision,
      purchasedAt: purchasedAt.toISOString(),
      validityDays: days,
      name: campaign.name,
      conditions: campaign.conditions || {},
      actions: campaign.actions || {},
      terms: policy.terms,
      refundPolicy: policy.refundPolicy,
      issuerEnterpriseRef: coupon.issuerEnterpriseRef,
      vendorEnterpriseRef: coupon.vendorEnterpriseRef,
    };
    if (Buffer.byteLength(JSON.stringify(snapshot), "utf8") > 65536)
      throw new Error("Purchased coupon policy exceeds its bound");
    return {
      validFrom: purchasedAt,
      validTo: new Date(purchasedAt.getTime() + days * 86400000),
      purchasePolicy: JSON.parse(JSON.stringify(snapshot)),
    };
  },
  /** Resolves retained campaign rules only under independent qualification; legacy codes keep legacy policy. @param {Object} coupon Purchased code. @param {Object} campaign Current campaign. @returns {Object} Authoritative redemption rules. */
  purchasedCampaign: function (coupon, campaign) {
    if (!coupon.purchasePolicy) {
      if (campaign?.budgetAdmission)
        throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
      return campaign;
    }
    const p = CONFIG.get("promotion").purchasedRights,
      snapshot = coupon.purchasePolicy;
    if (
      p?.enabled !== true ||
      p.qualified !== true ||
      snapshot.version !== 1 ||
      snapshot.promotionCode !== coupon.promotionCode ||
      (campaign !== undefined && campaign?.code !== coupon.promotionCode) ||
      !Number.isSafeInteger(snapshot.promotionRevision) ||
      snapshot.promotionRevision < 0 ||
      !require("node:util").isDeepStrictEqual(
        snapshot.issuerEnterpriseRef,
        coupon.issuerEnterpriseRef,
      ) ||
      !require("node:util").isDeepStrictEqual(
        snapshot.vendorEnterpriseRef,
        coupon.vendorEnterpriseRef,
      ) ||
      Buffer.byteLength(JSON.stringify(snapshot), "utf8") > 65536 ||
      !coupon.soldAt ||
      typeof snapshot.purchasedAt !== "string" ||
      [coupon.soldAt, coupon.validTo].some(value => !(value instanceof Date) && typeof value !== "string") ||
      new Date(snapshot.purchasedAt).getTime() !== new Date(coupon.soldAt).getTime() ||
      !Number.isSafeInteger(snapshot.validityDays) ||
      snapshot.validityDays < 1 ||
      new Date(coupon.validTo).getTime() !==
        new Date(coupon.soldAt).getTime() + snapshot.validityDays * 86400000
    )
      throw new Error("Purchased coupon rights cannot be verified");
    return {
      ...snapshot,
      code: snapshot.promotionCode,
      active: true,
      status: "ACTIVE",
      validFrom: coupon.soldAt,
      validTo: coupon.validTo,
    };
  },
  /**
   * Executes `idempotencyKey` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} promotion Value defined by the owning module contract.
   * @param {*} targetCode Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  idempotencyKey: function (request, promotion, targetCode) {
    return (
      request.idempotencyKey ||
      (request.payload && request.payload.idempotencyKey) ||
      [request.tenant, request.ownerId, promotion.code, targetCode].join(":")
    );
  },
  /**
   * Executes `redemptionCode` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} promotion Value defined by the owning module contract.
   * @param {*} targetCode Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  redemptionCode: function (request, promotion, targetCode) {
    return [
      "promotionRedemption",
      crypto
        .createHash("sha1")
        .update(this.idempotencyKey(request, promotion, targetCode))
        .digest("hex"),
    ].join(":");
  },
  /**
   * Executes `couponBatchCode` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  couponBatchCode: function (request) {
    return (
      (request.payload && request.payload.batchCode) ||
      [
        "couponBatch",
        crypto
          .createHash("sha1")
          .update(
            [
              request.tenant,
              request.payload && request.payload.promotionCode,
              request.idempotencyKey || request.requestId || Date.now(),
            ].join(":"),
          )
          .digest("hex"),
      ].join(":")
    );
  },
  /**
   * Executes `persistBudgetLedger` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} input Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  persistBudgetLedger: async function (request, input) {
    this.requireOperationalRuntime();
    if (
      !SERVICE.DefaultPromotionBudgetLedgerService ||
      !SERVICE.DefaultPromotionBudgetLedgerService.save
    )
      return undefined;
    const model = this.withSchemaBase(
      {
        code: [
          "promotionBudgetLedger",
          crypto
            .createHash("sha1")
            .update(
              [
                request.tenant,
                input.promotionCode,
                input.mutationType,
                input.idempotencyKey,
                input.afterSpent,
              ].join(":"),
            )
            .digest("hex"),
        ].join(":"),
        tenant: request.tenant,
        promotionCode: input.promotionCode,
        mutationType: input.mutationType,
        amount: input.amount,
        beforeSpent: input.beforeSpent,
        afterSpent: input.afterSpent,
        targetCode: input.targetCode,
        idempotencyKey: input.idempotencyKey,
        actorId:
          request.actorId ||
          request.ownerId ||
          (request.authData &&
            (request.authData.principalId || request.authData.loginId)),
        correlationId: request.correlationId || request.requestId,
        occurredAt: this.schemaDate(request.now),
      },
      request,
    );
    return this.unwrap(
      await SERVICE.DefaultPromotionBudgetLedgerService.save({
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        model,
      }),
    );
  },
  /**
   * Executes `createCouponBatch` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  createCouponBatch: async function (request) {
    this.requireOperationalRuntime();
    const payload = request.payload || {};
    if (!payload.promotionCode)
      throw new Error("Promotion code is required for coupon batch");
    const tokens = this.generatedCouponCodes(request);
    const batch = {
      code: this.couponBatchCode(request),
      tenant: request.tenant,
      enterpriseCode: request.enterpriseCode || payload.enterpriseCode,
      promotionCode: payload.promotionCode,
      status: "GENERATED",
      issuedCount: tokens.length,
      reservedCount: 0,
      tokenHashPolicy: payload.tokenHashPolicy || "TENANT_UPPERCASE_SHA256",
      sourceReference: payload.sourceReference,
      revision: 0,
    };
    if (
      SERVICE.DefaultCouponBatchService &&
      SERVICE.DefaultCouponBatchService.save
    ) {
      await SERVICE.DefaultCouponBatchService.save({
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        model: this.withSchemaBase(batch, request),
      });
    }
    const coupons = [];
    for (const token of tokens) {
      const model = {
        code: [
          batch.code,
          crypto.createHash("sha1").update(String(token)).digest("hex"),
        ].join(":"),
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode || payload.enterpriseCode,
        promotionCode: payload.promotionCode,
        batchCode: batch.code,
        tokenHash: this.hashToken(request.tenant, token),
        status: "ACTIVE",
        maxUses: Number(payload.maxUses || 1),
        usedCount: 0,
        revision: 0,
      };
      const couponModel = this.withSchemaBase(model, request);
      coupons.push(couponModel);
      if (SERVICE.DefaultCouponService && SERVICE.DefaultCouponService.save) {
        await SERVICE.DefaultCouponService.save({
          tenant: request.tenant,
          authData: this.serviceAuthData(request),
          model: couponModel,
        });
      }
    }
    return { batch: this.withSchemaBase(batch, request), coupons };
  },
  /**
   * Executes `saveDraft` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  saveDraft: async function (request) {
    this.validatePolicyAuthoring(request);
    const payload = request.payload || {};
    if (!payload.code && !request.promotionCode)
      throw new Error("Promotion code is required for draft save");
    const code = request.promotionCode || payload.code;
    const now = request.now ? new Date(request.now) : new Date();
    const existing = await this.getOne(SERVICE.DefaultPromotionService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
      pageSize: 1,
    });
    const model = this.withSchemaBase(
      Object.assign({}, existing || {}, payload, {
        code,
        tenant: request.tenant,
        enterpriseCode: request.enterpriseCode || payload.enterpriseCode,
        active:
          payload.active !== undefined
            ? payload.active
            : existing && existing.active !== undefined
              ? existing.active
              : true,
        created:
          (existing && existing.created) ||
          (payload.created && new Date(payload.created)) ||
          now,
        updated: now,
        status: payload.status || (existing && existing.status) || "DRAFT",
        priority: Number(
          payload.priority !== undefined
            ? payload.priority
            : (existing && existing.priority) || 0,
        ),
        conditions:
          payload.conditions || (existing && existing.conditions) || {},
        actions: payload.actions || (existing && existing.actions) || {},
        budget: payload.budget || (existing && existing.budget),
        approval: Object.assign(
          {},
          existing && existing.approval,
          payload.approval,
          {
            lastEditedBy: request.actorId,
            lastEditedAt: now.toISOString(),
          },
        ),
        revision:
          Number((existing && existing.revision) || payload.revision || 0) +
          (existing ? 1 : 0),
      }),
      request,
    );
    const saved =
      (await this.updateOrSave(SERVICE.DefaultPromotionService, {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: existing
          ? this.enterpriseQuery(request, { tenant: request.tenant, code })
          : undefined,
        model,
      })) || model;
    return { promotion: saved, builderState: "DRAFT_SAVED" };
  },
  /**
   * Executes `loadPromotion` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  loadPromotion: async function (request) {
    const code =
      request.promotionCode ||
      (request.payload && request.payload.promotionCode) ||
      (request.payload && request.payload.code);
    if (!code) throw new Error("Promotion code is required");
    const promotion = await this.getOne(SERVICE.DefaultPromotionService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
      pageSize: 1,
    });
    if (!promotion) throw new Error("Promotion was not found");
    return promotion;
  },
  /**
   * Executes `transitionPromotion` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  transitionPromotion: async function (request) {
    const payload = request.payload || {};
    const promotion = await this.loadPromotion(request);
    if (
      request.actionCode === "APPROVE" &&
      promotion.approval &&
      promotion.approval.submittedBy &&
      promotion.approval.submittedBy === request.actorId
    ) {
      throw new Error(
        "Maker-checker separation is required for promotion approval",
      );
    }
    const now = request.now || new Date().toISOString();
    const approvalPatch = Object.assign({}, promotion.approval, {
      lastAction: request.actionCode,
      lastActionBy: request.actorId,
      lastActionAt: now,
      reasonCode:
        payload.reasonCode ||
        (promotion.approval && promotion.approval.reasonCode),
      conflictCheck:
        payload.conflictCheck ||
        (promotion.approval && promotion.approval.conflictCheck) ||
        "NOT_RUN",
    });
    if (request.actionCode === "SUBMIT") {
      approvalPatch.submittedBy = request.actorId;
      approvalPatch.submittedAt = now;
    }
    if (request.actionCode === "APPROVE") {
      approvalPatch.approvedBy = request.actorId;
      approvalPatch.approvedAt = now;
      approvalPatch.checklist = payload.checklist ||
        approvalPatch.checklist || [
          "eligibility reviewed",
          "budget reviewed",
          "coupon policy reviewed",
        ];
    }
    const model = this.withSchemaBase(
      Object.assign({}, promotion, {
        status: request.targetStatus,
        validFrom: payload.validFrom || promotion.validFrom,
        validTo: payload.validTo || promotion.validTo,
        approval: approvalPatch,
        revision: Number(promotion.revision || 0) + 1,
      }),
      request,
    );
    const updated =
      (await this.updateOrSave(SERVICE.DefaultPromotionService, {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant: request.tenant,
          code: promotion.code,
        }),
        model,
      })) || model;
    return {
      promotion: updated,
      actionCode: request.actionCode,
      builderState: [request.actionCode, "COMPLETE"].join("_"),
    };
  },
  /**
   * Executes `listFromService` as a loader-visible operation owned by this module.
   * @param {*} service Value defined by the owning module contract.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  listFromService: async function (service, request) {
    if (!service || !service.get) return [];
    const result = this.unwrap(await service.get(request));
    return Array.isArray(result) ? result : result ? [result] : [];
  },
  /**
   * Reads a bounded public ledger page with explicit generated query-count evidence.
   * Legacy unscoped reads remain unscoped; completeness does not imply issuer admission
   * or an atomic snapshot. Missing/contradictory provider evidence refuses.
   * @param {Object} request Tenant, optional enterprise, campaign and page selectors.
   * @returns {Promise<Object>} Existing promotionCode/entries plus scoped completeness metadata.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  budgetLedger: async function (request) {
    const promotionCode =
      request.promotionCode ||
      (request.payload && request.payload.promotionCode),
      tenant = request.tenant,
      enterpriseCode = request.enterpriseCode ?? null,
      paging = request.query || {},
      pageSize = paging.pageSize === undefined ? 100 : Number(paging.pageSize),
      pageNumber = paging.pageNumber === undefined ? 1 : Number(paging.pageNumber),
      offset = (pageNumber - 1) * pageSize;
    if (
      typeof tenant !== "string" || !tenant ||
      typeof promotionCode !== "string" || !promotionCode ||
      (enterpriseCode !== null && (typeof enterpriseCode !== "string" || !enterpriseCode)) ||
      [paging.pageSize, paging.pageNumber].some(value => value !== undefined &&
        (typeof value !== "number" && typeof value !== "string" ||
          typeof value === "string" && !/^[1-9]\d*$/.test(value))) ||
      !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 1000 ||
      !Number.isSafeInteger(pageNumber) || pageNumber < 1 ||
      !Number.isSafeInteger(offset) ||
      request.transactionContext !== undefined || request.internalPersistence !== undefined ||
      typeof SERVICE.DefaultPromotionBudgetLedgerService?.get !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_LEDGER_UNCONFIRMED");
    const command = {
        tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant,
          promotionCode,
        }),
        options: { skipItemCache: true, recursive: false },
        searchOptions: { pageSize, pageNumber, sort: { code: 1 } },
      },
      response = await SERVICE.DefaultPromotionBudgetLedgerService.get(command);
    if (
      !response || typeof response.code !== "string" || !response.code.startsWith("SUC_") ||
      response.error || response.success === false ||
      (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length > 0)) ||
      !Number.isSafeInteger(response.count) || response.count < 0 ||
      !Array.isArray(response.result) ||
      response.result.length !== Math.min(pageSize, Math.max(0, response.count - offset)) ||
      command.transactionContext !== undefined || command.internalPersistence !== undefined ||
      response.options?.limit !== pageSize || response.options?.skip !== offset ||
      !response.result.every(row => row && typeof row === "object" && !Array.isArray(row) &&
        typeof row.code === "string" && row.code && row.tenant === tenant &&
        row.promotionCode === promotionCode && (enterpriseCode === null || row.enterpriseCode === enterpriseCode)) ||
      new Set(response.result.map(row => row.code)).size !== response.result.length
    )
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_LEDGER_UNCONFIRMED");
    const entries = response.result;
    return {
      promotionCode,
      entries,
      completeness: {
        contractVersion: 1, tenant, enterpriseCode, promotionCode,
        totalCount: response.count, returnedCount: entries.length, pageNumber, pageSize,
        complete: pageNumber === 1 && response.count === entries.length,
      },
    };
  },
  /**
   * Executes `analytics` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  analytics: async function (request) {
    const promotionCode =
      request.promotionCode ||
      (request.payload && request.payload.promotionCode);
    if (!promotionCode)
      throw new Error("Promotion code is required for analytics");
    const redemptions = await this.listFromService(
      SERVICE.DefaultPromotionRedemptionService,
      {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant: request.tenant,
          promotionCode,
        }),
        pageSize: 1000,
      },
    );
    const ledger = await this.listFromService(
      SERVICE.DefaultPromotionBudgetLedgerService,
      {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant: request.tenant,
          promotionCode,
        }),
        pageSize: 1000,
      },
    );
    const coupons = await this.listFromService(SERVICE.DefaultCouponService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        promotionCode,
      }),
      pageSize: 1000,
    });
    const applied = redemptions.filter(
      (item) => item.status === "APPLIED",
    ).length;
    const reversed = redemptions.filter(
      (item) => item.status === "REVERSED",
    ).length;
    const committedAmount = ledger
      .filter((item) => item.mutationType === "COMMIT")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const releasedAmount = ledger
      .filter((item) => item.mutationType === "RELEASE")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      promotionCode,
      redemptionCount: redemptions.length,
      appliedCount: applied,
      reversedCount: reversed,
      couponIssuedCount: coupons.length,
      couponReservedCount: coupons.filter((item) => item.status === "RESERVED")
        .length,
      couponRedeemedCount: coupons.filter((item) => item.status === "REDEEMED")
        .length,
      budgetCommitted: this.exact().normalize(String(committedAmount)),
      budgetReleased: this.exact().normalize(String(releasedAmount)),
      budgetExposure: this.exact().normalize(
        String(committedAmount - releasedAmount),
      ),
    };
  },
  /**
   * Executes `couponRequired` as a loader-visible operation owned by this module.
   * @param {*} promotion Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  couponRequired: function (promotion) {
    return Boolean(
      promotion &&
      promotion.conditions &&
      promotion.conditions.couponRequired === true,
    );
  },
  /**
   * Executes `couponOwnershipRequired` as a loader-visible operation owned by this module.
   * @param {*} promotion Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  couponOwnershipRequired: function (promotion) {
    return Boolean(
      promotion &&
      promotion.conditions &&
      promotion.conditions.customerOwnsCouponCode === true,
    );
  },
  /**
   * Resolves configured promotion action amount against the request context.
   * @param {Object} request Promotion request.
   * @param {Object} action Promotion action.
   * @returns {string} Discount amount.
   */
  discountAmount: function (request, action) {
    const exact = this.exact();
    const discountType = String(action.discountType || "").toUpperCase();
    if (discountType === "PERCENT") {
      const subtotal = exact.normalize(
        String(
          request.subtotal ||
            (request.payload && request.payload.subtotal) ||
            "0",
        ),
      );
      const value = exact.normalize(
        String(action.discountValue || action.percent || "0"),
      );
      return exact.multiply(exact.multiply(subtotal, value), "0.01");
    }
    return action.discountAmount || "0.00";
  },
  /**
   * Executes `couponUsable` as a loader-visible operation owned by this module.
   * @param {*} coupon Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  couponUsable: function (coupon) {
    const activeStatuses = {
      ACTIVE: true,
      AVAILABLE: true,
      CLAIMED: true,
      DELIVERED: true,
    };
    return Boolean(
      coupon &&
      activeStatuses[coupon.status] &&
      coupon.benefitStatus !== "REDEEMED" &&
      Number(coupon.usedCount || 0) < Number(coupon.maxUses || 1),
    );
  },
  /**
   * Executes `couponSaleAvailable` as a loader-visible operation owned by this module.
   * @param {*} coupon Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  couponSaleAvailable: function (coupon) {
    const status = coupon && coupon.status;
    return Boolean(
      coupon &&
      (status === "ACTIVE" || status === "AVAILABLE") &&
      !coupon.soldTo &&
      !coupon.reservedFor &&
      Number(coupon.usedCount || 0) < Number(coupon.maxUses || 1),
    );
  },
  /**
   * Executes `loadCouponPool` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  loadCouponPool: async function (request) {
    const payload = request.payload || {};
    const query = this.enterpriseQuery(request, { tenant: request.tenant });
    if (payload.batchCode || request.batchCode)
      query.batchCode = payload.batchCode || request.batchCode;
    if (payload.promotionCode || request.promotionCode)
      query.promotionCode = payload.promotionCode || request.promotionCode;
    const maximum = Number(payload.pageSize || request.pageSize || 1000);
    if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 1000 || !SERVICE.DefaultCouponService?.get)
      throw new Error("Coupon pool persistence bound is unavailable");
    const response = await SERVICE.DefaultCouponService.get({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query,
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: maximum + 1, limit: maximum + 1 },
    });
    this.assertLifecycleEnvelope(response);
    const coupons = response.result;
    if (!Array.isArray(coupons) || coupons.length > maximum ||
        new Set(coupons.map(coupon => coupon.code)).size !== coupons.length ||
        coupons.some(coupon => !coupon.code || Object.entries(query).some(([key, value]) => coupon[key] !== value)))
      throw new Error("Coupon pool evidence is incomplete or foreign");
    return coupons.sort((a, b) => String(a.code).localeCompare(String(b.code)));
  },
  /** Requires selected supply reads to retain signed or private Product authority before any batch query; unselected legacy callers keep their existing path. @param {Object} request Original availability request. @returns {undefined} Guard complete. @override Narrow admission without accepting caller-selected batches or manufacturing service/public authority. */
  couponPoolAdmission: function (request) {
    if (!this.sellerPolicyReader(request)) return;
    const seller = SERVICE.DefaultCouponSellerAuthorizationService;
    if (typeof seller?.sellerReadContext !== "function")
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED");
    seller.sellerReadContext(request);
    if (!request.productCode || [request.batchCode, request.promotionCode,
        request.payload?.batchCode, request.payload?.promotionCode].some(value => value !== undefined))
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED");
    SERVICE.DefaultPromotionDistributionAdmissionService?.assertReadPurpose(request, "PRODUCT", request.productCode);
  },
  /**
   * Executes `couponPoolAvailability` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  couponPoolAvailability: async function (request) {
    this.couponPoolAdmission(request);
    if (request.productCode && !(request.batchCode || request.payload?.batchCode)) {
      if (!request.tenant || !request.enterpriseCode || !request.storeCode)
        throw new Error("Coupon Product scope is required");
      const sellerReader = this.sellerPolicyReader(request);
      const delegated = sellerReader ? await sellerReader.readProduct(request, request.productCode) : undefined;
      if (delegated === undefined && sellerReader &&
          SERVICE.DefaultPromotionDistributionAdmissionService?.resolveReadContext(request)) {
        // Product-only admission cannot fall through to signed root enumeration or claim unproven stock.
        SERVICE.DefaultPromotionDistributionAdmissionService.assertReadPurpose(request, "PRODUCT", request.productCode);
        return { available: false, availableQuantity: "0", inventoryStrategy: "COUPON_CODE_POOL",
          strategy: "COUPON_CODE_POOL", reservableAt: "CHECKOUT_BEFORE_PAYMENT", guaranteed: false };
      }
      const policies = delegated ? [delegated.campaign] : (await this.promotions(request)).filter(policy =>
        policy.status === "ACTIVE" && policy.conditions?.sourceProductCode === request.productCode);
      if (policies.length !== 1) throw new Error("Coupon Product policy is missing or ambiguous");
      this.assertSupportedCouponBenefit(policies[0]);
      const query = this.enterpriseQuery(request, { tenant: request.tenant, promotionCode: policies[0].code, status: "GENERATED" });
      if (delegated) query.code = delegated.batchCode;
      const response = await SERVICE.DefaultCouponBatchService.get({ tenant: request.tenant,
        authData: this.serviceAuthData(request), query, options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, limit: 2 } });
      this.assertLifecycleEnvelope(response);
      if (!Array.isArray(response.result) || response.result.length !== 1 ||
          Object.entries(query).some(([key, value]) => response.result[0][key] !== value))
        throw new Error("Coupon Product batch is missing or ambiguous");
      request = { ...request, batchCode: response.result[0].code, promotionCode: policies[0].code };
    }
    const coupons = await this.loadCouponPool(request);
    const available = coupons.filter((coupon) =>
      this.couponSaleAvailable(coupon),
    );
    return {
      available:
        available.length >=
        Number(
          request.quantity ||
            (request.payload && request.payload.quantity) ||
            1,
        ),
      availableQuantity: String(available.length),
      issuedQuantity: String(coupons.length),
      inventoryStrategy: "COUPON_CODE_POOL",
      strategy: "COUPON_CODE_POOL",
      reservableAt: "CHECKOUT_BEFORE_PAYMENT",
      guaranteed: false,
      batchCode: request.batchCode || request.payload?.batchCode,
      couponBatchCode: request.batchCode || request.payload?.batchCode,
      promotionCode: request.promotionCode || request.payload?.promotionCode,
    };
  },
  /**
   * Reconciles only the exact original pre-payment coupon reservation, never sold or claimed units.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  recoverCouponCodeReservation: async function (request) {
    this.requireOperationalRuntime();
    const fail = () => { throw Object.assign(new Error('Coupon compensation is unconfirmed'), { code: 'ERR_CHECKOUT_COMPENSATION_UNCONFIRMED' }); };
    const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,255}$/.test(value);
    if (!['tenant', 'enterpriseCode', 'ownerId', 'idempotencyKey', 'cartCode', 'entryCode', 'productCode', 'sku']
      .every(k => identifier(request[k]))) fail();
    const read = async () => {
      const query = { tenant: request.tenant, idempotencyKey: request.idempotencyKey };
      const response = await SERVICE.DefaultCouponService.get({ tenant: request.tenant, authData: this.serviceAuthData(request),
        query, options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
      this.assertLifecycleEnvelope(response);
      if (response.acknowledged === false || !Array.isArray(response.result) || response.result.length > 1 ||
          response.count !== response.result.length || [response.total, response.totalCount].some(n => n !== undefined && n !== response.result.length) ||
          response.result.some(row => Object.entries(query).some(([k, v]) => row[k] !== v))) fail();
      return response.result;
    };
    const rows = await read();
    if (rows.length) {
      const coupon = rows[0];
      if (coupon.enterpriseCode !== request.enterpriseCode || coupon.reservedFor !== request.ownerId ||
          coupon.status !== 'RESERVED' || coupon.saleStatus !== 'RESERVED' || coupon.benefitStatus !== 'UNCLAIMED' ||
          coupon.soldTo || coupon.soldAt || coupon.deliveredAt || coupon.claimedAt || coupon.redeemedAt ||
          !identifier(coupon.code) || !identifier(coupon.orderCode) || !Number.isSafeInteger(coupon.revision) || coupon.revision < 0 ||
          ['cartCode', 'entryCode', 'productCode', 'sku'].some(k => coupon[k] !== request[k])) fail();
      const saved = await this.releaseCouponCodeReservation({ ...request, payload: { couponCode: coupon.code } });
      if (saved?.code !== coupon.code || saved.tenant !== request.tenant || saved.enterpriseCode !== request.enterpriseCode ||
          saved.status !== 'ACTIVE' || saved.saleStatus !== 'AVAILABLE' || saved.revision !== coupon.revision + 1 ||
          ['reservedFor', 'reservedAt', 'reservedUntil', 'idempotencyKey', 'orderCode', 'cartCode', 'entryCode', 'productCode', 'sku', 'benefitStatus']
            .some(k => saved[k] !== undefined) || (await read()).length) fail();
    }
    return { status: 'COMPLETED', reservationKey: request.idempotencyKey };
  },
  /** Finds an existing reservation; this legacy convenience read does not establish absence or recovery authority. */
  findCouponByIdempotency: async function (request) {
    if (!request.idempotencyKey) return undefined;
    return this.getOne(SERVICE.DefaultCouponService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        idempotencyKey: request.idempotencyKey,
      }),
      pageSize: 1,
    });
  },
  /**
   * Executes `reserveCouponCodeForCheckout` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  reserveCouponCodeForCheckout: async function (request) {
    this.requireOperationalRuntime();
    const existing = await this.findCouponByIdempotency(request);
    const payload = request.payload || {};
    if (
      !request.ownerId ||
      !request.idempotencyKey ||
      !payload.orderCode ||
      !payload.batchCode
    )
      throw new Error("Coupon reservation identity is required");
    if (existing) {
      const current = await this.readLifecycleCoupon(request, existing.code);
      if (
        current.idempotencyKey !== request.idempotencyKey ||
        current.orderCode !== payload.orderCode ||
        current.batchCode !== payload.batchCode ||
        current.productCode !== payload.productCode ||
        current.entryCode !== payload.entryCode ||
        !["RESERVED", "SOLD", "DELIVERED", "CLAIMED", "REDEEMED"].includes(
          current.status,
        ) ||
        (current.soldTo || current.reservedFor) !== request.ownerId
      )
        throw new Error(
          "Coupon reservation replay differs from its original purchase",
        );
      if (current.status === "RESERVED")
        this.assertSupportedCouponBenefit((await this.couponPurchaseCampaign(request, current)).campaign);
      return current;
    }
    const coupons = await this.loadCouponPool(request);
    const coupon = coupons.find((item) => this.couponSaleAvailable(item));
    if (!coupon) throw new Error("Coupon code stock unavailable");
    this.assertSupportedCouponBenefit((await this.couponPurchaseCampaign(request, coupon)).campaign);
    if (
      CONFIG.get("promotion")?.sellerAuthorization?.enabled === true &&
      !SERVICE.DefaultCouponSellerAuthorizationService?.authorizeSale
    )
      throw new Error("Coupon seller authorization owner is unavailable");
    const sellerAuthorizationProof =
      await SERVICE.DefaultCouponSellerAuthorizationService?.authorizeSale(
        request,
        coupon,
      );
    const reservedAt = this.schemaDate(request.now);
    const reservedUntil = payload.reservedUntil
      ? this.schemaDate(payload.reservedUntil)
      : new Date(
          reservedAt.getTime() + Number(payload.ttlSeconds || 900) * 1000,
        );
    const model = this.withSchemaBase(
      Object.assign({}, coupon, {
        status: "RESERVED",
        saleStatus: "RESERVED",
        benefitStatus: coupon.benefitStatus || "UNCLAIMED",
        reservedFor: request.ownerId,
        orderCode: payload.orderCode,
        cartCode: payload.cartCode,
        entryCode: payload.entryCode,
        productCode: payload.productCode,
        sku: payload.sku,
        idempotencyKey: request.idempotencyKey,
        reservedAt,
        reservedUntil,
        ...(sellerAuthorizationProof ? { sellerAuthorizationProof } : {}),
        revision: Number(coupon.revision || 0) + 1,
      }),
      request,
    );
    return this.commitLifecycleCoupon(request, coupon, model);
  },
  /**
   * Executes `transitionReservedCouponSale` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} targetStatus Value defined by the owning module contract.
   * @param {*} patch Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  /** Resolves one purchased code by a presented token or internal identity without returning secrets to the browser. */
  merchantCoupon: async function (request) {
    const query = request.couponToken
      ? {
          tokenHash: this.tokenHashSelector(
            request.tenant,
            request.couponToken.trim(),
          ),
        }
      : { code: request.couponCode };
    const candidates = await this.listFromService(
      SERVICE.DefaultCouponService,
      {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, query),
        pageSize: 2,
      },
    );
    const coupon = candidates.length === 1 ? candidates[0] : undefined;
    if (
      !coupon ||
      !coupon.soldTo ||
      !["DELIVERED", "CLAIMED", "REDEEMED"].includes(coupon.status)
    )
      throw new Error("The purchased coupon is unavailable");
    return this.withEnterpriseAssociations(coupon, request);
  },
  /** Locks or completes revocation of an unused purchased coupon under a stable approved order refund reference. */
  revokePurchasedCoupon: async function (request) {
    this.requireOperationalRuntime();
    if (!request.refundCode)
      throw new Error("Approved refund reference is required");
    const coupon = await this.readLifecycleCoupon(request, request.couponCode);
    if (
      !coupon ||
      coupon.soldTo !== request.ownerId ||
      coupon.orderCode !== request.orderCode
    )
      throw new Error("The coupon does not belong to this order");
    if (coupon.refundReference && coupon.refundReference !== request.refundCode)
      throw new Error("This coupon belongs to another refund");
    const target = request.complete ? "REVOKED" : "REFUND_PENDING";
    if (coupon.status === target || coupon.status === "REVOKED")
      return { code: coupon.code, status: coupon.status };
    if (
      !["DELIVERED", "REFUND_PENDING"].includes(coupon.status) ||
      !["UNCLAIMED", undefined].includes(coupon.benefitStatus)
    )
      throw new Error("A used or claimed coupon requires manual resolution");
    const model = this.withSchemaBase(
      {
        ...coupon,
        status: target,
        refundReference: request.refundCode,
        revision: Number(coupon.revision || 0) + 1,
      },
      request,
    );
    const saved = await this.commitLifecycleCoupon(request, coupon, model);
    if (saved.status !== target || saved.refundReference !== request.refundCode)
      throw new Error("Coupon refund lock changed; reload before retrying");
    return { code: saved.code, status: saved.status };
  },
  /** Enforces supported purchased-code conditions; richer campaigns require an owning Promotion override before merchant use. */
  validateMerchantConditions: function (campaign, coupon, request = {}) {
    const conditions = campaign.conditions || {};
    if (
      Object.keys(conditions).some(
        (k) =>
          ![
            "couponRequired",
            "customerOwnsCouponCode",
            "sourceProductCode",
            "storeCodes",
            ...(CONFIG.get("promotion")?.merchantBenefits?.enabled === true
              ? ["minimumSubtotal"]
              : []),
          ].includes(k),
      )
    )
      throw new Error(
        "This campaign requires additional merchant eligibility integration",
      );
    if (
      conditions.sourceProductCode &&
      conditions.sourceProductCode !== coupon.productCode
    )
      throw new Error("The coupon product does not match its campaign");
    if (
      conditions.storeCodes !== undefined &&
      (!Array.isArray(conditions.storeCodes) ||
        !conditions.storeCodes.length ||
        conditions.storeCodes.length > 100 ||
        new Set(conditions.storeCodes).size !== conditions.storeCodes.length ||
        conditions.storeCodes.some(
          (code) =>
            typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code),
        ) ||
        !conditions.storeCodes.includes(request.storeCode))
    )
      throw new Error("This outlet is not eligible for the campaign");
  },
  /** Requires qualified exact item rights before purchase or merchant eligibility. @param {Object} campaign Exact owner campaign or retained purchased campaign. @returns {void} No mutation. @throws {NodicsError} ERR_PROMOTION_BENEFIT_UNCONFIRMED without an owning item integration. @override Preserve independent delivery proof; never infer items from descriptions or monetary flags. */
  assertSupportedCouponBenefit: function (campaign) {
    const type = campaign.actions?.benefitType;
    if (typeof type === "string" && type.trim().toUpperCase() === "ITEM") {
      if (typeof SERVICE.DefaultPromotionItemBenefitService?.assertPolicy === "function" &&
          typeof SERVICE.DefaultPromotionItemBenefitService?.validate === "function") {
        SERVICE.DefaultPromotionItemBenefitService.assertPolicy(campaign);
        return;
      }
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_BENEFIT_UNCONFIRMED",
        "Item benefits require an owning fulfillment integration",
      );
    }
  },
  /** Reads and validates a sold POS coupon without consuming it or exposing its secret. */
  validateMerchantCoupon: async function (request) {
    let stage = "COUPON_READ";
    try {
    const query = (code) => ({
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
      pageSize: 1,
    });
    const coupon = await this.getOne(
      SERVICE.DefaultCouponService,
      query(request.couponCode),
    );
    stage = "COUPON_BINDING";
    if (
      !coupon ||
      coupon.soldTo !== request.ownerId ||
      coupon.productCode !== request.productCode ||
      !["DELIVERED", "CLAIMED"].includes(coupon.status)
    )
      throw new Error("The purchased coupon is unavailable");
    if (
      coupon.status === "CLAIMED" &&
      (coupon.claimTargetType !== "POS" ||
        coupon.claimTargetCode !== request.targetCode)
    )
      throw new Error("The coupon is bound to another fulfillment target");
    stage = "CAMPAIGN";
    let campaign = await this.merchantCampaign(request, coupon);
    campaign = this.purchasedCampaign(coupon, campaign);
    if (
      !campaign ||
      campaign.status !== "ACTIVE" ||
      campaign.active === false ||
      coupon.active === false
    )
      throw new Error("The coupon campaign is unavailable");
    if (
      request.promotionCodes &&
      !request.promotionCodes.includes(coupon.promotionCode)
    )
      throw new Error("The merchant does not accept this campaign");
    stage = "WINDOW";
    for (const item of [coupon, campaign]) {
      if (
        item.validFrom &&
        (!Number.isFinite(Date.parse(item.validFrom)) ||
          Date.parse(item.validFrom) > Date.now())
      )
        throw new Error("The coupon is not yet valid");
      if (
        item.validTo &&
        (!Number.isFinite(Date.parse(item.validTo)) ||
          Date.parse(item.validTo) <= Date.now())
      )
        throw new Error("The coupon has expired; request manual order review");
    }
    stage = "CONDITIONS";
    this.assertSupportedCouponBenefit(campaign);
    this.validateMerchantConditions(campaign, coupon, request);
    if (
      CONFIG.get("promotion")?.merchantBenefits?.enabled === true &&
      campaign.actions?.benefitType !== "ITEM" &&
      !SERVICE.DefaultPromotionMerchantBenefitService?.validate
    )
      throw new Error("Merchant benefit owner is unavailable");
    const benefitOwner = campaign.actions?.benefitType === "ITEM"
      ? SERVICE.DefaultPromotionItemBenefitService : SERVICE.DefaultPromotionMerchantBenefitService;
    stage = "BENEFIT";
    const benefit =
      await benefitOwner?.validate(
        request,
        campaign,
        coupon,
      );
    return {
      eligible: true,
      promotionCode: coupon.promotionCode,
      conditions: {
        ...(benefit ? { benefit } : {}),
        name: campaign.name,
        validFrom: campaign.validFrom,
        validTo: campaign.validTo,
        discountType: campaign.actions?.discountType,
        discountValue: campaign.actions?.discountValue,
      },
    };
    } catch (error) {
      if (error && typeof error === "object") merchantValidationFailures.set(error, stage);
      throw error;
    }
  },
  /** Resolves only a private exact issuer-owned purchased campaign; ordinary requests keep their strict enterprise selector. @param {Object} request Original owner command. @param {Object} coupon Persisted purchased unit. @returns {Promise<Object|undefined>} Current owner campaign. */
  merchantCampaign: async function (request, coupon) {
    const delegated = await SERVICE.DefaultPromotionMerchantScopeService?.readPurchasedCampaign(request, coupon);
    if (delegated !== undefined) return delegated;
    return this.getOne(SERVICE.DefaultPromotionService, { tenant: request.tenant,
      authData: this.serviceAuthData(request), query: this.enterpriseQuery(request,
        { tenant: request.tenant, code: coupon.promotionCode }), pageSize: 1 });
  },
  /** Transitions an original reserved coupon sale under its current lifecycle and immutable purchase references. */
  transitionReservedCouponSale: async function (request, targetStatus, patch) {
    this.requireOperationalRuntime();
    const payload = request.payload || {};
    const couponCode = payload.couponCode || request.couponCode;
    if (!couponCode) throw new Error("Coupon code is required");
    const coupon = await this.readLifecycleCoupon(request, couponCode);
    if (!coupon) throw new Error("Coupon was not found");
    const ownerId = request.ownerId || coupon.reservedFor || coupon.soldTo;
    if (
      coupon.reservedFor &&
      request.ownerId &&
      coupon.reservedFor !== request.ownerId
    )
      throw new Error("Coupon is reserved for another customer");
    if (coupon.soldTo && request.ownerId && coupon.soldTo !== request.ownerId)
      throw new Error("Coupon is owned by another customer");
    if (targetStatus === "SOLD" || targetStatus === "DELIVERED") {
      if (
        !request.ownerId ||
        !payload.orderCode ||
        (coupon.orderCode && coupon.orderCode !== payload.orderCode) ||
        !request.idempotencyKey ||
        coupon.idempotencyKey !== request.idempotencyKey
      )
        throw new Error(
          "Coupon purchase identity does not match its reservation",
        );
      if (
        ["SOLD", "DELIVERED", "CLAIMED", "REDEEMED"].includes(coupon.status)
      ) {
        if (
          coupon.soldTo !== request.ownerId ||
          coupon.orderCode !== payload.orderCode ||
          !coupon.soldAt
        )
          throw new Error("Coupon original purchase evidence is incomplete");
        if (targetStatus === "SOLD" || coupon.status !== "SOLD") return coupon;
      }
      if (targetStatus === "SOLD" && coupon.status !== "RESERVED")
        throw new Error("Only a reserved coupon can be sold");
      if (targetStatus === "DELIVERED" && coupon.status !== "SOLD")
        throw new Error("Only a sold coupon can be delivered");
      if (targetStatus === "SOLD") {
        if (
          (coupon.sellerAuthorizationProof ||
            CONFIG.get("promotion")?.sellerAuthorization?.enabled === true) &&
          !SERVICE.DefaultCouponSellerAuthorizationService?.authorizeSale
        )
          throw new Error("Coupon seller authorization owner is unavailable");
        patch = {
          ...patch,
          ...(await this.capturePurchasedRights(request, coupon, patch.soldAt)),
        };
      }
    }
    if (targetStatus === "CLAIMED" || targetStatus === "REDEEMED") {
      const targetCode = payload.targetCode;
      const targetType = payload.targetType;
      if (coupon.status === targetStatus) {
        const previousCode =
          targetStatus === "CLAIMED"
            ? coupon.claimTargetCode
            : coupon.redeemedTargetCode;
        const previousType =
          targetStatus === "CLAIMED"
            ? coupon.claimTargetType
            : coupon.redeemedTargetType;
        if (previousCode !== targetCode || previousType !== targetType)
          throw new Error(
            "Coupon is already bound to another fulfillment target",
          );
        return coupon;
      }
      if (targetType === "POS") {
        if (!targetCode)
          throw new CLASSES.NodicsError(
            "ERR_PROMOTION_POS_INVALID",
            "A reviewed POS fulfillment target is required",
          );
        let campaign = await this.merchantCampaign(request, coupon);
        campaign = this.purchasedCampaign(coupon, campaign);
        if (!campaign || campaign.active === false)
          throw new CLASSES.NodicsError(
            "ERR_PROMOTION_POS_INVALID",
            "The coupon campaign is unavailable",
          );
        const now = Date.now();
        if (
          campaign.validFrom &&
          (!Number.isFinite(Date.parse(campaign.validFrom)) ||
            Date.parse(campaign.validFrom) > now)
        )
          throw new CLASSES.NodicsError(
            "ERR_PROMOTION_POS_INVALID",
            "The coupon is not yet valid",
          );
        if (
          campaign.validTo &&
          (!Number.isFinite(Date.parse(campaign.validTo)) ||
            Date.parse(campaign.validTo) <= now)
        )
          throw new CLASSES.NodicsError(
            "ERR_PROMOTION_POS_INVALID",
            "The coupon has expired; request manual order review",
          );
      }
      if (targetStatus === "CLAIMED" && coupon.status !== "DELIVERED")
        throw new Error("Only a delivered coupon can be claimed");
      if (targetStatus === "REDEEMED" && coupon.status !== "CLAIMED")
        throw new Error("Only a claimed coupon can be redeemed");
      if (coupon.purchasePolicy) {
        this.purchasedCampaign(coupon);
        if (Date.parse(coupon.validTo) <= Date.now())
          throw new Error("The purchased coupon has expired");
      }
      if (
        targetStatus === "REDEEMED" &&
        coupon.claimTargetType === "POS" &&
        (targetType !== "POS" || targetCode !== coupon.claimTargetCode)
      )
        throw new Error("POS redemption must use the original claimed target");
      patch = Object.assign(
        {},
        patch,
        targetStatus === "CLAIMED"
          ? { claimTargetCode: targetCode, claimTargetType: targetType }
          : { redeemedTargetCode: targetCode, redeemedTargetType: targetType },
      );
    }
    const model = this.withSchemaBase(
      Object.assign({}, coupon, patch || {}, {
        status: targetStatus,
        soldTo:
          targetStatus === "SOLD" ||
          targetStatus === "DELIVERED" ||
          targetStatus === "CLAIMED" ||
          targetStatus === "REDEEMED"
            ? ownerId
            : coupon.soldTo,
        revision: Number(coupon.revision || 0) + 1,
      }),
      request,
    );
    return this.commitLifecycleCoupon(request, coupon, model);
  },
  /**
   * Executes `confirmCouponCodeSale` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  confirmCouponCodeSale: async function (request) {
    this.requireOperationalRuntime();
    return this.transitionReservedCouponSale(request, "SOLD", {
      saleStatus: "SOLD",
      benefitStatus: "UNCLAIMED",
      orderCode: request.payload && request.payload.orderCode,
      soldAt: this.schemaDate(),
    });
  },
  /**
   * Executes `deliverCouponCodeSale` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  deliverCouponCodeSale: async function (request) {
    this.requireOperationalRuntime();
    return this.transitionReservedCouponSale(request, "DELIVERED", {
      saleStatus: "DELIVERED",
      benefitStatus: "UNCLAIMED",
      orderCode: request.payload && request.payload.orderCode,
      deliveredAt: this.schemaDate(request.now),
    });
  },
  /**
   * Executes `releaseCouponCodeReservation` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  releaseCouponCodeReservation: async function (request) {
    this.requireOperationalRuntime();
    const payload = request.payload || {};
    const couponCode = payload.couponCode || request.couponCode;
    if (!couponCode) throw new Error("Coupon code is required");
    const coupon = await this.readLifecycleCoupon(request, couponCode);
    if (!coupon) return undefined;
    if (coupon.status !== "RESERVED") return coupon;
    if (
      coupon.reservedFor &&
      request.ownerId &&
      coupon.reservedFor !== request.ownerId
    )
      throw new Error("Coupon is reserved for another customer");
    const model = this.withSchemaBase(
      Object.assign({}, coupon, {
        status: "ACTIVE",
        saleStatus: "AVAILABLE",
        benefitStatus: undefined,
        reservedFor: undefined,
        reservedAt: undefined,
        reservedUntil: undefined,
        idempotencyKey: undefined,
        orderCode: undefined,
        cartCode: undefined,
        entryCode: undefined,
        productCode: undefined,
        sku: undefined,
        revision: Number(coupon.revision || 0) + 1,
      }),
      request,
    );
    if (
      !request.idempotencyKey ||
      coupon.idempotencyKey !== request.idempotencyKey
    )
      throw new Error(
        "Coupon release must use its original reservation command",
      );
    return this.commitLifecycleCoupon(request, coupon, model);
  },
  /**
   * Executes `claimPurchasedCouponCode` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  claimPurchasedCouponCode: async function (request) {
    this.requireOperationalRuntime();
    return this.transitionReservedCouponSale(request, "CLAIMED", {
      saleStatus: "DELIVERED",
      benefitStatus: "CLAIMED",
      claimedAt: this.schemaDate(request.now),
    });
  },
  /**
   * Executes `redeemClaimedCouponCode` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  redeemClaimedCouponCode: async function (request) {
    this.requireOperationalRuntime();
    const payload = request.payload || {};
    const coupon = await this.transitionReservedCouponSale(
      request,
      "REDEEMED",
      {
        saleStatus: "DELIVERED",
        benefitStatus: "REDEEMED",
        usedCount: Number(payload.usedCount || 1),
        redeemedAt: this.schemaDate(request.now),
      },
    );
    return coupon;
  },
  /**
   * Executes `loadCouponCandidates` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  loadCouponCandidates: async function (request) {
    const couponCode =
      (request.payload && request.payload.couponCode) || request.couponCode;
    if (!couponCode) return [];
    const result = await this.listFromService(SERVICE.DefaultCouponService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        tokenHash: this.tokenHashSelector(request.tenant, couponCode),
      }),
      pageSize: 20,
    });
    return result.filter(
      (coupon) =>
        this.couponUsable(coupon) &&
        (!coupon.soldTo ||
          !request.ownerId ||
          coupon.soldTo === request.ownerId),
    );
  },
  /**
   * Executes `selectPromotionForRequest` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} preview Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  selectPromotionForRequest: async function (request, preview) {
    const selected =
      preview && Array.isArray(preview.selected) ? preview.selected : [];
    const couponCode =
      (request.payload && request.payload.couponCode) || request.couponCode;
    if (!couponCode) {
      return {
        promotion: selected.find(
          (promotion) => !this.couponRequired(promotion),
        ),
      };
    }
    const coupons = await this.loadCouponCandidates(request);
    for (const promotion of selected) {
      const coupon = coupons.find(
        (item) => item.promotionCode === promotion.code,
      );
      if (
        coupon &&
        (!this.couponOwnershipRequired(promotion) ||
          coupon.soldTo === request.ownerId)
      )
        return { promotion, coupon };
    }
    throw new Error("Coupon is invalid for eligible promotions");
  },
  /**
   * Executes `setCouponBatchReservation` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} status Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  setCouponBatchReservation: async function (request, status) {
    this.requireOperationalRuntime();
    const payload = request.payload || {};
    const batchCode = payload.batchCode || request.batchCode;
    if (!batchCode) throw new Error("Coupon batch code is required");
    const batch = await this.getOne(SERVICE.DefaultCouponBatchService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        code: batchCode,
      }),
      pageSize: 1,
    });
    if (!batch) throw new Error("Coupon batch was not found");
    const coupons =
      this.unwrap(
        await SERVICE.DefaultCouponService.get({
          tenant: request.tenant,
          authData: this.serviceAuthData(request),
          query: this.enterpriseQuery(request, {
            tenant: request.tenant,
            batchCode,
          }),
          pageSize: 1000,
        }),
      ) || [];
    const couponRows = Array.isArray(coupons) ? coupons : [coupons];
    let reservedCount = 0;
    for (const coupon of couponRows) {
      const model = Object.assign({}, coupon, {
        status,
        reservedFor:
          status === "RESERVED"
            ? payload.reservedFor || request.ownerId
            : undefined,
        revision: Number(coupon.revision || 0) + 1,
      });
      if (status === "RESERVED") reservedCount += 1;
      await this.updateOrSave(SERVICE.DefaultCouponService, {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant: request.tenant,
          code: coupon.code,
        }),
        model: this.withSchemaBase(model, request),
      });
    }
    const updatedBatch = this.withSchemaBase(
      Object.assign({}, batch, {
        status: status === "RESERVED" ? "RESERVED" : "RELEASED",
        reservedCount,
        revision: Number(batch.revision || 0) + 1,
      }),
      request,
    );
    await this.updateOrSave(SERVICE.DefaultCouponBatchService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        code: batch.code,
      }),
      model: updatedBatch,
    });
    return {
      batch: updatedBatch,
      coupons: couponRows.map((coupon) =>
        Object.assign({}, coupon, { status }),
      ),
    };
  },
  /**
   * Executes `loadCoupon` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} promotion Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  loadCoupon: async function (request, promotion) {
    const couponCode = request.payload && request.payload.couponCode;
    if (!couponCode) {
      if (this.couponRequired(promotion))
        throw new Error("Coupon code is required for selected promotion");
      return undefined;
    }
    const coupon = await this.getOne(SERVICE.DefaultCouponService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        promotionCode: promotion.code,
        tokenHash: this.tokenHashSelector(request.tenant, couponCode),
      }),
      pageSize: 1,
    });
    if (!coupon) throw new Error("Coupon is invalid for selected promotion");
    if (!this.couponUsable(coupon)) throw new Error("Coupon is not usable");
    if (
      this.couponOwnershipRequired(promotion) &&
      coupon.soldTo !== request.ownerId
    )
      throw new Error("Coupon is not owned by customer");
    return coupon;
  },
  /**
   * Executes `consumeCoupon` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} coupon Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  consumeCoupon: async function (request, coupon) {
    this.requireOperationalRuntime();
    if (!coupon) return undefined;
    const usedCount = Number(coupon.usedCount || 0) + 1;
    const model = {
      usedCount,
      status:
        usedCount >= Number(coupon.maxUses || 1) ? "REDEEMED" : "ACTIVE",
      benefitStatus:
        usedCount >= Number(coupon.maxUses || 1) ? "REDEEMED" : "CLAIMED",
      revision: Number(coupon.revision || 0) + 1,
    };
    return this.commitLifecycleCoupon(request, coupon, model);
  },
  /**
   * Executes `consumeBudget` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} promotion Value defined by the owning module contract.
   * @param {*} amount Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  consumeBudget: async function (request, promotion, amount) {
    this.requireOperationalRuntime();
    if (promotion.budgetAdmission)
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    if (!promotion.budget) return promotion;
    const delivery =
      typeof CONFIG === "undefined"
        ? {}
        : ((CONFIG.get("promotion") || {}).publication || {}).delivery || {};
    if (
      delivery.enabled === true &&
      SERVICE.DefaultPromotionPublicationService.deliveryEnabled(request)
    )
      return this.consumeActivatedBudget(request, promotion, amount);
    const exact = this.exact();
    const spent = exact.normalize(String(promotion.budget.spent || "0.00"));
    const limit = exact.normalize(String(promotion.budget.limit || "0.00"));
    const nextSpent = exact.add
      ? exact.add(spent, amount)
      : String(Number(spent) + Number(amount));
    if (
      exact.compare
        ? exact.compare(nextSpent, limit) > 0
        : Number(nextSpent) > Number(limit)
    )
      throw new Error("Promotion budget exhausted");
    const model = this.withSchemaBase(
      Object.assign({}, promotion, {
        budget: Object.assign({}, promotion.budget, { spent: nextSpent }),
        revision: Number(promotion.revision || 0) + 1,
      }),
      request,
    );
    const updated =
      await this.persistLegacyBudget({
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant: request.tenant,
          code: promotion.code,
        }),
        model,
      });
    await this.persistBudgetLedger(request, {
      promotionCode: promotion.code,
      mutationType: "COMMIT",
      amount,
      beforeSpent: spent,
      afterSpent: nextSpent,
      targetCode:
        (request.payload && request.payload.cartCode) || request.ownerId,
      idempotencyKey: this.idempotencyKey(
        request,
        promotion,
        (request.payload && request.payload.cartCode) || request.ownerId,
      ),
    });
    return updated;
  },
  /** Consumes only live budget state under CAS; retained policy never overwrites the current rule record. */
  consumeActivatedBudget: async function (request, policy, amount) {
    this.requireOperationalRuntime();
    const publication = SERVICE.DefaultPromotionPublicationService;
    const scope = publication.scope(request);
    if (policy.tenant !== scope.tenant || policy.enterpriseCode !== scope.enterpriseCode)
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Delegated policy reads do not authorize issuer budget mutation");
    const owner = SERVICE.DefaultPromotionBudgetMutationService;
    if (!owner?.consume)
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    return owner.consume(request, policy, amount);
  },
  /**
   * Executes `releaseCoupon` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} redemption Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  releaseCoupon: async function (request, redemption) {
    this.requireOperationalRuntime();
    if (!redemption.couponCode) return undefined;
    const coupon = await this.readLifecycleCoupon(request, redemption.couponCode);
    const usedCount = Math.max(0, Number(coupon.usedCount || 0) - 1);
    const model = {
      usedCount,
      status:
        coupon.status === "REDEEMED" &&
        usedCount < Number(coupon.maxUses || 1)
          ? coupon.soldTo
            ? "DELIVERED"
            : "ACTIVE"
          : coupon.status,
      benefitStatus: usedCount <= 0 ? "UNCLAIMED" : coupon.benefitStatus,
      revision: Number(coupon.revision || 0) + 1,
    };
    return this.commitLifecycleCoupon(request, coupon, model);
  },
  /**
   * Executes `releaseBudget` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} redemption Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  releaseBudget: async function (request, redemption) {
    this.requireOperationalRuntime();
    const publication = SERVICE.DefaultPromotionPublicationService;
    const delivery = typeof CONFIG === "undefined" ? {} :
      ((CONFIG.get("promotion") || {}).publication || {}).delivery || {};
    if (delivery.enabled === true) {
      if (!publication?.deliveryEnabled)
        throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
      if (publication.deliveryEnabled(request)) {
        const owner = SERVICE.DefaultPromotionBudgetMutationService;
        if (!owner?.release)
          throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
        return owner.release(request, redemption);
      }
    }
    const promotion = await this.getOne(SERVICE.DefaultPromotionService, {
      tenant: request.tenant,
      authData: this.serviceAuthData(request),
      query: this.enterpriseQuery(request, {
        tenant: request.tenant,
        code: redemption.promotionCode,
      }),
      pageSize: 1,
    });
    if (promotion?.budgetAdmission)
      throw new CLASSES.NodicsError("ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED");
    if (!promotion || !promotion.budget) return undefined;
    const exact = this.exact();
    const spent = exact.normalize(String(promotion.budget.spent || "0.00"));
    const discountAmount = exact.normalize(
      String(redemption.discountAmount || "0.00"),
    );
    let nextSpent = exact.add
      ? exact.add(
          spent,
          discountAmount.startsWith("-")
            ? discountAmount.slice(1)
            : `-${discountAmount}`,
        )
      : String(Number(spent) - Number(discountAmount));
    if (
      exact.compare ? exact.compare(nextSpent, "0") < 0 : Number(nextSpent) < 0
    )
      nextSpent = "0";
    const patch = {
      budget: Object.assign({}, promotion.budget, { spent: nextSpent }),
      revision: Number(promotion.revision || 0) + 1,
    };
    const model = this.withSchemaBase(Object.assign({}, promotion, patch), request);
    const updated =
      await this.persistLegacyBudget({
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, {
          tenant: request.tenant,
          code: promotion.code,
        }),
        model,
      });
    await this.persistBudgetLedger(request, {
      promotionCode: promotion.code,
      mutationType: "RELEASE",
      amount: discountAmount,
      beforeSpent: spent,
      afterSpent: nextSpent,
      targetCode: redemption.targetCode,
      idempotencyKey:
        redemption.idempotencyKey || [redemption.code, "release"].join(":"),
    });
    return updated;
  },
  /**
   * Executes `persistDecision` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} decision Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  persistDecision: async function (request, decision) {
    this.requireOperationalRuntime();
    const decidedAt = this.schemaDate(request.now);
    const model = this.withSchemaBase(
      Object.assign(
        {
          code: [
            "discountDecision",
            decision.promotionCode,
            decision.targetCode,
          ].join(":"),
          decidedAt,
        },
        decision,
      ),
      request,
    );
    if (
      SERVICE.DefaultDiscountDecisionService &&
      SERVICE.DefaultDiscountDecisionService.save
    ) {
      await SERVICE.DefaultDiscountDecisionService.save({
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        model,
      });
    }
    return model;
  },
  /**
   * Executes `persistRedemption` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @param {*} promotion Value defined by the owning module contract.
   * @param {*} coupon Value defined by the owning module contract.
   * @param {*} decision Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  persistRedemption: async function (request, promotion, coupon, decision) {
    this.requireOperationalRuntime();
    const targetCode = decision.targetCode;
    const appliedAt = this.schemaDate(request.now);
    const model = this.withSchemaBase(
      {
        code: this.redemptionCode(request, promotion, targetCode),
        tenant: request.tenant,
        enterpriseCode:
          request.enterpriseCode ||
          promotion.enterpriseCode ||
          decision.enterpriseCode,
        promotionCode: promotion.code,
        couponCode: coupon && coupon.code,
        orderCode: request.payload && request.payload.orderCode,
        cartCode:
          (request.payload && request.payload.cartCode) || request.cartCode,
        ownerId: request.ownerId,
        targetType: decision.targetType,
        targetCode,
        discountAmount: decision.discountAmount,
        currency: decision.currency,
        status: "APPLIED",
        decisionCode: decision.code,
        idempotencyKey: this.idempotencyKey(request, promotion, targetCode),
        correlationId:
          request.correlationId || request.requestId || decision.correlationId,
        revision: 0,
        appliedAt,
      },
      request,
    );
    if (
      SERVICE.DefaultPromotionRedemptionService &&
      SERVICE.DefaultPromotionRedemptionService.save
    ) {
      return this.unwrap(
        await SERVICE.DefaultPromotionRedemptionService.save({
          tenant: request.tenant,
          authData: this.serviceAuthData(request),
          model,
        }),
      );
    }
    return model;
  },
  /**
   * Executes `preview` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  preview: async function (request) {
    const promotions = await this.promotions(request);
    const simulation = SERVICE.DefaultPromotionSimulationService.simulate(
      {
        tenant: request.tenant,
        context: this.context(request),
        now: request.now,
      },
      promotions,
    );
    return Object.assign({}, simulation, {
      ownerId: request.ownerId,
      cartCode: request.payload && request.payload.cartCode,
      redemptionStateMutation: "NONE",
    });
  },
  /**
   * Executes `quote` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  quote: async function (request) {
    const preview = await this.preview(
      Object.assign({}, request, {
        payload: Object.assign({}, request.payload, {
          cartCode:
            (request.payload && request.payload.cartCode) || request.cartCode,
          couponCode:
            (request.payload && request.payload.couponCode) ||
            request.couponCode,
          subtotal:
            (request.payload && request.payload.subtotal) || request.subtotal,
          productCodes:
            (request.payload && request.payload.productCodes) ||
            request.productCodes ||
            [],
          customerGroup:
            (request.payload && request.payload.customerGroup) ||
            request.customerGroup,
          currency:
            (request.payload && request.payload.currency) || request.currency,
        }),
      }),
    );
    const selection = await this.selectPromotionForRequest(request, preview);
    if (!selection.promotion)
      return {
        discountAmount: "0",
        reasonCode: "NO_APPLICABLE_PROMOTION",
        sourceHash: "none",
        mutationPerformed: false,
      };
    const action = selection.promotion.actions || {};
    const decision = SERVICE.DefaultPromotionDecisionService.decide(
      {
        tenant: request.tenant,
        promotionCode: selection.promotion.code,
        targetType:
          request.targetType ||
          (request.cartCode ? "CART" : "CUSTOMER_CONTEXT"),
        targetCode: request.cartCode || request.ownerId,
        discountAmount: this.discountAmount(request, action),
        currency:
          request.currency || (request.payload && request.payload.currency),
        reasonCode: action.reasonCode || "APPLIED",
        correlationId: request.correlationId || request.requestId,
      },
      selection.promotion,
      this.exact(),
    );
    return Object.freeze(
      Object.assign({}, decision, {
        couponCode: selection.coupon && selection.coupon.code,
        mode: "QUOTE",
        mutationPerformed: false,
      }),
    );
  },
  /**
   * Executes `apply` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  apply: async function (request) {
    this.requireOperationalRuntime();
    const preview = await this.preview(request);
    const selection = await this.selectPromotionForRequest(request, preview);
    const selected = selection.promotion;
    if (!selected) {
      return Object.assign({}, preview, {
        applied: false,
        reasonCode: "NO_ELIGIBLE_PROMOTION",
        decisions: [],
      });
    }
    const action = selected.actions || {};
    const coupon =
      selection.coupon || (await this.loadCoupon(request, selected));
    const decision = SERVICE.DefaultPromotionDecisionService.decide(
      {
        tenant: request.tenant,
        promotionCode: selected.code,
        targetType:
          (request.payload && request.payload.targetType) ||
          (request.payload && request.payload.cartCode
            ? "CART"
            : "CUSTOMER_CONTEXT"),
        targetCode:
          (request.payload && request.payload.cartCode) || request.ownerId,
        discountAmount: this.discountAmount(request, action),
        currency: request.payload && request.payload.currency,
        reasonCode: action.reasonCode || "APPLIED",
        correlationId: request.correlationId || request.requestId,
      },
      selected,
      this.exact(),
    );
    const persistedDecision = await this.persistDecision(request, decision);
    await this.consumeBudget(
      request,
      selected,
      persistedDecision.discountAmount,
    );
    await this.consumeCoupon(request, coupon);
    const redemption = await this.persistRedemption(
      request,
      selected,
      coupon,
      persistedDecision,
    );
    return Object.assign({}, preview, {
      applied: true,
      decisions: [persistedDecision],
      redemption,
      redemptionStateMutation: "COMMITTED",
    });
  },
  /**
   * Executes `reverse` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  reverse: async function (request) {
    this.requireOperationalRuntime();
    const code =
      request.redemptionCode ||
      (request.payload && request.payload.redemptionCode);
    if (!code)
      throw new Error("Promotion redemption code is required for reversal");
    const redemption = await this.getOne(
      SERVICE.DefaultPromotionRedemptionService,
      {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
        pageSize: 1,
      },
    );
    if (!redemption) throw new Error("Promotion redemption was not found");
    if (redemption.status === "REVERSED")
      return { reversed: true, redemption, idempotent: true };
    const releasedCoupon = await this.releaseCoupon(request, redemption);
    const releasedPromotion = await this.releaseBudget(request, redemption);
    const model = this.withSchemaBase(
      Object.assign({}, redemption, {
        status: "REVERSED",
        reversalReasonCode:
          (request.payload && request.payload.reasonCode) ||
          "REVERSAL_REQUESTED",
        reversedAt: this.schemaDate(request.now),
        revision: Number(redemption.revision || 0) + 1,
      }),
      request,
    );
    const updated = await this.updateOrSave(
      SERVICE.DefaultPromotionRedemptionService,
      {
        tenant: request.tenant,
        authData: this.serviceAuthData(request),
        query: this.enterpriseQuery(request, { tenant: request.tenant, code }),
        model,
      },
    );
    return {
      reversed: true,
      redemption: updated || model,
      idempotent: false,
      compensation: {
        couponReleased: Boolean(releasedCoupon),
        budgetReleased: Boolean(releasedPromotion),
        couponCode: releasedCoupon && releasedCoupon.code,
        promotionCode: releasedPromotion && releasedPromotion.code,
        budgetSpent:
          releasedPromotion &&
          releasedPromotion.budget &&
          releasedPromotion.budget.spent,
      },
    };
  },
};
