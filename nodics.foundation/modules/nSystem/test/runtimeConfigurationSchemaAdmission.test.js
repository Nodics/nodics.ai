/* @module nSystem/test/runtimeConfigurationSchemaAdmission @description Rejects orphan credential schema overrides before secret reads and preserves valid masked owner contracts. @layer test @owner nSystem */
const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const service = require('../src/service/config/defaultRuntimeConfigurationSchemaService');
let previous, properties, secretReads, storeReads, writes;
beforeEach(() => {
    previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES, NODICS: global.NODICS };
    properties = { runtimeConfigurationSchemas: {}, credentials: { 'synthetic.bot': { value: '123456:synthetic-test-only' } }, defaultTenant: 'tenant-a' };
    secretReads = 0; storeReads = 0; writes = 0;
    global.CONFIG = { get: key => { if (['credentials', 'secureConfiguration', 'runtimeConfiguration'].includes(key)) secretReads++; return properties[key]; } };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.SERVICE = { DefaultRuntimeConfigurationValueService: { get: async () => { storeReads++; return { result: [] }; }, save: async () => { writes++; return {}; } } };
    global.NODICS = { getActiveTenants: () => ['tenant-a'] };
});
afterEach(() => Object.assign(global, previous));
const field = () => ({ code: 'botToken', type: 'string', sensitive: true, required: true, credentialReference: 'synthetic.bot' });
const schema = () => ({ ownerModule: 'profile', fields: [field()] });
const refused = error => error.code === 'ERR_SYS_00002';
test('an orphan selector-only declaration cannot become a public schema or effective-value read', async () => {
    properties.runtimeConfigurationSchemas.identity = { fields: [{ credentialReference: 'synthetic.bot' }] };
    await assert.rejects(async () => service.listSchemas({ tenant: 'tenant-a' }), refused);
    await assert.rejects(async () => service.getEffectiveConfiguration({ schemaCode: 'identity' }), refused);
    assert.equal(secretReads, 0);
});
test('malformed field identities and types fail before any secret roots are read', async () => {
    for (const broken of [{ ...field(), code: undefined }, { ...field(), code: '__proto__' }, { ...field(), type: undefined }, { ...field(), type: 'executable' }, { ...field(), sensitive: 'true' }]) {
        properties.runtimeConfigurationSchemas.identity = { ownerModule: 'profile', fields: [broken] };
        await assert.rejects(async () => service.getEffectiveConfiguration({ schemaCode: 'identity' }), refused);
    }
    assert.equal(secretReads, 0);
});
test('duplicate fields, missing owner and missing target path never produce editable metadata', async () => {
    for (const broken of [{ fields: [field()] }, { ownerModule: 'profile', fields: [field(), field()] }, { ownerModule: 'profile', fields: [{ code: 'plain', type: 'string' }] }]) {
        properties.runtimeConfigurationSchemas.identity = broken;
        await assert.rejects(async () => service.getSchema({ schemaCode: 'identity' }), refused);
    }
    assert.equal(secretReads, 0);
});
test('credential selectors and credential paths require explicit sensitivity', async () => {
    for (const broken of [{ ...field(), sensitive: undefined }, { code: 'botToken', type: 'string', sensitive: false, path: ['credentials', 'synthetic.bot', 'value'] }]) {
        properties.runtimeConfigurationSchemas.identity = { ownerModule: 'profile', fields: [broken] };
        await assert.rejects(async () => service.getEffectiveConfiguration({ schemaCode: 'identity' }), refused);
        assert.throws(() => service.getSecretPersistenceReadiness({ fields: [broken] }), refused);
    }
    assert.equal(secretReads, 0);
});
test('valid owner sensitivity retains masking, key prerequisites and ordinary false/zero values', async () => {
    const good = schema(); good.fields.push({ code: 'limit', type: 'number', path: ['limits', 'maximum'] }, { code: 'enabled', type: 'boolean', path: ['feature', 'enabled'] });
    properties.runtimeConfigurationSchemas.identity = good;
    properties.runtimeConfiguration = { limits: { maximum: 0 }, feature: { enabled: false } };
    const described = await service.getSchema({ schemaCode: 'identity' });
    assert.deepEqual(described.data.secretPersistence, { required: true, ready: false, reason: 'ENCRYPTION_KEY_REQUIRED' });
    const result = await service.getEffectiveConfiguration({ schemaCode: 'identity' });
    assert.equal(result.data.values.botToken.sensitive, true);
    assert.notEqual(result.data.values.botToken.value, properties.credentials['synthetic.bot'].value);
    assert.equal(JSON.stringify(result).includes(properties.credentials['synthetic.bot'].value), false);
    assert.equal(result.data.values.limit.value, 0); assert.equal(result.data.values.enabled.value, false);
});
test('invalid declarations cannot reach record construction or persistence', async () => {
    properties.runtimeConfigurationSchemas.identity = { fields: [{ credentialReference: 'synthetic.bot' }] };
    await assert.rejects(service.saveUpdate({ tenant: 'tenant-a', schemaCode: 'identity', httpRequest: { body: { values: { botToken: 'synthetic-value' } } } }), refused);
    assert.equal(writes, 0); assert.equal(secretReads, 0);
});
test('startup refuses malformed owner declarations before persisted-value inspection', async () => {
    properties.runtimeConfigurationSchemas.identity = { fields: [{ credentialReference: 'synthetic.bot' }] };
    await assert.rejects(service.restorePersistedConfiguration(), refused);
    assert.equal(storeReads, 0); assert.equal(writes, 0); assert.equal(secretReads, 0);
});
