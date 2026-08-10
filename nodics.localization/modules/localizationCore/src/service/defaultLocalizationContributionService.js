/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationContributionService @description Validates one loader-visible versioned key contribution and detects collisions before import. @layer service @owner localizationCore @override Modules may contribute values only through this contract. */
module.exports = {
    /** Validates and normalizes a contribution document. */ validate: function (document) { let config = ((CONFIG.get('localization') || {}).authority || {}); if (!document || Number(document.formatVersion) !== Number(config.contributionFormatVersion || 1) || typeof document.ownerModule !== 'string' || !Array.isArray(document.entries)) throw this.error('ERR_LOC_00000', 'Contribution header is invalid'); if (document.entries.length > Number(config.maximumKeysPerRelease || 10000)) throw this.error('ERR_LOC_00005', 'Contribution contains too many keys'); let seen = new Set(); let entries = document.entries.map(entry => { if (!entry || !/^[a-z][a-z0-9.-]*$/.test(entry.namespace || '') || !/^[a-z][a-z0-9._-]*$/.test(entry.key || '') || !config.allowedExposures.includes(entry.exposure)) throw this.error('ERR_LOC_00000', 'Contribution entry identity or exposure is invalid'); let identity = entry.namespace + ':' + entry.key; if (seen.has(identity)) throw this.error('ERR_LOC_00004', 'Duplicate localization key: ' + identity); seen.add(identity); let parameters = SERVICE.DefaultLocalizationMessageValidationService.validate(entry.defaultMessage, entry.parameters || []); let scopes = entry.overrideScopes || config.allowedOverrideScopes || ['STANDARD', 'PROJECT', 'TENANT']; if (!Array.isArray(scopes) || scopes.some(scope => !(config.allowedOverrideScopes || []).includes(scope))) throw this.error('ERR_LOC_00000', 'Contribution override scope is invalid'); return Object.freeze({ namespace: entry.namespace, key: entry.key, defaultMessage: entry.defaultMessage, parameters: parameters, exposure: entry.exposure, ownerModule: document.ownerModule, protected: entry.protected === true, overrideScopes: Object.freeze(scopes.slice()) }); }); return Object.freeze({ formatVersion: Number(document.formatVersion), ownerModule: document.ownerModule, entries: Object.freeze(entries) }); },
    /** Creates a stable contribution error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
