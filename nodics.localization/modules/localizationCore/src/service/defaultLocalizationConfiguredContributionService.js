/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationConfiguredContributionService @description Imports module service contributions while retaining layered configuration as migration compatibility. @layer service @owner localizationCore @override Modules contribute through concrete owner services. */
module.exports = {
    /** Collects local module-owned service contributions and bounded legacy configuration. */
    getContributions: function () { let contributions = Object.assign({}, CONFIG.get('localizationContributions') || {}); Object.keys(SERVICE || {}).sort().forEach(serviceName => { let provider = SERVICE[serviceName]; if (!provider || typeof provider.getLocalizationContribution !== 'function') return; let document = provider.getLocalizationContribution(); if (!document || !document.ownerModule) throw this.error('ERR_LOC_00004', 'Localization service contribution owner is required'); if (contributions[document.ownerModule]) throw this.error('ERR_LOC_00004', 'Duplicate localization contribution owner ' + document.ownerModule); contributions[document.ownerModule] = document; }); return contributions; },
    /** Imports all configured contributions with owner-identity enforcement. */
    importAll: async function (request) { let configured = this.getContributions(); let results = []; for (let ownerModule of Object.keys(configured).sort()) { let document = configured[ownerModule]; if (!document || document.ownerModule !== ownerModule) throw this.error('ERR_LOC_00004', 'Configured localization contribution owner mismatch'); let values = await SERVICE.DefaultLocalizationImportExportService.importContribution(document, request); results.push({ ownerModule: ownerModule, keyCount: values.length }); } return Object.freeze(results); },
    /** Creates a stable contribution error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
