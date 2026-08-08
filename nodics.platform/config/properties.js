'use strict';

/**
 * Platform owns the BackOffice service-registry capability and the System
 * content-pack import surface used by Axis documentation. Core keeps these
 * exposure categories disabled so runtimes that do not include Platform cannot
 * accidentally expose control-plane registration or import/update routes.
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
