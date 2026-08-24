/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commsCore/data/core/communication/commsRuntimeDefaultTemplateData @description Provides minimal runtime templates required for Communication activation. @layer data @owner commsCore */
module.exports = {
    record0: {
        code: 'COMMUNICATION_RUNTIME_NOTICE',
        tenant: 'default',
        purpose: 'TRANSACTIONAL',
        channels: ['EMAIL', 'IN_APP'],
        declaredVariables: ['reference', 'message'],
        currentVersion: 1,
        status: 'ACTIVE',
        correlationId: 'communication-runtime-defaults',
        revision: 1,
        active: true
    }
};
