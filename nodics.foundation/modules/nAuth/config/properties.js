/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nAuth/config/Properties
 * @description Defines layered authentication security, principal classification, migration controls and auth-cache defaults; persisted Profile records own permissions and grants.
 * @layer config
 * @owner nAuth
 * @override Later layers may tighten security policy; permission contributions belong in module-owned data packs, never configuration grants.
 */

module.exports = {
  bootstrapIdentity: {
    source: "environment",
    adminPassword: {
      $config: "env",
      name: "NODICS_BOOTSTRAP_ADMIN_PASSWORD",
      fallback: null,
    },
    servicePassword: {
      $config: "env",
      name: "NODICS_BOOTSTRAP_SERVICE_PASSWORD",
      fallback: null,
    },
    serviceApiKey: {
      $config: "env",
      name: "NODICS_BOOTSTRAP_SERVICE_API_KEY",
      fallback: null,
    },
  },
  defaultAuthDetail: {
    apiKey: { $config: "env", name: "NODICS_API_KEY", fallback: null },
  },
  authSecurity: {
    sessionContextValidation: {
      qualified: false,
      validatorService: "DefaultModuleSessionContextValidationService",
      requiredPrincipalTypes: [],
      localValidatorService: null,
      connectionName: null,
      remoteQualified: false,
      captureProtectionQualified: false,
      allowInsecureLoopback: false,
      timeoutMs: 5000,
      permission: "profile.sessionContext.validate",
    },
    authorizationPolicy: { enabled: false, qualified: false, version: 1 },
    jwt: {
      secret: {
        $config: "env",
        name: "NODICS_JWT_SECRET",
        fallback: null,
      },
      minimumSecretLength: 32,
      issuer: "nodics",
      audience: "nodics-services",
      algorithms: ["HS256"],
      requireJti: true,
      accessTokenExpiresIn: "3h",
      serviceTokenExpiresIn: "15m",
      serviceTokenRefreshIntervalMs: 600000,
    },
    refreshToken: {
      expiresInSeconds: 2592000,
      rotateOnUse: true,
      requireDistributedCache: true,
    },
    browserAccess: {
      enabled: false,
      accessTokenExpiresIn: "5m",
      audiencePrefix: "nodics-module:",
      moduleAudiences: {},
      moduleNamePattern: "^[A-Za-z][A-Za-z0-9_.-]{0,127}$",
      rejectServiceAndCronCredentials: true,
    },
    apiKey: {
      defaultLifetimeSeconds: 7776000,
      requireScopes: true,
      allowLegacyHumanPrincipals: false,
      allowLegacyPlaintextLookup: false,
      pepper: {
        $config: "env",
        name: "NODICS_API_KEY_PEPPER",
        fallback: null,
      },
      minimumPepperLength: 32,
    },
    audit: {
      enabled: true,
      publisherService: null,
      failClosed: false,
    },
    securityStamp: {
      enabled: true,
      failClosed: true,
      allowMissingStamp: false,
      cacheModuleName: "auth",
    },
    internalToken: {
      maximumLifetimeSeconds: 300,
      renewalConcurrency: 4,
      runtimeAccessGroups: ["userGroup", "serviceAccountUserGroup"],
      routePermission: "auth.internal.token.read",
      crossTenantPermissions: ["auth.internal.token.read.anyTenant"],
      crossTenantGroups: [],
      maxDeclaredModules: 512,
      moduleNamePattern: "^[A-Za-z][A-Za-z0-9_.-]{0,127}$",
    },
    compatibility: {
      allowInsecureDevelopmentSecret: false,
      allowLocalBootstrapIdentity: false,
      allowNonExpiringTokens: false,
      allowPasswordHeaders: false,
    },
    bootstrapIdentity: {
      required: true,
      allowedSources: [
        "environment",
        "externalProperty",
        "secretManager",
        "runtimeSecret",
      ],
      localSources: ["localSample", "test"],
      minimumPasswordLength: 16,
      minimumApiKeyLength: 32,
    },
  },
  cache: {
    auth: {
      channels: {
        auth: {
          ttl: 0,
          enabled: true,
          fallback: false,
          engine: "redis",
          events: {
            expired:
              "DefaultAuthTokenInvalidationService.publishTokenExpiredEvent",
            del: "DefaultAuthTokenInvalidationService.publishTokenDeletedEvent",
            flushed:
              "DefaultAuthTokenInvalidationService.publishTokenFlushedEvent",
          },
        },
      },
    },
  },
  identityGovernance: {
    administrativeGroups: [
      "adminGroup",
      "runtimeConfigAdminUserGroup",
      "serviceAccountUserGroup",
    ],
    systemAccessGroups: ["serviceAccountUserGroup"],
    groupValidationPageSize: 10000,
    principalPolicy: {
      allowedTypes: ["human", "service", "customer"],
      serviceType: "service",
      serviceGroup: "serviceAccountUserGroup",
      minimumServiceApiKeyLength: 32,
    },
    customerRegistration: {
      group: "customerUserGroup",
      principalType: "customer",
      active: true,
    },
    migration: {
      version: 5,
      runtimeDeploymentBootstrapEnabled: false,
    },
    separationOfDuties: {
      requireActor: true,
    },
  },
};
