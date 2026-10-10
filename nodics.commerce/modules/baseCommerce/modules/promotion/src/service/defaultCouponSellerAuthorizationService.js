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
const writes = new WeakSet();
const consentWrites = new WeakMap();
/** @module promotion/service/defaultCouponSellerAuthorizationService @description Owns issuer-reviewed seller consent on the existing campaign and fresh sale-time admission. @layer service @owner promotion @override Later layers may narrow policy and Profile scope matching; preserve issuer authority, bounded consent, private writes and revision binding. */
module.exports = {
  /** Rejects ambiguous authority without exposing Profile payloads or credentials. @returns {never} Typed refusal. */
  failAuthority: function () {
    throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Current Profile authority could not be confirmed");
  },
  /** Checks every bounded Profile wrapper, including terminal failure evidence. @param {*} value Owner response. @returns {*} Checked terminal result. */
  profileResult: function (value) {
    for (let depth = 0; depth <= 7; depth++) {
      if (!value || typeof value !== "object" || value.error || value.success === false || value.acknowledged === false ||
          (value.code !== undefined && !/^SUC_/.test(value.code) && !Array.isArray(value)) ||
          (value.errors !== undefined && (!Array.isArray(value.errors) || value.errors.length))) this.failAuthority();
      if (Array.isArray(value) || value.data === undefined && value.result === undefined) return value;
      if (depth === 7 || value.data !== undefined && value.result !== undefined) this.failAuthority();
      value = value.data !== undefined ? value.data : value.result;
    }
    this.failAuthority();
  },
  /** Detaches mutable command data before owner awaits; routed transport and opaque contexts stay outside cloning. @param {Object} r Original operation. @returns {Object} Stable caller inputs. */
  detached: function (r) {
    return { ...r, authData: structuredClone(r.authData || {}),
      ...(r.payload !== undefined ? { payload: structuredClone(r.payload) } : {}),
      ...(r.query !== undefined ? { query: structuredClone(r.query) } : {}) };
  },
  /** Reads independently qualified seller-consent policy. @returns {Object|undefined} Enabled policy. */
  policy: function () {
    const p = CONFIG.get("promotion")?.sellerAuthorization;
    if (p?.enabled !== true) return undefined;
    if (
      p.qualified !== true ||
      !Number.isSafeInteger(p.maximumSellers) ||
      p.maximumSellers < 1 ||
      p.maximumSellers > 100
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Coupon seller authorization is not qualified",
      );
    return p;
  },
  /** Accepts canonical Profile enterprise references only. @param {Object} ref Reference. @returns {string} Code. */
  enterprise: function (ref) {
    if (
      !ref ||
      typeof ref.code !== "string" ||
      ref.moduleName !== "profile" ||
      ref.schemaName !== "enterprise" ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(ref.code || "")
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Canonical coupon enterprise references are required",
      );
    return ref.code;
  },
  /** Reads one fresh campaign from its existing generated owner. @param {Object} r Owner context. @param {string} code Campaign code. @returns {Promise<Object>} Campaign. */
  campaign: async function (r, code) {
    if (
      typeof r.tenant !== "string" ||
      !r.tenant ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(code || "")
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Bounded seller authority context is required",
      );
    const owner = SERVICE.DefaultPromotionOperationService;
    const response = await SERVICE.DefaultPromotionService.get({
      tenant: r.tenant,
      authData: owner.serviceAuthData(r),
      query: { tenant: r.tenant, code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2 },
    });
    owner.assertLifecycleEnvelope(response);
    const rows = Array.isArray(response.result)
      ? response.result
      : response.result?.code
        ? [response.result]
        : [];
    if (
      rows.length !== 1 ||
      rows[0].code !== code ||
      rows[0].active !== true ||
      !Number.isSafeInteger(rows[0].revision) ||
      rows[0].revision < 0
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Coupon campaign authority is unavailable",
      );
    return rows[0];
  },
  /** Requires one current active Profile enterprise; referenced business identity is never inferred from a campaign name. @param {Object} r Trusted context. @param {string} code Canonical enterprise. @returns {Promise<void>} Current active owner. */
  activeEnterprise: async function (r, code) {
    r = this.detached(r);
    if (typeof r.tenant !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(r.tenant) ||
        typeof code !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(code)) this.failAuthority();
    const value = this.profileResult(await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      targetAuthority: { runtimeRole: "PLATFORM" },
      tenant: r.tenant,
      request: { tenant: r.tenant },
      apiName: "/references/read",
      methodName: "POST",
      requestBody: { type: "enterprise", codes: [code] },
      timeoutMs: 10000,
      maxAttempts: 1,
    }));
    const rows = Array.isArray(value) ? value : [];
    // Profile's Enterprise.tenant is a business relationship, not the routed storage partition.
    if (rows.length !== 1 || !rows[0] || rows[0].code !== code || rows[0].active !== true)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Current active issuer and seller enterprises are required",
      );
  },
  /** Inspects bounded seller consents using current issuer authority. @param {Object} r Signed issuer request. @returns {Promise<Object>} Safe revisioned list. */
  inspect: async function (r) {
    r = this.detached(r);
    if (
      !this.policy() ||
      Object.keys(r.query || {}).length ||
      Object.keys(r.payload || {}).length
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller authority inspection is unavailable",
      );
    const campaign = await this.campaign(r, r.promotionCode);
    await this.issuer(r, this.enterprise(campaign.issuerEnterpriseRef));
    const grants = campaign.sellerAuthorizations || [];
    if (!Array.isArray(grants) || grants.length > this.policy().maximumSellers)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller authority evidence exceeds its bound",
      );
    return {
      promotionCode: campaign.code,
      promotionRevision: campaign.revision,
      sellers: grants.map((grant) => this.project(grant)),
    };
  },
  /** Re-resolves the signed issuer employee's current Profile scope, with explicit denial precedence. @param {Object} r Signed employee context. @param {string} issuer Issuer code. @returns {Promise<void>} Authority or refusal. */
  issuer: async function (r, issuer) {
    r = this.detached(r);
    const auth = r.authData || {},
      router = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.tenant !== r.tenant ||
      typeof r.tenant !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(r.tenant) ||
      typeof issuer !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(issuer) ||
      (auth.enterpriseCode || auth.entCode) !== issuer ||
      [r.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== r.tenant) ||
      [r.enterpriseCode, r.entCode, auth.enterpriseCode, auth.entCode].some(value => value !== undefined && value !== issuer) ||
      typeof auth.loginId !== "string" || !auth.loginId.trim() || auth.loginId !== auth.loginId.trim() ||
      auth.loginId.length > 192 || /[\u0000-\u001f\u007f]/.test(auth.loginId) ||
      typeof r.authorization !== "string" || !/^Bearer [^\s\u0000-\u001f\u007f]{1,16384}$/i.test(r.authorization) ||
      typeof router?.isPermissionGranted !== "function" || typeof router?.getGrantedPermissions !== "function" ||
      !router.isPermissionGranted(
        "commerce.coupon.seller.manage",
        router.getGrantedPermissions(r),
        {},
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Current issuer administration is required",
      );
    const value = this.profileResult(await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      targetAuthority: { runtimeRole: "PLATFORM" },
      tenant: r.tenant,
      request: { tenant: r.tenant },
      apiName: "/identity/scopes/me",
      methodName: "GET",
      header: { Authorization: r.authorization, "X-Enterprise-Code": issuer },
      timeoutMs: 10000,
      maxAttempts: 1,
    }));
    if (value.principalCode !== auth.loginId ||
        value.principalType !== undefined && value.principalType !== "human" ||
        !Array.isArray(value.scopes) || !Array.isArray(value.deniedScopes) ||
        value.scopes.length + value.deniedScopes.length > 1000 ||
        value.scopeCount !== undefined && value.scopeCount !== value.scopes.length) this.failAuthority();
    const text = item => typeof item === "string" && item.length > 0 && item.length <= 128 &&
      item === item.trim() && !/[\u0000-\u001f\u007f]/.test(item);
    for (const [scopes, effect] of [[value.scopes, "ALLOW"], [value.deniedScopes, "DENY"]]) for (const scope of scopes) {
      if (!scope || typeof scope !== "object" || Array.isArray(scope) || !text(scope.scopeType) || !text(scope.scopeCode) ||
          ["tenantCode", "enterpriseCode", "capabilityCode", "permissionCode"].some(key => scope[key] !== undefined &&
            scope[key] !== null && scope[key] !== "" && !text(scope[key])) ||
          scope.effect !== undefined && scope.effect !== effect || scope.active === false ||
          scope.status !== undefined && scope.status !== "ACTIVE") this.failAuthority();
    }
    const matches = (scope) =>
      (!scope.tenantCode || scope.tenantCode === r.tenant) &&
      (!scope.enterpriseCode || scope.enterpriseCode === issuer) &&
      (!scope.capabilityCode ||
        ["*", "commerce", "promotion"].includes(scope.capabilityCode)) &&
      (!scope.permissionCode ||
        router.isPermissionGranted(
          "commerce.coupon.seller.manage",
          [scope.permissionCode],
          {},
        )) &&
      ((scope.scopeType === "ENTERPRISE" && scope.scopeCode === issuer) ||
        (scope.scopeType === "TENANT" && scope.scopeCode === r.tenant) ||
        (scope.scopeType === "GLOBAL" && scope.scopeCode === "*"));
    if (
      value?.principalCode !== auth.loginId ||
      !Array.isArray(value.scopes) ||
      !Array.isArray(value.deniedScopes) ||
      !value.scopes.some(matches) ||
      value.deniedScopes.some(matches)
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Issuer scope does not authorize seller administration",
      );
  },
  /** Admits a bounded issuer command and retains revisioned consent on the campaign, never a parallel seller registry. @param {Object} r Signed context and exact command. @returns {Promise<Object>} Safe seller consent. */
  manage: async function (r) {
    r = this.detached(r);
    const policy = this.policy(),
      p = r.payload || {};
    SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
    if (
      !policy ||
      Object.keys(p).some(
        (key) =>
          ![
            "sellerEnterpriseCode",
            "expectedRevision",
            "action",
            "expiresAt",
            "commandReference",
            "benefitConsumption",
          ].includes(key),
      ) ||
      Object.keys(r.query || {}).length ||
      typeof p.sellerEnterpriseCode !== "string" ||
      typeof p.commandReference !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(p.sellerEnterpriseCode || "") ||
      !/^[A-Za-z0-9_.:-]{8,128}$/.test(p.commandReference || "") ||
      !["GRANT", "REVOKE"].includes(p.action) ||
      Object.hasOwn(p, "benefitConsumption") &&
        (p.action !== "GRANT" || p.benefitConsumption !== "ISSUED_COUPON_BENEFIT_V1")
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Invalid reviewed seller command",
      );
    const campaign = await this.campaign(r, r.promotionCode),
      issuer = this.enterprise(campaign.issuerEnterpriseRef);
    await this.issuer(r, issuer);
    if (p.sellerEnterpriseCode === issuer)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Issuer self-selling does not require delegated consent",
      );
    if (
      p.action === "GRANT" &&
      (typeof p.expiresAt !== "string" ||
        p.expiresAt.length > 64 ||
        !Number.isFinite(Date.parse(p.expiresAt)) ||
        Date.parse(p.expiresAt) <= Date.now())
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent requires a future expiry",
      );
    if (p.action === "REVOKE" && p.expiresAt !== undefined)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Revocation cannot change original consent expiry",
      );
    if (p.action === "GRANT")
      await this.activeEnterprise(r, p.sellerEnterpriseCode);
    const distribution = SERVICE.DefaultPromotionDistributionAdmissionService;
    if (typeof distribution?.assertInstalled !== "function" || await distribution.assertInstalled(r) !== true)
      this.failAuthority();
    const grants = campaign.sellerAuthorizations || [];
    if (
      !Array.isArray(grants) ||
      grants.length > policy.maximumSellers ||
      new Set(grants.map((g) => g.sellerEnterpriseCode)).size !== grants.length
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent evidence is invalid",
      );
    const previous = grants.find(
        (g) => g.sellerEnterpriseCode === p.sellerEnterpriseCode,
      ),
      actor = r.authData.principalId || r.authData.loginId;
    if (previous?.benefitConsumption !== undefined && previous.benefitConsumption !== "ISSUED_COUPON_BENEFIT_V1")
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Original consent benefit purpose is invalid");
    const benefitConsumption = p.action === "GRANT" ? p.benefitConsumption : previous?.benefitConsumption;
    const commandParts = [campaign.code, issuer, actor, p.sellerEnterpriseCode, p.action,
      p.expiresAt || null, p.expectedRevision, p.commandReference];
    // Absence keeps the original distribution-only command hash/replay contract unchanged.
    if (benefitConsumption !== undefined) commandParts.push({ benefitConsumption });
    const commandHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify(commandParts),
      )
      .digest("hex");
    if (previous?.commandReference === p.commandReference) {
      if (previous.commandHash !== commandHash || previous.benefitConsumption !== benefitConsumption)
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Seller command replay conflicts",
        );
      return {
        promotionCode: campaign.code,
        promotionRevision: campaign.revision,
        seller: this.project(previous),
      };
    }
    if (
      campaign.revision !== p.expectedRevision ||
      !Number.isSafeInteger(p.expectedRevision) ||
      (!previous && grants.length >= policy.maximumSellers) ||
      (p.action === "REVOKE" && !previous)
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent changed; reload before retrying",
      );
    const grant = {
      sellerEnterpriseCode: p.sellerEnterpriseCode,
      issuerEnterpriseCode: issuer,
      status: p.action === "GRANT" ? "ACTIVE" : "REVOKED",
      revision: (previous?.revision || 0) + 1,
      expiresAt:
        p.action === "GRANT"
          ? new Date(p.expiresAt).toISOString()
          : previous.expiresAt,
      actorId: actor,
      reviewedAt: new Date().toISOString(),
      commandReference: p.commandReference,
      commandHash,
      ...(benefitConsumption !== undefined ? { benefitConsumption } : {}),
    };
    const command = {
      tenant: r.tenant,
      authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
      query: {
        code: campaign.code,
        tenant: r.tenant,
        revision: campaign.revision,
      },
      model: {
        code: campaign.code,
        revision: campaign.revision + 1,
        sellerAuthorizations: [
          ...grants.filter(
            (g) => g.sellerEnterpriseCode !== grant.sellerEnterpriseCode,
          ),
          grant,
        ],
      },
    };
    consentWrites.set(command, structuredClone({
      tenant: command.tenant, query: command.query, model: command.model,
    }));
    try {
      await SERVICE.DefaultPromotionService.update(command);
    } catch (_) {
      /* Exact readback below reconciles a lost acknowledgement without another write. */
    } finally {
      consentWrites.delete(command);
    }
    const saved = await this.campaign(r, campaign.code),
      persisted = saved.sellerAuthorizations?.find(
        (g) => g.sellerEnterpriseCode === grant.sellerEnterpriseCode,
      );
    if (
      saved.revision !== campaign.revision + 1 ||
      !require("node:util").isDeepStrictEqual(persisted, grant)
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent commit is unconfirmed; inspect before retrying",
      );
    return {
      promotionCode: saved.code,
      promotionRevision: saved.revision,
      seller: this.project(persisted),
    };
  },
  /** Projects consent without actor or command proof. @param {Object} grant Stored consent. @returns {Object} Safe DTO. */
  project: function (grant) {
    return {
      sellerEnterpriseCode: grant.sellerEnterpriseCode,
      status: grant.status,
      revision: grant.revision,
      expiresAt: grant.expiresAt,
      ...(grant.benefitConsumption !== undefined ? { benefitConsumption: this.benefitPurpose(grant.benefitConsumption) } : {}),
    };
  },
  /** Projects only the exact reviewed coupon-benefit purpose, refusing malformed retained authority. @param {*} value Stored purpose. @returns {string} Exact supported purpose. */
  benefitPurpose: function (value) {
    if (value !== "ISSUED_COUPON_BENEFIT_V1")
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Original consent benefit purpose is invalid");
    return value;
  },
  /** Recognizes only the exact in-flight campaign consent CAS with unchanged tenant, equality selector and narrow fields. Copies grant nothing; mutation of an admitted command fails before persistence. @param {Object} command Generated update request. @returns {boolean} Private consent-only admission. */
  isSellerConsentWrite: function (command) {
    const expected = consentWrites.get(command);
    if (!expected) return false;
    if (
      command.models !== undefined ||
      Object.keys(command.query || {}).sort().join(",") !== "code,revision,tenant" ||
      Object.keys(command.model || {}).sort().join(",") !== "code,revision,sellerAuthorizations" ||
      !require("node:util").isDeepStrictEqual(
        { tenant: command.tenant, query: command.query, model: command.model },
        expected,
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent command cannot mutate other campaign fields",
      );
    return true;
  },
  /** Writes only an owner-built coupon CAS under private request-identity admission. @param {Object} command Fixed owner request. @returns {Promise<Object>} Generated result. */
  writeCoupon: async function (command) {
    writes.add(command);
    try {
      return await SERVICE.DefaultCouponService.update(command);
    } finally {
      writes.delete(command);
    }
  },
  /** Recognizes only the exact in-flight lifecycle CAS; callers cannot manufacture this identity. @param {Object} command Generated request. @returns {boolean} Private admission. */
  isCouponWrite: function (command) {
    if (SERVICE.DefaultPromotionCouponBudgetService?.isFenceWrite?.(command)) return true;
    return writes.has(command);
  },
  /** Prevents generic coupon writes from manufacturing or clearing reserved issuer-consent evidence. @param {Object} r Generated request. @returns {boolean} Admitted legacy non-proof write. */
  protectCoupon: function (r) {
    if (writes.has(r)) return true;
    this.assertMutationShape(r.model);
    if (SERVICE.DefaultCouponSecureIssuanceService?.isIssuanceWrite(r)) return true;
    if (/sellerAuthorizationProof/.test(JSON.stringify(r.model || {})))
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Coupon consent evidence is owner-managed",
      );
    r.query = {
      ...(r.query || {}),
      sellerAuthorizationProof: { $exists: false },
    };
    return true;
  },
  /** Prevents generic writes from manufacturing seller consent or changing its issuer. @param {Object} r Generated owner request. @returns {Promise<boolean>} Admitted non-consent mutation. */
  protect: async function (r) {
    if (this.isSellerConsentWrite(r)) return true;
    if (writes.has(r)) return true;
    if (SERVICE.DefaultPromotionBudgetAdmissionService?.isAdmissionWrite(r))
      return true;
    this.assertMutationShape(r.model);
    if (/sellerAuthorizations/.test(JSON.stringify(r.model || {})))
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent requires its issuer command",
      );
    if (
      /issuerEnterpriseRef|issuerEnterpriseCode/.test(
        JSON.stringify(r.model || {}),
      )
    ) {
      const response = await SERVICE.DefaultPromotionService.get({
        tenant: r.tenant,
        authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
        query: r.query || { code: r.model?.code },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 101 },
      });
      SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(
        response,
      );
      const rows = Array.isArray(response.result)
        ? response.result
        : response.result?.code
          ? [response.result]
          : [];
      if (
        rows.length > 100 ||
        rows.some((row) => row.sellerAuthorizations?.length)
      )
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Issuer-bound seller consent cannot be reassigned by generic writes",
        );
      r.query = {
        ...(r.query || {}),
        "sellerAuthorizations.0": { $exists: false },
      };
    }
    return true;
  },
  /** Refuses replacement/rename update operators that could erase evidence without naming it. @param {Object|Object[]} model Generated mutation shape. @returns {void} Explicit partial mutation only. */
  assertMutationShape: function (model) {
    const models = Array.isArray(model) ? model : [model];
    for (const value of models) {
      if (
        value &&
        typeof value === "object" &&
        Object.keys(value).some(
          (key) =>
            key.startsWith("$") &&
            !["$set", "$unset", "$setOnInsert"].includes(key),
        )
      )
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Consent evidence requires explicit field mutations",
        );
    }
  },
  /** Fences generic removal against every campaign carrying retained consent evidence. @param {Object} r Generated removal request. @returns {Promise<boolean>} Legacy unbound removal only. */
  protectRemove: async function (r) {
    await this.protect(r);
    r.query = {
      ...(r.query || {}),
      "sellerAuthorizations.0": { $exists: false },
    };
    return true;
  },
  /** Reads current issuer consent before allocation and sale; a revoked/re-granted consent cannot revive an old reservation. @param {Object} r Trusted checkout context. @param {Object} coupon Current provider unit. @returns {Promise<Object|undefined>} Bound consent evidence. */
  authorizeSale: async function (r, coupon) {
    if (!this.policy()) {
      if (coupon.sellerAuthorizationProof)
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Reserved seller consent cannot be verified while its policy is disabled",
        );
      return undefined;
    }
    SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
    const issuer = this.enterprise(coupon.issuerEnterpriseRef),
      seller = this.enterprise(coupon.vendorEnterpriseRef);
    await this.activeEnterprise(r, issuer);
    if (seller !== issuer) await this.activeEnterprise(r, seller);
    const campaign = await this.campaign(r, coupon.promotionCode);
    return this.proof(r, coupon, campaign);
  },
  /** Authorizes delegated stock for a signed issuer, never a caller-selected seller session. The vendor comes only from pinned policy; expected proof prevents adopting a changed grant during issuance or replay. @param {Object} r Signed issuer management context. @param {Object} policy Pinned activated policy. @param {Object} expected Original observed proof, when rechecking. @returns {Promise<Object>} Current issuer-approved grant binding. */
  authorizeIssuance: async function (r, policy, expected) {
    const issuer = this.enterprise(policy.issuerEnterpriseRef),
      seller = this.enterprise(policy.vendorEnterpriseRef);
    if (!this.policy() || r.enterpriseCode !== issuer ||
        (r.entCode !== undefined && r.entCode !== issuer) || issuer === seller ||
        policy.tenant !== r.tenant || policy.code !== r.promotionCode || policy.status !== "ACTIVE")
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Delegated issuance requires current issuer authority and qualified consent");
    SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
    await this.issuer(r, issuer);
    await this.activeEnterprise(r, issuer);
    await this.activeEnterprise(r, seller);
    const campaign = await this.campaign(r, policy.code);
    if (campaign.tenant !== r.tenant ||
        this.enterprise(campaign.vendorEnterpriseRef) !== seller)
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Live issuance vendor does not match pinned policy");
    // Pure consent validation uses the policy-derived vendor, not an impersonated authentication context.
    return this.proof({ enterpriseCode: seller }, {
      promotionCode: policy.code,
      issuerEnterpriseRef: policy.issuerEnterpriseRef,
      vendorEnterpriseRef: policy.vendorEnterpriseRef,
      ...(expected ? { sellerAuthorizationProof: expected } : {}),
    }, campaign);
  },
  /** Captures authenticated human/customer access-token seller scope without inventing principals or replacing enterprise aliases. Service and anonymous callers require a separate trusted owner admission and remain refused here. Caller routes retain permission checks. @param {Object} r Secured storefront context. @returns {Object} Detached bounded read context. */
  sellerReadContext: function (r) {
    const admitted = SERVICE.DefaultPromotionDistributionAdmissionService?.resolveReadContext(r);
    if (admitted) return admitted;
    const auth = r.authData || {}, enterpriseCode = auth.enterpriseCode || auth.entCode;
    const principal = auth.principalId || auth.loginId;
    if (auth.tokenType !== "access" || !["human", "customer"].includes(auth.principalType) ||
        typeof principal !== "string" || !principal.trim() || principal !== principal.trim() ||
        principal.length > 192 || /[\u0000-\u001f\u007f]/.test(principal) ||
        typeof auth.tenant !== "string" || !auth.tenant || r.tenant !== auth.tenant ||
        typeof enterpriseCode !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(enterpriseCode) ||
        [auth.enterpriseCode, auth.entCode, r.enterpriseCode, r.entCode].some(value => value !== undefined && value !== enterpriseCode) ||
        typeof r.storeCode !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(r.storeCode))
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Authenticated seller policy scope is required");
    return { tenant: auth.tenant, enterpriseCode, storeCode: r.storeCode, authData: structuredClone(auth) };
  },
  /** Narrows already receipt-bound discovery by fresh operational Product metadata, never grants policy or budget authority. Full pinned policy/Profile/consent validation remains mandatory for every candidate. @param {Object} r Signed seller. @param {string} productCode Exact Product. @param {Array} bindings Validated private receipt bindings. @returns {Promise<Array<string>>} Candidate campaign identities only. */
  productPolicyCandidates: async function (r, productCode, bindings) {
    const context = this.sellerReadContext(r);
    const deny = () => { throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED"); };
    if (!this.policy() || typeof productCode !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(productCode) ||
        !Array.isArray(bindings) || !bindings.length || bindings.length > 1000) deny();
    const byCode = new Map();
    for (const binding of bindings) {
      if (binding.tenant !== context.tenant || binding.storeCode !== context.storeCode ||
          binding.sellerEnterpriseCode !== context.enterpriseCode ||
          this.enterprise(binding.vendorEnterpriseRef) !== context.enterpriseCode ||
          this.enterprise(binding.issuerEnterpriseRef) !== binding.issuerEnterpriseCode ||
          binding.issuerEnterpriseCode === context.enterpriseCode || !binding.sellerAuthorizationProof ||
          typeof binding.promotionCode !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(binding.promotionCode) ||
          byCode.has(binding.promotionCode)) deny();
      byCode.set(binding.promotionCode, binding);
    }
    const owner = SERVICE.DefaultPromotionOperationService;
    owner.requireOperationalRuntime();
    const response = await SERVICE.DefaultPromotionService.get({
      tenant: context.tenant, authData: owner.serviceAuthData(context),
      query: { tenant: context.tenant, "vendorEnterpriseRef.code": context.enterpriseCode,
        "conditions.sourceProductCode": productCode,
        $or: bindings.map(binding => ({ code: binding.promotionCode, enterpriseCode: binding.issuerEnterpriseCode })) },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: bindings.length + 1, limit: bindings.length + 1 },
    });
    owner.assertLifecycleEnvelope(response);
    if (!Array.isArray(response.result) || response.result.length > bindings.length) deny();
    const selected = new Set();
    for (const row of response.result) {
      const binding = byCode.get(row.code);
      if (!binding || selected.has(row.code) || row.tenant !== context.tenant ||
          row.enterpriseCode !== binding.issuerEnterpriseCode || row.conditions?.sourceProductCode !== productCode ||
          !isDeepStrictEqual(row.issuerEnterpriseRef, binding.issuerEnterpriseRef) ||
          !isDeepStrictEqual(row.vendorEnterpriseRef, binding.vendorEnterpriseRef)) deny();
      selected.add(row.code);
    }
    return [...selected];
  },
  /** Rechecks receipt-bound seller distribution, never issuer management or caller-supplied grants. @param {Object} r Signed storefront context. @param {Object} binding Owner-resolved issuance binding. @returns {Promise<Object>} Matching original live consent. */
  authorizePolicyRead: async function (r, binding) {
    const context = this.sellerReadContext(r);
    if (!this.policy() || binding.tenant !== context.tenant || binding.storeCode !== context.storeCode ||
        binding.sellerEnterpriseCode !== context.enterpriseCode ||
        this.enterprise(binding.issuerEnterpriseRef) !== binding.issuerEnterpriseCode ||
        this.enterprise(binding.vendorEnterpriseRef) !== context.enterpriseCode ||
        binding.issuerEnterpriseCode === context.enterpriseCode || !binding.sellerAuthorizationProof)
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Issuer-pinned distribution is required");
    SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
    await this.activeEnterprise(context, binding.issuerEnterpriseCode);
    await this.activeEnterprise(context, context.enterpriseCode);
    const campaign = await this.campaign(context, binding.promotionCode);
    if (campaign.tenant !== context.tenant || this.enterprise(campaign.vendorEnterpriseRef) !== context.enterpriseCode)
      throw new CLASSES.NodicsError("ERR_PROMOTION_SELLER_UNCONFIRMED", "Live seller distribution has changed");
    return this.proof(context, {
      promotionCode: binding.promotionCode, issuerEnterpriseRef: binding.issuerEnterpriseRef,
      vendorEnterpriseRef: binding.vendorEnterpriseRef, sellerAuthorizationProof: binding.sellerAuthorizationProof,
    }, campaign);
  },
  /** Rechecks observed owner campaign consent before rights capture without treating it as an atomic cross-owner snapshot. @param {Object} r Context. @param {Object} coupon Reserved unit. @param {Object} campaign Fresh owner record. @returns {Object} Matching consent binding. */
  proof: function (r, coupon, campaign) {
    const issuer = this.enterprise(coupon.issuerEnterpriseRef),
      seller = this.enterprise(coupon.vendorEnterpriseRef);
    if (!this.policy())
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Seller consent policy is unavailable",
      );
    if (
      r.enterpriseCode !== seller ||
      campaign.code !== coupon.promotionCode ||
      campaign.active !== true ||
      this.enterprise(campaign.issuerEnterpriseRef) !== issuer ||
      campaign.status !== "ACTIVE"
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Coupon seller or issuer does not match its campaign",
      );
    let revision = 0;
    if (issuer !== seller) {
      const grants = campaign.sellerAuthorizations;
      if (
        !Array.isArray(grants) ||
        grants.length > this.policy().maximumSellers
      )
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Issuer seller consent is absent",
        );
      const matches = grants.filter((g) => g.sellerEnterpriseCode === seller);
      if (
        matches.length !== 1 ||
        matches[0].issuerEnterpriseCode !== issuer ||
        matches[0].status !== "ACTIVE" ||
        !Number.isSafeInteger(matches[0].revision) ||
        matches[0].revision < 1 ||
        !Number.isFinite(Date.parse(matches[0].expiresAt)) ||
        Date.parse(matches[0].expiresAt) <= Date.now()
      )
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Issuer seller consent is unavailable or expired",
        );
      revision = matches[0].revision;
    }
    const proof = {
      issuerEnterpriseCode: issuer,
      sellerEnterpriseCode: seller,
      promotionCode: campaign.code,
      grantRevision: revision,
    };
    if (
      coupon.sellerAuthorizationProof &&
      !require("node:util").isDeepStrictEqual(
        coupon.sellerAuthorizationProof,
        proof,
      )
    )
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Original seller consent has changed",
      );
    return proof;
  },
};
