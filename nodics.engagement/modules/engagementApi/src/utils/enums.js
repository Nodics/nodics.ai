/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module engagementApi/src/utils/enums @description Defines loader-compatible Engagement API audience and token categories. @layer utility @owner engagementApi @override Later modules may add audiences without weakening token meanings. */
module.exports = { EngagementApiAudience: { definition: ['PUBLIC', 'CUSTOMER', 'OPERATOR', 'INTEGRATION'] }, EngagementApiTokenType: { definition: ['access', 'service'] } };
