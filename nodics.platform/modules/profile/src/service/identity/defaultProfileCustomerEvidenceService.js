/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
const { isDeepStrictEqual } = require("node:util");
/** @module profile/service/identity/defaultProfileCustomerEvidenceService
 * @description Exact private customer code/login evidence for an approved runtime deployment and business enterprise. No credentials, membership, eligibility or generic queries.
 * @layer service @owner profile
 */
const owner = {
  fail() { throw new Error("Exact authorized Profile customer evidence is unavailable"); },
  identifier(value) { return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@|\-]{0,191}$/.test(value); },
  async read(request) {
    const p = request.payload, policy = CONFIG.get("profileCustomerEvidence"), logger = SERVICE.DefaultLoggerService;
    if (policy?.enabled !== true || CONFIG.get("runtimeRole")?.code !== policy.runtimeRole ||
        logger?.hasPrivateCaptureProtection?.(request) !== true) this.fail();
    const a = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "profile");
    if (a.principalType !== "service" || a.isSystem || !a.permissions?.includes("profile.customer.reference.read") ||
        !p || Object.keys(p).sort().join() !== "contractVersion,enterpriseCode,identifier" || p.contractVersion !== 1 ||
        !this.identifier(p.enterpriseCode) || !this.identifier(p.identifier) || Object.keys(request.query || {}).length ||
        a.enterpriseCode !== undefined && a.enterpriseCode !== a.entCode ||
        [request.tenantCode, a.tenantCode].some(value => value !== undefined && value !== a.tenant) ||
        [request.enterpriseCode, request.entCode, request.httpRequest?.headers?.["x-enterprise-code"]].some(value => value !== undefined && value !== a.entCode)) this.fail();
    const grants = (Array.isArray(policy.callers) ? policy.callers : []).filter(g => g.tenant === a.tenant &&
      g.principalEnterpriseCode === a.entCode && g.enterpriseCode === p.enterpriseCode && g.serviceId === a.serviceId &&
      ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"].every(k => this.identifier(g[k]) && g[k] === a.runtimeScope[k]) &&
      g.instanceCode === a.runtimeInstanceId && g.environmentCode === NODICS.getSelectedEnvironmentName());
    if (grants.length !== 1) this.fail();
    const auth = structuredClone(a), selection = structuredClone(p), pin = structuredClone(policy);
    const check = () => { if (!isDeepStrictEqual(request.authData, auth) || !isDeepStrictEqual(request.payload, selection) ||
      !isDeepStrictEqual(CONFIG.get("profileCustomerEvidence"), pin) || CONFIG.get("runtimeRole")?.code !== pin.runtimeRole ||
      NODICS.getSelectedEnvironmentName() !== auth.runtimeScope.environmentCode || request.tenant !== auth.tenant ||
      [request.enterpriseCode, request.entCode, request.httpRequest?.headers?.["x-enterprise-code"]]
        .some(value => value !== undefined && value !== auth.entCode) ||
      logger.hasPrivateCaptureProtection(request) !== true) this.fail(); };
    const rows = async (name, tenant, query) => {
      check(); let result;
      const readRequest = { tenant, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query, options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, limit: 2, pageNumber: 1 } };
      try { result = await SERVICE[name].get(readRequest); }
      catch (_) { this.fail(); }
      check();
      if (readRequest.tenant !== tenant || !/^SUC_/.test(result?.code || "") || result.error || result.success === false ||
          result.errors && (!Array.isArray(result.errors) || result.errors.length) || !Array.isArray(result.result) || result.result.length !== 1 ||
          [result.count, result.total, result.totalCount].some(v => v !== undefined && v !== 1)) this.fail();
      return result.result[0];
    };
    const placement = async () => {
      const enterprise = await rows("DefaultEnterpriseService", CONFIG.get("defaultTenant") || "default", { code: p.enterpriseCode, active: true });
      const tenantCode = typeof enterprise.tenant === "string" ? enterprise.tenant : enterprise.tenant?.code;
      if (enterprise.code !== p.enterpriseCode || enterprise.active !== true || tenantCode !== a.tenant) this.fail();
      const tenant = await rows("DefaultTenantService", CONFIG.get("defaultTenant") || "default", { code: tenantCode, active: true });
      if (tenant.code !== a.tenant || tenant.active !== true) this.fail();
      return { enterprise: { code: enterprise.code, tenant: tenantCode, active: enterprise.active, revision: enterprise.revision },
        tenant: { code: tenant.code, active: tenant.active, revision: tenant.revision } };
    };
    const before = await placement();
    const customer = await rows("DefaultCustomerService", auth.tenant, { active: true, $or: [{ code: p.identifier }, { loginId: p.identifier }] });
    if (customer.tenant !== undefined && customer.tenant !== auth.tenant || customer.active !== true || !this.identifier(customer.code) || !this.identifier(customer.loginId) ||
        customer.code !== p.identifier && customer.loginId !== p.identifier || !isDeepStrictEqual(before, await placement())) this.fail();
    check();
    // Customer rows omit tenant; only the original verified generated-read partition supplies the envelope.
    return { contractVersion: 1, tenant: auth.tenant, enterpriseCode: p.enterpriseCode,
      customer: { code: customer.code, loginId: customer.loginId, active: true } };
  },
};
module.exports = { /** Only the exact admitted capability is exported. */ read: function (request) { return owner.read(request); } };
