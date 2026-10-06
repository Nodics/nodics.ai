/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultMandatoryIdentityBootstrapService
 * @description Reconciles missing identity-governance groups and configured service-principal metadata after init data is available. Local generated runtime credentials may be reconciled before the first local token request; non-local credential material remains operator-owned.
 * @layer service
 * @owner profile
 * @override Projects may replace this service or the configured mandatory-bootstrap service list while preserving idempotency, auditability, and fail-closed identity startup.
 */
const crypto = require("node:crypto");

module.exports = {
  /**
   * Applies required tenant Init releases and existing identity reconciliation before runtime authentication.
   * Provisioned credentials and deployment grants remain explicit operator-owned records outside generated local runtime startup.
   * @param {Object} request Tenant and selected module context.
   * @returns {Promise<Object>} Completed identity reconciliation.
   */
  prepareTenant: async function (request) {
    await SERVICE.DefaultDataReleaseService.installStartupReleases(
      this.systemRequest(request, {
        modules: request.modules,
        source: request.source,
      }),
    );
    return this.reconcile(request);
  },

  /** Returns the effective layered migration policy. */
  getPolicy: function () {
    return (
      (CONFIG.get("identityGovernance") &&
        CONFIG.get("identityGovernance").migration) ||
      {}
    );
  },

  /** Builds a trusted, tenant-scoped generated-service request. */
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

  /** Orders missing groups so configured parent groups are created before their children. */
  orderMissingGroups: function (targets, existingCodes) {
    const available = new Set(existingCodes);
    const pending = Object.keys(targets).filter((code) => !available.has(code));
    const ordered = [];
    while (pending.length > 0) {
      const readyIndex = pending.findIndex((code) =>
        []
          .concat(targets[code].parentGroups || [])
          .every((parent) => available.has(parent)),
      );
      if (readyIndex < 0) {
        throw new Error(
          "Mandatory identity groups contain unresolved or cyclic parents: " +
            pending.join(", "),
        );
      }
      const code = pending.splice(readyIndex, 1)[0];
      ordered.push(code);
      available.add(code);
    }
    return ordered;
  },

  /** Builds a bounded query for only the configured mandatory groups. */
  buildMandatoryGroupLookup: function (targets) {
    const codes = Object.keys(targets || {});
    return {
      query:
        codes.length > 0 ? { code: { $in: codes } } : { code: { $in: [] } },
      searchOptions: {
        pageSize: Math.max(codes.length, 1),
        pageNumber: 1,
      },
    };
  },

  /** Saves missing mandatory groups as per-code upserts so startup remains idempotent on partially seeded databases. */
  saveMissingGroups: function (request, models) {
    return models.reduce(
      (promise, model) =>
        promise.then((createdGroups) => {
          return SERVICE.DefaultUserGroupService.save(
            this.systemRequest(request, {
              query: { code: model.code },
              model: model,
            }),
          ).then((response) => {
            if (response && response.errors && response.errors.length > 0) {
              throw new CLASSES.NodicsError(
                "ERR_AUTH_00003",
                "Mandatory identity group could not be reconciled: " +
                  model.code,
              );
            }
            return createdGroups.concat(model.code);
          });
        }),
      Promise.resolve([]),
    );
  },

  /** Builds a bounded query for only configured service principals. */
  buildServicePrincipalLookup: function (policy) {
    const codes = [].concat(policy.servicePrincipalCodes || []);
    return {
      query:
        codes.length > 0 ? { code: { $in: codes } } : { code: { $in: [] } },
      searchOptions: {
        pageSize: Math.max(codes.length, 1),
        pageNumber: 1,
      },
    };
  },

  /** Builds a non-secret metadata update for an existing configured service principal. */
  buildServicePrincipalUpdate: function (principal, policy) {
    const serviceGroup = policy.serviceGroup;
    const configuredScopes = this.servicePrincipalCredentialScopes(
      policy,
      principal.code,
    );
    const codeOf = (item) =>
      item && typeof item === "object" ? item.code : item;
    const sameSet = (left, right) => {
      const leftSet = new Set(
        []
          .concat(left || [])
          .map(codeOf)
          .filter(Boolean),
      );
      const rightSet = new Set(
        []
          .concat(right || [])
          .map(codeOf)
          .filter(Boolean),
      );
      return (
        leftSet.size === rightSet.size &&
        Array.from(leftSet).every((item) => rightSet.has(item))
      );
    };
    const target = {
      principalType: "service",
      userGroups: serviceGroup
        ? [serviceGroup]
        : [].concat(principal.userGroups || []),
      apiKeyScopes: Array.from(
        new Set(
          []
            .concat(principal.apiKeyScopes || [], configuredScopes)
            .filter(Boolean),
        ),
      ),
      identityMigrationVersion: policy.version || 1,
    };
    if ((principal.apiKey || principal.apiKeyHash) && !principal.apiKeyStatus) {
      target.apiKeyStatus = "active";
    }
    const checks = {
      principalType: principal.principalType !== target.principalType,
      userGroups: !sameSet(principal.userGroups, target.userGroups),
      apiKeyScopes: !sameSet(principal.apiKeyScopes, target.apiKeyScopes),
      identityMigrationVersion:
        principal.identityMigrationVersion !== target.identityMigrationVersion,
      apiKeyStatus: Boolean(
        target.apiKeyStatus && principal.apiKeyStatus !== target.apiKeyStatus,
      ),
    };
    const changed = Object.keys(checks).some((key) => checks[key]);
    return changed ? target : null;
  },

  /** Resolves the selected native-local environment code, when available. */
  getSelectedEnvironmentCode: function () {
    if (
      typeof NODICS !== "undefined" &&
      NODICS &&
      typeof NODICS.getSelectedEnvironmentName === "function"
    ) {
      return NODICS.getSelectedEnvironmentName();
    }
    return process.env.ENV || process.env.E || "";
  },

  /** Local generated credentials are allowed to repair only native local startup records. */
  isLocalRuntimeCredentialBootstrapEnabled: function (tenant) {
    const environmentCode = this.getSelectedEnvironmentCode();
    if (!/Local$/u.test(String(environmentCode || ""))) return false;
    const credentials = CONFIG.get("defaultAuthDetail", tenant) || {};
    const apiKey = credentials.apiKey || process.env.NODICS_RUNTIME_API_KEY;
    return typeof apiKey === "string" && apiKey.length >= 32;
  },

  /** Builds a governed local-only API-key update for an existing service principal. */
  buildLocalRuntimeCredentialUpdate: function (principal, policy, tenant) {
    if (!this.isLocalRuntimeCredentialBootstrapEnabled(tenant)) return null;
    if (
      !principal ||
      ![].concat(policy.servicePrincipalCodes || []).includes(principal.code)
    )
      return null;
    if (
      !SERVICE.DefaultAPIKeyCredentialService ||
      typeof SERVICE.DefaultAPIKeyCredentialService.prepare !== "function" ||
      typeof SERVICE.DefaultAPIKeyCredentialService.digest !== "function"
    )
      return null;
    const credentials = CONFIG.get("defaultAuthDetail", tenant) || {};
    const apiKey = credentials.apiKey || process.env.NODICS_RUNTIME_API_KEY;
    if (typeof apiKey !== "string" || apiKey.length < 32) return null;
    const apiKeyHash = SERVICE.DefaultAPIKeyCredentialService.digest(apiKey);
    const configuredScopes = this.servicePrincipalCredentialScopes(
      policy,
      principal.code,
    );
    const scopes = Array.from(
      new Set(
        []
          .concat(principal.apiKeyScopes || [], configuredScopes)
          .filter(Boolean),
      ),
    );
    const currentScopes = Array.from(
      new Set([].concat(principal.apiKeyScopes || []).filter(Boolean)),
    );
    const scopesChanged =
      JSON.stringify(currentScopes.slice().sort()) !==
      JSON.stringify(scopes.slice().sort());
    if (
      principal.apiKeyHash === apiKeyHash &&
      !principal.apiKey &&
      !scopesChanged &&
      principal.apiKeyStatus === "active" &&
      principal.identityMigrationVersion === (policy.version || 1)
    )
      return null;
    const credential = SERVICE.DefaultAPIKeyCredentialService.prepare(apiKey);
    credential.apiKeyScopes = scopes;
    credential.apiKeyStatus = "active";
    credential.identityMigrationVersion = policy.version || 1;
    return credential;
  },

  /** Builds the local runtime deployment grant code used by project tooling. */
  localRuntimeGrantCode: function (environmentCode, serverCode) {
    return (
      String(environmentCode || "")
        .replace(/[A-Z]/gu, (match) => "-" + match.toLowerCase())
        .replace(/^-/, "") +
      "-" +
      String(serverCode || "")
        .replace(/Server$/u, "")
        .replace(/[A-Z]/gu, (match) => "-" + match.toLowerCase()) +
      "-runtime-deployment"
    );
  },

  /** Returns the effective local runtime grant permissions and matching service-principal API-key scopes. */
  runtimeGrantPermissions: function (policy) {
    return Array.from(
      new Set(
        []
          .concat(
            (policy.servicePrincipalScopes &&
              policy.servicePrincipalScopes.apiAdmin) ||
              [],
            policy.localRuntimeDeploymentGrantPermissions || [],
          )
          .filter(Boolean),
      ),
    );
  },

  /** Returns configured API-key scopes for one service principal. */
  servicePrincipalCredentialScopes: function (policy, principalCode) {
    // The shared Local proof must cover approved sibling grants, not only the
    // authority runtime's own permissions. Each issued token retains its grant.
    const deploymentPermissions = principalCode === "apiAdmin"
      ? this.discoverLocalRuntimeScopes(policy).flatMap(scope => scope.permissions)
      : [];
    return Array.from(
      new Set(
        []
          .concat(
            (policy.servicePrincipalScopes &&
              policy.servicePrincipalScopes[principalCode]) ||
              [],
            principalCode === "apiAdmin"
              ? policy.localRuntimeDeploymentGrantPermissions || []
              : [],
            deploymentPermissions,
          )
          .filter(Boolean),
      ),
    );
  },

  /** Returns the current runtime identity declaration for local bootstrap repair. */
  currentRuntimeScope: function (policy) {
    if (typeof NODICS === "undefined" || !NODICS) return null;
    const projectCode =
      typeof NODICS.getEnvironmentName === "function"
        ? NODICS.getEnvironmentName()
        : undefined;
    const environmentCode = this.getSelectedEnvironmentCode();
    const serverCode =
      typeof NODICS.getServerName === "function"
        ? NODICS.getServerName()
        : undefined;
    const identity = CONFIG.get("runtimeIdentity") || {};
    const activeModules =
      typeof NODICS.getActiveModules === "function"
        ? NODICS.getActiveModules()
        : [];
    const modules = Array.from(
      new Set(
        []
          .concat(activeModules || [], identity.remoteModules || [])
          .filter(Boolean),
      ),
    );
    const permissions = this.runtimeGrantPermissions(policy);
    if (
      !projectCode ||
      !environmentCode ||
      !serverCode ||
      !identity.instanceCode ||
      modules.length === 0 ||
      permissions.length === 0
    )
      return null;
    return {
      projectCode,
      environmentCode,
      serverCode,
      instanceCode: identity.instanceCode,
      modules,
      permissions,
    };
  },

  /** Resolves the selected project root when a runtime was started from a customer project. */
  getProjectRoot: function () {
    if (
      typeof NODICS !== "undefined" &&
      NODICS &&
      typeof NODICS.getCustomHome === "function"
    )
      return NODICS.getCustomHome();
    return null;
  },

  /** Loads nConfig's deployment projection service from the active framework home. */
  getDeploymentConfigurationService: function () {
    if (
      typeof NODICS === "undefined" ||
      !NODICS ||
      typeof NODICS.getNodicsHome !== "function"
    )
      return null;
    try {
      const path = require("path");
      return require(
        path.join(
          NODICS.getNodicsHome(),
          "modules/nConfig/src/service/DefaultFrameworkInitializerService",
        ),
      );
    } catch (error) {
      return null;
    }
  },

  /** Resolves one approved server through the canonical loader in an isolated process, never the authority runtime's caller headers or discovered inactive inventory. @param {Object} coordinates Selected project/environment/server. @returns {Object} Effective properties and indexed active module graph. */
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

  /** Discovers sibling Local scopes through each server's resolved modules and migration policy; the caller policy never supplies sibling authority. */
  discoverLocalRuntimeScopes: function (policy) {
    if (!this.isLocalRuntimeCredentialBootstrapEnabled()) return [];
    const fs = require("fs");
    const path = require("path");
    const projectRoot = this.getProjectRoot();
    const environmentCode = this.getSelectedEnvironmentCode();
    const configuration = this.getDeploymentConfigurationService();
    if (
      !projectRoot ||
      !environmentCode ||
      !configuration ||
      typeof configuration.readDeploymentConfiguration !== "function"
    )
      return [];
    const environmentRoot = path.join(projectRoot, "envs", environmentCode);
    if (!fs.existsSync(environmentRoot)) return [];
    const projectCode =
      typeof NODICS.getEnvironmentName === "function"
        ? NODICS.getEnvironmentName()
        : undefined;
    if (!projectCode) return [];
    return fs
      .readdirSync(environmentRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const packageFile = path.join(
          environmentRoot,
          entry.name,
          "package.json",
        );
        if (!fs.existsSync(packageFile)) return [];
        let metadata;
        try {
          metadata = JSON.parse(fs.readFileSync(packageFile, "utf8"));
        } catch (error) {
          return [];
        }
        if (
          metadata.nodics &&
          (metadata.nodics.kind !== "server" ||
            metadata.nodics.retired === true)
        )
          return [];
        let runtime;
        let resolvedModules;
        try {
          const resolved = this.readResolvedRuntimeDeployment({
            projectRoot,
            environmentCode,
            serverCode: entry.name,
          });
          runtime = resolved.properties;
          resolvedModules = resolved.modules;
        } catch (error) {
          throw new CLASSES.NodicsError("ERR_AUTH_00003", "Approved runtime module composition cannot be resolved");
        }
        const identity =
          runtime.runtimeIdentity ||
          (metadata.nodics && metadata.nodics.runtimeIdentity) ||
          {};
        if (!identity.instanceCode) return [];
        const permissions = this.runtimeGrantPermissions(
          runtime.identityGovernance?.migration || {},
        );
        if (permissions.length === 0)
          throw new CLASSES.NodicsError(
            "ERR_AUTH_00003",
            "Approved runtime permission policy is unavailable",
          );
        if (!Array.isArray(resolvedModules) || resolvedModules.length === 0 ||
          !Array.isArray(identity.remoteModules || []) ||
          [...resolvedModules, ...(identity.remoteModules || [])].some(moduleName =>
            typeof moduleName !== "string" || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(moduleName))) {
          throw new CLASSES.NodicsError("ERR_AUTH_00003", "Approved runtime module composition is invalid");
        }
        const modules = Array.from(
          new Set(
            []
              .concat(
                resolvedModules,
                identity.remoteModules || [],
              )
              .filter(
                (moduleName) =>
                  typeof moduleName === "string" &&
                  /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(moduleName),
              ),
          ),
        );
        if (modules.length === 0 || modules.length > 512)
          throw new CLASSES.NodicsError("ERR_AUTH_00003", "Approved runtime module composition exceeds its bound");
        return [
          {
            projectCode,
            environmentCode,
            serverCode: entry.name,
            instanceCode: identity.instanceCode,
            modules,
            permissions,
          },
        ];
      });
  },

  /** Creates or updates one runtime deployment assignment from an already validated scope. */
  reconcileRuntimeDeploymentGrantScope: async function (request, scope) {
    const tenantCode =
      request.tenant || CONFIG.get("defaultTenant") || "default";
    const subjectProvisioning = tenantCode !== (CONFIG.get("defaultTenant") || "default") &&
      CONFIG.get("profileTenantProvisioning")?.enabled === true;
    const enterpriseCode = subjectProvisioning
      ? await SERVICE.DefaultEnterpriseTenantProvisioningService.authorizeLocalRuntimeBootstrapScope(tenantCode, scope)
      : CONFIG.get("defaultEnterprise") || "default";
    const baseCode = this.localRuntimeGrantCode(
      scope.environmentCode,
      scope.serverCode,
    );
    // Preserve any legacy wrong-enterprise assignment rather than rewriting its authority.
    const code = subjectProvisioning ? baseCode + "-enterprise-" +
      crypto.createHash("sha256").update(enterpriseCode).digest("hex").slice(0, 16) : baseCode;
    const model = {
      code,
      active: true,
      principalType: "service",
      principalCode: "apiAdmin",
      scopeType: "RUNTIME_DEPLOYMENT",
      scopeCode: code,
      tenantCode,
      enterpriseCode,
      effect: "ALLOW",
      inheritanceMode: "DIRECT",
      status: "ACTIVE",
      runtimeScope: scope,
      reasonCode: "LOCAL_RUNTIME_BOOTSTRAP",
    };
    const lookup = this.systemRequest(request, {
      query: { code },
      options: { recursive: false, skipItemCache: true, limit: 2 },
    });
    return SERVICE.DefaultPrincipalScopeAssignmentService.get(lookup).then(
      (response) => {
        if (!/^SUC_/.test(response?.code || "") || response.success === false ||
          (response.errors && response.errors.length) || !Array.isArray(response.result) || response.result.length > 1)
          throw new CLASSES.NodicsError("ERR_AUTH_00003", "Retained runtime grant inventory is unavailable or ambiguous");
        const current = response && response.result && response.result[0];
        if (current && (current.active !== true || current.status !== "ACTIVE" ||
          current.effect !== "ALLOW" || current.principalType !== "service" ||
          current.principalCode !== model.principalCode || current.scopeType !== "RUNTIME_DEPLOYMENT" ||
          current.tenantCode !== tenantCode || current.enterpriseCode !== enterpriseCode ||
          current.scopeCode !== code || current.inheritanceMode !== "DIRECT" ||
          current.reasonCode !== "LOCAL_RUNTIME_BOOTSTRAP" ||
          ["projectCode", "environmentCode", "serverCode", "instanceCode"].some(key => current.runtimeScope?.[key] !== scope[key]))) {
          throw new CLASSES.NodicsError("ERR_AUTH_00003", "Retained runtime grant requires explicit owner policy review");
        }
        if (
          current &&
          JSON.stringify(current.runtimeScope || {}) ===
            JSON.stringify(scope) &&
          current.status === model.status &&
          current.effect === model.effect &&
          current.principalCode === model.principalCode
        ) {
          return null;
        }
        const serviceRequest = this.systemRequest(
          request,
          current
            ? {
                query: { code, active: true, status: "ACTIVE", effect: "ALLOW",
                  principalType: "service", principalCode: model.principalCode,
                  scopeType: "RUNTIME_DEPLOYMENT", tenantCode, enterpriseCode,
                  scopeCode: code, inheritanceMode: "DIRECT",
                  reasonCode: "LOCAL_RUNTIME_BOOTSTRAP", runtimeScope: current.runtimeScope },
                model: {
                  principalType: model.principalType,
                  principalCode: model.principalCode,
                  scopeType: model.scopeType,
                  scopeCode: model.scopeCode,
                  tenantCode: model.tenantCode,
                  enterpriseCode: model.enterpriseCode,
                  effect: model.effect,
                  inheritanceMode: model.inheritanceMode,
                  status: model.status,
                  runtimeScope: model.runtimeScope,
                  reasonCode: model.reasonCode,
                },
              }
            : { query: { code }, model },
        );
        const operation = current
          ? SERVICE.DefaultPrincipalScopeAssignmentService.update
          : SERVICE.DefaultPrincipalScopeAssignmentService.save;
        return operation
          .call(SERVICE.DefaultPrincipalScopeAssignmentService, serviceRequest)
          .then((response) => {
            if (current && (!/^SUC_/.test(response?.code || "") ||
              response.result?.acknowledged !== true || response.result.matchedCount !== 1))
              throw new CLASSES.NodicsError("ERR_AUTH_00003", "Retained runtime grant reconciliation was not acknowledged");
            return code;
          });
      },
    );
  },

  /** Reconciles the current local runtime grant before first internal-token issuance. */
  reconcileLocalRuntimeDeploymentGrant: function (request, policy) {
    if (
      !this.isLocalRuntimeCredentialBootstrapEnabled() ||
      !SERVICE.DefaultPrincipalScopeAssignmentService
    )
      return Promise.resolve([]);
    const scopes = this.discoverLocalRuntimeScopes(policy);
    const current = this.currentRuntimeScope(policy);
    if (
      current &&
      !scopes.some(
        (scope) =>
          scope.serverCode === current.serverCode &&
          scope.instanceCode === current.instanceCode,
      )
    )
      scopes.push(current);
    if (scopes.length === 0) return Promise.resolve([]);
    return scopes.reduce(
      (promise, scope) =>
        promise.then((reconciled) =>
          this.reconcileRuntimeDeploymentGrantScope(request, scope).then(
            (code) => {
              return code ? reconciled.concat(code) : reconciled;
            },
          ),
        ),
      Promise.resolve([]),
    );
  },

  /** Resolves the local bootstrap administrator password when safe to repair local startup. */
  getLocalBootstrapAdminPassword: function () {
    if (!this.isLocalRuntimeCredentialBootstrapEnabled()) return null;
    const bootstrap = CONFIG.get("bootstrapIdentity") || {};
    return typeof bootstrap.adminPassword === "string" &&
      bootstrap.adminPassword.length > 0
      ? bootstrap.adminPassword
      : null;
  },

  /** Reconciles only fresh, exactly owned local administrator credentials; legacy and managed modes never trust cached hashes or relink by a natural-code fallback. @param {Object} request Original tenant context. @param {Object} policy Configured administrator codes. @returns {Promise<string[]>} Exactly acknowledged original credential repairs. */
  reconcileLocalAdministratorCredential: async function (request, policy) {
    const password = this.getLocalBootstrapAdminPassword();
    if (!password) return [];
    const administrators = []
      .concat(policy.administratorCodes || [])
      .filter(Boolean);
    if (administrators.length === 0) return [];
    const writer = SERVICE.DefaultPasswordSaveInterceptorService;
    const inventory = SERVICE.DefaultPrincipalSecurityStampGovernanceService;
    if (
      !SERVICE.DefaultPasswordService?.update ||
      !SERVICE.DefaultEmployeeService?.get ||
      typeof inventory?.inventory !== "function" ||
      typeof writer?.readPrincipalCredential !== "function" ||
      typeof writer?.mutationQuery !== "function" ||
      typeof UTILS.compareHash !== "function"
    )
      throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
    const tenant = request.tenant || CONFIG.get("defaultTenant") || "default";
    const employees = await inventory.inventory(
      SERVICE.DefaultEmployeeService,
      tenant,
      { code: { $in: administrators } },
    );
    const reconciled = [];
    for (const employee of employees) {
      if (
        employee.active !== true ||
        employee.principalType !== "human" ||
        !administrators.includes(employee.code)
      )
        throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
      const original = await writer.readPrincipalCredential(
        tenant,
        employee,
        "Employee",
      );
      const managedQuery = writer.mutationQuery(tenant, original);
      if (
        original.active !== true ||
        Object.hasOwn(original, "identityLinkRetirement")
      )
        throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
      if (await UTILS.compareHash(password, original.password)) continue;
      const query = managedQuery || {
        _id: original._id,
        loginId: original.loginId,
        active: true,
        password: original.password,
        identityLinkRetirement: { $exists: false },
      };
      const receipt = await SERVICE.DefaultPasswordService.update(
        this.systemRequest(request, {
          query,
          model: {
            ...(original.code === undefined ? {} : { code: original.code }),
            loginId: original.loginId,
            password,
          },
          options: { recursive: false, skipItemCache: true, upsert: false },
        }),
      );
      if (
        !receipt ||
        !/^SUC_/.test(receipt.code || "") ||
        receipt.error ||
        receipt.success === false ||
        (receipt.errors &&
          (!Array.isArray(receipt.errors) || receipt.errors.length)) ||
        receipt.result?.acknowledged === false ||
        receipt.result?.matchedCount !== 1
      )
        throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
      const current = await writer.readPrincipalCredential(
        tenant,
        employee,
        "Employee",
      );
      if (
        String(current._id) !== String(original._id) ||
        current.loginId !== original.loginId ||
        current.code !== original.code ||
        current.active !== true ||
        (managedQuery && current.revision !== original.revision + 1) ||
        !(await UTILS.compareHash(password, current.password))
      )
        throw new CLASSES.NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP");
      reconciled.push(employee.code);
    }
    return reconciled;
  },

  /** Clears stale local administrator failed-login state after repairing local bootstrap credentials. */
  reconcileLocalAdministratorState: function (request, administrators) {
    if (
      !this.isLocalRuntimeCredentialBootstrapEnabled() ||
      !SERVICE.DefaultUserStateService ||
      typeof SERVICE.DefaultUserStateService.findUserState !== "function" ||
      typeof SERVICE.DefaultUserStateService.save !== "function"
    )
      return Promise.resolve([]);
    const tenant = request.tenant || CONFIG.get("defaultTenant") || "default";
    return [].concat(administrators || []).reduce(
      (promise, employee) =>
        promise.then((reconciled) => {
          if (!employee || !employee.loginId) return reconciled;
          return SERVICE.DefaultUserStateService.findUserState({
            tenant,
            loginId: employee.loginId,
            _id: employee._id,
          }).then((state) => {
            const stale =
              state &&
              (state.locked || state.attempts > 0 || state.active === false);
            if (!stale) return reconciled;
            return SERVICE.DefaultUserStateService.save(
              this.systemRequest(request, {
                model: Object.assign({}, state, {
                  loginId: employee.loginId,
                  personId: employee._id || state.personId,
                  attempts: 0,
                  locked: false,
                  lockedTime: null,
                  active: true,
                }),
              }),
            ).then(() => reconciled.concat(employee.code || employee.loginId));
          });
        }),
      Promise.resolve([]),
    );
  },

  /** Looks up configured local administrators and clears stale failed-login state. */
  reconcileConfiguredLocalAdministratorState: function (request, policy) {
    if (
      !this.isLocalRuntimeCredentialBootstrapEnabled() ||
      !SERVICE.DefaultEmployeeService
    )
      return Promise.resolve([]);
    const administrators = []
      .concat(policy.administratorCodes || [])
      .filter(Boolean);
    if (administrators.length === 0) return Promise.resolve([]);
    return SERVICE.DefaultEmployeeService.get(
      this.systemRequest(request, {
        query: { code: { $in: administrators } },
        searchOptions: { pageSize: administrators.length, pageNumber: 1 },
      }),
    ).then((response) =>
      this.reconcileLocalAdministratorState(request, response.result || []),
    );
  },

  /** Reconciles existing configured service principals without exposing credential material. */
  reconcileServicePrincipals: function (request, policy) {
    const lookup = this.buildServicePrincipalLookup(policy);
    const configuredCodes = new Set(
      [].concat(policy.servicePrincipalCodes || []),
    );
    if (configuredCodes.size === 0) return Promise.resolve([]);
    return SERVICE.DefaultEmployeeService.get(
      this.systemRequest(request, lookup),
    ).then((response) => {
      const principals = (response.result || []).filter((principal) =>
        configuredCodes.has(principal.code),
      );
      return principals.reduce(
        (promise, principal) =>
          promise.then((reconciled) => {
            const target = this.buildServicePrincipalUpdate(principal, policy);
            const credential = this.buildLocalRuntimeCredentialUpdate(
              principal,
              policy,
              request.tenant,
            );
            if (!target && !credential) return reconciled;
            const model = credential
              ? {
                  $set: Object.assign({}, target || {}, credential),
                  $unset: { apiKey: 1 },
                }
              : target;
            return SERVICE.DefaultEmployeeService.update(
              this.systemRequest(request, {
                query: { code: principal.code },
                model: model,
              }),
            ).then(() => reconciled.concat(principal.code));
          }),
        Promise.resolve([]),
      );
    });
  },

  /**
   * Creates only missing configured groups, reconciles configured service principals, and records the resulting startup change.
   *
   * @param {Object} request Bootstrap tenant and trace context.
   * @returns {Promise<Object>} Idempotent reconciliation summary.
   */
  reconcile: function (request) {
    const policy = this.getPolicy();
    if (policy.reconcileMissingGroupsOnStartup === false) {
      return Promise.resolve({ status: "DISABLED", createdGroups: [] });
    }
    const targets = policy.groupTargets || {};
    const lookup = this.buildMandatoryGroupLookup(targets);
    return SERVICE.DefaultUserGroupService.get(
      this.systemRequest(request, lookup),
    ).then((response) => {
      const existingCodes = new Set(
        (response.result || []).map((group) => group.code),
      );
      const creationOrder = this.orderMissingGroups(targets, existingCodes);
      const models = creationOrder.map((code) =>
        Object.assign({ code: code, name: code, active: true }, targets[code]),
      );
      const save =
        models.length > 0
          ? this.saveMissingGroups(request, models)
          : Promise.resolve([]);
      return save.then((createdGroups) => {
        return this.reconcileServicePrincipals(request, policy).then(
          (reconciledServicePrincipals) => {
            return this.reconcileLocalRuntimeDeploymentGrant(
              request,
              policy,
            ).then((reconciledRuntimeDeploymentGrants) =>
              this.reconcileLocalAdministratorCredential(request, policy).then(
                (reconciledAdministratorCredentials) => {
                  return this.reconcileConfiguredLocalAdministratorState(
                    request,
                    policy,
                  ).then((reconciledAdministratorStates) => {
                    const reconciledAdministrators = Array.from(
                      new Set(
                        [].concat(
                          reconciledAdministratorCredentials || [],
                          reconciledAdministratorStates || [],
                        ),
                      ),
                    );
                    return this.recordAudit(
                      request,
                      createdGroups,
                      reconciledServicePrincipals,
                      reconciledRuntimeDeploymentGrants,
                      reconciledAdministrators,
                    ).then(() => ({
                      status:
                        createdGroups.length > 0 ||
                        reconciledServicePrincipals.length > 0 ||
                        reconciledRuntimeDeploymentGrants.length > 0 ||
                        reconciledAdministrators.length > 0
                          ? "RECONCILED"
                          : "NO_CHANGES",
                      createdGroups: createdGroups,
                      reconciledServicePrincipals: reconciledServicePrincipals,
                      reconciledRuntimeDeploymentGrants:
                        reconciledRuntimeDeploymentGrants,
                      reconciledAdministrators: reconciledAdministrators,
                    }));
                  });
                },
              ),
            );
          },
        );
      });
    });
  },

  /** Persists a sanitized audit entry when startup creates mandatory groups or reconciles service-principal metadata. */
  recordAudit: function (
    request,
    createdGroups,
    reconciledServicePrincipals,
    reconciledRuntimeDeploymentGrants,
    reconciledAdministrators,
  ) {
    reconciledRuntimeDeploymentGrants = reconciledRuntimeDeploymentGrants || [];
    reconciledAdministrators = reconciledAdministrators || [];
    if (
      createdGroups.length === 0 &&
      reconciledServicePrincipals.length === 0 &&
      reconciledRuntimeDeploymentGrants.length === 0 &&
      reconciledAdministrators.length === 0
    )
      return Promise.resolve(true);
    return SERVICE.DefaultIdentityMigrationAuditService.save(
      this.systemRequest(request, {
        model: {
          code:
            "mandatoryIdentityBootstrap_" +
            (request.tenant || "default") +
            "_" +
            Date.now(),
          active: true,
          migrationVersion: this.getPolicy().version || 1,
          status: "BOOTSTRAP_RECONCILED",
          tenant: request.tenant || CONFIG.get("defaultTenant") || "default",
          requestedBy: "nodics-startup",
          result: {
            createdGroups: createdGroups,
            reconciledServicePrincipals: reconciledServicePrincipals,
            reconciledRuntimeDeploymentGrants:
              reconciledRuntimeDeploymentGrants,
            reconciledAdministrators: reconciledAdministrators,
          },
          correlationId: request.correlationId,
        },
      }),
    );
  },
};
