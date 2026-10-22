/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteReward/src/utils/enums @description Stable Waste reward assessment enums. @layer utility @owner wasteReward */
module.exports = {
    WasteMaterialReleaseStatus: { definition: ["AWAITING_PAYMENT","CREDIT_PENDING","COMPLETED"] },
    WasteMaterialEvidenceStatus: { definition: ["CONFIRMED","NOT_CONFIRMED"] },
    WasteMaterialCommercialModel: { definition: ["PROGRAM_FUNDED","CUSTOMER_SHARING"] },
    WasteMaterialAttributionBasis: { definition: ["QUANTITY","WEIGHT"] },
    WasteMaterialRoundingMode: { definition: ["DOWN","HALF_UP"] },

    ASSESSMENT_TYPE: {
        definition: Object.freeze({
            ESTIMATED: 'ESTIMATED',
            CONFIRMED: 'CONFIRMED',
            RECALCULATED: 'RECALCULATED'
        })
    }
};
