/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationMachineTranslationService @description Produces non-publishing translation suggestions through memory then an optional provider adapter. @layer service @owner localizationCore @override Projects select provider services through layered configuration. */
module.exports = {
    /** Returns an exact memory match or a bounded provider suggestion with provenance. */
    suggest: async function (request) {
        let memory = await SERVICE.DefaultLocalizationTranslationMemoryPortService.find(request);
        if (memory) return Object.freeze({ message: memory.targetMessage, source: 'MEMORY', confidence: 1, publishable: false });
        let authority = (CONFIG.get('localization') || {}).authority || {};
        let provider = authority.machineTranslationEnabled && authority.machineTranslationProviderService && SERVICE[authority.machineTranslationProviderService];
        if (!provider || typeof provider.suggest !== 'function') throw this.error('ERR_LOC_00007', 'Machine translation provider is unavailable');
        let suggestion = await provider.suggest(request);
        SERVICE.DefaultLocalizationMessageValidationService.validate(suggestion.message, request.parameters || []);
        return Object.freeze({ message: suggestion.message, source: 'MACHINE', provider: suggestion.provider,
            confidence: suggestion.confidence, publishable: false });
    },
    /** Creates a stable provider error. */
    error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
