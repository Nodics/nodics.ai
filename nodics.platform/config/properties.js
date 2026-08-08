/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.platform/config/properties
 * Platform owns the BackOffice service-registry capability and the System
 * content-pack import surface used by Axis documentation. Core keeps these
 * exposure categories disabled so runtimes that do not include Platform cannot
 * accidentally expose control-plane registration or import/update routes.
 * @layer config
 * @owner nodics.platform
 * @override Customer projects may disable or narrow API categories from their server/environment configuration.
 */
module.exports = {
    apiExposure: {
        categories: {
            serviceRegistry: {
                enabled: true
            },
            dataImport: {
                enabled: true
            }
        }
    }
};
