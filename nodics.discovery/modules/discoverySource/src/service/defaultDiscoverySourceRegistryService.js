/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoverySource/service/defaultDiscoverySourceRegistryService @description Registers and resolves domain-owned Discovery source providers. @layer service @owner discoverySource */
module.exports = {
    providers: {},

    /** Registers a provider by owner type and source code. @param {string} ownerType Domain owner type. @param {string} sourceCode Source code. @param {Object} provider Provider implementation. @returns {boolean} Registration result. */
    register: function (ownerType, sourceCode, provider) {
        if (!ownerType || !sourceCode || !provider) throw new Error('Discovery source provider registration requires owner type, source code, and provider');
        this.providers[ownerType + ':' + sourceCode] = provider;
        return true;
    },

    /** Resolves a registered provider. @param {string} ownerType Domain owner type. @param {string} sourceCode Source code. @returns {Object|undefined} Provider. */
    resolve: function (ownerType, sourceCode) {
        return this.providers[ownerType + ':' + sourceCode];
    }
};
