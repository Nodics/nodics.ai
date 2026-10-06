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
  authSecurity: {
    sessionContextValidation: {
      qualified: false,
      validatorService: "DefaultModuleSessionContextValidationService",
      localValidatorService: "DefaultProfileSessionContextValidationService",
      requiredPrincipalTypes: ["customer"],
    },
  },
  tooling: {
    commands: {
      "acceptance:runtime-grants": {
        acceptanceContract: true,
        projectHome: true,
        handler: "@nTooling/node-script",
        script:
          "src/service/acceptance/defaultRuntimeDeploymentGrantAcceptanceService.mjs",
      },
    },
  },
  identityGovernance: {
    customerRegistration: {
      importPlacement: {
        metadataOwnerService: "DefaultModelImportProcessService",
      },
    },
    securityStampInventory: { pageSize: 100, maximumPages: 100 },
    permissionCatalog: [
      "profile.address.reference.read",
      "profile.enterprise.reference.read",
    ],
    migration: {
      canonicalLinking: {
        enabled: false,
        inventoryQualified: false,
        auditCodeIndexQualified: false,
        mutationGuardsQualified: false,
        credentialRetirementQualified: false,
        consumerReconciliationQualified: false,
        recoveryQualified: false,
        proofMaximumAgeMs: 120000,
      },
      reviewedApplyEnabled: false,
      reviewedApplyQualified: false,
      reviewedRollbackEnabled: false,
      reviewedRollbackQualified: false,
      reviewedRecoveryEnabled: false,
      reviewedRecoveryQualified: false,
      recoveryInspectionEnabled: false,
      recoveryInspectionQualified: false,
      recoveryInspectionMaximumChanges: 1000,
      assessment: {
        enabled: false,
        bootstrapReview: {
          enabled: false,
          ownerService: "DefaultProfileBootstrapIdentityAssessmentService",
          maximumAgeMs: 300000,
          sources: [{ releaseCode: "profile:init-v001", version: "0.0.3" }],
        },
        pageSize: 100,
        maximumPages: 100,
        maximumTenants: 100,
        maximumRecords: 50000,
      },
    },
  },
  data: {
    dataReleases: {
      targetValidators: { profile: "DefaultCustomerRegistrationService" },
    },
  },
  profileCustomerParticipation: {
    enabled: false,
    qualified: false,
    sessionQualified: false,
    lifecycleQualified: false,
    browserContextQualified: false,
    maximumConsentHistory: 100,
    terms: null,
    eligibilityService: "DefaultKycDecisionEnforcementService",
    presentation: {
      title: "Customer participation",
      refreshLabel: "Refresh",
      consentLabel: "I accept these customer terms",
      acceptLabel: "Accept customer terms",
      continueLabel: "Continue as customer",
      renewLabel: "Renew customer terms",
      withdrawLabel: "Withdraw customer participation",
      withdrawReviewTitle: "Withdraw customer participation?",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      acceptedMessage:
        "Customer participation accepted. Your employee session has not changed.",
      uncertainMessage:
        "Acceptance is unconfirmed. Review current terms before retrying.",
    },
  },
  profileCustomerEligibility: {
    enabled: false,
    enforcementQualified: false,
    publishedPolicyQualified: false,
    evidenceProviderQualified: false,
    nativeSessionQualified: false,
    decisionAuditQualified: false,
    decisionInvalidationQualified: false,
    recoveryQualified: false,
    maximumDecisionHistory: 100,
    policyType: null,
    propertyProviderCode: "profile.customerEligibility",
    propertyCatalogueVersion: "1",
    approvalOutcomeType: "PROFILE_CUSTOMER_ELIGIBILITY_ALLOW",
    denialOutcomeTypes: ["PROFILE_CUSTOMER_ELIGIBILITY_DENY"],
    platformScopeCode: null,
    domainScopeCode: null,
  },
  profileCommerceNotifications: {
    enabled: false,
    qualified: false,
    sourceConnectionName: "digitalCore",
    sourceAuthority: null,
    timeoutMs: 5000,
    allowInsecureLoopback: false,
    verifiedContactService: "DefaultProfileVerifiedContactService",
    permission: "profile.commerce.notification.recipient.resolve",
  },
  profileVerifiedContacts: {
    enabled: false,
    qualified: false,
    contactCasQualified: false,
    crudProtectionQualified: false,
    readPrivacyQualified: false,
    verificationTransportQualified: false,
    deliveryQualified: false,
    receiptRepairQualified: false,
    permission: "profile.customer.contact.manage",
    maximumContacts: 100,
    maximumVerifiedAgeSeconds: null,
    clockSkewSeconds: 0,
    transport: {
      connectionName: "commsApi",
      timeoutMs: 5000,
      allowInsecureLoopback: false,
      targetAuthority: null,
    },
    rates: {
      ISSUE: { limit: 3, windowSeconds: 300 },
      VERIFY: { limit: 10, windowSeconds: 300 },
      CONSUME: { limit: 5, windowSeconds: 300 },
    },
    purposes: {
      DIGITAL_COUPON_PURCHASED: {
        category: "TRANSACTIONAL",
        channels: ["EMAIL", "SMS"],
        requiresConsent: true,
        version: 1,
      },
      DIGITAL_COUPON_REFUNDED: {
        category: "TRANSACTIONAL",
        channels: ["EMAIL", "SMS"],
        requiresConsent: true,
        version: 1,
      },
    },
    purposeLabels: {
      DIGITAL_COUPON_PURCHASED: "Coupon purchase notifications",
      DIGITAL_COUPON_REFUNDED: "Coupon refund notifications",
    },
    presentation: {
      title: "Contact verification and notifications",
      inspectLabel: "Refresh",
      emptyMessage: "No contact options are available.",
      workingLabel: "Working...",
      reviewTitle: "Confirm this notification preference?",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      uncertainMessage:
        "The outcome is unconfirmed. Inspect the original command.",
      unavailableMessage: "Contact preferences are unavailable.",
      recordedMessage: "Contact preference saved.",
      channelLabel: "Channel",
      purposeLabel: "Notification",
      ownerLabel: "Account",
      verificationCodeLabel: "Verification code",
      beginLabel: "Send verification code",
      verifyLabel: "Verify contact",
      consentLabel: "Notification consent",
      suppressionLabel: "Notification suppression",
      grantedLabel: "Allow this notification",
      suppressedLabel: "Suppress this notification",
    },
  },
  profileReferenceRead: {
    maximumCodes: 100,
    types: {
      address: {
        serviceName: "DefaultAddressService",
        permission: "profile.address.reference.read",
        fields: ["code", "addressLine1", "addressLine2", "city", "countryCode"],
      },
      enterprise: {
        serviceName: "DefaultEnterpriseService",
        permission: "profile.enterprise.reference.read",
        fields: ["code", "name"],
      },
    },
  },
  // Profile owns sessions and distributed public-identity operation limits.
  cache: {
    profile: {
      channels: {
        auth: { $config: "ref", path: "cache.auth.channels.auth" },
        rateLimit: { enabled: true, fallback: false, engine: "redis" },
      },
    },
  },
  profileInitialization: { requiredEmployeeLogins: ["admin", "apiAdmin"] },
  // Inert inventory; an allowed local server must explicitly select this capability.
  localResetProvider: {
    contributions: {
      profile: {
        serviceNames: {
          DefaultAddressService: true,
          DefaultContactService: true,
          DefaultCustomerService: true,
          DefaultEmployeeService: true,
          DefaultEnterpriseService: true,
          DefaultIdentityMigrationAuditService: true,
          DefaultPasswordService: true,
          DefaultPrincipalScopeAssignmentService: true,
          DefaultTenantService: true,
          DefaultUserGroupService: true,
          DefaultUserStateService: true,
        },
      },
    },
  },

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
  passwordLengthLimit: 128,
  forceAPIKeyGenerate: false,
  profileCustomerRegistrationForm: {
    minimumPasswordCharacters: 12,
    maximumPasswordCharacters: 128,
    maximumEmailCharacters: 180,
    maximumNameCharacters: 160,
    maximumNamePartCharacters: 80,
  },
  profileExternalIdentity: {
    enabled: false,
    maximumAssertionAgeSeconds: 3600,
    browserHandoffLifetimeSeconds: 60,
    clockSkewSeconds: 30,
    maximumAssertionCharacters: 16384,
    providers: {
      TELEGRAM: { service: "DefaultTelegramIdentityProviderService" },
    },
    applications: {},
  },
  profileCustomerBrowserSession: {
    enabled: false,
    refreshCookieName: "nodics_customer_refresh",
    csrfCookieName: "nodics_customer_csrf",
    cookiePath: "/nodics/profile/v0/customer/browser",
    csrfCookiePath: "/",
    sameSite: "Strict",
    secure: true,
    allowInsecureLoopback: false,
    maximumAgeSeconds: 86400,
  },
  profileBrowserSession: {
    enabled: false,
    refreshCookieName: "nodics_axis_refresh",
    csrfCookieName: "nodics_axis_csrf",
    cookiePath: "/nodics/profile/v0/employee/browser",
    csrfCookiePath: "/",
    sameSite: "Strict",
    secure: true,
    allowInsecureLoopback: false,
    maximumAgeSeconds: 86400,
  },

  profileEmployeeRecovery: {
    enabled: false,
    method: "PASSWORD",
    inventoryQualified: false,
    credentialWriteQualified: false,
    requireDistributedRateLimit: true,
    verificationPurpose: "EMPLOYEE_PASSWORD_RECOVERY",
    continuationSeconds: {
      $config: "ref",
      path: "enterpriseManagement.registration.continuationSeconds",
    },
    maximumInventoryPages: {
      $config: "ref",
      path: "enterpriseManagement.registration.maximumInventoryPages",
    },
    pageSize: {
      $config: "ref",
      path: "enterpriseManagement.registration.pageSize",
    },
    minimumPasswordLength: {
      $config: "ref",
      path: "enterpriseManagement.registration.minimumPasswordLength",
    },
    maximumPasswordLength: {
      $config: "ref",
      path: "enterpriseManagement.registration.maximumPasswordLength",
    },
    rates: {
      $config: "ref",
      path: "enterpriseManagement.registration.rates",
    },
    mail: {
      connectionName: {
        $config: "ref",
        path: "enterpriseManagement.registration.mail.connectionName",
      },
      templateCode: "profileEmployeeRecoveryCode",
      allowInsecureLoopback: false,
      purpose: "EMPLOYEE_PASSWORD_RECOVERY",
      locale: "en",
      timeoutMilliseconds: {
        $config: "ref",
        path: "enterpriseManagement.registration.mail.timeoutMilliseconds",
      },
    },
    confirmation: {
      templateCode: "profileEmployeePasswordReset",
      purpose: "EMPLOYEE_PASSWORD_RESET_CONFIRMATION",
    },
    endpoints: {
      start: "/nodics/profile/v0/employee-recovery/start",
      verify: "/nodics/profile/v0/employee-recovery/verify",
      resend: "/nodics/profile/v0/employee-recovery/resend",
      status: "/nodics/profile/v0/employee-recovery/status",
      complete: "/nodics/profile/v0/employee-recovery/reset",
    },
    presentation: {
      title: "Recover your account",
      subtitle:
        "Verify your email and choose a new password. This does not change enterprise approval or permissions.",
      emailLabel: "Email",
      emailHelp: "Use the email associated with your employee account.",
      sendLabel: "Send verification code",
      codeLabel: "Verification code",
      codeHelp: "Enter the newest code from your email.",
      verifyLabel: "Verify email",
      resendLabel: "Send a new code",
      statusLabel: "Check progress",
      restartLabel: "Start again",
      enterpriseLabel: "Enterprise",
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      passwordLabel: "New password",
      passwordHelp: "Choose a password that meets your account policy.",
      recoveryPasswordLabel: "New password you just submitted",
      recoveryPasswordHelp:
        "Re-enter that same password to check the result. A different value requires fresh verification.",
      completeLabel: "Reset password",
      retryLabel: "Check reset result",
      workingLabel: "Working…",
      signInLabel: "Return to sign in",
      recoveryLabel: "Account recovery",
      signInPath: "/login",
      recoveryPath: "/forgot-password",
      emailStep: "Verify email",
      detailsStep: "New password",
      completeStep: "Complete",
      sentMessage:
        "A verification email was requested. Use the newest code when it arrives.",
      deliveryMessage:
        "We could not confirm email delivery. Try the permitted resend after the waiting period.",
      invalidCodeMessage:
        "That code is not valid. Check your latest email and try again.",
      lockedCodeMessage:
        "This code is no longer usable. Request a new code when available.",
      resolvingMessage:
        "Email verified. Checking the supported account-recovery method.",
      existingMessage: "Use your supported account sign-in method.",
      noInvitationMessage:
        "Password recovery is not available for this account. Contact your enterprise administrator or use your identity provider’s recovery process.",
      completeMessage:
        "Your password was reset. Return to normal sign-in. Enterprise access and approval status have not changed.",
      recoveryMessage:
        "The reset response was interrupted. Re-enter the same new password to confirm the saved result.",
      statusErrorMessage:
        "Recovery progress could not be confirmed. Do not assume your password changed.",
      confirmationUnavailableMessage:
        "Your password was reset, but the confirmation email could not be confirmed.",
    },
  },

  enterpriseManagement: {
    setupContinuation: {
      inspectionQualified: false,
      resumeQualified: false,
      privateGuardsQualified: false,
      workspace: {
        presentation: {
          title: "Enterprise setup",
          inspectLabel: "Inspect setup",
          resumeLabel: "Continue setup",
          workingLabel: "Working...",
          reviewTitle: "Continue the original enterprise setup?",
          confirmLabel: "Confirm continuation",
          cancelLabel: "Cancel",
          enterpriseLabel: "Enterprise",
          tenantLabel: "Tenant",
          administratorLabel: "Original administrator",
          statusLabel: "Setup status",
          revisionLabel: "Revision",
          heldMessage: "Setup is held. Review the recorded reason before continuing.",
          completeMessage: "Enterprise setup is complete.",
          unavailableMessage: "Enterprise setup inspection is unavailable.",
          uncertainMessage: "The result is unconfirmed. Inspect setup before another action.",
          reasons: {
            ORIGINAL_INTENT_UNAVAILABLE: "Original setup intent was not retained.",
            NOMINATION_POLICY_CHANGED: "Administrator policy differs from the original nomination.",
            TENANT_NAMESPACE_UNSAFE: "Enterprise storage setup needs administrator attention.",
            ASSIGNMENT_READ_UNAVAILABLE: "The original administrator assignment could not be confirmed.",
            NOMINATION_CHANGED: "The original administrator assignment changed or expired.",
            OTHER_OPERATION_PENDING: "Another enterprise operation is pending.",
            OPERATION_EVIDENCE_INVALID: "The retained operation evidence could not be verified.",
            ORIGINAL_OPERATOR_REQUIRED: "The original operator must continue this pending operation.",
            STEP_OUTCOME_UNCONFIRMED: "A setup step has an unconfirmed outcome and will not be replayed.",
            COMPLETION_UNCONFIRMED: "Current setup completion could not be confirmed."
          }
        }
      }
    },
    hierarchy: { maximumDepth: 32 },
    administrationConsent: {
      enabled: false,
      externalInvalidationQualified: false,
      stampRepairQualified: false,
      stampRepairPermission:
        "profile.enterpriseAdministration.repairSecurityStamps",
      stampRepairPresentation: {
        title: "Consent security stamp repair",
        inspectLabel: "Inspect",
        emptyMessage: "No committed grants are available for repair.",
        workingLabel: "Working...",
        reviewTitle: "Repair selected committed stamps?",
        confirmLabel: "Confirm repair",
        cancelLabel: "Cancel",
        uncertainMessage:
          "Repair is unconfirmed. Inspect the original command.",
        unavailableMessage: "Stamp repair is unavailable.",
        recordedMessage: "Committed security stamps repaired.",
        grantLabel: "Grant",
        revisionLabel: "Revision",
        statusLabel: "Status",
      },
      enforcementQualified: false,
      reparentQualified: false,
      reparentPermission: "profile.enterpriseAdministration.reparent",
      creationDefault: false,
      maximumGrants: 100,
      maximumLifetimeDays: 30,
      permission: "profile.enterpriseAdministration.manageConsent",
      allowedRoleCodes: ["OPERATOR", "VIEWER"],
      administratorRoleCodes: ["ENTERPRISE_ADMIN"],
      onwardQualified: false,
      maximumDelegationDepth: 4,
      accessManagementPermission:
        "profile.enterpriseAdministration.manageAccess",
      hierarchyRecoveryQualified: false,
      hierarchyRecoveryPermission:
        "profile.enterpriseAdministration.recoverHierarchy",
      creationRights: null,
      workspace: {
        version: 1,
        presentation: {
          title: "Enterprise Administration",
          grantLabel: "Grant Access",
          revokeLabel: "Revoke Access",
          sourceLabel: "Source Enterprise",
          assignmentLabel: "Administrator",
          roleLabel: "Assignable Roles",
          actionLabel: "Allowed Actions",
          recipientLabel: "Invitation Recipients",
          expiryLabel: "Expires At",
          confirmMessage: "Confirm this inspected access change.",
          uncertainMessage:
            "The result could not be confirmed. Inspect before retrying.",
          emptyMessage: "No administration grants.",
          inspectLabel: "Inspect",
          workingLabel: "Working",
          reviewTitle: "Review Access Change",
          confirmLabel: "Confirm",
          cancelLabel: "Cancel",
          unavailableMessage: "Enterprise administration is unavailable.",
          recordedMessage: "Access change recorded.",
        },
      },
    },
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
      defaultAdministrator: {
        roleCode: "ENTERPRISE_ADMIN",
        maximumContacts: 100,
      },
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
      statuses: [
        "PENDING",
        "ACTIVE",
        "REGISTERED",
        "SUSPENDED",
        "EXPIRED",
        "REVOKED",
      ],
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
        MERCHANT_OPERATOR: {
          label: "Merchant Operator",
          description:
            "Validates and confirms purchased coupon redemption in Axis for the assigned enterprise.",
          groupCodes: ["commerceMerchantUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        ENTERPRISE_ADMIN: {
          label: "Enterprise Admin",
          administrationClass: "ENTERPRISE_ADMIN",
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
              successMessage:
                "Enterprise saved and administrator enrolment prepared. The administrator must verify their email in Axis to finish registration.",
              endpoint: {
                method: "POST",
                path: "/nodics/profile/v0/enterprises",
                bodyShape: "MODEL",
                idempotencyField: "idempotencyKey",
              },
              fields: [
                {
                  name: "code",
                  label: "Enterprise code",
                  type: "TEXT",
                  required: true,
                  maximumLength: 128,
                },
                {
                  name: "name",
                  label: "Enterprise name",
                  type: "TEXT",
                  required: true,
                  maximumLength: 256,
                },
                {
                  name: "adminEmail",
                  label: "Administrator email",
                  type: "EMAIL",
                  required: true,
                  maximumLength: 320,
                },
                {
                  name: "superEnterprise",
                  label: "Parent enterprise",
                  type: "TEXT",
                  required: false,
                  maximumLength: 128,
                },
                {
                  name: "roleCodes",
                  label: "Enterprise roles",
                  type: "MULTISELECT",
                  required: false,
                  options: [
                    { value: "PROGRAM_OPERATOR", label: "Program Operator" },
                    { value: "SERVICE_PROVIDER", label: "Service Provider" },
                    {
                      value: "MARKETPLACE_VENDOR",
                      label: "Marketplace Vendor",
                    },
                    { value: "ISSUER", label: "Issuer" },
                    { value: "ASSET_OWNER", label: "Asset Owner" },
                    { value: "BUSINESS_PARTNER", label: "Business Partner" },
                  ],
                },
                {
                  name: "active",
                  label: "Active",
                  type: "CHECKBOX",
                  required: false,
                  defaultValue: true,
                },
                {
                  name: "idempotencyKey",
                  label: "Idempotency key",
                  type: "IDEMPOTENCY",
                  required: true,
                },
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
                {
                  name: "enterpriseCode",
                  label: "Enterprise code",
                  type: "TEXT",
                },
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
                {
                  name: "enterpriseCode",
                  label: "Enterprise code",
                  type: "TEXT",
                  required: true,
                  maximumLength: 128,
                  bindToPath: true,
                  defaultFromParameter: "enterpriseCode",
                },
                {
                  name: "email",
                  label: "Email",
                  type: "EMAIL",
                  required: true,
                  maximumLength: 320,
                },
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
                {
                  name: "message",
                  label: "Message",
                  type: "MULTILINE",
                  required: false,
                  maximumLength: 1000,
                },
                {
                  name: "idempotencyKey",
                  label: "Idempotency key",
                  type: "IDEMPOTENCY",
                  required: true,
                },
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
      "RUNTIME_DEPLOYMENT",
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

  profileTenantProvisioning: {
    enabled: false,
    localRuntimeRemoteModuleExtensions: [],
    permission: "profile.tenant.namespace.bind",
    inventoryPermission: "profile.enterprise.search",
    allowInsecureLoopback: false,
  },
  apiExposure: {
    categories: {
      moduleInternal: { enabled: false },
      profileTenantProvisioning: { enabled: false },
      profileManagement: {
        enabled: true,
      },
      profileRegistration: {
        enabled: true,
      },
      profileEmployeeRecovery: { enabled: false },
      profileMembership: { enabled: false },
      profileVerifiedContacts: { enabled: false },
    },
  },
};

// Profile owns the invited-employee journey. Deployments opt in only after the
// referenced inventory, unique-claim index, cache and runtime grants are qualified.
// Qualification is evidence, not a customer-specific journey switch.
module.exports.enterpriseManagement.memberships = {
  enabled: false,
  inventoryQualified: false,
  sessionBindingQualified: false,
  assignmentClaimIndexQualified: false,
  browserContextSwitchQualified: false,
  presentation: {
    title: "My enterprise memberships",
    refreshLabel: "Refresh memberships",
    enterpriseLabel: "Enterprise",
    responsibilityLabel: "Responsibility",
    statusLabel: "Status",
    ACCEPT: "Accept invitation",
    SWITCH: "Enter enterprise",
    reviewTitle: "Review membership action",
    reviewMessage: "Confirm the selected enterprise and responsibility.",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    inspectLabel: "Inspect current state",
    uncertainMessage:
      "Acceptance may have completed. Refresh current state before another action.",
    successMessage:
      "Membership accepted. Entering an enterprise is a separate action.",
    emptyMessage: "No memberships or invitations are available.",
    PENDING: "Invitation pending",
    ACTIVE: "Prepared",
    REGISTERED: "Registered",
    SUSPENDED: "Suspended",
    REVOKED: "Revoked",
  },
  pageSize: 50,
  maximumInventoryPages: 100,
};
module.exports.enterpriseManagement.teamAdministration = {
  genericMutationGuard: {
    enabled: false,
    installedCoverageQualified: false,
    maximumRecords: 100,
    superAdministratorRoleCodes: ["ENTERPRISE_ADMIN"],
    nativeSuperAdministratorGroupCodes: ["adminGroup"],
  },
  historicalLinkRetirementQualified: false,
  enabled: false,
  serializedWritesQualified: false,
  operatorRecoveryQualified: false,
  invitationWithdrawalQualified: false,
  recoveryPresentation: {
    title: "Team operation recovery",
    inspectLabel: "Inspect",
    reviewTitle: "Review committed-operation recovery",
    confirmLabel: "Reconcile committed operation",
    cancelLabel: "Cancel",
    unavailableMessage: "No committed operation is eligible for recovery.",
    uncertainMessage:
      "The operation outcome is unconfirmed. Inspect the same enterprise before another command.",
  },
  presentation: {
    title: "Team administration",
    refreshLabel: "Refresh team",
    emailLabel: "Team member",
    responsibilityLabel: "Responsibility",
    statusLabel: "Status",
    designatedLabel: "Default administrator",
    emptyMessage: "No active team assignments in this enterprise.",
    SUSPEND: "Suspend access",
    REVOKE: "Revoke access",
    RESUME: "Resume access",
    HANDOVER: "Make default administrator",
    WITHDRAW: "Withdraw invitation",
    reviewTitle: "Review team change",
    reviewMessage:
      "Confirm the selected team change. It does not reset credentials or affect customer participation.",
    confirmLabel: "Confirm change",
    cancelLabel: "Cancel",
    inspectLabel: "Inspect current state",
    retryLabel: "Resume same operation",
    uncertainMessage:
      "The change may have applied. Inspect current state before explicitly resuming the same operation. Do not submit another change.",
    pendingMessage:
      "A team operation is pending. New changes are unavailable until its outcome is reconciled.",
    successMessage:
      "The team operation completed. Current team state has been refreshed.",
    reconcileMessage:
      "Registration or membership reconciliation is still required for this assignment.",
    PENDING: "Invitation pending",
    ACTIVE: "Prepared",
    REGISTERED: "Registered",
    SUSPENDED: "Suspended",
    REVOKED: "Revoked",
  },
};

module.exports.enterpriseManagement.notifications = {
  enabled: false,
  qualified: false,
  allowInsecureLoopback: false,
  connectionName: "commsApi",
  timeoutMilliseconds: 10000,
  INVITATION: {
    templateCode: "profile.employee.invitation",
    purpose: "EMPLOYEE_INVITATION",
    locale: "en",
    nextStep:
      "Open your enterprise account page and verify the invited email to review access.",
  },
  ACCOUNT_READY: {
    templateCode: "profile.employee.accountReady",
    purpose: "EMPLOYEE_ACCOUNT_READY",
    locale: "en",
    nextStep:
      "Sign in to your enterprise using your existing account credentials.",
  },
};

module.exports.enterpriseManagement.registration = {
  enabled: false,
  method: "PASSWORD",
  continuationSeconds: 1800,
  maximumInventoryPages: 100,
  pageSize: 100,
  maximumNameLength: 128,
  minimumPasswordLength: 12,
  maximumPasswordLength: { $config: "ref", path: "passwordLengthLimit" },
  requireDistributedRateLimit: true,
  inventoryQualified: false,
  assignmentClaimIndexQualified: false,
  rates: {
    request: { limit: 60, windowSeconds: 60 },
    email: { limit: 5, windowSeconds: 600 },
    complete: { limit: 10, windowSeconds: 600 },
  },
  mail: {
    connectionName: "commsApi",
    templateCode: "profile.employee.emailVerification",
    allowInsecureLoopback: false,
    purpose: "EMPLOYEE_EMAIL_VERIFICATION",
    locale: "en",
    timeoutMilliseconds: 10000,
  },
  endpoints: {
    start: "/nodics/profile/v0/enterprise-access/start",
    verify: "/nodics/profile/v0/enterprise-access/verify",
    resend: "/nodics/profile/v0/enterprise-access/resend",
    status: "/nodics/profile/v0/enterprise-access/status",
    complete: "/nodics/profile/v0/enterprise-access/register",
  },
  presentation: {
    title: "Join your enterprise",
    subtitle: "Verify your work email, then complete your employee account.",
    emailLabel: "Email address",
    emailHelp: "Use the address your enterprise administrator invited.",
    sendLabel: "Send verification code",
    codeLabel: "Verification code",
    codeHelp:
      "Enter the code from your email. You can paste the complete code.",
    verifyLabel: "Verify email",
    resendLabel: "Send a new code",
    statusLabel: "Check progress",
    restartLabel: "Start again",
    enterpriseLabel: "Enterprise",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    passwordLabel: "Password",
    recoveryPasswordLabel: "Password you chose",
    recoveryPasswordHelp:
      "Enter the password from your original registration. Resuming setup does not change it.",
    passwordHelp:
      "Use at least 12 characters. When resuming, use the password you first submitted.",
    existingAccountMessage:
      "Use your existing account password to accept this enterprise invitation. Your account and password will stay unchanged.",
    existingPasswordLabel: "Existing account password",
    existingPasswordHelp: "Enter the password used for your original account.",
    acceptMembershipLabel: "Accept enterprise invitation",
    completeLabel: "Complete registration",
    retryLabel: "Resume registration",
    workingLabel: "Working…",
    signInLabel: "Sign in",
    recoveryLabel: "Forgot password",
    signInPath: "/login",
    recoveryPath: "/forgot-password",
    emailStep: "Verify email",
    detailsStep: "Your details",
    completeStep: "Access ready",
    sentMessage:
      "Your verification request has been accepted. Check your email; delivery may take a moment.",
    deliveryMessage:
      "We could not confirm delivery. Use Send a new code when the resend period has passed.",
    invalidCodeMessage:
      "That code was not accepted. Check the code and try again.",
    lockedCodeMessage:
      "This code can no longer be used. Request a new code when available.",
    resolvingMessage: "Email verified. Checking your enterprise invitation.",
    existingMessage:
      "You already have an account. Sign in rather than registering again. Enterprise membership remains separately authorised.",
    noInvitationMessage:
      "Your email is verified, but no eligible invitation is available. Ask your enterprise administrator to invite you.",
    completeMessage:
      "Registration is complete. Sign in to use your assigned enterprise access.",
    recoveryMessage:
      "Registration needs to finish. Your saved account will not be duplicated. Re-enter your original details and password to resume.",
    statusErrorMessage:
      "Progress could not be confirmed. Keep this page open and check again.",
  },
};
module.exports.enterpriseManagement.accessAssignments.registrationVerification =
  {
    enabled: false,
    mode: "REMOTE",
    connectionName: "commsApi",
    allowInsecureLoopback: false,
    purpose: "ENTERPRISE_EMPLOYEE_REGISTRATION",
    timeoutMilliseconds: 10000,
    maximumResponseBytes: 16384,
  };

// Application intake is independent of approval execution. No enablement is inherited from SMTP.
module.exports.enterpriseManagement.applications = {
  enabled: false,
  maximumChoices: 100,
  maximumNoteLength: 1000,
  pageSize: 25,
  allowedRoleCodes: [
    "OPERATOR",
    "VIEWER",
    "CONTENT_MANAGER",
    "MERCHANT_OPERATOR",
  ],
  reviewPermission: "profile.enterpriseAccess.search",
  submitPath: "/nodics/profile/v0/enterprise-access/apply",
  lifecycle: {
    qualified: false,
    maximumAttempts: 5,
    maximumHistoryBytes: 65536,
    expiryDays: null,
    withdrawPath: "/nodics/profile/v0/enterprise-access/withdraw-application",
  },
  presentation: {
    title: "Request enterprise access",
    description:
      "Choose your enterprise and submit your details for review. This does not create an active employee account.",
    enterpriseLabel: "Enterprise",
    noteLabel: "Message to your administrator",
    noteHelp:
      "Explain which team you are joining. Do not include passwords or sensitive documents.",
    submitLabel: "Submit for review",
    pendingTitle: "Application submitted",
    pendingMessage:
      "Your request is saved and awaiting administrator review. You cannot use employee functions until approval and account setup are complete.",
    previousTitle: "Your submitted applications",
    submittedLabel: "Submitted",
    deadlineLabel: "Deadline",
    pendingLabel: "Awaiting review",
    approvedLabel: "Approved; account setup pending",
    rejectedLabel: "Rejected",
    registeredLabel: "Account setup completed",
    withdrawnLabel: "Withdrawn",
    expiredLabel: "Expired",
    withdrawLabel: "Withdraw application",
    cancelLabel: "Cancel",
    withdrawConfirm:
      "Withdraw this application? It will no longer be eligible for approval.",
    resubmitLabel: "Verify email again to submit a new attempt",
    closedMessage:
      "This application is closed. Verify your email again to submit corrected details if the enterprise still accepts applications.",
    approvedMessage:
      "Your request is approved. Start again with email verification to complete account setup. Approval is not an active login.",
    rejectedMessage:
      "Your request was rejected. Contact the enterprise administrator. This decision grants no employee access.",
    reviewNotConfirmedMessage:
      "Your request is saved, but review startup is not confirmed. Contact your administrator; do not submit a duplicate request.",
  },
  reviewWorkspace: {
    id: "employee-applications",
    label: "Employee applications",
    icon: "users",
    sections: [
      {
        id: "pending-employee-applications",
        type: "listing",
        title: "Employee applications awaiting review",
        endpoint: {
          method: "GET",
          path: "/nodics/profile/v0/enterprise-access/applications",
          resultPath: "items",
        },
        columns: [
          { field: "name", label: "Applicant" },
          { field: "email", label: "Email" },
          { field: "enterpriseName", label: "Enterprise" },
          { field: "status", label: "Status" },
          { field: "submittedAt", label: "Submitted" },
          { field: "note", label: "Message" },
        ],
        filters: [],
      },
    ],
  },
};

// Domain review policy is inert until the deployment qualifies Process and its runtime grants.
module.exports.enterpriseManagement.applications.review = {
  enabled: false,
  retirementQualified: false,
  operatorRecoveryQualified: false,
  recoveryPresentation: {
    title: "Application review recovery",
    inspectLabel: "Inspect",
    reviewTitle: "Review application recovery",
    RETRY_REVIEW_START: "Reconcile review start",
    RETRY_NOTIFICATION: "Reconcile decision notification",
    RETRY_REVIEW_RETIREMENT: "Reconcile closed review",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    uncertainMessage:
      "The outcome is unconfirmed. Inspect the application before another action.",
  },
  definitionCode: "profileEmployeeApplicationReview",
  definitionVersion: 1,
  connectionName: null,
  timeoutMilliseconds: 10000,
  decisionPermission: "profile.enterpriseAccess.assign",
  callbackPermission: "profile.enterpriseAccess.applyDecision",
  mail: {
    enabled: false,
    connectionName: "commsApi",
    templateCode: "profile.employee.applicationOutcome",
    allowInsecureLoopback: false,
    purpose: "EMPLOYEE_APPLICATION_OUTCOME",
    locale: "en",
    approvedNextStep:
      "Open Axis and complete your account setup. Approval alone does not create a login.",
    rejectedNextStep:
      "Contact your enterprise administrator for guidance. This decision grants no employee access.",
  },
};
module.exports.process = {
  actionAdapters: {
    definitions: {
      "profile.applyEmployeeApplicationDecision": {
        moduleName: "profile",
        operation: "applyEmployeeApplicationDecision",
        remote: {
          target: "profile",
          moduleName: "profile",
          runtimeRole: "PLATFORM",
          apiName: "/enterprise-access/applications/process-decision",
          requiresCompletedTask: true,
        },
      },
    },
  },
};
