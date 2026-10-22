/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module bidding/service/defaultBiddingIdentityService
 * @description Resolves signed Commerce participants into typed buyer and seller references using Profile-owned identity and scopes.
 * @layer service
 * @owner bidding
 * Inputs are admitted request contexts and Profile transport settings; outputs are cloned transport, unwrapped evidence, scope predicates or enriched request copies.
 * Methods perform Profile GETs but no bid, wallet or identity writes. Validation and owner failures throw/reject through Bidding; no callback API is used.
 * @override Override effective exported members through layered services, retaining original authority, transport pins, bounded customer evidence and deny-aware Enterprise matching.
 */
module.exports = {
  /**
   * Validates the complete implementing-owner Profile transport.
   * @returns {Object} Detached clone of the allowed Profile connection, PLATFORM authority, API version and request bounds.
   * @throws {Error} Bidding failure for missing/extra fields, wrong target, invalid bounds, redirects or disabled TLS verification.
   * @sideEffects Reads effective configuration only; does not invoke Profile or enable it.
   * @override Preserve the allowlist and validation; later configuration may intentionally change supported transport values.
   */
  profileTransport: function () {
    const p = CONFIG.get('bidding')?.profileTransport;
    const allowed = ['moduleName', 'connectionName', 'targetAuthority', 'apiVersion', 'timeoutMs', 'maxAttempts', 'followRedirects', 'rejectUnauthorized'];
    if (!p || Object.keys(p).some(key => !allowed.includes(key)) || p.moduleName !== 'profile' ||
        typeof p.connectionName !== 'string' || !/^[A-Za-z][A-Za-z0-9_.-]{0,191}$/.test(p.connectionName) ||
        p.targetAuthority?.runtimeRole !== 'PLATFORM' || Object.keys(p.targetAuthority).length !== 1 ||
        typeof p.apiVersion !== 'string' || !/^v\d+$/.test(p.apiVersion) ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || p.timeoutMs > 2147483647 ||
        !Number.isSafeInteger(p.maxAttempts) || p.maxAttempts < 1 ||
        p.followRedirects !== false || p.rejectUnauthorized !== true)
      SERVICE.DefaultBiddingService.fail('Profile transport configuration is invalid');
    return structuredClone(p);
  },
  /**
   * Reads Profile with original authority and rejects request/configuration drift.
   * @param {Object} request Signed tenant, enterpriseCode, authorization and authData.
   * @param {string} apiName Owner-selected Profile GET path, not a public payload selector.
   * @returns {Promise<*>} Profile result normalized by this.unwrap.
   * @throws {Error} Rejects transport/authority drift or owner error envelopes; transport failures propagate.
   * @sideEffects Invokes a remote Profile GET; does not mutate request or persistence.
   * @override Resolve transport and unwrapping through effective members and retain before/after pins.
   */
  profileRead: async function (request, apiName) {
    const transport = this.profileTransport(), same = require('node:util').isDeepStrictEqual;
    const context = () => ({ tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      authorization: request.authorization, authData: request.authData });
    const pin = structuredClone(context());
    const response = await SERVICE.DefaultModuleService.invokeModule({ ...transport, local: false, apiName, methodName: 'GET',
      tenant: pin.tenant, request: { tenant: pin.tenant },
      header: { Authorization: pin.authorization, 'X-Enterprise-Code': pin.enterpriseCode } });
    if (!same(pin, context()) || !same(transport, this.profileTransport()))
      SERVICE.DefaultBiddingService.fail('Profile identity context changed');
    return this.unwrap(response);
  },
  /**
   * Unwraps up to seven Profile data/result envelopes.
   * @param {*} response Raw owner response; arrays terminate unwrapping.
   * @returns {*} Innermost value reached, including null/undefined when returned by the owner.
   * @throws {Error} Bidding failure for detected error, false success, ERR code or nonempty/malformed errors.
   * @sideEffects None; response values are not modified or fabricated.
   * @override Preserve refusal checks and envelope bound; record-shape validation remains with the consuming member.
   */
  unwrap: function (response) {
    let value = response;
    for (let n = 0; n < 7 && value && !Array.isArray(value); n++) {
      if (
        value.success === false ||
        value.error ||
        /^ERR_/.test(value.code || "") ||
        (value.errors && (!Array.isArray(value.errors) || value.errors.length))
      )
        SERVICE.DefaultBiddingService.fail("Profile identity is unavailable");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else break;
    }
    return value;
  },
  /**
   * Builds typed purchasing and selling references from authenticated identity.
   * @param {Object} input Admitted tenant, authData and original bearer authorization.
   * @returns {Promise<Object>} Shallow request copy with ownerId, Enterprise, customer code or scopes, sellerRefs, optional buyerRef and actorRef.
   * @throws {Error} Rejects incomplete/conflicting identity or invalid Profile evidence; downstream failures propagate.
   * @sideEffects Reads Profile identity for customers or scopes for humans; does not save bids or change credentials.
   * @override Keep owner and actor distinct. A human without a matching permission may have no buyerRef or sellerRefs; do not invent authority.
   */
  resolve: async function (input) {
    const auth = input.authData || {},
      fail = (message) => SERVICE.DefaultBiddingService.fail(message);
    const ownerId = auth.principalId || auth.code || auth.loginId,
      enterpriseCode = auth.enterpriseCode || auth.entCode;
    if (
      !["customer", "human"].includes(auth.principalType) ||
      !auth.loginId ||
      !input.tenant ||
      !enterpriseCode ||
      (auth.enterpriseCode !== undefined &&
        auth.entCode !== undefined &&
        auth.enterpriseCode !== auth.entCode) ||
      !ownerId
    )
      fail("Authenticated Commerce participant context is required");
    const request = { ...input, ownerId, enterpriseCode };
    if (auth.principalType === "customer") {
      if (!request.authorization)
        fail("Authenticated customer identity is unavailable");
      const result = await this.profileRead(request, '/customer/identity'),
        customer = result?.customer;
      if (
        result?.contractVersion !== 1 ||
        result.tenant !== request.tenant ||
        result.enterpriseCode !== enterpriseCode ||
        typeof customer?.code !== "string" ||
        !customer.code.trim() ||
        customer.code.length > 191 ||
        customer.loginId !== auth.loginId
      )
        fail("Customer identity is unavailable");
      request.customerCode = customer.code;
    }
    if (auth.principalType === "human") request.effectiveScopes = await this.scopes(request);
    request.sellerRefs = await this.sellerRefs(request);
    request.buyerRef = auth.principalType === "customer"
      ? { module: "profile", schema: "customer", code: request.customerCode }
      : this.enterpriseRef(request, "commerce.bid.participate");
    request.actorRef = { principalType: auth.principalType, code: ownerId, loginId: auth.loginId, enterpriseCode };
    return request;
  },
  /**
   * Projects seller references from already resolved customer or human evidence.
   * @param {Object} request Resolved identity containing customerCode or effectiveScopes.
   * @returns {Promise<Object[]>} One customer/authorized Enterprise reference, or an empty list for an unqualified human.
   * @throws {Error} Propagates effective permission/scope matcher failures.
   * @sideEffects No I/O or persistence; does not fetch fresh scopes itself.
   * @override Retain this.enterpriseRef for human manage permission; caller payloads cannot supply seller authority.
   */
  sellerRefs: async function (request) {
    if (request.authData.principalType === "customer")
      return [
        { module: "profile", schema: "customer", code: request.customerCode },
      ];
    const ref = this.enterpriseRef(request, "commerce.bid.manage");
    return ref ? [ref] : [];
  },
  /**
   * Obtains current human Profile allow/deny evidence.
   * @param {Object} request Signed bearer context and authData.loginId.
   * @returns {Promise<Object>} Unwrapped Profile principalCode, scopes and deniedScopes evidence.
   * @throws {Error} Rejects missing bearer, wrong principal or malformed scope arrays; Profile read failures propagate.
   * @sideEffects Performs the Profile scopes GET through this.profileRead; no assignments are written.
   * @override Preserve principal matching and both allow/deny arrays; employee identity never becomes the owner.
   */
  scopes: async function (request) {
    const fail = (message) => SERVICE.DefaultBiddingService.fail(message);
    if (!request.authorization) fail("Enterprise bearer authorization is required");
    const scopes = await this.profileRead(request, '/identity/scopes/me');
    if (
      scopes?.principalCode !== request.authData.loginId ||
      !Array.isArray(scopes.scopes) ||
      !Array.isArray(scopes.deniedScopes)
    )
      fail("Enterprise seller scope resolution is unavailable");
    return scopes;
  },
  /**
   * Matches Profile qualifiers without granting bid or seller authority.
   * @param {Object} scope Admitted Profile allow/deny scope.
   * @param {Object} request Original signed tenant and Enterprise context.
   * @param {string} permission Independently required Bidding permission.
   * @returns {boolean} True for matching global, tenant or Enterprise scope; false for absent or mismatched scope.
   * @throws {Error} Propagates request or permission matcher failures; this predicate does not fetch scope evidence.
   * @sideEffects None; no grants, reads or writes.
   * @override Preserve wildcard matching and qualifiers; enterpriseRef applies deny precedence.
   */
  matchesEnterpriseScope: function (scope, request, permission) {
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    if (!scope || scope.tenantCode && scope.tenantCode !== request.tenant ||
        scope.enterpriseCode && scope.enterpriseCode !== request.enterpriseCode ||
        scope.capabilityCode && !["*", "commerce", "bidding"].includes(scope.capabilityCode) ||
        scope.permissionCode && !router.isPermissionGranted(permission, [scope.permissionCode], {})) return false;
    return scope.scopeType === "GLOBAL" && scope.scopeCode === "*" ||
      scope.scopeType === "TENANT" && scope.scopeCode === request.tenant ||
      scope.scopeType === "ENTERPRISE" && scope.scopeCode === request.enterpriseCode;
  },
  /**
   * Applies permission grants and denied-aware scopes to the signed Enterprise.
   * @param {Object} request Resolved Enterprise context with effectiveScopes and original permission grants.
   * @param {string} permission Required Bidding participation or management permission.
   * @returns {Object|undefined} Typed Profile Enterprise reference only when the grant and scopes admit it.
   * @throws {Error} Propagates permission or scope matcher failures on invalid admitted context.
   * @sideEffects None; does not refresh scopes or persist grants.
   * @override Keep this.matchesEnterpriseScope for both allow and deny, with denial winning.
   */
  enterpriseRef: function (request, permission) {
    const router = SERVICE.DefaultSecuredRequestPipelineService, scopes = request.effectiveScopes;
    if (!scopes || !router.isPermissionGranted(permission, router.getGrantedPermissions(request), {})) return undefined;
    return scopes.scopes.some(scope => this.matchesEnterpriseScope(scope, request, permission)) &&
      !scopes.deniedScopes.some(scope => this.matchesEnterpriseScope(scope, request, permission))
      ? {
            module: "profile",
            schema: "enterprise",
            code: request.enterpriseCode,
          }
      : undefined;
  },
};
