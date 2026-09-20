/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nRouter/config/properties
 * @description Default router configuration for route initialization order, body/response handlers, authorization, and server endpoints.
 * @layer config
 * @owner nRouter
 * @override Project, environment, server, or node modules may override router properties through layered configuration without changing framework defaults.
 */
module.exports = {
  routerInitFunction: [
    "initProperties",
    "initSession",
    "initLogger",
    "initCache",
    "initBodyParser",
    "initHeaders",
    "initErrorRoutes",
    "initExtras",
  ],
  bodyParserHandler: {
    jsonBodyParserHandler: "DefaultJsonBodyParserHandlerService",
    textBodyParserHandler: "DefaultTextBodyParserHandlerService",
  },
  httpHardening: {
    enabled: true,
    trustProxy: false,
    body: {
      urlencoded: {
        extended: true,
        limit: "1mb",
        parameterLimit: 1000,
      },
      json: {
        limit: "1mb",
        strict: true,
      },
      text: {
        limit: "1mb",
        type: "text/*",
      },
    },
    securityHeaders: {
      enabled: true,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
        "Referrer-Policy": "no-referrer",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Cache-Control": "no-store",
        "X-XSS-Protection": "0",
      },
    },
    cors: {
      enabled: true,
      allowedOrigins: [],
      deniedOrigins: [],
      originDefaults: { protocol: "http", host: "localhost" },
      // Standard Nodics browser origins; independent of frontend lifecycle.
      originEndpoints: {
        axis: { port: 3100 },
        nexus: { port: 3200 },
        agora: { port: 3300 },
        agoraElectronics: { port: 3400 },
        agoraTelco: { port: 3500 },
        circa: { port: 3600 },
      },
      originEndpointOverrides: {},
      allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Idempotency-Key",
        "X-CSRF-Token",
        "X-Request-Id",
        "X-Correlation-Id",
        "X-Nodics-Client-Contract-Version",
        "X-Enterprise-Code",
        "X-Nodics-Enterprise",
        "X-Nodics-Tenant",
        "X-Tenant-Code",
        "Tenant",
      ],
      exposedHeaders: [
        "ETag",
        "Retry-After",
        "X-Request-Id",
        "X-Correlation-Id",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
      ],
      allowedHeaderOverrides: {},
      exposedHeaderOverrides: {},
      allowCredentials: true,
      maxAge: 600,
    },
    rateLimit: {
      enabled: true,
      windowMs: 60000,
      max: 600,
      skipOptions: true,
      keyHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  responseHandler: {
    jsonResponseHandler: "DefaultJsonResponseHandlerService",
    textResponseHandler: "DefaultTextResponseHandlerService",
    fileDownloadResponseHandler: "DefaultFileDownloadResponseHandlerService",
    publicError: {
      includeValidationErrors: true,
      maximumValidationErrors: 25,
      maskServerErrorMessages: true,
      includeLocalizationMetadata: true,
      permittedLocalizationExposures: ["PUBLIC", "AUTHENTICATED"],
    },
  },
  routeActionAuthorization: {
    enabled: true,
    strict: true,
    superPermissions: ["*", "runtime.config.*"],
    groupPermissions: {
      serviceAccountUserGroup: [
        "auth.internal.token.read",
        "auth.internal.token.read.anyTenant",
        "import.init.run",
        "import.core.run",
        "import.sample.run",
        "import.release.validate",
        "location.location.read",
        "location.location.search",
      ],
    },
  },
  apiExposure: {
    default: {
      enabled: true,
    },
    unknown: {
      enabled: false,
    },
    categories: {
      schemaApi: {
        enabled: true,
      },
    },
  },
  tooling: {
    commands: {
      "docs:openapi": {
        description:
          "Generate OpenAPI from effective router and schema contracts.",
        handler: "@nTooling/node-script",
        script: "src/service/tooling/defaultOpenapiContractGeneratorService.js",
      },
    },
  },
  servers: {
    options: {
      contextRoot: "nodics",
      endpointDefaults: { httpHost: "localhost", httpsHost: "localhost" },
    },
    default: {
      options: {
        contextRoot: "nodics",
      },
      endpoint: {
        httpHost: "localhost",
        httpPort: 3000,

        httpsHost: "localhost",
        httpsPort: 3001,
      },

    },
  },
};
