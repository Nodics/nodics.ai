/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationOverridePolicyService @description Enforces protected-key and scope policy before localized values are changed. @layer service @owner localizationCore @override Projects may narrow override scopes but cannot bypass protected-key authorization. */
module.exports = {
    /** Validates one STANDARD, PROJECT, or TENANT override against immutable key policy. */
    validate: function (request, key) {
        let authority = (CONFIG.get('localization') || {}).authority || {};
        let scope = request.scopeType || 'TENANT';
        if (!(authority.allowedOverrideScopes || []).includes(scope) || (key.overrideScopes || ['STANDARD', 'PROJECT', 'TENANT']).indexOf(scope) < 0) {
            throw this.error('ERR_LOC_00002', 'Localization override scope is not authorized');
        }
        let scopeCode = request.scopeCode || (scope === 'TENANT' ? request.tenant : undefined);
        if (scope !== 'STANDARD' && !scopeCode) throw this.error('ERR_LOC_00002', 'Project or tenant override scope code is required');
        if (key.protected === true && scope !== 'STANDARD') {
            let groups = request.authData && request.authData.groups || [];
            if (!(authority.protectedOverrideGroups || []).some(group => groups.includes(group))) {
                throw this.error('ERR_LOC_00006', 'Protected localization key cannot be overridden');
            }
        }
        return Object.freeze({ scopeType: scope, scopeCode: scopeCode });
    },
    /** Creates a stable override-policy error. */
    error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
