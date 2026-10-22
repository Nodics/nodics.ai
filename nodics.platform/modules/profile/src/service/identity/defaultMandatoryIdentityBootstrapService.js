/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultMandatoryIdentityBootstrapService
 * @description Awaits governed Init releases and validates retained runtime assignments without repairing identity authority or credentials from configuration.
 * @layer service
 * @owner profile
 * @override Later layers may extend read-only validation; first-install identities belong to module data packs and subsequent changes to governed Profile commands.
 */
module.exports = {
  /** Requires nImport's exact awaited schema operation for startup or explicit migration; public flags confer no authority. */
  assertBootstrapImport: function (request, schemaName) {
    if (!["employee", "customer", "address", "contact", "enterprise", "tenant"].includes(schemaName) ||
        !request?.tenant || !request.authData ||
        SERVICE.DefaultDataReleaseService?.isIdentityAuthorityReleaseExecution?.(request.tenant, schemaName, "ensureBootstrapAll") !== true) {
      throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
    }
  },

  /** Validates source identity keys without treating mutable groups, credentials or lifecycle values as desired updates. */
  assertBootstrapIdentity: function (schemaName, model, original) {
    const fail = () => { throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP"); };
    if (!model || Object.getPrototypeOf(model) !== Object.prototype ||
        typeof model.code !== "string" || !model.code || model.code.length > 192 ||
        model.code.trim() !== model.code || model._id !== undefined ||
        Object.keys(model).some(key => key.startsWith("$") || key.includes("."))) fail();
    const principal = ["employee", "customer"].includes(schemaName);
    if (principal && (typeof model.loginId !== "string" || !model.loginId ||
        model.loginId.length > 320 || model.loginId.trim() !== model.loginId ||
        model.authenticationIdentity || model.identityLinkRetirement ||
        (schemaName === "employee" && !["human", "service"].includes(model.principalType)) ||
        (schemaName === "customer" && ![undefined, "customer"].includes(model.principalType)))) fail();
    if (!original) return;
    if (!original._id || original.code !== model.code) fail();
    if (principal && (original.loginId !== model.loginId || original.authenticationIdentity ||
        original.identityLinkRetirement ||
        (schemaName === "employee" && original.principalType !== model.principalType) ||
        (schemaName === "customer" && ![undefined, "customer"].includes(original.principalType)))) fail();
    if (schemaName === "enterprise") {
      const codeOf = value => typeof value === "string" ? value : value?.code;
      if (codeOf(original.tenant) !== codeOf(model.tenant)) fail();
    }
  },

  /** Reads the exact code/login collision set through the generated owner with uncached, bounded evidence. */
  readBootstrapIdentity: async function (service, schemaName, request, model) {
    this.assertBootstrapImport(request, schemaName);
    const response = await service.get({
      tenant: request.tenant, authData: request.authData,
      query: ["employee", "customer"].includes(schemaName)
        ? { $or: [{ code: model.code }, { loginId: model.loginId }] } : { code: model.code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    this.assertBootstrapImport(request, schemaName);
    if (!/^SUC_/.test(response?.code || "") ||
        response.success !== undefined && response.success !== true ||
        response.acknowledged !== undefined && response.acknowledged !== true || response.error ||
        (response.errors && (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) || response.count !== response.result.length || response.result.length > 1) {
      throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
    }
    const original = response.result[0];
    this.assertBootstrapIdentity(schemaName, model, original);
    return original;
  },

  /** Imports a bounded forward Init batch through fixed Profile owners: existing records are no-write receipts, new records are insert-only. */
  ensureBootstrapAll: async function (service, schemaName, request) {
    this.assertBootstrapImport(request, schemaName);
    const owners = { employee: "DefaultEmployeeService", customer: "DefaultCustomerService",
      address: "DefaultAddressService", contact: "DefaultContactService",
      enterprise: "DefaultEnterpriseService", tenant: "DefaultTenantService" };
    if (!Object.hasOwn(owners, schemaName) || service !== SERVICE[owners[schemaName]] ||
        typeof service?.get !== "function" || typeof service?.save !== "function" ||
        !Array.isArray(request.models) || request.models.length > 1000) {
      throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
    }
    const models = structuredClone(request.models), codes = new Set(), logins = new Set();
    for (const model of models) {
      this.assertBootstrapIdentity(schemaName, model);
      if (codes.has(model.code) || (model.loginId && logins.has(model.loginId)) ||
          (["employee", "customer"].includes(schemaName) &&
            request.tenant !== (CONFIG.get("defaultTenant") || "default") &&
            !(schemaName === "employee" && model.principalType === "service"))) {
        throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
      }
      codes.add(model.code);
      if (model.loginId) logins.add(model.loginId);
    }
    // Resolve every collision before the first insert; a failed batch is resumable, not transactional.
    const existing = [];
    for (const model of models) existing.push(await this.readBootstrapIdentity(service, schemaName, request, model));
    for (let index = 0; index < models.length; index++) {
      if (existing[index]) continue;
      this.assertBootstrapImport(request, schemaName);
      const saved = await service.save({ tenant: request.tenant, authData: request.authData,
        model: structuredClone(models[index]),
        options: { insertOnly: true, recursive: false, returnModified: false } });
      this.assertBootstrapImport(request, schemaName);
      if (!/^SUC_/.test(saved?.code || "") ||
          saved.success !== undefined && saved.success !== true ||
          saved.acknowledged !== undefined && saved.acknowledged !== true ||
          saved.result?.acknowledged !== undefined && saved.result.acknowledged !== true || saved.error ||
          (saved.errors && (!Array.isArray(saved.errors) || saved.errors.length)) ||
          !(await this.readBootstrapIdentity(service, schemaName, request, models[index]))) {
        throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
      }
    }
    return { result: models.map(model => ({ code: model.code })) };
  },

  /** Installs selected Init releases through nImport before inspecting retained identity data. */
  prepareTenant: async function (request) {
    await SERVICE.DefaultDataReleaseService.installStartupReleases(
      this.systemRequest(request, {
        modules: request.modules,
        source: request.source,
      }),
    );
    return this.reconcile(request);
  },

  /** Builds the existing trusted tenant-scoped request for the release owner. */
  systemRequest: function (request, additions) {
    return Object.assign(
      {
        tenant: request.tenant || CONFIG.get("defaultTenant") || "default",
        authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
        options: { recursive: false, skipItemCache: true },
      },
      additions || {},
    );
  },

  /** Returns deployment coordinates, not an authorization grant. */
  getSelectedEnvironmentCode: function () {
    if (typeof NODICS !== "undefined" &&
        typeof NODICS.getSelectedEnvironmentName === "function") {
      return NODICS.getSelectedEnvironmentName();
    }
    return process.env.ENV || process.env.E || "";
  },

  /** Selects tenant provisioning admission only; existing proof and persisted deployment grants remain independently required. */
  isRuntimeDeploymentBootstrapEnabled: function (tenant) {
    if (CONFIG.get("identityGovernance")?.migration?.runtimeDeploymentBootstrapEnabled !== true) return false;
    const credentials = CONFIG.get("defaultAuthDetail", tenant) || {};
    const apiKey = credentials.apiKey || process.env.NODICS_RUNTIME_API_KEY;
    return typeof apiKey === "string" && apiKey.length >= 32;
  },

  /** Preserves existing persisted deployment identities for read-only acceptance tooling. */
  runtimeDeploymentGrantCode: function (environmentCode, serverCode) {
    return String(environmentCode || "")
      .replace(/[A-Z]/gu, (match) => "-" + match.toLowerCase())
      .replace(/^-/, "") + "-" + String(serverCode || "")
      .replace(/Server$/u, "")
      .replace(/[A-Z]/gu, (match) => "-" + match.toLowerCase()) +
      "-runtime-deployment";
  },

  /** Resolves the selected project root for the tenant provisioning topology check. */
  getProjectRoot: function () {
    return typeof NODICS !== "undefined" && typeof NODICS.getCustomHome === "function"
      ? NODICS.getCustomHome() : null;
  },

  /** Projects isolated deployment topology for provisioning; topology never supplies permissions or creates assignments. */
  readResolvedRuntimeDeployment: function (coordinates) {
    const path = require("path");
    const probe = require(path.join(NODICS.getNodicsHome(),
      "modules/nConfig/src/service/defaultDeploymentConfigurationProjectionService"));
    return probe.read({
      projectRoot: coordinates.projectRoot,
      environment: coordinates.environmentCode,
      server: coordinates.serverCode,
      frameworkRoot: path.dirname(NODICS.getNodicsHome()),
      inheritEnvironment: true,
      variables: {
        S: coordinates.serverCode, SERVER: coordinates.serverCode,
        E: coordinates.environmentCode, ENV: coordinates.environmentCode,
        NODICS_NODE: "", N: "", NODE: "",
      },
    });
  },

  /** Validates a complete fresh inventory through existing Profile owners, without comparing it with configured permissions. */
  validateRetainedRuntimeDeploymentGrants: async function (request) {
    const tenant = request.tenant || CONFIG.get("defaultTenant") || "default";
    const assignments = await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
      SERVICE.DefaultPrincipalScopeAssignmentService, tenant,
      { scopeType: "RUNTIME_DEPLOYMENT" },
    );
    for (const assignment of assignments) {
      if (assignment.tenantCode !== tenant || assignment.scopeType !== "RUNTIME_DEPLOYMENT") {
        throw new CLASSES.NodicsError("ERR_AUTH_00003", "Retained runtime grant has invalid tenant placement");
      }
      // Revocation is retained history, not a request to repair or reactivate it.
      if (assignment.active !== true || assignment.status !== "ACTIVE" || assignment.effect !== "ALLOW") continue;
      SERVICE.DefaultRuntimeAuthorizationService.validateAssignment(assignment);
    }
  },

  /** Startup is read-only after Init: Axis removals, scoped grants, credentials and lockouts survive in every environment. */
  reconcile: async function (request) {
    await this.validateRetainedRuntimeDeploymentGrants(request);
    return {
      status: "NO_CHANGES",
      createdGroups: [],
      reconciledServicePrincipals: [],
      reconciledRuntimeDeploymentGrants: [],
      reconciledAdministrators: [],
    };
  },
};
