/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/interceptors/interceptors
 * @description Registers profile interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  ...Object.fromEntries([
    ["preGet", "protectRead"], ["preSave", "protectSave"],
    ["preUpdate", "protectUpdate"], ["preRemove", "protectRemove"],
    ["postGet", "redact"], ["postSave", "redact"], ["postUpdate", "redact"],
  ].map(([trigger, method]) => ["tenantProvisioning_" + trigger, {
    type: "schema", item: "tenant", trigger, active: "true", index: trigger.startsWith("pre") ? -60 : 60,
    handler: "DefaultTenantProvisioningGuardService." + method,
  }])),
  redactEnterpriseTenantProvisioning: {
    type: "schema", item: "enterprise", trigger: "postGet", active: "true", index: 60,
    handler: "DefaultTenantProvisioningGuardService.redact",
  },
  // Consent source generations are invalidated around the existing generated owners, never restored after a failed source mutation.
  ...Object.fromEntries(
    [
      "enterprise",
      "employee",
      "password",
      "userGroup",
      "principalScopeAssignment",
      "enterpriseAccessAssignment",
    ].flatMap((item) =>
      ["Save", "Update", "Remove"].flatMap((operation) => [
        [
          "prepareConsentSource_" + item + "_" + operation,
          {
            type: "schema",
            item,
            trigger: "pre" + operation,
            active: "true",
            index: 50,
            handler:
              "DefaultEnterpriseAdministrationConsentService.prepareExternalMutation",
          },
        ],
        [
          "finalizeConsentSource_" + item + "_" + operation,
          {
            type: "schema",
            item,
            trigger: "post" + operation,
            active: "true",
            index: 50,
            handler:
              "DefaultEnterpriseAdministrationConsentService.finalizeExternalMutation",
          },
        ],
      ]),
    ),
  ),
  protectEnterpriseConsentSave: {
    type: "schema",
    item: "enterprise",
    trigger: "preSave",
    active: "true",
    index: -40,
    handler: "DefaultEnterpriseAdministrationConsentService.protectSave",
  },
  protectEnterpriseConsentUpdate: {
    type: "schema",
    item: "enterprise",
    trigger: "preUpdate",
    active: "true",
    index: -40,
    handler: "DefaultEnterpriseAdministrationConsentService.protect",
  },
  protectEnterpriseConsentRemove: {
    type: "schema",
    item: "enterprise",
    trigger: "preRemove",
    active: "true",
    index: -40,
    handler: "DefaultEnterpriseAdministrationConsentService.protectRemove",
  },
  redactEnterpriseConsent: {
    type: "schema",
    item: "enterprise",
    trigger: "postGet",
    active: "true",
    index: 40,
    handler: "DefaultEnterpriseAdministrationConsentService.redact",
  },
  redactEnterpriseTeamEvidence: {
    type: "schema",
    item: "enterprise",
    trigger: "postGet",
    active: "true",
    index: 41,
    handler: "DefaultEnterpriseTeamAdministrationService.redactEnterprise",
  },
  ...Object.fromEntries([
    ["preGet", "protectRead", -45],
    ["preSave", "protectMutation", -45],
    ["preUpdate", "protectMutation", -45],
    ["preRemove", "protectMutation", -45],
    ["postGet", "redactEnterprise", 42],
    ["postSave", "redactEnterprise", 42],
    ["postUpdate", "redactEnterprise", 42],
    ["postRemove", "redactEnterprise", 42],
  ].map(([trigger, method, index]) => [
    "enterpriseSetupContinuation_" + trigger,
    {
      type: "schema",
      item: "enterprise",
      trigger,
      active: "true",
      index,
      handler: "DefaultEnterpriseSetupContinuationService." + method,
    },
  ])),
  protectMembershipEmployeeSave: {
    type: "schema",
    item: "employee",
    trigger: "preSave",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectPrincipalSave",
  },
  protectMembershipEmployeeUpdate: {
    type: "schema",
    item: "employee",
    trigger: "preUpdate",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectPrincipal",
  },
  protectMembershipCustomerSave: {
    type: "schema",
    item: "customer",
    trigger: "preSave",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectPrincipalSave",
  },
  protectCustomerParticipationSave: {
    type: "schema",
    item: "customer",
    trigger: "preSave",
    active: "true",
    index: -31,
    handler: "DefaultCustomerRegistrationService.protectParticipation",
  },
  protectCustomerParticipationUpdate: {
    type: "schema",
    item: "customer",
    trigger: "preUpdate",
    active: "true",
    index: -31,
    handler: "DefaultCustomerRegistrationService.protectParticipation",
  },
  protectMembershipCustomerUpdate: {
    type: "schema",
    item: "customer",
    trigger: "preUpdate",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectPrincipal",
  },
  protectEnterpriseMembershipSave: {
    type: "schema",
    item: "enterpriseAccessAssignment",
    trigger: "preSave",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectAssignment",
  },
  protectEnterpriseMembershipUpdate: {
    type: "schema",
    item: "enterpriseAccessAssignment",
    trigger: "preUpdate",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectAssignment",
  },
  protectEnterpriseMembershipRemove: {
    type: "schema",
    item: "enterpriseAccessAssignment",
    trigger: "preRemove",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseMembershipService.protectAssignment",
  },
  protectEnterpriseTeamUpdate: {
    type: "schema",
    item: "enterprise",
    trigger: "preUpdate",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseTeamAdministrationService.protectEnterprise",
  },
  protectEnterpriseTeamSave: {
    type: "schema",
    item: "enterprise",
    trigger: "preSave",
    active: "true",
    index: -30,
    handler: "DefaultEnterpriseTeamAdministrationService.protectEnterpriseSave",
  },
  protectEnterpriseTeamRemove: {
    type: "schema",
    item: "enterprise",
    trigger: "preRemove",
    active: "true",
    index: -30,
    handler:
      "DefaultEnterpriseTeamAdministrationService.protectEnterpriseRemove",
  },
  validateUserGroupSave: {
    type: "schema",
    item: "userGroup",
    trigger: "preSave",
    active: "true",
    index: -20,
    handler: "DefaultUserGroupGovernanceService.validate",
  },
  validateUserGroupUpdate: {
    type: "schema",
    item: "userGroup",
    trigger: "preUpdate",
    active: "true",
    index: -20,
    handler: "DefaultUserGroupGovernanceService.validate",
  },
  validateEmployeeSave: {
    type: "schema",
    item: "employee",
    trigger: "preSave",
    active: "true",
    index: -20,
    handler: "DefaultPrincipalGovernanceService.validateSave",
  },
  validateEmployeeUpdate: {
    type: "schema",
    item: "employee",
    trigger: "preUpdate",
    active: "true",
    index: -20,
    handler: "DefaultPrincipalGovernanceService.validateUpdate",
  },
  validateCustomerSave: {
    type: "schema",
    item: "customer",
    trigger: "preSave",
    active: "true",
    index: -20,
    handler: "DefaultPrincipalGovernanceService.validateSave",
  },
  validateCustomerUpdate: {
    type: "schema",
    item: "customer",
    trigger: "preUpdate",
    active: "true",
    index: -20,
    handler: "DefaultPrincipalGovernanceService.validateUpdate",
  },
  validatePrincipalScopeAssignmentSave: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "preSave",
    active: "true",
    index: -20,
    handler: "DefaultPrincipalScopeGovernanceService.validateSave",
  },
  validatePrincipalScopeAssignmentUpdate: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "preUpdate",
    active: "true",
    index: -20,
    handler: "DefaultPrincipalScopeGovernanceService.validateUpdate",
  },
  prepareHumanScopeSave: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "preSave",
    active: "true",
    index: -10,
    handler: "DefaultPrincipalScopeGovernanceService.prepareScopeSave",
  },
  prepareRuntimeScopeRemoval: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "preRemove",
    active: "true",
    index: 20,
    handler:
      "DefaultPrincipalScopeGovernanceService.prepareRuntimeScopeRemoval",
  },
  invalidateRuntimeScopeSave: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "postSave",
    active: "true",
    index: 20,
    handler:
      "DefaultPrincipalScopeGovernanceService.invalidateRuntimeScopeCredentials",
  },
  invalidateRuntimeScopeUpdate: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "postUpdate",
    active: "true",
    index: 20,
    handler:
      "DefaultPrincipalScopeGovernanceService.invalidateRuntimeScopeCredentials",
  },
  invalidateRuntimeScopeRemoval: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "postRemove",
    active: "true",
    index: 20,
    handler:
      "DefaultPrincipalScopeGovernanceService.invalidateRuntimeScopeCredentials",
  },
  prepareEmployeeSecurityStamp: {
    type: "schema",
    item: "employee",
    trigger: "preUpdate",
    active: "true",
    index: -10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.preparePrincipalUpdate",
  },
  invalidateHumanScopeSave: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "postSave",
    active: "true",
    index: 30,
    handler:
      "DefaultPrincipalScopeGovernanceService.invalidateScopeCredentials",
  },
  invalidateHumanScopeUpdate: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "postUpdate",
    active: "true",
    index: 30,
    handler:
      "DefaultPrincipalScopeGovernanceService.invalidateScopeCredentials",
  },
  invalidateHumanScopeRemoval: {
    type: "schema",
    item: "principalScopeAssignment",
    trigger: "postRemove",
    active: "true",
    index: 30,
    handler:
      "DefaultPrincipalScopeGovernanceService.invalidateScopeCredentials",
  },
  registerEmployeeSecurityStamp: {
    type: "schema",
    item: "employee",
    trigger: "postUpdate",
    active: "true",
    index: 10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.registerPreparedPrincipalUpdate",
  },
  prepareCustomerSecurityStamp: {
    type: "schema",
    item: "customer",
    trigger: "preUpdate",
    active: "true",
    index: -10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.preparePrincipalUpdate",
  },
  registerCustomerSecurityStamp: {
    type: "schema",
    item: "customer",
    trigger: "postUpdate",
    active: "true",
    index: 10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.registerPreparedPrincipalUpdate",
  },
  bumpGroupMemberSecurityStamps: {
    type: "schema",
    item: "userGroup",
    trigger: "preUpdate",
    active: "true",
    index: 10,
    handler: "DefaultPrincipalSecurityStampGovernanceService.bumpGroupMembers",
  },
  invalidateRemovedEmployeeSecurityStamps: {
    type: "schema",
    item: "employee",
    trigger: "preRemove",
    active: "true",
    index: -10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.preparePrincipalRemoval",
  },
  invalidateRemovedCustomerSecurityStamps: {
    type: "schema",
    item: "customer",
    trigger: "preRemove",
    active: "true",
    index: -10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.preparePrincipalRemoval",
  },
  invalidateRemovedGroupSecurityStamps: {
    type: "schema",
    item: "userGroup",
    trigger: "preRemove",
    active: "true",
    index: 10,
    handler: "DefaultPrincipalSecurityStampGovernanceService.bumpGroupMembers",
  },
  finalizeGroupMemberSecurityStamps: {
    type: "schema",
    item: "userGroup",
    trigger: "postUpdate",
    active: "true",
    index: 10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.invalidatePreparedGroupMembers",
  },
  finalizeRemovedGroupSecurityStamps: {
    type: "schema",
    item: "userGroup",
    trigger: "postRemove",
    active: "true",
    index: 10,
    handler:
      "DefaultPrincipalSecurityStampGovernanceService.invalidatePreparedGroupMembers",
  },
  bumpPasswordOwnerSecurityStamp: {
    type: "schema",
    item: "password",
    trigger: "postUpdate",
    active: "true",
    index: 10,
    handler: "DefaultPrincipalSecurityStampGovernanceService.bumpLoginId",
  },
  guardPasswordSaveOwnership: {
    type: "schema",
    item: "password",
    trigger: "preSave",
    active: "true",
    index: -60,
    handler: "DefaultPasswordSaveInterceptorService.guardSaveOwnership",
  },
  guardPasswordUpdateOwnership: {
    type: "schema",
    item: "password",
    trigger: "preUpdate",
    active: "true",
    index: -60,
    handler: "DefaultPasswordSaveInterceptorService.guardUpdateOwnership",
  },
  encryptSavePassword: {
    type: "schema",
    item: "password",
    trigger: "preSave",
    active: "true",
    index: 0,
    handler: "DefaultPasswordSaveInterceptorService.encryptPassword",
  },
  encryptUpdatePassword: {
    type: "schema",
    item: "password",
    trigger: "preUpdate",
    active: "true",
    index: 0,
    handler: "DefaultPasswordSaveInterceptorService.encryptPassword",
  },

  customerPreUpdate: {
    type: "schema",
    item: "customer",
    trigger: "preUpdate",
    active: "true",
    index: 0,
    handler: "DefaultCustomerUpdateInterceptorService.customerPreUpdate",
  },
  customerPreRemove: {
    type: "schema",
    item: "customer",
    trigger: "preRemove",
    active: "true",
    index: 0,
    handler: "DefaultCustomerUpdateInterceptorService.customerPreRemove",
  },

  saveAPIKey: {
    type: "schema",
    item: "employee",
    trigger: "preSave",
    active: "true",
    index: 0,
    handler: "DefaultAPIKeyInterceptorService.generateAPIKey",
  },
  updateAPIKey: {
    type: "schema",
    item: "employee",
    trigger: "preUpdate",
    active: "true",
    index: 0,
    handler: "DefaultAPIKeyInterceptorService.generateAPIKey",
  },
  employeePreUpdate: {
    type: "schema",
    item: "employee",
    trigger: "preUpdate",
    active: "true",
    index: 0,
    handler: "DefaultEmployeeUpdateInterceptorService.employeePreUpdate",
  },
  employeePreRemove: {
    type: "schema",
    item: "employee",
    trigger: "preRemove",
    active: "true",
    index: 0,
    handler: "DefaultEmployeeUpdateInterceptorService.employeePreRemove",
  },
  employeeGetRecursice: {
    type: "schema",
    item: "employee",
    trigger: "preGet",
    active: "true",
    index: 0,
    handler: "DefaultEmployeeGetInterceptorService.getEmployeeRecursive",
  },
  employeeUserGroupCodes: {
    type: "schema",
    item: "employee",
    trigger: "postGet",
    active: "true",
    index: 0,
    handler: "DefaultEmployeeGetInterceptorService.getAllUserGroupCodes",
  },
  customerGetRecursice: {
    type: "schema",
    item: "customer",
    trigger: "preGet",
    active: "true",
    index: 0,
    handler: "DefaultCustomerGetInterceptorService.getCustomerRecursive",
  },
  customerUserGroupCodes: {
    type: "schema",
    item: "customer",
    trigger: "postGet",
    active: "true",
    index: 0,
    handler: "DefaultCustomerGetInterceptorService.getAllUserGroupCodes",
  },
  enterprisePreSave: {
    type: "schema",
    item: "enterprise",
    trigger: "preSave",
    active: "true",
    index: 0,
    handler: "DefaultEnterpriseUpdateInterceptorService.enterprisePreSave",
  },
  enterprisePreUpdate: {
    type: "schema",
    item: "enterprise",
    trigger: "preUpdate",
    active: "true",
    index: 0,
    handler: "DefaultEnterpriseUpdateInterceptorService.enterprisePreUpdate",
  },
  enterprisePreRemove: {
    type: "schema",
    item: "enterprise",
    trigger: "preRemove",
    active: "true",
    index: 0,
    handler: "DefaultEnterpriseUpdateInterceptorService.enterprisePreRemove",
  },
  enterpriseSaveEvent: {
    type: "schema",
    item: "enterprise",
    trigger: "postSave",
    active: "true",
    index: 0,
    handler: "DefaultEnterpriseUpdateInterceptorService.enterpriseSaveEvent",
  },
  enterpriseUpdateEvent: {
    type: "schema",
    item: "enterprise",
    trigger: "postUpdate",
    active: "true",
    index: 0,
    handler: "DefaultEnterpriseUpdateInterceptorService.enterpriseUpdateEvent",
  },
  enterpriseRemoveEvent: {
    type: "schema",
    item: "enterprise",
    trigger: "postRemove",
    active: "true",
    index: 0,
    handler: "DefaultEnterpriseUpdateInterceptorService.enterpriseRemoveEvent",
  },
  customerLoginIdValidator: {
    type: "schema",
    item: "customer",
    trigger: "preSave",
    active: "true",
    index: 0,
    handler: "DefaultCustomerLoginIdInterceptorService.validateLoginId",
  },
};

for (const item of ["employee", "customer"]) {
  for (const trigger of ["preSave", "preUpdate"]) {
    module.exports["guardCredentialOwnership_" + item + "_" + trigger] = {
      type: "schema",
      item,
      trigger,
      active: "true",
      index: -60,
      handler: "DefaultPasswordSaveInterceptorService.guardPrincipalCredential",
    };
  }
}

// Retained historical-link proof is privately admitted by request identity, never body flags.
for (const item of [
  "employee",
  "customer",
  "password",
  "identityMigrationAudit",
]) {
  for (const trigger of ["preSave", "preUpdate", "preRemove"]) {
    module.exports["protectHistoricalLink_" + item + "_" + trigger] = {
      type: "schema",
      item,
      trigger,
      active: "true",
      index: -50,
      handler: "DefaultCanonicalHistoricalIdentityLinkService.protectMutation",
    };
  }
}
module.exports.protectHistoricalLinkAuditRead = {
  type: "schema",
  item: "identityMigrationAudit",
  trigger: "preGet",
  active: "true",
  index: -50,
  handler: "DefaultCanonicalHistoricalIdentityLinkService.protectRead",
};
for (const item of ["employee", "customer", "password"]) {
  module.exports["redactHistoricalLinkRetirement_" + item] = {
    type: "schema",
    item,
    trigger: "postGet",
    active: "true",
    index: 45,
    handler: "DefaultCanonicalHistoricalIdentityLinkService.redactRetirement",
  };
}

// Default-off qualification keeps unchanged owner paths until precise provisioning admission is accepted.
for (const [item, name] of [
  ["employee", "Employee"],
  ["userGroup", "Group"],
  ["principalScopeAssignment", "Scope"],
]) {
  for (const [trigger, operation] of [
    ["preSave", "Save"],
    ["preUpdate", "Update"],
    ["preRemove", "Remove"],
  ]) {
    module.exports["protectAdministrator_" + item + "_" + trigger] = {
      type: "schema",
      item,
      trigger,
      active: "true",
      index: -35,
      handler:
        "DefaultEnterpriseTeamAdministrationService.protectAdministrator" +
        name +
        operation,
    };
  }
}

// BEGIN verified-contact fixed generated hooks; this appended block is independently owned.
for (const item of ["contact", "employee", "customer"]) {
  for (const [trigger, suffix, index] of [
    ["preSave", "PreSave", -45],
    ["preUpdate", "PreUpdate", -45],
    ["preRemove", "PreRemove", -45],
    ["preGet", "PreGet", -45],
    ["postGet", "PostGet", 46],
  ]) {
    module.exports["protectVerifiedContact_" + item + "_" + trigger] = {
      type: "schema",
      item,
      trigger,
      active: "true",
      index,
      handler:
        "DefaultProfileVerifiedContactInterceptorService." + item + suffix,
    };
  }
}
// END verified-contact fixed generated hooks.

// Profile owns eligibility audit/privacy and published Rules consumer invalidation.
for (const [trigger, handler, index] of [
  ["preSave", "protectMutation", -30],
  ["preSave", "protectSave", -29],
  ["preUpdate", "protectMutation", -30],
  ["preRemove", "protectRemoval", -30],
  ["preGet", "protectRead", -30],
  ["postGet", "redactDecision", 50],
  ["postSave", "redactDecision", 50],
  ["postUpdate", "redactDecision", 50],
  ["preUpdate", "prepareCustomerFactsChange", -20],
  ["postUpdate", "completeCustomerFactsChange", 40],
]) {
  module.exports["customerEligibility_" + trigger + "_" + handler] = {
    type: "schema",
    item: "customer",
    trigger,
    active: "true",
    index,
    handler: "DefaultCustomerEligibilityDecisionGovernanceService." + handler,
  };
}
for (const trigger of [
  "preSave",
  "preUpdate",
  "preRemove",
  "postSave",
  "postUpdate",
  "postRemove",
]) {
  const before = trigger.startsWith("pre");
  module.exports["customerEligibilityPolicy_" + trigger] = {
    type: "schema",
    item: "ruleSetVersion",
    trigger,
    active: "true",
    index: before ? -30 : 50,
    handler:
      "DefaultCustomerEligibilityDecisionGovernanceService." +
      (before ? "preparePolicyChange" : "completePolicyChange"),
  };
}
// Preserve the existing stamp owner; only exact private metadata CAS inventory gets adapted.
module.exports.prepareCustomerSecurityStamp.handler =
  "DefaultCustomerEligibilityDecisionGovernanceService.prepareCustomerSecurityStamp";
