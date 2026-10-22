/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyWallet/src/utils/enums @description Exports Loyalty Wallet-local enum contributions. @layer utility @owner loyaltyWallet */
module.exports = {
    LoyaltyPartnerIntegrationStatus: { definition: ['ACTIVE', 'PAUSED', 'RETIRED'] },
    LoyaltyProtectedHoldPolicy: { definition: ["EXTERNAL_OUTCOME","AUCTION_ROUND"] },
    LoyaltyPartnerAccountStatus: { definition: ["VERIFIED","REVOKED"] },
    LoyaltyPartnerConversionStatus: { definition: ["QUOTED","HOLDING","HELD","SUBMITTED","CREDIT_CONFIRMED","NO_CREDIT_CONFIRMED","COMPLETED","REJECTED","EXPIRED"] },
    LoyaltyPartnerCreditOutcome: { definition: ["PENDING","UNKNOWN","CREDITED","NOT_CREDITED"] },
    LoyaltyTransferStatus: { definition: ["COMPLETED","UNCONFIRMED"] },
    LoyaltyTransferNotificationStatus: { definition: ["NOT_REQUESTED","UNCONFIRMED","RECORDED","ACCEPTED","QUEUED","DELIVERING","DELIVERED","RETRY_PENDING","UNCERTAIN","SUPPRESSED","FAILED","CANCELLED","DEAD_LETTER","UNCONFIGURED"] },
    LoyaltyTestCreditStatus: { definition: ["CURRENT","CREDIT_ONCE","CREDITED"] }
};
