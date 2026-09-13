/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/config/properties.js @description Defines deployment-owned bidding eligibility and exact negotiation policy. @layer config @owner bidding */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "bidding": {
                "serviceNames": {
                    "DefaultCheckoutBidService": true
                }
            }
        }
    },

  bidding: {
    enabled: false,
    runtimeRoles: { COMMERCE: true },
    policyVersion: "bid-v2",
    holdTiming: "CHECKOUT_AFTER_ACCEPTANCE",
    validitySeconds: 86400,
    amountScale: 2,
    maximumAmount: "1000000",
    stores: {},
    identityService: "DefaultBiddingIdentityService",
    offerService: "DefaultBiddingOfferService",
  },
  schemaPolicies: {
    bidding: {
      operational: {
        accessGroups: {
          adminGroup: 10,
          commerceOperatorUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
    },
  },
};
