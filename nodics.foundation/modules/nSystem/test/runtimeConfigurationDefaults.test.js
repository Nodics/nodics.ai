/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nSystem/test/runtimeConfigurationDefaults
 * @description Proves owner-defined empty registries and real masked reads after
 * later nConfig overrides, without providers, credential creation or persistence.
 * @owner system
 * @layer test
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const defaults = require('../config/properties');
const bindings = require('../../nConfig/src/service/defaultConfigurationBindingService');
const service = require('../src/service/config/defaultRuntimeConfigurationSchemaService');

/** Installs isolated test configuration and restores every touched global. */
function fixture(t, values) {
    const before = { CONFIG: global.CONFIG, _: global._, CLASSES: global.CLASSES };
    t.after(() => {
        for (const [key, value] of Object.entries(before)) {
            if (value === undefined) delete global[key]; else global[key] = value;
        }
    });
    global._ = require('lodash');
    global.CONFIG = { get: key => values[key] };
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
}

test('nSystem owns empty configuration registries and does not fabricate schemas or credentials', async t => {
    for (const key of ['runtimeConfigurationSchemas', 'runtimeConfiguration', 'secureConfiguration', 'credentials'])
        assert.deepEqual(defaults[key], {}, key + ' must not be a required customer definition or consumer fallback');
    fixture(t, defaults);
    const list = await service.listSchemas({ tenant: 'sample' });
    assert.equal(list.data.length, 0);
    assert.equal(service.resolveFieldValue({ type: 'string', sensitive: true, credentialReference: 'partner.provider' }), undefined);
});

test('later owner schema and deployment value inherit masking and unconfigured persistence readiness', async t => {
    const values = bindings.merge(defaults, {
        runtimeConfigurationSchemas: {
            partnerCredential: { ownerModule: 'sampleOwner', fields: [
                { code: 'apiCredential', type: 'string', required: true, sensitive: true, credentialReference: 'partner.provider' }
            ] }
        },
        credentials: { 'partner.provider': { value: 'synthetic-provider-value' } }
    });
    fixture(t, values);
    const result = await service.getEffectiveConfiguration({ tenant: 'sample', schemaCode: 'partnerCredential' });
    assert.equal(result.data.status, 'CONFIGURED');
    assert.equal(result.data.values.apiCredential.sensitive, true);
    assert.equal(result.data.values.apiCredential.value.includes('synthetic-provider-value'), false);
    assert.deepEqual(result.data.secretPersistence, { required: true, ready: false, reason: 'ENCRYPTION_KEY_REQUIRED' });
    assert.equal(Object.keys(defaults.credentials || {}).length, 0, 'later input never mutates the owner baseline');
});

test('later registry overrides cannot remove sensitivity or silently skip an invalid selected source', t => {
    const values = bindings.merge(defaults, {
        runtimeConfiguration: { credentials: { 'partner.provider': { value: { unresolvedDescriptor: true } } } },
        credentials: { 'partner.provider': { value: 'synthetic-fallback-value' } }
    });
    fixture(t, values);
    assert.throws(() => service.resolveFieldValue({ type: 'string', credentialReference: 'partner.provider' }),
        error => error.code === 'ERR_SYS_00002');
    const field = { type: 'string', sensitive: true, credentialReference: 'partner.provider' };
    assert.equal(service.resolveFieldValue(field), undefined, 'an invalid selected runtime wrapper does not adopt another source');
});
