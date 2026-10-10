/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseService
 * @description Implements profile default enterprise service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  /**
   * Reads one current hierarchy dependency through its existing generated owner.
   * @param {Object} owner Enterprise or Tenant generated service.
   * @param {string} code Exact reference code defined by Profile refSchema metadata.
   * @param {Function} [privateReader] Explicit internal owner callback for private Team evidence; HTTP input cannot select it.
   * @returns {Promise<Object>} One active non-recursive record; uncertain reads reject.
   * @override Preserve authority partition, read bounds, active state and cache bypass.
   */
  readHierarchyRecord: async function (owner, code, privateReader) {
    if (
      privateReader !== undefined &&
      (typeof privateReader !== "function" ||
        owner !== SERVICE.DefaultEnterpriseService)
    )
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "Enterprise owner reader is invalid",
      );
    if (
      typeof code !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code) ||
      typeof owner?.get !== "function" ||
      typeof SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData !==
        "function"
    )
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "Enterprise hierarchy reference is invalid",
      );
    const request = {
      tenant: CONFIG.get("defaultTenant") || "default",
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: { code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    };
    const consent = SERVICE.DefaultEnterpriseAdministrationConsentService;
    const execute = () =>
      consent && owner === SERVICE.DefaultEnterpriseService
        ? consent.read(owner, request)
        : owner.get(request);
    const response = privateReader
      ? await privateReader(owner, request, execute)
      : await execute();
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      !Array.isArray(response.result) ||
      response.result.length !== 1 ||
      response.result[0]?.code !== code ||
      response.result[0].active !== true
    )
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "Enterprise hierarchy is unavailable or ambiguous",
      );
    if (
      response.result[0].administrationHierarchyOperation &&
      response.result[0].administrationHierarchyOperation.phase !==
        "COMPLETE" &&
      (typeof consent?.terminalHierarchy !== "function" ||
        consent.terminalHierarchy(response.result[0]) !== true)
    )
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "Enterprise hierarchy change requires completion or inspection",
      );
    return response.result[0];
  },
  /**
   * Normalizes a code-owned Profile reference without trusting embedded record state.
   * @param {string|Object} value Stored code or resolved reference object.
   * @param {boolean} optional Allow an absent parent at the root only.
   * @returns {string|undefined} Exact code, never an inferred database identifier.
   */
  hierarchyReferenceCode: function (value, optional = false) {
    if (optional && (value === undefined || value === null || value === ""))
      return undefined;
    const code =
      typeof value === "string"
        ? value
        : value && !Array.isArray(value)
          ? value.code
          : undefined;
    if (
      typeof code !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(code)
    )
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "Enterprise hierarchy reference is invalid",
      );
    return code;
  },
  /**
   * Resolves and revalidates a bounded child-to-root chain without granting access.
   * @param {string} enterpriseCode Current child code, or proposed parent's code during creation.
   * @param {string} [excludedCode] Proposed child code which must not occur in its parent chain.
   * @returns {Promise<Array<Object>>} Code/tenant/parent coordinates only, not administration authority.
   * @throws {CLASSES.NodicsError} Cycles, missing/inactive/ambiguous references, drift or overflow.
   * @override Later layers may narrow depth; never infer rights from this relationship result.
   */
  hierarchy: async function (enterpriseCode, excludedCode) {
    const maximum = (CONFIG.get("enterpriseManagement") || {}).hierarchy
      ?.maximumDepth;
    if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 128)
      throw new CLASSES.NodicsError(
        "ERR_PRFL_00003",
        "Enterprise hierarchy policy is invalid",
      );
    let code = this.hierarchyReferenceCode(enterpriseCode);
    if (excludedCode !== undefined) this.hierarchyReferenceCode(excludedCode);
    const rows = [],
      observed = [],
      seen = new Set(excludedCode === undefined ? [] : [excludedCode]);
    while (code !== undefined) {
      if (
        seen.has(code) ||
        rows.length >= maximum - (excludedCode === undefined ? 0 : 1)
      )
        throw new CLASSES.NodicsError(
          "ERR_PRFL_00003",
          "Enterprise hierarchy has a cycle or exceeds its bound",
        );
      seen.add(code);
      const enterprise = await this.readHierarchyRecord(this, code);
      const tenantCode = this.hierarchyReferenceCode(enterprise.tenant);
      const tenant = await this.readHierarchyRecord(
        SERVICE.DefaultTenantService,
        tenantCode,
      );
      const parentCode = this.hierarchyReferenceCode(
        enterprise.superEnterprise,
        true,
      );
      rows.push({
        code,
        tenantCode,
        ...(parentCode === undefined ? {} : { parentCode }),
      });
      observed.push({ enterprise, tenant });
      code = parentCode;
    }
    // This detects observed drift, not an atomic graph snapshot or a grant fence.
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const current = await this.readHierarchyRecord(this, row.code);
      const tenant = await this.readHierarchyRecord(
        SERVICE.DefaultTenantService,
        row.tenantCode,
      );
      if (
        this.hierarchyReferenceCode(current.tenant) !== row.tenantCode ||
        this.hierarchyReferenceCode(current.superEnterprise, true) !==
          row.parentCode ||
        !require("node:util").isDeepStrictEqual(
          current._id,
          observed[index].enterprise._id,
        ) ||
        !require("node:util").isDeepStrictEqual(
          tenant._id,
          observed[index].tenant._id,
        )
      )
        throw new CLASSES.NodicsError(
          "ERR_PRFL_00003",
          "Enterprise hierarchy changed; inspect before continuing",
        );
    }
    return rows;
  },
  /**
   * Returns only the enterprise/tenant bootstrap projection authorized by a runtime credential.
   * @param {Object} request Verified runtime authentication and selected enterprise context.
   * @returns {Promise<Object>} Canonical response with one approved enterprise.
   */
  getRuntimeEnterprise: async function (request) {
    const auth = request.authData || {};
    const profileModule = CONFIG.get("profileModuleName") || "profile";
    if (
      auth.tokenType !== "service" ||
      !auth.runtimeScope ||
      !auth.runtimeScope.instanceCode ||
      !Array.isArray(auth.modules) ||
      !auth.modules.includes(profileModule) ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("profile.enterprise.search") ||
      !auth.entCode ||
      request.entCode !== auth.entCode ||
      request.tenant !== auth.tenant
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Runtime enterprise lookup requires its approved enterprise, tenant and permission",
      );
    }
    const enterprise = await this.retrieveEnterprise(auth.entCode);
    if (
      !enterprise ||
      enterprise.code !== auth.entCode ||
      enterprise.active !== true ||
      !enterprise.tenant ||
      enterprise.tenant.code !== auth.tenant ||
      enterprise.tenant.active !== true
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Runtime enterprise or tenant is unavailable",
      );
    }
    const tenants = await SERVICE.DefaultEnterpriseTenantProvisioningService.rows("DefaultTenantService", { code: auth.tenant });
    if (tenants.length !== 1 || tenants[0].code !== auth.tenant || tenants[0].active !== true) {
      throw new CLASSES.NodicsError("ERR_AUTH_00003");
    }
    // Runtime configuration retains storage intent/pins, never private creation hashes.
    const properties = require("lodash").cloneDeep(tenants[0].properties || {});
    delete properties.enterpriseProvisioning;
    return {
      code: "SUC_FIND_00000",
      result: [
        {
          code: enterprise.code,
          active: true,
          tenant: {
            code: enterprise.tenant.code,
            active: true,
            properties,
          },
        },
      ],
    };
  },

  /** Resolves only explicitly reviewed runtime/business placement; bootstrap lookup remains independently exact. */
  resolveRuntimeEnterprise: async function (request) {
    const fail = () => { throw new CLASSES.NodicsError("ERR_AUTH_00003"); };
    const same = require("node:util").isDeepStrictEqual;
    const identifier = value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
    const policy = CONFIG.get("profileRuntimeEnterpriseResolution"), payload = request.payload;
    if (policy?.enabled !== true || CONFIG.get("runtimeRole")?.code !== policy.runtimeRole ||
        !payload || Object.keys(payload).sort().join(",") !== "contractVersion,enterpriseCode" ||
        payload.contractVersion !== 1 || !identifier(payload.enterpriseCode) || Object.keys(request.query || {}).length) fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, CONFIG.get("profileModuleName") || "profile");
    if (auth.principalType !== "service" || auth.isSystem || !auth.permissions?.includes("profile.enterprise.search") ||
        auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode ||
        [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== auth.tenant) ||
        [request.entCode, request.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
          .some(value => value !== undefined && value !== auth.entCode)) fail();
    const coordinates = ["projectCode", "environmentCode", "serverCode", "instanceCode", "assignmentCode"];
    const callers = policy.callers;
    if (!Array.isArray(callers) || !callers.length || callers.length > 100 || callers.some(grant =>
        !grant || Object.keys(grant).sort().join(",") !== "enterpriseCodes,environmentCode,instanceCode,principalEnterpriseCode,projectCode,serverCode,serviceId,tenant,assignmentCode".split(",").sort().join(",") ||
        !["tenant", "principalEnterpriseCode", "serviceId", ...coordinates].every(key => identifier(grant[key])) ||
        !Array.isArray(grant.enterpriseCodes) || !grant.enterpriseCodes.length || grant.enterpriseCodes.length > 100 ||
        grant.enterpriseCodes.some(code => !identifier(code)) || new Set(grant.enterpriseCodes).size !== grant.enterpriseCodes.length)) fail();
    const grants = callers.filter(grant => grant.tenant === auth.tenant && grant.principalEnterpriseCode === auth.entCode &&
      grant.serviceId === auth.serviceId && grant.enterpriseCodes.includes(payload.enterpriseCode) &&
      coordinates.every(key => grant[key] === auth.runtimeScope[key]) && grant.instanceCode === auth.runtimeInstanceId &&
      grant.environmentCode === NODICS.getSelectedEnvironmentName());
    if (grants.length !== 1) fail();
    const pin = structuredClone({ policy, auth, payload });
    const check = () => {
      if (!same(CONFIG.get("profileRuntimeEnterpriseResolution"), pin.policy) || !same(request.authData, pin.auth) ||
          !same(request.payload, pin.payload) || request.tenant !== pin.auth.tenant ||
          CONFIG.get("runtimeRole")?.code !== pin.policy.runtimeRole ||
          NODICS.getSelectedEnvironmentName() !== pin.auth.runtimeScope.environmentCode ||
          [request.tenantCode, request.authData.tenantCode].some(value => value !== undefined && value !== pin.auth.tenant) ||
          [request.entCode, request.enterpriseCode, request.httpRequest?.headers?.["x-enterprise-code"]]
            .some(value => value !== undefined && value !== pin.auth.entCode)) fail();
    };
    const placement = async () => {
      check();
      const rows = SERVICE.DefaultEnterpriseTenantProvisioningService;
      const enterprises = await rows.rows("DefaultEnterpriseService", { code: pin.payload.enterpriseCode, active: true });
      check();
      const enterprise = enterprises.length === 1 ? enterprises[0] : undefined;
      const tenantCode = typeof enterprise?.tenant === "string" ? enterprise.tenant : enterprise?.tenant?.code;
      if (!enterprise || enterprise.code !== pin.payload.enterpriseCode || enterprise.active !== true || tenantCode !== pin.auth.tenant) fail();
      const tenants = await rows.rows("DefaultTenantService", { code: tenantCode, active: true });
      check();
      if (tenants.length !== 1 || tenants[0].code !== pin.auth.tenant || tenants[0].active !== true) fail();
      return { code: enterprise.code, active: true, revision: enterprise.revision,
        tenant: { code: tenantCode, active: true, revision: tenants[0].revision } };
    };
    const before = await placement();
    if (!same(before, await placement())) fail();
    check();
    return { code: "SUC_FIND_00000", result: [{ code: before.code, active: true,
      tenant: { code: before.tenant.code, active: true } }] };
  },

  /**
   * Retrieves enterprise information.
   *
   * @param {*} entCode Method input.
   * @returns {*} Method result.
   */
  retrieveEnterprise: function (entCode) {
    return new Promise((resolve, reject) => {
      if (UTILS.isBlank(entCode)) {
        reject(
          new CLASSES.NodicsError(
            "ERR_PRFL_00003",
            "Enterprise code can not be null or empty",
          ),
        );
      } else {
        this.get({
          tenant: CONFIG.get("defaultTenant") || "default",
          authData:
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          options: {
            recursive: true,
          },
          query: {
            code: entCode,
          },
        })
          .then((enterprises) => {
            if (enterprises.result.length !== 1) {
              reject(
                new CLASSES.NodicsError(
                  "ERR_PRFL_00003",
                  "None enterprise found for code: " + entCode,
                ),
              );
            } else if (
              !enterprises.result[0].active ||
              !enterprises.result[0].tenant ||
              enterprises.result[0].tenant.active === false
            ) {
              reject(
                new CLASSES.NodicsError(
                  "ERR_AUTH_00003",
                  "Enterprise or tenant is inactive",
                ),
              );
            } else {
              resolve(enterprises.result[0]);
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },
};
