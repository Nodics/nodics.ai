/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCarbon/utils/enums @description Stable Carbon wire vocabulary loaded by nConfig. Definitions do not authorize transitions, evidence or ownership changes. @owner wasteCarbon @layer utility @override Extend through layered enums while preserving persisted keys and independent owner guards. */
module.exports = {
    WasteCarbonLotState: {
        definition: Object.freeze({ PROSPECTIVE: 'PROSPECTIVE', REALIZED: 'REALIZED' })
    },
    WasteCarbonAllocationKind: {
        definition: Object.freeze({ CONTRIBUTOR: 'CONTRIBUTOR', PARTNER: 'PARTNER' })
    },
    WasteCarbonHoldingState: {
        definition: Object.freeze({
            RESERVED: 'RESERVED', TRANSFERRED: 'TRANSFERRED', COMPLETED: 'COMPLETED',
            HELD: 'HELD', RELEASED: 'RELEASED'
        })
    },
    WasteCarbonOperation: {
        definition: Object.freeze({ RESERVE: 'RESERVE', TRANSFER: 'TRANSFER', FINALIZE: 'FINALIZE', RELEASE: 'RELEASE' })
    },
    WasteCarbonEligibility: {
        definition: Object.freeze({ NOT_CHECKED: 'NOT_CHECKED', ELIGIBLE: 'ELIGIBLE' })
    }
};
