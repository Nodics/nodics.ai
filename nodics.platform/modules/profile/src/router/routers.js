/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/router/routers
 * @description Defines profile route registration and HTTP exposure metadata.
 * @layer router
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  profile: {
    tenantNamespaceBindings: {
      inventory: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permissionConfig: "profileTenantProvisioning.inventoryPermission",
        apiExposure: "profileTenantProvisioning",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/internal/tenants/bootstrap",
        method: "GET",
        controller: "DefaultTenantNamespaceBindingController",
        operation: "inventory",
      },
      bind: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permissionConfig: "profileTenantProvisioning.permission",
        apiExposure: "profileTenantProvisioning",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/internal/tenants/:tenantCode/namespace-bindings",
        method: "POST",
        controller: "DefaultTenantNamespaceBindingController",
        operation: "bind",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["scopeKey", "binding"],
                properties: {
                  scopeKey: {
                    type: "string",
                    pattern: "^deployment_[a-f0-9]{64}$",
                  },
                  binding: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    verifiedContactWorkspace: {
      workspace: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permissionConfig: "profileVerifiedContacts.permission",
        apiExposure: "profileVerifiedContacts",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/customer/contacts/verification/workspace",
        method: "GET",
        controller: "DefaultProfileVerifiedContactWorkspaceController",
        operation: "workspace",
      },
    },
    verifiedContacts: Object.fromEntries(
      [
        ["begin", ["ownerId", "channel", "expectedRevision"]],
        [
          "verify",
          ["ownerId", "channel", "expectedRevision", "commandId", "secret"],
        ],
        ["inspect", ["ownerId", "channel"]],
        [
          "consent",
          [
            "ownerId",
            "channel",
            "expectedRevision",
            "purpose",
            "purposeVersion",
            "granted",
            "operationReference",
          ],
        ],
        [
          "suppression",
          ["ownerId", "channel", "expectedRevision", "purpose", "suppressed"],
        ],
      ].map(([operation, required]) => [
        operation,
        {
          secured: true,
          authTokenTypes: ["access"],
          accessGroups: ["customerUserGroup"],
          permissionConfig: "profileVerifiedContacts.permission",
          apiExposure: "profileVerifiedContacts",
          requestPrivacy: { sensitive: true },
          cache: { enabled: false },
          key: "/customer/contacts/verification/" + operation,
          method: "POST",
          controller: "DefaultProfileVerifiedContactController",
          operation,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: false,
                  required,
                  properties: Object.fromEntries(
                    required.map((key) => [
                      key,
                      {
                        ownerId: {
                          type: "string",
                          pattern: "^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$",
                        },
                        channel: { type: "string", enum: ["EMAIL", "SMS"] },
                        expectedRevision: {
                          type: "integer",
                          minimum: 0,
                          maximum: 2147483646,
                        },
                        commandId: {
                          type: "string",
                          pattern: "^[a-f0-9]{64}$",
                        },
                        secret: {
                          type: "string",
                          pattern: "^[a-f0-9]{12,128}$",
                        },
                        purpose: {
                          type: "string",
                          pattern: "^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$",
                        },
                        purposeVersion: {
                          type: "integer",
                          minimum: 1,
                          maximum: 2147483647,
                        },
                        operationReference: {
                          type: "string",
                          pattern: "^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$",
                        },
                        granted: { type: "boolean" },
                        suppressed: { type: "boolean" },
                      }[key],
                    ]),
                  ),
                },
              },
            },
          },
        },
      ]),
    ),
    committedConsentStampRepair: {
      inspect: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
        permissionConfig:
          "enterpriseManagement.administrationConsent.stampRepairPermission",
        apiExposure: "profileManagement",
        cache: { enabled: false },
        key: "/enterprise-administration/:enterpriseCode/consent/stamps/repair",
        method: "GET",
        controller: "DefaultEnterpriseManagementController",
        operation: "inspectCommittedConsentStamps",
      },
      repair: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
        permissionConfig:
          "enterpriseManagement.administrationConsent.stampRepairPermission",
        apiExposure: "profileManagement",
        cache: { enabled: false },
        key: "/enterprise-administration/:enterpriseCode/consent/stamps/repair",
        method: "POST",
        controller: "DefaultEnterpriseManagementController",
        operation: "repairCommittedConsentStamps",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: [
                  "enterpriseCode",
                  "revision",
                  "operationId",
                  "grantCodes",
                ],
                properties: {
                  enterpriseCode: {
                    type: "string",
                    minLength: 1,
                    maxLength: 128,
                    pattern: "^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$",
                  },
                  revision: {
                    type: "integer",
                    minimum: 1,
                    maximum: 2147483647,
                  },
                  operationId: {
                    type: "string",
                    pattern: "^[A-Za-z0-9_-]{1,128}$",
                  },
                  grantCodes: {
                    type: "array",
                    minItems: 1,
                    maxItems: 100,
                    uniqueItems: true,
                    items: {
                      type: "string",
                      minLength: 1,
                      maxLength: 320,
                      pattern: "^[A-Za-z0-9][A-Za-z0-9._@+-]{0,319}$",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    commerceNotifications: {
      recipient: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permissionConfig: "profileCommerceNotifications.permission",
        apiExposure: "profileManagement",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/internal/commerce/notification-recipient",
        method: "POST",
        controller: "DefaultProfileCommerceNotificationRecipientController",
        operation: "resolve",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["channel", "source"],
                properties: {
                  channel: { type: "string", enum: ["EMAIL", "SMS"] },
                  source: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "kind",
                      "orderCode",
                      "sourceCode",
                      "orderRevision",
                    ],
                    properties: {
                      kind: { type: "string", enum: ["PURCHASED", "REFUNDED"] },
                      orderCode: {
                        type: "string",
                        minLength: 1,
                        maxLength: 128,
                      },
                      sourceCode: {
                        type: "string",
                        minLength: 1,
                        maxLength: 128,
                      },
                      orderRevision: { type: "integer", minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    canonicalHistoricalLink: {
      prepare: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.apply",
        apiExposure: "profileManagement",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/identity/canonical-link/prepare",
        method: "POST",
        controller: "DefaultCanonicalHistoricalIdentityLinkController",
        operation: "prepare",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: [
                  "canonicalIdentity",
                  "historicalIdentity",
                  "canonicalPassword",
                  "historicalPassword",
                  "confirmed",
                ],
                properties: {
                  canonicalIdentity: {
                    type: "object",
                    additionalProperties: false,
                    required: ["tenantCode", "recordKind", "recordId"],
                    properties: {
                      tenantCode: {
                        type: "string",
                        pattern: "^[A-Za-z0-9._-]{1,128}$",
                      },
                      recordKind: {
                        type: "string",
                        enum: ["EMPLOYEE", "CUSTOMER"],
                      },
                      recordId: {
                        type: "string",
                        minLength: 1,
                        maxLength: 192,
                      },
                    },
                  },
                  historicalIdentity: {
                    type: "object",
                    additionalProperties: false,
                    required: ["tenantCode", "recordKind", "recordId"],
                    properties: {
                      tenantCode: {
                        type: "string",
                        pattern: "^[A-Za-z0-9._-]{1,128}$",
                      },
                      recordKind: {
                        type: "string",
                        enum: ["EMPLOYEE", "CUSTOMER"],
                      },
                      recordId: {
                        type: "string",
                        minLength: 1,
                        maxLength: 192,
                      },
                    },
                  },
                  canonicalPassword: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1024,
                  },
                  historicalPassword: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1024,
                  },
                  confirmed: { type: "boolean", enum: [true] },
                },
              },
            },
          },
        },
      },
      commit: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.apply",
        apiExposure: "profileManagement",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/identity/canonical-link/commit",
        method: "POST",
        controller: "DefaultCanonicalHistoricalIdentityLinkController",
        operation: "commit",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: [
                  "auditCode",
                  "fingerprint",
                  "canonicalPassword",
                  "historicalPassword",
                  "confirmed",
                ],
                properties: {
                  auditCode: {
                    type: "string",
                    pattern: "^canonical-link-[a-f0-9]{40}$",
                  },
                  fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
                  canonicalPassword: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1024,
                  },
                  historicalPassword: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1024,
                  },
                  confirmed: { type: "boolean", enum: [true] },
                  resume: { type: "boolean" },
                },
              },
            },
          },
        },
      },
      inspect: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.apply",
        apiExposure: "profileManagement",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        key: "/identity/canonical-link/inspect",
        method: "POST",
        controller: "DefaultCanonicalHistoricalIdentityLinkController",
        operation: "inspect",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["auditCode", "fingerprint"],
                properties: {
                  auditCode: {
                    type: "string",
                    pattern: "^canonical-link-[a-f0-9]{40}$",
                  },
                  fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
                },
              },
            },
          },
        },
      },
    },
    sessionContext: {
      validate: {
        requestPrivacy: { sensitive: true },
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permissionConfig: "authSecurity.sessionContextValidation.permission",
        apiExposure: "profileManagement",
        cache: { enabled: false },
        key: "/internal/session-context/validate",
        method: "POST",
        controller: "DefaultProfileSessionContextController",
        operation: "validate",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["authToken"],
                properties: {
                  authToken: { type: "string", minLength: 5, maxLength: 65536 },
                },
              },
            },
          },
        },
      },
    },
    references: {
      read: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permissions: [
          "profile.address.reference.read",
          "profile.enterprise.reference.read",
        ],
        apiExposure: "profileManagement",
        key: "/references/read",
        method: "POST",
        controller: "DefaultProfileReferenceController",
        operation: "read",
      },
    },
    principalScopes: {
      mine: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup", "adminGroup"],
        permission: "profile.scope.read",
        apiExposure: "profileManagement",
        cache: { enabled: false },
        key: "/identity/scopes/me",
        method: "GET",
        controller: "DefaultPrincipalScopeController",
        operation: "mine",
      },
    },
    loadDefaults: {
      getInternalAuthToken: {
        secured: true,
        accessGroups: ["userGroup"],
        permissionConfig: "authSecurity.internalToken.routePermission",
        key: "/auth/token/:tntCode",
        method: "GET",
        controller: "DefaultInternalAuthenticationProviderController",
        operation: "getInternalAuthToken",
        help: {
          requestType: "secured",
          message:
            "Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated",
          method: "GET",
          url: "http://host:port/nodics/profile/auth/token/:tntCode",
          body: {
            "x-api-key": "xxxxxx--xxxx---xxxx---xxxxx",
          },
        },
      },
      getEnterprise: {
        secured: true,
        accessGroups: ["userGroup"],
        cache: {
          enabled: false,
          ttl: 20,
        },
        key: "/enterprise/get",
        method: "GET",
        controller: "DefaultEnterpriseController",
        operation: "getEnterprise",
        help: {
          requestType: "secured",
          message:
            "x-enterprise-code header is preferred; legacy entCode header is deprecated",
          method: "GET",
          url: "http://host:port/nodics/profile/enterprise/get",
        },
      },
      getTenants: {
        secured: true,
        accessGroups: ["userGroup"],
        cache: {
          enabled: true,
          ttl: 200,
        },
        key: "/tenant/get",
        method: "GET",
        controller: "DefaultTenantController",
        operation: "getTenants",
        help: {
          requestType: "secured",
          method: "GET",
          url: "http://host:port/nodics/profile/tenant/get",
        },
      },
      searchEnterprises: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
        permission: "profile.enterprise.search",
        apiExposure: "profileManagement",
        key: "/enterprises/search",
        method: "GET",
        controller: "DefaultEnterpriseManagementController",
        operation: "search",
        summary:
          "Search enterprises through a bounded administrative projection",
        description:
          "Returns a bounded, client-safe enterprise list. Profile remains the identity and persistence authority.",
        parameters: [
          {
            name: "code",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 128 },
          },
          {
            name: "name",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 256 },
          },
          {
            name: "active",
            in: "query",
            required: false,
            schema: { type: "boolean" },
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: { description: "Bounded enterprise search result" },
        },
      },
      createEnterprise: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
        permission: "profile.enterprise.create",
        apiExposure: "profileManagement",
        key: "/enterprises",
        method: "POST",
        controller: "DefaultEnterpriseManagementController",
        operation: "create",
        summary: "Create an enterprise and prepare its default administrator",
        description:
          "Profile derives runtime placement and composes existing enterprise/pre-enrolment owners. Identity activation remains a separate invitee action.",
        parameters: [
          {
            name: "Idempotency-Key",
            in: "header",
            required: true,
            schema: { type: "string", minLength: 8, maxLength: 256 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["model"],
                properties: {
                  model: {
                    type: "object",
                    required: ["code", "name"],
                    description:
                      "Effective Profile enterprise descriptor validates writable fields; adminEmail is required unless a unique EMAIL contact is selected.",
                    properties: {
                      code: { type: "string", maxLength: 128 },
                      name: { type: "string", maxLength: 256 },
                      adminEmail: { type: "string", maxLength: 320 },
                      contacts: {
                        type: "array",
                        maxItems: 100,
                        items: { type: "string", maxLength: 128 },
                      },
                      active: { type: "boolean" },
                      roleCodes: { type: "array", items: { type: "string" } },
                      superEnterprise: { type: "string", maxLength: 128 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              "Persisted enterprise with administrator enrolment prepared, not an activated employee session",
          },
        },
      },
      searchEnterpriseAccessAssignments: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
        permission: "profile.enterpriseAccess.search",
        apiExposure: "profileManagement",
        key: "/enterprises/access-assignments",
        method: "GET",
        controller: "DefaultEnterpriseManagementController",
        operation: "searchAccessAssignments",
        summary:
          "Search enterprise user pre-assignments through a bounded Profile projection",
        description:
          "Returns safe pre-assignment metadata for platform administrators or the caller enterprise.",
        parameters: [
          {
            name: "email",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 320 },
          },
          {
            name: "enterpriseCode",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 128 },
          },
          {
            name: "tenantCode",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 128 },
          },
          {
            name: "roleCode",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 128 },
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["PENDING", "ACTIVE", "REGISTERED", "EXPIRED", "REVOKED"],
            },
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          200: {
            description: "Bounded enterprise access-assignment search result",
          },
        },
      },
      preAssignEnterpriseAccess: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
        permission: "profile.enterpriseAccess.assign",
        apiExposure: "profileManagement",
        key: "/enterprises/:enterpriseCode/access-assignments",
        method: "POST",
        controller: "DefaultEnterpriseManagementController",
        operation: "preAssignAccess",
        summary:
          "Pre-assign one email address for enterprise employee registration",
        description:
          "Creates governed invite state. Platform admins can assign any enterprise; enterprise admins are bounded to their own enterprise.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["email", "roleCode", "idempotencyKey"],
                properties: {
                  enterpriseCode: { type: "string", maxLength: 128 },
                  email: { type: "string", maxLength: 320 },
                  roleCode: {
                    type: "string",
                    enum: [
                      "ENTERPRISE_ADMIN",
                      "CONTENT_MANAGER",
                      "OPERATOR",
                      "VIEWER",
                    ],
                  },
                  message: { type: "string", maxLength: 1000 },
                  expiresAt: { type: "string", format: "date-time" },
                  idempotencyKey: {
                    type: "string",
                    minLength: 8,
                    maxLength: 256,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Created client-safe enterprise access assignment",
          },
        },
      },
      resolvePreAssignedEnterpriseAccess: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileRegistration",
        key: "/enterprise-access/resolve",
        method: "GET",
        controller: "DefaultEnterpriseManagementController",
        operation: "resolvePreAssignedAccess",
        summary: "Resolve whether an email has pre-assigned enterprise access",
        description:
          "Supports Axis pre-registration without creating an employee account.",
        parameters: [
          {
            name: "enterpriseCode",
            in: "query",
            required: true,
            schema: { type: "string", maxLength: 128 },
          },
          {
            name: "email",
            in: "query",
            required: true,
            schema: { type: "string", maxLength: 320 },
          },
        ],
        responses: { 200: { description: "Pre-assigned access resolution" } },
      },
      getPreAssignedEnterpriseAccessWorkspace: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileRegistration",
        key: "/enterprise-access/workspace",
        method: "GET",
        controller: "DefaultEnterpriseManagementController",
        operation: "getPublicAccessWorkspace",
        summary:
          "Return the backend-driven public enterprise registration workspace",
        description:
          "Publishes only public registration components from the Profile enterprise-access workspace contract.",
        responses: {
          200: {
            description: "Public enterprise registration workspace contract",
          },
        },
      },
      registerPreAssignedEnterpriseEmployee: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileRegistration",
        key: "/enterprise-access/register",
        method: "POST",
        controller: "DefaultEnterpriseManagementController",
        operation: "registerPreAssignedEmployee",
        summary: "Register one pre-approved enterprise employee",
        description:
          "Creates the employee identity, assigns configured groups, grants enterprise scope, and closes the access assignment.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: [
                  "enterpriseCode",
                  "email",
                  "firstName",
                  "lastName",
                  "password",
                  "idempotencyKey",
                ],
                properties: {
                  enterpriseCode: { type: "string", maxLength: 128 },
                  email: { type: "string", maxLength: 320 },
                  firstName: { type: "string", maxLength: 128 },
                  lastName: { type: "string", maxLength: 128 },
                  password: { type: "string", maxLength: 256 },
                  idempotencyKey: {
                    type: "string",
                    minLength: 8,
                    maxLength: 256,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Registered enterprise employee result" },
        },
      },
    },

    employeeRecovery: {
      workspace: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileEmployeeRecovery",
        key: "/employee-recovery/workspace",
        method: "GET",
        controller: "DefaultAuthenticationProviderController",
        operation: "employeeRecoveryWorkspace",
        summary:
          "Discover the independently qualified employee password recovery contract",
      },
      start: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileEmployeeRecovery",
        key: "/employee-recovery/start",
        method: "POST",
        controller: "DefaultAuthenticationProviderController",
        operation: "startEmployeeRecovery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", maxLength: 320 },
                },
              },
            },
          },
        },
      },
      verify: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileEmployeeRecovery",
        key: "/employee-recovery/verify",
        method: "POST",
        controller: "DefaultAuthenticationProviderController",
        operation: "verifyEmployeeRecovery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["continuation", "code"],
                properties: {
                  continuation: {
                    type: "string",
                    pattern: "^[A-Za-z0-9_-]{43}$",
                    writeOnly: true,
                  },
                  code: {
                    type: "string",
                    minLength: 6,
                    maxLength: 128,
                    writeOnly: true,
                  },
                },
              },
            },
          },
        },
      },
      resend: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileEmployeeRecovery",
        key: "/employee-recovery/resend",
        method: "POST",
        controller: "DefaultAuthenticationProviderController",
        operation: "resendEmployeeRecovery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["continuation"],
                properties: {
                  continuation: {
                    type: "string",
                    pattern: "^[A-Za-z0-9_-]{43}$",
                    writeOnly: true,
                  },
                },
              },
            },
          },
        },
      },
      status: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileEmployeeRecovery",
        key: "/employee-recovery/status",
        method: "POST",
        controller: "DefaultAuthenticationProviderController",
        operation: "employeeRecoveryStatus",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["continuation"],
                properties: {
                  continuation: {
                    type: "string",
                    pattern: "^[A-Za-z0-9_-]{43}$",
                    writeOnly: true,
                  },
                },
              },
            },
          },
        },
      },
      reset: {
        secured: false,
        accessGroups: ["userGroup"],
        apiExposure: "profileEmployeeRecovery",
        key: "/employee-recovery/reset",
        method: "POST",
        controller: "DefaultAuthenticationProviderController",
        operation: "completeEmployeeRecovery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["continuation", "password"],
                properties: {
                  continuation: {
                    type: "string",
                    pattern: "^[A-Za-z0-9_-]{43}$",
                    writeOnly: true,
                  },
                  password: {
                    type: "string",
                    minLength: 12,
                    maxLength: 1024,
                    writeOnly: true,
                  },
                },
              },
            },
          },
        },
      },
    },

    authenticate: {
      authenticateEmployee: {
        secured: false,
        accessGroups: ["userGroup"],
        key: "/employee/authenticate",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "authenticateEmployee",
        help: {
          requestType: "pre-authentication",
          message:
            "Send loginId and password in the JSON body; x-enterprise-code is the enterprise header",
          method: "POST",
          url: "http://host:port/nodics/profile/employee/authenticate",
          parameters: [
            {
              name: "x-enterprise-code",
              in: "header",
              required: false,
              description:
                "Enterprise code used to resolve the login tenant. Legacy entCode header is deprecated.",
              schema: {
                type: "string",
              },
            },
          ],
          body: {
            loginId: "Employee login id",
            password: "Employee password",
          },
        },
      },
      authenticateEmployeeBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        key: "/employee/browser/authenticate",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "authenticateEmployeeBrowser",
        help: {
          requestType: "pre-authentication",
          message:
            "Authenticate an employee and establish a secure browser refresh session",
          method: "POST",
          url: "http://host:port/nodics/profile/employee/browser/authenticate",
        },
      },
      restoreEmployeeBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        key: "/employee/browser/restore",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "restoreEmployeeBrowser",
        help: {
          requestType: "browser-session",
          message:
            "Rotate the HttpOnly browser refresh session after CSRF validation",
          method: "POST",
          url: "http://host:port/nodics/profile/employee/browser/restore",
        },
      },
      logoutEmployeeBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        key: "/employee/browser/logout",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "logoutEmployeeBrowser",
        help: {
          requestType: "browser-session",
          message:
            "Revoke and clear the browser refresh session after CSRF validation",
          method: "POST",
          url: "http://host:port/nodics/profile/employee/browser/logout",
        },
      },
      externalCustomerLaunch: {
        secured: false,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        key: "/customer/external/launch",
        method: "POST",
        handler: "DefaultCustomerBrowserSessionController",
        operation: "launch",
        help: {
          requestType: "pre-authentication",
          message: "Validate external launch proof without issuing a session",
        },
      },
      externalCustomerOrigin: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        cache: { enabled: false },
        key: "/customer/external/origin",
        method: "POST",
        controller: "DefaultCustomerBrowserSessionController",
        operation: "origin",
        help: {
          requestType: "secured",
          message:
            "Resolve a verified source recipient for the authenticated customer",
        },
      },
      authenticateCustomerBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        key: "/customer/browser/authenticate",
        method: "POST",
        handler: "DefaultCustomerBrowserSessionController",
        operation: "authenticate",
        help: {
          requestType: "pre-authentication",
          message: "Profile-owned customer browser identity operation",
        },
      },
      restoreCustomerBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        key: "/customer/browser/restore",
        method: "POST",
        handler: "DefaultCustomerBrowserSessionController",
        operation: "restore",
        help: {
          requestType: "browser-session",
          message: "Profile-owned customer browser identity operation",
        },
      },
      logoutCustomerBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        key: "/customer/browser/logout",
        method: "POST",
        handler: "DefaultCustomerBrowserSessionController",
        operation: "logout",
        help: {
          requestType: "browser-session",
          message: "Profile-owned customer browser identity operation",
        },
      },
      prepareExternalBrowserSession: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "profile.externalIdentity.prepare",
        cache: { enabled: false },
        key: "/internal/external-identity/browser-handoff",
        method: "POST",
        controller: "DefaultCustomerBrowserSessionController",
        operation: "prepareExternalSession",
      },
      completeExternalBrowserSession: {
        secured: false,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        key: "/customer/browser/external/complete",
        method: "POST",
        handler: "DefaultCustomerBrowserSessionController",
        operation: "completeExternalSession",
        help: {
          requestType: "pre-authentication",
          message: "Complete a one-use Profile external browser handoff",
        },
      },
      externalDestination: {
        secured: true,
        accessGroups: ["serviceAccountUserGroup"],
        authTokenTypes: ["service"],
        permission: "communication.request",
        cache: { enabled: false },
        key: "/internal/external-identity/destination",
        method: "POST",
        controller: "DefaultCustomerBrowserSessionController",
        operation: "destination",
      },
      externalCustomerBrowser: {
        secured: false,
        accessGroups: ["userGroup"],
        cache: { enabled: false },
        key: "/customer/browser/external/session",
        method: "POST",
        handler: "DefaultCustomerBrowserSessionController",
        operation: "externalSession",
        help: {
          requestType: "pre-authentication",
          message: "Profile-owned customer browser identity operation",
        },
      },
      linkExternalCustomer: {
        secured: true,
        accessGroups: ["customerUserGroup"],
        authTokenTypes: ["access"],
        cache: { enabled: false },
        key: "/customer/browser/external/link",
        method: "POST",
        controller: "DefaultCustomerBrowserSessionController",
        operation: "link",
        help: {
          requestType: "secured",
          message: "Profile-owned customer browser identity operation",
        },
      },
      unlinkExternalCustomer: {
        secured: true,
        accessGroups: ["customerUserGroup"],
        authTokenTypes: ["access"],
        cache: { enabled: false },
        key: "/customer/browser/external/unlink",
        method: "POST",
        controller: "DefaultCustomerBrowserSessionController",
        operation: "unlink",
        help: {
          requestType: "secured",
          message: "Profile-owned customer browser identity operation",
        },
      },
      authenticateCustomer: {
        secured: false,
        accessGroups: ["userGroup"],
        key: "/customer/authenticate",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "authenticateCustomer",
        help: {
          requestType: "pre-authentication",
          message:
            "Send loginId and password in the JSON body; x-enterprise-code is the enterprise header",
          method: "POST",
          url: "http://host:port/nodics/profile/customer/authenticate",
          parameters: [
            {
              name: "x-enterprise-code",
              in: "header",
              required: false,
              description:
                "Enterprise code used to resolve the login tenant. Legacy entCode header is deprecated.",
              schema: {
                type: "string",
              },
            },
          ],
          body: {
            loginId: "Customer login id",
            password: "Customer password",
          },
        },
      },
      refreshToken: {
        secured: false,
        accessGroups: ["userGroup"],
        key: "/token/refresh",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "refreshToken",
        help: {
          requestType: "public",
          message: "Exchange a refresh token once for a rotated token pair",
          method: "POST",
          url: "http://host:port/nodics/profile/token/refresh",
          body: { refreshToken: "" },
        },
      },
      logout: {
        secured: true,
        accessGroups: ["userGroup"],
        key: "/token/logout",
        method: "POST",
        handler: "DefaultAuthenticationProviderController",
        operation: "logout",
        help: {
          requestType: "secured",
          message: "Revoke the current access token and optional refresh token",
          method: "POST",
          url: "http://host:port/nodics/profile/token/logout",
          body: { refreshToken: "" },
        },
      },
    },

    authorize: {
      authorizeToken: {
        secured: true,
        accessGroups: ["userGroup"],
        key: "/token/authorize",
        method: "POST",
        handler: "DefaultAuthorizationProviderController",
        operation: "authorizeToken",
        help: {
          requestType: "secured",
          message:
            "Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated",
          method: "POST",
          url: "http://host:port/nodics/profile/authorize",
        },
      },
    },
    identityMigration: {
      assessment: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.preview",
        key: "/identity/migration/assessment",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "assessIdentities",
        requestPrivacy: { sensitive: true },
      },
      bootstrapReview: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.preview",
        key: "/identity/migration/assessment/bootstrap-review",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "reviewBootstrapIdentities",
        requestPrivacy: { sensitive: true },
        authTokenTypes: ["access"],
        cache: { enabled: false },
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["confirmed", "reviewToken"],
                properties: {
                  confirmed: { type: "boolean", enum: [true] },
                  reviewToken: {
                    type: "string",
                    maxLength: 2048,
                    pattern: "^[A-Za-z0-9_-]+\\.[a-f0-9]{64}$",
                  },
                },
              },
            },
          },
        },
      },
      preview: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.preview",
        key: "/identity/migration/preview",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "previewMigration",
      },
      apply: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.apply",
        key: "/identity/migration/apply",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "applyMigration",
        authTokenTypes: ["access"],
        cache: { enabled: false },
        summary:
          "Apply an explicitly reviewed legacy structural preview; not canonical identity reconciliation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["confirmed", "fingerprint", "migrationVersion"],
                properties: {
                  confirmed: { type: "boolean", enum: [true] },
                  fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
                  migrationVersion: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
      },
      rollback: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.rollback",
        key: "/identity/migration/rollback",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "rollbackMigration",
        authTokenTypes: ["access"],
        cache: { enabled: false },
        summary:
          "Restore an explicitly reviewed completed structural audit; never restore credentials",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["auditCode", "confirmed", "fingerprint"],
                properties: {
                  auditCode: { type: "string", minLength: 1, maxLength: 192 },
                  confirmed: { type: "boolean", enum: [true] },
                  fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
                },
              },
            },
          },
        },
      },
      recover: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.apply",
        key: "/identity/migration/recover",
        method: "POST",
        cache: { enabled: false },
        controller: "DefaultIdentityGovernanceController",
        operation: "recoverMigration",
        summary: "Recover only exact reviewed structural audit pre/post states",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["auditCode", "confirmed", "fingerprint"],
                properties: {
                  auditCode: { type: "string", minLength: 1, maxLength: 192 },
                  confirmed: { type: "boolean", enum: [true] },
                  fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
                },
              },
            },
          },
        },
      },
      inspect: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.preview",
        key: "/identity/migration/inspect",
        method: "POST",
        cache: { enabled: false },
        controller: "DefaultIdentityGovernanceController",
        operation: "inspectMigration",
        summary:
          "Inspect reviewed structural audit progress without replay or unlocking",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["auditCode", "confirmed", "fingerprint"],
                properties: {
                  auditCode: { type: "string", minLength: 1, maxLength: 192 },
                  confirmed: { type: "boolean", enum: [true] },
                  fingerprint: { type: "string", pattern: "^[a-f0-9]{64}$" },
                },
              },
            },
          },
        },
      },
      rotateServiceKey: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.credential.rotate",
        key: "/identity/credential/rotate",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "rotateServiceKey",
      },
    },
    customerExist: {
      isCustomerExist: {
        secured: true,
        accessGroups: ["userGroup"],
        key: "/customer/exist",
        method: "POST",
        controller: "DefaultCustomerController",
        operation: "isCustomerExist",
        help: {
          requestType: "secured",
          message:
            "Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated",
          method: "POST",
          url: "http://host:port/nodics/profile/customer/exist",
          body: {
            loginId: "",
          },
        },
      },
    },
    customerSignUp: {
      registerCustomerForm: {
        secured: true,
        accessGroups: ["serviceAccountUserGroup"],
        authTokenTypes: ["service"],
        permission: "profile.customer.register",
        key: "/customer/registrations",
        method: "POST",
        controller: "DefaultCustomerController",
        operation: "registerForm",
        cache: { enabled: false },
      },
      registerCustomer: {
        secured: true,
        accessGroups: ["userGroup"],
        key: "/customer/signup",
        method: "POST",
        controller: "DefaultCustomerController",
        operation: "signUp",
        help: {
          requestType: "secured",
          message:
            "Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated",
          method: "POST",
          url: "http://host:port/nodics/profile/customer/signUp",
          body: {
            //complete customer profile data
          },
        },
      },
    },
  },
};

// Public transport remains within the existing Profile registration route family.
// Never expose Communication's service-only API to Axis.
Object.assign(module.exports.profile.loadDefaults, {
  startEmployeeRegistration: {
    secured: false,
    accessGroups: ["userGroup"],
    apiExposure: "profileRegistration",
    key: "/enterprise-access/start",
    method: "POST",
    controller: "DefaultEnterpriseManagementController",
    operation: "startEmployeeRegistration",
    summary: "Start a neutral email-first employee registration",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["email"],
            properties: {
              email: { type: "string", format: "email", maxLength: 320 },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Opaque continuation and neutral delivery progress; no identity or invitation disclosure",
      },
    },
  },
  verifyEmployeeRegistration: {
    secured: false,
    accessGroups: ["userGroup"],
    apiExposure: "profileRegistration",
    key: "/enterprise-access/verify",
    method: "POST",
    controller: "DefaultEnterpriseManagementController",
    operation: "verifyEmployeeRegistration",
    summary: "Verify email and resolve authorised registration choices",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["continuation", "code"],
            properties: {
              continuation: {
                type: "string",
                pattern: "^[A-Za-z0-9_-]{43}$",
                writeOnly: true,
              },
              code: {
                type: "string",
                minLength: 6,
                maxLength: 128,
                writeOnly: true,
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Verified registration progress without OTP or execution proof",
      },
    },
  },
  resendEmployeeRegistration: {
    secured: false,
    accessGroups: ["userGroup"],
    apiExposure: "profileRegistration",
    key: "/enterprise-access/resend",
    method: "POST",
    controller: "DefaultEnterpriseManagementController",
    operation: "resendEmployeeRegistration",
    summary:
      "Replace an eligible verification code under the existing cooldown and attempt policy",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["continuation"],
            properties: {
              continuation: {
                type: "string",
                pattern: "^[A-Za-z0-9_-]{43}$",
                writeOnly: true,
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "New generation progress; not proof of inbox receipt",
      },
    },
  },
  employeeRegistrationStatus: {
    secured: false,
    accessGroups: ["userGroup"],
    apiExposure: "profileRegistration",
    key: "/enterprise-access/status",
    method: "POST",
    controller: "DefaultEnterpriseManagementController",
    operation: "employeeRegistrationStatus",
    summary:
      "Read the current protected registration outcome without repeating writes",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["continuation"],
            properties: {
              continuation: {
                type: "string",
                pattern: "^[A-Za-z0-9_-]{43}$",
                writeOnly: true,
              },
            },
          },
        },
      },
    },
    responses: { 200: { description: "Authoritative registration progress" } },
  },
});
// Update the existing completion operation rather than introduce a competing one.
module.exports.profile.loadDefaults.registerPreAssignedEnterpriseEmployee.requestBody =
  {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["continuation", "firstName", "lastName", "password"],
          properties: {
            continuation: {
              type: "string",
              pattern: "^[A-Za-z0-9_-]{43}$",
              writeOnly: true,
            },
            assignmentCode: { type: "string", minLength: 1, maxLength: 128 },
            firstName: { type: "string", minLength: 1, maxLength: 256 },
            lastName: { type: "string", minLength: 1, maxLength: 256 },
            password: {
              type: "string",
              minLength: 12,
              maxLength: 1024,
              writeOnly: true,
            },
          },
        },
      },
    },
  };

// Application intake shares the existing proof-bound registration continuation.
module.exports.profile.loadDefaults.withdrawEmployeeApplication = {
  secured: false,
  accessGroups: ["userGroup"],
  apiExposure: "profileRegistration",
  key: "/enterprise-access/withdraw-application",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "withdrawEmployeeApplication",
  summary:
    "Withdraw a mailbox-proven pending application at its displayed revision",
  cache: { enabled: false },
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["continuation", "applicationCode", "expectedRevision"],
          properties: {
            continuation: {
              type: "string",
              pattern: "^[A-Za-z0-9_-]{43}$",
              writeOnly: true,
            },
            applicationCode: {
              type: "string",
              pattern: "^[A-Za-z0-9_.-]{1,128}$",
            },
            expectedRevision: { type: "string", pattern: "^[1-9][0-9]{0,9}$" },
          },
        },
      },
    },
  },
  responses: {
    200: { description: "Current application history; no access granted" },
  },
};
Object.assign(module.exports.profile.loadDefaults, {
  applyForEnterprise: {
    secured: false,
    accessGroups: ["userGroup"],
    apiExposure: "profileRegistration",
    key: "/enterprise-access/apply",
    method: "POST",
    controller: "DefaultEnterpriseManagementController",
    operation: "applyForEnterprise",
    summary:
      "Submit verified employee details for enterprise review without granting access",
    cache: { enabled: false },
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "continuation",
              "enterpriseCode",
              "firstName",
              "lastName",
            ],
            properties: {
              continuation: {
                type: "string",
                pattern: "^[A-Za-z0-9_-]{43}$",
                writeOnly: true,
              },
              enterpriseCode: { type: "string", minLength: 1, maxLength: 128 },
              firstName: { type: "string", minLength: 1, maxLength: 256 },
              lastName: { type: "string", minLength: 1, maxLength: 256 },
              note: { type: "string", maxLength: 4000 },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Saved application status; not registration or workflow approval",
      },
    },
  },
  searchEmployeeApplications: {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
    permissionConfig: "enterpriseManagement.applications.reviewPermission",
    apiExposure: "profileManagement",
    key: "/enterprise-access/applications",
    method: "GET",
    controller: "DefaultEnterpriseManagementController",
    operation: "searchEmployeeApplications",
    cache: { enabled: false },
    summary: "List pending applications within the authorised enterprise scope",
    parameters: [
      {
        name: "enterpriseCode",
        in: "query",
        required: false,
        schema: { type: "string", maxLength: 128 },
      },
      {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 10000 },
      },
      {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 100 },
      },
    ],
    responses: {
      200: {
        description:
          "Bounded application list without proof or credential data",
      },
    },
  },
});

module.exports.profile.loadDefaults.applyEmployeeApplicationDecision = {
  secured: true,
  authTokenTypes: ["service"],
  accessGroups: ["serviceAccountUserGroup"],
  permissionConfig:
    "enterpriseManagement.applications.review.callbackPermission",
  apiExposure: "moduleInternal",
  key: "/enterprise-access/applications/process-decision",
  method: "POST",
  cache: { enabled: false },
  controller: "DefaultEnterpriseManagementController",
  operation: "applyEmployeeApplicationDecision",
  summary:
    "Claim and apply a Process-owned employee application review decision",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["instanceCode", "executionCode"],
          properties: {
            instanceCode: {
              type: "string",
              pattern: "^employeeApplicationReview_[a-f0-9]{64}$",
            },
            executionCode: { type: "string", pattern: "^[a-f0-9-]{36}$" },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authoritative application outcome, not login activation",
    },
  },
};

// Recovery commands do not accept an approval decision or an arbitrary message recipient.
module.exports.profile.loadDefaults.inspectEmployeeApplicationReview = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
  permissionConfig:
    "enterpriseManagement.applications.review.decisionPermission",
  apiExposure: "profileManagement",
  key: "/enterprise-access/applications/:applicationCode/recovery",
  method: "GET",
  cache: { enabled: false },
  controller: "DefaultEnterpriseManagementController",
  operation: "inspectEmployeeApplicationReview",
  summary:
    "Inspect one scoped application without starting or deciding its Process review",
  parameters: [
    {
      name: "applicationCode",
      in: "path",
      required: true,
      schema: { type: "string", pattern: "^enterpriseAccess_[a-f0-9]{64}$" },
    },
  ],
  responses: {
    200: { description: "Redacted current application recovery evidence" },
  },
};
module.exports.profile.loadDefaults.manageEmployeeApplicationReview = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["runtimeConfigAdminUserGroup", "adminGroup"],
  permissionConfig:
    "enterpriseManagement.applications.review.decisionPermission",
  apiExposure: "profileManagement",
  key: "/enterprise-access/applications/:applicationCode/actions",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "manageEmployeeApplicationReview",
  cache: { enabled: false },
  summary:
    "Reconcile the saved application review or its existing decision notification",
  parameters: [
    {
      name: "applicationCode",
      in: "path",
      required: true,
      schema: { type: "string", pattern: "^enterpriseAccess_[a-f0-9]{64}$" },
    },
  ],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["operation", "revision"],
          properties: {
            operation: {
              type: "string",
              enum: [
                "RETRY_REVIEW_START",
                "RETRY_NOTIFICATION",
                "RETRY_REVIEW_RETIREMENT",
              ],
            },
            revision: { type: "integer", minimum: 1 },
            attempt: { type: "integer", minimum: 1, maximum: 20 },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Fresh recovery state; never proof of mailbox delivery or approval",
    },
  },
};

// Consent changes are target-owned lifecycle commands, not generic scope CRUD.
module.exports.profile.loadDefaults.inspectEnterpriseHierarchy = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permissionConfig:
    "enterpriseManagement.administrationConsent.reparentPermission",
  apiExposure: "profileManagement",
  key: "/enterprise-administration/hierarchy",
  method: "GET",
  controller: "DefaultEnterpriseManagementController",
  operation: "inspectEnterpriseHierarchy",
  cache: { enabled: false },
  summary: "Inspect one retained platform-owned hierarchy change",
};
module.exports.profile.loadDefaults.reparentEnterprise = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permissionConfig:
    "enterpriseManagement.administrationConsent.reparentPermission",
  apiExposure: "profileManagement",
  key: "/enterprise-administration/hierarchy",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "reparentEnterprise",
  cache: { enabled: false },
  summary: "Apply or resume one reviewed platform-owned relationship change",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["enterpriseCode", "parentCode", "epoch", "operationId"],
          properties: {
            enterpriseCode: { type: "string", maxLength: 128 },
            parentCode: { type: "string", nullable: true, maxLength: 128 },
            epoch: { type: "integer", minimum: 0, maximum: 2147483646 },
            operationId: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
          },
        },
      },
    },
  },
};
module.exports.profile.loadDefaults.inspectAdministrationConsent = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup"],
  permissionConfig: "enterpriseManagement.administrationConsent.permission",
  apiExposure: "profileManagement",
  key: "/enterprise-administration/consent",
  method: "GET",
  controller: "DefaultEnterpriseManagementController",
  operation: "inspectAdministrationConsent",
  cache: { enabled: false },
  summary:
    "Inspect explicit administration consent owned by the current enterprise",
};
module.exports.profile.loadDefaults.recoverEnterpriseHierarchy = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permissionConfig:
    "enterpriseManagement.administrationConsent.hierarchyRecoveryPermission",
  apiExposure: "profileManagement",
  key: "/enterprise-administration/hierarchy/recover",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "recoverEnterpriseHierarchy",
  cache: { enabled: false },
  summary:
    "Resolve one inspected hierarchy fence without stealing pending work",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["enterpriseCode", "operationId", "revision"],
          properties: {
            enterpriseCode: { type: "string", minLength: 1, maxLength: 128 },
            operationId: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
            revision: { type: "integer", minimum: 1, maximum: 2147483646 },
          },
        },
      },
    },
  },
};
module.exports.profile.loadDefaults.changeAdministrationConsent = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup"],
  permissionConfig: "enterpriseManagement.administrationConsent.permission",
  apiExposure: "profileManagement",
  key: "/enterprise-administration/consent",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "changeAdministrationConsent",
  cache: { enabled: false },
  summary: "Commit one reviewed explicit target consent grant or revocation",
};

module.exports.profile.loadDefaults.administrationConsentWorkspace = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup"],
  permissionConfig: "enterpriseManagement.administrationConsent.permission",
  apiExposure: "profileManagement",
  key: "/enterprise-administration/:enterpriseCode/workspace",
  method: "GET",
  controller: "DefaultEnterpriseManagementController",
  operation: "administrationConsentWorkspace",
  cache: { enabled: false },
  summary:
    "Read the authorized target administration workspace without mutation",
};
for (const [name, method, operation] of [
  ["inspectTargetAdministrationConsent", "GET", "inspectAdministrationConsent"],
  ["changeTargetAdministrationConsent", "POST", "changeAdministrationConsent"],
]) {
  module.exports.profile.loadDefaults[name] = {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["adminGroup"],
    permissionConfig: "enterpriseManagement.administrationConsent.permission",
    apiExposure: "profileManagement",
    key: "/enterprise-administration/:enterpriseCode/consent",
    method,
    controller: "DefaultEnterpriseManagementController",
    operation,
    cache: { enabled: false },
    summary:
      "Inspect or change explicit consent for one independently authorized target",
  };
}

for (const name of [
  "changeAdministrationConsent",
  "changeTargetAdministrationConsent",
]) {
  module.exports.profile.loadDefaults[name].requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["operation", "operationId", "revision"],
          properties: {
            operation: { type: "string", enum: ["GRANT", "REVOKE"] },
            operationId: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
            revision: { type: "integer", minimum: 0, maximum: 2147483646 },
            grantCode: { type: "string", minLength: 1, maxLength: 128 },
            sourceEnterpriseCode: {
              type: "string",
              minLength: 1,
              maxLength: 128,
            },
            recipientAssignmentCode: {
              type: "string",
              minLength: 1,
              maxLength: 128,
            },
            parentGrantCode: { type: "string", minLength: 1, maxLength: 128 },
            roleCodes: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              uniqueItems: true,
              items: { type: "string", minLength: 1, maxLength: 128 },
            },
            actions: {
              type: "array",
              minItems: 1,
              maxItems: 3,
              uniqueItems: true,
              items: {
                type: "string",
                enum: ["VIEW", "INVITE", "MANAGE_ACCESS"],
              },
            },
            recipients: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              uniqueItems: true,
              items: { type: "string", minLength: 1, maxLength: 254 },
            },
            expiresAt: { type: "string", format: "date-time", maxLength: 40 },
          },
          oneOf: [
            {
              properties: { operation: { enum: ["REVOKE"] } },
              required: ["grantCode"],
            },
            {
              properties: { operation: { enum: ["GRANT"] } },
              required: [
                "sourceEnterpriseCode",
                "recipientAssignmentCode",
                "roleCodes",
                "actions",
                "recipients",
                "expiresAt",
              ],
            },
          ],
        },
      },
    },
  };
}

// Self-service membership commands expose no caller-selected tenant, role or identity.
module.exports.profile.loadDefaults.enterpriseMembershipWorkspace = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup", "customerUserGroup"],
  apiExposure: "profileMembership",
  key: "/enterprise-memberships/workspace",
  method: "GET",
  cache: { enabled: false },
  controller: "DefaultEnterpriseManagementController",
  operation: "enterpriseMembershipWorkspace",
  summary: "Read only the authenticated person membership task",
};
module.exports.profile.loadDefaults.switchEmployeeBrowser = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  apiExposure: "profileMembership",
  key: "/employee/browser/switch-enterprise",
  method: "POST",
  cache: { enabled: false },
  controller: "DefaultAuthenticationProviderController",
  operation: "switchEmployeeBrowser",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["assignmentCode", "revision"],
          properties: {
            assignmentCode: { type: "string", minLength: 1, maxLength: 128 },
            revision: { type: "integer", minimum: 1 },
          },
        },
      },
    },
  },
  summary:
    "Switch one same-person password browser session to an accepted membership after origin and CSRF proof",
};
module.exports.profile.loadDefaults.enterpriseTeamWorkspace = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permission: "profile.enterpriseAccess.assign",
  apiExposure: "profileMembership",
  key: "/enterprise-team/workspace",
  method: "GET",
  cache: { enabled: false },
  controller: "DefaultEnterpriseManagementController",
  operation: "enterpriseTeamWorkspace",
  summary: "Read the bounded team task for the current authorized enterprise",
};
module.exports.profile.loadDefaults.listOwnMemberships = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup", "customerUserGroup"],
  apiExposure: "profileMembership",
  key: "/enterprise-memberships",
  method: "GET",
  controller: "DefaultEnterpriseManagementController",
  operation: "listOwnMemberships",
  cache: { enabled: false },
  summary:
    "List bounded memberships for the fresh canonical authenticated person",
  responses: {
    200: {
      description: "Safe owned membership list; not a session or access grant",
    },
  },
};
module.exports.profile.loadDefaults.acceptMembership = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup", "customerUserGroup"],
  apiExposure: "profileMembership",
  key: "/enterprise-memberships/accept",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "acceptMembership",
  cache: { enabled: false },
  summary:
    "Explicitly accept one current invitation using an authenticated password identity",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["assignmentCode", "revision"],
          properties: {
            assignmentCode: { type: "string", minLength: 1, maxLength: 128 },
            revision: { type: "integer", minimum: 1 },
          },
        },
      },
    },
  },
  responses: {
    200: { description: "Safe acceptance outcome; no browser token or cookie" },
  },
};
for (const [name, path] of [
  ["suspendMembership", "suspend"],
  ["revokeMembership", "revoke"],
  ["resumeMembership", "resume"],
  ["withdrawInvitation", "withdraw"],
]) {
  module.exports.profile.loadDefaults[name] = {
    secured: true,
    authTokenTypes: ["access"],
    accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
    permission: "profile.enterpriseAccess.assign",
    apiExposure: "profileMembership",
    key: "/enterprise-team/" + path,
    method: "POST",
    controller: "DefaultEnterpriseManagementController",
    operation: name,
    cache: { enabled: false },
    summary:
      "Apply one serialized membership lifecycle command with current administrator safeguards",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["assignmentCode", "revision", "operationId"],
            properties: {
              assignmentCode: { type: "string", minLength: 1, maxLength: 128 },
              revision: { type: "integer", minimum: 1 },
              operationId: {
                type: "string",
                pattern: "^[A-Za-z0-9_-]{16,128}$",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Saved same-operation outcome, never a canonical identity mutation",
      },
    },
  };
}
module.exports.profile.loadDefaults.handoverAdministrator = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permission: "profile.enterpriseAccess.assign",
  apiExposure: "profileMembership",
  key: "/enterprise-team/handover",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "handoverAdministrator",
  cache: { enabled: false },
  summary: "Transfer default designation to a current active administrator",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "enterpriseCode",
            "assignmentCode",
            "revision",
            "operationId",
          ],
          properties: {
            enterpriseCode: { type: "string", minLength: 1, maxLength: 128 },
            assignmentCode: { type: "string", minLength: 1, maxLength: 128 },
            revision: { type: "integer", minimum: 1 },
            operationId: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Saved default-administrator designation without replacing credentials or memberships",
    },
  },
};
module.exports.profile.loadDefaults.enterpriseRecoveryWorkspace = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["runtimeConfigAdminUserGroup"],
  permission: "profile.enterpriseAccess.assign",
  apiExposure: "profileMembership",
  key: "/enterprise-team/recovery-workspace",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "enterpriseRecoveryWorkspace",
  cache: { enabled: false },
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["enterpriseCode"],
          properties: {
            enterpriseCode: { type: "string", minLength: 1, maxLength: 128 },
          },
        },
      },
    },
  },
};
module.exports.profile.loadDefaults.customerParticipationWorkspace = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  apiExposure: "profileMembership",
  key: "/customer/participation/workspace",
  method: "GET",
  controller: "DefaultCustomerController",
  operation: "participationWorkspace",
  cache: { enabled: false },
};
module.exports.profile.loadDefaults.retryLifecycleNotification = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permission: "profile.enterpriseAccess.assign",
  apiExposure: "profileMembership",
  key: "/enterprise-team/retry-notification",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "retryLifecycleNotification",
  cache: { enabled: false },
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["assignmentCode", "revision", "kind"],
          properties: {
            assignmentCode: { type: "string", minLength: 1, maxLength: 128 },
            revision: { type: "integer", minimum: 1 },
            kind: { type: "string", enum: ["INVITATION", "ACCOUNT_READY"] },
          },
        },
      },
    },
  },
};
module.exports.profile.loadDefaults.reconcileTeamOperation = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup"],
  permission: "profile.enterpriseAccess.assign",
  apiExposure: "profileMembership",
  key: "/enterprise-team/reconcile-committed",
  method: "POST",
  controller: "DefaultEnterpriseManagementController",
  operation: "reconcileTeamOperation",
  cache: { enabled: false },
  summary:
    "Platform operator reconciliation of an evidenced committed team operation; never a write replay",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["enterpriseCode", "teamRevision", "operationId"],
          properties: {
            enterpriseCode: { type: "string", minLength: 1, maxLength: 128 },
            teamRevision: { type: "integer", minimum: 1 },
            operationId: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$" },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Recorded membership outcome; no replay, lock steal or private operation inputs",
    },
  },
};
module.exports.profile.loadDefaults.acceptCustomerParticipation = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["userGroup"],
  apiExposure: "profileMembership",
  key: "/customer/participation/accept",
  method: "POST",
  cache: { enabled: false },
  controller: "DefaultCustomerController",
  operation: "acceptParticipation",
  summary:
    "Accept configured customer terms using current employee proof without copying credentials or staff permissions",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["termsVersion", "termsDigest", "accepted"],
          properties: {
            termsVersion: { type: "string", minLength: 1, maxLength: 128 },
            termsDigest: { type: "string", pattern: "^[a-f0-9]{64}$" },
            accepted: { type: "boolean", const: true },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Accepted participation; issuing a customer session remains a separate authentication action",
    },
  },
};
module.exports.profile.loadDefaults.renewCustomerParticipation = {
  ...module.exports.profile.loadDefaults.customerParticipationWorkspace,
  key: "/customer/participation/renew",
  method: "POST",
  operation: "renewParticipation",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["revision", "termsVersion", "termsDigest", "accepted"],
          properties: {
            revision: { type: "integer", minimum: 1 },
            termsVersion: { type: "string", minLength: 1, maxLength: 128 },
            termsDigest: { type: "string", pattern: "^[a-f0-9]{64}$" },
            accepted: { type: "boolean", enum: [true] },
          },
        },
      },
    },
  },
};
module.exports.profile.loadDefaults.withdrawCustomerParticipation = {
  ...module.exports.profile.loadDefaults.customerParticipationWorkspace,
  key: "/customer/participation/withdraw",
  method: "POST",
  operation: "withdrawParticipation",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["revision", "confirmed"],
          properties: {
            revision: { type: "integer", minimum: 1 },
            confirmed: { type: "boolean", enum: [true] },
          },
        },
      },
    },
  },
};
module.exports.profile.loadDefaults.switchCustomerParticipation = {
  ...module.exports.profile.loadDefaults.customerParticipationWorkspace,
  key: "/employee/browser/customer-participation/switch",
  method: "POST",
  operation: "switchParticipation",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["revision"],
          properties: { revision: { type: "integer", minimum: 1 } },
        },
      },
    },
  },
};

// Fixed setup recovery uses the existing human management permission; gates remain separately disabled.
module.exports.profile.loadDefaults.inspectEnterpriseSetup = {
  secured: true,
  authTokenTypes: ["access"],
  accessGroups: ["adminGroup", "runtimeConfigAdminUserGroup"],
  permission: "profile.enterprise.create",
  apiExposure: "profileManagement",
  requestPrivacy: { sensitive: true },
  key: "/enterprises/:enterpriseCode/setup",
  method: "GET",
  controller: "DefaultEnterpriseManagementController",
  operation: "inspectEnterpriseSetup",
  cache: { enabled: false },
  summary:
    "Inspect retained original enterprise setup without replaying operations",
  parameters: [
    {
      name: "enterpriseCode",
      in: "path",
      required: true,
      schema: { type: "string", pattern: "^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$" },
    },
  ],
  responses: {
    200: {
      description: "Content-safe setup state and owner workspace descriptor",
    },
  },
};
module.exports.profile.loadDefaults.resumeEnterpriseSetup = {
  ...module.exports.profile.loadDefaults.inspectEnterpriseSetup,
  key: "/enterprises/:enterpriseCode/setup/resume",
  method: "POST",
  operation: "resumeEnterpriseSetup",
  summary:
    "Continue the retained nomination through qualified serialized owner evidence",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["expectedRevision"],
          properties: {
            expectedRevision: {
              type: "integer",
              minimum: 0,
              maximum: 2147483646,
            },
          },
        },
      },
    },
  },
};
