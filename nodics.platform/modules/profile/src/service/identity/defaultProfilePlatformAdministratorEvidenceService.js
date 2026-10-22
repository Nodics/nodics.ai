/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");

/**
 * @module profile/service/identity/defaultProfilePlatformAdministratorEvidenceService
 * @description Projects nonce-bound current native Platform administrator evidence without issuing credentials or changing authority.
 * @layer service
 * @owner profile
 * @override Later layers may narrow admission. Retain original authenticated identity, fresh reserved grants, bounded reads and minimal output.
 */
module.exports = {
  /** Refuses without disclosing identity records or upstream failure details. */
  fail: function () { throw new CLASSES.NodicsError("ERR_AUTH_00003"); },

  /** Reads complete implementing-owner definitions; configuration selects consumers, never grants identity authority. */
  policy: function () {
    const policy = CONFIG.get("profilePlatformAdministratorEvidence");
    if (policy?.enabled !== true || !Array.isArray(policy.allowedPermissions) || !policy.allowedPermissions.length ||
        policy.allowedPermissions.some(code => typeof code !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(code)) ||
        new Set(policy.allowedPermissions).size !== policy.allowedPermissions.length ||
        !Number.isSafeInteger(policy.maximumGroups) || policy.maximumGroups < 1) this.fail();
    return structuredClone(policy);
  },

  /** Pins exact original transport and native claims, independent of headers or caller-supplied administrator flags. */
  context: function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const policy = this.policy(), tenant = CONFIG.get("defaultTenant"), enterprise = CONFIG.get("defaultEnterprise");
    const input = request.body ?? request.payload ?? request.httpRequest?.body;
    if (!input || Object.getPrototypeOf(input) !== Object.prototype || Object.keys(input).sort().join(",") !== "nonce,permission" ||
        !policy.allowedPermissions.includes(input.permission) || typeof input.nonce !== "string" ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.nonce)) this.fail();
    const auth = request.authData || {};
    if (typeof tenant !== "string" || !tenant || typeof enterprise !== "string" || !enterprise ||
        request.tenant !== tenant || auth.tenant !== tenant || auth.entCode !== enterprise ||
        auth.principalType !== "human" || auth.tokenType !== "access" || auth.authenticationMethod !== "PASSWORD" ||
        auth.isSystem || auth.sessionContext !== undefined || auth.runtimeScope !== undefined || auth.externalIdentityLinkCode !== undefined ||
        typeof auth.loginId !== "string" || !auth.loginId || !Number.isSafeInteger(auth.authVersion) || auth.authVersion < 1 ||
        !SERVICE.DefaultSecuredRequestPipelineService.hasPlatformFullAccess(request)) this.fail();
    const pin = { auth: structuredClone(auth), input: structuredClone(input), authorization: request.authorization };
    const headers = [request.headers, request.header, request.httpRequest?.headers, request.httpRequest?.header];
    const headerPin = structuredClone(headers.map(value => value || {}));
    const bound = () => {
      if (request.tenant !== tenant || !isDeepStrictEqual(request.authData, pin.auth) || request.authorization !== pin.authorization ||
          CONFIG.get("defaultTenant") !== tenant || CONFIG.get("defaultEnterprise") !== enterprise || !isDeepStrictEqual(this.policy(), policy) ||
          !isDeepStrictEqual([request.headers, request.header, request.httpRequest?.headers, request.httpRequest?.header].map(value => value || {}), headerPin) ||
          [request.body, request.payload, request.httpRequest?.body].some(value => value !== undefined && !isDeepStrictEqual(value, pin.input)) ||
          [auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value => value !== undefined && value !== enterprise) ||
          [auth.tenantCode, request.tenantCode].some(value => value !== undefined && value !== tenant) ||
          [request.query, request.httpRequest?.query].some(value => value && Object.keys(value).length) ||
          headers.some(value => Object.entries(value || {}).some(([key, code]) => key.toLowerCase() === "x-enterprise-code" && code !== enterprise))) this.fail();
    };
    bound();
    return { tenant, enterprise, auth: pin.auth, input: pin.input, policy, bound };
  },

  /** Uses the fresh native identity and lockout/stamp owner, not broad administrator or optional Enterprise-scope admission. */
  actor: async function (request, context) {
    const anchor = await SERVICE.DefaultEnterpriseMembershipService.verifyAuthenticatedActor(request);
    context.bound();
    const person = anchor?.person;
    if (!person || person.active !== true || person.disabled === true || person.registrationSuspended === true ||
        person.loginId !== context.auth.loginId || person.authVersion !== context.auth.authVersion ||
        !Array.isArray(person.userGroups) || !person.userGroups.includes("platformAdministratorUserGroup")) this.fail();
    SERVICE.DefaultPrincipalGovernanceService.assertPlatformPrincipal(person, { ...request, schemaModel: { schemaName: "employee" } });
    SERVICE.DefaultIdentityCatalogueService.codes(person.userGroups, false);
    return person;
  },

  /** Reloads every direct/ancestor group using bounded private catalogue reads and existing graph/permission governance. */
  groups: async function (context, direct) {
    const catalogue = SERVICE.DefaultIdentityCatalogueService, groups = new Map();
    let pending = direct;
    while (pending.length) {
      if (groups.size + pending.length > context.policy.maximumGroups) this.fail();
      const rows = await catalogue.rows("DefaultUserGroupService", { code: { $in: pending }, active: true });
      context.bound();
      if (rows.length !== pending.length || new Set(rows.map(row => row.code)).size !== pending.length ||
          rows.some(row => row.active !== true || !pending.includes(row.code))) this.fail();
      for (const row of rows) {
        catalogue.codes(row.parentGroups || []);
        groups.set(row.code, row);
      }
      pending = [...new Set(rows.flatMap(row => row.parentGroups || []))].filter(code => !groups.has(code));
    }
    const result = [...groups.values()], owner = SERVICE.DefaultUserGroupGovernanceService;
    owner.validateGraph(result, []);
    await owner.validatePermissions(result);
    const reserved = groups.get("platformAdministratorUserGroup");
    if (!reserved?.permissions?.includes("*")) this.fail();
    const permissions = await catalogue.requirePermissions(["*", context.input.permission]);
    if (permissions.find(row => row.code === "*")?.ownerModule !== "profile") this.fail();
    context.bound();
    return result;
  },

  /** Returns only a nonce-bound proof after fresh persisted grants and a final identity/stamp recheck; performs no writes. */
  evidence: async function (request) {
    try {
      const context = this.context(request), catalogue = SERVICE.DefaultIdentityCatalogueService;
      const person = await this.actor(request, context);
      for (const [name, code] of [["DefaultTenantService", context.tenant], ["DefaultEnterpriseService", context.enterprise]]) {
        const rows = await catalogue.rows(name, { code, active: true });
        if (rows.length !== 1 || rows[0].active !== true || rows[0].code !== code ||
            name === "DefaultEnterpriseService" && rows[0].tenant !== context.tenant) this.fail();
        context.bound();
      }
      const groups = await this.groups(context, person.userGroups);
      // Construct a local authorization view solely from current persisted grants, never mutate the caller's signed identity.
      const fresh = { tenant: context.tenant, authData: { ...context.auth, userGroups: groups.map(group => group.code),
        permissions: [...new Set(groups.flatMap(group => group.permissions || []))],
        userGroupPermissions: [], actionPermissions: [], authorities: [], scopes: [], allUserGroupCodes: [] } };
      const router = SERVICE.DefaultSecuredRequestPipelineService;
      if (!router.hasPlatformFullAccess(fresh) || !router.isPermissionGranted(context.input.permission,
        router.getGrantedPermissions(fresh), router.getRouteActionAuthorizationConfig())) this.fail();
      if (!isDeepStrictEqual(person, await this.actor(request, context))) this.fail();
      context.bound();
      return { contractVersion: 1, nonce: context.input.nonce, tenant: context.tenant, enterpriseCode: context.enterprise,
        actorCode: context.auth.loginId, principalType: "human", platformAdministrator: true,
        permission: context.input.permission, authVersion: context.auth.authVersion };
    } catch (_) { this.fail(); }
  },
};
