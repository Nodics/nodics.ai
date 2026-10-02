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
const verifiedRequests = new WeakSet();
const crypto = require("node:crypto");

/**
 * @module profile/service/enterprise/defaultEnterpriseTenantProvisioningService
 * @description Binds new tenant namespace intent to the original enterprise setup; existing unmarked tenants require fresh absence-of-use evidence. No provider writes, identity copies or business grants.
 * @owner profile
 * @layer service
 * @override Preserve exact setup provenance, canonical generated-owner reads and fail-closed established-tenant protection.
 */
module.exports = {
  /** Emits only the fixed owner failure, never private provenance/provider diagnostics. */
  fail: function () { throw new CLASSES.NodicsError("ERR_PROFILE_TENANT_PROVISIONING_HELD"); },

  /** Projects only the original enterprise binding for native Local runtime authentication after protected namespace admission; never persists/copies a key or replaces explicit tenant configuration. @param {Object} tenant Fresh admitted canonical tenant. @returns {Object} Private runtime configuration view. */
  runtimeBootstrapView: function (tenant) {
    const properties = tenant.properties || {};
    const bootstrap = SERVICE.DefaultMandatoryIdentityBootstrapService;
    if (Object.hasOwn(properties, "defaultAuthDetail") ||
        bootstrap?.isLocalRuntimeCredentialBootstrapEnabled?.() !== true ||
        CONFIG.get("profileTenantProvisioning")?.enabled !== true) return tenant;
    const enterpriseCode = properties.enterpriseProvisioning?.enterpriseCode;
    if (typeof enterpriseCode !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(enterpriseCode)) this.fail();
    return { ...tenant, properties: { ...properties, defaultAuthDetail: { entCode: enterpriseCode } } };
  },

  /** Admits native Local target grant preparation through original scope/pin evidence and current authenticated default-principal grants; declarations alone grant nothing. @param {string} tenantCode Target realm. @param {Object} scope Existing native runtime scope. @returns {Promise<string>} Fresh canonical target enterprise. */
  authorizeLocalRuntimeBootstrapScope: async function (tenantCode, scope) {
    try {
      const defaultTenant = CONFIG.get("defaultTenant") || "default";
      if (tenantCode === defaultTenant || CONFIG.get("profileTenantProvisioning")?.enabled !== true ||
          SERVICE.DefaultMandatoryIdentityBootstrapService?.isLocalRuntimeCredentialBootstrapEnabled?.() !== true) this.fail();
      const tenants = await this.rows("DefaultTenantService", { code: tenantCode });
      if (tenants.length !== 1 || tenants[0].active !== true) this.fail();
      const tenant = tenants[0], provenance = tenant.properties?.enterpriseProvisioning;
      const enterprises = await this.rows("DefaultEnterpriseService", { code: provenance?.enterpriseCode });
      const enterprise = enterprises[0];
      if (enterprises.length !== 1 || enterprise.active !== true || provenance?.version !== 1 ||
          (typeof enterprise.tenant === "object" ? enterprise.tenant.code : enterprise.tenant) !== tenantCode ||
          provenance.setupRequestKey !== enterprise.setupRequestKey || provenance.setupRequestHash !== enterprise.setupRequestHash ||
          CONFIG.get("defaultAuthDetail", tenantCode)?.entCode !== enterprise.code) this.fail();
      const stable = { projectCode: scope.projectCode, environmentCode: scope.environmentCode, serverCode: scope.serverCode };
      const scopeKey = "deployment_" + crypto.createHash("sha256")
        .update(JSON.stringify([stable.projectCode, stable.environmentCode, stable.serverCode])).digest("hex");
      const original = provenance.deploymentScopes?.[scopeKey];
      if (!original || !isDeepStrictEqual(original.scope, stable) || !Array.isArray(original.modules) ||
          !Array.isArray(scope.modules)) this.fail();
      this.assertLocalRemoteModuleExtensions(scope, original.modules);
      // This runtime's namespace is pinned before target identity preparation.
      SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding(tenantCode);
      const credentials = CONFIG.get("defaultAuthDetail", defaultTenant) || {};
      const logger = SERVICE.DefaultLoggerService;
      if (typeof logger?.runSensitiveOperation !== "function") this.fail();
      const input = { apiKey: credentials.apiKey, entCode: credentials.entCode };
      const proof = await logger.runSensitiveOperation(input, () => SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey(input));
      const principal = proof.person || {};
      const request = { tenant: defaultTenant, authData: { person: principal, tenant: proof.tenant,
        entCode: proof.enterprise?.code, permissions: [...new Set([...(principal.apiKeyScopes || []), ...(principal.userGroupPermissions || [])])] },
        headers: { "x-nodics-project": scope.projectCode, "x-nodics-environment": scope.environmentCode,
          "x-nodics-server": scope.serverCode, "x-nodics-runtime-instance": scope.instanceCode,
          "x-nodics-modules": scope.modules.join(",") } };
      const approved = await logger.runSensitiveOperation(request, () => SERVICE.DefaultRuntimeAuthorizationService.authorize(request));
      const permission = CONFIG.get("profileTenantProvisioning")?.permission;
      if (typeof permission !== "string" || !approved.permissions.includes(permission) ||
          !Array.isArray(scope.permissions) || scope.permissions.some(permission => !approved.permissions.includes(permission))) this.fail();
      return enterprise.code;
    } catch { this.fail(); }
  },

  /** Validates explicitly adopted remote-only extensions for an original Local deployment; never changes namespace snapshots or admits active modules. @param {Object} scope Current runtime scope. @param {string[]} originalModules Immutable creation ceiling. @returns {void} Throws when any extension lacks deployment-owned adoption. */
  assertLocalRemoteModuleExtensions: function (scope, originalModules) {
    const additions = scope.modules.filter(module => !originalModules.includes(module));
    if (additions.length === 0) return;
    const bootstrap = SERVICE.DefaultMandatoryIdentityBootstrapService;
    if (bootstrap?.isLocalRuntimeCredentialBootstrapEnabled?.() !== true ||
        scope.projectCode !== NODICS.getEnvironmentName() ||
        scope.environmentCode !== NODICS.getSelectedEnvironmentName()) this.fail();
    const resolved = bootstrap.readResolvedRuntimeDeployment({
      projectRoot: bootstrap.getProjectRoot(), environmentCode: scope.environmentCode,
      serverCode: scope.serverCode,
    });
    const identity = resolved.properties?.runtimeIdentity;
    const allowed = resolved.properties?.profileTenantProvisioning?.localRuntimeRemoteModuleExtensions;
    const valid = values => Array.isArray(values) && values.length <= 512 && values.every(value =>
      typeof value === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(value));
    if (!valid(allowed) || !valid(identity?.remoteModules) || !valid(resolved.modules) ||
        identity.instanceCode !== scope.instanceCode ||
        additions.some(module => !allowed.includes(module) || !identity.remoteModules.includes(module) ||
          resolved.modules.includes(module))) this.fail();
  },

  /** Constructs namespace intent using nDatabase, with private original setup binding. */
  propertiesForCreation: function (tenantCode, creation) {
    if (!creation || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(creation.enterpriseCode || "") ||
        !/^[a-f0-9]{64}$/.test(creation.setupRequestKey || "") ||
        !/^[a-f0-9]{64}$/.test(creation.setupRequestHash || "")) this.fail();
    const owner = SERVICE.DefaultDatabaseConfigurationService;
    if (typeof owner?.createTenantNamespaceIntent !== "function") this.fail();
    return { ...owner.createTenantNamespaceIntent(tenantCode),
      enterpriseProvisioning: { version: 1, enterpriseCode: creation.enterpriseCode,
        setupRequestKey: creation.setupRequestKey, setupRequestHash: creation.setupRequestHash } };
  },

  /** Freezes original approved stable deployment scopes from existing grants at NEW Tenant creation, never from browser input. */
  captureCreationProperties: async function (tenantCode, creation) {
    try {
      const properties = this.propertiesForCreation(tenantCode, creation);
      const projectCode = NODICS.getEnvironmentName(), environmentCode = NODICS.getSelectedEnvironmentName();
      const defaultTenant = CONFIG.get("defaultTenant") || "default";
      const enterpriseCode = CONFIG.get("defaultAuthDetail", defaultTenant)?.entCode;
      const permission = CONFIG.get("profileTenantProvisioning")?.permission;
      if (!enterpriseCode || !permission) this.fail();
      const envelope = await SERVICE.DefaultPrincipalScopeAssignmentService.get({
        tenant: defaultTenant, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        query: { scopeType: "RUNTIME_DEPLOYMENT", tenantCode: defaultTenant, enterpriseCode,
          "runtimeScope.projectCode": projectCode, "runtimeScope.environmentCode": environmentCode },
        options: { recursive: false, skipItemCache: true, limit: 513 },
        searchOptions: { pageSize: 513, pageNumber: 1 }
      });
      if (!/^SUC_/.test(envelope?.code || "") || envelope.success === false || envelope.error || envelope.errors?.length ||
          !Array.isArray(envelope.result) || envelope.result.length > 512) this.fail();
      const scopes = {}, now = Date.now();
      for (const assignment of envelope.result) {
        SERVICE.DefaultRuntimeAuthorizationService.validateAssignment(assignment);
        const scope = assignment.runtimeScope;
        if (assignment.scopeType !== "RUNTIME_DEPLOYMENT" || assignment.tenantCode !== defaultTenant ||
            assignment.enterpriseCode !== enterpriseCode || scope.projectCode !== projectCode || scope.environmentCode !== environmentCode) this.fail();
        if (assignment.status !== "ACTIVE" || assignment.effect !== "ALLOW" ||
            (assignment.effectiveFrom && new Date(assignment.effectiveFrom).getTime() > now) ||
            (assignment.effectiveTo && new Date(assignment.effectiveTo).getTime() <= now) ||
            !scope.permissions.includes(permission) || !scope.modules.includes(CONFIG.get("profileModuleName") || "profile")) continue;
        const stable = { projectCode: scope.projectCode, environmentCode: scope.environmentCode, serverCode: scope.serverCode };
        const scopeKey = "deployment_" + crypto.createHash("sha256")
          .update(JSON.stringify([stable.projectCode, stable.environmentCode, stable.serverCode])).digest("hex");
        const modules = [...scope.modules].sort();
        if (scopes[scopeKey] && !isDeepStrictEqual(scopes[scopeKey].modules, modules)) this.fail();
        scopes[scopeKey] = { scope: stable, modules };
      }
      if (!Object.keys(scopes).length) this.fail();
      properties.enterpriseProvisioning.deploymentScopes = scopes;
      return properties;
    } catch { this.fail(); }
  },

  /** Reads a bounded fresh canonical envelope; missing owners and malformed evidence refuse. */
  rows: async function (serviceName, query, pageSize = 2) {
    try {
      if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 257) this.fail();
      const service = SERVICE[serviceName];
      if (typeof service?.get !== "function") this.fail();
      const request = { tenant: CONFIG.get("defaultTenant") || "default",
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), query,
        options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize, pageNumber: 1 } };
      const result = serviceName === "DefaultEnterpriseService"
        ? await SERVICE.DefaultEnterpriseTeamAdministrationService.readEnterpriseEnvelope(service, request)
        : serviceName === "DefaultTenantService"
          ? await SERVICE.DefaultTenantProvisioningGuardService.invoke("get", request)
          : await service.get(request);
      if (!result || !/^SUC_/.test(result.code || "") || result.success === false || result.error ||
          (result.errors && (!Array.isArray(result.errors) || result.errors.length)) ||
          !Array.isArray(result.result) || result.result.length >= (pageSize > 2 ? pageSize : pageSize + 1)) this.fail();
      return result.result;
    } catch { this.fail(); }
  },

  /** Reads complete bounded enterprise inventory through Team's unchanged private keyset admission. */
  inventoryEnterpriseRows: async function (tenantCode, budget) {
    try {
      if (!Number.isSafeInteger(budget) || budget < 0 || budget > 256) this.fail();
      const rows = [];
      let cursor, total;
      do {
        const pageSize = Math.min(101, budget - rows.length + 1);
        const request = { tenant: CONFIG.get("defaultTenant") || "default",
          authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: { tenant: tenantCode, active: true, ...(cursor === undefined ? {} : { code: { $gt: cursor } }) },
          options: { recursive: false, skipItemCache: true },
          searchOptions: { pageSize, pageNumber: 1, sort: { code: 1 } } };
        const response = await SERVICE.DefaultEnterpriseTeamAdministrationService.readEnterpriseEnvelope(
          SERVICE.DefaultEnterpriseService, request);
        if (!response || !/^SUC_/.test(response.code || "") || response.success === false || response.error ||
            (response.errors && (!Array.isArray(response.errors) || response.errors.length)) ||
            !Array.isArray(response.result) || !Number.isSafeInteger(response.count) || response.count < 0) this.fail();
        if (total === undefined) total = response.count;
        if (total > budget || response.count !== total - rows.length ||
            response.result.length !== Math.min(pageSize, response.count)) this.fail();
        for (const row of response.result) {
          if (typeof row?.code !== "string" || !row.code || (cursor !== undefined && row.code <= cursor) ||
              row.active !== true || (typeof row.tenant === "object" ? row.tenant?.code : row.tenant) !== tenantCode) this.fail();
          cursor = row.code;
          rows.push(row);
        }
      } while (rows.length < total);
      return rows;
    } catch { this.fail(); }
  },

  /** Proves this is the original uninitialized setup, not authorization to relocate an established tenant. */
  assertUnused: async function (enterprise, tenant) {
    if (!enterprise._id || !tenant._id || enterprise.active !== true || tenant.active !== true ||
        enterprise.code !== tenant.code || !/^[a-f0-9]{64}$/.test(enterprise.setupRequestKey || "") ||
        !/^[a-f0-9]{64}$/.test(enterprise.setupRequestHash || "") ||
        (tenant.properties && Object.keys(tenant.properties).length)) this.fail();
    // Any initialization attempt is conservatively held: a FAILED receipt is
    // not proof that credential or other writes did not commit.
    for (const [service, query] of [
      ["DefaultEnterpriseAccessAssignmentService", { $or: [{ enterpriseCode: enterprise.code }, { tenantCode: tenant.code }] }],
      ["DefaultPrincipalScopeAssignmentService", { $or: [{ enterpriseCode: enterprise.code }, { tenantCode: tenant.code }] }],
      ["DefaultDataInstallationService", { tenant: tenant.code }],
      ["DefaultImportRunService", { $or: [{ tenant: tenant.code }, { targetTenants: tenant.code }] }],
      ["DefaultEmployeeService", { "authenticationIdentity.tenantCode": tenant.code }],
      ["DefaultCustomerService", { "authenticationIdentity.tenantCode": tenant.code }]
    ]) if ((await this.rows(service, query)).length) this.fail();
    if (NODICS.getInternalAuthTokens?.()[tenant.code]) this.fail();
  },

  /** Returns freshly owned properties; historical empty configuration without an original deployment snapshot remains HELD without persistence. */
  prepare: async function (supplied) {
    const code = supplied?.code;
    const tenantCode = typeof supplied?.tenant === "object" ? supplied.tenant.code : supplied?.tenant;
    if (!tenantCode || tenantCode === (CONFIG.get("defaultTenant") || "default")) return supplied.tenant;
    const enterprises = await this.rows("DefaultEnterpriseService", { code });
    const tenants = await this.rows("DefaultTenantService", { code: tenantCode });
    if (enterprises.length !== 1 || tenants.length !== 1) this.fail();
    const enterprise = enterprises[0], tenant = tenants[0];
    const actualTenant = typeof enterprise.tenant === "object" ? enterprise.tenant.code : enterprise.tenant;
    if (actualTenant !== tenantCode || enterprise.code !== supplied.code ||
        (supplied._id && String(enterprise._id) !== String(supplied._id)) ||
        (supplied.setupRequestKey !== undefined && enterprise.setupRequestKey !== supplied.setupRequestKey) ||
        (supplied.setupRequestHash !== undefined && enterprise.setupRequestHash !== supplied.setupRequestHash)) this.fail();
    const namespace = tenant.properties?.database?.tenantNamespace;
    if (namespace !== undefined) {
      const intent = SERVICE.DefaultDatabaseConfigurationService.createTenantNamespaceIntent(tenantCode).database.tenantNamespace;
      if (!isDeepStrictEqual(namespace, intent)) this.fail();
      const binding = tenant.properties.enterpriseProvisioning;
      if (binding && (binding.version !== 1 || binding.enterpriseCode !== enterprise.code ||
          binding.setupRequestKey !== enterprise.setupRequestKey || binding.setupRequestHash !== enterprise.setupRequestHash)) this.fail();
      return tenant;
    }
    // Explicit existing tenant configuration remains owner-controlled. The
    // database owner independently validates it; never overwrite it here.
    if (tenant.properties && Object.keys(tenant.properties).length) return tenant;
    // Absence of use does not prove the original approved deployment scopes.
    // Current grants cannot reconstruct historical creation authority.
    this.fail();
  },

  /** Validates signed default-tenant runtime proof and reuses the exact current deployment-grant owner. */
  admitRuntime: async function (request, modules, inventory = false) {
    const defaultTenant = CONFIG.get("defaultTenant") || "default";
    if (request.tenant !== defaultTenant) this.fail();
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, CONFIG.get("profileModuleName") || "profile");
    const policy = CONFIG.get("profileTenantProvisioning") || {};
    const permission = inventory ? policy.inventoryPermission : policy.permission;
    if (!permission || !Array.isArray(auth.permissions) || !auth.permissions.includes(permission)) this.fail();
    const scope = auth.runtimeScope;
    const approved = await SERVICE.DefaultRuntimeAuthorizationService.authorize({
      tenant: defaultTenant, authData: auth, requireExactModules: true,
      headers: { "x-nodics-project": scope.projectCode, "x-nodics-environment": scope.environmentCode,
        "x-nodics-server": scope.serverCode, "x-nodics-runtime-instance": scope.instanceCode,
        "x-nodics-modules": [...new Set([CONFIG.get("profileModuleName") || "profile", ...modules])].join(",") }
    });
    if (approved.serviceId !== auth.serviceId || approved.runtimeScope.assignmentCode !== scope.assignmentCode ||
        !approved.permissions.includes(permission)) this.fail();
    return scope;
  },

  /** Shared local/HTTP admission verifies actual retained bearer proof, never caller-supplied authData. */
  bindWithProof: async function (request) {
    return this.runRuntimeCommand(request, "bind");
  },
  /** Uses the same exact retained proof for bounded approved bootstrap inventory. */
  inventoryWithProof: async function (request) {
    return this.runRuntimeCommand(request, "inventory");
  },
  /** Fixed internal operations only; no request/body method selector. */
  runRuntimeCommand: async function (request, operation) {
    try {
      if (!["bind", "inventory"].includes(operation)) this.fail();
      if (CONFIG.get("profileTenantProvisioning")?.enabled !== true ||
          CONFIG.get("apiExposure")?.categories?.profileTenantProvisioning?.enabled !== true) this.fail();
      const headers = request.httpRequest?.headers || request.headers || {};
      const header = headers.authorization || headers.Authorization;
      if (typeof header !== "string" || !/^Bearer [^\s]+$/.test(header)) this.fail();
      const verified = await SERVICE.DefaultAuthorizationProviderService.authorizeToken({ authToken: header.slice(7) });
      if (!/^SUC_/.test(verified?.code || "") || !verified.result) this.fail();
      const admitted = { tenant: request.tenant, authData: structuredClone(verified.result),
        body: structuredClone(request.body), params: structuredClone(request.params) };
      verifiedRequests.add(admitted);
      try { return operation === "bind" ? await this.bind(admitted) : await this.inventory(admitted); }
      finally { verifiedRequests.delete(admitted); }
    } catch { this.fail(); }
  },

  /** Private startup inventory, limited to the default enterprise and originally approved deployment scopes; never public CRUD enumeration. */
  inventory: async function (request) {
    try {
      if (!verifiedRequests.has(request) || (request.body && Object.keys(request.body).length)) this.fail();
      const scope = await this.admitRuntime(request, [], true);
      const scopeKey = "deployment_" + crypto.createHash("sha256")
        .update(JSON.stringify([scope.projectCode, scope.environmentCode, scope.serverCode])).digest("hex");
      const tenants = await this.rows("DefaultTenantService", { active: true }, 257);
      const result = [], defaultTenant = CONFIG.get("defaultTenant") || "default";
      let inspected = 0;
      for (const tenant of tenants) {
        const provenance = tenant.properties?.enterpriseProvisioning;
        const original = provenance?.deploymentScopes?.[scopeKey];
        const enterprises = await this.inventoryEnterpriseRows(tenant.code, 256 - inspected);
        inspected += enterprises.length;
        // Preserve a failed original unmarked setup as HELD, not an implicit
        // startup quarantine or authorization to relocate it.
        if (tenant.code !== defaultTenant && !provenance && enterprises.some(row => row.setupRequestKey || row.setupRequestHash)) this.fail();
        if (tenant.code !== defaultTenant && !original) continue;
        if (tenant.code !== defaultTenant && (!isDeepStrictEqual(original.scope, {
          projectCode: scope.projectCode, environmentCode: scope.environmentCode, serverCode: scope.serverCode
        }) || !enterprises.some(row => row.code === provenance.enterpriseCode &&
          row.setupRequestKey === provenance.setupRequestKey && row.setupRequestHash === provenance.setupRequestHash))) this.fail();
        const properties = structuredClone(tenant.properties || {}); delete properties.enterpriseProvisioning;
        for (const enterprise of enterprises) {
          if (tenant.code === defaultTenant && enterprise.code !== request.authData.entCode) continue;
          result.push({ code: enterprise.code, active: true, tenant: { code: tenant.code, active: true, properties } });
          if (result.length > 256) this.fail();
        }
      }
      if (!result.some(row => row.tenant.code === defaultTenant && row.code === request.authData.entCode)) this.fail();
      return { code: "SUC_PRFL_00000", result };
    } catch { this.fail(); }
  },

  /** Pins one exact complete runtime candidate; no new runtime enrollment or uncertain write replay. */
  bind: async function (request) {
    try {
      if (!verifiedRequests.has(request)) this.fail();
      const candidate = request.body;
      const tenantCode = request.params?.tenantCode;
      const moduleNames = Object.keys(candidate?.binding?.modules || {});
      // database.default is an owner-defined channel role, not a functional module entitlement.
      const scope = await this.admitRuntime(request, moduleNames.filter(name => name !== "default"));
      const database = SERVICE.DefaultDatabaseConfigurationService;
      if (database.validateTenantNamespaceBindingCandidate(candidate, { tenantCode, projectCode: scope.projectCode,
          environmentCode: scope.environmentCode, serverCode: scope.serverCode }) !== true) this.fail();
      const tenants = await this.rows("DefaultTenantService", { code: tenantCode });
      if (tenants.length !== 1 || tenants[0].active !== true) this.fail();
      const tenant = tenants[0], properties = tenant.properties;
      const provenance = properties?.enterpriseProvisioning;
      if (!provenance || provenance.version !== 1 ||
          !isDeepStrictEqual(properties.database?.tenantNamespace, database.createTenantNamespaceIntent(tenantCode).database.tenantNamespace)) this.fail();
      const enterprises = await this.rows("DefaultEnterpriseService", { code: provenance.enterpriseCode });
      const enterprise = enterprises[0];
      if (enterprises.length !== 1 || enterprise.active !== true ||
          (typeof enterprise.tenant === "object" ? enterprise.tenant.code : enterprise.tenant) !== tenantCode ||
          provenance.setupRequestKey !== enterprise.setupRequestKey || provenance.setupRequestHash !== enterprise.setupRequestHash) this.fail();
      const bindings = properties.database.tenantNamespaceBindings;
      const originalScope = provenance.deploymentScopes?.[candidate.scopeKey];
      if (!originalScope || !isDeepStrictEqual(originalScope.scope, candidate.binding.scope) ||
          !Array.isArray(originalScope.modules) || moduleNames.some(name => name !== "default" && !originalScope.modules.includes(name))) this.fail();
      if (bindings && Object.hasOwn(bindings, candidate.scopeKey)) {
        if (!isDeepStrictEqual(bindings[candidate.scopeKey], candidate.binding)) this.fail();
        return this.runtimeBootstrapView(tenant);
      }
      // The original immutable deployment snapshot permits another approved
      // runtime to initialize after the first one; newly enrolled scopes do not.
      if (!bindings || !Object.keys(bindings).length) await this.assertUnused(enterprise, { ...tenant, properties: undefined });
      let current = tenant;
      for (let attempt = 0; attempt < 3; attempt++) {
        const next = structuredClone(current.properties);
        next.database.tenantNamespaceBindings = { ...current.properties.database.tenantNamespaceBindings,
          [candidate.scopeKey]: structuredClone(candidate.binding) };
        let acknowledgement;
        try {
          acknowledgement = await SERVICE.DefaultTenantProvisioningGuardService.invoke("update", {
          tenant: CONFIG.get("defaultTenant") || "default",
          authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
          query: { _id: tenant._id, code: tenantCode, active: true, properties: current.properties }, model: { properties: next },
          options: { recursive: false, skipItemCache: true, upsert: false }
          });
        } catch { /* Uncertain writes are read back, never retried. */ }
        const confirmed = await this.rows("DefaultTenantService", { _id: tenant._id, code: tenantCode });
        if (confirmed.length !== 1 || confirmed[0].active !== true) this.fail();
        const actual = confirmed[0].properties, actualBindings = actual?.database?.tenantNamespaceBindings;
        const withoutBindings = value => {
          const copy = structuredClone(value); delete copy.database.tenantNamespaceBindings; return copy;
        };
        if (!isDeepStrictEqual(withoutBindings(actual), withoutBindings(properties)) ||
            Object.entries(current.properties.database.tenantNamespaceBindings || {}).some(([key, binding]) =>
              !isDeepStrictEqual(actualBindings?.[key], binding))) this.fail();
        if (actualBindings && Object.hasOwn(actualBindings, candidate.scopeKey)) {
          if (!isDeepStrictEqual(actualBindings[candidate.scopeKey], candidate.binding)) this.fail();
          return this.runtimeBootstrapView(confirmed[0]);
        }
        // Retry only a positively acknowledged zero-match CAS, after proving
        // unchanged configuration/provenance and independently admitted additions.
        if (!/^SUC_/.test(acknowledgement?.code || "") || acknowledgement.success === false ||
            !(acknowledgement.result?.matchedCount === 0 || acknowledgement.result?.count === 0)) this.fail();
        for (const [key, binding] of Object.entries(actualBindings || {})) {
          const original = provenance.deploymentScopes?.[key];
          if (!original || database.validateTenantNamespaceBindingCandidate({ scopeKey: key, binding },
              { tenantCode, ...original.scope }) !== true) this.fail();
        }
        current = confirmed[0];
      }
      this.fail();
    } catch { this.fail(); }
  }
};
