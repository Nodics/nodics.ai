/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/config/properties @description Defines loyaltyWallet schema access policy. @layer config @owner loyaltyWallet */
module.exports = {
  schemaPolicies: {
    loyaltyWallet: {
      operational: {
        accessGroups: {
          adminGroup: 10,
          serviceAccountUserGroup: 10,
          employeeUserGroup: 10,
        },
      },
    },
  },
  localResetProvider: {
    contributions: {
      loyaltyWallet: {
        serviceNames: {
          DefaultLoyaltyWalletRewardBalanceService: true,
          DefaultLoyaltyWalletService: true,
        },
      },
    },
  },
};
