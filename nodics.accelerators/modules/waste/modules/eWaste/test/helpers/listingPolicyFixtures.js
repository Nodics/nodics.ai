/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/helpers/listingPolicyFixtures @description Synthetic active supported policies for real owner validation, never imported data or native qualification. @layer test @owner eWaste */
module.exports = {
  /** Returns detached records with caller-selected inert codes. */
  rows: function (transfer = "transfer", reward = "reward", carbon = "carbon") {
    return {
      wasteAssetTransferPolicy: {
        code: transfer,
        active: true,
        status: "ACTIVE",
        revision: 1,
        transferType: "SELL",
        ownershipTransferMode: "TRANSFER_TO_COUNTERPARTY",
        completionAssetStatus: "SOLD",
        cancellationAssetStatus: "LISTED",
        allowSelfTransfer: false,
        lockRequired: true,
        rewardTransferMode: "RETAIN_ORIGINAL_OWNER",
        carbonTransferMode: "NONE",
        metadata: {
          digitalOwnership: {
            reservationSeconds: 600,
            refund: "ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER",
          },
        },
      },
      wasteRewardSettlementPolicy: {
        code: reward,
        active: true,
        status: "ACTIVE",
        revision: 1,
        triggerType: "SALE",
        settlementMode: "POLICY_RESOLVED",
        walletCurrencyCode: "POINTS",
        metadata: {
          digitalOwnership: {
            version: 1,
            proceeds: "CAPTURED_TOTAL",
            payee: "CURRENT_SELLER",
            programCode: "program",
            rewardTypeCode: "points",
            scale: 2,
          },
        },
      },
      wasteCarbonSettlementPolicy: {
        code: carbon,
        active: true,
        status: "ACTIVE",
        revision: 1,
        triggerType: "SALE",
        settlementMode: "NONE",
      },
    };
  },
};
