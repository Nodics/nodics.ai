/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module digitalCore/utils/enums
 * @description Defines bounded DigitalCore integration availability reasons.
 * @layer utils
 * @owner digitalCore
 * @override Later modules may contribute definitions through the standard module hierarchy.
 */
module.exports = {
    CouponRecoveryInspectionStage: { definition: ['ALLOCATION', 'COUPON', 'ORIGINAL_AUTHORIZATION', 'FAILURE_PROOF', 'READBACK', 'EVIDENCE_CONFIRMED'] },
    CouponRecoveryInspectionCondition: { definition: ['ALLOCATION_READ', 'ALLOCATION_IDENTITY', 'ALLOCATION_ISSUER',
        'ALLOCATION_MERCHANT', 'ALLOCATION_OWNER', 'ALLOCATION_COMMAND', 'ALLOCATION_STATE', 'COUPON_READ',
        'COUPON_BINDING', 'ORIGINAL_AUTHORIZATION', 'CHECKPOINT_READ', 'CHECKPOINT_STATE', 'PAYMENT_PENDING',
        'INPUT_STATE', 'PARTICIPANT_BINDING', 'PAYMENT_READ', 'PAYMENT_COUNT', 'DENIAL_PHASES', 'DENIAL_COMMAND',
        'DECISION_READ', 'DECISION_MISMATCH', 'PAYMENT_RECEIPT', 'ORDER_READ', 'ORDER_PRESENT',
        'REVERSAL_INTENT', 'REVERSAL_RECEIPT', 'UNPROVEN_PAYMENT', 'READBACK', 'UNCLASSIFIED', 'NONE'] },
    DigitalOwnershipAvailabilityReason: {
        definition: ['DIGITAL_OWNERSHIP_NOT_SELECTED', 'DIGITAL_OWNERSHIP_NOT_QUALIFIED',
            'DIGITAL_OWNERSHIP_BINDING_UNAVAILABLE']
    }
};
