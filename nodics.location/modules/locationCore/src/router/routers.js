/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationCore/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    locationCore: {
        internal: {
            createLocation: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'location.location.create', apiExposure: 'locationInternal',
                key: '/locations', method: 'POST',
                controller: 'DefaultLocationCoreController', operation: 'createLocation',
                help: { requestType: 'secured', message: 'Creates a governed Location record with separate latitude and longitude fields.' }
            },
            updateLocation: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'location.location.update', apiExposure: 'locationInternal',
                key: '/locations/:locationCode', method: 'PATCH',
                controller: 'DefaultLocationCoreController', operation: 'updateLocation',
                help: { requestType: 'secured', message: 'Updates a governed Location record without duplicating Profile address fields.' }
            },
            getLocation: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'location.location.read', apiExposure: 'locationInternal',
                key: '/locations/:locationCode', method: 'GET',
                controller: 'DefaultLocationCoreController', operation: 'getLocation',
                help: { requestType: 'secured', message: 'Reads one governed Location record by code.' }
            },
            searchLocations: {
                secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['serviceAccountUserGroup', 'employeeUserGroup'],
                permission: 'location.location.search', apiExposure: 'locationInternal',
                key: '/locations/search', method: 'POST',
                controller: 'DefaultLocationCoreController', operation: 'searchLocations',
                help: { requestType: 'secured', message: 'Searches governed Location records with tenant supplied only as runtime context.' }
            }
        }
    }
};
