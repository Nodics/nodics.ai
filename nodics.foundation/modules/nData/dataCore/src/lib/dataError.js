/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nData/dataCore/src/lib/dataError
 * @description Provides the nData error used by import, export, and persistence services.
 * @layer lib
 * @owner nData
 */
module.exports = class DataError extends CLASSES.NodicsError {
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').DataError) {
        super(error, message, defaultCode);
        super.name = 'DataError';
    }
};
