/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/src/utils/statusDefinitions @description Defines stable Waste response and error codes. @layer utility @owner wasteCore @override Later modules may add codes while preserving existing meanings. */
module.exports = {
    SUC_WASTE_00000: { code: '200', message: 'Waste operation successfully processed' },
    SUC_WASTE_00001: { code: '201', message: 'Waste submission created' },
    SUC_WASTE_00002: { code: '200', message: 'Waste submission lifecycle updated' },
    ERR_WASTE_00000: { code: '400', message: 'Invalid Waste request' },
    ERR_WASTE_00001: { code: '422', message: 'Invalid Waste source reference' },
    ERR_WASTE_00002: { code: '422', message: 'Waste acceptance rule rejected the submitted material' },
    ERR_WASTE_00003: { code: '409', message: 'Invalid Waste submission lifecycle transition' },
    ERR_WASTE_00004: { code: '422', message: 'Waste evidence is required by policy' },
    ERR_WASTE_00005: { code: '422', message: 'Invalid Waste impact profile' },
    ERR_WASTE_00006: { code: '503', message: 'Required Waste service is not available' }
};
