/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/config/properties @description Provides shared Waste defaults. @layer config @owner wasteCore @override Partner modules may refine policy through configuration layering. */
module.exports = {

  enterpriseManagement: {
    accessAssignments: {
      roles: {
        WASTE_CENTRE_OPERATOR: {
          label: "Collection centre operator",
          description:
            "Collection centre operator within the assigned enterprise or collection-centre scope.",
          groupCodes: ["wasteCentreOperatorUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        WASTE_VERIFIER: {
          label: "Waste verifier",
          description:
            "Waste verifier within the assigned enterprise or collection-centre scope.",
          groupCodes: ["wasteVerifierUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        WASTE_APPROVER: {
          label: "Waste approver",
          description:
            "Waste approver within the assigned enterprise or collection-centre scope.",
          groupCodes: ["wasteApproverUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        WASTE_COUPON_MANAGER: {
          label: "Coupon manager",
          description:
            "Coupon manager within the assigned enterprise or collection-centre scope.",
          groupCodes: ["wasteCouponManagerUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        WASTE_MARKETPLACE_MODERATOR: {
          label: "Marketplace moderator",
          description:
            "Marketplace moderator within the assigned enterprise or collection-centre scope.",
          groupCodes: ["wasteMarketplaceModeratorUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
        WASTE_AUDITOR: {
          label: "Waste auditor",
          description:
            "Waste auditor within the assigned enterprise or collection-centre scope.",
          groupCodes: ["wasteAuditorUserGroup"],
          scopeType: "ENTERPRISE",
          delegable: true,
          assignmentPermissions: [],
        },
      },
    },
  },
  schemaPolicies: {
    wasteCore: {
      operational: {
        accessGroups: {
          adminGroup: 10,
          serviceAccountUserGroup: 10,
          employeeUserGroup: 10,
        },
      },
    },
  },
  waste: {
    reviewWorkspace: { views: {
        'waste.overview': { ownerModule: 'wasteCore', label: 'Waste overview', mode: 'OVERVIEW' },
        'waste.submissions': { ownerModule: 'wasteCore', label: 'All submissions', mode: 'SUBMISSIONS' },
        'waste.reviewQueue': { ownerModule: 'wasteCore', label: 'Waste review queue', mode: 'REVIEW_QUEUE' }
    } },
    operations: {
      maximumScopePoints: 10000,
      defaultReviewQueue: "WASTE_REVIEW",
      presentation: {
        title: "Waste verification and approval",
        verifyAction: "Review verification",
        verifyTitle: "Confirm verified facts",
        verifyExplanation:
          "Save verified facts for an independent approver. Verification does not create an asset or issue rewards.",
        verifySaved:
          "Verification saved. A different employee can now make the final decision.",
        verificationRequired:
          "Independent verification is required before a final decision.",
        differentApproverRequired:
          "Another employee must make the final decision.",
        readOnly:
          "Your assigned role can view this queue without changing decisions.",
        auditAction: "View review audit",
        auditTitle: "Waste review audit",
      },
      requireScopes: false,
      requireVerification: false,
      requireDifferentApprover: false,
      profileTarget: { connectionName: "profile", runtimeRole: "PLATFORM" },
    },
    sourceReference: { requiredFields: ["module", "schema", "code"] },
    idempotency: { required: true },
  },
};
