/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/authentication/defaultInternalAuthenticationProviderService
 * @description Implements profile default internal authentication provider service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Retrieves internal auth token information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    getInternalAuthToken: async function (request) {
        const options = await SERVICE.DefaultRuntimeAuthorizationService.authorize(request);
        const authToken = await SERVICE.DefaultServiceTokenService.issue(options);
        return { code: 'SUC_AUTH_00000', result: { authToken } };
    }
};
