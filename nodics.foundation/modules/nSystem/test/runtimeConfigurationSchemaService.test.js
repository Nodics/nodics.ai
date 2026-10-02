/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const crypto = require('crypto');

/**
 * @module nSystem/test/runtimeConfigurationSchemaService
 * @description Verifies masked configuration DTOs and pre-persistence prerequisites using synthetic in-memory owners only.
 */

const tenantPatches = [];
const savedRecords = [];
const publishedEvents = [];
let encryptionKey = crypto.createHash('sha256').update('runtime-config-test-key').digest('hex');

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultErrorCodes') {
            return { NodicsError: 'ERR_SYS_00000' };
        }
        if (key === 'returnErrorStack') {
            return false;
        }
        if (key === 'defaultTenant') {
            return 'electronicsTenant';
        }
        if (key === 'runtimeConfigurationSchemas') {
            return {
                telegramExternalIdentity: {
                    ownerModule: 'profile',
                    label: 'Telegram external identity',
                    fields: [{
                        code: 'botToken',
                        type: 'string',
                        required: true,
                        sensitive: true,
                        path: ['credentials', 'telegram.bot.circa', 'value'],
                        pattern: '^\\d+:[^\\s]+$'
                    }, {
                        code: 'enabled',
                        type: 'boolean',
                        path: ['channel', 'enabled']
                    }]
                }
            };
        }
        if (key === 'runtimeConfiguration') {
            return {
                credentials: {
                    'telegram.bot.circa': {
                        value: '123456789:test-runtime-secret'
                    }
                }
            };
        }
        if (key === 'runtimeConfigurationSecurity') {
            return {
                encryptionKey: encryptionKey
            };
        }
        return undefined;
    },
    changeTenantProperties: function (configuration, tenant) {
        tenantPatches.push({ configuration, tenant });
    }
};

global.SERVICE = {
    DefaultRuntimeConfigurationValueService: {
        save: function (request) {
            savedRecords.push(request.model);
            return Promise.resolve({ result: request.model });
        },
        get: function (request) {
            return Promise.resolve({
                result: savedRecords.filter(record => record.code === request.query.code)
            });
        }
    },
    DefaultEventService: {
        publish: function (event) {
            publishedEvents.push(event);
            return Promise.resolve({ code: 'SUC_EVNT_00000' });
        }
    },
    DefaultStatusService: {
        get: function (code) {
            return { code: 500, message: 'Status message for ' + code };
        }
    }
};

global.UTILS = {
    extractFromError: function (error, message, defaultCode) {
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message ? error.message + ' : ' + message : error.message,
            stack: error.stack
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message
        };
    }
};

global.CLASSES = {
    NodicsError: require('../../nCommon/src/lib/nodicsError')
};

const service = require('../src/service/config/defaultRuntimeConfigurationSchemaService');

(async function () {
    let list = await service.listSchemas({ tenant: 'electronicsTenant' });
    assert.strictEqual(list.data.length, 1);
    assert.strictEqual(list.data[0].fields[0].placeholderValue, undefined);
    assert.deepStrictEqual(list.data[0].secretPersistence, {
        required: true, ready: true, reason: 'READY'
    });

    let effective = await service.getEffectiveConfiguration({
        tenant: 'electronicsTenant',
        schemaCode: 'telegramExternalIdentity'
    });
    assert.strictEqual(effective.data.status, 'CONFIGURED');
    assert.strictEqual(effective.data.values.botToken.configured, true);
    assert.strictEqual(effective.data.values.botToken.value.includes('test-runtime-secret'), false);
    assert.strictEqual(effective.data.values.botToken.value, '12****et');
    assert.deepStrictEqual(effective.data.secretPersistence, list.data[0].secretPersistence);

    let invalid = await service.validateUpdate({
        schemaCode: 'telegramExternalIdentity',
        httpRequest: {
            body: {
                values: {
                    botToken: '123456789:test-plain-secret'
                }
            }
        }
    });
    assert.strictEqual(invalid.data.valid, false);
    assert(invalid.data.errors.some(error => error.includes('Sensitive runtime configuration field')));

    let saved = await service.saveUpdate({
        tenant: 'electronicsTenant',
        schemaCode: 'telegramExternalIdentity',
        authData: { loginId: 'runtime-admin' },
        httpRequest: {
            body: {
                values: {
                    botToken: '987654321:test-updated-secret'
                }
            }
        }
    });
    assert.strictEqual(saved.code, 'SUC_SYS_00000');
    assert.strictEqual(saved.data.fields.botToken.value, '98****et');
    assert.strictEqual(saved.data.fields.botToken.encryptedValue, undefined);
    assert.strictEqual(savedRecords.length, 1);
    assert.notStrictEqual(savedRecords[0].fields.botToken.encryptedValue.value.includes('test-updated-secret'), true);
    assert.strictEqual(tenantPatches[0].tenant, 'electronicsTenant');
    assert.deepStrictEqual(tenantPatches[0].configuration.runtimeConfiguration.credentials['telegram.bot.circa'], {
        value: '987654321:test-updated-secret'
    });
    assert.strictEqual(publishedEvents[0].event, 'runtimeConfigurationChanged');
    assert.strictEqual(publishedEvents[0].data.schemaCode, 'telegramExternalIdentity');
    assert.strictEqual(Object.prototype.hasOwnProperty.call(publishedEvents[0].data, 'fields'), false);

    tenantPatches.length = 0;
    let reload = await service.reloadRuntimeConfigurationRecord({
        tenant: 'electronicsTenant',
        event: {
            data: {
                code: savedRecords[0].code
            }
        }
    });
    assert.strictEqual(reload, 'Runtime configuration reloaded: electronicsTenant:tenant:electronicsTenant:telegramExternalIdentity');
    assert.strictEqual(tenantPatches.length, 1);

    await assert.rejects(() => service.saveUpdate({
        tenant: 'electronicsTenant',
        schemaCode: 'telegramExternalIdentity',
        httpRequest: { body: { values: { botToken: 'not-a-telegram-token' } } }
    }), error => error.code === 'ERR_SYS_00002' && error.message.includes('pattern'));

    // A stale ready descriptor or caller-supplied readiness cannot authorize a secret write.
    const configuredKey = encryptionKey;
    const createRecord = service.createRuntimeConfigurationRecord;
    const counts = [savedRecords.length, tenantPatches.length, publishedEvents.length];
    encryptionKey = undefined;
    service.createRuntimeConfigurationRecord = function () {
        assert.fail('Missing-key validation must precede record construction and encryption');
    };
    try {
        const blocked = { required: true, ready: false, reason: 'ENCRYPTION_KEY_REQUIRED' };
        assert.deepStrictEqual((await service.listSchemas({})).data[0].secretPersistence, blocked);
        const descriptor = await service.getSchema({ schemaCode: 'telegramExternalIdentity' });
        assert.deepStrictEqual(descriptor.data.secretPersistence, blocked);
        const current = await service.getEffectiveConfiguration({ schemaCode: 'telegramExternalIdentity' });
        assert.strictEqual(current.data.status, 'CONFIGURED');
        assert.deepStrictEqual(current.data.secretPersistence, blocked);
        const request = {
            schemaCode: 'telegramExternalIdentity',
            httpRequest: {
                body: {
                    secretPersistence: { ready: true },
                    values: { botToken: '987654321:test-private-secret' }
                }
            }
        };
        const validation = await service.validateUpdate(request);
        assert.strictEqual(validation.code, 'ERR_SYS_00002');
        assert.deepStrictEqual(validation.data.secretPersistence, blocked);
        assert(validation.data.errors.some(error => error.includes('encryption key')));
        assert(validation.data.errors.some(error => error.includes('Sensitive runtime configuration field')));
        assert.strictEqual(JSON.stringify(validation).includes('test-private-secret'), false);
        assert.strictEqual(JSON.stringify(current).includes(configuredKey), false);
        await assert.rejects(
            () => service.saveUpdate(request),
            error => error.code === 'ERR_SYS_00002' && error.message.includes('encryption key')
        );
        assert.deepStrictEqual([savedRecords.length, tenantPatches.length, publishedEvents.length], counts);
    } finally {
        service.createRuntimeConfigurationRecord = createRecord;
    }

    const ordinaryRequest = {
        schemaCode: 'telegramExternalIdentity',
        httpRequest: { body: { values: { enabled: true } } }
    };
    const ordinary = await service.validateUpdate(ordinaryRequest);
    assert.strictEqual(ordinary.data.valid, true);
    assert.deepStrictEqual(ordinary.data.secretPersistence, {
        required: false, ready: true, reason: 'NOT_REQUIRED'
    });
    assert.strictEqual((await service.saveUpdate(ordinaryRequest)).data.fields.enabled.value, true);
    assert.deepStrictEqual(service.getSecretPersistenceReadiness({ fields: [] }), ordinary.data.secretPersistence);
    assert.strictEqual(service.validateValues(service.resolveSchema('telegramExternalIdentity'), { unknown: true }).valid, false);
    encryptionKey = configuredKey;
    assert.strictEqual(service.getSecretPersistenceReadiness(service.resolveSchema('telegramExternalIdentity')).ready, true);

    // Later layers retain one mergeable readiness owner; encryption remains independently guarded.
    const customized = Object.assign({}, service, {
        resolveEncryptionKey: function () { return undefined; }
    });
    const schema = service.resolveSchema('telegramExternalIdentity');
    assert.strictEqual(customized.describeSchema('telegramExternalIdentity', schema).secretPersistence.ready, false);
    assert.strictEqual(customized.validateValues(
        schema,
        { botToken: '987654321:test-private-secret' },
        { allowSensitivePlainValue: true }
    ).valid, false);
    assert.throws(() => customized.encryptSensitiveValue('test-private-secret'), error => error.code === 'ERR_SYS_00002');

    console.log('Runtime configuration schema service contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
