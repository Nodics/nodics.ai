/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.loyalty/config/properties @description Composes Loyalty baseline data-release contributions. @layer config @owner loyalty @override Later layers may select release placement for deployment-specific programmes. */
module.exports = {
  data: {
    dataReleases: {
      "contributions": {
        "$config": "keyed",
        "key": "moduleName",
        "entries": [
          {
            "moduleName": "loyaltyProgram",
            "sections": {
              "$config": "replace",
              "value": [
                "partnerEligibilityAdministrationPermission"
              ]
            }
          },
          {
            "moduleName": "loyaltyCore",
            "sections": {
              "$config": "replace",
              "value": [
                "sample-enterprises"
              ]
            }
          },
          {
            "moduleName": "loyaltyWallet",
            "sections": {
              "$config": "replace",
              "value": [
                "specialAccessGroups",
                "specialAccessRoles",
                "participantAccessGroups",
                "participantReadAccess",
                "participantTransactionAccess",
                "enterpriseParticipationAccess"
              ]
            }
          }
        ],
        "remove": []
      },
    },
  },
};
