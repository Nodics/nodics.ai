/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/src/utils/statusDefinitions @description Defines stable impact-provider errors for validation, execution and recovery. @layer utility @owner wasteImpact */
module.exports = {
    ERR_WASTE_IMPACT_CONFIGURATION_INVALID: { code: '422', message: 'Waste impact provider configuration is invalid' },
    ERR_WASTE_IMPACT_INPUT_INVALID: { code: '422', message: 'Waste impact calculation input is invalid or unresolved' },
    ERR_WASTE_IMPACT_PROVIDER_UNAVAILABLE: { code: '503', message: 'Configured Waste impact provider is unavailable' },
    ERR_WASTE_IMPACT_PROVIDER_TIMEOUT: { code: '504', message: 'Waste impact provider timed out' },
    ERR_WASTE_IMPACT_PROVIDER_FAILED: { code: '502', message: 'Waste impact provider failed' },
    ERR_WASTE_IMPACT_PROVIDER_RESULT_INVALID: { code: '502', message: 'Waste impact provider returned an invalid result' }
};
