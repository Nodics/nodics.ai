/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module paymentCore/service/DefaultPaymentProviderSelectionService @description Resolves configured Payment-owned adapters and preserves the provider identity of retained authorization receipts. @layer service @owner paymentCore @override Projects may select installed providers through paymentCore configuration without changing authorization or qualification gates. */
module.exports = {
    /** Reads effective Framework defaults and deliberate project/environment provider selections. */
    configuration: function () { return CONFIG.get('paymentCore') || {}; },
    /** Resolves a trusted prepared method or its retained original provider, never browser adapter fields. */
    resolve: function (methodCode, originalProviderCode) {
        const settings = this.configuration();
        const code = originalProviderCode === undefined ? settings.providerSelection?.[methodCode] : originalProviderCode;
        const binding = typeof code === 'string' && Object.hasOwn(settings.providerBindings || {}, code) ? settings.providerBindings[code] : null;
        if (!binding || !Array.isArray(binding.methods) || !binding.methods.includes(methodCode) ||
            typeof binding.serviceName !== 'string' || !/^Default[A-Za-z0-9]+Service$/.test(binding.serviceName))
            throw new Error('Payment provider selection is unavailable for this method');
        const adapter = SERVICE[binding.serviceName];
        if (!adapter || adapter.code !== code || typeof adapter.execute !== 'function')
            throw new Error('The selected payment provider is not available');
        return adapter;
    }
};
