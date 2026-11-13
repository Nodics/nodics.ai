/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module router/test/apiExposureOwnershipContract @description Proves explicit capability category ownership and broad exposure policy overrides without changing route authorization. @layer test @owner router */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const pipeline = require('../src/service/request/defaultRequestHandlerPipelineService');
const root = path.resolve(__dirname, '../../../..');
function visit(node, action) {
    if (!node || typeof node !== 'object') return;
    action(node);
    for (const item of Object.values(node))
        if (Array.isArray(item)) item.forEach((child) => visit(child, action));
        else if (item && typeof item === 'object') visit(item, action);
}
function routers(directory, result = []) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (['node_modules', '.git', 'generated', 'gen', 'dist', 'data', 'test', 'llm'].includes(entry.name))
            continue;
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) routers(file, result);
        else if (file.includes('/src/router/') && file.endsWith('.js')) result.push(file);
    }
    return result;
}
test('every authored literal API category is declared by the route capability', () => {
    const violations = [];
    let count = 0;
    for (const file of routers(root)) {
        const source = fs.readFileSync(file, 'utf8');
        const propertiesFile = path.join(file.split('/src/router/')[0], 'config/properties.js');
        const properties = fs.existsSync(propertiesFile) ? require(propertiesFile) : {};
        visit(acorn.parse(source, { ecmaVersion: 'latest' }), (node) => {
            if (node.type !== 'Property' || (node.key.name || node.key.value) !== 'apiExposure') return;
            const value =
                node.value.type === 'Literal'
                    ? node.value
                    : node.value.type === 'ObjectExpression'
                      ? node.value.properties.find((item) => (item.key.name || item.key.value) === 'category')
                            ?.value
                      : null;
            if (!value || typeof value.value !== 'string') return;
            count++;
            const policy = properties.apiExposure?.categories?.[value.value];
            if (!policy || typeof policy !== 'object' || Array.isArray(policy) || (Object.prototype.hasOwnProperty.call(policy, 'enabled') && typeof policy.enabled !== 'boolean') || (Object.prototype.hasOwnProperty.call(policy, 'inheritUnknown') && typeof policy.inheritUnknown !== 'boolean'))
                violations.push(path.relative(root, file) + ': ' + value.value);
        });
    }
    assert.ok(count > 100, 'inspect the actual route inventory');
    assert.deepEqual(violations, []);
});
test('unknown categories follow default exposure; explicit deployment and node overrides remain authoritative', (t) => {
    const original = global.CONFIG;
    t.after(() => { if (original === undefined) delete global.CONFIG; else global.CONFIG = original; });
    let exposure = {
        default: { enabled: true },
        categories: { sample: { enabled: true } },
    };
    global.CONFIG = { get: () => exposure };
    assert.equal(pipeline.isApiExposureEnabled('sample'), true);
    assert.equal(pipeline.isApiExposureEnabled('absent'), true);
    exposure.categories.sample.enabled = false;
    assert.equal(pipeline.isApiExposureEnabled('sample'), false);
    exposure.categories.sample.enabled = 'true';
    assert.equal(pipeline.isApiExposureEnabled('sample'), false);
    exposure.unknown = { enabled: false };
    assert.equal(pipeline.isApiExposureEnabled('absent'), false, 'explicit compatibility policy can still deny unknown categories');
    exposure = undefined;
    assert.equal(pipeline.isApiExposureEnabled('absent'), false);
});

test('owner declarations inherit actual router defaults without granting public access', (t) => {
    const original = global.CONFIG;
    t.after(() => { if (original === undefined) delete global.CONFIG; else global.CONFIG = original; });
    const defaults = require('../config/properties').apiExposure;
    const owner = require('../../nData/nImport/import/config/properties').apiExposure.categories;
    const exposure = { ...defaults, categories: { ...defaults.categories, ...owner } };
    global.CONFIG = { get: () => exposure };
    assert.ok(Object.hasOwn(owner, 'dataImport'), 'nImport declares its own category');
    assert.equal(pipeline.isApiExposureEnabled('dataImport'), true);
    exposure.categories.dataExport = require('../../nData/nExport/export/config/properties').apiExposure.categories.dataExport;
    assert.equal(pipeline.isApiExposureEnabled('dataExport'), false, 'an explicit owner denial wins over the broad default');
    const originalLodash = global._;
    global._ = require('lodash');
    t.after(() => { if (originalLodash === undefined) delete global._; else global._ = originalLodash; });
    assert.equal(pipeline.isPublicRequest({ apiExposure: { category: 'dataImport' } }), false);
    exposure.default = { enabled: false };
    assert.equal(pipeline.isApiExposureEnabled('dataImport'), false);
    exposure.categories.dataImport = { enabled: true };
    assert.equal(pipeline.isApiExposureEnabled('dataImport'), true);
    exposure.categories.dataImport = {};
    for (const value of [undefined, {}, { enabled: 'true' }, { enabled: null }]) {
        exposure.default = value;
        assert.equal(pipeline.isApiExposureEnabled('dataImport'), false);
        assert.equal(pipeline.isApiExposureEnabled('unregistered'), false);
    }
});


test('neutral internal declarations preserve unknown policy and explicit category overrides', (t) => {
    const previous = global.CONFIG;
    t.after(() => { if (previous === undefined) delete global.CONFIG; else global.CONFIG = previous; });
    const capabilityPaths = [
        'nodics.copilot/modules/copilotKnowledge',
        'nodics.discovery/modules/discoveryConfig',
        'nodics.discovery/modules/discoveryProjection',
        'nodics.discovery/modules/discoveryPublication',
    ];
    for (const capability of capabilityPaths) {
        const declaration = require(path.join(root, capability, 'config/properties')).apiExposure?.categories?.moduleInternal;
        assert.deepEqual(declaration, { inheritUnknown: true }, capability);
        const exposure = { default: { enabled: true }, categories: { moduleInternal: { ...declaration } } };
        global.CONFIG = { get: () => exposure };
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), true);
        exposure.unknown = { enabled: false };
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), false, 'registration never bypasses unknown-category denial');
        exposure.unknown.enabled = 'true';
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), false, 'nonboolean inherited authority fails closed');
        exposure.unknown.enabled = true;
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), true);
        exposure.categories.moduleInternal.enabled = false;
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), false, 'later category denial remains authoritative');
        exposure.unknown.enabled = false;
        exposure.categories.moduleInternal.enabled = true;
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), true, 'an explicit reviewed category override remains supported');
        exposure.categories.moduleInternal.enabled = undefined;
        assert.equal(pipeline.isApiExposureEnabled('moduleInternal'), false, 'invalid explicit enablement never falls through');
    }
});

test('neutral category inheritance validates metadata and preserves ordinary declared-category behavior', (t) => {
    const previous = global.CONFIG;
    t.after(() => { if (previous === undefined) delete global.CONFIG; else global.CONFIG = previous; });
    const exposure = { default: { enabled: true }, unknown: { enabled: false }, categories: { normal: {}, neutral: { inheritUnknown: true } } };
    global.CONFIG = { get: () => exposure };
    assert.equal(pipeline.isApiExposureEnabled('normal'), true, 'existing declared categories still inherit the common default');
    assert.equal(pipeline.isApiExposureEnabled('neutral'), false);
    for (const value of ['true', 1, null, {}]) {
        exposure.categories.neutral.inheritUnknown = value;
        assert.equal(pipeline.isApiExposureEnabled('neutral'), false, 'invalid inheritance declaration is denied');
    }
    exposure.categories.neutral.inheritUnknown = true;
    for (const defaultValue of [undefined, {}, { enabled: false }, { enabled: 'true' }]) {
        exposure.default = defaultValue;
        delete exposure.unknown;
        assert.equal(pipeline.isApiExposureEnabled('neutral'), false);
    }
});

test('malformed explicit category policies cannot fall through to enabled defaults', t => {
    const previous = global.CONFIG;
    t.after(() => { if (previous === undefined) delete global.CONFIG; else global.CONFIG = previous; });
    const exposure = { default: { enabled: true }, categories: { sample: {} } };
    global.CONFIG = { get: () => exposure };
    for (const invalid of [null, false, true, 0, 'enabled', []]) {
        exposure.categories.sample = invalid;
        assert.equal(pipeline.isApiExposureEnabled('sample'), false, 'invalid category is a denial, not an omitted default');
    }
});
