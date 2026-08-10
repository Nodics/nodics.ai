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
      projectedFields: [
        "code",
        "name",
        "active",
        "tenant",
        "superEnterprise",
        "createdAt",
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
