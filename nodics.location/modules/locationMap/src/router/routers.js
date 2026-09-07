/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationMap/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    locationMap: {
        internal: {
            getEffectiveMapConfiguration: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'],
                permission: 'system.schema.workbench.view', apiExposure: 'locationInternal',
                key: '/location/maps/configurations/effective', method: 'GET',
                controller: 'DefaultLocationMapController', operation: 'getEffectiveConfiguration',
                help: { requestType: 'secured', message: 'Returns the frontend-safe effective map provider configuration for one surface and usage.' }
            },
            getMapConfiguration: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'],
                permission: 'system.schema.workbench.view', apiExposure: 'locationInternal',
                key: '/location/maps/configurations', method: 'GET',
                controller: 'DefaultLocationMapController', operation: 'getConfiguration',
                help: { requestType: 'secured', message: 'Returns the editable map provider configuration for one surface and usage.' }
            },
            saveMapConfiguration: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'],
                permission: 'system.schema.workbench.manage', apiExposure: 'locationInternal',
                key: '/location/maps/configurations', method: 'PUT',
                controller: 'DefaultLocationMapController', operation: 'saveConfiguration',
                help: { requestType: 'secured', message: 'Creates or updates a frontend-safe map provider configuration for one surface and usage.' }
            },
            reverseGeocode: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'],
                permission: 'system.schema.workbench.view', apiExposure: 'locationInternal',
                key: '/location/maps/reverse-geocode', method: 'GET',
                controller: 'DefaultLocationMapController', operation: 'reverseGeocode',
                help: { requestType: 'secured', message: 'Returns a customer-safe address label for one latitude and longitude using the effective map provider with OSM fallback.' }
            }
        }
    }
};
