/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/facade/authentication/defaultAuthenticationProviderFacade
 * @description Coordinates facade-level delegation for profile default authentication provider facade operations.
 * @layer facade
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /** Delegates cookie-safe context changes to Profile's browser-session owner. @param {Object} request Signed browser command. @returns {Promise<Object>} Safe access-only result. */
    switchEmployeeBrowser: function (request) {
        return SERVICE.DefaultBrowserSessionService.switchEnterprise(request);
    },
    /** Keeps recovery orchestration with Profile and verification/delivery with their existing owners. */
    employeeRecovery: function (request, operation) {
        const owner = SERVICE.DefaultEmployeeRecoveryService;
        if (!owner)
            throw new CLASSES.NodicsError('ERR_PROFILE_RECOVERY_UNAVAILABLE');
        return operation === 'WORKSPACE'
            ? owner.workspace()
            : owner.execute(request, operation);
    },

    /**

     * Executes authenticate employee behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateEmployee: function (request) {
        return SERVICE.DefaultAuthenticationProviderService.authenticateEmployee(
            request
        );
    },

    /**

     * Executes authenticate customer behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    authenticateCustomer: function (request) {
        return SERVICE.DefaultAuthenticationProviderService.authenticateCustomer(
            request
        );
    }
};
