/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nodics.loyalty/config/properties @description Defines reusable Loyalty defaults and baseline data-release contributions. @layer config @owner loyalty @override Later layers may override scale, reservation TTL, idempotency policy and release placement for deployment-specific programmes. */
module.exports = {
  "loyalty": {
    "defaults": {
      "amountScale": 2,
      "reservationTtlSeconds": 900,
      "idempotencyRequired": true
    }
  },
  "data": {
    "dataReleases": {
      "runtimeRoleProfiles": {
        "PLATFORM": {
          "contributions": [
            {
              "moduleName": "loyaltyCore",
              "sections": [
                "core-enterprise-reference"
              ]
            }
          ]
        }
      }
    }
  }
};
