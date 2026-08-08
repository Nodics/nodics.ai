'use strict';

/**
 * Platform owns the BackOffice service-registry capability. Core keeps this
 * exposure category disabled so runtimes that do not include Platform cannot
 * accidentally expose a control-plane registration surface.
 */
module.exports = {
    apiExposure: {
        categories: {
            serviceRegistry: {
                enabled: true
            }
        }
    }
};
