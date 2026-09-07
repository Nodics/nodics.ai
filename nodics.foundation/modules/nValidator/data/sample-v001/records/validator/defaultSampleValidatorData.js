/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nValidator/data/sample-v001/records/validator/defaultSampleValidatorData
 * @description Provides sample validator records for local validation demonstrations.
 * @layer data
 * @owner nValidator
 */
module.exports = {
    record0: {
        code: 'sampleDefaultValidator',
        type: 'schema',
        trigger: 'preSave',
        active: true,
        index: 0,
        handler: 'DefaultSampleValidatorService.handlePreSave'
    },

    record1: {
        code: 'sampleAddressValidator',
        type: 'schema',
        item: 'address',
        trigger: 'preSave',
        active: true,
        index: 0,
        handler: 'DefaultSampleValidatorService.handlePreAddressSave'
    }
};
