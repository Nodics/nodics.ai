/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteAssetTransferPolicyData @description Provides reusable e-waste transfer policy records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_SALE_TRANSFER_STANDARD',
        name: { en: 'E-Waste Sale Transfer Standard' },
        transferType: 'SELL',
        ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        rewardTransferMode: 'RETAIN_ORIGINAL_OWNER',
        carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        eligibleAssetStatuses: ['LISTED'],
        requiresOwnerApproval: true,
        requiresCounterpartyAcceptance: true,
        requiresReceiptConfirmation: false,
        requiresComplianceReview: false,
        lockRequired: true,
        allowSelfTransfer: false,
        completionAssetStatus: 'SOLD',
        cancellationAssetStatus: 'LISTED',
        reversalAssetStatus: 'OWNED',
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_GIFT_TRANSFER_STANDARD',
        name: { en: 'E-Waste Gift Transfer Standard' },
        transferType: 'GIFT',
        ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        rewardTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        eligibleAssetStatuses: ['OWNED', 'LISTED'],
        requiresOwnerApproval: true,
        requiresCounterpartyAcceptance: true,
        requiresReceiptConfirmation: false,
        requiresComplianceReview: false,
        lockRequired: true,
        allowSelfTransfer: false,
        completionAssetStatus: 'GIFTED',
        cancellationAssetStatus: 'OWNED',
        reversalAssetStatus: 'OWNED',
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record2: {
        code: 'EWASTE_REDEMPTION_TRANSFER_STANDARD',
        name: { en: 'E-Waste Redemption Transfer Standard' },
        transferType: 'REDEEM',
        ownershipTransferMode: 'RETAIN_CURRENT_OWNER',
        rewardTransferMode: 'CONSUME',
        carbonTransferMode: 'TRANSFER_TO_DEFAULT_ENTERPRISE',
        eligibleAssetStatuses: ['OWNED', 'GIFTED'],
        requiresOwnerApproval: true,
        requiresCounterpartyAcceptance: false,
        requiresReceiptConfirmation: false,
        requiresComplianceReview: false,
        lockRequired: true,
        allowSelfTransfer: true,
        completionAssetStatus: 'REDEEMED',
        cancellationAssetStatus: 'OWNED',
        reversalAssetStatus: 'OWNED',
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record3: {
        code: 'EWASTE_DONATION_TRANSFER_STANDARD',
        name: { en: 'E-Waste Donation Transfer Standard' },
        transferType: 'DONATE',
        ownershipTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        rewardTransferMode: 'NONE',
        carbonTransferMode: 'TRANSFER_TO_COUNTERPARTY',
        eligibleAssetStatuses: ['OWNED', 'GIFTED'],
        requiresOwnerApproval: true,
        requiresCounterpartyAcceptance: true,
        requiresReceiptConfirmation: true,
        requiresComplianceReview: true,
        lockRequired: true,
        allowSelfTransfer: false,
        completionAssetStatus: 'DONATED',
        completionCustodyStatus: 'TRANSFERRED_TO_RECYCLER',
        cancellationAssetStatus: 'OWNED',
        reversalAssetStatus: 'OWNED',
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
