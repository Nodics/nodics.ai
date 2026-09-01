/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyProgram/data/core-v001/records/loyaltyProgramCoreData @description Provides the default Loyalty program reference record. @layer data @owner loyaltyProgram */
module.exports = {
    record0: {
        code: 'default',
        name: 'Default Loyalty Program',
        description: 'Default program used by customer projects until they define a project-specific program.',
        status: 'ACTIVE',
        defaultRewardTypeCode: 'points',
        earningEnabled: true,
        spendEnabled: true,
        revision: 1,
        active: true
    }
};
