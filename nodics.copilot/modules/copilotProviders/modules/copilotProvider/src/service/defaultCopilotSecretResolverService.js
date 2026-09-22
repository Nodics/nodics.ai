/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotProvider/src/service/defaultCopilotSecretResolverService @description Resolves configured secret references through an injected resolver or an environment reference without logging secret values. @layer service @owner copilotProvider @override Environment modules may supply a resolver integration for their secret platform. */
module.exports = {
    /** Resolves a supported runtime reference without logging secret material. @param {string} secretRef Governed secret reference. @returns {string|null} Secret value or null. */
    resolveReference: function (secretRef) {
        const reference = String(secretRef || '');
        const envMatch = /^env:([A-Z][A-Z0-9_]*)$/.exec(reference);
        if (envMatch) return process.env[envMatch[1]] || null;
        const credentialMatch = /^credentials:([A-Za-z0-9._-]+)$/.exec(reference);
        if (credentialMatch) {
            const credential = (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('credentials') || {})[credentialMatch[1]];
            return credential && credential.status !== 'DISABLED' && typeof credential.value === 'string' ? credential.value : null;
        }
        throw new Error('COPILOT_SECRET_REFERENCE_UNSUPPORTED');
    },
    /** Resolves a non-secret reference. @param {string} secretRef Governed secret reference. @param {Function} resolver Environment-owned resolver. @returns {Promise<string>} Secret value for immediate provider use. */
    resolve: function (secretRef, resolver) {
        if (!secretRef) return Promise.reject(new Error('COPILOT_SECRET_REFERENCE_REQUIRED'));
        const effectiveResolver = typeof resolver === 'function' ? resolver : this.resolveReference.bind(this);
        return Promise.resolve().then(() => effectiveResolver(secretRef)).then(value => {
            if (!value) throw new Error('COPILOT_SECRET_NOT_FOUND');
            return value;
        });
    }
};
