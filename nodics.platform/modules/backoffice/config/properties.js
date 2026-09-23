/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/config/properties
 * @description Reserves layered defaults for BackOffice registry, discovery, catalogue, and bootstrap policies.
 * @layer config
 * @owner backoffice
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  tooling: {
        acceptance: {
            "capabilityRegistry": {
                "foundationModule": "nodics.foundation",
                "retiredModule": "nodics.core",
                "functionalModule": "nodics.process",
                "runtime": {
                    "role": "PROCESS"
                }
            }
        },
  },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      backoffice: {
        serviceNames: {
          DefaultBackofficeAxisPolicyService: true,
          DefaultBackofficeContractActivationService: true,
          DefaultBackofficeContractSnapshotService: true,
          DefaultBackofficeFunctionalModuleRegistrationService: true,
        },
      },
    },
  },

  backofficeApplicationInitialization: {
    target: {
      moduleName: "cms",
      connectionType: "abstract",
      runtimeRole: "WCMS_STAGED",
      timeoutMs: 120000,
      maxAttempts: 1,
    },
    profiles: {},
  },
  backofficeFunctionalModuleActivationData: {
    modules: {},
  },
  backofficeFunctionalModuleCatalogue: {
    eligibilityPageSize: 256,
  },
  schemaPolicies: {
    backoffice: {
      contractReader: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigViewerUserGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
      administrator: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
    },
  },
  backofficeAxisPolicy: {
    code: "axisEmployeeExperiencePolicy",
    contractVersion: 0,
    screenLockEnabled: true,
    idleTimeoutSeconds: 900,
    minimumIdleTimeoutSeconds: 60,
    maximumIdleTimeoutSeconds: 86400,
    recentNavigationLimit: 12,
    minimumRecentNavigationLimit: 1,
    maximumRecentNavigationLimit: 24,
  },
  backofficeLocalReset: {
    enabled: false,
    environmentAllowlist: [],
    confirmation: "RESET_LOCAL_NODICS_DATA",
    maximumTargets: 16,
    providers: [],
    providerDefaults: {
      moduleName: "system",
    },
  },
  backofficeRegistry: {
    enabled: true,
    leaseTtlMs: 30000,
    operationalStateTtlMs: 30000,
    sweepIntervalMs: 5000,
    maxModulesPerRegistration: 512,
    store: {
      mode: "memory",
      moduleName: "backoffice",
      engineName: "redis",
      keyPrefix: "registry:lease:",
    },
    modulePermissions: {},
    compatibility: {
      registryContractVersion: 1,
      minimumClientContractVersion: 0,
    },
    publicBootstrap: {
      enabled: true,
      contractVersion: 1,
      requiredModules: {
        profile: "profile",
        cms: {
          moduleName: "cms",
          server: "wcmsOnlineServer",
          runtimeRole: "ONLINE",
        },
      },
      optionalModules: {
        engagement: "engagementApi",
        editorial: {
          moduleName: "editorial",
          server: "wcmsOnlineServer",
          runtimeRole: "ONLINE",
        },
        localization: "localizationApi",
      },
      uiComposition: {
        site: "axisCmsSite",
        catalog: "axisContentCatalog",
        defaultPublicPage: "/login",
        defaultAuthenticatedPage: "/dashboard",
        locale: "en",
        supportedLocales: ["en", "ar"],
        fallbackLocales: ["en"],
        channel: "web",
        fallbackMode: "STATIC_RECOVERY_SHELL",
      },
    },
    discovery: {
      enabled: true,
      timeoutMs: 3000,
      refreshIntervalMs: 300000,
      maxResponseBytes: 5242880,
      maxPaths: 5000,
      maxOperations: 10000,
      allowRedirects: false,
      allowedHosts: [],
    },
    availability: {
      enabled: true,
      timeoutMs: 1000,
      refreshIntervalMs: 10000,
      failureRetryIntervalMs: 5000,
      maxConcurrentObservations: 32,
      maxQueuedObservations: 10000,
      failureBackoffMultiplier: 2,
      maxFailureBackoffMs: 60000,
      staleAfterMs: 30000,
      maxResponseBytes: 65536,
      allowRedirects: false,
      allowedHosts: [],
      events: {
        enabled: true,
        emitInitialState: false,
        publisherService: "DefaultEventService",
        eventName: "backoffice.availability.changed",
        target: "backoffice",
        type: "ASYNC",
      },
    },
    uiComposition: {
      enabled: true,
      providerRole: "UI_COMPOSITION_PROVIDER",
      preferredModule: null,
    },
    contractHistory: {
      enabled: true,
      historyLimit: 50,
      retentionPerModule: 25,
      diagnosticsLimit: 1000,
      automaticClassifications: ["INITIAL", "UNCHANGED", "NON_BREAKING"],
      approvalClassifications: ["POTENTIALLY_BREAKING", "BREAKING"],
    },
    audit: {
      enabled: true,
      failClosed: false,
      publisherService: null,
      requireAcknowledgement: false,
    },
    administration: {
      rejectServiceTokens: true,
      requirePrincipal: true,
      refreshWindowMs: 60000,
      refreshMaxPerWindow: 5,
      idempotencyTtlMs: 60000,
      maxIdempotencyEntries: 1000,
    },
    benchmark: {
      registrationModules: 128,
      registryLeases: 2000,
      hostedModulesPerInstance: 64,
      concurrentRefreshRequests: 32,
      maxAdminResultPage: 100,
      maxAdminStoreScans: 3,
      maxAvailabilityProbesPerInstance: 1,
      maxRefreshExecutionsPerIdempotencyKey: 1,
    },
    operations: {
      requireDistributedStore: false,
      minimumSamples: 10,
      production: {
        enabled: false,
        requireHttpsOnly: true,
        requireHostAllowlists: true,
        requireStrictAudit: true,
        requireStrictAlerts: true,
      },
      alerts: {
        enabled: false,
        failClosed: false,
        requireAcknowledgement: false,
        publisherService: null,
      },
      thresholds: {
        availabilityFailurePercent: 25,
        availabilityQueuePercent: 80,
        discoveryFailurePercent: 25,
        storeErrors: 1,
        conditionalDeleteConflicts: 10,
        refreshThrottles: 1,
      },
      startupValidation: {
        enabled: true,
        bootstrapChecks: [
          {
            code: "BOOTSTRAP_IDENTITY_PRESENT",
            owner: "nAuth",
            ownerType: "AUTHENTICATION",
            path: "bootstrapIdentity.source",
            message: "Bootstrap identity source is resolved.",
            action: "If missing after a schema reset, restart the platform runtime and verify the owning layered configuration.",
          },
          {
            code: "BOOTSTRAP_ADMIN_PASSWORD_PRESENT",
            owner: "nAuth",
            ownerType: "AUTHENTICATION",
            path: "bootstrapIdentity.adminPassword",
            message: "Bootstrap administrator password path is resolved.",
            action: "If missing after a schema reset, repair the profile init data or owning private configuration before Axis login.",
          },
          {
            code: "RUNTIME_API_KEY_PRESENT",
            owner: "nAuth",
            ownerType: "AUTHENTICATION",
            path: "defaultAuthDetail.apiKey",
            message: "Runtime API key path is resolved.",
            action: "If missing after a schema reset, repair the server-level runtime credential before runtime-to-runtime calls.",
          },
        ],
        requiredProperties: [],
        defaultValueRisks: [
          {
            code: "LOCAL_SAMPLE_BOOTSTRAP_IDENTITY",
            owner: "nAuth",
            ownerType: "AUTHENTICATION",
            path: "bootstrapIdentity.source",
            match: "SAMPLE_OR_LOCAL_STRING",
            severity: "WARNING",
            dismissible: true,
            auditRequired: true,
            message: "Local or sample bootstrap identity is active.",
            action: "Replace bootstrap identity through the owning server or external private configuration before non-local use.",
          },
          {
            code: "LOCAL_SAMPLE_ADMIN_PASSWORD",
            owner: "nAuth",
            ownerType: "AUTHENTICATION",
            path: "bootstrapIdentity.adminPassword",
            match: "SAMPLE_OR_LOCAL_STRING",
            severity: "WARNING",
            dismissible: true,
            auditRequired: true,
            message: "A local or sample bootstrap admin password is active.",
            action: "Rotate the bootstrap admin password through the owning server or external private configuration before non-local use.",
          },
          {
            code: "LOCAL_SAMPLE_RUNTIME_API_KEY",
            owner: "nAuth",
            ownerType: "AUTHENTICATION",
            path: "defaultAuthDetail.apiKey",
            match: "SAMPLE_OR_LOCAL_STRING",
            severity: "WARNING",
            dismissible: true,
            auditRequired: true,
            message: "A local or sample runtime API key is active.",
            action: "Rotate runtime API keys through server-level or external private configuration before non-local use.",
          },
        ],
      },
    },
    allowedSchemes: ["http", "https"],
    clientSafeMetadata: [
      "moduleName",
      "displayName",
      "parentModule",
      "canonicalIdentity",
      "functionalModuleIdentity",
      "instanceId",
      "environment",
      "server",
      "node",
      "version",
      "moduleKind",
      "runtimeRole",
      "capabilities",
      "clientCallable",
      "endpoint",
      "healthPath",
      "state",
      "lastSeenAt",
      "backoffice",
    ],
  },
  apiExposure: {
    categories: {
      serviceRegistry: {
        enabled: true,
      },
    },
  },
};
