/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/utils/statusDefinitions
 * @description Provides shared profile utility exports for status definitions.
 * @layer utils
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  ERR_PROFILE_RECOVERY_UNAVAILABLE: {
    code: "503",
    message: "Account recovery is unavailable under the current configuration.",
  },
  ERR_PROFILE_RECOVERY_ORIGIN: {
    code: "403",
    message: "Account recovery is not available from this origin.",
  },
  ERR_PROFILE_RECOVERY_INPUT: {
    code: "400",
    message: "Check the recovery information and try again.",
  },
  ERR_PROFILE_RECOVERY_CONTINUATION: {
    code: "409",
    message:
      "Recovery has expired or changed. Start again with email verification.",
  },
  ERR_PROFILE_RECOVERY_DELIVERY: {
    code: "503",
    message: "The recovery email could not be confirmed.",
  },
  ERR_PROFILE_RECOVERY_STORAGE: {
    code: "503",
    message:
      "The saved recovery outcome could not be confirmed. Check progress before trying again.",
  },
  ERR_PROFILE_RECOVERY_CONFLICT: {
    code: "409",
    message:
      "The account or recovery request changed. Verify your email again.",
  },
  ERR_PROFILE_RECOVERY_ACCOUNT: {
    code: "403",
    message:
      "Use the supported account-recovery method or contact your administrator.",
  },
  ERR_PROFILE_RECOVERY_VERIFY_AGAIN: {
    code: "409",
    message: "Verify your email again before changing the password.",
  },

  ERR_PROFILE_REGISTRATION_FORM: {
    code: "400",
    message:
      "Enter a valid name, email and password meeting the account registration requirements.",
  },
  ERR_PROFILE_REGISTRATION_POLICY: {
    code: "503",
    message: "Account registration policy is unavailable.",
  },
  ERR_PROFILE_EXTERNAL_ASSERTION: {
    code: "401",
    message:
      "External identity could not be verified. Sign in securely or reopen the application.",
  },
  ERR_PROFILE_EXTERNAL_CONFLICT: {
    code: "409",
    message: "This external identity cannot be linked to this account.",
  },
  ERR_PROFILE_EXTERNAL_UNAVAILABLE: {
    code: "503",
    message: "External identity integration is unavailable.",
  },
  SUC_PRFL_00000: {
    code: "200",
    message: "Request successfully processed",
  },
  SUC_PRFL_00001: {
    code: "200",
    message: "Request partially processed",
  },
  SUC_PRFL_00002: {
    code: "200",
    message: "Customer exist",
  },

  ERR_PRFL_00000: {
    code: "500",
    message: "Facing internal server error",
  },
  ERR_PRFL_00001: {
    code: "501",
    message: "Operation not implemented",
  },
  ERR_PRFL_00002: {
    code: "503",
    message: "Operation unavailable currently",
  },
  ERR_PRFL_00003: {
    code: "400",
    message: "Invalid request parameters",
  },
  ERR_PROFILE_ENTERPRISE_DUPLICATE: {
    code: "409",
    message: "Enterprise code already exists",
  },
  ERR_PROFILE_SETUP_INSPECTION_POLICY: {
    code: "400",
    message: "Enterprise setup inspection policy is unavailable",
  },
  ERR_PROFILE_SETUP_INSPECTION_AUTHORIZATION: {
    code: "400",
    message: "Enterprise setup inspection authorization was refused",
  },
  ERR_PROFILE_SETUP_INSPECTION_INPUT: {
    code: "400",
    message: "Enterprise setup inspection input is invalid",
  },
  ERR_PROFILE_SETUP_INSPECTION_READ: {
    code: "400",
    message: "Enterprise setup inspection owner read was refused",
  },
  ERR_PROFILE_SETUP_INSPECTION_ASSESSMENT: {
    code: "400",
    message: "Enterprise setup inspection assessment was refused",
  },
  ERR_PRFL_00004: {
    code: "404",
    message: "Data not found",
  },
  ERR_PRFL_00005: {
    code: "400",
    message: "Customer not exist",
  },
  ERR_PRFL_00006: {
    code: "500",
    message: "Customer registration process break",
  },
  ERR_PRFL_00007: {
    code: "400",
    message: "Customer already exist",
  },
};

Object.assign(module.exports, {
  ERR_PROFILE_REG_UNAVAILABLE: {
    code: "503",
    message:
      "Employee registration is not available. Contact your administrator.",
  },
  ERR_PROFILE_REG_INPUT: {
    code: "400",
    message: "Check the registration details and try again.",
  },
  ERR_PROFILE_REG_CONTINUATION: {
    code: "409",
    message:
      "This registration step is busy or has expired. Check progress, or verify your email again.",
  },
  ERR_PROFILE_REG_DELIVERY: {
    code: "503",
    message: "Email delivery could not be confirmed. Please try again later.",
  },
  ERR_PROFILE_REG_STORAGE: {
    code: "503",
    message:
      "Registration progress could not be confirmed. Check progress before trying again.",
  },
  ERR_PROFILE_REG_CONFLICT: {
    code: "409",
    message:
      "Registration details or permissions have changed. Check progress or contact your administrator.",
  },
  ERR_PROFILE_REG_ASSIGNMENT: {
    code: "403",
    message: "This enterprise invitation is no longer available.",
  },
  ERR_PROFILE_REG_EXISTING: {
    code: "409",
    message:
      "An existing account requires sign-in rather than another registration.",
  },
  ERR_PROFILE_REG_VERIFY_AGAIN: {
    code: "409",
    message: "Please verify your email again before continuing.",
  },
  ERR_PROFILE_REG_CREDENTIAL: {
    code: "400",
    message:
      "To resume, enter the password originally submitted. Existing credentials will not be reset.",
  },
});
Object.assign(module.exports, {
  ERR_PROFILE_CONSENT_UNAVAILABLE: {
    code: "503",
    message:
      "Enterprise administration consent is not qualified for this deployment.",
  },
  ERR_PROFILE_CONSENT_FORBIDDEN: {
    code: "403",
    message: "The current authority does not permit this consent operation.",
  },
  ERR_PROFILE_CONSENT_CONFLICT: {
    code: "409",
    message:
      "Consent evidence has changed or cannot be confirmed. Inspect before continuing.",
  },
});
module.exports.ERR_PROFILE_REG_RATE = {
  code: "429",
  message:
    "Please wait before trying again. Verification and resend attempts are limited.",
};

module.exports.ERR_PROFILE_REG_ORIGIN = {
  code: "403",
  message: "Open the official Axis address and try registration again.",
};

Object.assign(module.exports, {
  ERR_PROFILE_APP_UNAVAILABLE: {
    code: "503",
    message: "Employee applications are not available for this deployment.",
  },
  ERR_PROFILE_APP_STORAGE: {
    code: "503",
    message:
      "Application progress could not be confirmed. No approval or access should be assumed.",
  },
  ERR_PROFILE_APP_INPUT: {
    code: "400",
    message: "Check your application details and try again.",
  },
  ERR_PROFILE_APP_VERIFY_AGAIN: {
    code: "409",
    message: "Verify your email again before continuing with your application.",
  },
  ERR_PROFILE_APP_ASSIGNMENT: {
    code: "403",
    message:
      "This enterprise is not available for your application or review request.",
  },
  ERR_PROFILE_APP_CONFLICT: {
    code: "409",
    message:
      "An existing invitation or application needs review. Your existing details have not been replaced.",
  },
  ERR_PROFILE_APP_EXISTING: {
    code: "409",
    message:
      "Sign in with your existing account to request an additional membership.",
  },
});

module.exports.ERR_PROFILE_APP_REVIEW = {
  code: "409",
  message:
    "Application review could not be confirmed. Refresh its status or contact your administrator.",
};

Object.assign(module.exports, {
  ERR_PROFILE_TENANT_PROVISIONING_HELD: {
    code: "409",
    message:
      "Tenant namespace provisioning could not be confirmed. Existing setup evidence and data have been preserved; owner review is required.",
  },
  ERR_PROFILE_CREDENTIAL_OWNERSHIP: {
    code: "409",
    message:
      "Credential mutation requires the exact unchanged canonical owner.",
  },
  ERR_PROFILE_ELIGIBILITY_OWNER: {
    code: "503",
    message:
      "The selected Customer eligibility owner has not confirmed onboarding readiness.",
  },
  ERR_PROFILE_ELIGIBILITY_CONFIGURATION: {
    code: "503",
    message:
      "Customer eligibility policy selection or target placement is not qualified.",
  },
  ERR_PROFILE_ELIGIBILITY_COLLABORATORS: {
    code: "503",
    message:
      "Required Customer eligibility inspection services are unavailable.",
  },
  ERR_PROFILE_ELIGIBILITY_POLICY: {
    code: "503",
    message:
      "An applicable approved published Customer eligibility policy could not be confirmed.",
  },
  ERR_PROFILE_ELIGIBILITY_REGISTRY: {
    code: "503",
    message:
      "Customer eligibility properties or outcomes are unavailable or incompatible with the selected policy.",
  },
  ERR_PROFILE_ELIGIBILITY_AUDIT: {
    code: "503",
    message:
      "Customer eligibility decision audit and invalidation are not qualified.",
  },
  ERR_PROFILE_MEMBERSHIP_UNAVAILABLE: {
    code: "503",
    message: "Enterprise memberships are not qualified for this deployment.",
  },
  ERR_PROFILE_MEMBERSHIP_IDENTITY: {
    code: "403",
    message: "Sign in with the original account before continuing.",
  },
  ERR_PROFILE_MEMBERSHIP_FORBIDDEN: {
    code: "403",
    message: "The current enterprise context does not permit this action.",
  },
  ERR_PROFILE_MEMBERSHIP_ASSIGNMENT: {
    code: "403",
    message: "This enterprise membership is not available.",
  },
  ERR_PROFILE_MEMBERSHIP_CONFLICT: {
    code: "409",
    message: "Membership details have changed. Refresh before trying again.",
  },
  ERR_PROFILE_MEMBERSHIP_STORAGE: {
    code: "503",
    message: "Membership persistence could not be confirmed.",
  },
  ERR_PROFILE_TEAM_UNAVAILABLE: {
    code: "503",
    message: "Team administration is not qualified for this deployment.",
  },
  ERR_PROFILE_TEAM_CONFLICT: {
    code: "409",
    message: "Another team operation requires completion or reconciliation.",
  },
  ERR_PROFILE_TEAM_LAST_ADMIN: {
    code: "409",
    message:
      "Keep an active administrator and complete default administrator handover first.",
  },
});

Object.assign(module.exports, {
  ERR_PROFILE_IDENTITY_ASSESSMENT: {
    code: "503",
    message:
      "Identity assessment unavailable or not authorized. No readiness should be inferred.",
  },
  RSN_PROFILE_IDENTITY_PRINCIPAL_TYPE_REVIEW: {
    code: "200",
    message: "Principal category requires review.",
  },
  RSN_PROFILE_IDENTITY_INVALID_CANONICAL_BINDING: {
    code: "200",
    message:
      "Canonical locator is unresolved, inactive or chained; no automatic repair is permitted.",
  },
  RSN_PROFILE_IDENTITY_CANONICAL_LOGIN_MISMATCH: {
    code: "200",
    message:
      "Projection mailbox differs from its canonical account; authenticated reconciliation is required.",
  },
  RSN_PROFILE_IDENTITY_PROJECTION_CREDENTIAL_COPY: {
    code: "200",
    message:
      "Linked projection unexpectedly retains a credential; do not copy or delete credentials automatically.",
  },
  RSN_PROFILE_IDENTITY_NON_EMAIL_LOGIN_REVIEW: {
    code: "200",
    message: "Legacy non-email login requires review; no rewrite is proposed.",
  },
  RSN_PROFILE_IDENTITY_NORMALIZATION_VARIANT: {
    code: "200",
    message: "Stored login differs from its normalized email.",
  },
  RSN_PROFILE_IDENTITY_MISSING_CREDENTIAL: {
    code: "200",
    message: "Principal credential reference is absent or unresolved.",
  },
  RSN_PROFILE_IDENTITY_CREDENTIAL_LOGIN_MISMATCH: {
    code: "200",
    message: "Credential and principal login references differ.",
  },
  RSN_PROFILE_IDENTITY_UNRESOLVED_GROUP: {
    code: "200",
    message: "Principal group references require review.",
  },
  RSN_PROFILE_IDENTITY_MISSING_REGISTRATION_ASSIGNMENT: {
    code: "200",
    message: "Registration assignment reference is unresolved.",
  },
  RSN_PROFILE_IDENTITY_ORPHAN_CREDENTIAL_REVIEW: {
    code: "200",
    message:
      "Credential has no observed employee or customer reference; do not delete automatically.",
  },
  RSN_PROFILE_IDENTITY_SHARED_CREDENTIAL_REVIEW: {
    code: "200",
    message:
      "Several principals reference one credential; authenticated reconciliation is required.",
  },
  RSN_PROFILE_IDENTITY_UNRESOLVED_PARENT_GROUP: {
    code: "200",
    message: "Group parent reference is unresolved.",
  },
  RSN_PROFILE_IDENTITY_DUPLICATE_EMPLOYEE_EMAIL: {
    code: "200",
    message:
      "Several employees share a normalized email; do not merge automatically.",
  },
  RSN_PROFILE_IDENTITY_DUPLICATE_CUSTOMER_EMAIL: {
    code: "200",
    message:
      "Several customers share a normalized email; preserve their histories.",
  },
  RSN_PROFILE_IDENTITY_UNPROVEN_DUAL_IDENTITY: {
    code: "200",
    message:
      "Employee and customer email match does not prove common identity.",
  },
  RSN_PROFILE_IDENTITY_ASSIGNMENT_EMAIL_REVIEW: {
    code: "200",
    message: "Assignment email normalization requires review.",
  },
  RSN_PROFILE_IDENTITY_MISSING_ENTERPRISE: {
    code: "200",
    message: "Assignment enterprise reference is unresolved.",
  },
  RSN_PROFILE_IDENTITY_ASSIGNMENT_TENANT_MISMATCH: {
    code: "200",
    message: "Assignment placement differs from the enterprise tenant.",
  },
  RSN_PROFILE_IDENTITY_REGISTRATION_IN_PROGRESS: {
    code: "200",
    message: "Preserve the original registration checkpoint and credentials.",
  },
  RSN_PROFILE_IDENTITY_MISSING_REGISTERED_EMPLOYEE: {
    code: "200",
    message: "Registered assignment has no matching employee login.",
  },
  RSN_PROFILE_IDENTITY_MISSING_REGISTRATION_ARTIFACT: {
    code: "200",
    message: "Saved registration artifact reference is unresolved.",
  },
  RSN_PROFILE_IDENTITY_DUPLICATE_IDENTITY_CLAIM: {
    code: "200",
    message: "Several assignments claim the same new identity reservation.",
  },
  RSN_PROFILE_IDENTITY_ASSIGNMENT_PRINCIPAL_MISMATCH: {
    code: "200",
    message: "Registration assignment is bound to another principal or tenant.",
  },
});
