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
        summary: "Create one enterprise after governed confirmation",
        description:
          "Profile validates and persists the enterprise; callers may not bypass target authorization.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["code", "name", "idempotencyKey"],
                properties: {
                  code: { type: "string", maxLength: 128 },
                  name: { type: "string", maxLength: 256 },
                  tenantCode: { type: "string", maxLength: 128 },
                  superEnterpriseCode: { type: "string", maxLength: 128 },
                  roleCodes: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: [
                        "PLATFORM_OWNER",
                        "PROGRAM_OPERATOR",
                        "SERVICE_PROVIDER",
                        "MARKETPLACE_VENDOR",
                        "ISSUER",
                        "ASSET_OWNER",
                        "BUSINESS_PARTNER",
                      ],
                    },
                  },
                  active: { type: "boolean" },
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
          200: { description: "Created client-safe enterprise result" },
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
      },
      rollback: {
        secured: true,
        accessGroups: ["runtimeConfigAdminUserGroup"],
        permission: "identity.migration.rollback",
        key: "/identity/migration/rollback",
        method: "POST",
        controller: "DefaultIdentityGovernanceController",
        operation: "rollbackMigration",
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
