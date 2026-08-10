/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationTranslationMemoryPortService @description Stores and retrieves tenant-scoped approved translation memory without becoming publication authority. @layer service @owner localizationCore @override Persistence providers may vary while retaining tenant and owner scope. */
module.exports = {
    /** Finds one exact approved translation by resolving its immutable source key and target-locale value. */
    find: async function (request) {
        let keys = await SERVICE.DefaultLocalizationKeyService.get({ tenant: request.tenant, authData: request.authData,
            query: { tenant: request.tenant, defaultMessage: request.sourceMessage }, searchOptions: { limit: 1 } });
        keys = keys && keys.result !== undefined ? keys.result : keys;
        let key = Array.isArray(keys) ? keys[0] : keys;
        if (!key) return undefined;
        let result = await SERVICE.DefaultLocalizationValueService.get({ tenant: request.tenant, authData: request.authData,
            query: { tenant: request.tenant, namespace: key.namespace, key: key.key, locale: request.targetLocale, state: 'APPROVED' },
            searchOptions: { limit: 1 } });
        result = result && result.result !== undefined ? result.result : result;
        let value = Array.isArray(result) ? result[0] : result;
        return value && { targetMessage: value.message, ownerModule: key.ownerModule, revision: value.revision };
    },
    /** Confirms that the approved localization value itself is the durable memory record. */
    record: async function (request) {
        if (((CONFIG.get('localization') || {}).authority || {}).translationMemoryEnabled === false) return false;
        return Object.freeze({ recorded: true, ownerModule: request.ownerModule, targetLocale: request.targetLocale });
    }
};
