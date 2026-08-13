/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module axis/config/properties
 * @description Contributes Axis-specific backend-owned documentation and navigation metadata for BackOffice aggregation.
 * @layer config
 * @owner axis
 */
module.exports = {
    axis: {
        initialization: {
            baselineCode: 'axis',
            target: { moduleName: 'cms', connectionName: 'wcmsStaged', connectionType: 'abstract',
                timeoutMs: 30000, maxAttempts: 2 }
        }
    }
};
