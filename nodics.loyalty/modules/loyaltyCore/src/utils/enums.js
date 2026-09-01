/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyCore/src/utils/enums @description Defines provider-neutral Loyalty enum contributions. @layer utility @owner loyaltyCore @override Later modules may add supported values without redefining meanings. */
module.exports = {
    LoyaltyOwnerType: { definition: ['CUSTOMER', 'EMPLOYEE', 'ENTERPRISE', 'PARTNER', 'SYSTEM'] },
    LoyaltyProgramStatus: { definition: ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] },
    LoyaltyRewardTypeStatus: { definition: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'] },
    LoyaltyWalletStatus: { definition: ['OPEN', 'SUSPENDED', 'CLOSED'] },
    LoyaltyLedgerEntryType: { definition: ['EARN', 'RESERVE', 'CAPTURE', 'RELEASE', 'EXPIRE', 'ADJUST', 'REVERSE'] },
    LoyaltyReservationStatus: { definition: ['RESERVED', 'CAPTURED', 'RELEASED', 'EXPIRED', 'REVERSED'] },
    LoyaltyRedemptionStatus: { definition: ['CREATED', 'CAPTURED', 'RELEASED', 'REVERSED', 'FAILED'] },
    LoyaltyOperationType: { definition: ['EARN', 'RESERVE', 'CAPTURE', 'RELEASE', 'EXPIRE', 'ADJUST', 'REVERSE'] },
    LoyaltyRewardUnitType: { definition: ['POINT', 'CREDIT', 'STAMP', 'TOKEN', 'CUSTOM'] },
    LoyaltyTargetType: { definition: ['ORDER', 'CART', 'ENTRY', 'BENEFIT', 'ADJUSTMENT', 'EXTERNAL'] }
};
