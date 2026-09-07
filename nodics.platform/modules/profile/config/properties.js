/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/config/properties
 * @description Defines default profile configuration used during module startup and layering.
 * @layer config
 * @owner profile
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  schemaPolicies: {
    profile: {
      administrative: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
      customerOwned: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
          customerUserGroup: 10,
        },
        ownership: {
          enabled: true,
          ownerProperty: "ownerId",
          bypassGroups: {
            adminGroup: true,
            runtimeConfigAdminUserGroup: true,
            serviceAccountUserGroup: true,
          },
          subjectGroups: {
            customerUserGroup: true,
          },
          principalTypes: {
            customer: true,
          },
        },
      },
    },
  },
  mandatoryBootstrapServices: {
    profileIdentity: {
      enabled: true,
      order: 100,
      service: "DefaultMandatoryIdentityBootstrapService",
    },
  },
  attemptsToLockAccount: 5,
  encryptSaltLength: 10,
  passwordLengthLimit: 25,
  forceAPIKeyGenerate: false,
  profileBrowserSession: {
    enabled: false,
    refreshCookieName: "nodics_axis_refresh",
    csrfCookieName: "nodics_axis_csrf",
    cookiePath: "/nodics/profile/v0/employee/browser",
    csrfCookiePath: "/",
    sameSite: "Strict",
    secure: true,
    maximumAgeSeconds: 86400,
  },

  enterpriseManagement: {
    search: {
      defaultResultCount: 25,
      maximumResultCount: 100,
      maximumPageNumber: 10000,
      maximumCodeLength: 128,
      maximumNameLength: 256,
      projectedFields: [
        "code",
        "name",
        "active",
        "tenant",
        "superEnterprise",
        "createdAt",
        "updatedAt",
      ],
    },
    create: {
      maximumCodeLength: 128,
      maximumNameLength: 256,
      allowedRoleCodes: [
        "PLATFORM_OWNER",
        "PROGRAM_OPERATOR",
        "SERVICE_PROVIDER",
        "MARKETPLACE_VENDOR",
        "ISSUER",
        "ASSET_OWNER",
        "BUSINESS_PARTNER",
      ],
      projectedFields: [
        "code",
        "name",
        "active",
        "tenant",
        "superEnterprise",
        "roleCodes",
        "createdAt",
      ],
    },
    accessAssignments: {
      defaultResultCount: 25,
      maximumResultCount: 100,
      maximumPageNumber: 10000,
      maximumEmailLength: 320,
      maximumMessageLength: 1000,
      defaultExpiryDays: 14,
      statuses: ["PENDING", "ACTIVE", "REGISTERED", "EXPIRED", "REVOKED"],
      activeStatuses: ["PENDING", "ACTIVE"],
      projectedFields: [
        "code",
        "email",
        "enterpriseCode",
        "tenantCode",
        "roleCode",
        "groupCodes",
        "scopeType",
        "scopeCode",
        "status",
        "expiresAt",
        "invitedBy",
        "registeredLoginId",
        "registeredAt",
        "createdAt",
        "updatedAt",
      ],
      roles: {
        ENTERPRISE_ADMIN: {
          label: "Enterprise Admin",
          description:
            "Manages enterprise users and enterprise-scoped operations for one enterprise.",
          groupCodes: ["adminGroup", "axisViewerUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [
            "profile.enterprise.search",
            "profile.enterpriseAccess.search",
            "profile.enterpriseAccess.assign",
          ],
        },
        CONTENT_MANAGER: {
          label: "Content Manager",
          description:
            "Manages content and CMS tasks inside the assigned enterprise boundary.",
          groupCodes: ["axisViewerUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        OPERATOR: {
          label: "Operator",
          description:
            "Runs day-to-day enterprise operations inside the assigned enterprise boundary.",
          groupCodes: ["axisViewerUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        VIEWER: {
          label: "Viewer",
          description:
            "Read-oriented access inside the assigned enterprise boundary.",
          groupCodes: ["axisViewerUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
      },
    },
    workspace: {
      contractVersion: 0,
      title: "Enterprise and User Management",
      description:
        "Create enterprises, pre-assign enterprise users, and let invited users complete registration from Axis.",
      renderer: "axis.workspace.backend-operations",
      defaultTab: "enterprises",
      tabs: [
        {
          id: "enterprises",
          label: "Enterprises",
          icon: "organization",
          sections: [
            {
              id: "enterprise-list",
              type: "listing",
              title: "Enterprise Registry",
              endpoint: {
                method: "GET",
                path: "/nodics/profile/v0/enterprises/search",
                resultPath: "items",
              },
              columns: [
                { field: "code", label: "Code" },
                { field: "name", label: "Name" },
                { field: "tenantCode", label: "Tenant" },
                { field: "superEnterpriseCode", label: "Parent" },
                { field: "active", label: "Active" },
              ],
              filters: [
                { name: "code", label: "Enterprise code", type: "TEXT" },
                { name: "name", label: "Enterprise name", type: "TEXT" },
                {
                  name: "active",
                  label: "Active",
                  type: "SELECT",
                  options: [
                    { value: "", label: "Any" },
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ],
                },
              ],
            },
            {
              id: "create-enterprise",
              type: "form",
              title: "Create Enterprise",
              submitLabel: "Create enterprise",
              endpoint: {
                method: "POST",
                path: "/nodics/profile/v0/enterprises",
              },
              fields: [
                { name: "code", label: "Enterprise code", type: "TEXT", required: true, maximumLength: 128 },
                { name: "name", label: "Enterprise name", type: "TEXT", required: true, maximumLength: 256 },
                { name: "tenantCode", label: "Tenant code", type: "TEXT", required: true, maximumLength: 128 },
                { name: "superEnterpriseCode", label: "Parent enterprise", type: "TEXT", required: false, maximumLength: 128 },
                {
                  name: "roleCodes",
                  label: "Enterprise roles",
                  type: "MULTISELECT",
                  required: false,
                  options: [
                    { value: "PROGRAM_OPERATOR", label: "Program Operator" },
                    { value: "SERVICE_PROVIDER", label: "Service Provider" },
                    { value: "MARKETPLACE_VENDOR", label: "Marketplace Vendor" },
                    { value: "ISSUER", label: "Issuer" },
                    { value: "ASSET_OWNER", label: "Asset Owner" },
                    { value: "BUSINESS_PARTNER", label: "Business Partner" },
                  ],
                },
                { name: "active", label: "Active", type: "CHECKBOX", required: false, defaultValue: true },
                { name: "idempotencyKey", label: "Idempotency key", type: "IDEMPOTENCY", required: true },
              ],
            },
          ],
        },
        {
          id: "users",
          label: "Pre-assigned Users",
          icon: "security",
          sections: [
            {
              id: "assignment-list",
              type: "listing",
              title: "Access Assignments",
              endpoint: {
                method: "GET",
                path: "/nodics/profile/v0/enterprises/access-assignments",
                resultPath: "items",
              },
              columns: [
                { field: "email", label: "Email" },
                { field: "enterpriseCode", label: "Enterprise" },
                { field: "roleCode", label: "Role" },
                { field: "status", label: "Status" },
                { field: "registeredLoginId", label: "Registered as" },
              ],
              filters: [
                { name: "enterpriseCode", label: "Enterprise code", type: "TEXT" },
                { name: "email", label: "Email", type: "TEXT" },
                {
                  name: "status",
                  label: "Status",
                  type: "SELECT",
                  options: [
                    { value: "", label: "Any" },
                    { value: "PENDING", label: "Pending" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "REGISTERED", label: "Registered" },
                    { value: "REVOKED", label: "Revoked" },
                  ],
                },
              ],
            },
            {
              id: "assign-user",
              type: "form",
              title: "Pre-assign User",
              submitLabel: "Assign access",
              endpoint: {
                method: "POST",
                path: "/nodics/profile/v0/enterprises/{enterpriseCode}/access-assignments",
              },
              fields: [
                { name: "enterpriseCode", label: "Enterprise code", type: "TEXT", required: true, maximumLength: 128, bindToPath: true },
                { name: "email", label: "Email", type: "EMAIL", required: true, maximumLength: 320 },
                {
                  name: "roleCode",
                  label: "Role",
                  type: "SELECT",
                  required: true,
                  options: [
                    { value: "ENTERPRISE_ADMIN", label: "Enterprise Admin" },
                    { value: "CONTENT_MANAGER", label: "Content Manager" },
                    { value: "OPERATOR", label: "Operator" },
                    { value: "VIEWER", label: "Viewer" },
                  ],
                },
                { name: "message", label: "Message", type: "MULTILINE", required: false, maximumLength: 1000 },
                { name: "idempotencyKey", label: "Idempotency key", type: "IDEMPOTENCY", required: true },
              ],
            },
          ],
        },
        {
          id: "registration",
          label: "Registration",
          icon: "profile",
          sections: [
            {
              id: "resolve-registration",
              type: "form",
              title: "Check Pre-assigned Access",
              submitLabel: "Check access",
              public: true,
              endpoint: {
                method: "GET",
                path: "/nodics/profile/v0/enterprise-access/resolve",
              },
              fields: [
                { name: "enterpriseCode", label: "Enterprise code", type: "TEXT", required: true, maximumLength: 128 },
                { name: "email", label: "Email", type: "EMAIL", required: true, maximumLength: 320 },
              ],
            },
            {
              id: "complete-registration",
              type: "form",
              title: "Complete Registration",
              submitLabel: "Create account",
              public: true,
              endpoint: {
                method: "POST",
                path: "/nodics/profile/v0/enterprise-access/register",
              },
              fields: [
                { name: "enterpriseCode", label: "Enterprise code", type: "TEXT", required: true, maximumLength: 128 },
                { name: "email", label: "Email", type: "EMAIL", required: true, maximumLength: 320 },
                { name: "firstName", label: "First name", type: "TEXT", required: true, maximumLength: 128 },
                { name: "lastName", label: "Last name", type: "TEXT", required: true, maximumLength: 128 },
                { name: "password", label: "Password", type: "PASSWORD", required: true, maximumLength: 256 },
                { name: "idempotencyKey", label: "Idempotency key", type: "IDEMPOTENCY", required: true },
              ],
            },
          ],
        },
      ],
    },
  },

  principalAuthorizationScopes: {
    enabled: true,
    principalTypes: ["human", "service", "customer", "group"],
    effects: ["ALLOW", "DENY"],
    statuses: ["ACTIVE", "INACTIVE", "EXPIRED"],
    scopeTypes: [
      "GLOBAL",
      "TENANT",
      "ENTERPRISE",
      "CATALOG",
      "CHANNEL",
      "STORE",
      "REGION",
      "BUSINESS_UNIT",
    ],
    inheritanceModes: ["DIRECT", "GROUP", "GROUP_AND_DESCENDANTS"],
    maximumAssignmentsPerPrincipal: 500,
    maximumScopeCodeLength: 128,
    defaultEffect: "ALLOW",
    defaultStatus: "ACTIVE",
    defaultInheritanceMode: "DIRECT",
  },

  profile: {
    jwtSignOptions: {
      expiresIn: "3h",
      algorithm: "HS256", // RSASSA [ "RS256", "RS384", "RS512" ]
    },
    jwtVerifyOptions: {
      algorithms: ["HS256"],
    },
    loginIdFormat: "default",
    loginIdFormatValidators: {
      email: "DefaultLoginIdAsEmailValidatorService",
    },
  },
};
