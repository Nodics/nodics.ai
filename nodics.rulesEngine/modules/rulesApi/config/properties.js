/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/config/properties @description Rules API exposure defaults and BackOffice presentation settings. @layer config @owner rulesApi */
module.exports = {
    apiExposure: {
        categories: {
            rulesManagement: { enabled: true },
            rulesInternal: { enabled: true }
        }
    }
};
