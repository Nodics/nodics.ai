/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/init/data/axis/axisCmsRouteData
 * @description Defines public employee-authentication routes and the secured Axis dashboard route.
 * @layer data
 * @owner axis
 */
const AXIS_FUNCTIONAL_MODULE = 'nodics.platform';
const withAxisOwnership = records => {
    Object.keys(records).forEach(key => {
        records[key].functionalModule = AXIS_FUNCTIONAL_MODULE;
        records[key].activationMode = 'PLATFORM_ACTIVE';
    });
    return records;
};

module.exports = withAxisOwnership({
    record0: {
        code: 'axisLoginRoute', site: 'axisCmsSite', path: '/login', locale: 'en', channel: 'web',
        page: 'axisLoginPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC', active: true
    },
    record1: {
        code: 'axisForgotPasswordRoute', site: 'axisCmsSite', path: '/forgot-password', locale: 'en', channel: 'web',
        page: 'axisForgotPasswordPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC', active: true
    },
    record2: {
        code: 'axisDashboardRoute', site: 'axisCmsSite', path: '/dashboard', locale: 'en', channel: 'web',
        page: 'axisDashboardPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'AUTHENTICATED', active: true
    },
    record3: {
        code: 'axisLockScreenRoute', site: 'axisCmsSite', path: '/lock-screen', locale: 'en', channel: 'web',
        page: 'axisLockScreenPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'AUTHENTICATED', active: true
    },
    record4: {
        code: 'axisAssistantRoute', site: 'axisCmsSite', path: '/assistant', locale: 'en', channel: 'web',
        page: 'axisAssistantPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'AUTHENTICATED', active: true
    },
    record5: {
        code: 'axisSchemaWorkbenchRoute', site: 'axisCmsSite', path: '/schema-workbench', locale: 'en', channel: 'web',
        page: 'axisSchemaWorkbenchPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'AUTHENTICATED', active: true
    },
    record6: {
        code: 'axisMediaManagementRoute', site: 'axisCmsSite', path: '/media-management', locale: 'en', channel: 'web',
        page: 'axisMediaManagementPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'AUTHENTICATED', active: true
    },
    record7: {
        code: 'axisPlatformDashboardRoute', site: 'axisCmsSite', path: '/platform', locale: 'en', channel: 'web',
        page: 'axisPlatformDashboardPage', routeType: 'PAGE', deliveryState: 'ONLINE',
        accessMode: 'AUTHENTICATED', active: true
    },
    record8: {
        code: 'axisPlatformInitializeRoute', site: 'axisCmsSite', path: '/platform/initialize', locale: 'en', channel: 'web',
        page: 'axisPlatformInitializePage', routeType: 'PAGE', deliveryState: 'ONLINE',
        accessMode: 'AUTHENTICATED', active: true
    },
    record9: {
        code: 'axisRuntimeModulesRegistryRoute', site: 'axisCmsSite', path: '/platform/runtime-modules', locale: 'en', channel: 'web',
        page: 'axisRuntimeModulesRegistryPage', routeType: 'PAGE', deliveryState: 'ONLINE',
        accessMode: 'AUTHENTICATED', active: true
    }
});
