/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/utils/enums
 * @description Provides shared profile utility exports for enums.
 * @layer utils
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  ProfileEnterpriseMembershipStatus: {
    _options: {
      name: "ProfileEnterpriseMembershipStatus",
      ignoreCase: false,
      freez: true,
    },
    definition: [
      "PENDING",
      "ACTIVE",
      "REGISTERED",
      "SUSPENDED",
      "EXPIRED",
      "REVOKED",
    ],
  },
  ProfileIdentityAssessmentConsistency: {
    _options: {
      name: "ProfileIdentityAssessmentConsistency",
      ignoreCase: false,
      freez: true,
    },
    definition: ["TWO_PASS_OBSERVED_MATCH"],
  },
  // Wire keys are stable; later layers may add keys but must not rename persisted states.
  ProfileEmployeeAccessStage: {
    _options: {
      name: "ProfileEmployeeAccessStage",
      ignoreCase: false,
      freez: true,
    },
    definition: [
      "VERIFY_EMAIL",
      "RESOLVING",
      "DETAILS",
      "RECOVERY",
      "EXISTING_ACCOUNT",
      "SIGN_IN",
      "NO_INVITATION",
      "COMPLETE",
      "APPLICATION_DETAILS",
      "APPLICATION_PENDING",
      "APPLICATION_APPROVED",
      "APPLICATION_REJECTED",
      "APPLICATION_CLOSED",
      "RESET_PASSWORD",
      "RESETTING",
      "ACCOUNT_UNAVAILABLE",
    ],
  },
  ProfileEmployeeAccessOperation: {
    _options: {
      name: "ProfileEmployeeAccessOperation",
      ignoreCase: false,
      freez: true,
    },
    definition: [
      "START",
      "VERIFY",
      "RESEND",
      "COMPLETE",
      "STATUS",
      "APPLY",
      "WITHDRAW_APPLICATION",
    ],
  },
  ProfileRegistrationPhase: {
    _options: {
      name: "ProfileRegistrationPhase",
      ignoreCase: false,
      freez: true,
    },
    definition: ["PREPARED", "CREDENTIAL", "ACTIVATING", "COMPLETE"],
  },
  ProfileEmployeeApplicationStatus: {
    _options: {
      name: "ProfileEmployeeApplicationStatus",
      ignoreCase: false,
      freez: true,
    },
    definition: [
      "APPLICATION_DRAFT",
      "AWAITING_REVIEW",
      "APPROVED",
      "REJECTED",
      "REGISTERED",
      "WITHDRAWN",
      "EXPIRED",
    ],
  },
  ProfileApplicationReviewOperation: {
    _options: {
      name: "ProfileApplicationReviewOperation",
      ignoreCase: false,
      freez: true,
    },
    definition: [
      "RETRY_REVIEW_START",
      "RETRY_NOTIFICATION",
      "RETRY_REVIEW_RETIREMENT",
    ],
  },
  ProfileEmployeeNotificationStatus: {
    _options: {
      name: "ProfileEmployeeNotificationStatus",
      ignoreCase: false,
      freez: true,
    },
    definition: [
      "PENDING",
      "REQUESTED",
      "NOT_REQUESTED",
      "UNAVAILABLE",
      "UNCONFIRMED",
    ],
  },
  ProfileApplicationReviewStatus: {
    _options: {
      name: "ProfileApplicationReviewStatus",
      ignoreCase: false,
      freez: true,
    },
    definition: ["STARTED", "NOT_CONFIRMED"],
  },
  AddressType: {
    _options: {
      name: "AddressType",
      separator: "|",
      endianness: "BE",
      ignoreCase: false,
      freez: false,
    },
    definition: ["EMAIL", "PHONE", "FAX", "PAGER"],
  },
  ContactType: {
    _options: {
      name: "ContactType",
      separator: "|",
      endianness: "BE",
      ignoreCase: false,
      freez: false,
    },
    definition: ["EMAIL", "PHONE", "FAX", "PAGER"],
  },
};
