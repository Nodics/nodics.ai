/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultBackofficeRegistryService
 * @description Owns ephemeral observed module-instance leases for BackOffice discovery without becoming topology or activation authority.
 * @layer service
 * @owner backoffice
 * @override Later modules may replace storage or reconciliation while preserving lease, security, and client-safe projection contracts.
 */
module.exports = {
  _sweepTimer: null,
  _metrics: {
    registrations: 0,
    renewals: 0,
    deregistrations: 0,
    expirations: 0,
    rejected: 0,
  },
  _navigationCompositionState: {},

  /** Starts lease expiry and registers shutdown cleanup with the central lifecycle. */
  init: function () {
    this.startSweeper();
    if (SERVICE.DefaultRuntimeLifecycleService) {
      SERVICE.DefaultRuntimeLifecycleService.registerContributor(
        "backofficeRegistry",
        {
          order: 800,
          shutdown: () => this.stopSweeper(),
        },
      );
    }
    if (SERVICE.DefaultHealthService) {
      SERVICE.DefaultHealthService.registerReadinessContributor(
        "backofficeRegistryStore",
        {
          required: true,
          order: 390,
          description: "Configured BackOffice registry store is available",
          check: () => this.getStore().diagnostics().available,
        },
      );
    }
    return Promise.resolve(true);
  },

  /** Completes the standard service post-initialization contract. */
  postInit: function () {
    return Promise.resolve(true);
  },

  /** Returns effective registry lease and projection policy. */
  getConfiguration: function () {
    return CONFIG.get("backofficeRegistry") || {};
  },

  /** Returns normalized router path parameters for direct and HTTP-wrapped service requests. */
  getRequestParams: function (request) {
    return (
      (request &&
        (request.params ||
          (request.httpRequest && request.httpRequest.params))) ||
      {}
    );
  },

  /** Returns the configured lease-store implementation without creating a second authority path. */
  getStore: function () {
    let store = this._store || SERVICE.DefaultBackofficeRegistryStoreService;
    if (!store)
      throw new Error("BackOffice registry store service is not initialized");
    return store;
  },

  /** Records one sanitized registry audit event under configured fail-open or fail-closed policy. */
  audit: function (event) {
    let service = SERVICE.DefaultBackofficeAuditService;
    if (!service || typeof service.record !== "function")
      return Promise.resolve(false);
    return service.record(event).catch((error) => {
      if ((this.getConfiguration().audit || {}).failClosed === true)
        throw error;
      if (this.LOG && this.LOG.error)
        this.LOG.error("BackOffice audit publication failed", error);
      return false;
    });
  },

  /** Returns a bounded scoped key for governed Axis navigation composition lifecycle state. */
  getNavigationCompositionScopeKey: function (request, authData) {
    let scope = {
      tenantCode: request && request.tenant ? String(request.tenant) : "default",
      projectCode: request && request._projectCode ? String(request._projectCode) : "default",
      enterpriseCode: authData && (authData.enterpriseCode || authData.entCode)
        ? String(authData.enterpriseCode || authData.entCode)
        : "default",
    };
    return scope.tenantCode + ":" + scope.projectCode + ":" + scope.enterpriseCode;
  },

  /** Performs a JSON-safe clone for bounded navigation lifecycle state. */
  cloneNavigationComposition: function (value) {
    return JSON.parse(JSON.stringify(value || {}));
  },

  /** Builds the stable checksum used by effective, draft, publish, and rollback navigation lifecycle operations. */
  computeNavigationCompositionChecksum: function (composition, request, authData) {
    let crypto = require("crypto");
    let canonical = JSON.stringify({
      scopeKey: this.getNavigationCompositionScopeKey(request, authData),
      groups: (composition.groups || [])
        .map((group) => ({
          id: group.id,
          label: group.label,
          labelKey: group.labelKey,
          order: group.order,
        }))
        .sort((left, right) => String(left.id).localeCompare(String(right.id))),
      navigation: (composition.navigation || [])
        .map((item) => ({
          moduleName: item.moduleName,
          id: item.id,
          label: item.label,
          labelKey: item.labelKey,
          route: item.route,
          parentId: item.parentId,
          parentModuleName: item.parentModuleName,
          order: item.order,
          group: item.group && item.group.id,
          featureState: item.featureState,
        }))
        .sort((left, right) => String(left.moduleName).localeCompare(String(right.moduleName)) || String(left.id).localeCompare(String(right.id))),
    });
    return crypto.createHash("sha256").update(canonical).digest("hex");
  },

  /** Returns or initializes scoped navigation composition lifecycle state. */
  getNavigationCompositionState: function (request) {
    let authData = request && request.authData;
    let scopeKey = this.getNavigationCompositionScopeKey(request, authData);
    this._navigationCompositionState[scopeKey] = this._navigationCompositionState[scopeKey] || {
      scopeKey: scopeKey,
      version: 0,
      draft: undefined,
      published: undefined,
      history: [],
      updatedAt: new Date().toISOString(),
    };
    return this._navigationCompositionState[scopeKey];
  },

  /** Validates required identity fields and an approved endpoint scheme. */
  validateRegistration: function (registration) {
    if (
      !SERVICE.DefaultBackofficeContractService.validateRegistration(
        registration,
      )
    )
      return false;
    if (registration.clientCallable !== true) return !registration.endpoint;
    if (!registration.endpoint) return false;
    try {
      let endpoint = new URL(registration.endpoint);
      return (
        (this.getConfiguration().allowedSchemes || ["http", "https"]).includes(
          endpoint.protocol.replace(":", ""),
        ) &&
        !endpoint.username &&
        !endpoint.password &&
        !endpoint.search &&
        !endpoint.hash
      );
    } catch (error) {
      return false;
    }
  },

  /** Creates or renews an idempotent observed module-instance lease. */
  register: async function (request) {
    let registration = request.body || request;
    if (
      !request._identityValidated &&
      !this.validateServiceIdentity(request, registration)
    ) {
      this._metrics.rejected++;
      await this.audit({
        eventType: "backoffice.registry.registration",
        outcome: "rejected",
        reasonCode: "IDENTITY_MISMATCH",
        instanceId: registration.instanceId,
        tokenType: request.authData && request.authData.tokenType,
      });
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Module registration identity mismatch",
      );
    }
    if (Array.isArray(registration.registrations))
      return this.registerBatch(registration, request.authData);
    if (!this.validateRegistration(registration)) {
      this._metrics.rejected++;
      await this.audit({
        eventType: "backoffice.registry.registration",
        outcome: "rejected",
        reasonCode: "CONTRACT_INVALID",
        moduleName: registration && registration.moduleName,
        instanceId: registration && registration.instanceId,
      });
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Invalid module registration",
      );
    }
    let key = registration.moduleName + ":" + registration.instanceId;
    let store = this.getStore();
    let existing = await store.get(key);
    let now = Date.now();
    let leaseTtlMs = Math.max(
      1000,
      Number(
        registration.leaseTtlMs || this.getConfiguration().leaseTtlMs || 30000,
      ),
    );
    let observed = {
      moduleName: String(registration.moduleName),
      displayName: String(registration.displayName),
      parentModule: registration.parentModule
        ? String(registration.parentModule)
        : undefined,
      canonicalIdentity: String(registration.canonicalIdentity),
      instanceId: String(registration.instanceId),
      environment:
        request._runtimeCoordinates && request._runtimeCoordinates.environment,
      server: request._runtimeCoordinates && request._runtimeCoordinates.server,
      node: request._runtimeCoordinates && request._runtimeCoordinates.node,
      runtimeRole: request._runtimeCoordinates && request._runtimeCoordinates.runtimeRole,
      projectCode: request._projectCode ? String(request._projectCode) : undefined,
      functionalModuleIdentity: request._functionalModuleIdentity ? String(request._functionalModuleIdentity) : undefined,
      version: String(registration.version || "unknown"),
      moduleKind: String(registration.moduleKind || "unknown"),
      capabilities: Array.isArray(registration.capabilities)
        ? registration.capabilities.map(String)
        : [],
      authorityClaims: Array.isArray(registration.authorityClaims)
        ? registration.authorityClaims.map((claim) => this.normalizeAuthorityClaim(claim))
        : [],
      clientCallable: registration.clientCallable === true,
      backoffice: registration.backoffice
        ? JSON.parse(JSON.stringify(registration.backoffice))
        : undefined,
      endpoint: registration.endpoint
        ? String(registration.endpoint)
        : undefined,
      healthPath: String(
        registration.healthPath || "/nodics/system/v0/health/ready",
      ),
      state: "UP",
      registeredAt: existing
        ? existing.registeredAt
        : new Date(now).toISOString(),
      lastSeenAt: new Date(now).toISOString(),
      expiresAt: now + leaseTtlMs,
    };
    await this.assertAuthorityClaimsAvailable(observed, key);
    await store.set(key, observed, leaseTtlMs);
    if (SERVICE.DefaultBackofficeDiscoveryService)
      SERVICE.DefaultBackofficeDiscoveryService.scheduleDiscovery(
        observed,
        request.authData,
      );
    if (SERVICE.DefaultBackofficeAvailabilityService)
      SERVICE.DefaultBackofficeAvailabilityService.scheduleObservation(
        observed,
      );
    await this.refreshRuntimeRegistrySnapshot();
    existing ? this._metrics.renewals++ : this._metrics.registrations++;
    if (request._batchOutcomes)
      request._batchOutcomes.push(existing ? "renewed" : "registered");
    if (!request._batchRegistration)
      await this.audit({
        eventType: "backoffice.registry.registration",
        outcome: existing ? "renewed" : "registered",
        moduleName: observed.moduleName,
        instanceId: observed.instanceId,
        moduleCount: 1,
      });
    return { code: "SUC_BOF_00000", data: this.projectClientSafe(observed) };
  },

  /** Registers one bounded runtime-instance batch while preserving per-module leases. */
  registerBatch: function (batch, authData) {
    let registrations = batch.registrations || [];
    let limit = Number(
      this.getConfiguration().maxModulesPerRegistration || 512,
    );
    if (
      !SERVICE.DefaultBackofficeContractService.validateRegistrationBatch(
        batch,
        limit,
      )
    ) {
      this._metrics.rejected++;
      let invalidModules = registrations
        .filter(
          (registration) =>
            !SERVICE.DefaultBackofficeContractService.validateRegistration(
              registration,
            ),
        )
        .map((registration) => registration && registration.moduleName)
        .filter(Boolean)
        .slice(0, 20);
      return Promise.reject(
        new CLASSES.NodicsError(
          "ERR_BOF_00000",
          "Invalid module registration batch" +
            (invalidModules.length
              ? ": " + invalidModules.join(", ")
              : ""),
        ),
      );
    }
    let outcomes = [];
    if (!SERVICE.DefaultFunctionalModuleCatalogueService) {
      return Promise.reject(new Error("Functional-module catalogue service is unavailable"));
    }
    let functionalModuleIndex = SERVICE.DefaultFunctionalModuleCatalogueService
      .buildLeaseFunctionalModuleIndex(batch);
    return Promise.all(
      registrations.map((item) =>
        this.register({
          body: item,
          _identityValidated: true,
          _batchRegistration: true,
          _batchOutcomes: outcomes,
          _projectCode: batch.project,
          _functionalModuleIdentity: functionalModuleIndex[item.moduleName],
          authData: authData,
          _runtimeCoordinates: {
            environment: batch.environment,
            server: batch.server,
            node: batch.node,
            runtimeRole: batch.runtimeRole
              ? {
                  code: String(batch.runtimeRole.code),
                  publication: String(batch.runtimeRole.publication),
                }
              : undefined,
          },
        }),
      ),
    ).then(async (results) => {
      let functionalModules = await SERVICE.DefaultFunctionalModuleCatalogueService.reconcileRuntimeBatch(batch, authData);
      let activeEntries = await this.getStore().values();
      await SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases(
        activeEntries.map(entry => entry.value), [batch.project], { authData: authData });
      await this.refreshRuntimeRegistrySnapshot(activeEntries.map(entry => entry.value));
      return this.audit({
        eventType: "backoffice.registry.registration",
        outcome: outcomes.every((outcome) => outcome === "renewed")
          ? "renewed"
          : outcomes.every((outcome) => outcome === "registered")
            ? "registered"
            : "reconciled",
        instanceId: batch.instanceId,
        moduleCount: results.length,
      }).then(() => ({
        code: "SUC_BOF_00000",
        data: {
          instanceId: batch.instanceId,
          registeredModules: results.length,
          reconciledFunctionalModules: functionalModules.length,
        },
      }));
    });
  },

  /** Normalizes one schema/service authority claim and derives its stable authority key. */
  normalizeAuthorityClaim: function (claim) {
    let normalized = {
      kind: String(claim.kind),
      moduleName: String(claim.moduleName),
      claimName: String(claim.claimName),
      authorityContext: String(claim.authorityContext)
    };
    normalized.authorityKey = normalized.kind + ":" + normalized.moduleName + ":" +
      normalized.claimName + "@" + normalized.authorityContext;
    return normalized;
  },

  /** Returns the logical runtime authority key for duplicate-owner validation. */
  getLogicalRuntimeAuthorityKey: function (instance) {
    let role = instance.runtimeRole || {};
    return [
      instance.projectCode || "",
      instance.environment || "",
      instance.server || "",
      typeof role === "string" ? role : [role.code || "", role.publication || ""].join("/")
    ].join(":");
  },

  /** Rejects duplicate authority claims from unrelated logical runtimes. */
  assertAuthorityClaimsAvailable: async function (candidate, candidateStoreKey) {
    let claims = candidate.authorityClaims || [];
    if (claims.length === 0) return true;
    let candidateAuthority = this.getLogicalRuntimeAuthorityKey(candidate);
    let entries = await this.getStore().values();
    for (let entry of entries) {
      if (entry.key === candidateStoreKey) continue;
      let existing = entry.value;
      if (existing.expiresAt && existing.expiresAt <= Date.now()) continue;
      let existingAuthority = this.getLogicalRuntimeAuthorityKey(existing);
      if (existingAuthority === candidateAuthority) continue;
      let existingClaims = existing.authorityClaims || [];
      let duplicate = claims.find((claim) =>
        existingClaims.some((existingClaim) => existingClaim.authorityKey === claim.authorityKey));
      if (duplicate) {
        this._metrics.rejected++;
        await this.audit({
          eventType: "backoffice.registry.registration",
          outcome: "rejected",
          reasonCode: "DUPLICATE_AUTHORITY_CLAIM",
          moduleName: candidate.moduleName,
          instanceId: candidate.instanceId,
          authorityKey: duplicate.authorityKey,
        });
        throw new CLASSES.NodicsError(
          "ERR_BOF_00000",
          "Duplicate runtime authority claim: " + duplicate.authorityKey,
        );
      }
    }
    return true;
  },

  /** Validates that a service token is bound to the runtime instance and every declared module. */
  validateServiceIdentity: function (request, registration) {
    if (this.getConfiguration().requireBoundServiceIdentity === false)
      return true;
    let authData = request.authData || {};
    let registrations = registration.registrations || [registration];
    let instanceId =
      registration.instanceId ||
      (registrations[0] && registrations[0].instanceId);
    return (
      authData.tokenType === "service" &&
      authData.runtimeInstanceId === instanceId &&
      Array.isArray(authData.modules) &&
      registrations.every((item) => authData.modules.includes(item.moduleName))
    );
  },

  /** Removes matching observed leases during graceful process drain. */
  deregister: async function (request) {
    let instanceId =
      this.getRequestParams(request).instanceId || request.instanceId;
    let moduleName =
      (request.body && request.body.moduleName) || request.moduleName;
    if (
      this.getConfiguration().requireBoundServiceIdentity !== false &&
      (!request.authData ||
        request.authData.tokenType !== "service" ||
        request.authData.runtimeInstanceId !== instanceId)
    ) {
      this._metrics.rejected++;
      await this.audit({
        eventType: "backoffice.registry.deregistration",
        outcome: "rejected",
        reasonCode: "IDENTITY_MISMATCH",
        instanceId: instanceId,
        tokenType: request.authData && request.authData.tokenType,
      });
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Module deregistration identity mismatch",
      );
    }
    let removed = 0;
    let affectedProjects = new Set();
    let entries = await this.getStore().values();
    await Promise.all(
      entries.map(async (entry) => {
        let value = entry.value;
        if (
          value.instanceId === instanceId &&
          (!moduleName || value.moduleName === moduleName)
        ) {
          if (value.projectCode) affectedProjects.add(value.projectCode);
          await this.getStore().delete(entry.key);
          removed++;
        }
      }),
    );
    if (
      SERVICE.DefaultBackofficeAvailabilityService &&
      !(await this.getStore().values()).some(
        (entry) => entry.value.instanceId === instanceId,
      )
    ) {
      SERVICE.DefaultBackofficeAvailabilityService.removeInstance(instanceId);
    }
    this._metrics.deregistrations += removed;
    if (removed > 0 && SERVICE.DefaultFunctionalModuleCatalogueService &&
      SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases) {
      let remaining = await this.getStore().values();
      await SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases(
        remaining.map(entry => entry.value), Array.from(affectedProjects), { authData: request.authData });
      await this.refreshRuntimeRegistrySnapshot(remaining.map(entry => entry.value));
    }
    await this.audit({
      eventType: "backoffice.registry.deregistration",
      outcome: "removed",
      instanceId: instanceId,
      moduleName: moduleName,
      moduleCount: removed,
    });
    return { code: "SUC_BOF_00001", data: { removed: removed } };
  },

  /** Returns active leases grouped by module using client-safe projection. */
  list: async function (request) {
    await this.expireStale();
    let modules = {};
    let entries = await this.getStore().values();
    entries.forEach((entry) => {
      let instance = entry.value;
      if (
        !this.isClientDiscoverable(instance) ||
        !this.isModuleAuthorized(
          instance.moduleName,
          request && request.authData,
          instance,
        )
      )
        return;
      modules[instance.moduleName] = modules[instance.moduleName] || [];
      modules[instance.moduleName].push(this.projectClientSafe(instance));
    });
    return { code: "SUC_BOF_00002", data: { modules: modules } };
  },

  /** Determines whether Axis may discover a module lease without treating it as a direct HTTP endpoint. */
  isClientDiscoverable: function (instance) {
    if (!instance) return false;
    if (instance.clientCallable === true) return true;
    let metadata = instance.backoffice || {};
    return (
      metadata.enabled !== false &&
      (Array.isArray(metadata.navigation) ||
        Array.isArray(metadata.documentation) ||
        Boolean(metadata.capabilityId))
    );
  },

  /** Determines whether the caller may discover a configured module capability. */
  isModuleAuthorized: function (moduleName, authData, instance) {
    let required =
      (this.getConfiguration().modulePermissions || {})[moduleName] ||
      (instance &&
        instance.backoffice &&
        instance.backoffice.requiredPermissions);
    if (!required) return true;
    let permissions = (authData && authData.permissions) || [];
    return (
      permissions.includes("*") ||
      []
        .concat(required)
        .every((permission) => permissions.includes(permission))
    );
  },

  /** Builds a non-authoritative availability summary from leases and fresh normalized runtime readiness observations. */
  buildAvailability: function (modules) {
    let availability = {};
    Object.keys(modules).forEach((moduleName) => {
      let service = SERVICE.DefaultBackofficeAvailabilityService;
      availability[moduleName] = service
        ? service.getModuleAvailability(modules[moduleName])
        : {
            state: "UNKNOWN",
            activeInstances: modules[moduleName].length,
            healthyInstances: 0,
            unavailableInstances: 0,
            unknownInstances: modules[moduleName].length,
          };
    });
    return availability;
  },

  /** Resolves one callable runtime owner from active observed leases for module-service routing. */
  resolveRuntimeOwner: async function (options) {
    await this.expireStale();
    let leases = (await this.getStore().values()).map((entry) => entry.value);
    let resolver = SERVICE.DefaultRuntimeRegistryResolverService;
    if (resolver && typeof resolver.resolveFromOwners === "function") {
      return resolver.resolveFromOwners(options, leases);
    }
    return leases
      .filter((item) => item.moduleName === options.moduleName)
      .filter((item) => item.clientCallable === true && item.endpoint)
      .filter((item) => item.state === "UP")
      .sort((left, right) =>
        String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")),
      )[0];
  },

  /** Builds a service-to-service Runtime Registry owner projection. */
  buildRuntimeRegistrySnapshot: async function () {
    await this.expireStale();
    let leases = (await this.getStore().values()).map((entry) => entry.value);
    let owners = leases
      .filter((instance) => instance.clientCallable === true && instance.endpoint)
      .filter((instance) => !instance.expiresAt || instance.expiresAt > Date.now())
      .sort((left, right) =>
        String(left.moduleName).localeCompare(String(right.moduleName)) ||
        String(left.instanceId || "").localeCompare(String(right.instanceId || "")))
      .map((instance) => ({
        moduleName: instance.moduleName,
        connectionName: instance.server || instance.moduleName,
        instanceId: instance.instanceId,
        environment: instance.environment,
        server: instance.server,
        node: instance.node,
        runtimeRole: instance.runtimeRole,
        endpoint: instance.endpoint,
        state: instance.state,
        lastSeenAt: instance.lastSeenAt,
        expiresAt: instance.expiresAt,
        clientCallable: instance.clientCallable,
        authorityClaims: (instance.authorityClaims || []).map((claim) => ({
          kind: claim.kind,
          moduleName: claim.moduleName,
          claimName: claim.claimName,
          authorityContext: claim.authorityContext,
          authorityKey: claim.authorityKey,
        })),
      }));
    return { generatedAt: new Date().toISOString(), ownerCount: owners.length, owners: owners };
  },

  /** Refreshes the in-process Runtime Registry resolver snapshot after lease changes. */
  refreshRuntimeRegistrySnapshot: async function (activeLeases) {
    let resolver = SERVICE.DefaultRuntimeRegistryResolverService;
    if (!resolver || typeof resolver.refreshSnapshot !== "function") return false;
    let leases = activeLeases || (await this.getStore().values()).map((entry) => entry.value);
    resolver.refreshSnapshot(leases
      .filter((instance) => instance.clientCallable === true && instance.endpoint)
      .filter((instance) => !instance.expiresAt || instance.expiresAt > Date.now()));
    return true;
  },

  /** Returns the current Runtime Registry snapshot for already-running runtimes. */
  runtimeRegistrySnapshot: async function (request) {
    SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
    let snapshot = await this.buildRuntimeRegistrySnapshot();
    return { code: "SUC_BOF_00002", data: snapshot };
  },

  /** Resolves a non-negative client contract version from the request or configured minimum. */
  getClientContractVersion: function (request) {
    let headers =
      (request &&
        (request.headers ||
          (request.httpRequest && request.httpRequest.headers))) ||
      {};
    let configured = this.getConfiguration().compatibility || {};
    let value =
      headers["x-nodics-client-contract-version"] !== undefined
        ? headers["x-nodics-client-contract-version"]
        : configured.minimumClientContractVersion !== undefined
          ? configured.minimumClientContractVersion
          : 1;
    let version = Number(value);
    if (!Number.isInteger(version) || version < 0)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Invalid client contract version",
      );
    return version;
  },

  /** Evaluates one module catalogue contract against the requesting client version. */
  evaluateCompatibility: function (metadata, clientContractVersion) {
    let moduleContractVersion = Number(
      (metadata && metadata.contractVersion !== undefined ? metadata.contractVersion : 1),
    );
    let minimumClientContractVersion = Number(
      (metadata && metadata.minimumClientContractVersion !== undefined ? metadata.minimumClientContractVersion : 1),
    );
    let status =
      moduleContractVersion === 0 && minimumClientContractVersion === 0 && clientContractVersion === 1
        ? "INCOMPATIBLE"
        : moduleContractVersion === 0 && minimumClientContractVersion === 0 && clientContractVersion > 1
          ? "COMPATIBLE"
          : clientContractVersion > moduleContractVersion
        ? "INCOMPATIBLE"
        : clientContractVersion < minimumClientContractVersion
        ? "INCOMPATIBLE"
        : clientContractVersion < moduleContractVersion
          ? "DEGRADED"
          : "COMPATIBLE";
    return {
      clientContractVersion,
      moduleContractVersion,
      minimumClientContractVersion,
      status,
    };
  },

  /** Aggregates authorized module-owned catalogue metadata without becoming its source of truth. */
  buildCatalogue: function (modules, clientContractVersion, authData) {
    if (!SERVICE.DefaultBackofficeCapabilityRegistryService) {
      throw new Error("BackOffice capability registry service is unavailable");
    }
    return SERVICE.DefaultBackofficeCapabilityRegistryService.buildCatalogue(
      modules, clientContractVersion, authData);
  },

  /** Returns the most restrictive compatibility state from an authorized catalogue. */
  getOverallCompatibilityStatus: function (catalogue) {
    let statuses = Object.keys(catalogue).map(
      (moduleName) => catalogue[moduleName].compatibility.status,
    );
    if (statuses.includes("INCOMPATIBLE")) return "INCOMPATIBLE";
    if (statuses.includes("DEGRADED")) return "DEGRADED";
    return "COMPATIBLE";
  },

  /** Selects one authorized compatible UI-composition provider from module-owned metadata and layered preference. */
  selectUiComposition: function (catalogue, availability) {
    let config = this.getConfiguration().uiComposition || {};
    let fallback = { enabled: false, fallbackMode: "STATIC_RECOVERY_SHELL" };
    if (config.enabled === false) return fallback;
    let role = config.providerRole || "UI_COMPOSITION_PROVIDER";
    let providers = Object.keys(catalogue)
      .filter((moduleName) => {
        let metadata = catalogue[moduleName];
        return (
          Array.isArray(metadata.roles) &&
          metadata.roles.includes(role) &&
          metadata.uiComposition &&
          metadata.compatibility.status !== "INCOMPATIBLE" &&
          availability &&
          ["UP", "DEGRADED"].includes((availability[moduleName] || {}).state)
        );
      })
      .sort();
    let providerModule =
      config.preferredModule && providers.includes(config.preferredModule)
        ? config.preferredModule
        : providers[0];
    if (!providerModule) return fallback;
    return Object.assign(
      { enabled: true, providerModule: providerModule },
      catalogue[providerModule].uiComposition,
    );
  },

  /** Aggregates permission-filtered module-owned documentation sources into one client-safe ordered registry. */
  buildDocumentationSources: function (catalogue, authData) {
    let permissions = (authData && authData.permissions) || [];
    let sources = [];
    Object.keys(catalogue)
      .sort()
      .forEach((moduleName) => {
        let metadata = catalogue[moduleName];
        (metadata.documentation || []).forEach((source) => {
          let required = [].concat(source.requiredPermissions || []);
          if (
            !permissions.includes("*") &&
            !required.every((permission) => permissions.includes(permission))
          )
            return;
          sources.push(Object.assign({}, source, { ownerModule: moduleName }));
        });
      });
    let ids = new Set();
    return sources
      .sort(
        (left, right) =>
          left.order - right.order || left.id.localeCompare(right.id),
      )
      .filter((source) => {
        if (ids.has(source.id)) return false;
        ids.add(source.id);
        return true;
      });
  },

  /** Produces the current effective Axis navigation composition from module defaults plus governed fallback metadata. */
  buildEffectiveNavigationComposition: function (catalogue, availability, authData, request, documentationPublication) {
    let permissions = (authData && authData.permissions) || [];
    let warnings = [];
    let routeOwners = {};
    let parentKeys = new Set();
    let items = [];
    Object.keys(catalogue).sort().forEach((moduleName) => {
      let metadata = catalogue[moduleName] || {};
      let moduleAvailability =
        availability && availability[moduleName] && availability[moduleName].state
          ? availability[moduleName].state
          : "UNKNOWN";
      (metadata.navigation || []).forEach((item, index) => {
        let required = [].concat(item.requiredPermissions || []);
        if (
          !permissions.includes("*") &&
          !required.every((permission) => permissions.includes(permission))
        ) {
          return;
        }
        let route = String(item.route || "");
        let identity = moduleName + ":" + String(item.id || "");
        let sourceTrace = {
          sourceType: "moduleDefault",
          ownerModule: moduleName,
          stableIdentity: identity,
          overrideApplied: false,
          editable: false,
          lifecycleState: "PUBLISHED",
        };
        let nextItem = Object.assign({}, item, {
          order: Number.isInteger(item.order) ? item.order : index,
          moduleName: moduleName,
          availability: moduleAvailability,
          sourceTrace: sourceTrace,
          routeOwner: {
            ownerType: item.workbenchTarget
              ? "WORKBENCH"
              : route.indexOf("/docs") === 0
                ? "CMS"
                : "NATIVE_AXIS",
            ownerModule: moduleName,
          },
        });
        nextItem = this.applyDocumentationPublicationState(nextItem, documentationPublication);
        if (nextItem.parentId) {
          parentKeys.add(String(nextItem.parentModuleName || moduleName) + ":" + String(nextItem.parentId));
        }
        if (route) {
          routeOwners[route] = routeOwners[route] || [];
          routeOwners[route].push(identity);
        }
        items.push(nextItem);
      });
    });
    let identities = new Set(items.map((item) => item.moduleName + ":" + item.id));
    items.forEach((item) => {
      if (item.parentId) {
        let parentKey = String(item.parentModuleName || item.moduleName) + ":" + String(item.parentId);
        if (!identities.has(parentKey) && item.featureState !== "DISABLED" && item.featureState !== "HIDDEN") {
          warnings.push({
            code: "BROKEN_PARENT",
            severity: "WARNING",
            item: item.moduleName + ":" + item.id,
            message: "Navigation item references a parent that is not present in the effective composition.",
          });
        }
      }
    });
    Object.keys(routeOwners).sort().forEach((route) => {
      let owners = Array.from(new Set(routeOwners[route]));
      if (owners.length > 1) {
        let ownerModules = Array.from(new Set(owners.map((owner) => String(owner).split(":")[0])));
        let sameModuleAlias = ownerModules.length === 1;
        warnings.push({
          code: sameModuleAlias ? "DUPLICATE_ROUTE_ALIAS" : "DUPLICATE_ROUTE",
          severity: sameModuleAlias ? "INFO" : "WARNING",
          route: route,
          owners: owners,
          message: sameModuleAlias
            ? "Multiple navigation entries in the same module share a route as a grouping shortcut; Axis chooses the deepest/most specific match."
            : "Multiple navigation items resolve to the same route; Axis chooses the deepest/most specific match.",
        });
      }
    });
    let groups = {};
    items.forEach((item) => {
      if (!item.group || !item.group.id) return;
      let group = item.group;
      groups[group.id] = groups[group.id] || {
        id: group.id,
        label: group.label,
        labelKey: group.labelKey,
        order: Number.isInteger(group.order) ? group.order : 0,
        sourceTrace: {
          sourceType: "moduleDefault",
          ownerModule: item.moduleName,
          overrideApplied: false,
          editable: false,
          lifecycleState: "PUBLISHED",
        },
      };
    });
    let state = this.getNavigationCompositionState(request);
    let published = state.published && state.published.composition
      ? this.cloneNavigationComposition(state.published.composition)
      : undefined;
    if (published) {
      items = (published.navigation || []).map((item, index) => this.applyDocumentationPublicationState(Object.assign({}, item, {
          order: Number.isInteger(item.order) ? item.order : index,
          sourceTrace: Object.assign({
            sourceType: "governedOverride",
            ownerModule: item.moduleName || "backoffice",
            stableIdentity: String(item.moduleName || "backoffice") + ":" + String(item.id || ""),
            overrideApplied: true,
            editable: true,
            lifecycleState: "PUBLISHED",
          }, item.sourceTrace || {}, {
            sourceType: "governedOverride",
            overrideApplied: true,
            editable: true,
            lifecycleState: "PUBLISHED",
          }),
          routeOwner: item.routeOwner || {
            ownerType: item.workbenchTarget ? "WORKBENCH" : String(item.route || "").indexOf("/docs") === 0 ? "CMS" : "NATIVE_AXIS",
            ownerModule: item.moduleName || "backoffice",
          },
        }), documentationPublication));
      groups = {};
      (published.groups || []).forEach((group) => {
        groups[group.id] = Object.assign({}, group, {
          sourceTrace: Object.assign({
            sourceType: "governedOverride",
            ownerModule: "backoffice",
            overrideApplied: true,
            editable: true,
            lifecycleState: "PUBLISHED",
          }, group.sourceTrace || {}, {
            sourceType: "governedOverride",
            overrideApplied: true,
            editable: true,
            lifecycleState: "PUBLISHED",
          }),
        });
      });
    }
    let checksum = this.computeNavigationCompositionChecksum({
      groups: Object.values(groups),
      navigation: items,
    }, request, authData);
    return {
      contractVersion: 0,
      version: published ? state.version : 0,
      checksum: checksum,
      lifecycleState: "PUBLISHED",
      source: published ? "GOVERNED_COMPOSITION" : "MODULE_DEFAULTS",
      fallbackActive: !published,
      fallbackReason: published ? undefined : "No governed composition is published for this scope; effective navigation is resolved from authorized module defaults.",
      scope: {
        projectCode: request && request._projectCode,
        tenantCode: request && request.tenant,
        enterpriseCode: authData && (authData.enterpriseCode || authData.entCode),
      },
      authoring: {
        mode: "GOVERNED_RUNTIME_LIFECYCLE",
        draftSupported: true,
        previewSupported: true,
        exportSupported: true,
        importValidationSupported: true,
        approvalRequired: true,
        publishSupported: true,
        rollbackSupported: state.history.length > 0,
        rbacBoundary: "BACKOFFICE_PERMISSION_GATED",
        localizationSupported: "LABEL_KEY_FOUNDATION",
        persistenceSupported: "RUNTIME_SCOPED_FOUNDATION",
        directBrowserEditsAllowed: false,
        reason: "Navigation authoring supports governed draft, approval, publish-to-effective, and rollback in the BackOffice registry lifecycle. Durable database persistence can replace the runtime state without changing the API contract.",
        draftState: state.draft && state.draft.lifecycleState,
        publishedAt: state.published && state.published.publishedAt,
      },
      groups: Object.values(groups).sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
      navigation: items,
      warnings: warnings,
      generatedAt: new Date().toISOString(),
    };
  },

  /** Keeps documentation product routes disabled until their publication owner is Online-ready. */
  applyDocumentationPublicationState: function (item, publication) {
    if (!item || !item.group || item.group.id !== "documentation") return item;
    if (
      item.id === "documentation" ||
      item.id === "documentation-dashboard" ||
      item.id === "documentation-management"
    ) return item;
    let route = String(item.route || "");
    if (!route || route === "/docs") return item;
    let state = publication && publication.byRoute && publication.byRoute[route];
    let ready = state && state.ready === true;
    if (!ready) {
      return Object.assign({}, item, {
        featureState: "DISABLED",
        help: Object.assign({}, item.help || {}, {
          summary: "Initialize and publish documentation from Dashboard before opening this documentation area."
        })
      });
    }
    return item;
  },

  /** Reads bounded documentation publication status for bootstrap navigation gating. */
  buildDocumentationPublicationState: async function (sources, request) {
    let result = { byRoute: {}, bySourceId: {} };
    let service = SERVICE.DefaultBackofficeApplicationInitializationService;
    if (!service || typeof service.status !== "function") return result;
    let cmsSources = [].concat(sources || []).filter(source =>
      source && source.type === "CMS" && source.initializationProfile && source.route);
    await Promise.all(cmsSources.map(async source => {
      try {
        let status = await service.status(source.initializationProfile, request);
        let state = {
          readiness: status && status.readiness || "UNKNOWN",
          ready: Boolean(status && status.readiness === "READY")
        };
        result.byRoute[String(source.route)] = state;
        result.bySourceId[String(source.id)] = state;
      } catch (error) {
        let state = { readiness: "UNAVAILABLE", ready: false };
        result.byRoute[String(source.route)] = state;
        result.bySourceId[String(source.id)] = state;
      }
    }));
    let cmsReady = cmsSources.length > 0 && cmsSources.every(source =>
      result.bySourceId[String(source.id)] && result.bySourceId[String(source.id)].ready === true);
    [].concat(sources || []).filter(source => source && source.type === "OPENAPI" && source.route)
      .forEach(source => {
        result.byRoute[String(source.route)] = {
          readiness: cmsReady ? "READY" : "WAITING_FOR_DOCUMENTATION",
          ready: cmsReady
        };
      });
    return result;
  },

  /** Resolves and validates bounded administrative query parameters. */
  getAdminQuery: function (request) {
    let source =
      (request &&
        (request.query ||
          (request.httpRequest && request.httpRequest.query))) ||
      {};
    let limit = source.limit === undefined ? 50 : Number(source.limit);
    let offset = source.offset === undefined ? 0 : Number(source.offset);
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Invalid registry administration pagination",
      );
    }
    let state = source.state && String(source.state).toUpperCase();
    if (
      state &&
      !["UP", "DEGRADED", "UNAVAILABLE", "UNKNOWN"].includes(state)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Invalid registry availability state",
      );
    }
    let compatibility =
      source.compatibility && String(source.compatibility).toUpperCase();
    if (
      compatibility &&
      !["COMPATIBLE", "DEGRADED", "INCOMPATIBLE"].includes(compatibility)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Invalid registry compatibility state",
      );
    }
    return {
      moduleName: source.moduleName && String(source.moduleName),
      capability: source.capability && String(source.capability),
      environment: source.environment && String(source.environment),
      server: source.server && String(source.server),
      compatibility: compatibility,
      state: state,
      limit: limit,
      offset: offset,
    };
  },

  /** Returns bounded sanitized administrative inventory without bypassing registry authority. */
  adminList: async function (request) {
    SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
    await this.expireStale();
    let query = this.getAdminQuery(request);
    let grouped = {};
    (await this.getStore().values()).forEach((entry) => {
      let instance = entry.value;
      grouped[instance.moduleName] = grouped[instance.moduleName] || [];
      grouped[instance.moduleName].push(instance);
    });
    let items = Object.keys(grouped)
      .sort()
      .map((moduleName) => {
        let instances = grouped[moduleName];
        let availability = this.buildAvailability({ [moduleName]: instances })[
          moduleName
        ];
        let metadata =
          instances.map((item) => item.backoffice).find(Boolean) || {};
        return {
          moduleName: moduleName,
          displayName: instances[0].displayName,
          parentModule: instances[0].parentModule,
          canonicalIdentity: instances[0].canonicalIdentity,
          version: instances[0].version,
          moduleKind: instances[0].moduleKind,
          capabilities: Array.from(
            new Set(instances.flatMap((item) => item.capabilities || [])),
          ).sort(),
          environments: Array.from(
            new Set(instances.map((item) => item.environment).filter(Boolean)),
          ).sort(),
          servers: Array.from(
            new Set(instances.map((item) => item.server).filter(Boolean)),
          ).sort(),
          availability: availability,
          compatibility: this.evaluateCompatibility(
            metadata,
            this.getClientContractVersion(request),
          ),
          activeInstances: instances.length,
        };
      });
    let descendants = (parentName, visited = new Set()) => {
      if (visited.has(parentName)) return [];
      let nextVisited = new Set(visited);
      nextVisited.add(parentName);
      return items
        .filter((candidate) => candidate.parentModule === parentName)
        .flatMap((candidate) =>
          [candidate].concat(descendants(candidate.moduleName, nextVisited)),
        );
    };
    items
      .filter((item) => item.moduleKind === "group")
      .forEach((group) => {
        let descendantItems = descendants(group.moduleName).filter(
          (item) => item.moduleKind !== "group",
        );
        if (descendantItems.length > 0)
          group.availability =
            this.aggregateModuleAvailability(descendantItems);
      });
    items = items.filter(
      (item) =>
        (!query.moduleName || item.moduleName.includes(query.moduleName)) &&
        (!query.capability || item.capabilities.includes(query.capability)) &&
        (!query.environment || item.environments.includes(query.environment)) &&
        (!query.server || item.servers.includes(query.server)) &&
        (!query.state || item.availability.state === query.state) &&
        (!query.compatibility ||
          item.compatibility.status === query.compatibility),
    );
    return {
      code: "SUC_BOF_00011",
      data: {
        total: items.length,
        offset: query.offset,
        limit: query.limit,
        items: items.slice(query.offset, query.offset + query.limit),
      },
    };
  },

  /** Returns sanitized leases and aggregate state for one administrative module lookup. */
  adminDetail: async function (request) {
    SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
    await this.expireStale();
    let moduleName = String(this.getRequestParams(request).moduleName || "");
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(moduleName))
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Invalid module name");
    let instances = (await this.getStore().values())
      .map((entry) => entry.value)
      .filter((item) => item.moduleName === moduleName);
    return {
      code: "SUC_BOF_00012",
      data: {
        moduleName: moduleName,
        displayName: instances[0] && instances[0].displayName,
        availability: this.buildAvailability({ [moduleName]: instances })[
          moduleName
        ],
        instances: instances.map((instance) =>
          Object.assign(this.projectClientSafe(instance), {
            availability: SERVICE.DefaultBackofficeAvailabilityService
              ? SERVICE.DefaultBackofficeAvailabilityService.getInstanceAvailability(
                  instance.instanceId,
                )
              : {
                  state: "UNKNOWN",
                  freshness: "MISSING",
                  reasonCode: "OBSERVATION_MISSING",
                },
          }),
        ),
      },
    };
  },

  /** Derives a group summary from observed non-group descendants without creating another health authority. */
  aggregateModuleAvailability: function (items) {
    let totals = items.reduce(
      (result, item) => {
        let availability = item.availability || {};
        [
          "activeInstances",
          "healthyInstances",
          "unavailableInstances",
          "unknownInstances",
        ].forEach((name) => {
          result[name] += Number(availability[name] || 0);
        });
        result.states.push(availability.state || "UNKNOWN");
        return result;
      },
      {
        activeInstances: 0,
        healthyInstances: 0,
        unavailableInstances: 0,
        unknownInstances: 0,
        states: [],
      },
    );
    let state = totals.states.every((value) => value === "UP")
      ? "UP"
      : totals.states.every((value) => value === "UNAVAILABLE")
        ? "UNAVAILABLE"
        : totals.states.every((value) => value === "UNKNOWN")
          ? "UNKNOWN"
          : "DEGRADED";
    return {
      state: state,
      activeInstances: totals.activeInstances,
      healthyInstances: totals.healthyInstances,
      unavailableInstances: totals.unavailableInstances,
      unknownInstances: totals.unknownInstances,
    };
  },

  /** Forces existing observers to refresh one registered module under an action-specific permission. */
  refresh: async function (request) {
    let moduleName = String(this.getRequestParams(request).moduleName || "");
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(moduleName))
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Invalid module name");
    return SERVICE.DefaultBackofficeAdministrativeSecurityService.executeRefresh(
      request,
      moduleName,
      async () => {
        await this.expireStale();
        let instances = (await this.getStore().values())
          .map((entry) => entry.value)
          .filter(
            (item) => item.moduleName === moduleName && item.clientCallable,
          );
        if (instances.length === 0)
          throw new CLASSES.NodicsError(
            "ERR_BOF_00000",
            "Registered module was not found",
          );
        let unique = Array.from(
          new Map(instances.map((item) => [item.instanceId, item])).values(),
        );
        await Promise.all(
          unique.map((item) =>
            SERVICE.DefaultBackofficeAvailabilityService
              ? SERVICE.DefaultBackofficeAvailabilityService.observe(item)
              : false,
          ),
        );
        if (instances[0] && SERVICE.DefaultBackofficeDiscoveryService)
          await SERVICE.DefaultBackofficeDiscoveryService.discover(
            instances[0],
            undefined,
            request.authData,
          );
        let context =
          SERVICE.DefaultBackofficeAdministrativeSecurityService.getAuditContext(
            request,
          );
        await this.audit(
          Object.assign(
            {
              eventType: "backoffice.registry.refresh",
              outcome: "completed",
              moduleName: moduleName,
              moduleCount: instances.length,
            },
            context,
          ),
        );
        return {
          code: "SUC_BOF_00013",
          data: {
            moduleName: moduleName,
            refreshedInstances: unique.length,
            discoveryRequested: Boolean(
              instances[0] && SERVICE.DefaultBackofficeDiscoveryService,
            ),
          },
        };
      },
    );
  },

  /** Returns the authorized module catalogue and compatibility metadata required to bootstrap a BackOffice client. */
  bootstrap: async function (request) {
    let clientContractVersion = this.getClientContractVersion(request);
    let result = await this.list(request);
    let eligibility = SERVICE.DefaultFunctionalModuleCatalogueService &&
      typeof SERVICE.DefaultFunctionalModuleCatalogueService.getPresentationEligibility === "function"
      ? await SERVICE.DefaultFunctionalModuleCatalogueService.getPresentationEligibility(request)
      : undefined;
    let effectiveModules = SERVICE.DefaultBackofficeCapabilityRegistryService.applyFunctionalModuleEligibility(
      result.data.modules, eligibility);
    let catalogue = this.buildCatalogue(
      effectiveModules,
      clientContractVersion,
      request && request.authData,
    );
    let configured = this.getConfiguration().compatibility || {};
    let supportedClientContractVersions = Array.from(new Set([].concat(configured.supportedClientContractVersions || [],
      [configured.registryContractVersion, configured.contractVersion, 1]).filter(value => value !== undefined).map(Number)));
    if (supportedClientContractVersions.includes(clientContractVersion)) {
      Object.values(catalogue).forEach((entry) => {
        if (entry.compatibility && entry.compatibility.status === "INCOMPATIBLE" &&
          clientContractVersion > entry.compatibility.moduleContractVersion) {
          entry.compatibility.status = "DEGRADED";
        }
      });
    }
    let availability = this.buildAvailability(effectiveModules);
    let documentationSources = this.buildDocumentationSources(
      catalogue,
      request && request.authData,
    );
    let documentationPublication = await this.buildDocumentationPublicationState(
      documentationSources,
      request,
    );
    let effectiveNavigationComposition = this.buildEffectiveNavigationComposition(
      catalogue,
      availability,
      request && request.authData,
      request,
      documentationPublication,
    );
    let status = this.getOverallCompatibilityStatus(catalogue);
    if (status !== "COMPATIBLE") {
      await this.audit({
        eventType: "backoffice.registry.compatibility",
        outcome: "evaluated",
        compatibilityStatus: status,
        moduleCount: Object.keys(catalogue).length,
      });
    }
    let axisPolicy = SERVICE.DefaultAxisExperiencePolicyService
      ? await SERVICE.DefaultAxisExperiencePolicyService.getEffective(request)
      : undefined;
    if (!axisPolicy)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Axis employee policy is unavailable",
      );
    return {
      code: "SUC_BOF_00004",
      data: {
        compatibility: Object.assign({}, configured, {
          clientContractVersion: clientContractVersion,
          status: status,
        }),
        modules: effectiveModules,
        catalogue: catalogue,
        availability: availability,
        effectiveNavigationComposition: effectiveNavigationComposition,
        uiComposition: this.selectUiComposition(catalogue, availability),
        applicationInitializationProfiles: SERVICE.DefaultBackofficeApplicationInitializationService &&
          typeof SERVICE.DefaultBackofficeApplicationInitializationService.profiles === "function"
          ? SERVICE.DefaultBackofficeApplicationInitializationService.profiles(request)
          : [],
        documentationSources: documentationSources,
        axisPolicy: axisPolicy,
        tenantCode: request.tenant,
      },
    };
  },

  /** Returns the authorized effective Axis navigation composition without the full bootstrap payload. */
  effectiveNavigationComposition: async function (request) {
    let clientContractVersion = this.getClientContractVersion(request);
    let result = await this.list(request);
    let eligibility = SERVICE.DefaultFunctionalModuleCatalogueService &&
      typeof SERVICE.DefaultFunctionalModuleCatalogueService.getPresentationEligibility === "function"
      ? await SERVICE.DefaultFunctionalModuleCatalogueService.getPresentationEligibility(request)
      : undefined;
    let effectiveModules = SERVICE.DefaultBackofficeCapabilityRegistryService.applyFunctionalModuleEligibility(
      result.data.modules, eligibility);
    let catalogue = this.buildCatalogue(
      effectiveModules,
      clientContractVersion,
      request && request.authData,
    );
    let availability = this.buildAvailability(effectiveModules);
    let documentationSources = this.buildDocumentationSources(
      catalogue,
      request && request.authData,
    );
    let documentationPublication = await this.buildDocumentationPublicationState(
      documentationSources,
      request,
    );
    return {
      code: "SUC_BOF_00015",
      data: this.buildEffectiveNavigationComposition(
        catalogue,
        availability,
        request && request.authData,
        request,
        documentationPublication,
      ),
    };
  },

  /** Returns safe authoring lifecycle metadata for Axis without enabling direct browser edits. */
  navigationCompositionAuthoringStatus: async function (request) {
    let effective = await this.effectiveNavigationComposition(request);
    let state = this.getNavigationCompositionState(request);
    return {
      code: "SUC_BOF_00016",
      data: Object.assign({}, effective.data.authoring || {}, {
        lifecycle: ["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED", "SUPERSEDED", "REJECTED", "ROLLED_BACK"],
        availableOperations: ["effective", "preview", "export", "importValidate", "createDraft", "submit", "approve", "publish", "rollback"],
        blockedOperations: [],
        blockingReason: undefined,
        scope: effective.data.scope,
        checksum: effective.data.checksum,
        version: state.version,
        draft: state.draft ? {
          draftId: state.draft.draftId,
          lifecycleState: state.draft.lifecycleState,
          checksum: state.draft.checksum,
          validation: state.draft.validation,
          createdAt: state.draft.createdAt,
          submittedAt: state.draft.submittedAt,
          approvedAt: state.draft.approvedAt,
        } : undefined,
        rollbackCandidates: state.history.slice(-5).reverse().map((entry) => ({
          version: entry.version,
          checksum: entry.checksum,
          publishedAt: entry.publishedAt,
          lifecycleState: entry.lifecycleState,
        })),
      }),
    };
  },

  /** Validates a candidate composition using the current effective navigation as authority, without persistence. */
  validateNavigationCompositionCandidate: function (candidate, effective) {
    let issues = [];
    let navigation = candidate && Array.isArray(candidate.navigation)
      ? candidate.navigation
      : effective.navigation || [];
    let identities = new Set();
    let routes = {};
    navigation.forEach((item, index) => {
      let id = item && item.id ? String(item.id) : "";
      let moduleName = item && item.moduleName ? String(item.moduleName) : "";
      let identity = moduleName + ":" + id;
      if (!id || !moduleName) {
        issues.push({ code: "MISSING_IDENTITY", severity: "ERROR", index: index, message: "Navigation items require stable moduleName and id." });
        return;
      }
      identities.add(identity);
      let route = item && item.route ? String(item.route) : "";
      if (route && route.indexOf("/") !== 0) {
        issues.push({ code: "INVALID_ROUTE", severity: "ERROR", item: identity, message: "Navigation routes must be application-relative unless an approved external-link contract is implemented." });
      }
      if (route) {
        routes[route] = routes[route] || [];
        routes[route].push(identity);
      }
      if (item && item.label && String(item.label).length > 80) {
        issues.push({ code: "LONG_LABEL", severity: "WARNING", item: identity, message: "Navigation label exceeds the recommended enterprise rail length and must be browser-validated." });
      }
    });
    navigation.forEach((item) => {
      if (!item || !item.parentId) return;
      let parentKey = String(item.parentModuleName || item.moduleName) + ":" + String(item.parentId);
      if (!identities.has(parentKey)) {
        issues.push({ code: "BROKEN_PARENT", severity: "ERROR", item: String(item.moduleName) + ":" + String(item.id), message: "Navigation item references a parent that is not present in the candidate composition." });
      }
    });
    Object.keys(routes).sort().forEach((route) => {
      let owners = Array.from(new Set(routes[route]));
      if (owners.length > 1) {
        issues.push({ code: "DUPLICATE_ROUTE", severity: "ERROR", route: route, owners: owners, message: "Candidate composition contains duplicate effective routes with different owners." });
      }
    });
    return {
      valid: issues.filter((issue) => issue.severity === "ERROR").length === 0,
      issues: issues,
      checkedAt: new Date().toISOString(),
    };
  },

  /** Creates or replaces a scoped governed navigation composition draft after safe validation. */
  createNavigationCompositionDraft: async function (request) {
    let effective = await this.effectiveNavigationComposition(request);
    let body = request && (request.body || request.data || request.payload) || {};
    let candidate = body.candidate || body.composition || body;
    let validation = this.validateNavigationCompositionCandidate(candidate, effective.data);
    if (!validation.valid)
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is invalid");
    let state = this.getNavigationCompositionState(request);
    let composition = {
      groups: candidate.groups || effective.data.groups || [],
      navigation: candidate.navigation || effective.data.navigation || [],
    };
    let checksum = this.computeNavigationCompositionChecksum(composition, request, request && request.authData);
    state.version += 1;
    state.draft = {
      draftId: "nav-draft-" + state.version,
      version: state.version,
      lifecycleState: "DRAFT",
      checksum: checksum,
      composition: this.cloneNavigationComposition(composition),
      validation: validation,
      createdAt: new Date().toISOString(),
      createdBy: request && request.authData && request.authData.userName,
      reason: body.reason && String(body.reason).slice(0, 512),
    };
    state.updatedAt = state.draft.createdAt;
    await this.audit({
      eventType: "backoffice.navigationComposition.draft",
      outcome: "created",
      checksum: checksum,
      issueCount: validation.issues.length,
      version: state.version,
    });
    return { code: "SUC_BOF_00023", data: state.draft };
  },

  /** Moves the current scoped navigation draft into checker review. */
  submitNavigationCompositionDraft: async function (request) {
    let state = this.getNavigationCompositionState(request);
    if (!state.draft || !["DRAFT", "REJECTED"].includes(state.draft.lifecycleState))
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is not submittable");
    state.draft.lifecycleState = "SUBMITTED";
    state.draft.submittedAt = new Date().toISOString();
    state.draft.submittedBy = request && request.authData && request.authData.userName;
    state.updatedAt = state.draft.submittedAt;
    await this.audit({ eventType: "backoffice.navigationComposition.submit", outcome: "submitted", checksum: state.draft.checksum, version: state.draft.version });
    return { code: "SUC_BOF_00024", data: state.draft };
  },

  /** Approves a submitted navigation draft without making it effective until publish is called. */
  approveNavigationCompositionDraft: async function (request) {
    let state = this.getNavigationCompositionState(request);
    if (!state.draft || state.draft.lifecycleState !== "SUBMITTED")
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is not approvable");
    state.draft.lifecycleState = "APPROVED";
    state.draft.approvedAt = new Date().toISOString();
    state.draft.approvedBy = request && request.authData && request.authData.userName;
    state.updatedAt = state.draft.approvedAt;
    await this.audit({ eventType: "backoffice.navigationComposition.approve", outcome: "approved", checksum: state.draft.checksum, version: state.draft.version });
    return { code: "SUC_BOF_00025", data: state.draft };
  },

  /** Publishes the approved navigation draft to the effective composition used by Axis bootstrap. */
  publishNavigationCompositionDraft: async function (request) {
    let state = this.getNavigationCompositionState(request);
    if (!state.draft || state.draft.lifecycleState !== "APPROVED")
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is not publishable");
    if (state.published) {
      state.published.lifecycleState = "SUPERSEDED";
      state.history.push(this.cloneNavigationComposition(state.published));
      state.history = state.history.slice(-20);
    }
    state.published = Object.assign({}, this.cloneNavigationComposition(state.draft), {
      lifecycleState: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      publishedBy: request && request.authData && request.authData.userName,
    });
    state.draft = undefined;
    state.updatedAt = state.published.publishedAt;
    await this.audit({ eventType: "backoffice.navigationComposition.publish", outcome: "published", checksum: state.published.checksum, version: state.published.version });
    return { code: "SUC_BOF_00026", data: state.published };
  },

  /** Rolls back the effective navigation composition to the latest superseded published version. */
  rollbackNavigationComposition: async function (request) {
    let state = this.getNavigationCompositionState(request);
    let rollbackTarget = state.history.pop();
    if (!rollbackTarget)
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition rollback candidate is unavailable");
    if (state.published) {
      let current = this.cloneNavigationComposition(state.published);
      current.lifecycleState = "ROLLED_BACK";
      current.rolledBackAt = new Date().toISOString();
      current.rolledBackBy = request && request.authData && request.authData.userName;
      state.history.push(current);
    }
    state.published = Object.assign({}, this.cloneNavigationComposition(rollbackTarget), {
      lifecycleState: "PUBLISHED",
      rolledBackAt: new Date().toISOString(),
      rolledBackBy: request && request.authData && request.authData.userName,
    });
    state.updatedAt = state.published.rolledBackAt;
    await this.audit({ eventType: "backoffice.navigationComposition.rollback", outcome: "rolledBack", checksum: state.published.checksum, version: state.published.version });
    return { code: "SUC_BOF_00027", data: state.published };
  },

  /** Performs a dry-run navigation composition preview without persistence or publication side effects. */
  previewNavigationComposition: async function (request) {
    let effective = await this.effectiveNavigationComposition(request);
    let body = request && (request.body || request.data || request.payload) || {};
    let candidate = body.candidate || body.composition || body;
    let validation = this.validateNavigationCompositionCandidate(candidate, effective.data);
    await this.audit({
      eventType: "backoffice.navigationComposition.preview",
      outcome: validation.valid ? "valid" : "invalid",
      issueCount: validation.issues.length,
      checksum: effective.data.checksum,
    });
    return {
      code: "SUC_BOF_00017",
      data: {
        mode: "DRY_RUN_ONLY",
        persisted: false,
        published: false,
        approvalRequired: true,
        effectiveChecksum: effective.data.checksum,
        validation: validation,
        impact: {
          currentItemCount: (effective.data.navigation || []).length,
          candidateItemCount: candidate && Array.isArray(candidate.navigation) ? candidate.navigation.length : (effective.data.navigation || []).length,
        },
      },
    };
  },

  /** Exports the current effective composition with source trace and checksum. */
  exportNavigationComposition: async function (request) {
    let effective = await this.effectiveNavigationComposition(request);
    await this.audit({
      eventType: "backoffice.navigationComposition.export",
      outcome: "exported",
      checksum: effective.data.checksum,
    });
    return {
      code: "SUC_BOF_00018",
      data: {
        exportedAt: new Date().toISOString(),
        exportFormatVersion: 0,
        composition: effective.data,
      },
    };
  },

  /** Returns the current effective composition snapshot with source trace and checksum. */
  getNavigationCompositionSnapshot: async function (request) {
    return this.exportNavigationComposition(request);
  },

  /** Validates an imported composition payload without creating drafts or changing runtime navigation. */
  validateNavigationCompositionImport: async function (request) {
    let effective = await this.effectiveNavigationComposition(request);
    let body = request && (request.body || request.data || request.payload) || {};
    let candidate = body.composition || body.candidate || body;
    let validation = this.validateNavigationCompositionCandidate(candidate, effective.data);
    await this.audit({
      eventType: "backoffice.navigationComposition.importValidate",
      outcome: validation.valid ? "valid" : "invalid",
      issueCount: validation.issues.length,
      checksum: effective.data.checksum,
    });
    return {
      code: "SUC_BOF_00019",
      data: {
        mode: "VALIDATE_ONLY",
        persisted: false,
        published: false,
        validation: validation,
        effectiveChecksum: effective.data.checksum,
        blockingReason: "Import approval/persistence is intentionally disabled until governed draft storage and checker approval are implemented.",
      },
    };
  },

  /**
   * Returns only the public module endpoints and UI composition required before employee authentication.
   * The observed registry remains endpoint authority; no module inventory, lease, health, or permission data is disclosed.
   */
  publicBootstrap: async function (request) {
    let policy = this.getConfiguration().publicBootstrap || {};
    if (policy.enabled !== true)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Public bootstrap is disabled",
      );
    let clientContractVersion = this.getClientContractVersion(request);
    let contractVersion = Number(policy.contractVersion !== undefined ? policy.contractVersion : 1);
    let supportedClientContractVersions = Array.from(new Set([].concat(policy.supportedClientContractVersions || [],
      [contractVersion, 1]).map(Number)));
    if (!supportedClientContractVersions.includes(clientContractVersion)) {
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Unsupported public bootstrap client contract version",
      );
    }
    await this.expireStale();
    let leases = (await this.getStore().values())
      .map((entry) => entry.value)
      .filter(
        (item) =>
          item.clientCallable === true && item.endpoint && item.state === "UP",
      );
    let endpoints = {};
    let endpointRoles = {};
    Object.entries(policy.requiredModules || {}).forEach((entry) => {
      let selection = typeof entry[1] === "string"
        ? { moduleName: entry[1] }
        : Object.assign({}, entry[1]);
      let candidates = leases
        .filter((item) => item.moduleName === selection.moduleName)
        .filter((item) => !selection.server || item.server === selection.server)
        .filter((item) => !selection.environment || item.environment === selection.environment)
        .sort((left, right) =>
          String(right.lastSeenAt || "").localeCompare(
            String(left.lastSeenAt || ""),
          ),
        );
      if (candidates.length === 0) {
        throw new CLASSES.NodicsError(
          "ERR_BOF_00000",
          "Required public bootstrap module is unavailable",
        );
      }
      endpoints[entry[0]] = this.clientEndpoint(candidates[0]);
      if (selection.runtimeRole) endpointRoles[entry[0]] = selection.runtimeRole;
    });
    Object.entries(policy.optionalModules || {}).forEach((entry) => {
      let selection = typeof entry[1] === "string"
        ? { moduleName: entry[1] }
        : Object.assign({}, entry[1]);
      let candidate = leases
        .filter((item) => item.moduleName === selection.moduleName)
        .filter((item) => !selection.server || item.server === selection.server)
        .filter((item) => !selection.environment || item.environment === selection.environment)
        .sort((left, right) => String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || "")))[0];
      if (candidate) {
        endpoints[entry[0]] = this.clientEndpoint(candidate);
        if (selection.runtimeRole) endpointRoles[entry[0]] = selection.runtimeRole;
      }
    });
    return {
      code: "SUC_BOF_00014",
      data: {
        contractVersion: contractVersion,
        clientContractVersion: clientContractVersion,
        endpoints: endpoints,
        endpointRoles: endpointRoles,
        uiComposition: Object.assign({}, policy.uiComposition),
      },
    };
  },

  /** Returns sanitized registry size and lifecycle counters. */
  diagnostics: async function (request) {
    SERVICE.DefaultBackofficeAdministrativeSecurityService.validate(request);
    await this.expireStale();
    let activeModuleLeases = await this.getStore().size();
    let repository = SERVICE.DefaultBackofficeContractRepositoryService;
    let runtimeRegistry = await this.buildRuntimeRegistrySnapshot();
    let data = {
      activeModuleLeases: activeModuleLeases,
      activeInstances: activeModuleLeases,
      metrics: Object.assign({}, this._metrics),
      runtimeRegistry: {
        ownerCount: runtimeRegistry.ownerCount,
        generatedAt: runtimeRegistry.generatedAt,
      },
      store: this.getStore().diagnostics(),
      discovery: SERVICE.DefaultBackofficeDiscoveryService
        ? SERVICE.DefaultBackofficeDiscoveryService.getDiagnostics()
        : undefined,
      availability: SERVICE.DefaultBackofficeAvailabilityService
        ? SERVICE.DefaultBackofficeAvailabilityService.getDiagnostics()
        : undefined,
      security: SERVICE.DefaultBackofficeAdministrativeSecurityService
        .getDiagnostics
        ? SERVICE.DefaultBackofficeAdministrativeSecurityService.getDiagnostics()
        : undefined,
      contracts:
        repository && typeof repository.getOperationalDiagnostics === "function"
          ? await repository.getOperationalDiagnostics(request)
          : undefined,
    };
    if (SERVICE.DefaultBackofficeOperationalReadinessService) {
      data.operations =
        SERVICE.DefaultBackofficeOperationalReadinessService.assess(data);
      await SERVICE.DefaultBackofficeOperationalReadinessService.publishAssessment(
        data.operations,
      );
    }
    return { code: "SUC_BOF_00003", data: data };
  },

  /** Projects only configured fields approved for BackOffice clients. */
  projectClientSafe: function (instance) {
    let result = {};
    (this.getConfiguration().clientSafeMetadata || []).forEach((name) => {
      if (instance[name] !== undefined) result[name] = instance[name];
    });
    if (result.endpoint) result.endpoint = this.clientEndpoint(instance);
    return result;
  },

  /** Replaces only a configured browser-facing origin while retaining the registered module path. */
  clientEndpoint: function (instance) {
    let configured = (this.getConfiguration().clientEndpoints || {})[instance.server];
    if (!configured) return instance.endpoint;
    let registered = new URL(instance.endpoint);
    let browser = new URL(configured);
    if (!['http:', 'https:'].includes(browser.protocol) || browser.username || browser.password ||
        browser.search || browser.hash || browser.pathname !== '/') {
      throw new CLASSES.NodicsError('ERR_BOF_00000', 'Configured browser endpoint is invalid');
    }
    browser.pathname = registered.pathname;
    return browser.toString().replace(/\/$/, '');
  },

  /** Removes every lease whose bounded expiry time has elapsed. */
  expireStale: async function () {
    let now = Date.now();
    let entries = await this.getStore().values();
    let expired = 0;
    let affectedProjects = new Set();
    await Promise.all(
      entries.map(async (entry) => {
        let instance = entry.value;
        if (instance.expiresAt <= now) {
          let removed = await this.getStore().deleteIfExpiresAt(
            entry.key,
            instance.expiresAt,
          );
          if (removed) {
            if (instance.projectCode) affectedProjects.add(instance.projectCode);
            this._metrics.expirations++;
            expired++;
          }
        }
      }),
    );
    if (expired > 0)
      await this.audit({
        eventType: "backoffice.registry.expiry",
        outcome: "expired",
        moduleCount: expired,
      });
    let remaining = await this.getStore().values();
    if (expired > 0 && SERVICE.DefaultFunctionalModuleCatalogueService &&
      SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases) {
      await SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases(
        remaining.map(entry => entry.value), Array.from(affectedProjects), {});
    }
    if (expired > 0) await this.refreshRuntimeRegistrySnapshot(remaining.map(entry => entry.value));
    let availabilityRemoved = 0;
    let discoveryRemoved = 0;
    if (
      SERVICE.DefaultBackofficeAvailabilityService &&
      SERVICE.DefaultBackofficeAvailabilityService.reconcileActiveInstances
    ) {
      availabilityRemoved =
        SERVICE.DefaultBackofficeAvailabilityService.reconcileActiveInstances(
          remaining.map((entry) => entry.value.instanceId),
        );
    }
    if (
      SERVICE.DefaultBackofficeDiscoveryService &&
      SERVICE.DefaultBackofficeDiscoveryService.reconcileActiveModules
    ) {
      discoveryRemoved =
        SERVICE.DefaultBackofficeDiscoveryService.reconcileActiveModules(
          remaining.map((entry) => entry.value.moduleName),
        );
    }
    if (availabilityRemoved + discoveryRemoved > 0)
      await this.audit({
        eventType: "backoffice.registry.reconciliation",
        outcome: "reconciled",
        moduleCount: discoveryRemoved,
        operation: "ephemeralCleanup",
      });
    return expired;
  },

  /** Starts the single unreferenced background lease expiry timer. */
  startSweeper: function () {
    if (this._sweepTimer) return this._sweepTimer;
    let interval = Number(this.getConfiguration().sweepIntervalMs || 5000);
    this._sweepTimer = setInterval(
      () =>
        this.expireStale().catch((error) => {
          if (this.LOG && this.LOG.error)
            this.LOG.error("BackOffice registry lease sweep failed", error);
        }),
      interval,
    );
    if (this._sweepTimer.unref) this._sweepTimer.unref();
    return this._sweepTimer;
  },

  /** Stops lease expiry scheduling during shutdown. */
  stopSweeper: function () {
    if (this._sweepTimer) clearInterval(this._sweepTimer);
    this._sweepTimer = null;
    return Promise.resolve(true);
  },
};
