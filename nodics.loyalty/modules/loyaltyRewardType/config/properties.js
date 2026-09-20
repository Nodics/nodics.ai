/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRewardType/config/properties @description Defines loyaltyRewardType schema access policy. @layer config @owner loyaltyRewardType */
module.exports = {
  schemaPolicies: {
    loyaltyRewardType: {
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
      loyaltyRewardType: {
        serviceNames: {
          DefaultLoyaltyRewardTypeService: true,
        },
      },
    },
  },
};
