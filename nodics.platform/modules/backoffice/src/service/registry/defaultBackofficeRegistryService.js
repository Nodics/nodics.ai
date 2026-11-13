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
const registrationOwnership = require("../../../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService");
// Only locally constructed batch child requests share source discovery; wire fields cannot select it.
const registrationOwnershipSources = new WeakMap();
const readinessWork = require("../../utils/applicationReadinessWork");
const { performance } = require("node:perf_hooks");
const bootstrapTimingPhases = new Set([
  "registry", "catalogueEligibility", "documentation", "axisPolicy",
  "applicationStatus", "operationalReadiness", "baselineAdmission",
  "operational.imports", "operational.media", "operational.acceptance", "operational.assistant",
]);

/** Measures one operation with numeric counters only; returns or throws its original outcome without retaining inputs, results or errors. */
function measureOwnerPhase(phases, phase, operation) {
  const metric = phases[phase] ||= { active: 0, completed: 0, rejected: 0,
    lastDurationMs: 0, maxDurationMs: 0, totalDurationMs: 0 };
  const started = performance.now();
  metric.active++;
  const finish = (rejected) => {
    const elapsed = Math.max(0, Math.round(performance.now() - started));
    metric.active--;
    metric.completed++;
    if (rejected) metric.rejected++;
    metric.lastDurationMs = elapsed;
    metric.maxDurationMs = Math.max(metric.maxDurationMs, elapsed);
    metric.totalDurationMs += elapsed;
  };
  let result;
  try { result = operation(); } catch (error) { finish(true); throw error; }
  return Promise.resolve(result).then(value => { finish(false); return value; },
    error => { finish(true); throw error; });
}

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

  /** Fences the original observed lifecycle, never a silently refreshed decision. */
  assertNavigationCompositionPrecondition: function (request, state, checksum, draft) {
    const body = request && (request.body || request.data || request.payload) || {};
    if (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 0 ||
        body.expectedVersion !== state.version ||
        typeof body.expectedChecksum !== 'string' || !/^[a-f0-9]{64}$/.test(body.expectedChecksum) ||
        body.expectedChecksum !== checksum ||
        (draft && body.expectedDraftId !== draft.draftId)) {
      throw new CLASSES.NodicsError('ERR_BOF_00000',
        'Navigation composition precondition failed. Refresh and review the current owner state before another decision.');
    }
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
    const resolveOwnershipSource = registrationOwnershipSources.get(request) || registrationOwnership.createOwnershipSourceResolver();
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
    const scope = request.authData.runtimeScope;
    request._projectCode = scope.projectCode;
    request._runtimeCoordinates = {
      ...request._runtimeCoordinates,
      environment: scope.environmentCode,
      server: scope.serverCode
    };
    let key = JSON.stringify([scope.projectCode, scope.environmentCode, scope.serverCode, registration.moduleName, registration.instanceId]);
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
    try {
      const source = resolveOwnershipSource(observed.moduleName);
      const owner = registrationOwnership.isOwningRegistration(observed, source);
      if (owner) {
        try { registrationOwnership.getModuleOwnershipKey(observed, observed, source); }
        catch (error) { error.reasonCode = "OWNERSHIP_CONTEXT_INVALID"; throw error; }
      }
      await store.set(key, observed, leaseTtlMs, owner
        ? entries => this.assertAuthorityClaimsAvailable(observed, entries, resolveOwnershipSource)
        : undefined);
    } catch (error) {
      if (!error.reasonCode) throw error;
      this._metrics.rejected++;
      await this.audit({ eventType: "backoffice.registry.registration", outcome: "rejected",
        reasonCode: error.reasonCode,
        moduleName: observed.moduleName, instanceId: observed.instanceId });
      throw new CLASSES.NodicsError("ERR_BOF_00000", error.message);
    }
    if (SERVICE.DefaultBackofficeDiscoveryService)
      SERVICE.DefaultBackofficeDiscoveryService.scheduleDiscovery(
        observed,
        request.authData,
      );
    if (SERVICE.DefaultBackofficeAvailabilityService)
      SERVICE.DefaultBackofficeAvailabilityService.scheduleObservation(
        observed,
      );
    if (request._batchRegistration !== true)
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

  /** Bounds the lifetime of replicated business activation decisions. */
  getOperationalStateTtlMs: function () {
    const ttl = this.getConfiguration().operationalStateTtlMs;
    if (!Number.isSafeInteger(ttl) || ttl < 1000 || ttl > 60000) throw new Error('Registry operational state TTL must be between 1000 and 60000 milliseconds');
    return ttl;
  },

  /** Measures fixed owner phases without retaining requests, identities, results or errors. */
  measureRegistrationPhase: function (phase, operation) {
    return measureOwnerPhase(this._metrics.registrationTiming ||= {}, phase, operation);
  },

  /** Measures fixed readiness phases for secured diagnostics; unsupported labels execute unmeasured and never become metric keys. */
  measureBootstrapPhase: function (phase, operation) {
    if (!bootstrapTimingPhases.has(phase)) return operation();
    return measureOwnerPhase(this._metrics.bootstrapTiming ||= {}, phase, operation);
  },

  /** Registers one bounded runtime-instance batch while preserving per-module leases. */
  registerBatch: function (batch, authData) {
    if (!this.validateServiceIdentity({ authData }, batch)) {
      this._metrics.rejected++;
      return Promise.reject(new CLASSES.NodicsError('ERR_BOF_00000', 'Runtime registration exceeds approved deployment scope'));
    }
    const operationalStateTtlMs = this.getOperationalStateTtlMs();
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
    // One lazy source snapshot per validated batch, not a process-wide metadata cache.
    const resolveOwnershipSource = registrationOwnership.createOwnershipSourceResolver();
    let snapshotRefreshed = false;
    return this.measureRegistrationPhase("batch", () => this.measureRegistrationPhase("leases", () => Promise.allSettled(
      registrations.map((item) => {
        const request = {
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
        };
        registrationOwnershipSources.set(request, resolveOwnershipSource);
        return Promise.resolve().then(() => this.register(request))
          .finally(() => registrationOwnershipSources.delete(request));
      }),
    )).then(async (settled) => {
      // Wait for late sibling writes before publishing even a partial batch.
      let failure = settled.find(result => result.status === "rejected");
      if (failure) throw failure.reason;
      let results = settled.map(result => result.value);
      let functionalModules = await this.measureRegistrationPhase("catalogue", () =>
        SERVICE.DefaultFunctionalModuleCatalogueService.reconcileRuntimeBatch(batch, authData));
      let catalogueSnapshotAt;
      let activeEntries = await this.measureRegistrationPhase("snapshot", async () => {
        catalogueSnapshotAt = Date.now();
        const entries = await this.getStore().values();
        // Publish before yielding to timing or catalogue continuations.
        await this.refreshRuntimeRegistrySnapshot(entries.map(entry => entry.value));
        return entries;
      });
      snapshotRefreshed = true;
      await this.measureRegistrationPhase("activeCatalogue", () =>
        SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases(
          activeEntries.map(entry => entry.value), [batch.project], { authData: authData },
          { completeSnapshot: this.getStore().isDistributed?.() === true, snapshotAt: catalogueSnapshotAt }));
      return this.measureRegistrationPhase("audit", () => this.audit({
        eventType: "backoffice.registry.registration",
        outcome: outcomes.every((outcome) => outcome === "renewed")
          ? "renewed"
          : outcomes.every((outcome) => outcome === "registered")
            ? "registered"
            : "reconciled",
        instanceId: batch.instanceId,
        moduleCount: results.length,
      })).then(() => ({
        code: "SUC_BOF_00000",
        data: {
          instanceId: batch.instanceId,
          registeredModules: results.length,
          reconciledFunctionalModules: functionalModules.length,
          operationalState: {
            instanceId: authData.runtimeScope.instanceCode,
            projectCode: authData.runtimeScope.projectCode,
            expiresAt: Date.now() + operationalStateTtlMs,
            modules: registrations.map(item => {
              const record = functionalModules.find(value => value.functionalModule === functionalModuleIndex[item.moduleName]);
              return { moduleName: item.moduleName, enabled: Boolean(record && record.registrationState === 'REGISTERED' && record.enabled === true),
                catalogueRevision: record ? Number(record.catalogueRevision || 0) : 0 };
            })
          },
        },
      }));
    }).catch(async (error) => {
      if (!snapshotRefreshed) {
        try {
          await this.refreshRuntimeRegistrySnapshot();
        } catch (refreshError) {
          throw new AggregateError([error, refreshError], "Runtime registration and snapshot refresh failed");
        }
      }
      throw error;
    }));
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

  /** Identifies the signed logical server, independent of role labels and replica IDs. */
  getLogicalRuntimeAuthorityKey: function (instance) {
    return JSON.stringify([instance.projectCode, instance.environment, instance.server]);
  },

  /** Pure admission check over the store's atomic snapshot; no scan-then-write path. */
  assertAuthorityClaimsAvailable: function (candidate, entries, resolveOwnershipSource = registrationOwnership.createOwnershipSourceResolver()) {
    const candidateSource = resolveOwnershipSource(candidate.moduleName);
    const ownerKey = registrationOwnership.getModuleOwnershipKey(candidate, candidate, candidateSource);
    const candidateAuthority = this.getLogicalRuntimeAuthorityKey(candidate);
    if (!candidate.server) throw new Error("Module ownership requires an explicit logical server");
    for (const entry of entries) {
      const existing = entry.value;
      if (existing.expiresAt <= Date.now()) continue;
      if (existing.projectCode !== candidate.projectCode || existing.environment !== candidate.environment) continue;
      // Claim contexts name semantic authorities, not physical storage. The publication
      // coordinate scopes schema/service claims just as it scopes the module owner.
      if (existing.runtimeRole?.publication !== candidate.runtimeRole?.publication) continue;
      if (this.getLogicalRuntimeAuthorityKey(existing) === candidateAuthority) continue;
      // Do not exempt the candidate storage key: a reused instance ID cannot steal a live owner.
      const existingSource = resolveOwnershipSource(existing.moduleName);
      if (registrationOwnership.isOwningRegistration(existing, existingSource) &&
          registrationOwnership.getModuleOwnershipKey(existing, existing, existingSource) === ownerKey) {
        const error = new Error("Duplicate functional module owner: " + ownerKey);
        error.reasonCode = "DUPLICATE_MODULE_OWNER";
        throw error;
      }
      // Local mechanical schemas are namespaced by the logical runtime, not shared
      // functional authorities. Only trusted installed metadata grants this scope.
      if (existing.moduleName === candidate.moduleName &&
          registrationOwnership.getModuleOwnershipScope(candidate.moduleName, candidateSource) === "runtimeLocal") continue;
      const duplicate = (candidate.authorityClaims || []).find(claim =>
        (existing.authorityClaims || []).some(previous => previous.authorityKey === claim.authorityKey));
      if (duplicate) {
        const error = new Error("Duplicate runtime authority claim: " + duplicate.authorityKey);
        error.reasonCode = "DUPLICATE_AUTHORITY_CLAIM";
        throw error;
      }
    }
    return true;
  },

  /** Validates that a service token is bound to the runtime instance and every declared module. */
  validateServiceIdentity: function (request, registration) {
    let authData = request.authData || {};
    let registrations = registration.registrations || [registration];
    let instanceId =
      registration.instanceId ||
      (registrations[0] && registrations[0].instanceId);
    const scope = authData.runtimeScope;
    const coordinates = request._runtimeCoordinates || {};
    return Boolean(
      authData.tokenType === "service" && scope && scope.assignmentCode &&
      authData.runtimeInstanceId === instanceId && scope.instanceCode === instanceId &&
      (registration.project || request._projectCode || scope.projectCode) === scope.projectCode &&
      (registration.environment || coordinates.environment || scope.environmentCode) === scope.environmentCode &&
      (registration.server || coordinates.server || scope.serverCode) === scope.serverCode &&
      Array.isArray(authData.modules) &&
      registrations.every(item => item.instanceId === instanceId && authData.modules.includes(item.moduleName))
    );
  },

  /** Removes matching observed leases during graceful process drain. */
  deregister: async function (request) {
    let instanceId =
      this.getRequestParams(request).instanceId || request.instanceId;
    let moduleName =
      (request.body && request.body.moduleName) || request.moduleName;
    if (
      !request.authData || request.authData.tokenType !== "service" ||
      !request.authData.runtimeScope || request.authData.runtimeScope.instanceCode !== instanceId ||
      request.authData.runtimeInstanceId !== instanceId ||
      (moduleName && !(request.authData.modules || []).includes(moduleName))
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
    const removedLeases = [];
    let affectedProjects = new Set();
    let entries = await this.getStore().values();
    await Promise.all(
      entries.map(async (entry) => {
        let value = entry.value;
        if (
          value.instanceId === instanceId &&
          value.projectCode === request.authData.runtimeScope.projectCode &&
          value.environment === request.authData.runtimeScope.environmentCode &&
          value.server === request.authData.runtimeScope.serverCode &&
          (request.authData.modules || []).includes(value.moduleName) &&
          (!moduleName || value.moduleName === moduleName)
        ) {
          if (value.projectCode) affectedProjects.add(value.projectCode);
          await this.getStore().delete(entry.key);
          removedLeases.push(value);
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
      const snapshotAt = Date.now();
      let remaining = await this.getStore().values();
      await SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases(
        remaining.map(entry => entry.value), Array.from(affectedProjects), { authData: request.authData },
        { completeSnapshot: this.getStore().isDistributed?.() === true, removedLeases, snapshotAt });
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

  /** Reads authorized live navigation evidence without expiring leases, auditing, or preparing applications. */
  readNavigationRecoveryContext: async function (request) {
    const modules = {};
    const now = Date.now();
    for (const entry of await this.getStore().values()) {
      const instance = entry.value;
      if (
        !instance ||
        !Number.isFinite(instance.expiresAt) ||
        instance.expiresAt <= now ||
        !this.isClientDiscoverable(instance) ||
        !this.isModuleAuthorized(
          instance.moduleName,
          request && request.authData,
          instance,
        )
      )
        continue;
      const availabilityOwner = SERVICE.DefaultBackofficeAvailabilityService;
      const observation =
        availabilityOwner &&
        availabilityOwner.getInstanceAvailability(instance.instanceId);
      if (
        !observation ||
        observation.freshness !== "FRESH" ||
        !["UP", "DEGRADED"].includes(observation.state)
      )
        continue;
      (modules[instance.moduleName] ||= []).push(
        Object.assign(this.projectClientSafe(instance), {
          state: observation.state,
        }),
      );
    }
    const eligibilityOwner = SERVICE.DefaultFunctionalModuleCatalogueService;
    if (
      !eligibilityOwner ||
      typeof eligibilityOwner.getPresentationEligibility !== "function"
    )
      throw new Error("Functional presentation eligibility is unavailable");
    const eligibility =
      await eligibilityOwner.getPresentationEligibility(request);
    const effectiveModules =
      SERVICE.DefaultBackofficeCapabilityRegistryService.applyFunctionalModuleEligibility(
        modules,
        eligibility,
      );
    const catalogue = this.buildCatalogue(
      effectiveModules,
      this.getClientContractVersion(request),
      request && request.authData,
    );
    const availability = this.buildAvailability(effectiveModules);
    const composition = this.buildEffectiveNavigationComposition(
      catalogue,
      availability,
      request && request.authData,
      request,
    );
    return {
      modules: effectiveModules,
      navigation: composition.navigation || [],
    };
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
    const resolver = SERVICE.DefaultRuntimeRegistryResolverService ||
      require("../../../../../../nodics.foundation/modules/nService/src/service/module/defaultRuntimeRegistryResolverService");
    return resolver.resolveFromOwners(options, leases);
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

  /** Projects optional reader links from visible documentation profiles without scheduling installation or readiness work. */
  documentationReaderSources: function (registered, profiles, catalogue) {
    const sourceId = this.getConfiguration().documentationReaderSource;
    const base = registered.find(source => source.id === sourceId && source.type === "CMS");
    const configured = base && profiles.length ? (CONFIG.get("backofficeApplicationInitialization") || {}).profiles || {} : {};
    const declared = Object.values(catalogue).flatMap(module => module.documentation || []);
    const boundProfiles = new Set(declared.map(source => source.initializationProfile));
    const ids = new Set(declared.map(source => source.id));
    const routes = new Set(declared.map(source => source.route));
    const sources = registered.slice();
    for (const profile of profiles) {
      const reader = configured[profile.code]?.reader;
      if (profile.type !== "DOCUMENTATION_BUNDLE" || !reader || !profile.contentPackCode ||
          boundProfiles.has(profile.code) || ids.has(profile.code) || routes.has(reader.route)) continue;
      const source = {
        id: profile.code, label: profile.title, guide: reader.guide ?? "framework",
        type: "CMS", route: reader.route, defaultPage: reader.route, order: profile.order,
        connectionModule: base.connectionModule, catalog: base.catalog, site: profile.siteCode,
        initializationProfile: profile.code, packCode: profile.contentPackCode,
        dashboard: { summary: profile.summary }
      };
      for (const key of ["projectId", "projectLabel", "channelId", "channelLabel", "articleRoutes", "channelReferences"]) {
        if (reader[key] !== undefined) source[key] = reader[key];
      }
      if (!SERVICE.DefaultBackofficeContractService.validateDocumentation([source])) continue;
      ids.add(source.id);
      routes.add(source.route);
      sources.push(Object.assign(source, { ownerModule: base.ownerModule }));
    }
    const sharedIds = new Set(sources.filter(source => source.guide === "axis" || source.guide === "framework").map(source => source.id));
    return sources.map(source => source.channelReferences ? {
      ...source,
      channelReferences: source.channelReferences.filter(ref => sharedIds.has(ref.sourceId))
    } : source).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  },

  /**
   * Resolves feature availability from existing owner/target metadata.
   * @param {Object} item Authorized module-owned navigation item.
   * @param {string} moduleName Publishing module identity.
   * @param {Object} availability Current authorized readiness projection.
   * @returns {Object} Non-mutating projection with unavailable targets/actions disabled.
   * @override Later layers may narrow usability, but must preserve owner eligibility and target authorization.
   */
  applyNavigationAvailability: function (item, moduleName, availability) {
    let target = item.workbenchTarget && item.workbenchTarget.moduleName;
    let owners = Array.from(new Set([moduleName, target].filter(Boolean)));
    let usable = owner => ["UP", "DEGRADED"].includes((availability[owner] || {}).state);
    let missing = owners.find(owner => !usable(owner));
    let next = Object.assign({}, item, {
      availability: missing ? (availability[missing] || {}).state || "UNKNOWN" :
        owners.some(owner => availability[owner].state === "DEGRADED") ? "DEGRADED" : "UP",
    });
    if (missing && next.featureState !== "HIDDEN") {
      next.featureState = "DISABLED";
      next.help = Object.assign({}, next.help, {
        summary: "This functionality requires an available, activated " + missing + " module.",
      });
    }
    if (Array.isArray(next.lifecycleActions)) {
      next.lifecycleActions = next.lifecycleActions.map(action => {
        let owner = action.ownerModule || target || moduleName;
        if ((!missing && usable(owner)) || action.featureState === "HIDDEN") return action;
        return Object.assign({}, action, { featureState: "DISABLED",
          summary: "This operation requires an available, activated " + (missing || owner) + " module." });
      });
    }
    return next;
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
    let moduleDefaultsByIdentity = {};
    items.forEach((item) => {
      moduleDefaultsByIdentity[item.moduleName + ":" + item.id] = item;
    });
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
      items = (published.navigation || []).map((item, index) => {
        let identity = String(item.moduleName || "backoffice") + ":" + String(item.id || "");
        let moduleDefault = moduleDefaultsByIdentity[identity];
        let nextItem = Object.assign({}, item, {
          order: Number.isInteger(item.order) ? item.order : index,
          sourceTrace: Object.assign({
            sourceType: "governedOverride",
            ownerModule: item.moduleName || "backoffice",
            stableIdentity: identity,
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
        });
        ["backendWorkspace", "workbenchTarget", "lifecycleActions"].forEach(key => {
          if (nextItem[key] === undefined && moduleDefault && moduleDefault[key] !== undefined) {
            nextItem[key] = this.cloneNavigationComposition(moduleDefault[key]);
          }
        });
        return this.applyDocumentationPublicationState(nextItem, documentationPublication);
      });
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
    // Published presentation cannot override current runtime availability or provider permissions.
    items = items.filter(item => {
      let source = moduleDefaultsByIdentity[String(item.moduleName || "backoffice") + ":" + String(item.id || "")];
      if (!source) return false;
      let permissions = (authData && authData.permissions) || [];
      let required = [].concat(item.requiredPermissions || [], source && source.requiredPermissions || []);
      return permissions.includes("*") || required.every(permission => permissions.includes(permission));
    }).map(item => this.applyNavigationAvailability(item, item.moduleName || "backoffice", availability || {}));
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
    let route = String(item.route || "");
    if (
      item.id === "documentation" ||
      item.id === "documentation-dashboard" ||
      item.id === "documentation-management" ||
      // Authoring must be available before the first Online publication.
      // These owner-declared views retain their original permission and state.
      (item.moduleName === "backoffice" &&
        item.parentId === "documentation-management" &&
        item.workbenchTarget?.moduleName === "cms" &&
        route.startsWith("/docs/designer/"))
    ) return item;
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
  buildDocumentationPublicationState: async function (sources, request, readStatus) {
    let result = { byRoute: {}, bySourceId: {} };
    let service = SERVICE.DefaultBackofficeApplicationInitializationService;
    if (!service || typeof service.status !== "function") return result;
    let cmsSources = [].concat(sources || []).filter(source =>
      source && source.type === "CMS" && source.initializationProfile && source.route);
    await Promise.all(cmsSources.map(async source => {
      try {
        let status = await (readStatus
          ? readStatus(source.initializationProfile)
          : service.status(source.initializationProfile, request));
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

  /** Coalesces reads only inside one authenticated composition; no cross-request authority or freshness cache. */
  applicationStatusReader: function (request) {
    const results = new Map();
    const schedule = readinessWork.queue();
    readinessWork.composition(request);
    return (profileCode) => {
      if (!results.has(profileCode)) {
        results.set(profileCode, schedule(() =>
          SERVICE.DefaultBackofficeApplicationInitializationService.status(profileCode, request)));
      }
      return results.get(profileCode);
    };
  },

  /** Settles profile reads under owner worker policy, preserving input-relative result/error order and request-local reuse. */
  applicationStatusReport: async function (profiles, readStatus) {
    const pending = (profiles || []).filter(profile => profile && profile.code);
    const outcomes = new Array(pending.length);
    let cursor = 0;
    const workers = readinessWork.workers();
    await Promise.all(Array.from({ length: Math.min(workers, pending.length) }, async () => {
      while (cursor < pending.length) {
        const index = cursor++;
        const profile = pending[index];
        try {
          outcomes[index] = { fulfilled: true, status: await readStatus(String(profile.code)) };
        } catch (error) {
          outcomes[index] = { fulfilled: false, profile, error };
        }
      }
    }));
    const report = { statuses: [], errors: [] };
    for (const outcome of outcomes) {
      if (outcome.fulfilled) report.statuses.push(outcome.status);
      else report.errors.push({ profile: outcome.profile, error: outcome.error });
    }
    return report;
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
        const discovery = SERVICE.DefaultBackofficeDiscoveryService;
        const discoveryRegistration = discovery && instances.find(item => discovery.isDiscoveryEligible(item));
        if (discoveryRegistration)
          await discovery.discover(
            discoveryRegistration,
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
            discoveryRequested: Boolean(discoveryRegistration),
          },
        };
      },
    );
  },

  /** Returns the authorized module catalogue and compatibility metadata required to bootstrap a BackOffice client. */
  /** Reads only baseline admission for bootstrap users without detailed setup rights; never initiates or returns publication history. */
  axisInitializationAdmission: async function (request) {
    const permissions = request?.authData?.permissions || [];
    if (permissions.includes("*") || permissions.includes("backoffice.axis.initialization.view")) return undefined;
    try {
      const owner = SERVICE.DefaultAxisInitializationService;
      if (!owner || typeof owner.status !== "function") return "UNAVAILABLE";
      const status = await owner.status(request);
      if (!status || typeof status.readiness !== "string") return "UNAVAILABLE";
      return status.readiness === "READY" ? "READY" : "NOT_READY";
    } catch (_) {
      return "UNAVAILABLE";
    }
  },

  /** Validates the optional diagnostic projection before any read. It cannot suppress documentation, policy, eligibility or baseline admission. */
  includeOperationalReadiness: function (request) {
    const query = request && (request.query || request.httpRequest?.query) || {};
    const value = query.includeOperationalReadiness;
    if (value === undefined || value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    throw new CLASSES.NodicsError("ERR_BOF_00000", "includeOperationalReadiness must be a boolean");
  },

  /** An explicit client view reduces duplicate transport only; every owner admission still runs. */
  bootstrapProjection: function (request) {
    const query = request && (request.query || request.httpRequest?.query) || {};
    if (query.projection === undefined) return undefined;
    if (query.projection === "axis-client-v1") return query.projection;
    throw new CLASSES.NodicsError("ERR_BOF_00000", "Unsupported bootstrap projection");
  },

  /** Projects only after authorization and composition; never mutates leases or caches actor proof. */
  projectAxisBootstrap: function (data) {
    if (!Array.isArray(data.effectiveNavigationComposition?.navigation))
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Axis navigation projection is unavailable");
    const fields = ["displayName", "parentModule", "canonicalIdentity", "moduleKind", "environment",
      "clientCallable", "endpoint", "server", "runtimeRole", "instanceId", "state"];
    const modules = Object.fromEntries(Object.entries(data.modules).map(([name, instances]) => [name,
      instances.map(instance => Object.fromEntries(fields.filter(key => instance[key] !== undefined)
        .map(key => [key, instance[key]])))]));
    const { catalogue, ...retained } = data;
    return { ...retained, modules, projection: "axis-client-v1" };
  },

  /** Builds the permission-filtered Axis bootstrap from current registry and presentation eligibility. @param {Object} request Authenticated client contract and runtime scope. @returns {Promise<Object>} Authorized catalogue, availability and initialization summary. */
  bootstrap: async function (request) {
    const includeOperationalReadiness = this.includeOperationalReadiness(request);
    const projection = this.bootstrapProjection(request);
    let clientContractVersion = this.getClientContractVersion(request);
    let result = await this.measureBootstrapPhase("registry", () => this.list(request));
    let eligibility = SERVICE.DefaultFunctionalModuleCatalogueService &&
      typeof SERVICE.DefaultFunctionalModuleCatalogueService.getPresentationEligibility === "function"
      ? await this.measureBootstrapPhase("catalogueEligibility", () =>
        SERVICE.DefaultFunctionalModuleCatalogueService.getPresentationEligibility(request))
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
    const readApplicationStatus = this.applicationStatusReader(request);
    let documentationPublication = await this.measureBootstrapPhase("documentation", () => this.buildDocumentationPublicationState(
      documentationSources,
      request,
      readApplicationStatus,
    ));
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
      ? await this.measureBootstrapPhase("axisPolicy", () => SERVICE.DefaultAxisExperiencePolicyService.getEffective(request))
      : undefined;
    if (!axisPolicy)
      throw new CLASSES.NodicsError(
        "ERR_BOF_00000",
        "Axis employee policy is unavailable",
      );
    let startupValidation = SERVICE.DefaultBackofficeOperationalReadinessService &&
      typeof SERVICE.DefaultBackofficeOperationalReadinessService.startupValidationWithEvidence === "function"
      ? await SERVICE.DefaultBackofficeOperationalReadinessService.startupValidationWithEvidence(request)
      : {
          state: "READY",
          checkedAt: new Date().toISOString(),
          source: "backoffice.operationalReadiness",
          summary: { total: 0, errors: 0, warnings: 0, info: 0, dismissible: 0, acknowledged: 0 },
          bootstrapChecks: { total: 0, ready: 0, missing: 0, needsAttention: 0, checks: [] },
          findings: [],
        };
    let applicationInitializationProfiles = SERVICE.DefaultBackofficeApplicationInitializationService &&
      typeof SERVICE.DefaultBackofficeApplicationInitializationService.profiles === "function"
      ? SERVICE.DefaultBackofficeApplicationInitializationService.profiles(request)
      : [];
    let operationalReadiness;
    const operationalReadinessAvailable = Boolean(SERVICE.DefaultBackofficeOperationalReadinessService &&
      typeof SERVICE.DefaultBackofficeOperationalReadinessService.operationalReadinessReport === "function");
    if (includeOperationalReadiness && operationalReadinessAvailable) {
      const applicationProfileStatusReport = await this.measureBootstrapPhase("applicationStatus", () =>
        this.applicationStatusReport(applicationInitializationProfiles, readApplicationStatus));
      operationalReadiness = await this.measureBootstrapPhase("operationalReadiness", () =>
        SERVICE.DefaultBackofficeOperationalReadinessService.operationalReadinessReport(request, {
          startupValidation: startupValidation,
          modules: effectiveModules,
          availability: availability,
          documentationSources: documentationSources,
          documentationPublication: documentationPublication,
          applicationInitializationProfiles: applicationInitializationProfiles,
          applicationProfileStatusReport,
        }));
    }
    const response = {
      code: "SUC_BOF_00004",
      data: {
        compatibility: Object.assign({}, configured, {
          clientContractVersion: clientContractVersion,
          status: status,
        }),
        modules: effectiveModules,
        catalogue: catalogue,
        availability: availability,
        operationalReadiness: operationalReadiness,
        ...(!includeOperationalReadiness && operationalReadinessAvailable
          ? { operationalReadinessObservation: { contractVersion: 1, mode: "ON_DEMAND",
              ...(SERVICE.DefaultBackofficeReadinessEvidenceService?.presentation
                ? { presentation: SERVICE.DefaultBackofficeReadinessEvidenceService.presentation() } : {}) } } : {}),
        effectiveNavigationComposition: effectiveNavigationComposition,
        uiComposition: this.selectUiComposition(catalogue, availability),
        applicationInitializationProfiles: applicationInitializationProfiles,
        applicationReadinessScheduling: readinessWork.browserPolicy(),
        documentationSources: this.documentationReaderSources(documentationSources, applicationInitializationProfiles, catalogue),
        axisPolicy: axisPolicy,
        startupValidation: startupValidation,
        axisInitializationAdmission: await this.measureBootstrapPhase("baselineAdmission", () => this.axisInitializationAdmission(request)),
        tenantCode: request.tenant,
      },
    };
    if (projection) response.data = this.projectAxisBootstrap(response.data);
    return response;
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
        availableOperations: this.navigationCompositionAllowedOperations(request),
        blockedOperations: ["effective", "preview", "export", "importValidate", "createDraft", "submit", "approve", "publish", "rollback"].filter(operation => !this.navigationCompositionAllowedOperations(request).includes(operation)),
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

  /** Projects existing prepared-route permissions; this hint grants no execution authority. */
  navigationCompositionAllowedOperations: function (request) {
    const operations = { effective: 'effectiveNavigationComposition', preview: 'previewNavigationComposition',
      export: 'getNavigationCompositionSnapshot', importValidate: 'validateNavigationCompositionImport',
      createDraft: 'createNavigationCompositionDraft', submit: 'submitNavigationCompositionDraft',
      approve: 'approveNavigationCompositionDraft', publish: 'publishNavigationCompositionDraft', rollback: 'rollbackNavigationComposition' };
    const routes = Object.values(typeof NODICS !== 'undefined' && NODICS.getRouters ? NODICS.getRouters('backoffice') || {} : {});
    const permissions = request?.authData?.permissions || [];
    return Object.keys(operations).filter(operation => routes.some(route =>
      route.controller === 'DefaultBackofficeRegistryController' && route.operation === operations[operation] && route.active !== false &&
      (permissions.includes('*') || [].concat(route.permission || []).every(permission => permissions.includes(permission)))));
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
      if (identities.has(identity)) {
        issues.push({ code: "DUPLICATE_IDENTITY", severity: "ERROR", item: identity, message: "Candidate composition repeats a stable navigation identity." });
      }
      identities.add(identity);
      const original = (effective.navigation || []).find(entry => entry && entry.moduleName === item.moduleName && entry.id === item.id);
      const presentationKeys = new Set(['label', 'labelKey', 'order', 'group', 'help', 'sourceTrace', 'featureState']);
      const executionMetadata = entry => this.cloneNavigationComposition(Object.fromEntries(Object.entries(entry).filter(([key]) => !presentationKeys.has(key))));
      if (!original || !require('node:util').isDeepStrictEqual(executionMetadata(item), executionMetadata(original)) ||
          (item.featureState !== original.featureState && !['HIDDEN', 'DISABLED'].includes(item.featureState))) {
        issues.push({ code: 'OWNER_CONTRACT_CHANGED', severity: 'ERROR', item: identity,
          message: 'Navigation presentation cannot add identities, change owner routing or execution metadata, or expand feature availability. Refresh the authorized owner composition.' });
      }
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
        // Current authorized module defaults may already expose grouping shortcuts.
        // Preserve only their exact identity set and execution metadata; candidate
        // labels/order are presentation. A submitted source trace grants no authority.
        let baseline = (effective.navigation || []).filter((item) => item && item.route === route);
        let baselineOwners = Array.from(new Set(baseline.map((item) => String(item.moduleName) + ":" + String(item.id))));
        let protectedFields = ["requiredPermissions", "featureState", "availability", "workbenchTarget", "backendWorkspace", "lifecycleActions", "routeOwner", "parentId", "parentModuleName"];
        let protectedMetadata = (item) => Object.fromEntries(protectedFields.map((key) => [key, item[key]]));
        let inherited = baselineOwners.length === owners.length && owners.every((owner) => baselineOwners.includes(owner)) &&
          navigation.filter((item) => item && item.route === route).every((item) => {
            let original = baseline.find((entry) => entry.moduleName === item.moduleName && entry.id === item.id);
            return original && require("node:util").isDeepStrictEqual(protectedMetadata(item), protectedMetadata(original));
          });
        if (!inherited) {
          issues.push({ code: "DUPLICATE_ROUTE", severity: "ERROR", route: route, owners: owners, message: "Candidate composition contains new or changed conflicting route ownership. Refresh and preserve the authorized owner routing and execution metadata." });
        }
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
    this.assertNavigationCompositionPrecondition(request, state, effective.data.checksum);
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
    this.assertNavigationCompositionPrecondition(request, state, state.draft && state.draft.checksum, state.draft);
    if (!state.draft || !["DRAFT", "REJECTED"].includes(state.draft.lifecycleState))
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is not submittable");
    state.draft.lifecycleState = "SUBMITTED";
    state.draft.version = ++state.version;
    state.draft.submittedAt = new Date().toISOString();
    state.draft.submittedBy = request && request.authData && request.authData.userName;
    state.updatedAt = state.draft.submittedAt;
    await this.audit({ eventType: "backoffice.navigationComposition.submit", outcome: "submitted", checksum: state.draft.checksum, version: state.draft.version });
    return { code: "SUC_BOF_00024", data: state.draft };
  },

  /** Approves a submitted navigation draft without making it effective until publish is called. */
  approveNavigationCompositionDraft: async function (request) {
    let state = this.getNavigationCompositionState(request);
    this.assertNavigationCompositionPrecondition(request, state, state.draft && state.draft.checksum, state.draft);
    if (!state.draft || state.draft.lifecycleState !== "SUBMITTED")
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is not approvable");
    state.draft.lifecycleState = "APPROVED";
    state.draft.version = ++state.version;
    state.draft.approvedAt = new Date().toISOString();
    state.draft.approvedBy = request && request.authData && request.authData.userName;
    state.updatedAt = state.draft.approvedAt;
    await this.audit({ eventType: "backoffice.navigationComposition.approve", outcome: "approved", checksum: state.draft.checksum, version: state.draft.version });
    return { code: "SUC_BOF_00025", data: state.draft };
  },

  /** Publishes the approved navigation draft to the effective composition used by Axis bootstrap. */
  publishNavigationCompositionDraft: async function (request) {
    const effective = await this.effectiveNavigationComposition(request);
    let state = this.getNavigationCompositionState(request);
    this.assertNavigationCompositionPrecondition(request, state, state.draft && state.draft.checksum, state.draft);
    if (!state.draft || state.draft.lifecycleState !== "APPROVED")
      throw new CLASSES.NodicsError("ERR_BOF_00000", "Navigation composition draft is not publishable");
    if (!this.validateNavigationCompositionCandidate(state.draft.composition, effective.data).valid)
      throw new CLASSES.NodicsError('ERR_BOF_00000', 'Navigation composition approved draft is invalid under the current owner contract');
    if (state.published) {
      state.published.lifecycleState = "SUPERSEDED";
      state.history.push(this.cloneNavigationComposition(state.published));
      state.history = state.history.slice(-20);
    } else {
      // Restore the native fallback, not a frozen copy of today's defaults.
      state.history.push({ source: 'MODULE_DEFAULTS', version: state.version,
        checksum: effective.data.checksum, lifecycleState: 'SUPERSEDED' });
    }
    state.published = Object.assign({}, this.cloneNavigationComposition(state.draft), {
      lifecycleState: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      publishedBy: request && request.authData && request.authData.userName,
      version: ++state.version,
    });
    state.draft = undefined;
    state.updatedAt = state.published.publishedAt;
    await this.audit({ eventType: "backoffice.navigationComposition.publish", outcome: "published", checksum: state.published.checksum, version: state.published.version });
    return { code: "SUC_BOF_00026", data: state.published };
  },

  /** Rolls back the effective navigation composition to the latest superseded published version. */
  rollbackNavigationComposition: async function (request) {
    const effective = await this.effectiveNavigationComposition(request);
    let state = this.getNavigationCompositionState(request);
    this.assertNavigationCompositionPrecondition(request, state, effective.data.checksum);
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
    const rolledBackAt = new Date().toISOString();
    const restoredVersion = ++state.version;
    state.published = rollbackTarget.source === 'MODULE_DEFAULTS' ? undefined : Object.assign({}, this.cloneNavigationComposition(rollbackTarget), {
      lifecycleState: "PUBLISHED",
      version: restoredVersion,
      rolledBackAt: rolledBackAt,
      rolledBackBy: request && request.authData && request.authData.userName,
    });
    state.updatedAt = rolledBackAt;
    const restored = state.published || { source: 'MODULE_DEFAULTS', lifecycleState: 'PUBLISHED',
      version: restoredVersion, checksum: (await this.effectiveNavigationComposition(request)).data.checksum, rolledBackAt };
    await this.audit({ eventType: "backoffice.navigationComposition.rollback", outcome: "rolledBack", checksum: restored.checksum, version: restored.version });
    return { code: "SUC_BOF_00027", data: restored };
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

  /** Projects only explicitly public owner observations from agreeing, current selected leases. */
  publicFeatureAvailability: function (candidates) {
    const values = candidates.map(item => item.backoffice?.publicFeatureAvailability);
    const validator = SERVICE.DefaultBackofficeContractService;
    if (!values.length || values.some(value =>
      !validator?.validatePublicFeatureAvailability(value))) return undefined;
    const first = values[0];
    if (values.some(value => Object.keys(value.features).length !== Object.keys(first.features).length ||
      Object.entries(first.features).some(([key, enabled]) => value.features[key] !== enabled))) return undefined;
    return structuredClone(first);
  },
  /** Returns public endpoints, composition and opted-in owner feature observations, never permissions or private lease data. */
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
    let moduleStates = {};
    let missingRequiredModules = [];
    let featureAvailability = {};
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
        let fallbackEndpoint = this.publicBootstrapFallbackEndpoint(selection);
        if (!fallbackEndpoint || policy.allowConfiguredEndpointFallback === false) {
          throw new CLASSES.NodicsError(
            "ERR_BOF_00000",
            "Required public bootstrap module is unavailable",
          );
        }
        endpoints[entry[0]] = fallbackEndpoint;
        moduleStates[entry[0]] = "UNOBSERVED";
        missingRequiredModules.push(entry[0]);
        if (selection.runtimeRole) endpointRoles[entry[0]] = selection.runtimeRole;
        return;
      }
      endpoints[entry[0]] = this.clientEndpoint(candidates[0]);
      const features = this.publicFeatureAvailability(candidates);
      if (features) featureAvailability[entry[0]] = features;
      moduleStates[entry[0]] = "UP";
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
        moduleStates[entry[0]] = "UP";
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
        featureAvailability: featureAvailability,
        bootstrapState: {
          state: missingRequiredModules.length ? "SETUP_REQUIRED" : "READY",
          moduleStates: moduleStates,
          missingRequiredModules: missingRequiredModules,
        },
        uiComposition: Object.assign({}, policy.uiComposition),
      },
    };
  },

  /** Derives a public bootstrap endpoint from the selected runtime server map before an observed lease exists. */
  publicBootstrapFallbackEndpoint: function (selection) {
    let router = SERVICE.DefaultRouterService;
    if (!router || typeof router.prepareUrl !== "function") return null;
    let moduleName = selection && selection.moduleName;
    if (!moduleName) return null;
    let connectionName = selection.connectionName || selection.server || moduleName;
    let endpoint = router.prepareUrl({
      moduleName: moduleName,
      connectionName: connectionName,
    });
    if (!endpoint) return null;
    try {
      let parsed = new URL(endpoint);
      if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return null;
      return parsed.toString().replace(/\/$/, "");
    } catch (error) {
      return null;
    }
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
    let configured = this.getConfiguredClientEndpoint(instance.server);
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

  /** Resolves a browser-facing endpoint from owning runtime server metadata. */
  getConfiguredClientEndpoint: function (serverCode) {
    let servers = CONFIG.get("servers") || {};
    let server = servers[serverCode] || {};
    let endpoint = server.browserEndpoint;
    if (!endpoint) return null;
    if (typeof endpoint === "string") return endpoint;
    let protocol = endpoint.protocol || (endpoint.httpsPort ? "https:" : "http:");
    let host = endpoint.httpHost || endpoint.httpsHost || "localhost";
    let port = endpoint.httpPort || endpoint.httpsPort;
    if (!port) return null;
    return protocol + "//" + host + ":" + port + "/";
  },

  /** Removes every lease whose bounded expiry time has elapsed. */
  expireStale: async function () {
    let now = Date.now();
    let entries = await this.getStore().values();
    let expired = 0;
    const removedLeases = [];
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
            removedLeases.push(instance);
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
    // Publish and prune before catalogue I/O can interleave a newer registration.
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
    if (expired > 0 && SERVICE.DefaultFunctionalModuleCatalogueService &&
      SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases) {
      await SERVICE.DefaultFunctionalModuleCatalogueService.reconcileActiveRuntimeLeases(
        remaining.map(entry => entry.value), Array.from(affectedProjects), {},
        { completeSnapshot: this.getStore().isDistributed?.() === true, removedLeases, snapshotAt: now });
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
