'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const capability = require('../src/service/defaultCopilotCapabilityService');
const moduleRegistry = require('../src/service/defaultCopilotModuleRegistryCapabilityService');

test('capabilities enforce permission and mutation boundaries', async () => {
    const tool = { code: 'customer.list', permission: 'customer.read', riskClass: 'SENSITIVE_READ', handler: async () => ['ok'] };
    await assert.rejects(capability.invoke(tool, {}, { permissions: [] }), /COPILOT_CAPABILITY_FORBIDDEN/);
    assert.deepEqual(await capability.invoke(tool, {}, { permissions: ['customer.read'] }), ['ok']);
    await assert.rejects(capability.invoke(Object.assign({}, tool, { mutates: true }), {}, { permissions: ['customer.read'] }), /COPILOT_MUTATION_REQUIRES_GOVERNED_EXECUTION/);
});

test('exports are bounded and neutralize spreadsheet formulas', () => {
    const csv = capability.renderExport([{ name: '=IMPORTXML("https://example.invalid")', count: 2 }], 'csv', { maximumRows: 10 });
    assert.match(csv.content, /"'=IMPORTXML/);
    const text = capability.renderExport([{ value: '+cmd' }], 'text', { maximumRows: 10 });
    assert.equal(text.content, "'+cmd");
    assert.throws(() => capability.renderExport([{}, {}], 'csv', { maximumRows: 1 }), /COPILOT_EXPORT_LIMIT_EXCEEDED/);
});

test('module registry capability uses authorized BackOffice state and fails before access when forbidden', async () => {
    const originalService = global.SERVICE;
    let invoked = false;
    global.SERVICE = { DefaultBackofficeRegistryService: { list: async () => {
        invoked = true;
        return { data: { modules: { profile: [{ state: 'UP' }], cms: [{ state: 'UP' }, { state: 'DEGRADED' }] } } };
    } } };
    try {
        await assert.rejects(moduleRegistry.invoke('framework.modules.count', { authData: { permissions: [] } }, {}), /COPILOT_CAPABILITY_FORBIDDEN/);
        assert.equal(invoked, false);
        const counted = await moduleRegistry.invoke('framework.modules.count', { authData: { permissions: ['backoffice.registry.view'] } }, {});
        assert.equal(counted.count, 2);
        const listed = await moduleRegistry.invoke('framework.modules.list', { authData: { permissions: ['backoffice.registry.view'] } }, {});
        assert.deepEqual(listed.modules[0], { moduleName: 'cms', activeInstances: 2, states: ['DEGRADED', 'UP'] });
    } finally {
        global.SERVICE = originalService;
    }
});
