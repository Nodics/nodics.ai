/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module stripeProvider/test/providerConfiguration @description Verifies role-independent disabled defaults and intentional sandbox selection through canonical configuration layering. @layer test @owner stripeProvider */
const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const binding = require(path.resolve(__dirname, '../../../../../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService'));
const defaults = require('../config/properties');

test('host selection cannot implicitly enable the sandbox provider', () => {
    for (const code of ['COMMERCE', 'COMMERCE_STAGED', 'RELOCATED_HOST']) {
        const effective = binding.merge(defaults, { runtimeRole: { code } });
        assert.deepEqual(effective.stripeProvider, {
            enabled: false, maturity: 'OFFLINE_CONFORMANCE', sandboxOnly: true, liveQualified: false,
        });
    }
});

test('explicit local selection inherits protected sandbox defaults without mutating the owner', () => {
    const effective = binding.merge(defaults, binding.resolve({ stripeProvider: { enabled: true } }, defaults));
    assert.deepEqual(effective.stripeProvider, {
        enabled: true, maturity: 'OFFLINE_CONFORMANCE', sandboxOnly: true, liveQualified: false,
    });
    assert.equal(defaults.stripeProvider.enabled, false);
    assert.equal(binding.merge(effective, { stripeProvider: { enabled: false } }).stripeProvider.enabled, false);
});
