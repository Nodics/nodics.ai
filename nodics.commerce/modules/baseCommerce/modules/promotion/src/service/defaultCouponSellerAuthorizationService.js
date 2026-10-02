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
const writes = new WeakSet();
/** @module promotion/service/defaultCouponSellerAuthorizationService @description Owns issuer-reviewed seller consent on the existing campaign and fresh sale-time admission. @layer service @owner promotion @override Later layers may narrow policy and Profile scope matching; preserve issuer authority, bounded consent, private writes and revision binding. */
module.exports = {
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
    let value = await SERVICE.DefaultModuleService.invokeModule({
      local: false,
      moduleName: "profile",
      connectionName: "profile",
      targetAuthority: { runtimeRole: "PLATFORM" },
      tenant: r.tenant,
      request: { tenant: r.tenant },
      apiName: "/enterprise",
      methodName: "POST",
      requestBody: {
        query: { code, active: true },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2 },
      },
      timeoutMs: 10000,
      maxAttempts: 1,
    });
    for (let n = 0; n < 7 && value && !Array.isArray(value); n++) {
      if (
        value.success === false ||
        value.error ||
        /^(ERR|FAIL)_/.test(value.code || "") ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Enterprise authority read failed",
        );
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    const rows = Array.isArray(value) ? value : value?.code ? [value] : [];
    if (rows.length !== 1 || rows[0].code !== code || rows[0].active !== true)
      throw new CLASSES.NodicsError(
        "ERR_PROMOTION_SELLER_UNCONFIRMED",
        "Current active issuer and seller enterprises are required",
      );
  },
  /** Inspects bounded seller consents using current issuer authority. @param {Object} r Signed issuer request. @returns {Promise<Object>} Safe revisioned list. */
  inspect: async function (r) {
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
    const auth = r.authData || {},
      router = SERVICE.DefaultSecuredRequestPipelineService;
    if (
      auth.tokenType !== "access" ||
      auth.principalType !== "human" ||
      auth.tenant !== r.tenant ||
      (auth.enterpriseCode || auth.entCode) !== issuer ||
      (auth.enterpriseCode &&
        auth.entCode &&
        auth.enterpriseCode !== auth.entCode) ||
      !auth.loginId ||
      !r.authorization ||
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
    let value = await SERVICE.DefaultModuleService.invokeModule({
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
    });
    for (let n = 0; n < 6 && value && !Array.isArray(value); n++) {
      if (
        value.success === false ||
        value.error ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        throw new CLASSES.NodicsError(
          "ERR_PROMOTION_SELLER_UNCONFIRMED",
          "Issuer scope read failed",
        );
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    const matches = (scope) =>
      (!scope.tenantCode || scope.tenantCode === r.tenant) &&
      (!scope.capabilityCode ||
        ["commerce", "promotion"].includes(scope.capabilityCode)) &&
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
          ].includes(key),
      ) ||
      Object.keys(r.query || {}).length ||
      typeof p.sellerEnterpriseCode !== "string" ||
      typeof p.commandReference !== "string" ||
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(p.sellerEnterpriseCode || "") ||
      !/^[A-Za-z0-9_.:-]{8,128}$/.test(p.commandReference || "") ||
      !["GRANT", "REVOKE"].includes(p.action)
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
    const commandHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify([
          campaign.code,
          issuer,
          actor,
          p.sellerEnterpriseCode,
          p.action,
          p.expiresAt || null,
          p.expectedRevision,
          p.commandReference,
        ]),
      )
      .digest("hex");
    if (previous?.commandReference === p.commandReference) {
      if (previous.commandHash !== commandHash)
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
    writes.add(command);
    try {
      await SERVICE.DefaultPromotionService.update(command);
    } catch (_) {
      /* Exact readback below reconciles a lost acknowledgement without another write. */
    } finally {
      writes.delete(command);
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
    };
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
  /** Prevents generic coupon writes from manufacturing or clearing reserved issuer-consent evidence. @param {Object} r Generated request. @returns {boolean} Admitted legacy non-proof write. */
  protectCoupon: function (r) {
    if (writes.has(r)) return true;
    this.assertMutationShape(r.model);
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
    if (writes.has(r)) return true;
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
      seller = this.enterprise(coupon.vendorEnterpriseRef),
      campaign = await this.campaign(r, coupon.promotionCode);
    const proof = this.proof(r, coupon, campaign);
    await this.activeEnterprise(r, issuer);
    if (seller !== issuer) await this.activeEnterprise(r, seller);
    return proof;
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
