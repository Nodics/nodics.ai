/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nSystem/src/utils/statusDefinitions
 * @description Provides shared nSystem utility exports for status definitions.
 * @layer utils
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    ERR_SYS_00120: { code: '403', message: 'Local reset provider is disabled' },
    ERR_SYS_00121: { code: '403', message: 'Local reset provider requires a service token' },
    ERR_SYS_00122: { code: '400', message: 'Local reset provider confirmation is invalid' },
    ERR_SYS_00123: { code: '500', message: 'Local reset provider service boundary is invalid' },
    ERR_SYS_00124: { code: '503', message: 'Configured Local reset service is unavailable' },
    ERR_SYS_00125: { code: '503', message: 'Local reset did not clear every configured service' },
    SUC_SYS_HEALTH_LIVE: {
        code: '200',
        message: 'Runtime process is live'
    },
    SUC_SYS_HEALTH_READY: {
        code: '200',
        message: 'Runtime is ready to receive traffic'
    },
    SUC_SYS_HEALTH_NOT_READY: {
        code: '503',
        message: 'Runtime is not ready to receive traffic'
    },
    SUC_SYS_00001: {
        code: '200',
        message: 'OpenAPI contract resolved successfully'
    },
    SUC_SYS_00002: {
        code: '200',
        message: 'Swagger UI resolved successfully'
    },
    SUC_SYS_00003: {
        code: '200',
        message: 'Swagger UI asset resolved successfully'
    }
};
