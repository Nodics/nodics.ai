/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationMap/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_LOCATION_MAP_PRESENTATION_INVALID: { code: '400', message: 'Invalid map presentation or interaction settings' },
    ERR_LOCATION_MAP_CONFIGURATION_AMBIGUOUS: { code: '409', message: 'Multiple shared map configurations require resolution' },
    ERR_LOCATION_MAP_CONFIGURATION_CONFLICT: { code: '409', message: 'A shared map configuration already exists for this usage' },
    ERR_LOCATION_MAP_REVISION_CONFLICT: { code: '409', message: 'Map configuration changed; reload it before saving' },
    ERR_LOCATION_MAP_CONFIGURATION_INVALID: { code: '400', message: 'Invalid map configuration' },
    ERR_LOCATION_MAP_PUBLIC_USAGE_DENIED: { code: '403', message: 'Map configuration is not available publicly' }
};
