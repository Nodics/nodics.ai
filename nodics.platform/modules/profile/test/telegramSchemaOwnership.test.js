/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/telegramSchemaOwnership @description Verifies inert identity-schema ownership and layered credential selection independently of host roles. @layer test @owner profile */
const assert = require('node:assert/strict');
const test = require('node:test');
const bindings = require('../../../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService');
const schemaOwner = require('../../../../nodics.foundation/modules/nSystem/src/service/config/defaultRuntimeConfigurationSchemaService');
const defaults = require('../config/properties').runtimeConfigurationSchemas;

test('Profile schema discovery preserves credential admission without role projection', async t => {
    const before = global.CONFIG;
    t.after(() => { global.CONFIG = before; });
    assert.equal(Object.hasOwn(defaults, 'runtimeRoleProfiles'), false);
    for (const role of ['PLATFORM', 'WCMS_STAGED', 'RELOCATED_HOST']) {
        const schemas = bindings.resolve(defaults, {}, {});
        const schema = schemas.telegramExternalIdentity;
        assert.equal(schema.ownerModule, 'profile');
        assert.equal(schema.updatePermission, 'runtime.config.request.create');
        assert.equal(schema.fields[0].sensitive, true);
        assert.deepEqual(schemaOwner.resolveFieldPath(schema.fields[0]), ['credentials', 'telegram.bot.identity', 'value']);
        const effective = { runtimeRole: { code: role }, runtimeConfigurationSchemas: schemas };
        global.CONFIG = { get: key => effective[key] };
        const status = await schemaOwner.getEffectiveConfiguration({ schemaCode: 'telegramExternalIdentity' });
        assert.equal(status.data.status, 'UNCONFIGURED');
        assert.equal(status.data.secretPersistence.ready, false);
        assert.equal(effective.credentials, undefined);
    }
});

test('an intentional credential override inherits sensitive-field validation', () => {
    const schemas = bindings.merge(defaults, { telegramExternalIdentity: { fields: [{ credentialReference: 'customer.identity.bot' }] } });
    const field = schemas.telegramExternalIdentity.fields[0];
    assert.equal(field.code, 'botToken');
    assert.equal(field.required, true);
    assert.equal(field.sensitive, true);
    assert.equal(field.pattern, defaults.telegramExternalIdentity.fields[0].pattern);
    assert.deepEqual(schemaOwner.resolveFieldPath(field), ['credentials', 'customer.identity.bot', 'value']);
    assert.equal(defaults.telegramExternalIdentity.fields[0].credentialReference, 'telegram.bot.identity');
});
