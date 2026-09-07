/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nValidator/data/sample-v001/headers/validator/defaultSampleValidatorHeader
 * @description Imports sample validator records for local validation demonstrations.
 * @layer data-header
 * @owner nValidator
 */
module.exports = {
    validator: {
        defaultSampleValidator: {
            options: {
                enabled: true,
                schemaName: 'validator',
                operation: 'saveAll',
                dataFilePrefix: 'defaultSampleValidatorData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
