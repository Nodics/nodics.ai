/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module engagementApi/src/utils/statusDefinitions @description Defines stable API boundary errors without exposing internal failure details. @layer utility @owner engagementApi @override Later modules may add codes without changing existing meanings. */
module.exports = {
    ERR_ENG_API_00000: { code: '400', message: 'Invalid Engagement API request' },
    ERR_ENG_API_00001: { code: '401', message: 'Engagement authentication required' },
    ERR_ENG_API_00002: { code: '403', message: 'Engagement tenant scope denied' },
    ERR_ENG_API_00003: { code: '403', message: 'Engagement resource ownership denied' },
    ERR_ENG_API_00004: { code: '401', message: 'Engagement service authentication required' },
    ERR_ENG_API_00005: { code: '503', message: 'Engagement domain operation unavailable' }
};
