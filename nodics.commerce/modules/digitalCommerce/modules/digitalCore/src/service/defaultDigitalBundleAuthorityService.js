/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalBundleAuthorityService
 * @description Consumes existing Profile identity, scope and participant APIs with the original access
 * credential. No local identity directory or remote Loyalty dependency.
 * @layer service
 * @owner digitalCore
 * @override Change only framework-defined Profile transport values; preserve explicit denies and
 * owner/actor isolation.
 * @remarks Digital bundle authority resolves current Profile owners and permissions through original
 * bearer transport. Customer/Enterprise references stay typed, wildcard denial wins, and recipient
 * lookup does not provision identities or grant transfer consent.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: currentOwner, unwrap, profile, matchesScope, authorize, resolveRecipient.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Resolves the current participant without accepting a caller-selected owner or provisioning an
   * identity.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {Promise<Object>} Canonical current Profile Customer or represented Enterprise reference.
   * @remarks Effects: Fresh bounded Profile identity resolution; no customer/employee conversion.
   * Failure behavior: Rejects absent/mismatched signed principal or canonical identity.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  currentOwner: async function (r) {
    const auth = r.authData || {};
    if (auth.principalType === 'human') return SERVICE.DefaultDigitalBundleService.owner({
      module: 'profile', schema: 'enterprise', code: auth.enterpriseCode || auth.entCode,
    });
    const identity = await this.profile(r, '/customer/identity');
    if (identity?.contractVersion !== 1 || identity.tenant !== r.tenant ||
        identity.enterpriseCode !== (auth.enterpriseCode || auth.entCode) || identity.customer?.loginId !== auth.loginId)
      throw new Error('Current bundle owner is unconfirmed');
    return SERVICE.DefaultDigitalBundleService.owner({ module: 'profile', schema: 'customer', code: identity.customer.code });
  },
  /**
   * Rejects failed nested transport envelopes without treating failure as absence.
   * @param {*} value Value being validated, normalized or hashed according to this member's contract.
   * @returns {*} Successful canonical nested owner payload.
   * @remarks Effects: Pure bounded envelope normalization.
   * Failure behavior: Rejects error envelopes, malformed nesting and failed acknowledgements.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  unwrap: function (value) {
    for (let n = 0; n < 8 && value; n++) {
      if (value.error || value.success === false || value.acknowledged === false || /^ERR_/.test(value.code || "") ||
          value.errors && (!Array.isArray(value.errors) || value.errors.length)) throw new Error("Profile participant evidence failed");
      if (value.data !== undefined) value = value.data;
      else if (value.result !== undefined) value = value.result;
      else return value;
    }
    throw new Error("Profile participant evidence is unavailable");
  },
  /**
   * Calls one fixed Profile endpoint with original access authority and checks context drift after the
   * await.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {string} path Fixed canonical owner API path.
   * @param {Object} body Bounded original owner coordinates/command body.
   * @returns {Promise<Object>} Validated response from the fixed Profile endpoint.
   * @remarks Effects: Calls with original access authority and rechecks pins after await.
   * Failure behavior: Rejects transport failure or original authority/configuration drift.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  profile: async function (r, path, body) {
    const p = CONFIG.get("digitalCore")?.bundles?.profile, auth = r.authData || {};
    const authorization = r.authorization || r.httpRequest?.headers?.authorization || r.httpRequest?.headers?.Authorization;
    const enterpriseCode = auth.enterpriseCode || auth.entCode;
    if (auth.tokenType !== "access" || auth.isSystem || !["customer", "human"].includes(auth.principalType) ||
        !auth.loginId || !authorization || auth.tenant !== r.tenant || !enterpriseCode ||
        auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode ||
        [r.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== r.tenant) ||
        !p?.connectionName || !p.targetAuthority || !Number.isSafeInteger(p.timeoutMilliseconds) || p.timeoutMilliseconds <= 0)
      throw new Error("Original Profile access authority is required");
    const original = structuredClone({ auth, tenant: r.tenant, enterpriseCode: r.enterpriseCode, profile: p });
    const result = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: "profile",
      connectionName: p.connectionName, targetAuthority: p.targetAuthority, apiName: path,
      methodName: body === undefined ? "GET" : "POST", tenant: r.tenant, request: { tenant: r.tenant },
      ...(body === undefined ? {} : { requestBody: body }),
      header: { Authorization: authorization, "X-Enterprise-Code": enterpriseCode }, timeoutMs: p.timeoutMilliseconds, maxAttempts: 1 });
    if (!isDeepStrictEqual(original, { auth: r.authData, tenant: r.tenant, enterpriseCode: r.enterpriseCode,
      profile: CONFIG.get("digitalCore")?.bundles?.profile }) ||
      authorization !== (r.authorization || r.httpRequest?.headers?.authorization || r.httpRequest?.headers?.Authorization))
      throw new Error("Profile participant authority changed");
    return this.unwrap(result);
  },
  /**
   * Matches one current Profile scope without granting authority or changing its qualifiers.
   * @param {Object} scope Allow or deny scope returned by the admitted Profile read.
   * @param {Object} r Original request containing the signed tenant.
   * @param {string} enterpriseCode Enterprise derived from the signed actor.
   * @param {string} permission Independently required command permission.
   * @param {string} action Validated Digital command action.
   * @returns {boolean} Whether all scope, capability and permission qualifiers match; no side effects.
   * @override Preserve wildcard matching for both allow and deny, Enterprise qualifiers,
   * and deny precedence in authorize. This predicate never mints private admission.
   */
  matchesScope: function (scope, r, enterpriseCode, permission, action) {
    const capabilities = action === "BUNDLE_BUY" ? ["cart", "checkoutCore", "checkout", "order"] : ["digitalCore", "digitalCommerce"];
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (scope.tenantCode && scope.tenantCode !== r.tenant ||
        scope.enterpriseCode && scope.enterpriseCode !== enterpriseCode ||
        scope.capabilityCode && scope.capabilityCode !== "*" && !capabilities.includes(scope.capabilityCode) ||
        scope.permissionCode && !security.isPermissionGranted(permission, [scope.permissionCode], {})) return false;
    return scope.scopeType === "GLOBAL" && scope.scopeCode === "*" ||
      scope.scopeType === "TENANT" && scope.scopeCode === r.tenant ||
      scope.scopeType === "ENTERPRISE" && scope.scopeCode === enterpriseCode;
  },
  /**
   * Derives customer/Enterprise owner from current Profile evidence and independently checks the
   * capability permission.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Authorized tenant, typed owner and separate actor proof.
   * @remarks Effects: Fresh Profile owner/scopes plus independent capability permission checks.
   * Failure behavior: Rejects foreign owner, wildcard DENY, scope qualifier mismatch or authority drift.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  authorize: async function (r, input) {
    const ownerRef = SERVICE.DefaultDigitalBundleService.owner(input.ownerRef), auth = r.authData || {};
    const security = SERVICE.DefaultSecuredRequestPipelineService;
    if (!["HOLDINGS_READ", "BUNDLE_CREATE", "BUNDLE_LIST", "BUNDLE_BUY", "GIFT_SEND", "GIFT_RECEIVE", "GIFT_CANCEL", "GIFT_CONFIGURE"].includes(input.action))
      throw new Error("Unknown bundle authority action");
    const permission = input.action === "HOLDINGS_READ" ? "commerce.digital.own.read" : input.action === "BUNDLE_BUY" ? "commerce.checkout.place" : ownerRef.schema === "enterprise" && ["GIFT_RECEIVE", "GIFT_CONFIGURE"].includes(input.action)
      ? "commerce.digital.bundle.configure" : "commerce.digital.bundle.manage";
    if (!security?.isPermissionGranted(permission, security.getGrantedPermissions(r), {})) throw new Error("Bundle permission denied");
    const enterpriseCode = auth.enterpriseCode || auth.entCode;
    if (ownerRef.schema === "customer") {
      if (auth.principalType !== "customer") throw new Error("Personal customer context is required");
      const identity = await this.profile(r, "/customer/identity");
      if (identity?.contractVersion !== 1 || identity.tenant !== r.tenant || identity.enterpriseCode !== enterpriseCode ||
          identity.customer?.loginId !== auth.loginId || identity.customer?.code !== ownerRef.code)
        throw new Error("Canonical customer owner is unconfirmed");
    } else {
      if (auth.principalType !== "human" || ownerRef.code !== enterpriseCode) throw new Error("Represented Enterprise context is required");
      const evidence = await this.profile(r, "/identity/scopes/me");
      if (evidence?.principalCode !== auth.loginId || !Array.isArray(evidence.scopes) || !Array.isArray(evidence.deniedScopes))
        throw new Error("Enterprise actor scope is unconfirmed");
      if (!evidence.scopes.some(scope => this.matchesScope(scope, r, enterpriseCode, permission, input.action)) ||
          evidence.deniedScopes.some(scope => this.matchesScope(scope, r, enterpriseCode, permission, input.action)))
        throw new Error("Enterprise actor scope denied");
    }
    if (!security.isPermissionGranted(permission, security.getGrantedPermissions(r), {})) throw new Error("Bundle permission changed");
    return { authorized: true, tenant: r.tenant, ownerRef, actorRef: { module: "profile", schema: auth.principalType === "customer" ? "customer" : "employee", code: auth.loginId } };
  },
  /**
   * Resolves one selected existing participant using Profile's privacy-controlled shared lookup.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Active canonical selected recipient reference.
   * @remarks Effects: Calls existing privacy-controlled Profile lookup; no provisioning or contact
   * leakage.
   * Failure behavior: Rejects unavailable, foreign or invalid selected recipient.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  resolveRecipient: async function (r, input) {
    const ownerRef = SERVICE.DefaultDigitalBundleService.owner(input.ownerRef);
    const result = await this.profile(r, "/participants/resolve", { ownerType: ownerRef.schema.toUpperCase(), ownerCode: ownerRef.code });
    if (result?.contractVersion !== 1 || result.tenant !== r.tenant || result.recipient?.ownerType !== ownerRef.schema.toUpperCase() ||
        result.recipient?.ownerCode !== ownerRef.code) throw new Error("Existing recipient is unavailable");
    return { active: true, ownerRef };
  },
};
